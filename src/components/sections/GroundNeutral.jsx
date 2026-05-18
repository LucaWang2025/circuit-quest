import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ff1744';

function WiringCanvas({ scenarioRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    const COL = { L: '#ff5252', N: '#42a5f5', PE: '#00e676' };

    function drawWire(x1, y1, x2, y2, col, dash) {
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
      if (dash) ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
    }

    function draw() {
      const sc = scenarioRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const labels = { normal: '正常 · 电流经零线返回', leak: '漏电 · 电流经人体入地', open: '零线断 · 设备外壳带电' };
      ctx.fillStyle = sc === 'leak' ? 'rgba(255,23,68,.45)' : sc === 'open' ? 'rgba(255,152,0,.4)' : 'rgba(0,230,118,.35)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(labels[sc] || labels.normal, W / 2, 27);

      const sx = 70, sy = 100;
      drawWire(sx, sy, sx, 55, COL.L, false);
      drawWire(sx + 30, sy, sx + 30, 55, COL.N, false);
      drawWire(sx + 60, sy, sx + 60, 55, COL.PE, false);
      ctx.fillStyle = COL.L; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('L 火线', sx, 48);
      ctx.fillStyle = COL.N; ctx.fillText('N 零线', sx + 30, 48);
      ctx.fillStyle = COL.PE; ctx.fillText('PE 地线', sx + 60, 48);

      const loadX = 280, loadY = 130;
      ctx.fillStyle = '#3a4050'; ctx.strokeStyle = '#667'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(loadX - 40, loadY - 30, 80, 60, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '9px monospace';
      ctx.fillText('用电器', loadX, loadY + 5);

      drawWire(sx, sy, loadX - 40, loadY - 10, COL.L, false);
      drawWire(sx + 30, sy, loadX - 40, loadY + 15, COL.N, sc === 'open');
      drawWire(sx + 60, sy, loadX + 40, loadY + 25, COL.PE, false);

      const personX = 380, personY = 200;
      ctx.strokeStyle = '#889'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(personX, personY - 25, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(personX, personY - 13); ctx.lineTo(personX, personY + 25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(personX - 18, personY); ctx.lineTo(personX + 18, personY); ctx.stroke();

      if (sc === 'leak') {
        const alpha = 0.5 + 0.4 * Math.sin(t * 8);
        drawWire(loadX + 40, loadY + 25, personX, personY - 10, `rgba(255,23,68,${alpha})`, true);
        drawWire(personX, personY + 25, personX, 280, `rgba(255,23,68,${alpha})`, true);
        ctx.fillStyle = `rgba(255,23,68,${alpha})`;
        ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('⚡ 漏电电流经人体入地！', W / 2, H - 14);
      } else if (sc === 'open') {
        ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(sx + 30, sy); ctx.lineTo(loadX - 40, loadY + 15); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ff9800'; ctx.font = 'bold 11px monospace';
        ctx.fillText('零线断路 → 外壳可能带电', W / 2, H - 14);
      } else {
        ctx.fillStyle = 'rgba(0,230,118,.7)'; ctx.font = 'bold 11px monospace';
        ctx.fillText('电流：火线 → 负载 → 零线 → 变压器（安全）', W / 2, H - 14);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

export default function GroundNeutral() {
  const [scenario, setScenario] = useState('normal');
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;

  const btn = (active, col) => ({
    padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 12,
    border: `1px solid ${active ? col : 'rgba(255,255,255,.12)'}`,
    background: active ? col + '22' : 'rgba(255,255,255,.04)',
    color: active ? col : 'rgba(255,255,255,.5)', fontWeight: 600,
  });

  return (
    <section id="ground-neutral" className="sec">
      <div className="sh">
        <span className="sh-icon">🛡️</span>
        <div>
          <div className="sh-tag">L / N / PE · 接地与零线</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(255,23,68,.35)' }}>接地与零线</h2>
          <p className="sh-sub">分清火线、零线、地线的角色——安全用电与漏电保护的基础</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,23,68,.2)', flexDirection: 'column', gap: 14 }}>
          <WiringCanvas scenarioRef={scenarioRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={btn(scenario === 'normal', '#00e676')} onClick={() => setScenario('normal')}>✓ 正常</button>
            <button style={btn(scenario === 'leak', ACC)} onClick={() => setScenario('leak')}>⚡ 漏电</button>
            <button style={btn(scenario === 'open', '#ff9800')} onClick={() => setScenario('open')}>⚠ 零线断</button>
          </div>
        </div>

        <div className="info-stack reveal">
          {[
            { c: '#ff5252', t: 'L 火线', d: '对地约 220V 交流。万用表对地测应有电压。严禁当零线使用。' },
            { c: '#42a5f5', t: 'N 零线', d: '工作零线，与变压器中性点相连。正常时与地电位接近（<5V）。' },
            { c: '#00e676', t: 'PE 保护地线', d: '仅用于保护，不接负载。漏电时提供低阻通路，触发漏电保护器。' },
          ].map(x => (
            <div key={x.t} className="icard" style={{ borderLeftColor: x.c }}>
              <h4 style={{ color: x.c }}>{x.t}</h4>
              <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
