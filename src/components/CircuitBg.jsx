import { useEffect, useRef } from 'react';

export default function CircuitBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const cx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H, segs = [], dots = [], pulses = [], rafId;
    let t = 0;

    function build() {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      pulses = [];
    }

    function spawnPulse() {
      if (segs.length === 0) return;
      const s = segs[Math.floor(Math.random() * segs.length)];
      pulses.push({
        x: (s.x1 + s.x2) / 2,
        y: (s.y1 + s.y2) / 2,
        r: 0, maxR: 40 + Math.random() * 30,
        alpha: 0.2 + Math.random() * 0.1,
      });
    }

    function frame() {
      cx.clearRect(0, 0, W, H);
      t += 0.01;

      // Spawn occasional pulses
      if (Math.random() < 0.008) spawnPulse();

      // Draw grid segments with subtle breathing
      segs.forEach((s, i) => {
        const breathe = 0.03 + 0.015 * Math.sin(t * 0.5 + i * 0.01);
        cx.strokeStyle = `rgba(0,229,255,${breathe})`;
        cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(s.x1, s.y1); cx.lineTo(s.x2, s.y2); cx.stroke();
      });

      // Draw node dots
      cx.fillStyle = 'rgba(0,229,255,0.1)';
      const drawn = new Set();
      segs.forEach(s => {
        const k1 = `${s.x1}_${s.y1}`, k2 = `${s.x2}_${s.y2}`;
        if (!drawn.has(k1)) { cx.beginPath(); cx.arc(s.x1, s.y1, 1.2, 0, Math.PI * 2); cx.fill(); drawn.add(k1); }
        if (!drawn.has(k2)) { cx.beginPath(); cx.arc(s.x2, s.y2, 1.2, 0, Math.PI * 2); cx.fill(); drawn.add(k2); }
      });

      // Draw moving electrons
      dots.forEach(d => {
        d.t += d.sp; if (d.t > 1) d.t = 0;
        const ex = d.s.x1 + (d.s.x2 - d.s.x1) * d.t;
        const ey = d.s.y1 + (d.s.y2 - d.s.y1) * d.t;
        const g = cx.createRadialGradient(ex, ey, 0, ex, ey, 4);
        g.addColorStop(0, 'rgba(0,229,255,0.4)');
        g.addColorStop(0.5, 'rgba(0,229,255,0.12)');
        g.addColorStop(1, 'rgba(0,229,255,0)');
        cx.fillStyle = g;
        cx.beginPath(); cx.arc(ex, ey, 4, 0, Math.PI * 2); cx.fill();
      });

      // Draw and update pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 0.6;
        const progress = p.r / p.maxR;
        const alpha = p.alpha * (1 - progress);
        if (alpha <= 0.01) { pulses.splice(i, 1); continue; }
        cx.strokeStyle = `rgba(0,229,255,${alpha})`;
        cx.lineWidth = 1;
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2); cx.stroke();
      }

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
