import * as THREE from 'three';

/**
 * Generates high-fidelity Earth textures in memory with zero external network dependencies.
 * Produces realistic continents styled in dark emerald/forest tones, deep navy oceans,
 * subtle latitude/longitude telemetry grids, and glowing urban night lights.
 */

// Simplified polygon paths for major world landmasses in equirectangular projection [lon (-180 to 180), lat (-90 to 90)]
const CONTINENTS: [number, number][][] = [
  // North America
  [
    [-168, 65], [-160, 71], [-130, 70], [-100, 70], [-80, 74], [-60, 60],
    [-55, 48], [-65, 44], [-75, 35], [-80, 25], [-85, 20], [-95, 18],
    [-105, 22], [-115, 30], [-124, 38], [-125, 49], [-135, 57], [-150, 60],
    [-165, 60], [-168, 65]
  ],
  // Greenland
  [
    [-45, 60], [-25, 65], [-20, 76], [-30, 83], [-55, 83], [-60, 75], [-45, 60]
  ],
  // South America
  [
    [-77, 8], [-60, 10], [-50, -2], [-35, -5], [-35, -12], [-42, -23],
    [-50, -32], [-65, -45], [-70, -54], [-75, -50], [-72, -35], [-76, -15],
    [-80, -2], [-77, 8]
  ],
  // Eurasia (Europe + Asia)
  [
    [-9, 36], [0, 44], [10, 45], [15, 55], [30, 60], [45, 68], [60, 70],
    [80, 73], [105, 77], [130, 74], [170, 66], [180, 65], [170, 60],
    [150, 50], [140, 40], [125, 32], [115, 22], [105, 10], [100, 5],
    [90, 22], [80, 10], [75, 15], [70, 25], [60, 25], [50, 28],
    [35, 32], [28, 41], [15, 38], [5, 36], [-9, 36]
  ],
  // Scandinavia
  [
    [5, 58], [15, 58], [25, 70], [15, 71], [5, 62], [5, 58]
  ],
  // British Isles
  [
    [-5, 50], [1, 52], [-2, 58], [-6, 58], [-5, 50]
  ],
  // Africa
  [
    [-17, 15], [-5, 36], [10, 37], [25, 32], [35, 30], [43, 12],
    [51, 12], [42, -2], [40, -15], [32, -28], [20, -35], [15, -30],
    [10, -5], [0, 5], [-15, 12], [-17, 15]
  ],
  // Madagascar
  [
    [44, -13], [50, -15], [47, -25], [43, -24], [44, -13]
  ],
  // India Subcontinent detailed peninsula
  [
    [68, 24], [73, 20], [77, 8], [80, 13], [85, 20], [89, 22], [80, 26], [68, 24]
  ],
  // Japan
  [
    [130, 32], [135, 35], [141, 43], [145, 44], [139, 36], [130, 32]
  ],
  // Southeast Asia & Indonesia islands
  [
    [96, 5], [105, -5], [115, -8], [125, -8], [118, 5], [105, 12], [96, 5]
  ],
  // Australia
  [
    [114, -22], [122, -15], [136, -12], [145, -15], [153, -28], [150, -37],
    [140, -38], [130, -32], [115, -34], [114, -22]
  ],
  // New Zealand
  [
    [168, -46], [175, -37], [178, -38], [172, -45], [168, -46]
  ],
  // Antarctica
  [
    [-180, -78], [-120, -75], [-60, -68], [0, -70], [60, -70], [120, -72],
    [180, -78], [180, -90], [-180, -90], [-180, -78]
  ]
];

// Urban lighting / E-waste cluster centers [lon, lat, radius, intensity]
const URBAN_LIGHTS: [number, number, number, number][] = [
  // North America
  [-74, 40.7, 18, 0.9], // NYC
  [-87.6, 41.8, 14, 0.8], // Chicago
  [-118.2, 34, 16, 0.85], // LA / Silicon Valley
  [-122.4, 37.7, 14, 0.9], // Bay Area
  // Europe
  [0, 51.5, 16, 0.9], // London
  [2.3, 48.8, 15, 0.85], // Paris
  [13.4, 52.5, 14, 0.8], // Berlin
  [8.5, 47.3, 12, 0.75], // Central EU
  // India
  [77.2, 28.6, 18, 0.95], // Delhi
  [72.8, 19.0, 17, 0.9], // Mumbai
  [77.6, 12.9, 16, 0.95], // Bengaluru (Tech hub)
  [80.2, 13.0, 14, 0.8], // Chennai
  [88.3, 22.5, 15, 0.85], // Kolkata
  // East Asia
  [121.4, 31.2, 20, 0.95], // Shanghai
  [116.4, 39.9, 19, 0.9], // Beijing
  [114.1, 22.3, 18, 0.95], // Shenzhen / HK
  [139.6, 35.6, 20, 0.95], // Tokyo
  [126.9, 37.5, 17, 0.9], // Seoul
  // Southeast Asia
  [103.8, 1.3, 14, 0.9], // Singapore
  // Africa
  [-0.2, 5.6, 12, 0.8], // Accra / West Africa hub
  [28.0, -26.2, 12, 0.75], // Johannesburg
  [31.2, 30.0, 14, 0.8], // Cairo
  // South America
  [-46.6, -23.5, 16, 0.8], // São Paulo
  [-58.3, -34.6, 14, 0.75], // Buenos Aires
];

