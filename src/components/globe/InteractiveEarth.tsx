import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  REGION_MARKERS, 
  TRADE_FLOW_ARCS, 
  RegionMarkerData, 
  GLOBAL_METRICS 
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
}

export const InteractiveEarth: React.FC<InteractiveEarthProps> = ({
  selectedRegionId,
  onSelectRegion,
  hoveredRegionId,
  onHoverRegion,
  isAutoRotate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebGlSupported, setIsWebGlSupported] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
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

  // Interaction tracking
  const pointerDownRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const rotVelocityXRef = useRef(0);
  const rotVelocityYRef = useRef(0);
  const cameraDistanceRef = useRef(3.3);
  const targetDistanceRef = useRef(3.3);

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

  // Handle prop updates for selectedRegionId
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
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

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    // Ambient light with cool emerald hue
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.4);
    scene.add(ambientLight);

    // Primary Key Light (Sun)
    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 2.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Subtle Emerald Rim Light
    const rimLight = new THREE.DirectionalLight(0x10b981, 1.8);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    // 5. Earth Master Group
    const earthGroup = new THREE.Group();
    // Default pleasant initial tilt (approx 18 degrees showing South Asia & Europe clearly)
    earthGroup.rotation.x = 0.22;
    earthGroup.rotation.y = -1.2;
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    const GLOBE_RADIUS = 1.25;

    // 6. Main Earth Sphere with Generated Canvas Texture
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthTexture = createEarthTexture();

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

    // 7. Atmospheric Cloud & Swirl Layer
    const cloudsTexture = createAtmosphereTexture();
    const cloudsGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 48, 48);
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

    // 8. Outer Atmospheric Halo (Fresnel Glow Rim)
    const haloGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.16, 48, 48);
    const haloMaterial = createAtmosphereShader();
    const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
    earthGroup.add(haloMesh);

    // 9. Equatorial & Latitude Orbit Rings (Subtle Technical Telemetry)
    const ringGeometry = new THREE.RingGeometry(GLOBE_RADIUS * 1.35, GLOBE_RADIUS * 1.353, 96);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const equatorRing = new THREE.Mesh(ringGeometry, ringMaterial);
    equatorRing.rotation.x = Math.PI / 2;
    earthGroup.add(equatorRing);

    // Secondary tilted telemetry ring
    const secondaryRing = new THREE.Mesh(
      new THREE.RingGeometry(GLOBE_RADIUS * 1.48, GLOBE_RADIUS * 1.482, 96),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    secondaryRing.rotation.x = Math.PI / 2.3;
    secondaryRing.rotation.y = 0.3;
    earthGroup.add(secondaryRing);

    // 10. Floating Particle Dust Field (Stars / Environmental micro-nodes)
    const particleCount = 200;
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

      // Mix between white-cyan and emerald particles
      const isEmerald = Math.random() > 0.4;
      colors[i * 3] = isEmerald ? 0.2 : 0.8;
      colors[i * 3 + 1] = isEmerald ? 0.9 : 0.9;
      colors[i * 3 + 2] = isEmerald ? 0.6 : 1.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // 11. Regional 3D Markers on the Globe
    const markersMap = new Map();

    REGION_MARKERS.forEach((region) => {
      const markerGroup = new THREE.Group();
      const pos = latLonToVector3(region.lat, region.lon, GLOBE_RADIUS);
      markerGroup.position.copy(pos);

      // Orient marker along surface normal
      markerGroup.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        pos.clone().normalize()
      );

      // Pin stalk (thin glass cylinder)
      const stalkGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.07, 8);
      stalkGeo.translate(0, 0.035, 0);
      const stalkMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.7,
      });
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      markerGroup.add(stalk);

      // Marker Head Sphere (clickable beacon)
      const headGeo = new THREE.SphereGeometry(0.024, 16, 16);
      headGeo.translate(0, 0.07, 0);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: new THREE.Color(0x34d399),
        emissiveIntensity: 1.2,
        roughness: 0.2,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.userData = { regionId: region.id };
      markerGroup.add(headMesh);

      // Pulsing Base Ring
      const pulseGeo = new THREE.RingGeometry(0.015, 0.045, 24);
      pulseGeo.rotateX(-Math.PI / 2);
      pulseGeo.translate(0, 0.005, 0);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
      markerGroup.add(pulseRing);

      earthGroup.add(markerGroup);
      markersMap.set(region.id, { group: markerGroup, mesh: headMesh, pulseRing });
    });
    markersRef.current = markersMap;

    // 12. 3D Trade Flow Arcs Connecting Key Hubs
    const photons: { curve: THREE.QuadraticBezierCurve3; photon: THREE.Mesh; speed: number; progress: number }[] = [];

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
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      earthGroup.add(arcLine);

      // Traveling Photon on Arc
      const photonGeo = new THREE.SphereGeometry(0.014, 8, 8);
      const photonMat = new THREE.MeshBasicMaterial({
        color: 0x6ee7b7,
        transparent: true,
        opacity: 0.9,
      });
      const photon = new THREE.Mesh(photonGeo, photonMat);
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

    const getRaycastIntersects = (event: MouseEvent | Touch) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const clickableMeshes: THREE.Mesh[] = [];
      markersRef.current.forEach((m) => clickableMeshes.push(m.mesh));
      return raycaster.intersectObjects(clickableMeshes);
    };

    // Mouse & Touch Drag Controls
    const onPointerDown = (clientX: number, clientY: number) => {
      pointerDownRef.current = true;
      lastPointerXRef.current = clientX;
      lastPointerYRef.current = clientY;
      setIsInteracting(true);
      isTargetingRef.current = false;
      targetQuaternionRef.current = null;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!pointerDownRef.current || !earthGroupRef.current) return;
      const deltaX = clientX - lastPointerXRef.current;
      const deltaY = clientY - lastPointerYRef.current;

      lastPointerXRef.current = clientX;
      lastPointerYRef.current = clientY;

      // Sensitivity factor
      const factor = 0.005;
      rotVelocityYRef.current = deltaX * factor;
      rotVelocityXRef.current = deltaY * factor;

      earthGroupRef.current.rotation.y += rotVelocityYRef.current;
      earthGroupRef.current.rotation.x += rotVelocityXRef.current;

      // Clamp vertical rotation so Earth doesn't flip upside down
      earthGroupRef.current.rotation.x = Math.max(-1.1, Math.min(1.1, earthGroupRef.current.rotation.x));
    };

    const onPointerUp = () => {
      pointerDownRef.current = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    // DOM Event Listeners
    const handleMouseDown = (e: MouseEvent) => {
      onPointerDown(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);

      // Marker hover detection
      const intersects = getRaycastIntersects(e);
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
          onHoverRegion(region);
          return;
        }
      }
      container.style.cursor = pointerDownRef.current ? 'grabbing' : 'grab';
      setActiveTooltip(null);
      onHoverRegion(null);
    };

    const handleMouseUp = (e: MouseEvent) => {
      onPointerUp();

      // Check if it was a quick click rather than a drag
      const intersects = getRaycastIntersects(e);
      if (intersects.length > 0) {
        const regionId = intersects[0].object.userData.regionId;
        const region = REGION_MARKERS.find((r) => r.id === regionId);
        if (region) {
          onSelectRegion(region);
        }
      }
    };

    // Touch Event Listeners for mobile/tablet
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
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const intersects = getRaycastIntersects(touch);
        if (intersects.length > 0) {
          const regionId = intersects[0].object.userData.regionId;
          const region = REGION_MARKERS.find((r) => r.id === regionId);
          if (region) {
            onSelectRegion(region);
          }
        }
      }
    };

    // Zoom on wheel (clamped)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.002;
      targetDistanceRef.current = Math.max(2.4, Math.min(4.8, targetDistanceRef.current + zoomDelta));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 14. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW > 0 && newH > 0 && rendererRef.current && cameraRef.current) {
        cameraRef.current.aspect = newW / newH;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    // 15. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

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
        // If focusing on a specific region, smoothly slerp rotation
        if (isTargetingRef.current && targetQuaternionRef.current) {
          earthGroupRef.current.quaternion.slerp(targetQuaternionRef.current, 0.05);
          // If close enough, resume gentle idle
          if (earthGroupRef.current.quaternion.angleTo(targetQuaternionRef.current) < 0.01) {
            isTargetingRef.current = false;
          }
        } else if (isAutoRotate && !pointerDownRef.current && !isInteracting) {
          // Slow pleasant idle spin
          earthGroupRef.current.rotation.y += 0.0012;
        } else if (!pointerDownRef.current) {
          // Inertia damping
          rotVelocityXRef.current *= 0.92;
          rotVelocityYRef.current *= 0.92;
          earthGroupRef.current.rotation.x += rotVelocityXRef.current;
          earthGroupRef.current.rotation.y += rotVelocityYRef.current;
          earthGroupRef.current.rotation.x = Math.max(-1.1, Math.min(1.1, earthGroupRef.current.rotation.x));
        }
      }

      // Rotate clouds slightly faster for realistic dynamic atmosphere
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0004;
      }

      // Marker animations (breathing pulse)
      markersRef.current.forEach(({ pulseRing }, id) => {
        const isHovered = hoveredRegionId === id;
        const isSelected = selectedRegionId === id;
        const scale = 1 + Math.sin(elapsedTime * 3 + (id.charCodeAt(0) % 5)) * 0.25;
        const finalScale = isHovered || isSelected ? scale * 1.5 : scale;
        pulseRing.scale.set(finalScale, finalScale, finalScale);
      });

      // Photons along trade flow arcs
      arcPhotonsRef.current.forEach((item) => {
        item.progress += item.speed;
        if (item.progress > 1) item.progress = 0;
        const point = item.curve.getPoint(item.progress);
        item.photon.position.copy(point);
      });

      // Ambient stars gentle shimmer
      starField.rotation.y = elapsedTime * 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [latLonToVector3, isAutoRotate, onSelectRegion, onHoverRegion, isInteracting, hoveredRegionId, selectedRegionId]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[520px] sm:h-[600px] md:h-[680px] lg:h-[720px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing overflow-hidden"
    >
      {/* Fallback if WebGL is unavailable */}
      {!isWebGlSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-white rounded-2xl">
          <p className="text-base font-bold text-emerald-400">WebGL Hardware Acceleration Needed</p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">
            Interactive 3D rendering is not supported on this browser context. Please view in a standard browser with hardware graphics enabled.
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
          className="absolute z-30 pointer-events-none transform -translate-y-full transition-all duration-150 animate-fade-in"
        >
          <div className="p-3 rounded-2xl glass-card bg-slate-950/90 border border-emerald-500/40 shadow-2xl backdrop-blur-md max-w-xs text-left space-y-1">
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
