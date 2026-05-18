import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#9c7dff';

function CircuitCanvas({ modeRef, voltageRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function drawBulb(x, y, bright, label) {
      const glow = Math.max(0, Math.min(1, bright));
      if (glow > 0.05) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 28);
        g.addColorStop(0, `rgba(255,220,100,${glow * 0.7})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = `rgba(${180 + Math.round(75 * glow)},${160 + Math.round(60 * glow)},${80 + Math.round(40 * glow)},1)`;
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#889'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#aab'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 28);
    }

    function draw() {
      const series = modeRef.current === 'series';
      const V = voltageRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const modeLabel = series ? '串联 · 电流相同 · 电压分配' : '并联 · 电压相同 · 电流分配';
      ctx.fillStyle = 'rgba(156,125,255,.45)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
      ctx.fillText(modeLabel, W / 2, 27);

      const batX = 55, batY = 155;
      ctx.fillStyle = '#2a3040'; ctx.strokeStyle = '#556'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(batX - 25, batY - 35, 50, 70, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffab00'; ctx.fillRect(batX - 18, batY + 20, 36, 10);
      ctx.fillStyle = '#889'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${V}V`, batX, batY + 48);

      ctx.strokeStyle = `rgba(156,125,255,${0.5 + 0.3 * Math.sin(t * 4)})`;
      ctx.lineWidth = 2.5; ctx.lineCap = 'round';

      if (series) {
        const R1 = 100, R2 = 200, Rt = R1 + R2;
        const I = V / Rt;
        const V1 = I * R1, V2 = I * R2;
        const b1 = V1 / V, b2 = V2 / V;

        ctx.beginPath();
        ctx.moveTo(batX + 25, batY); ctx.lineTo(150, batY);
        ctx.lineTo(150, 95); ctx.lineTo(330, 95);
        ctx.lineTo(330, batY); ctx.lineTo(420, batY);
        ctx.lineTo(420, 240); ctx.lineTo(150, 240);
        ctx.lineTo(150, batY); ctx.stroke();

        drawBulb(240, 95, b1, `R1=100Ω · ${V1.toFixed(1)}V`);
        drawBulb(240, 240, b2, `R2=200Ω · ${V2.toFixed(1)}V`);

        ctx.fillStyle = ACC; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`I = ${(I * 1000).toFixed(1)} mA（相同）`, W / 2, H - 28);
        ctx.fillStyle = 'rgba(200,215,230,.6)'; ctx.font = '10px monospace';
        ctx.fillText('两灯较暗 · 电压按电阻比例分配', W / 2, H - 12);
      } else {
        const R1 = 100, R2 = 200;
        const I1 = V / R1, I2 = V / R2, It = I1 + I2;
        const b1 = Math.min(1, I1 / 0.15), b2 = Math.min(1, I2 / 0.15);

        ctx.beginPath();
        ctx.moveTo(batX + 25, batY);
        ctx.lineTo(130, batY); ctx.lineTo(130, 100);
        ctx.lineTo(350, 100); ctx.lineTo(350, batY); ctx.lineTo(420, batY);
        ctx.moveTo(130, 100); ctx.lineTo(130, 235);
        ctx.lineTo(350, 235); ctx.lineTo(350, 100);
        ctx.moveTo(130, batY); ctx.lineTo(130, 100);
        ctx.stroke();

        drawBulb(240, 100, b1, `R1=100Ω · 亮`);
        drawBulb(240, 235, b2 * 0.55, `R2=200Ω · 较暗`);

        ctx.fillStyle = ACC; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`I总 = ${(It * 1000).toFixed(1)} mA · I1+I2`, W / 2, H - 28);
        ctx.fillStyle = 'rgba(200,215,230,.6)'; ctx.font = '10px monospace';
        ctx.fillText('两灯均较亮 · 各支路电压均为电源电压', W / 2, H - 12);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [modeRef, voltageRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function SeriesParallel() {
  const [mode, setMode] = useState('series');
  const [voltage, setVoltage] = useState(12);
  const modeRef = useRef(mode);
  const voltageRef = useRef(voltage);
  useEffect(() => { modeRef.current = mode; voltageRef.current = voltage; });

  const btn = (active) => ({
    padding: '9px 20px', borderRadius: 10, cursor: 'pointer',
    border: `1px solid ${active ? ACC : 'rgba(255,255,255,.12)'}`,
    background: active ? ACC + '22' : 'rgba(255,255,255,.04)',
    color: active ? ACC : 'rgba(255,255,255,.5)', font: '13px/1 inherit', fontWeight: 600,
  });

  return (
    <section id="series-parallel" className="sec">
      <div className="sh">
        <span className="sh-icon">🔗</span>
        <div>
          <div className="sh-tag">SERIES & PARALLEL · 串并联</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(156,125,255,.38)' }}>串联与并联</h2>
          <p className="sh-sub">掌握电路的两种基本连接方式——所有家用布线都建立在这之上</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.2)', flexDirection: 'column', gap: 14 }}>
          <CircuitCanvas modeRef={modeRef} voltageRef={voltageRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={btn(mode === 'series')} onClick={() => setMode('series')}>🔗 串联</button>
            <button style={btn(mode === 'parallel')} onClick={() => setMode('parallel')}>⑂ 并联</button>
          </div>
          <div style={{ width: '100%', maxWidth: 320 }}>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>电源电压 {voltage} V</div>
            <input type="range" min={3} max={24} value={voltage} onChange={e => setVoltage(+e.target.value)}
              style={{ width: '100%', accentColor: ACC }} />
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(156,125,255,.14)' }}>
            <div className="formula" style={{ color: ACC }}>串联：R总 = R1 + R2</div>
            <div className="fdesc">并联：1/R总 = 1/R1 + 1/R2</div>
          </div>
          <ICard color={ACC} title="串联特点">
            电流处处相等；总电压 = 各元件电压之和；电阻越大分得电压越多。Christmas 灯串即串联。
          </ICard>
          <ICard color={ACC} title="并联特点">
            各支路电压相等；总电流 = 各支路电流之和。家用插座之间是并联。
          </ICard>
          <ICard color={ACC} title="维修记忆口诀">
            串联分压、并联分流。改线路时：插座必须并联，开关与灯通常串联。
          </ICard>
        </div>
      </div>
    </section>
  );
}