export function createEarthTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // 1. Deep Ocean Base with smooth vertical gradient (dark navy to deep slate-cyan)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#020914');
  oceanGrad.addColorStop(0.3, '#031120');
  oceanGrad.addColorStop(0.5, '#041728');
  oceanGrad.addColorStop(0.7, '#031120');
  oceanGrad.addColorStop(1, '#020914');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Telemetry Grids (Subtle latitude & longitude lines across oceans)
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.06)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 12]);

  // Latitude lines every 30 degrees
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Longitude lines every 45 degrees
  for (let lon = -180; lon <= 180; lon += 45) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.setLineDash([]); // Reset line dash

  // Equator line (delicate accent)
  const equatorY = height / 2;
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, equatorY);
  ctx.lineTo(width, equatorY);
  ctx.stroke();

  // Helper function to map [lon, lat] to [x, y]
  const project = (lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // 3. Render Continents
  CONTINENTS.forEach((poly) => {
    if (poly.length < 3) return;

    ctx.save();

    // Continent Base Fill
    ctx.beginPath();
    const [startX, startY] = project(poly[0][0], poly[0][1]);
    ctx.moveTo(startX, startY);

    for (let i = 1; i < poly.length; i++) {
      const [px, py] = project(poly[i][0], poly[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Rich Dark Emerald / Forest Gradient
    const landGrad = ctx.createLinearGradient(0, 0, 0, height);
    landGrad.addColorStop(0, '#04281f');
    landGrad.addColorStop(0.5, '#064e3b');
    landGrad.addColorStop(1, '#04281f');
    ctx.fillStyle = landGrad;
    ctx.fill();

    // Glowing shoreline border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Inner coastal contour
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.restore();
  });

  // 4. Subtle Topographic noise & texture inside landmasses
  ctx.save();
  ctx.fillStyle = 'rgba(5, 150, 105, 0.15)';
  for (let i = 0; i < 600; i++) {
    const randLon = -180 + Math.random() * 360;
    const randLat = -70 + Math.random() * 140;
    const [x, y] = project(randLon, randLat);
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 5. Urban Night Lights / High-Tech E-Waste Processing Nodes
  URBAN_LIGHTS.forEach(([lon, lat, radius, intensity]) => {
    const [cx, cy] = project(lon, lat);

    // Glow aura
    const lightGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    lightGlow.addColorStop(0, `rgba(52, 211, 153, ${0.85 * intensity})`);
    lightGlow.addColorStop(0.3, `rgba(16, 185, 129, ${0.45 * intensity})`);
    lightGlow.addColorStop(0.7, `rgba(5, 150, 105, ${0.15 * intensity})`);
    lightGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = lightGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Core bright star dot
    ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * intensity})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Tiny surrounding sub-dots
    for (let s = 0; s < 4; s++) {
      const angle = (s * Math.PI) / 2 + Math.random() * 0.4;
      const dist = 3 + Math.random() * (radius * 0.5);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      ctx.fillStyle = `rgba(110, 231, 183, ${0.6 * intensity})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Creates a subtle atmospheric cloud / swirl layer
 */
export function createAtmosphereTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, width, height);

  // Wispy atmospheric bands
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * height;
    const x = Math.random() * width;
    const w = 150 + Math.random() * 300;
    const h = 20 + Math.random() * 60;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h));
    grad.addColorStop(0, 'rgba(52, 211, 153, 0.08)');
    grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.03)');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates custom atmosphere glow shader material
 */
export function createAtmosphereShader(): THREE.ShaderMaterial {
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    uniform vec3 glowColor;
    void main() {
      float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
      intensity = clamp(intensity, 0.0, 1.0);
      gl_FragColor = vec4(glowColor, intensity * 0.75);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0x10b981) },
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
}
