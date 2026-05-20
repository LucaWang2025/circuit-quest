import { useEffect, useRef, useState, useMemo } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { COSMOS_ACC, STAR_TYPES, HABITABLE_CASES, QUIZ_HABITABLE } from '../../data/cosmosData';

const ACC = '#00e676';

function HabitableCanvas({ starRef, distRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const star = starRef.current;
      const dist = distRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      const cx = 75, cy = 150;
      const pulse = 26 + star.lum * 5 + Math.sin(t * 2) * 3;
      ctx.fillStyle = star.color;
      ctx.shadowColor = star.color;
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#aab';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(star.label, cx, cy + pulse + 16);

      const scale = 58;
      const inner = cx + star.hzInner * scale;
      const outer = cx + star.hzOuter * scale;
      const probe = cx + dist * scale;

      ctx.fillStyle = 'rgba(0,230,118,.14)';
      ctx.fillRect(inner, 50, outer - inner, H - 100);
      ctx.strokeStyle = 'rgba(0,230,118,.45)';
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(inner, 50, outer - inner, H - 100);
      ctx.setLineDash([]);
      ctx.fillStyle = ACC;
      ctx.font = '9px monospace';
      ctx.fillText('宜居带', (inner + outer) / 2 - 18, 42);

      HABITABLE_CASES.forEach((c, i) => {
        const px = cx + c.dist * scale;
        ctx.fillStyle = c.verdict === '宜居' ? '#4a9eff' : c.verdict === '过热' ? '#ff6b35' : '#6eb5ff';
        ctx.beginPath();
        ctx.arc(px, cy + 55 + i * 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#889';
        ctx.font = '7px monospace';
        ctx.fillText(c.name, px, cy + 68);
      });

      const flux = star.lum / (dist * dist);
      let status = '过冷';
      let col = '#6eb5ff';
      if (flux > 1.2) { status = '过热'; col = '#ff6b35'; }
      else if (flux >= 0.7 && flux <= 1.2) { status = '可能宜居'; col = ACC; }

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(probe, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx + pulse + 5, cy);
      ctx.lineTo(probe - 12, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.beginPath();
      ctx.roundRect(12, H - 48, W - 24, 36, 8);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`轨道 ${dist.toFixed(2)} AU · 辐射通量 ${flux.toFixed(2)} · ${status}`, W / 2, H - 26);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [starRef, distRef]);

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

export default function CosmosHabitable() {
  const [starId, setStarId] = useState('g');
  const [dist, setDist] = useState(1);
  const star = STAR_TYPES.find(s => s.id === starId) || STAR_TYPES[2];
  const starRef = useRef(star);
  const distRef = useRef(dist);
  useEffect(() => { starRef.current = star; });
  useEffect(() => { distRef.current = dist; });

  const flux = useMemo(() => star.lum / (dist * dist), [star, dist]);
  const verdict = flux > 1.2 ? '过热' : flux >= 0.7 ? '可能宜居' : '过冷';

  return (
    <section id="cosmos-habitable" className="sec">
      <div className="sh">
        <span className="sh-icon">🌍</span>
        <div>
          <div className="sh-tag">Cosmos · 宜居带</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(0,230,118,.35)' }}>恒星与宜居带</h2>
          <p className="sh-sub">宜居带（Habitable Zone）是液态水可能存在的轨道范围。选择恒星类型与距离，对比金星、地球、火星——理解「距离」之外，大气与温室效应同样决定表面温度。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.2)', flexDirection: 'column', gap: 12 }}>
          <HabitableCanvas starRef={starRef} distRef={distRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {STAR_TYPES.map(s => (
              <button key={s.id} type="button" className="chip" style={{ borderColor: starId === s.id ? s.color : undefined }} onClick={() => setStarId(s.id)}>{s.label}</button>
            ))}
          </div>
          <input type="range" min={0.05} max={4} step={0.05} value={dist} onChange={e => setDist(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
          <div style={{ textAlign: 'center', fontSize: 12, color: ACC }}>轨道 {dist.toFixed(2)} AU · 当前判定：{verdict}</div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.2)' }}>
            <div className="formula" style={{ color: ACC }}>F ∝ L / d²</div>
            <div className="fdesc">辐射通量与光度成正比、与距离平方成反比</div>
          </div>
          <div className="glass">
            <h4 style={{ color: star.color, marginBottom: 8 }}>{star.label}</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              光度 {star.lum} L☉ · 宜居带约 {star.hzInner}–{star.hzOuter} AU<br />
              寿命约 {star.life} · 代表：{star.example}
            </p>
          </div>
          {HABITABLE_CASES.map(c => (
            <ICard key={c.id} color={c.verdict === '宜居' ? '#4a9eff' : c.verdict === '过热' ? '#ff6b35' : '#6eb5ff'} title={`${c.name} · ${c.verdict}`}>
              {c.reason}
              <button type="button" className="chip" style={{ marginTop: 8, fontSize: 10 }} onClick={() => { setStarId('g'); setDist(c.dist); }}>跳转到 {c.dist} AU</button>
            </ICard>
          ))}
          <ICard color={COSMOS_ACC} title="🌡️ 温室效应">
            金星在宜居带内缘却极热：CO₂ 大气锁住热量。火星在带外缘偏冷且大气稀薄。地球 = 合适距离 + 合适大气 + 磁场。
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_HABITABLE} accentColor={ACC} title="宜居带测验" />
      <RelatedSections sectionId="cosmos-habitable" />
    </section>
  );
}
