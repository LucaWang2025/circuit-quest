import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00e676';

function AnimCanvas({ modeRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;
      const label = modeRef?.current || '专用回路 · 漏电保护';
      ctx.fillStyle = ACC + '66'.replace('#',''); 
      ctx.fillStyle = ACC.replace(')', ',0.4)').includes('rgba') ? ACC : (ACC.startsWith('#') ? ACC + '66' : 'rgba(0,200,100,.4)');
      try {
        const hex = ACC;
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        ctx.fillStyle = `rgba(${r},${g},${b},0.42)`;
      } catch { ctx.fillStyle = 'rgba(0,200,100,.4)'; }
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, W / 2, 27);
      const cx = W/2, cy = H/2;
      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = (i/6)*Math.PI*2 + t;
        const x = cx + Math.cos(a)*80, y = cy + Math.sin(a)*50;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(200,215,230,.6)'; ctx.font = '11px monospace';
      ctx.fillText('7kW/11kW 交流桩接线与漏电保护', W/2, H - 12);
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

export default function EvCharger() {
  const modeRef = useRef('专用回路 · 漏电保护');
  return (
    <section id="ev-charger" className="sec">
      <div className="sh">
        <span className="sh-icon">🔌</span>
        <div>
          <div className="sh-tag">EV CHARGER 7kW</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>充电桩</h2>
          <p className="sh-sub">7kW/11kW 交流桩接线与漏电保护</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: ACC + '33' }}>
          <AnimCanvas modeRef={modeRef} />
        </div>
        <div className="info-stack reveal">
          <div className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>核心要点</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>7kW/11kW 交流桩接线与漏电保护</div>
          </div>
          <div className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>安全提示</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>操作前断电验电，高压部分（如微波炉 2kV）需放电后测量。</div>
          </div>
        </div>
      </div>
    </section>
  );
}
