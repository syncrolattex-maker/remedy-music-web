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

    // Initial mouse positions
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 2;
    mouseRef.current.x = width / 2;
    mouseRef.current.y = height / 2;

    const words = [
      'REMEDY MUSIC VLC',
      'SAMPLING CULTURE',
      'DIGGIN THE CRATES',
      'UNDERGROUND RAP',
      'RAW BREAKS & BEATS',
      'KRAKATOA RECORDS',
      'INDEPENDENT SINCE 2020'
    ];

    let angleOffset = 0;

    const render = () => {
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Speed changes with mouse X position
      const speedFactor = 1 + (mouse.x - width / 2) / (width / 2) * 1.5;
      angleOffset += 0.004 * speedFactor;

      // Tilt changes with mouse Y position (angle in degrees)
      const tilt = (mouse.y - height / 2) / (height / 2) * 35; 

      const cylinderCount = 5;
      const spacing = height / (cylinderCount + 1);

      for (let c = 0; c < cylinderCount; c++) {
        const text = words[c % words.length];
        const repeatedText = (text + '      ').repeat(3); 
        const yCenter = spacing * (c + 1);

        const radius = width * 0.32; 
        const charCount = repeatedText.length;
        const angleStep = (Math.PI * 2) / charCount;

        // Alternate rotation direction
        const direction = c % 2 === 0 ? 1 : -1;
        const currentAngleOffset = angleOffset * direction;

        const charsToDraw: { char: string; x: number; y: number; scale: number; opacity: number; z: number }[] = [];

        for (let i = 0; i < charCount; i++) {
          const char = repeatedText[i];
          const angle = i * angleStep + currentAngleOffset;

          // 3D Cylinder coordinates (rotating around Y axis)
          const cx = Math.sin(angle) * radius;
          const cz = Math.cos(angle) * radius; // depth Z

          // Rotate around X axis to apply tilt
          const radTilt = (tilt * Math.PI) / 180;
          const ry = -cz * Math.sin(radTilt);
          const rz = cz * Math.cos(radTilt);

          // 3D Perspective projection
          const fov = 500;
          const scale = fov / (fov - rz);

          const screenX = width / 2 + cx * scale;
          const screenY = yCenter + ry * scale;

          // Normalize depth to 0 (back) -> 1 (front)
          const normalizedZ = (rz + radius) / (radius * 2);
          const opacity = 0.03 + normalizedZ * 0.32; // front elements are brighter

          charsToDraw.push({
            char,
            x: screenX,
            y: screenY,
            scale,
            opacity,
            z: rz
          });
        }

        // Sort by Z to draw back characters first (painter's algorithm)
        charsToDraw.sort((a, b) => a.z - b.z);

        // Render sorted characters
        charsToDraw.forEach(item => {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.scale(item.scale, item.scale);
          
          const isFront = item.z > 0;
          const frontThreshold = radius * 0.35;

          if (isFront && item.z > frontThreshold) {
            // Apply vibrant themed colors on the closest elements
            const colorProgress = (item.z - frontThreshold) / (radius - frontThreshold);
            if (c % 3 === 0) {
              ctx.fillStyle = `rgba(0, 240, 255, ${item.opacity * (1 + colorProgress * 0.5)})`; // cyan
            } else if (c % 3 === 1) {
              ctx.fillStyle = `rgba(255, 0, 85, ${item.opacity * (1 + colorProgress * 0.5)})`; // pink
            } else {
              ctx.fillStyle = `rgba(214, 255, 0, ${item.opacity * (1 + colorProgress * 0.5)})`; // yellow
            }
          } else {
            // Neutral styling for background/depth characters
            ctx.fillStyle = `rgba(255, 255, 255, ${item.opacity})`;
          }

          ctx.font = '900 80px "League Gothic", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.char, 0, 0);
          ctx.restore();
        });
      }

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
