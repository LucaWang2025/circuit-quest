import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { SCOPE_ACC, QUIZ_TRIGGER } from '../../data/scopeLabData';

const ACC = '#9c7dff';

function TriggerCanvas({ stableRef, levelRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const x0 = 36, x1 = W - 24, midY = H / 2 + 5;

    function draw() {
      const stable = stableRef.current;
      const level = levelRef.current;
      ctx.clearRect(0, 0, W, H);
      t += stable ? 0.02 : 0.07;

      ctx.fillStyle = 'rgba(156,125,255,.35)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(stable ? '边沿触发 ON · 波形冻结同步' : '触发 OFF · 波形滚动漂移', W / 2, 24);

      for (let i = 0; i <= 10; i++) {
        const px = x0 + (i / 10) * (x1 - x0);
        ctx.strokeStyle = 'rgba(156,125,255,.12)';
        ctx.beginPath(); ctx.moveTo(px, 40); ctx.lineTo(px, H - 36); ctx.stroke();
      }

      const phaseOffset = stable ? 0 : t * 1.2;
      const levelY = midY - level * 40;
      ctx.strokeStyle = '#ffab00'; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(x0, levelY); ctx.lineTo(x1, levelY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffab00'; ctx.font = '9px monospace'; ctx.fillText('触发电平', x1 - 52, levelY - 6);

      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= x1 - x0; x++) {
        const phase = (x / (x1 - x0)) * Math.PI * 4 + phaseOffset;
        const y = midY + Math.sin(phase) * 50;
        x === 0 ? ctx.moveTo(x0 + x, y) : ctx.lineTo(x0 + x, y);
      }
      ctx.stroke();

      if (stable) {
        const trigX = x0 + (x1 - x0) * 0.15;
        ctx.strokeStyle = '#ef5350'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(trigX, 40); ctx.lineTo(trigX, H - 36); ctx.stroke();
        ctx.fillStyle = '#ef5350'; ctx.fillText('↑ 触发点', trigX + 4, 52);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stableRef, levelRef]);

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

export default function ScopeLabTrigger() {
  const navigate = useNav();
  const [stable, setStable] = useState(true);
  const [level, setLevel] = useState(0.3);
  const stableRef = useRef(stable);
  const levelRef = useRef(level);
  useEffect(() => { stableRef.current = stable; });
  useEffect(() => { levelRef.current = level; });

  return (
    <section id="scope-lab-trigger" className="sec">
      <div className="sh">
        <span className="sh-icon">🎯</span>
        <div>
          <div className="sh-tag">Scope Lab · 触发稳定</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(156,125,255,.35)' }}>边沿触发与波形冻结</h2>
          <p className="sh-sub">未触发时扫描起点随机，波形左右漂移；上升沿触发在信号越过触发电平时同步扫描，画面稳定便于测量与截图。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.25)', flexDirection: 'column', gap: 12 }}>
          <TriggerCanvas stableRef={stableRef} levelRef={levelRef} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="chip" style={{ borderColor: stable ? ACC : undefined }} onClick={() => setStable(true)}>✓ 触发 ON</button>
            <button type="button" className="chip" style={{ borderColor: !stable ? '#ef5350' : undefined }} onClick={() => setStable(false)}>✗ 触发 OFF</button>
          </div>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            触发电平（相对幅度）
            <input type="range" min={-0.8} max={0.8} step={0.1} value={level} onChange={e => setLevel(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
          </label>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(156,125,255,.25)' }}>
            <div className="formula" style={{ color: ACC }}>上升沿 / 下降沿 / 单次</div>
            <div className="fdesc">捕获毛刺用单次触发 + 预触发</div>
          </div>
          <ICard color={ACC} title="🎯 电平过高">
            信号始终达不到触发电平 → 屏幕无波形或闪烁。应在信号摆幅内设置。
          </ICard>
          <ICard color={SCOPE_ACC} title="📡 双通道">
            两路信号对比相位、时序（如时钟与数据、PWM 与电流）。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('oscilloscope')}>→ 示波器使用</button>
            <button type="button" className="chip" onClick={() => navigate('scope-lab-wave')}>→ 波形基础</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_TRIGGER} accentColor={ACC} title="触发稳定测验" />
      <RelatedSections sectionId="scope-lab-trigger" />
    </section>
  );
}
