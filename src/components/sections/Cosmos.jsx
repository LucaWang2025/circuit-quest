import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import { themeCanvasColors } from '../../utils/themeColors';
import Quiz from '../Quiz';
import { useNav } from '../../NavContext';
import RelatedSections from '../RelatedSections';
import {
  COSMOS_ACC, QUIZ_COSMOS, AU_KM, LY_KM, SOLAR_CONSTANT,
  COSMOS_LEARNING_PATH,
} from '../../data/cosmosData';

const HUB_LINKS = [
  { id: 'cosmos-scale', icon: '📏', title: '天文尺度', en: 'SCALE', color: '#00bcd4', desc: 'AU / 光年 / 光分 · 对数距离尺 · 火星通信延迟' },
  { id: 'cosmos-planets', icon: '🪐', title: '行星图鉴', en: 'PLANETS', color: '#ffc850', desc: '八大行星参数 · 工程师视角 · 公转示意' },
  { id: 'cosmos-structure', icon: '💫', title: '太阳系结构', en: 'STRUCTURE', color: '#7c4dff', desc: '小行星带 → 柯伊伯带 → 奥尔特云剖面' },
  { id: 'cosmos-energy', icon: '🔗', title: '能源链', en: 'ENERGY', color: '#ffd600', desc: '聚变 → 辐射 → 光伏 → 逆变 → 电网 → 负载' },
  { id: 'cosmos-power-budget', icon: '🔋', title: '深空供电', en: 'POWER', color: '#00e676', desc: '功耗预算 · SOC · RTG · 任务预设' },
  { id: 'cosmos-habitable', icon: '🌍', title: '宜居带', en: 'HABITABLE', color: '#00e676', desc: '恒星类型 · 金星/地球/火星案例' },
  { id: 'cosmos-gravity', icon: '🕳️', title: '引力井', en: 'GRAVITY', color: '#9c7dff', desc: '逃逸速度 · 多级火箭 · 引力弹弓' },
  { id: 'cosmos-mission', icon: '🛰️', title: '任务台', en: 'MISSION', color: '#6eb5ff', desc: '慢回路遥控 · 光延迟 · Δv · 储能' },
  { id: 'cosmos-space-weather', icon: '🌩️', title: '空间天气', en: 'STORM', color: '#ff6b35', desc: '地磁暴 · 感应电流 · 防雷接地' },
  { id: 'solar-system', icon: '🛸', title: '3D 深空', en: 'SOLARIS', color: '#ff6b9d', desc: 'WebGL · 对比模式 · 光速雷达' },
];

function HubOrbitCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 220;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const orbits = [
      { au: 0.39, c: '#9ca3af', spd: 4.2 }, { au: 0.72, c: '#e8cda0', spd: 1.6 },
      { au: 1, c: '#4a9eff', spd: 1 }, { au: 1.52, c: '#c1440e', spd: 0.53 },
      { au: 5.2, c: '#d4a574', spd: 0.084 },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;
      const cx = 90, cy = H / 2;

      ctx.fillStyle = 'rgba(156,125,255,.2)';
      ctx.beginPath(); ctx.roundRect(10, 10, W - 20, 24, 6); ctx.fill();
      ctx.fillStyle = themeCanvasColors().label; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('内太阳系公转示意 · 开普勒第三定律 T²∝a³', W / 2, 26);

      ctx.fillStyle = '#ffc850'; ctx.shadowColor = '#ffc850'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      orbits.forEach((o, i) => {
        const r = 30 + Math.log10(o.au + 0.5) * 45;
        ctx.strokeStyle = `rgba(110,181,255,${0.1 + i * 0.02})`;
        ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
        const ang = t * o.spd * 0.15 + i;
        ctx.fillStyle = o.c;
        ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.4, 3 + i * 0.4, 0, Math.PI * 2); ctx.fill();
      });

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
      <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function Cosmos() {
  const navigate = useNav();

  return (
    <section id="cosmos" className="sec">
      <div className="sh">
        <span className="sh-icon">🌌</span>
        <div>
          <div className="sh-tag">Cosmos · 拓展专题 · 入口</div>
          <h2 className="sh-title" style={{ color: COSMOS_ACC, textShadow: '0 0 35px rgba(156,125,255,.35)' }}>
            宇宙知识
          </h2>
          <p className="sh-sub">
            与「电压、功率、光伏、储能、防雷」并行的天文拓展：10 个深度互动章节 + 全屏 3D 太阳系。
            从 AU 到深空任务预算，把宇宙尺度变成工程师能用的数字与直觉。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${COSMOS_ACC},transparent)` }} />

      <div className="grid2" style={{ marginBottom: 36 }}>
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.25)', flexDirection: 'column' }}>
          <HubOrbitCanvas />
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center', lineHeight: 1.6 }}>
            太阳占太阳系质量 99.86%，是地球上一切电能的终极来源（除核电与地热）。
          </p>
        </div>
        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(156,125,255,.2)' }}>
            <div className="formula" style={{ color: COSMOS_ACC }}>1 AU ≈ 1.50×10⁸ km</div>
            <div className="fdesc">光年 · 光分 · 通信延迟 · 功率预算</div>
          </div>
          <ICard color={COSMOS_ACC} title="📚 专题结构">
            <strong style={{ color: 'var(--white)' }}>10 个互动章节</strong> + SOLARIS 3D：尺度、行星、结构、能源链、供电、宜居带、引力、任务台、空间天气。
          </ICard>
          <ICard color="var(--cyan)" title="🔑 关键数字">
            1 ly ≈ {(LY_KM / 1e12).toFixed(2)}×10¹² km · 光到地球 ≈ <strong style={{ color: COSMOS_ACC }}>8.3 分钟</strong> · 太阳常数 {SOLAR_CONSTANT} W/m²
          </ICard>
          <ICard color="#ffd600" title="🔌 与电路章节的桥梁">
            太阳 → 光伏 → 逆变 → 电网 → 家庭；深空 → 功耗/储能/RTG；磁暴 → 防雷/接地/SPD。
          </ICard>
        </div>
      </div>

      <div className="glass reveal" style={{ maxWidth: 1100, margin: '0 auto 28px', padding: '20px 24px', borderColor: 'rgba(156,125,255,.3)' }}>
        <h4 style={{ color: COSMOS_ACC, marginBottom: 14, font: '11px "Courier New",monospace', letterSpacing: 2 }}>推荐学习路径 · CIRCUIT → COSMOS</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          {COSMOS_LEARNING_PATH.map((step, i) => (
            <span key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" className="chip" onClick={() => navigate(step.id)} style={{ borderColor: COSMOS_ACC }} title={step.desc}>
                {step.icon} {step.label}
              </button>
              {i < COSMOS_LEARNING_PATH.length - 1 && <span style={{ color: 'var(--dim)' }}>→</span>}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center', lineHeight: 1.7 }}>
          建议先掌握电压/功率/光伏基础，再进入天文尺度与行星图鉴，最后做任务预算与 3D 探索。
        </p>
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
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{link.desc}</p>
            <div style={{ marginTop: 12, font: '11px monospace', color: 'var(--cyan)' }}>进入章节 →</div>
          </div>
        ))}
      </div>

      <Quiz questions={QUIZ_COSMOS} accentColor={COSMOS_ACC} title="宇宙常识测验" />
      <RelatedSections sectionId="cosmos" />
    </section>
  );
}
