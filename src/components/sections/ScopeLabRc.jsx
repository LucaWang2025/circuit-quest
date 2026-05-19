import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { SCOPE_ACC, QUIZ_RC } from '../../data/scopeLabData';

const ACC = '#ffab00';

function RcCanvas({ tauRef, runningRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const x0 = 40, x1 = W - 24, yBase = H - 50, yTop = 55;

    function draw() {
      const tau = tauRef.current;
      const running = runningRef.current;
      ctx.clearRect(0, 0, W, H);
      if (running) t += 0.016;
      const progress = running ? Math.min(t / (tau * 0.001 * 5), 1) : 1;
      const tMs = progress * tau * 5;

      ctx.fillStyle = 'rgba(255,171,0,.3)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`RC 充电 · τ=${tau} ms · t=${tMs.toFixed(1)} ms · V≈${((1 - Math.exp(-tMs / tau)) * 100).toFixed(0)}%`, W / 2, 24);

      ctx.strokeStyle = 'rgba(255,171,0,.12)';
      for (let i = 0; i <= 8; i++) {
        const px = x0 + (i / 8) * (x1 - x0);
        ctx.beginPath(); ctx.moveTo(px, yTop); ctx.lineTo(px, yBase); ctx.stroke();
      }

      const v63x = x0 + (x1 - x0) * (tau / (tau * 5));
      ctx.strokeStyle = 'rgba(255,107,157,.5)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(v63x, yTop); ctx.lineTo(v63x, yBase); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff6b9d'; ctx.font = '9px monospace'; ctx.fillText('1τ (63%)', v63x - 20, yTop - 6);

      ctx.strokeStyle = ACC; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= x1 - x0; x++) {
        const tm = (x / (x1 - x0)) * tau * 5;
        const v = 1 - Math.exp(-tm / tau);
        const py = yBase - v * (yBase - yTop);
        x === 0 ? ctx.moveTo(x0 + x, py) : ctx.lineTo(x0 + x, py);
      }
      ctx.stroke();

      if (running && progress < 1) {
        const vx = x0 + (tMs / (tau * 5)) * (x1 - x0);
        const vy = yBase - (1 - Math.exp(-tMs / tau)) * (yBase - yTop);
        ctx.fillStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(vx, vy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [tauRef, runningRef]);

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

export default function ScopeLabRc() {
  const navigate = useNav();
  const [tau, setTau] = useState(10);
  const [running, setRunning] = useState(true);
  const tauRef = useRef(tau);
  const runningRef = useRef(running);
  useEffect(() => { tauRef.current = tau; });
  useEffect(() => { runningRef.current = running; });

  const r = 10;
  const c = tau / r;

  return (
    <section id="scope-lab-rc" className="sec">
      <div className="sh">
        <span className="sh-icon">⚙️</span>
        <div>
          <div className="sh-tag">Scope Lab · RC/RL 响应</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(255,171,0,.35)' }}>RC 充电曲线</h2>
          <p className="sh-sub">电容通过电阻充电：V(t)=V₀(1−e^(−t/τ))，τ=RC。示波器用 DC 耦合 + ms 时基观察指数上升；滤波与软启动同源。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,171,0,.25)', flexDirection: 'column', gap: 12 }}>
          <RcCanvas tauRef={tauRef} runningRef={runningRef} />
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            时间常数 τ (ms) — 示意 R={r} kΩ, C={c.toFixed(1)} µF
            <input type="range" min={2} max={50} value={tau} onChange={e => setTau(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button type="button" className="chip" style={{ borderColor: running ? ACC : undefined }} onClick={() => setRunning(r => !r)}>
              {running ? '⏸ 暂停' : '▶ 重新充电'}
            </button>
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,171,0,.25)' }}>
            <div className="formula" style={{ color: ACC }}>τ = R × C · V(τ) ≈ 63% V₀</div>
            <div className="fdesc">5τ 约 99% 稳态</div>
          </div>
          <ICard color={ACC} title="🔋 电容滤波">
            整流后并联电容储能，纹波频率越高所需电容越小——与示波器纹波测量衔接。
          </ICard>
          <ICard color={SCOPE_ACC} title="🌀 RL 对比">
            电感阻碍电流<strong>变化</strong>；电流不能突变，与电容电压不能突变对偶。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('capacitor')}>→ 电容</button>
            <button type="button" className="chip" onClick={() => navigate('inductor')}>→ 电感</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_RC} accentColor={ACC} title="RC/RL 测验" />
      <RelatedSections sectionId="scope-lab-rc" />
    </section>
  );
}
