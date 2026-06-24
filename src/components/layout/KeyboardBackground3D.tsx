'use client';

import React, { useRef, useEffect } from 'react';

interface KeyConfig {
  label: string;
  w: number; // width in mm/units
  color?: string; // custom keycap color override
  isSpace?: boolean;
}

interface RowConfig {
  zOffset: number; // Row Z position (depth from center)
  keys: KeyConfig[];
}

interface FloatingKeycap {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  pitch: number;
  roll: number;
  vYaw: number;
  vPitch: number;
  vRoll: number;
  label: string;
  color: string;
  size: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

export const KeyboardBackground3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse coordinates for parallax tilt
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -0.5 to 0.5
      mouseRef.current.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Keyboard 3D layout settings
    const KEY_H = 8; // height of keycap
    const GAP = 2;   // gap between keycaps

    const rows: RowConfig[] = [
      // row 0: Esc + F1-F12 + Del
      { zOffset: -45, keys: [
        { label: 'ESC', w: 18, color: '#f97316' }, // Premium Orange
        { label: 'F1', w: 15 }, { label: 'F2', w: 15 }, { label: 'F3', w: 15 }, { label: 'F4', w: 15 },
        { label: 'F5', w: 15 }, { label: 'F6', w: 15 }, { label: 'F7', w: 15 }, { label: 'F8', w: 15 },
        { label: 'F9', w: 15 }, { label: 'F10', w: 15 }, { label: 'F11', w: 15 }, { label: 'F12', w: 15 },
        { label: 'DEL', w: 18 }
      ]},
      // row 1: Num row
      { zOffset: -27, keys: [
        { label: '`', w: 15 }, { label: '1', w: 15 }, { label: '2', w: 15 }, { label: '3', w: 15 }, { label: '4', w: 15 },
        { label: '5', w: 15 }, { label: '6', w: 15 }, { label: '7', w: 15 }, { label: '8', w: 15 }, { label: '9', w: 15 },
        { label: '0', w: 15 }, { label: '-', w: 15 }, { label: '=', w: 15 }, { label: 'BSP', w: 25 }
      ]},
      // row 2: Tab QWERTY
      { zOffset: -9, keys: [
        { label: 'TAB', w: 20 }, { label: 'Q', w: 15 }, { label: 'W', w: 15 }, { label: 'E', w: 15 }, { label: 'R', w: 15 },
        { label: 'T', w: 15 }, { label: 'Y', w: 15 }, { label: 'U', w: 15 }, { label: 'I', w: 15 }, { label: 'O', w: 15 },
        { label: 'P', w: 15 }, { label: '[', w: 15 }, { label: ']', w: 15 }, { label: '\\', w: 18 }
      ]},
      // row 3: Caps ASDF
      { zOffset: 9, keys: [
        { label: 'CAPS', w: 24 }, { label: 'A', w: 15 }, { label: 'S', w: 15 }, { label: 'D', w: 15 }, { label: 'F', w: 15 },
        { label: 'G', w: 15 }, { label: 'H', w: 15 }, { label: 'J', w: 15 }, { label: 'K', w: 15 }, { label: 'L', w: 15 },
        { label: ';', w: 15 }, { label: "'", w: 15 }, { label: 'ENTER', w: 28, color: '#f97316' }
      ]},
      // row 4: Shift ZXCV
      { zOffset: 27, keys: [
        { label: 'SHIFT', w: 32 }, { label: 'Z', w: 15 }, { label: 'X', w: 15 }, { label: 'C', w: 15 }, { label: 'V', w: 15 },
        { label: 'B', w: 15 }, { label: 'N', w: 15 }, { label: 'M', w: 15 }, { label: ',', w: 15 }, { label: '.', w: 15 },
        { label: '/', w: 15 }, { label: 'SHIFT', w: 30 }
      ]},
      // row 5: Bottom row
      { zOffset: 45, keys: [
        { label: 'CTRL', w: 18 }, { label: 'WIN', w: 16 }, { label: 'ALT', w: 16 },
        { label: ' ', w: 96, color: '#f97316', isSpace: true }, // Spacebar
        { label: 'ALT', w: 16 }, { label: 'FN', w: 16 }, { label: 'CTRL', w: 18 }
      ]}
    ];

