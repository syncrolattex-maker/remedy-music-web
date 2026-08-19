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

    // Initial mouse positions in center
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 2;
    mouseRef.current.x = width / 2;
    mouseRef.current.y = height / 2;

    const words = [
      'REMEDY MUSIC VLC',
      'SAMPLING CULTURE',
      'DIGGIN THE CRATES',
      'UNDERGROUND HIP HOP',
      'RAW BREAKS & BEATS',
      'ANALOG SOUND LAB',
      'KRAKATOA RECORDS',
      'INDEPENDENT SINCE 2020'
    ];

    let time = 0;

    const render = () => {
      time += 0.015;

      // Easing for smooth mouse interaction
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const rowCount = 7;
      const rowSpacing = height / (rowCount + 1);

      for (let r = 0; r < rowCount; r++) {
        const word = words[r % words.length];
        // Repeating text pattern
        const repeatedText = (word + '       ').repeat(6);
        const yBase = rowSpacing * (r + 1);

        ctx.font = '900 85px "League Gothic", sans-serif';
        ctx.textBaseline = 'middle';

        const direction = r % 2 === 0 ? 1 : -1;
        // Scroll offset
        const scrollSpeed = 40;
        const scrollOffset = (time * scrollSpeed * direction) % width;

        let currentX = -width / 2 + scrollOffset;
        if (direction === -1) {
          currentX = width * 1.5 - scrollOffset;
        }

        // Loop over the repeated string
        for (let i = 0; i < repeatedText.length; i++) {
          const char = repeatedText[i];
          const charWidth = ctx.measureText(char).width;

          // Wrap drawing coordinates
          let drawX = currentX;
          if (drawX < -width) {
            drawX += width * 2;
          } else if (drawX > width * 2) {
            drawX -= width * 2;
          }

          // Sine wave displacement
          const waveFrequency = 0.0035;
          const waveAmplitude = 30;
          const wave = Math.sin(drawX * waveFrequency + time * 2.5 + r) * waveAmplitude;
          let drawY = yBase + wave;

          // Mouse repulsion force
          const dx = drawX - mouse.x;
          const dy = drawY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist; // Eased force between 0 and 1
            const angle = Math.atan2(dy, dx);
            const pushDist = force * 60;
            drawX += Math.cos(angle) * pushDist;
            drawY += Math.sin(angle) * pushDist;

            // Shift color to bright cyan on mouse hover
            ctx.fillStyle = `rgba(0, 240, 255, ${0.12 + force * 0.78})`;
          } else {
            // Default row styling using Remedy palette
            if (r % 3 === 0) {
              ctx.fillStyle = 'rgba(214, 255, 0, 0.14)'; // acid yellow
            } else if (r % 3 === 1) {
              ctx.fillStyle = 'rgba(255, 0, 85, 0.12)'; // neon pink
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'; // faint white
            }
          }

          ctx.fillText(char, drawX, drawY);
          currentX += charWidth;
        }
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
