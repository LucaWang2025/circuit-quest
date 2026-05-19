import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import { useNav } from '../../NavContext';
import RelatedSections from '../RelatedSections';
import { EV_ACC, HUB_LINKS, EV_LEARNING_PATH, QUIZ_HUB } from '../../data/evchainData';

function HubCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 200;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const nodes = [
      { x: 55, label: '电网', col: '#ffab00' },
      { x: 155, label: '桩', col: EV_ACC },
      { x: 280, label: 'OBC/DC', col: '#00bcd4' },
      { x: 410, label: '电池', col: '#00c853' },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;
      ctx.fillStyle = `${EV_ACC}33`;
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 8); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('完整充电链路 · AC 慢充 vs DC 快充 · BMS 全程监护', W / 2, 24);

      nodes.forEach((n, i) => {
        ctx.fillStyle = `${n.col}22`;
        ctx.strokeStyle = `${n.col}88`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(n.x - 36, 70, 72, 56, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = n.col; ctx.font = 'bold 10px monospace';
        ctx.fillText(n.label, n.x, 104);
        if (i < nodes.length - 1) {
          const nx = nodes[i + 1].x;
          ctx.strokeStyle = `${EV_ACC}55`; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(n.x + 36, 98); ctx.lineTo(nx - 36, 98); ctx.stroke();
          ctx.setLineDash([]);
          const frac = ((t * 0.7 + i * 0.22) % 1);
          const px = n.x + 36 + frac * (nx - n.x - 72);
          ctx.fillStyle = EV_ACC;
          ctx.beginPath(); ctx.arc(px, 98, 4, 0, Math.PI * 2); ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
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

export default function Evchain() {
  const navigate = useNav();
  return (
    <section id="evchain" className="sec">
      <div className="sh">
        <span className="sh-icon">🔋</span>
        <div>
          <div className="sh-tag">EV Chain · 完整充电链路</div>
          <h2 className="sh-title" style={{ color: EV_ACC, textShadow: `0 0 35px ${EV_ACC}44` }}>电动汽车充电链路</h2>
          <p className="sh-sub">从家用交流慢充到直流超充，从 CP/PP 导引到 BMS 恒流恒压——把「插枪→握手→充电→截止」串成一条可交互的电路故事。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${EV_ACC},transparent)` }} />

      <div className="grid2" style={{ marginBottom: 28 }}>
        <div className="anim-box reveal" style={{ borderColor: `${EV_ACC}44`, flexDirection: 'column' }}>
          <HubCanvas />
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center' }}>能量形态在桩内/车内多次变换，BMS 始终是高压侧的最终裁判。</p>
        </div>
        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${EV_ACC}33` }}>
            <div className="formula" style={{ color: EV_ACC }}>P = U × I · SOC taper</div>
            <div className="fdesc">充电功率 · 高压平台 · 末段降流保护</div>
          </div>
          <ICard color={EV_ACC} title="📚 专题结构">4 个互动章 + 测验：交流慢充、直流快充、BMS 状态机、线缆与协议。</ICard>
          <ICard color="var(--cyan)" title="🔌 与现有章节">衔接充电桩、快充协议、锂电池、汽车三电、家用电路与安全用电。</ICard>
        </div>
      </div>

      <div className="glass reveal" style={{ maxWidth: 1100, margin: '0 auto 24px', padding: 18, borderColor: `${EV_ACC}44` }}>
        <h4 style={{ color: EV_ACC, font: '11px monospace', letterSpacing: 2, marginBottom: 12 }}>推荐路径</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {EV_LEARNING_PATH.map((s, i) => (
            <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" className="chip" onClick={() => navigate(s.id)}>{s.icon} {s.label}</button>
              {i < EV_LEARNING_PATH.length - 1 && <span style={{ color: 'var(--dim)' }}>→</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18, maxWidth: 1100, margin: '0 auto 28px' }}>
        {HUB_LINKS.map(link => (
          <div key={link.id} className="glass reveal icard" role="button" tabIndex={0} onClick={() => navigate(link.id)}
            onKeyDown={e => e.key === 'Enter' && navigate(link.id)}
            style={{ cursor: 'pointer', borderColor: `${link.color}44` }}>
            <span style={{ fontSize: 28 }}>{link.icon}</span>
            <div style={{ fontWeight: 700, margin: '8px 0' }}>{link.title} <span style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'monospace' }}>{link.en}</span></div>
            <p style={{ fontSize: 13, color: '#aabfc8' }}>{link.desc}</p>
          </div>
        ))}
      </div>

      <Quiz questions={QUIZ_HUB} accentColor={EV_ACC} title="充电链路测验" />
      <RelatedSections sectionId="evchain" />
    </section>
  );
}