    // Pre-calculate physical key layouts
    interface KeyInstance {
      label: string;
      localX: number;
      localZ: number;
      w: number;
      d: number;
      color: string;
      pressY: number; // Current Y offset due to pressing (0 = unpressed, 3 = fully pressed)
      targetPressY: number;
      lastPressTime: number;
      glowIntensity: number; // 0 to 1
      isSpace?: boolean;
    }

    const keyInstances: KeyInstance[] = [];

    rows.forEach(row => {
      // Find row width
      const totalWidth = row.keys.reduce((sum, key) => sum + key.w, 0) + (row.keys.length - 1) * GAP;
      let startX = -totalWidth / 2;

      row.keys.forEach(key => {
        const kColor = key.color || '#262626'; // Charcoal body
        keyInstances.push({
          label: key.label,
          localX: startX + key.w / 2,
          localZ: row.zOffset,
          w: key.w,
          d: 15, // standard keycap depth
          color: kColor,
          pressY: 0,
          targetPressY: 0,
          lastPressTime: 0,
          glowIntensity: 0.1, // subtle background glow
          isSpace: key.isSpace
        });
        startX += key.w + GAP;
      });
    });

    // Keyboard Base Dimensions
    const BASE_W = 270;
    const BASE_D = 110;
    const BASE_H = 10;

    // Floating drift keycaps
    const floatingKeycaps: FloatingKeycap[] = [];
    const driftLetters = ['ESC', 'A', 'S', 'D', 'F', 'SPACE', 'ENTER', 'TAB', 'W', 'Z'];
    const driftColors = ['#f97316', '#262626', '#171717', '#f97316', '#262626'];

