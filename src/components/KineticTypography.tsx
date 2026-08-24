import React, { useRef, useEffect } from 'react';

interface Ribbon {
  text: string;
  yStartPct: number;
  yEndPct: number;
  speed: number;
  frequency: number;
  amplitude: number;
  bgColor: string;
  textColor: string;
  fontSize: number;
  depth: number;
  height: number;
  waveSpeed: number;
}

export const KineticTypography: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

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

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };
    window.addEventListener('mouseleave', handleMouseLeave);

    const ribbons: Ribbon[] = [
      {
        text: " REMEDY RECORDS // SAMPLING CULTURE // SOUL // FUNK // HIP HOP // ",
        yStartPct: 0.18,
        yEndPct: 0.38,
        speed: 0.9,
        frequency: 0.005,
        amplitude: 35,
        bgColor: "#FFDE00", // Yellow
        textColor: "#000000",
        fontSize: 32,
        depth: 3,
        height: 52,
        waveSpeed: 1.6
      },
      {
        text: " DIGGIN IN THE CRATES // VINYL PRESERVATION // 45S CLUB // TAPE SERIES // ",
        yStartPct: 0.82,
        yEndPct: 0.42,
        speed: -0.7,
        frequency: 0.007,
        amplitude: 28,
        bgColor: "#FF0055", // Pink/Magenta
        textColor: "#ffffff",
        fontSize: 26,
        depth: 2,
        height: 44,
        waveSpeed: 2.0
      },
      {
        text: " EXPERIMENTAL BEATS // DANGER WAVE // UNDERGROUND RAP // ",
        yStartPct: 0.35,
        yEndPct: 0.65,
        speed: 1.2,
        frequency: 0.004,
        amplitude: 40,
        bgColor: "#000000", // Black
        textColor: "#00F0FF", // Cyan
        fontSize: 28,
        depth: 4,
        height: 48,
        waveSpeed: 1.4
      },
      {
        text: " INDEPENDENT MUSIC SINCE 2020 // VLC UNDERGROUND // RAW ESSENCE // ",
        yStartPct: 0.08,
        yEndPct: 0.88,
        speed: -0.5,
        frequency: 0.003,
        amplitude: 45,
        bgColor: "#ffffff", // White
        textColor: "#000000",
        fontSize: 36,
        depth: 1,
        height: 60,
        waveSpeed: 0.9
      },
      {
        text: " KRAKATOA RECORDS PRESSING // DJ PACK PREORDER // BEATMAKING // ",
        yStartPct: 0.72,
        yEndPct: 0.82,
        speed: 0.6,
        frequency: 0.006,
        amplitude: 25,
        bgColor: "#000000", // Black
        textColor: "#FFDE00", // Yellow
        fontSize: 22,
        depth: 5,
        height: 38,
        waveSpeed: 2.2
      }
    ];

    // Sort by depth (render back to front)
    ribbons.sort((a, b) => a.depth - b.depth);

    let time = 0;

    const render = () => {
      time += 0.008;

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      ribbons.forEach((r) => {
        // Depth scale factors
        const scale = 0.5 + 0.5 * (r.depth / 5);
        const opacity = 0.2 + 0.8 * (r.depth / 5);
        const actualHeight = r.height * scale;
        const actualFontSize = r.fontSize * scale;
        const actualAmplitude = r.amplitude * scale;

        const yStart = height * r.yStartPct;
        const yEnd = height * r.yEndPct;

        // Wave evaluation helper
        const getWaveY = (x: number) => {
          const yBase = yStart + (yEnd - yStart) * (x / width);
          let wave = Math.sin(x * r.frequency + time * r.waveSpeed) * actualAmplitude;
          wave += Math.cos(x * r.frequency * 2.2 - time * r.waveSpeed * 0.8) * (actualAmplitude * 0.35);

          // Mouse influence
          if (mouse.x > -500 && mouse.y > -500) {
            const dist = Math.hypot(x - mouse.x, yBase - mouse.y);
            if (dist < 220) {
              const influence = 1 - dist / 220;
              wave += Math.sin(x * 0.025 + time * 6) * (influence * 35 * scale);
            }
          }
          return yBase + wave;
        };

        // Draw ribbon strip
        ctx.save();
        ctx.globalAlpha = opacity;

        const step = 8;
        const points: { x: number; y: number; angle: number }[] = [];

        for (let x = -20; x <= width + 20; x += step) {
          const y = getWaveY(x);
          const yNext = getWaveY(x + 2);
          const yPrev = getWaveY(x - 2);
          const angle = Math.atan2(yNext - yPrev, 4);
          points.push({ x, y, angle });
        }

        // Draw filled background strip
        ctx.beginPath();
        points.forEach((pt, idx) => {
          const perpAngle = pt.angle + Math.PI / 2;
          const px = pt.x + Math.cos(perpAngle) * (actualHeight / 2);
          const py = pt.y + Math.sin(perpAngle) * (actualHeight / 2);
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });

        for (let idx = points.length - 1; idx >= 0; idx--) {
          const pt = points[idx];
          const perpAngle = pt.angle - Math.PI / 2;
          const px = pt.x + Math.cos(perpAngle) * (actualHeight / 2);
          const py = pt.y + Math.sin(perpAngle) * (actualHeight / 2);
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = r.bgColor;
        ctx.fill();

        // Draw solid black borders
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();

        // Draw scrolling text along path
        const charSpacing = actualFontSize * 0.55;
        const textLength = r.text.length;
        const scrollOffset = time * r.speed * 120;
        const numChars = Math.ceil(width / charSpacing) + 15;

        ctx.fillStyle = r.textColor;
        ctx.font = `900 ${actualFontSize}px "League Gothic", "Impact", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = -8; i < numChars; i++) {
          const rawX = i * charSpacing + (scrollOffset % (textLength * charSpacing));
          const margin = 120;
          const x = ((rawX + margin) % (width + margin * 2)) - margin;

          const y = getWaveY(x);
          const yNext = getWaveY(x + 2);
          const yPrev = getWaveY(x - 2);
          const angle = Math.atan2(yNext - yPrev, 4);
          const shearX = Math.sin(angle) * 0.8;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.transform(1, 0, shearX, 1, 0, 0);

          const charIndex = Math.floor(rawX / charSpacing) % textLength;
          const char = r.text[charIndex < 0 ? charIndex + textLength : charIndex];

          ctx.fillText(char, 0, 0);
          ctx.restore();
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
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
