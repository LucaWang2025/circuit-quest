import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { SCOPE_ACC, QUIZ_MEASURE } from '../../data/scopeLabData';

const ACC = '#00e676';

function MeasureCanvas({ vppRef, periodRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const x0 = 50, x1 = W - 30, midY = H / 2;

    function draw() {
      const vpp = vppRef.current;
      const periodMs = periodRef.current;
      const amp = vpp / 2;
      const cycles = Math.max(1.5, 80 / periodMs);
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(0,230,118,.3)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      const f = (1000 / periodMs).toFixed(1);
      ctx.fillText(`Vpp=${vpp}V · T=${periodMs}ms · f=${f}Hz`, W / 2, 24);

      ctx.strokeStyle = 'rgba(0,230,118,.15)';
      for (let i = 0; i <= 10; i++) {
        const px = x0 + (i / 10) * (x1 - x0);
        ctx.beginPath(); ctx.moveTo(px, 44); ctx.lineTo(px, H - 40); ctx.stroke();
      }

      const yMax = midY - amp * 8;
      const yMin = midY + amp * 8;
      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= x1 - x0; x++) {
        const phase = (x / (x1 - x0)) * cycles * Math.PI * 2 + t * 0.15;
        const y = midY - Math.sin(phase) * amp * 8;
        x === 0 ? ctx.moveTo(x0 + x, y) : ctx.lineTo(x0 + x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#ff6b9d'; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(x0, yMax); ctx.lineTo(x1, yMax); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, yMin); ctx.lineTo(x1, yMin); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff6b9d'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
      ctx.fillText('Vmax', x1 - 36, yMax - 4);
      ctx.fillText('Vmin', x1 - 36, yMin + 12);

      const periodPx = (x1 - x0) / cycles;
      const t0 = x0 + ((t * 0.1) % 1) * periodPx;
      ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(t0, 44); ctx.lineTo(t0, H - 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(t0 + periodPx, 44); ctx.lineTo(t0 + periodPx, H - 40); ctx.stroke();
      ctx.fillStyle = '#ffd600'; ctx.fillText('T', t0 + periodPx / 2 - 4, H - 22);

      ctx.fillStyle = 'rgba(0,230,118,.15)'; ctx.strokeStyle = ACC;
      ctx.beginPath(); ctx.roundRect(12, H - 52, W - 24, 38, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`Vpp = ${vpp} V（峰峰值）`, 22, H - 32);
      ctx.fillText(`f = 1/T = ${f} Hz`, 22, H - 16);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [vppRef, periodRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function ScopeLabMeasure() {
  const navigate = useNav();
  const [vpp, setVpp] = useState(5);
  const [periodMs, setPeriodMs] = useState(20);
  const vppRef = useRef(vpp);
  const periodRef = useRef(periodMs);
  useEffect(() => { vppRef.current = vpp; });
  useEffect(() => { periodRef.current = periodMs; });

  const freq = 1000 / periodMs;
  const vrms = (vpp / (2 * Math.sqrt(2))).toFixed(2);

  return (
    <section id="scope-lab-measure" className="sec">
      <div className="sh">
        <span className="sh-icon">📏</span>
        <div>
          <div className="sh-tag">Scope Lab · 周期与幅值</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(0,230,118,.35)' }}>Vpp · 周期 · 频率</h2>
          <p className="sh-sub">在屏幕上标出峰峰值与相邻同相位点间距，换算周期 T 与频率 f=1/T。220 Vrms 市电对应 Vpp 约 622 V。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.25)', flexDirection: 'column', gap: 12 }}>
          <MeasureCanvas vppRef={vppRef} periodRef={periodRef} />
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            峰峰值 Vpp (V)
            <input type="range" min={0.5} max={12} step={0.5} value={vpp} onChange={e => setVpp(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
          </label>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            周期 T (ms)
            <input type="range" min={1} max={100} value={periodMs} onChange={e => setPeriodMs(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className="chip" onClick={() => { setPeriodMs(20); setVpp(5); }}>50 Hz 示例</button>
            <button type="button" className="chip" onClick={() => { setPeriodMs(1); setVpp(3.3); }}>1 kHz 示例</button>
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.25)' }}>
            <div className="formula" style={{ color: ACC }}>f = 1/T · Vrms ≈ Vpp / (2√2)</div>
            <div className="fdesc">正弦有效值换算</div>
          </div>
          <div className="glass" style={{ borderColor: `${ACC}44` }}>
            <p style={{ fontSize: 14, color: '#aabfc8', lineHeight: 1.8 }}>
              当前：<strong style={{ color: ACC }}>f = {freq.toFixed(1)} Hz</strong><br />
              Vrms ≈ <strong style={{ color: 'var(--white)' }}>{vrms} V</strong>（正弦假设）
            </p>
          </div>
          <ICard color={ACC} title="📐 读数步骤">
            垂直：数格 × V/div = 电压；水平：相邻同相位点格数 × ms/div = T。
          </ICard>
          <ICard color={SCOPE_ACC} title="📊 方波占空比">
            高电平时间 / 周期 × 100% = 占空比；PWM 调速与电源纹波分析常用。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('scope-lab-wave')}>→ 波形基础</button>
            <button type="button" className="chip" onClick={() => navigate('power')}>→ 功率</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_MEASURE} accentColor={ACC} title="测量读数测验" />
      <RelatedSections sectionId="scope-lab-measure" />
    </section>
  );
}
