import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { COSMOS_ACC, PLANET_DETAILS, QUIZ_PLANETS } from '../../data/cosmosData';

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'terrestrial', label: '类地行星', filter: p => p.type === '类地行星' },
  { id: 'giant', label: '巨行星', filter: p => p.type.includes('巨') },
];

function PlanetCompareCanvas({ selectedRef, categoryRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const maxR = Math.max(...PLANET_DETAILS.map(p => p.radiusKm));

    function draw() {
      const sel = selectedRef.current;
      const cat = categoryRef.current;
      const list = cat === 'all' ? PLANET_DETAILS : PLANET_DETAILS.filter(CATEGORIES.find(c => c.id === cat)?.filter || (() => true));
      ctx.clearRect(0, 0, W, H);
      t += 0.018;

      ctx.fillStyle = 'rgba(156,125,255,.3)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      const p = PLANET_DETAILS.find(x => x.id === sel) || PLANET_DETAILS[2];
      ctx.fillText(`${p.name} · ${p.type} · 半径 ${p.radiusKm.toLocaleString()} km · ${p.au} AU`, W / 2, 24);

      const sunX = 55, cy = 175;
      ctx.fillStyle = '#ffc850'; ctx.shadowColor = '#ffc850'; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(sunX, cy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      const gap = Math.min(42, (W - 120) / Math.max(list.length, 1));
      const startX = 100;
      list.forEach((pl, i) => {
        const r = 5 + (pl.radiusKm / maxR) * 24;
        const x = startX + i * gap;
        const isSel = pl.id === sel;
        if (isSel) {
          ctx.strokeStyle = COSMOS_ACC; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.arc(x, cy, r + 10 + Math.sin(t * 3) * 2, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = pl.color;
        ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = isSel ? '#fff' : '#7a9ab8';
        ctx.font = `${isSel ? 9 : 7}px monospace`; ctx.textAlign = 'center';
        ctx.fillText(pl.name, x, cy + r + 14);
      });

      const orbitR = 50 + (p.au / 30) * 130;
      ctx.strokeStyle = `rgba(110,181,255,${0.12 + 0.08 * Math.sin(t * 2)})`;
      ctx.beginPath(); ctx.ellipse(sunX, cy, orbitR, orbitR * 0.32, 0, 0, Math.PI * 2); ctx.stroke();
      const ang = t * 0.35 / Math.sqrt(p.au);
      const px = sunX + Math.cos(ang) * orbitR;
      const py = cy + Math.sin(ang) * orbitR * 0.32;
      const pr = 6 + (p.radiusKm / maxR) * 16;
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a8c8e8'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`公转示意 · 开普勒第三定律 T²∝a³`, 12, H - 14);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [selectedRef, categoryRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function CosmosPlanets() {
  const navigate = useNav();
  const [selected, setSelected] = useState('earth');
  const [category, setCategory] = useState('all');
  const selectedRef = useRef(selected);
  const categoryRef = useRef(category);
  useEffect(() => { selectedRef.current = selected; });
  useEffect(() => { categoryRef.current = category; });

  const planet = PLANET_DETAILS.find(p => p.id === selected) || PLANET_DETAILS[2];
  const filtered = category === 'all' ? PLANET_DETAILS : PLANET_DETAILS.filter(CATEGORIES.find(c => c.id === category)?.filter || (() => true));

  return (
    <section id="cosmos-planets" className="sec">
      <div className="sh">
        <span className="sh-icon">🪐</span>
        <div>
          <div className="sh-tag">Cosmos · Chapter 03 · 行星图鉴</div>
          <h2 className="sh-title" style={{ color: COSMOS_ACC, textShadow: '0 0 35px rgba(156,125,255,.35)' }}>八大行星图鉴</h2>
          <p className="sh-sub">点击行星对比相对大小、轨道与物理参数。每颗行星附带「电力工程师视角」——把天文现象与光伏、深空供电、通信延迟联系起来。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${COSMOS_ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.25)', flexDirection: 'column', gap: 12 }}>
          <PlanetCompareCanvas selectedRef={selectedRef} categoryRef={categoryRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} type="button" className="chip" style={{ borderColor: category === c.id ? COSMOS_ACC : undefined }} onClick={() => setCategory(c.id)}>{c.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {filtered.map(p => (
              <button key={p.id} type="button" className="chip" style={{ borderColor: selected === p.id ? p.color : undefined, background: selected === p.id ? `${p.color}22` : undefined }} onClick={() => setSelected(p.id)}>{p.name}</button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${planet.color}44` }}>
            <h3 style={{ fontSize: '1.35rem', color: planet.color, marginBottom: 4 }}>{planet.name}</h3>
            <div style={{ font: '11px monospace', color: 'var(--dim)', marginBottom: 12 }}>{planet.en} · {planet.type} · 密度 {planet.density}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 12 }}>
              {[['距太阳', `${planet.au} AU`], ['半径', `${planet.radiusKm.toLocaleString()} km`], ['质量', `≈ ${planet.massEarth} M⊕`], ['公转', planet.year], ['自转', planet.day], ['卫星', `${planet.moons}`], ['温度', planet.temp]].map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(255,255,255,.04)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--dim)' }}>{k}</div>
                  <strong style={{ color: 'var(--white)' }}>{v}</strong>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{planet.fact}</p>
          </div>
          <ICard color={planet.color} title="⚡ 工程师视角">{planet.engineer}</ICard>
          <ICard color="var(--cyan)" title="🔌 与电路的关联">{planet.circuit}</ICard>
          <button type="button" className="glass icard reveal" style={{ borderColor: 'rgba(255,200,80,.3)', cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={() => navigate('solar-system')}>
            <div style={{ font: '10px monospace', color: 'var(--gold)', letterSpacing: 1.5, marginBottom: 6 }}>3D 交互 · SOLARIS</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>进入 WebGL 深空探索 →</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>飞行靠近、对比模式、光速雷达、电力工程师提示。</p>
          </button>
        </div>
      </div>

      <div className="glass reveal" style={{ maxWidth: 980, margin: '24px auto 0', padding: '16px 20px', borderColor: 'rgba(156,125,255,.2)' }}>
        <h4 style={{ color: COSMOS_ACC, marginBottom: 10 }}>行星分类速览</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <div><strong style={{ color: '#4a9eff' }}>类地行星</strong>：岩石表面，水星–火星。地球唯一宜居；金星温室失控；火星弱光弱大气。</div>
          <div><strong style={{ color: '#d4a574' }}>气态巨行星</strong>：木星、土星。无固态表面，强辐射带，太阳能+RTG 混合供电。</div>
          <div><strong style={{ color: '#7de3f4' }}>冰巨星</strong>：天王星、海王星。低温弱光，探测器依赖 RTG。</div>
        </div>
      </div>

      <Quiz questions={QUIZ_PLANETS} title="行星知识测验" accentColor={COSMOS_ACC} />
      <RelatedSections sectionId="cosmos-planets" />
    </section>
  );
}
