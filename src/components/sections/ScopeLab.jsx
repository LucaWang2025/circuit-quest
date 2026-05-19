import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import { useNav } from '../../NavContext';
import RelatedSections from '../RelatedSections';
import {
  SCOPE_ACC, HUB_LINKS, SCOPE_LEARNING_PATH, QUIZ_HUB,
} from '../../data/scopeLabData';

function HubCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 200;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.04;
      const midY = H / 2 + 10;
      const x0 = 40, x1 = W - 40;

      ctx.fillStyle = 'rgba(0,229,255,.25)';
      ctx.beginPath(); ctx.roundRect(10, 10, W - 20, 22, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('示波器屏幕示意 · 时基 × 电压/格 · 触发同步', W / 2, 24);

      for (let gx = 0; gx <= 10; gx++) {
        const px = x0 + (gx / 10) * (x1 - x0);
        ctx.strokeStyle = gx % 5 === 0 ? 'rgba(0,229,255,.35)' : 'rgba(0,229,255,.12)';
        ctx.beginPath(); ctx.moveTo(px, 36); ctx.lineTo(px, H - 20); ctx.stroke();
      }
      for (let gy = 0; gy <= 6; gy++) {
        const py = 36 + (gy / 6) * (H - 56);
        ctx.strokeStyle = gy === 3 ? 'rgba(0,229,255,.4)' : 'rgba(0,229,255,.1)';
        ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x1, py); ctx.stroke();
      }

      ctx.strokeStyle = SCOPE_ACC; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= x1 - x0; x++) {
        const phase = (x / (x1 - x0)) * Math.PI * 4 + t;
        const y = midY + Math.sin(phase) * 42;
        x === 0 ? ctx.moveTo(x0 + x, y) : ctx.lineTo(x0 + x, y);
      }
      ctx.stroke();

      const trigX = x0 + ((t * 0.3) % 1) * (x1 - x0);
      ctx.strokeStyle = '#ffab00'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(trigX, 36); ctx.lineTo(trigX, H - 20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffab00'; ctx.font = '9px monospace'; ctx.fillText('T', trigX + 4, 50);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, display: 'block', marginBottom: 8 }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function ScopeLab() {
  const navigate = useNav();

  return (
    <section id="scope-lab" className="sec">
      <div className="sh">
        <span className="sh-icon">📊</span>
        <div>
          <div className="sh-tag">Scope Lab · 示波器实验室 · 入口</div>
          <h2 className="sh-title" style={{ color: SCOPE_ACC, textShadow: '0 0 35px rgba(0,229,255,.35)' }}>
            示波器实验室
          </h2>
          <p className="sh-sub">
            从波形识别到 Vpp / 周期 / 频率测量，再到 RC 充电曲线与触发稳定——用互动画布把示波器读屏变成工程师直觉。
            衔接「交直流」「电容电感」「示波器使用」章节。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${SCOPE_ACC},transparent)` }} />

      <div className="grid2" style={{ marginBottom: 36 }}>
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,229,255,.25)', flexDirection: 'column' }}>
          <HubCanvas />
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center', lineHeight: 1.6 }}>
            X 轴 = 时间（ms/div）· Y 轴 = 电压（V/div）· 触发 = 每次扫描从同一相位开始。
          </p>
        </div>
        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,229,255,.2)' }}>
            <div className="formula" style={{ color: SCOPE_ACC }}>f = 1/T · Vpp = Vmax − Vmin</div>
            <div className="fdesc">频率 · 峰峰值 · 时间常数 τ = RC</div>
          </div>
          <ICard color={SCOPE_ACC} title="📚 专题结构">
            <strong style={{ color: 'var(--white)' }}>4 个互动章节</strong>：波形基础、周期与幅值、RC/RL 响应、触发稳定。
          </ICard>
          <ICard color="#00e676" title="🔑 读屏要点">
            先选时基看清周期，再调 V/div 让波形占 4–6 格；AC 耦合看纹波，DC 耦合看充电曲线。
          </ICard>
          <ICard color="#ffab00" title="🔌 与电路章节">
            衔接交直流、功率、电容、电感、完整示波器操作章。
          </ICard>
        </div>
      </div>

      <div className="glass reveal" style={{ maxWidth: 1100, margin: '0 auto 28px', padding: '20px 24px', borderColor: 'rgba(0,229,255,.3)' }}>
        <h4 style={{ color: SCOPE_ACC, marginBottom: 14, font: '11px "Courier New",monospace', letterSpacing: 2 }}>推荐学习路径</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          {SCOPE_LEARNING_PATH.map((step, i) => (
            <span key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" className="chip" onClick={() => navigate(step.id)} style={{ borderColor: SCOPE_ACC }}>
                {step.icon} {step.label}
              </button>
              {i < SCOPE_LEARNING_PATH.length - 1 && <span style={{ color: 'var(--dim)' }}>→</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 18, maxWidth: 1100, margin: '0 auto 32px',
      }}>
        {HUB_LINKS.map(link => (
          <div key={link.id} className="glass reveal icard" role="button" tabIndex={0}
            onClick={() => navigate(link.id)} onKeyDown={e => { if (e.key === 'Enter') navigate(link.id); }}
            style={{ cursor: 'pointer', borderColor: `${link.color}44` }}>
            <span style={{ fontSize: 28 }}>{link.icon}</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '8px 0 2px' }}>{link.title}</div>
            <div style={{ font: '10px monospace', color: link.color, letterSpacing: 2, marginBottom: 8 }}>{link.en}</div>
            <p style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.6 }}>{link.desc}</p>
            <div style={{ marginTop: 12, font: '11px monospace', color: 'var(--cyan)' }}>进入章节 →</div>
          </div>
        ))}
      </div>

      <Quiz questions={QUIZ_HUB} accentColor={SCOPE_ACC} title="示波器实验室测验" />
      <RelatedSections sectionId="scope-lab" />
    </section>
  );
}
