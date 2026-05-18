import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ff6b35';
const MODES = [
  { id: 'voltage', label: '测电压', icon: '⚡', hint: '并联接入 · 红表笔→火线/正极' },
  { id: 'current', label: '测电流', icon: '〜', hint: '串联接入 · 红表笔→mA/A 孔' },
  { id: 'resistance', label: '测电阻', icon: 'Ω', hint: '断电测量 · 不能带电测阻值' },
  { id: 'continuity', label: '通断档', icon: '🔔', hint: '蜂鸣响=导通 · 查断线短路' },
  { id: 'diode', label: '二极管档', icon: '▷', hint: '红接正极 · 导通压降约 0.5~0.7V' },
];

function MeterCanvas({ modeRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const mode = modeRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;
      const m = MODES.find(x => x.id === mode) || MODES[0];

      ctx.fillStyle = 'rgba(255,107,53,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${m.icon} ${m.label} · ${m.hint}`, W / 2, 27);

      const mx = 140, my = 120;
      ctx.fillStyle = '#1e2430'; ctx.strokeStyle = '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(mx - 55, my - 40, 110, 130, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0a0e14';
      ctx.beginPath(); ctx.roundRect(mx - 42, my - 28, 84, 42, 6); ctx.fill();
      ctx.fillStyle = ACC; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center';
      const readings = {
        voltage: '220.5', current: '0.152', resistance: '4.70k', continuity: '0.00', diode: '0.652',
      };
      ctx.fillText(readings[mode] || '---', mx, my - 2);
      ctx.fillStyle = '#667'; ctx.font = '9px monospace';
      const units = { voltage: 'V AC', current: 'A', resistance: 'Ω', continuity: 'Ω', diode: 'V' };
      ctx.fillText(units[mode], mx, my + 12);

      const probeR = { x: mx + 90, y: my + 70 }, probeB = { x: mx + 90, y: my + 100 };
      ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(probeR.x, probeR.y); ctx.lineTo(320, 80); ctx.stroke();
      ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(probeB.x, probeB.y); ctx.lineTo(320, 200); ctx.stroke();
      ctx.fillStyle = '#ff5252'; ctx.beginPath(); ctx.arc(probeR.x, probeR.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(probeB.x, probeB.y, 5, 0, Math.PI * 2); ctx.fill();

      if (mode === 'continuity') {
        const beep = Math.sin(t * 20) > 0.7;
        ctx.fillStyle = beep ? '#00e676' : 'rgba(0,230,118,.2)';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(beep ? '🔔 蜂鸣 ON' : '···', mx, my + 55);
      }

      if (mode === 'voltage') {
        ctx.strokeStyle = `rgba(255,171,0,${0.5 + 0.3 * Math.sin(t * 5)})`;
        ctx.lineWidth = 2; ctx.beginPath();
        for (let x = 300; x < 420; x += 3) {
          const y = 140 + Math.sin((x + t * 40) * 0.08) * 12;
          x === 300 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(200,215,230,.55)'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('红表笔 COM 黑表笔 · 测量前确认档位与表笔孔位', W / 2, H - 12);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

export default function MmMeasure() {
  const [mode, setMode] = useState('voltage');
  const modeRef = useRef(mode);
  modeRef.current = mode;

  return (
    <section id="mm-measure" className="sec">
      <SecHead icon="📟" title="万用表 5 大测量" tag="MULTIMETER · 5 MODES" sub="电压/电流/电阻/通断/二极管——维修现场标准操作流程" color={ACC} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,.2)', flexDirection: 'column', gap: 12 }}>
          <MeterCanvas modeRef={modeRef} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                border: `1px solid ${mode === m.id ? ACC : 'rgba(255,255,255,.12)'}`,
                background: mode === m.id ? ACC + '22' : 'rgba(255,255,255,.04)',
                color: mode === m.id ? ACC : 'rgba(255,255,255,.5)', fontWeight: 600,
              }}>{m.icon} {m.label}</button>
            ))}
          </div>
        </div>
        <div className="info-stack reveal">
          {MODES.map(m => (
            <div key={m.id} className="icard" style={{ borderLeftColor: mode === m.id ? ACC : 'rgba(255,255,255,.15)' }}>
              <h4 style={{ color: mode === m.id ? ACC : '#889' }}>{m.icon} {m.label}</h4>
              <div style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.6 }}>{m.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecHead({ icon, title, tag, sub, color }) {
  return (
    <>
      <div className="sh">
        <span className="sh-icon">{icon}</span>
        <div>
          <div className="sh-tag">{tag}</div>
          <h2 className="sh-title" style={{ color, textShadow: `0 0 35px ${color}55` }}>{title}</h2>
          <p className="sh-sub">{sub}</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
    </>
  );
}
