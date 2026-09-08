import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { 
  REGION_MARKERS, 
  TRADE_FLOW_ARCS, 
  RegionMarkerData 
} from '../../lib/data/globeData';
import { 
  createEarthTexture, 
  createAtmosphereTexture, 
  createAtmosphereShader 
} from './textureGenerator';

interface InteractiveEarthProps {
  selectedRegionId: string | null;
  onSelectRegion: (region: RegionMarkerData | null) => void;
  hoveredRegionId: string | null;
  onHoverRegion: (region: RegionMarkerData | null) => void;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  resetTrigger?: number;
}

export const InteractiveEarth: React.FC<InteractiveEarthProps> = ({
  selectedRegionId,
  onSelectRegion,
  hoveredRegionId,
  onHoverRegion,
  isAutoRotate,
  resetTrigger = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebGlSupported, setIsWebGlSupported] = useState<boolean>(true);
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    region: RegionMarkerData;
  } | null>(null);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<Map<string, { group: THREE.Group; mesh: THREE.Mesh; pulseRing: THREE.Mesh }>>(new Map());
  const arcPhotonsRef = useRef<{ curve: THREE.QuadraticBezierCurve3; photon: THREE.Mesh; speed: number; progress: number }[]>([]);
  const targetQuaternionRef = useRef<THREE.Quaternion | null>(null);
  const isTargetingRef = useRef(false);

  // Synchronized prop refs to avoid re-triggering Three.js mount effect
  const isAutoRotateRef = useRef(isAutoRotate);
  isAutoRotateRef.current = isAutoRotate;

  const selectedRegionIdRef = useRef(selectedRegionId);
  selectedRegionIdRef.current = selectedRegionId;

  const hoveredRegionIdRef = useRef(hoveredRegionId);
  hoveredRegionIdRef.current = hoveredRegionId;

  const onSelectRegionRef = useRef(onSelectRegion);
  onSelectRegionRef.current = onSelectRegion;

  const onHoverRegionRef = useRef(onHoverRegion);
  onHoverRegionRef.current = onHoverRegion;

  // Interaction tracking
  const pointerDownRef = useRef(false);
  const isInteractingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const rotVelocityXRef = useRef(0);
  const rotVelocityYRef = useRef(0);
  const cameraDistanceRef = useRef(3.3);
  const targetDistanceRef = useRef(3.3);
  const lastHoveredIdRef = useRef<string | null>(null);
  const lastRaycastTimeRef = useRef(0);

  // Convert Lat/Lon to 3D Cartesian Vector on Globe Surface
  const latLonToVector3 = useCallback((lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Smoothly align Earth to face selected region
  const focusOnRegion = useCallback((region: RegionMarkerData) => {
    if (!earthGroupRef.current) return;
    const GLOBE_RADIUS = 1.25;
    const localPos = latLonToVector3(region.lat, region.lon, GLOBE_RADIUS).normalize();
    
    // We want localPos rotated by earthGroup to face +Z (towards the camera at 0, 0, Z)
    const targetDir = new THREE.Vector3(0, 0, 1);
    const qTarget = new THREE.Quaternion();
    qTarget.setFromUnitVectors(localPos, targetDir);

    targetQuaternionRef.current = qTarget;
    isTargetingRef.current = true;
    targetDistanceRef.current = 2.8; // gentle zoom in
  }, [latLonToVector3]);

  // Handle selectedRegionId updates without remounting scene
  useEffect(() => {
    if (selectedRegionId) {
      const region = REGION_MARKERS.find((r) => r.id === selectedRegionId);
      if (region) {
        focusOnRegion(region);
      }
    } else {
      isTargetingRef.current = false;
      targetQuaternionRef.current = null;
      targetDistanceRef.current = 3.3; // return to global view
    }
  }, [selectedRegionId, focusOnRegion]);

  // Handle reset trigger smoothly
  useEffect(() => {
    if (resetTrigger > 0 && earthGroupRef.current) {
      isTargetingRef.current = false;
      targetQuaternionRef.current = null;
      targetDistanceRef.current = 3.3;
      earthGroupRef.current.rotation.x = 0.22;
      earthGroupRef.current.rotation.y = -1.2;
      rotVelocityXRef.current = 0;
      rotVelocityYRef.current = 0;
    }
  }, [resetTrigger]);

  // Main Three.js Scene Setup (Mounts ONCE)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect mobile device
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl', { powerPreference: 'high-performance' }) || 
                 testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGlSupported(false);
        return;
      }
    } catch {
      setIsWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 650;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraDistanceRef.current);
    cameraRef.current = camera;

    // 3. Renderer Setup with Strict DPR Clamping
    // Desktop: Max 1.5 DPR (avoids GPU fill-rate exhaustion on 4K/Retina)
    // Mobile: Strict 1.0 DPR for max battery & 60 FPS fluidity
    const targetDpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile, // Disable MSAA on mobile for huge performance gain
      alpha: true,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(targetDpr);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting (Lightweight setup: 1 Ambient, 1 Sun Key, 1 Rim)
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 2.0);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 1.6);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    // 5. Earth Master Group
    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = 0.22;
    earthGroup.rotation.y = -1.2;
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    const GLOBE_RADIUS = 1.25;

    // 6. Main Earth Sphere with Cached Optimized Canvas Texture
    const earthSegments = isMobile ? 40 : 54;
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, earthSegments, earthSegments);
    const earthTexture = createEarthTexture(isMobile);

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.55,
      metalness: 0.1,
      bumpScale: 0.04,
      emissive: new THREE.Color(0x022c22),
      emissiveIntensity: 0.35,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // 7. Atmospheric Cloud Layer
    const cloudsTexture = createAtmosphereTexture();
    const cloudsGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, isMobile ? 28 : 36, isMobile ? 28 : 36);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earthGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 8. Outer Atmospheric Halo (Lightweight Fresnel Rim)
    const haloGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, isMobile ? 28 : 36, isMobile ? 28 : 36);
    const haloMaterial = createAtmosphereShader();
    const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
    earthGroup.add(haloMesh);

    // 9. Equatorial & Latitude Orbit Rings (Reduced segment count for max performance)
    const ringSegments = isMobile ? 36 : 54;
    const ringGeometry = new THREE.RingGeometry(GLOBE_RADIUS * 1.35, GLOBE_RADIUS * 1.353, ringSegments);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const equatorRing = new THREE.Mesh(ringGeometry, ringMaterial);
    equatorRing.rotation.x = Math.PI / 2;
    earthGroup.add(equatorRing);

    const secondaryRingGeometry = new THREE.RingGeometry(GLOBE_RADIUS * 1.48, GLOBE_RADIUS * 1.482, ringSegments);
    const secondaryRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const secondaryRing = new THREE.Mesh(secondaryRingGeometry, secondaryRingMaterial);
    secondaryRing.rotation.x = Math.PI / 2.3;
    secondaryRing.rotation.y = 0.3;
    earthGroup.add(secondaryRing);

    // 10. Starfield Dust Field (Optimized particle count)
    const particleCount = isMobile ? 60 : 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const pRadius = 2.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = pRadius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = pRadius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = pRadius * Math.cos(phi);

      const isEmerald = Math.random() > 0.4;
      colors[i * 3] = isEmerald ? 0.2 : 0.8;
      colors[i * 3 + 1] = isEmerald ? 0.9 : 0.9;
      colors[i * 3 + 2] = isEmerald ? 0.6 : 1.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.03 : 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // 11. Regional 3D Markers on the Globe (Reuse shared geometries)
    const markersMap = new Map();
    const sharedStalkGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.07, 6);
    sharedStalkGeo.translate(0, 0.035, 0);

    const sharedStalkMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.7,
    });

    const sharedHeadGeo = new THREE.SphereGeometry(0.024, 12, 12);
    sharedHeadGeo.translate(0, 0.07, 0);

    const sharedPulseGeo = new THREE.RingGeometry(0.015, 0.045, 18);
    sharedPulseGeo.rotateX(-Math.PI / 2);
    sharedPulseGeo.translate(0, 0.005, 0);

    const sharedPulseMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    REGION_MARKERS.forEach((region) => {
      const markerGroup = new THREE.Group();
      const pos = latLonToVector3(region.lat, region.lon, GLOBE_RADIUS);
      markerGroup.position.copy(pos);

      markerGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        pos.clone().normalize()
      );

      const stalk = new THREE.Mesh(sharedStalkGeo, sharedStalkMat);
      markerGroup.add(stalk);

      const headMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: new THREE.Color(0x34d399),
        emissiveIntensity: 1.1,
        roughness: 0.2,
      });
      const headMesh = new THREE.Mesh(sharedHeadGeo, headMat);
      headMesh.userData = { regionId: region.id };
      markerGroup.add(headMesh);

      const pulseRing = new THREE.Mesh(sharedPulseGeo, sharedPulseMat.clone());
      markerGroup.add(pulseRing);

      earthGroup.add(markerGroup);
      markersMap.set(region.id, { group: markerGroup, mesh: headMesh, pulseRing });
    });
    markersRef.current = markersMap;

    // 12. 3D Trade Flow Arcs Connecting Key Hubs (Shared photon geometry)
    const photons: { curve: THREE.QuadraticBezierCurve3; photon: THREE.Mesh; speed: number; progress: number }[] = [];
    const sharedPhotonGeo = new THREE.SphereGeometry(0.014, 6, 6);
    const sharedPhotonMat = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.9,
    });

    TRADE_FLOW_ARCS.forEach((arc) => {
      const fromRegion = REGION_MARKERS.find((r) => r.id === arc.fromId);
      const toRegion = REGION_MARKERS.find((r) => r.id === arc.toId);
      if (!fromRegion || !toRegion) return;

      const p1 = latLonToVector3(fromRegion.lat, fromRegion.lon, GLOBE_RADIUS);
      const p2 = latLonToVector3(toRegion.lat, toRegion.lon, GLOBE_RADIUS);

      const dist = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const arcHeight = GLOBE_RADIUS + dist * 0.32;
      mid.normalize().multiplyScalar(arcHeight);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const arcPoints = curve.getPoints(isMobile ? 24 : 36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);

      const arcMat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      earthGroup.add(arcLine);

      const photon = new THREE.Mesh(sharedPhotonGeo, sharedPhotonMat);
      earthGroup.add(photon);

      photons.push({
        curve,
        photon,
        speed: 0.003 + Math.random() * 0.003,
        progress: Math.random(),
      });
    });
    arcPhotonsRef.current = photons;

    // 13. Raycasting for hover & click interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getRaycastIntersects = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const clickableMeshes: THREE.Mesh[] = [];
      markersRef.current.forEach((m) => clickableMeshes.push(m.mesh));
      return raycaster.intersectObjects(clickableMeshes);
    };

    // Pointer Drag Controls
    let clickStartX = 0;
    let clickStartY = 0;
    let hasDragged = false;

    const onPointerDown = (clientX: number, clientY: number) => {
      pointerDownRef.current = true;
      isInteractingRef.current = true;
      hasDragged = false;
      clickStartX = clientX;
      clickStartY = clientY;
      lastPointerXRef.current = clientX;
      lastPointerYRef.current = clientY;
      isTargetingRef.current = false;
      targetQuaternionRef.current = null;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!pointerDownRef.current || !earthGroupRef.current) return;
      const deltaX = clientX - lastPointerXRef.current;
      const deltaY = clientY - lastPointerYRef.current;

      if (Math.abs(clientX - clickStartX) > 4 || Math.abs(clientY - clickStartY) > 4) {
        hasDragged = true;
      }

      lastPointerXRef.current = clientX;
      lastPointerYRef.current = clientY;

      // Sensitivity factor
      const factor = isMobile ? 0.006 : 0.0045;
      rotVelocityYRef.current = deltaX * factor;
      rotVelocityXRef.current = deltaY * factor;

      earthGroupRef.current.rotation.y += rotVelocityYRef.current;
      earthGroupRef.current.rotation.x += rotVelocityXRef.current;

      // Clamp vertical rotation so Earth does not flip upside down
      earthGroupRef.current.rotation.x = Math.max(-1.1, Math.min(1.1, earthGroupRef.current.rotation.x));
    };

    const onPointerUp = () => {
      pointerDownRef.current = false;
      // Allow slight cooldown before resuming auto-rotation smoothly
      setTimeout(() => {
        if (!pointerDownRef.current) {
          isInteractingRef.current = false;
        }
      }, 700);
    };

    // DOM Mouse Handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left-click
      onPointerDown(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (pointerDownRef.current) {
        onPointerMove(e.clientX, e.clientY);
        return;
      }

      // Throttle raycasting to prevent frame drops on rapid mouse moves
      const now = performance.now();
      if (now - lastRaycastTimeRef.current < 40) return;
      lastRaycastTimeRef.current = now;

      const intersects = getRaycastIntersects(e.clientX, e.clientY);
      if (intersects.length > 0) {
        const regionId = intersects[0].object.userData.regionId;
        const region = REGION_MARKERS.find((r) => r.id === regionId);
        if (region) {
          container.style.cursor = 'pointer';
          const rect = container.getBoundingClientRect();
          setActiveTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            region,
          });
          if (lastHoveredIdRef.current !== region.id) {
            lastHoveredIdRef.current = region.id;
            onHoverRegionRef.current(region);
          }
          return;
        }
      }

      container.style.cursor = 'grab';
      if (lastHoveredIdRef.current !== null) {
        lastHoveredIdRef.current = null;
        setActiveTooltip(null);
        onHoverRegionRef.current(null);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      onPointerUp();

      // Only select region if it was a distinct click, not an active drag
      if (!hasDragged) {
        const intersects = getRaycastIntersects(e.clientX, e.clientY);
        if (intersects.length > 0) {
          const regionId = intersects[0].object.userData.regionId;
          const region = REGION_MARKERS.find((r) => r.id === regionId);
          if (region) {
            onSelectRegionRef.current(region);
          }
        }
      }
    };

    // Touch Event Listeners for mobile / tablet
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      onPointerUp();
      if (!hasDragged && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const intersects = getRaycastIntersects(touch.clientX, touch.clientY);
        if (intersects.length > 0) {
          const regionId = intersects[0].object.userData.regionId;
          const region = REGION_MARKERS.find((r) => r.id === regionId);
          if (region) {
            onSelectRegionRef.current(region);
          }
        }
      }
    };

    // Zoom on wheel (clamped)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.0018;
      targetDistanceRef.current = Math.max(2.4, Math.min(4.8, targetDistanceRef.current + zoomDelta));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 14. Responsive Resize Observer (Efficient debounced size sync)
    let resizeTimer: number;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const { width: newW, height: newH } = entries[0].contentRect;
        if (newW > 0 && newH > 0 && rendererRef.current && cameraRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }, 50);
    });
    resizeObserver.observe(container);

    // 15. Render Loop (Zero React State Mutations)
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera distance smoothing
      cameraDistanceRef.current += (targetDistanceRef.current - cameraDistanceRef.current) * 0.08;
      if (cameraRef.current) {
        cameraRef.current.position.z = cameraDistanceRef.current;
      }

      // Earth rotation
      if (earthGroupRef.current) {
        // Region targeting alignment
        if (isTargetingRef.current && targetQuaternionRef.current) {
          earthGroupRef.current.quaternion.slerp(targetQuaternionRef.current, 0.055);
          if (earthGroupRef.current.quaternion.angleTo(targetQuaternionRef.current) < 0.008) {
            isTargetingRef.current = false;
          }
        } else if (isAutoRotateRef.current && !pointerDownRef.current && !isInteractingRef.current) {
          // Slow pleasant idle spin
          earthGroupRef.current.rotation.y += 0.0011;
        } else if (!pointerDownRef.current) {
          // Inertia damping
          rotVelocityXRef.current *= 0.92;
          rotVelocityYRef.current *= 0.92;
          earthGroupRef.current.rotation.x += rotVelocityXRef.current;
          earthGroupRef.current.rotation.y += rotVelocityYRef.current;
          earthGroupRef.current.rotation.x = Math.max(-1.1, Math.min(1.1, earthGroupRef.current.rotation.x));
        }
      }

      // Atmospheric cloud rotation
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0003;
      }

      // Marker pulse animation using local ref readings
      const currentHovered = hoveredRegionIdRef.current;
      const currentSelected = selectedRegionIdRef.current;

      markersRef.current.forEach(({ pulseRing }, id) => {
        const isHovered = currentHovered === id;
        const isSelected = currentSelected === id;
        const scale = 1 + Math.sin(elapsedTime * 3 + (id.charCodeAt(0) % 5)) * 0.22;
        const finalScale = isHovered || isSelected ? scale * 1.5 : scale;
        pulseRing.scale.set(finalScale, finalScale, finalScale);
      });

      // Trade flow arc photons
      arcPhotonsRef.current.forEach((item) => {
        item.progress += item.speed;
        if (item.progress > 1) item.progress = 0;
        const point = item.curve.getPoint(item.progress);
        item.photon.position.copy(point);
      });

      // Starfield subtle rotation
      starField.rotation.y = elapsedTime * 0.00015;

      renderer.render(scene, camera);
    };

    animate();

    // 16. Thorough Resource Disposal & Event Teardown
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();

      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);

      // Dispose Geometries
      earthGeometry.dispose();
      cloudsGeometry.dispose();
      haloGeometry.dispose();
      ringGeometry.dispose();
      secondaryRingGeometry.dispose();
      particleGeo.dispose();
      sharedStalkGeo.dispose();
      sharedHeadGeo.dispose();
      sharedPulseGeo.dispose();
      sharedPhotonGeo.dispose();

      // Dispose Materials
      earthMaterial.dispose();
      cloudsMaterial.dispose();
      haloMaterial.dispose();
      ringMaterial.dispose();
      secondaryRingMaterial.dispose();
      particleMat.dispose();
      sharedStalkMat.dispose();
      sharedPulseMat.dispose();
      sharedPhotonMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [latLonToVector3]); // Empty dependency list: ONLY mounts once

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[520px] sm:h-[600px] md:h-[680px] lg:h-[720px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing overflow-hidden"
    >
      {/* Fallback if WebGL is unavailable on low-spec hardware */}
      {!isWebGlSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-white rounded-3xl border border-slate-800">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-950 via-emerald-800 to-teal-500 shadow-2xl flex items-center justify-center relative mb-4 border border-emerald-400/40">
            <div className="w-20 h-20 rounded-full border border-emerald-300/30 animate-spin" />
            <span className="text-xl font-black text-emerald-300 font-mono">3D</span>
          </div>
          <p className="text-base font-bold text-emerald-400">High-Fidelity 2D Earth Telemetry Fallback</p>
          <p className="text-xs text-slate-400 mt-2 max-w-md">
            WebGL acceleration is inactive in this browser session. Planetary monitoring data and regional e-waste flows remain accessible via the telemetry controls below.
          </p>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {activeTooltip && (
        <div
          style={{
            left: `${activeTooltip.x + 16}px`,
            top: `${activeTooltip.y - 12}px`,
          }}
          className="absolute z-30 pointer-events-none transform -translate-y-full transition-all duration-150"
        >
          <div className="p-3 rounded-2xl glass-card bg-slate-950/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md max-w-xs text-left space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider font-mono">
                {activeTooltip.region.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {activeTooltip.region.annualGeneration}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-white leading-tight">
              {activeTooltip.region.headline}
            </p>
            <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
              {activeTooltip.region.description}
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[9px] text-emerald-400/80 font-mono">
              <span>Click to inspect regional stewardship</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

