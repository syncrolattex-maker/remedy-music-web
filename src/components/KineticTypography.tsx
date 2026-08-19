import React, { useRef, useEffect } from 'react';

export const KineticTypography: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initial mouse positions (centered)
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 2;
    mouseRef.current.x = width / 2;
    mouseRef.current.y = height / 2;

    // Define 3D rotation math helper
    const rotateX = (x: number, y: number, z: number, angleRad: number) => {
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      return { x, y: y * cos - z * sin, z: y * sin + z * cos };
    };

    const rotateY = (x: number, y: number, z: number, angleRad: number) => {
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      return { x: x * cos + z * sin, y, z: -x * sin + z * cos };
    };

    const rotateZ = (x: number, y: number, z: number, angleRad: number) => {
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      return { x: x * cos - y * sin, y: x * sin + y * cos, z };
    };

    // 3D Perspective projection
    const project = (x: number, y: number, z: number) => {
      const fov = 420;
      const scale = fov / (fov - z);
      return {
        x: width / 2 + x * scale,
        y: height / 2 + y * scale,
        scale
      };
    };

    // Construct Scaffolding 3D Models
    const outerSize = 160;
    const outerVertices = [
      { x: -outerSize, y: -outerSize, z: -outerSize }, // 0
      { x:  outerSize, y: -outerSize, z: -outerSize }, // 1
      { x:  outerSize, y:  outerSize, z: -outerSize }, // 2
      { x: -outerSize, y:  outerSize, z: -outerSize }, // 3
      { x: -outerSize, y: -outerSize, z:  outerSize }, // 4
      { x:  outerSize, y: -outerSize, z:  outerSize }, // 5
      { x:  outerSize, y:  outerSize, z:  outerSize }, // 6
      { x: -outerSize, y:  outerSize, z:  outerSize }  // 7
    ];

    const innerSize = 85;
    const innerVertices = [
      { x: -innerSize, y: -innerSize, z: -innerSize }, // 0
      { x:  innerSize, y: -innerSize, z: -innerSize }, // 1
      { x:  innerSize, y:  innerSize, z: -innerSize }, // 2
      { x: -innerSize, y:  innerSize, z: -innerSize }, // 3
      { x: -innerSize, y: -innerSize, z:  innerSize }, // 4
      { x:  innerSize, y: -innerSize, z:  innerSize }, // 5
      { x:  innerSize, y:  innerSize, z:  innerSize }, // 6
      { x: -innerSize, y:  innerSize, z:  innerSize }  // 7
    ];

    const edges = [
      { a: 0, b: 1, text: 'REMEDY' },
      { a: 1, b: 2, text: 'MUSIC' },
      { a: 2, b: 3, text: 'VLC' },
      { a: 3, b: 0, text: '2020' },
      { a: 4, b: 5, text: 'SAMPLING' },
      { a: 5, b: 6, text: 'CULTURE' },
      { a: 6, b: 7, text: 'DIGGIN' },
      { a: 7, b: 4, text: 'CRATES' },
      { a: 0, b: 4, text: 'ANALOG' },
      { a: 1, b: 5, text: 'BREAKS' },
      { a: 2, b: 6, text: 'BEATS' },
      { a: 3, b: 7, text: 'VINYL' }
    ];

    const innerEdges = [
      { a: 0, b: 1, text: 'SOUL' },
      { a: 1, b: 2, text: 'FUNK' },
      { a: 2, b: 3, text: 'RAP' },
      { a: 3, b: 0, text: 'JAZZ' },
      { a: 4, b: 5, text: 'CUT' },
      { a: 5, b: 6, text: 'DJ' },
      { a: 6, b: 7, text: 'RAW' },
      { a: 7, b: 4, text: 'TAPES' },
      { a: 0, b: 4, text: 'MPC' },
      { a: 1, b: 5, text: '1200' },
      { a: 2, b: 6, text: 'GEAR' },
      { a: 3, b: 7, text: 'TRUE' }
    ];

    let time = 0;

    const render = () => {
      time += 0.008;

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Mouse position translates into rotation offsets
      const angleY = (mouse.x - width / 2) * 0.005 + time * 0.5;
      const angleX = (mouse.y - height / 2) * 0.005 + time * 0.2;
      const angleZ = time * 0.1;

      // Rotate and project all vertices of both cubes
      const rotatePoint = (p: { x: number; y: number; z: number }) => {
        let rotated = rotateX(p.x, p.y, p.z, angleX);
        rotated = rotateY(rotated.x, rotated.y, rotated.z, angleY);
        rotated = rotateZ(rotated.x, rotated.y, rotated.z, angleZ);
        return rotated;
      };

      const outerRotated = outerVertices.map(rotatePoint);
      const innerRotated = innerVertices.map(rotatePoint);

      const outerProjected = outerRotated.map(p => project(p.x, p.y, p.z));
      const innerProjected = innerRotated.map(p => project(p.x, p.y, p.z));

      // Draw subtle construction background wireframe connections
      ctx.lineWidth = 1;
      const drawWireframeLines = (proj: { x: number; y: number; scale: number }[]) => {
        edges.forEach(edge => {
          const ptA = proj[edge.a];
          const ptB = proj[edge.b];
          ctx.beginPath();
          ctx.moveTo(ptA.x, ptA.y);
          ctx.lineTo(ptB.x, ptB.y);
          // Faint tech blue/cyan lines
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
          ctx.stroke();
        });
      };
      drawWireframeLines(outerProjected);
      drawWireframeLines(innerProjected);

      // Collect all character drawings from all edges
      interface CharItem {
        char: string;
        x: number;
        y: number;
        scale: number;
        opacity: number;
        z: number;
        colorType: 'cyan' | 'pink' | 'yellow' | 'white';
      }

      const charList: CharItem[] = [];

      const populateChars = (
        rotatedVerts: { x: number; y: number; z: number }[],
        edgesList: typeof edges,
        isOuter: boolean
      ) => {
        edgesList.forEach((edge, index) => {
          const vA = rotatedVerts[edge.a];
          const vB = rotatedVerts[edge.b];
          
          // Form repeating text strings along edges
          const edgeText = ` ${edge.text} `.repeat(2);
          const N = edgeText.length;

          for (let i = 0; i < N; i++) {
            const char = edgeText[i];
            if (char === ' ') continue;

            // Interpolate 3D coordinates between A and B
            const t = i / (N - 1);
            const x3d = vA.x + (vB.x - vA.x) * t;
            const y3d = vA.y + (vB.y - vA.y) * t;
            const z3d = vA.z + (vB.z - vA.z) * t;

            // Project interpolated point
            const proj = project(x3d, y3d, z3d);

            // Compute depth factor (Z range is roughly -outerSize*1.7 to +outerSize*1.7)
            const maxRadius = outerSize * 1.8;
            const normalizedZ = (z3d + maxRadius) / (maxRadius * 2);
            
            // Opacity range: Faint in back, bright in front
            const opacity = 0.03 + Math.max(0, Math.min(1, normalizedZ)) * 0.35;

            // Color palette allocation based on depth and layer
            let colorType: 'cyan' | 'pink' | 'yellow' | 'white' = 'white';
            if (z3d > maxRadius * 0.1) {
              if (isOuter) {
                colorType = index % 2 === 0 ? 'cyan' : 'pink';
              } else {
                colorType = 'yellow';
              }
            }

            charList.push({
              char,
              x: proj.x,
              y: proj.y,
              scale: proj.scale,
              opacity,
              z: z3d,
              colorType
            });
          }
        });
      };

      populateChars(outerRotated, edges, true);
      populateChars(innerRotated, innerEdges, false);

      // Sort characters by depth Z (Painters algorithm) to overlap correctly
      charList.sort((a, b) => a.z - b.z);

      // Render characters
      charList.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.scale(item.scale, item.scale);

        // Styling based on colorType
        if (item.colorType === 'cyan') {
          ctx.fillStyle = `rgba(0, 240, 255, ${item.opacity * 1.6})`;
        } else if (item.colorType === 'pink') {
          ctx.fillStyle = `rgba(255, 0, 85, ${item.opacity * 1.6})`;
        } else if (item.colorType === 'yellow') {
          ctx.fillStyle = `rgba(214, 255, 0, ${item.opacity * 1.6})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${item.opacity})`;
        }

        ctx.font = '900 17px "League Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.char, 0, 0);
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
