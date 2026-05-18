import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00e676';

function KirchhoffCanvas({ lawRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const kcl = lawRef.current === 'kcl';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const modeLabel = kcl ? 'KCL · 节点电流守恒 ΣI入 = ΣI出' : 'KVL · 回路电压守恒 ΣU = 0';
      ctx.fillStyle = 'rgba(0,230,118,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(modeLabel, W / 2, 27);

      if (kcl) {
        const nx = 240, ny = 160;
        ctx.fillStyle = '#ff5252'; ctx.beginPath(); ctx.arc(nx, ny, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('节点', nx, ny + 4);

        const flows = [
          { x1: nx - 90, y1: ny, x2: nx - 12, y2: ny, label: 'I1=3A 入', in: true },
          { x1: nx, y1: ny - 70, x2: nx, y2: ny - 12, label: 'I2=2A 入', in: true },
          { x1: nx + 12, y1: ny, x2: nx + 90, y2: ny, label: 'I3=5A 出', in: false },
        ];
        flows.forEach((f, idx) => {
          ctx.strokeStyle = f.in ? '#00e676' : '#ffab00';
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke();
          const frac = (t * 0.8 + idx * 0.33) % 1;
          const px = f.x1 + (f.x2 - f.x1) * frac;
          const py = f.y1 + (f.y2 - f.y1) * frac;
          ctx.fillStyle = f.in ? '#00e676' : '#ffab00';
          ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#aab'; ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          const lx = (f.x1 + f.x2) / 2 + (f.y1 === f.y2 ? 0 : 20);
          const ly = (f.y1 + f.y2) / 2 + (f.x1 === f.x2 ? -18 : 0);
          ctx.fillText(f.label, lx, ly);
        });

        ctx.fillStyle = ACC; ctx.font = 'bold 12px monospace';
        ctx.fillText('3A + 2A = 5A  ✓', nx, H - 18);
      } else {
        const pts = [[120, 200], [120, 90], [360, 90], [360, 200]];
        ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(...p) : ctx.lineTo(...p));
        ctx.closePath(); ctx.stroke();

        const elems = [
          { x: 70, y: 145, label: '+12V', col: '#ffab00' },
          { x: 240, y: 70, label: 'R1 -4V', col: '#ff6b35' },
          { x: 400, y: 145, label: 'R2 -5V', col: '#ff6b35' },
          { x: 240, y: 230, label: 'R3 -3V', col: '#ff6b35' },
        ];
        elems.forEach(e => {
          ctx.fillStyle = e.col; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
          ctx.fillText(e.label, e.x, e.y);
        });

        let a = 0;
        ctx.strokeStyle = `rgba(0,230,118,${0.4 + 0.3 * Math.sin(t * 3)})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const p1 = pts[i], p2 = pts[(i + 1) % 4];
          const frac = ((t * 0.5 + i * 0.25) % 1);
          const px = p1[0] + (p2[0] - p1[0]) * frac;
          const py = p1[1] + (p2[1] - p1[1]) * frac;
          if (i === 0) { ctx.beginPath(); ctx.moveTo(px, py); a = 1; }
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.fillStyle = ACC; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('+12 - 4 - 5 - 3 = 0  ✓ 沿回路电压代数和为零', W / 2, H - 18);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

export default function Kirchhoff() {
  const [law, setLaw] = useState('kcl');
  const lawRef = useRef(law);
  lawRef.current = law;

  const btn = (active) => ({
    padding: '9px 20px', borderRadius: 10, cursor: 'pointer',
    border: `1px solid ${active ? ACC : 'rgba(255,255,255,.12)'}`,
    background: active ? ACC + '22' : 'rgba(255,255,255,.04)',
    color: active ? ACC : 'rgba(255,255,255,.5)', font: '13px/1 inherit', fontWeight: 600,
  });

  return (
    <section id="kirchhoff" className="sec">
      <div className="sh">
        <span className="sh-icon">🔁</span>
        <div>
          <div className="sh-tag">KIRCHHOFF · KCL / KVL</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(0,230,118,.35)' }}>基尔霍夫定律</h2>
          <p className="sh-sub">节点电流守恒与回路电压守恒——分析复杂电路的两大基石</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.2)', flexDirection: 'column', gap: 14 }}>
          <KirchhoffCanvas lawRef={lawRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={btn(law === 'kcl')} onClick={() => setLaw('kcl')}>KCL 电流定律</button>
            <button style={btn(law === 'kvl')} onClick={() => setLaw('kvl')}>KVL 电压定律</button>
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>KCL（电流定律）</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>
              任一节点：流入电流之和 = 流出电流之和。电荷不会凭空消失。
            </div>
          </div>
          <div className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>KVL（电压定律）</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>
              任一闭合回路：沿回路电压升降代数和 = 0。能量守恒在电路中的体现。
            </div>
          </div>
          <div className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>读图步骤</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>
              ① 标节点 → ② 标回路方向 → ③ 列 KCL/KVL 方程 → ④ 联立求解未知量
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
