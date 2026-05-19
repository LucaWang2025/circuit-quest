import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import { useNav } from '../../NavContext';
import RelatedSections from '../RelatedSections';
import { IND_ACC, HUB_LINKS, IND_LEARNING_PATH, QUIZ_HUB } from '../../data/industrialData';

function HubCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return undefined;
    const W = 480, H = 200, ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    function draw() {
      ctx.clearRect(0, 0, W, H); t += 0.02;
      const cx = W / 2, cy = H / 2 + 10;
      [0, 1, 2].forEach(i => {
        const a = t * 2 + (i * 2 * Math.PI) / 3;
        const x = cx + Math.cos(a) * 70, y = cy + Math.sin(a) * 50;
        ctx.strokeStyle = ['#ff9800', '#ffc107', '#ff6b35'][i];
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#aab'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('三相向量 120° · 工业配电基础', W / 2, 24);
      raf = requestAnimationFrame(draw);
    }
    draw(); return () => cancelAnimationFrame(raf);
  }, []);
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

export default function Industrial() {
  const navigate = useNav();
  return (
    <section id="industrial" className="sec">
      <div className="sh">
        <span className="sh-icon">🏭</span>
        <div>
          <div className="sh-tag">Industrial · 三相与工业用电</div>
          <h2 className="sh-title" style={{ color: IND_ACC, textShadow: `0 0 35px ${IND_ACC}44` }}>三相与工业用电</h2>
          <p className="sh-sub">从 380V 三相四线到星三角接法、电机启动——与家用 220V 单相对照，建立工业现场用电直觉。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${IND_ACC},transparent)` }} />
      <div className="grid2" style={{ marginBottom: 28 }}>
        <div className="anim-box reveal" style={{ borderColor: `${IND_ACC}44`, flexDirection: 'column' }}>
          <HubCanvas />
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center' }}>对称三相：相位差 120°，可产生旋转磁场驱动电机。</p>
        </div>
        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${IND_ACC}33` }}>
            <div className="formula" style={{ color: IND_ACC }}>P = √3 · U_L · I_L · cosφ</div>
            <div className="fdesc">三相功率 · U_L 线电压 · I_L 线电流</div>
          </div>
          <ICard color={IND_ACC} title="📚 专题结构">4 个互动章 + 测验：三相基础、星三角、电机启动、家用对比。</ICard>
          <ICard color="var(--cyan)" title="🔌 与现有章节">衔接交直流、变压器、无刷电机、滑板车三电、家用电路。</ICard>
        </div>
      </div>
      <div className="glass reveal" style={{ maxWidth: 1100, margin: '0 auto 24px', padding: 18, borderColor: `${IND_ACC}44` }}>
        <h4 style={{ color: IND_ACC, font: '11px monospace', letterSpacing: 2, marginBottom: 12 }}>推荐路径</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {IND_LEARNING_PATH.map((s, i) => (
            <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" className="chip" onClick={() => navigate(s.id)}>{s.icon} {s.label}</button>
              {i < IND_LEARNING_PATH.length - 1 && <span style={{ color: 'var(--dim)' }}>→</span>}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18, maxWidth: 1100, margin: '0 auto 28px' }}>
        {HUB_LINKS.map(link => (
          <div key={link.id} className="glass reveal icard" role="button" tabIndex={0} onClick={() => navigate(link.id)}
            style={{ cursor: 'pointer', borderColor: `${link.color}44` }}>
            <span style={{ fontSize: 28 }}>{link.icon}</span>
            <div style={{ fontWeight: 700, margin: '8px 0' }}>{link.title}</div>
            <p style={{ fontSize: 13, color: '#aabfc8' }}>{link.desc}</p>
          </div>
        ))}
      </div>
      <Quiz questions={QUIZ_HUB} accentColor={IND_ACC} title="工业用电测验" />
      <RelatedSections sectionId="industrial" />
    </section>
  );
}
