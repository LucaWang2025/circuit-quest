import { useEffect, useRef } from 'react';

export default function StarfieldBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H, stars = [], rafId, t = 0;

    function build() {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: 420 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        a: 0.3 + Math.random() * 0.7,
        tw: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      t += 0.012;
      ctx.fillStyle = '#03060e';
      ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, W * 0.65);
      g.addColorStop(0, 'rgba(156,125,255,0.06)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      stars.forEach(s => {
        const a = s.a * (0.65 + 0.35 * Math.sin(t + s.tw));
        ctx.fillStyle = `rgba(200,220,255,${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    }

    build();
    draw();
    window.addEventListener('resize', build);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', build);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden
    />
  );
}
