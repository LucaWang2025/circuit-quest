import { useNav } from '../../NavContext';

const CARDS = [
  {
    id: 'solar-system',
    tag: '交互体验 · Interactive',
    tagColor: 'var(--gold)',
    title: '3D 太阳系深空探索',
    desc: '基于 WebGL（Three.js）的日心坐标系场景：公转动画、行星贴图、轨道示意与点击聚焦。已整合进电路探索，无需单独打开静态页。',
    cta: '进入 SOLARIS →',
    featured: true,
  },
  {
    tag: '天文单位 AU',
    tagColor: 'var(--blue)',
    title: '1 AU 是什么？',
    desc: '1 AU（天文单位）≈ 地球与太阳的平均距离，约 1.496×10⁸ km。描述太阳系内行星间距时常用 AU。',
  },
  {
    tag: '八大行星',
    tagColor: 'var(--purple)',
    title: '行星分类',
    desc: '水星、金星、地球、火星为类地行星；木星、土星为气态巨行星；天王星、海王星常称冰巨星。小行星带位于火星与木星轨道之间。',
  },
  {
    tag: '光年 ly',
    tagColor: 'var(--green)',
    title: '光年不是时间',
    desc: '光年是距离单位：光在真空中一年行经的路程，约 9.46×10¹² km。恒星际距离常用光年或秒差距（pc）。',
  },
  {
    tag: '结构速写',
    tagColor: 'var(--dim)',
    title: '太阳系由里向外',
    desc: '类地行星 → 小行星带 → 巨行星与环系 → 海王星外柯伊伯带、离散盘与奥尔特云。教学模型会压缩轨道比例以便观察。',
  },
];

export default function Cosmos() {
  const navigate = useNav();

  return (
    <section id="cosmos" className="sec">
      <div className="sh">
        <span className="sh-icon">🌌</span>
        <div className="sh-tag">Cosmos · 拓展专题</div>
        <h2 className="sh-title" style={{ color: '#9c7dff', textShadow: '0 0 35px rgba(156,125,255,.35)' }}>
          宇宙知识
        </h2>
        <p className="sh-sub">
          与电路基础并行的拓展专题：太阳系尺度、天文常用单位与结构概览。可在本站直接进入 3D 太阳系交互场景。
        </p>
        <div className="divider" style={{ background: 'linear-gradient(90deg,transparent,#9c7dff,transparent)' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 22,
        maxWidth: 1100,
        margin: '0 auto 48px',
      }}>
        {CARDS.map((card, i) => (
          <div
            key={card.id ?? card.title}
            className={`glass reveal ${card.featured ? 'icard' : ''}`}
            role={card.id ? 'button' : undefined}
            tabIndex={card.id ? 0 : undefined}
            onClick={card.id ? () => navigate(card.id) : undefined}
            onKeyDown={card.id ? (e) => { if (e.key === 'Enter') navigate(card.id); } : undefined}
            style={{
              cursor: card.id ? 'pointer' : 'default',
              borderColor: card.featured ? 'rgba(255,171,0,0.25)' : undefined,
            }}
          >
            <h4 style={{
              font: 'bold 11px "Courier New",monospace',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: card.tagColor,
              marginBottom: 10,
            }}>
              {card.tag}
            </h4>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{card.title}</div>
            <p style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{card.desc}</p>
            {card.cta && (
              <div style={{ marginTop: 14, font: '12px monospace', color: 'var(--cyan)' }}>{card.cta}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
