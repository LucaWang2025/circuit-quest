import { useEffect, useRef } from 'react';

export default function CircuitBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const cx = cv.getContext('2d');
    let W, H, segs = [], dots = [], rafId;

    function build() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
      const CELL = 88;
      const cols = Math.ceil(W / CELL) + 2;
      const rows = Math.ceil(H / CELL) + 2;
      segs = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL - CELL * 0.5;
          const y = r * CELL - CELL * 0.5;
          if (c < cols - 1 && Math.random() < 0.62)
            segs.push({ x1: x, y1: y, x2: x + CELL, y2: y });
          if (r < rows - 1 && Math.random() < 0.62)
            segs.push({ x1: x, y1: y, x2: x, y2: y + CELL });
        }
      }
      dots = [];
      segs.forEach(s => {
        if (Math.random() < 0.26)
          dots.push({ s, t: Math.random(), sp: 0.0016 + Math.random() * 0.0028 });
      });
    }

    function frame() {
      cx.clearRect(0, 0, W, H);
      cx.strokeStyle = 'rgba(0,229,255,0.04)';
      cx.lineWidth = 1;
      segs.forEach(s => {
        cx.beginPath(); cx.moveTo(s.x1, s.y1); cx.lineTo(s.x2, s.y2); cx.stroke();
      });
      cx.fillStyle = 'rgba(0,229,255,0.1)';
      const drawn = new Set();
      segs.forEach(s => {
        const k1 = `${s.x1}_${s.y1}`, k2 = `${s.x2}_${s.y2}`;
        if (!drawn.has(k1)) { cx.beginPath(); cx.arc(s.x1, s.y1, 1, 0, Math.PI * 2); cx.fill(); drawn.add(k1); }
        if (!drawn.has(k2)) { cx.beginPath(); cx.arc(s.x2, s.y2, 1, 0, Math.PI * 2); cx.fill(); drawn.add(k2); }
      });
      dots.forEach(d => {
        d.t += d.sp; if (d.t > 1) d.t = 0;
        const ex = d.s.x1 + (d.s.x2 - d.s.x1) * d.t;
        const ey = d.s.y1 + (d.s.y2 - d.s.y1) * d.t;
        const g = cx.createRadialGradient(ex, ey, 0, ex, ey, 3);
        g.addColorStop(0, 'rgba(0,229,255,0.35)');
        g.addColorStop(1, 'rgba(0,229,255,0)');
        cx.fillStyle = g;
        cx.beginPath(); cx.arc(ex, ey, 3, 0, Math.PI * 2); cx.fill();
      });
      rafId = requestAnimationFrame(frame);
    }

    build();
    window.addEventListener('resize', build);
    frame();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', build);
    };
  }, []);

  return <canvas id="bgCanvas" ref={canvasRef} />;
}