    for (let i = 0; i < 7; i++) {
      floatingKeycaps.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 500,
        z: Math.random() * 400 - 150, // Depth
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1, // drift slightly up
        vz: (Math.random() - 0.5) * 0.2,
        yaw: Math.random() * Math.PI * 2,
        pitch: Math.random() * Math.PI * 2,
        roll: Math.random() * Math.PI * 2,
        vYaw: (Math.random() - 0.5) * 0.005,
        vPitch: (Math.random() - 0.5) * 0.005,
        vRoll: (Math.random() - 0.5) * 0.005,
        label: driftLetters[i % driftLetters.length],
        color: driftColors[i % driftColors.length],
        size: 16 + Math.random() * 8
      });
    }

    // Glowing particle dust
    const particles: Particle[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1000,
        y: Math.random() * 600 - 300,
        z: Math.random() * 500 - 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.3, // flow up
        vz: (Math.random() - 0.5) * 0.3,
        size: 1.5 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.6,
        maxLife: 200 + Math.random() * 300,
        life: Math.random() * 200
      });
    }

    // Interactive keypress simulation: trigger random key taps periodically
    let lastKeypressTime = 0;
    const triggerRandomKeypress = (now: number) => {
      if (now - lastKeypressTime > 300 + Math.random() * 400) {
        lastKeypressTime = now;
        const randomIndex = Math.floor(Math.random() * keyInstances.length);
        const key = keyInstances[randomIndex];
        key.targetPressY = 4; // press down
        key.glowIntensity = 1.0; // ignite backlight glow
        
        // Trigger ripple glow outward from key
        keyInstances.forEach(otherKey => {
          if (otherKey === key) return;
          const dx = otherKey.localX - key.localX;
          const dz = otherKey.localZ - key.localZ;
          const dist = Math.sqrt(dx*dx + dz*dz);
          if (dist < 60) {
            setTimeout(() => {
              otherKey.glowIntensity = Math.min(1.0, otherKey.glowIntensity + (1.0 - dist / 60) * 0.7);
            }, dist * 3);
          }
        });
      }
    };

    // World projection equations
    const FOCAL = 360;
    const CAMERA_DISTANCE = 480;

    let time = 0;

    // Loop
    const drawFrame = (now: number) => {
      time += 0.005;
      triggerRandomKeypress(now);

      // Interpolate mouse coordinates for smooth laggy parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Dark background
      ctx.fillStyle = '#070a13';
      ctx.fillRect(0, 0, width, height);

      // Create rich background charcoal gradient
      const bgGrad = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, Math.max(width, height));
      bgGrad.addColorStop(0, '#0f121e');
      bgGrad.addColorStop(0.5, '#070a13');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Update & Draw Particles (drawn behind or in front? Let's sort particles in depth list)
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.life++;
        if (p.life > p.maxLife || p.y < -height/2 - 100) {
          p.x = (Math.random() - 0.5) * 1000;
          p.y = height/2 + 50;
          p.z = Math.random() * 500 - 200;
          p.life = 0;
        }
      });

      // Update floating keycaps
      floatingKeycaps.forEach(k => {
        k.x += k.vx;
        k.y += k.vy;
        k.z += k.vz;
        k.yaw += k.vYaw;
        k.pitch += k.vPitch;
        k.roll += k.vRoll;

        // Reset if drifted too far
        if (k.y < -height/2 - 150) {
          k.y = height/2 + 150;
          k.x = (Math.random() - 0.5) * 800;
        }
      });

      // Update key instances physical elasticity
      keyInstances.forEach(key => {
        // bounce back up
        if (key.pressY < key.targetPressY) {
          key.pressY += 0.8;
        } else if (key.pressY > key.targetPressY) {
          key.pressY -= 0.15;
        }
        if (key.pressY >= 4) {
          key.targetPressY = 0; // return
        }

        // fade glow
        key.glowIntensity *= 0.94;
        if (key.glowIntensity < 0.1) key.glowIntensity = 0.1;
      });

      // Global camera rotation
      // slowly rotating + mouse parallax
      const yaw = Math.sin(time * 0.3) * 0.15 + mouseRef.current.x * 0.4;
      const pitch = 0.5 + Math.sin(time * 0.15) * 0.05 + mouseRef.current.y * 0.3;
      const roll = -0.05 + Math.cos(time * 0.2) * 0.02;

      // Translation float offsets
      const floatY = Math.sin(time * 1.5) * 8 - 10;

      // Setup 3D rotation math helper
      const rotate3D = (x: number, y: number, z: number, rYaw: number, rPitch: number, rRoll: number) => {
        // Rotate Z (roll)
        let x1 = x * Math.cos(rRoll) - y * Math.sin(rRoll);
        let y1 = x * Math.sin(rRoll) + y * Math.cos(rRoll);
        let z1 = z;

        // Rotate X (pitch)
        let x2 = x1;
        let y2 = y1 * Math.cos(rPitch) - z1 * Math.sin(rPitch);
        let z2 = y1 * Math.sin(rPitch) + z1 * Math.cos(rPitch);

        // Rotate Y (yaw)
        let x3 = x2 * Math.cos(rYaw) - z2 * Math.sin(rYaw);
        let y3 = y2;
        let z3 = x2 * Math.sin(rYaw) + z2 * Math.cos(rYaw);

        return { x: x3, y: y3, z: z3 };
      };

      // Collection of all renderable 3D polygons (faces) for depth sorting
      interface Poly3D {
        type: 'base' | 'key' | 'floating_key' | 'particle';
        avgZ: number;
        // vertices in screen space
        screenPoints: { x: number; y: number }[];
        // fill styling
        color: string;
        specular?: number;
        glowIntensity?: number;
        glowColor?: string;
        label?: string;
        topCenter?: { x: number; y: number; z: number };
        blur?: number;
      }

      const polygons: Poly3D[] = [];

      // A helper to push a box to the polygon pool
      const pushBoxToPolys = (
        cx: number, cy: number, cz: number,
        w: number, h: number, d: number,
        isKey: boolean,
        color: string,
        glowIntensity: number = 0,
        label?: string,
        kYaw = yaw, kPitch = pitch, kRoll = roll,
        kCenterX = 0, kCenterY = floatY, kCenterZ = 0,
        isFloating = false,
        blurVal = 0
      ) => {
        // Truncated keycap vs clean box
        const topScale = isKey ? 0.72 : 1.0;
        
        // Vertices relative to block center
        const localVertices = [
          { x: -w * topScale / 2, y: -h / 2, z: -d * topScale / 2 }, // 0 Top-Back-Left
          { x:  w * topScale / 2, y: -h / 2, z: -d * topScale / 2 }, // 1 Top-Back-Right
          { x:  w * topScale / 2, y: -h / 2, z:  d * topScale / 2 }, // 2 Top-Front-Right
          { x: -w * topScale / 2, y: -h / 2, z:  d * topScale / 2 }, // 3 Top-Front-Left
          { x: -w / 2,            y:  h / 2, z: -d / 2 },            // 4 Bottom-Back-Left
          { x:  w / 2,            y:  h / 2, z: -d / 2 },            // 5 Bottom-Back-Right
          { x:  w / 2,            y:  h / 2, z:  d / 2 },            // 6 Bottom-Front-Right
          { x: -w / 2,            y:  h / 2, z:  d / 2 }             // 7 Bottom-Front-Left
        ];

        // Light direction (cinematic orange rim lighting + white main key reflection)
        const lightDir = { x: 0.6, y: -1.2, z: 0.7 };
        const len = Math.sqrt(lightDir.x*lightDir.x + lightDir.y*lightDir.y + lightDir.z*lightDir.z);
        lightDir.x /= len; lightDir.y /= len; lightDir.z /= len;

        // Rotate & project vertices
        const rotatedVertices = localVertices.map(v => {
          // 1. Rotate locally (for floating keycaps) or globally
          let rot = rotate3D(v.x, v.y, v.z, isFloating ? kYaw : 0, isFloating ? kPitch : 0, isFloating ? kRoll : 0);
          
          // 2. Translate by block offset relative to keyboard base
          let worldX = rot.x + cx;
          let worldY = rot.y + cy;
          let worldZ = rot.z + cz;

          // 3. Apply global keyboard rotation & float translation if not floating cap
          if (!isFloating) {
            rot = rotate3D(worldX, worldY, worldZ, kYaw, kPitch, kRoll);
            worldX = rot.x + kCenterX;
            worldY = rot.y + kCenterY;
            worldZ = rot.z + kCenterZ;
          }

          // 4. Translate by camera distance
          worldZ += CAMERA_DISTANCE;

          // 5. Projection
          const scale = FOCAL / worldZ;
          const sx = width / 2 + worldX * scale;
          const sy = height / 2 + worldY * scale;

          return { x: sx, y: sy, z: worldZ };
        });

        // Face definitions (indices of vertices)
        // Order vertices clockwise to compute correct normal orientation
        const faceDefinitions = [
          { name: 'top', indices: [0, 1, 2, 3], normal: { x: 0, y: -1, z: 0 } },
          { name: 'front', indices: [3, 2, 6, 7], normal: { x: 0, y: 0, z: 1 } },
          { name: 'back', indices: [1, 0, 4, 5], normal: { x: 0, y: 0, z: -1 } },
          { name: 'left', indices: [0, 3, 7, 4], normal: { x: -1, y: 0, z: 0 } },
          { name: 'right', indices: [2, 1, 5, 6], normal: { x: 1, y: 0, z: 0 } }
        ];

        faceDefinitions.forEach(face => {
          // Compute average Z depth
          let sumZ = 0;
          face.indices.forEach(idx => sumZ += rotatedVertices[idx].z);
          const avgZ = sumZ / 4;

          // Backface culling: Check if face is visible
          // Vector from camera (0,0,-CAMERA_DISTANCE) to first point on face
          const p1 = rotatedVertices[face.indices[0]];
          const p2 = rotatedVertices[face.indices[1]];
          const p3 = rotatedVertices[face.indices[2]];

          // Compute cross product in 2D space to see if clockwise/counter-clockwise
          const val = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
          if (val <= 0) return; // Culled face

          // Compute shaded normal lighting
          let norm = rotate3D(face.normal.x, face.normal.y, face.normal.z, isFloating ? kYaw : yaw, isFloating ? kPitch : pitch, isFloating ? kRoll : roll);
          const dot = norm.x * lightDir.x + norm.y * lightDir.y + norm.z * lightDir.z;
          const diffuse = Math.max(0, -dot); // normal points outward, light direction flows inward

          // Specular highlights
          // R = L - 2(L.N)N
          const rx = lightDir.x - 2 * dot * norm.x;
          const ry = lightDir.y - 2 * dot * norm.y;
          const rz = lightDir.z - 2 * dot * norm.z;
          // View direction in world space is approx (0, 0, -1)
          const spec = Math.pow(Math.max(0, -rz), 12) * 0.45;

          // Color tinting base on face shading
          let faceColor = color;
          // Deconstruct hex or color
          let r = 38, g = 38, b = 38;
          if (color.startsWith('#')) {
            const hex = color.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
          }

          // Shading intensity
          const ambient = isKey ? 0.32 : 0.25;
          const shadowCoeff = ambient + diffuse * 0.65;
          
          // Specular glowing backlight reflection: add amber glow on top/bottom sides
          let backglowR = 0, backglowG = 0, backglowB = 0;
          if (glowIntensity > 0) {
            // Orange RGB glow overlay
            backglowR = Math.floor(249 * glowIntensity * 0.45);
            backglowG = Math.floor(115 * glowIntensity * 0.45);
            backglowB = Math.floor(22 * glowIntensity * 0.45);
          }

          const finalR = Math.min(255, Math.floor(r * shadowCoeff + spec * 255 + backglowR));
          const finalG = Math.min(255, Math.floor(g * shadowCoeff + spec * 120 + backglowG));
          const finalB = Math.min(255, Math.floor(b * shadowCoeff + spec * 40 + backglowB));

          const screenPoints = face.indices.map(idx => ({ x: rotatedVertices[idx].x, y: rotatedVertices[idx].y }));

          polygons.push({
            type: isFloating ? 'floating_key' : (isKey ? 'key' : 'base'),
            avgZ,
            screenPoints,
            color: `rgb(${finalR}, ${finalG}, ${finalB})`,
            specular: spec,
            glowIntensity,
            label: face.name === 'top' ? label : undefined,
            topCenter: face.name === 'top' ? {
              x: (screenPoints[0].x + screenPoints[2].x) / 2,
              y: (screenPoints[0].y + screenPoints[2].y) / 2,
              z: avgZ
            } : undefined,
            blur: blurVal
          });
        });
      };

      // 1. Draw Keyboard Base plate
      pushBoxToPolys(0, 7, 0, BASE_W, BASE_H, BASE_D, false, '#121318', 0);

      // 2. Draw Keyboard Keycaps
      keyInstances.forEach(k => {
        // Individual key cap position
        const cy = 0 + k.pressY;
        // Keycaps color style
        let kColor = k.color;
        if (k.glowIntensity > 0.1 && kColor === '#262626') {
          // shift dark keycaps slightly warmer charcoal when glowing
          kColor = '#2d2520';
        }
        pushBoxToPolys(k.localX, cy, k.localZ, k.w, KEY_H, k.d, true, kColor, k.glowIntensity, k.label);
      });

      // 3. Draw Floating drifting keycaps in space
      floatingKeycaps.forEach(k => {
        // Depth-of-field blur factor (far away or too close are blurred)
        const focusZ = 0;
        const diffZ = Math.abs(k.z - focusZ);
        const blur = Math.max(0, Math.min(8, (diffZ - 80) * 0.025));

        pushBoxToPolys(
          k.x, k.y, k.z,
          k.size, k.size * 0.6, k.size,
          true,
          k.color,
          k.color === '#f97316' ? 0.8 : 0.2, // accent ones glow
          k.label,
          k.yaw, k.pitch, k.roll,
          0, 0, 0, // no global translate offsets
          true, // is floating
          blur
        );
      });

      // 4. Draw Glow backlights under keycaps directly to canvas before solid polygons
      // (This renders the ambient glowing halo on the keyboard base plate)
      keyInstances.forEach(k => {
        if (k.glowIntensity > 0.1) {
          // Compute screen projection of keycap center
          let pt = rotate3D(k.localX, 3, k.localZ, yaw, pitch, roll);
          let worldX = pt.x;
          let worldY = pt.y + floatY;
          let worldZ = pt.z + CAMERA_DISTANCE;

          const scale = FOCAL / worldZ;
          const sx = width / 2 + worldX * scale;
          const sy = height / 2 + worldY * scale;

          const radius = (k.isSpace ? 45 : 18) * scale;

          // Draw neon orange light aura under the keycap
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const glowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
          glowGrad.addColorStop(0, `rgba(249, 115, 22, ${k.glowIntensity * 0.35})`);
          glowGrad.addColorStop(0.5, `rgba(249, 115, 22, ${k.glowIntensity * 0.12})`);
          glowGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 5. Add particles to polygon rendering list as simple circular elements sorted by depth
      particles.forEach(p => {
        const focusZ = 0;
        const diffZ = Math.abs(p.z - focusZ);
        const blur = Math.max(0, Math.min(10, (diffZ - 100) * 0.03));

        // Project particle
        let worldZ = p.z + CAMERA_DISTANCE;
        const scale = FOCAL / worldZ;
        const sx = width / 2 + p.x * scale;
        const sy = height / 2 + p.y * scale;

        // Collect particle in polygon list
        polygons.push({
          type: 'particle',
          avgZ: p.z,
          screenPoints: [{ x: sx, y: sy }],
          color: `rgba(249, 115, 22, ${p.alpha * (1 - p.life / p.maxLife)})`,
          glowIntensity: p.size,
          blur
        });
      });

      // 6. SORT ALL POLYGONS BY DEPTH (Painters Algorithm: back to front)
      // Largest depth avgZ drawn first
      polygons.sort((a, b) => b.avgZ - a.avgZ);

      // 7. RENDER SOLID POLYGONS & LABELS
      polygons.forEach(p => {
        ctx.save();

        // Apply Depth of Field blur filter if valid
        if (p.blur && p.blur > 0.5) {
          ctx.filter = `blur(${p.blur.toFixed(1)}px)`;
        }

        if (p.type === 'particle') {
          // Draw particle
          const size = Math.max(1, (p.glowIntensity || 1) * (FOCAL / (p.avgZ + CAMERA_DISTANCE)));
          ctx.beginPath();
          ctx.arc(p.screenPoints[0].x, p.screenPoints[0].y, size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          
          // Outer glow for brighter dust
          ctx.globalCompositeOperation = 'screen';
          ctx.beginPath();
          ctx.arc(p.screenPoints[0].x, p.screenPoints[0].y, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, '0.2)');
          ctx.fill();
        } else {
          // Draw keycap/base faces
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(p.screenPoints[0].x, p.screenPoints[0].y);
          for (let i = 1; i < p.screenPoints.length; i++) {
            ctx.lineTo(p.screenPoints[i].x, p.screenPoints[i].y);
          }
          ctx.closePath();
          ctx.fill();

          // Stroke subtle contour wireframe lines to define 3D edges cleanly
          ctx.lineWidth = 0.45;
          ctx.strokeStyle = p.type === 'base' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)';
          ctx.stroke();

          // If the face is a TOP keycap face, draw the key letter labels
          if (p.label && p.topCenter) {
            const fontScale = FOCAL / (p.avgZ + CAMERA_DISTANCE);
            const fontSize = Math.max(5, Math.floor(p.label.length > 2 ? 4.5 * fontScale : 6 * fontScale));
            
            ctx.fillStyle = p.color.includes('249') ? '#ffffff' : '#f8fafc'; // white for orange, glowing silver for grey
            ctx.font = `black ${fontSize}px var(--font-mono), monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Add subtle label glow if key is active
            if (p.glowIntensity && p.glowIntensity > 0.3) {
              ctx.shadowColor = '#f97316';
              ctx.shadowBlur = 4;
            }
            
            ctx.fillText(p.label, p.topCenter.x, p.topCenter.y);
          }
        }

        ctx.restore();
      });

      // Cinematic lens flare (upper right light source simulation)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const flareGrad = ctx.createRadialGradient(width * 0.8, height * 0.1, 0, width * 0.8, height * 0.1, width * 0.45);
      flareGrad.addColorStop(0, 'rgba(249, 115, 22, 0.08)');
      flareGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.02)');
      flareGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    animationFrameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
