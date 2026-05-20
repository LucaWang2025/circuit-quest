import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { COSMOS_ACC, ENERGY_CHAIN_STEPS, QUIZ_ENERGY, SOLAR_CONSTANT } from '../../data/cosmosData';

const ACC = '#ffd600';

function EnergyChainCanvas({ stepRef, irrRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const stepIdx = { fusion: 0, radiation: 1, pv: 2, inv: 3, grid: 4, load: 5 };

    function draw() {
      const step = stepRef.current;
      const irr = irrRef.current;
      const activeIdx = stepIdx[step] ?? 0;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const nodes = [
        { id: 'fusion', x: 45, label: '☉', col: '#ffc850' },
        { id: 'radiation', x: 115, label: '辐射', col: '#ffab00' },
        { id: 'pv', x: 185, label: '光伏', col: '#4a9eff' },
        { id: 'inv', x: 265, label: '逆变', col: ACC },
        { id: 'grid', x: 345, label: '电网', col: '#00e676' },
        { id: 'load', x: 420, label: '负载', col: '#e040fb' },
      ];

      ctx.fillStyle = 'rgba(255,214,0,.4)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`太阳系能源链 · 辐照 ${irr} W/m²（示意）· ${ENERGY_CHAIN_STEPS[activeIdx]?.title || ''}`, W / 2, 25);

      nodes.forEach((n, i) => {
        const on = i <= activeIdx;
        const active = n.id === step;
        ctx.fillStyle = on ? `${n.col}28` : 'rgba(255,255,255,.04)';
        ctx.strokeStyle = active ? n.col : on ? `${n.col}66` : 'rgba(255,255,255,.1)';
        ctx.lineWidth = active ? 2.5 : 1;
        ctx.beginPath(); ctx.roundRect(n.x - 32, 95, 64, 72, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = on ? n.col : '#556';
        ctx.font = `bold ${active ? 11 : 10}px monospace`;
        ctx.fillText(n.label, n.x, 138);
      });

      if (activeIdx >= 1) {
        for (let r = 0; r < 5; r++) {
          const frac = ((t * 0.65 + r * 0.18) % 1);
          if (frac < activeIdx / 5 + 0.2) {
            const x = 70 + frac * 350;
            ctx.fillStyle = `rgba(255,214,0,${irr / 120})`;
            ctx.beginPath(); ctx.arc(x, 120, 3, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      if (activeIdx >= 2) {
        const pvX = 185;
        for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
          ctx.fillStyle = 'rgba(25,35,80,.9)'; ctx.strokeStyle = '#4a9eff';
          ctx.beginPath(); ctx.roundRect(pvX - 18 + c * 20, 108 + r * 18, 18, 14, 2); ctx.fill(); ctx.stroke();
        }
      }

      if (activeIdx >= 3) {
        ctx.strokeStyle = `rgba(255,171,0,${0.5 + 0.2 * Math.sin(t * 4)})`; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 48; x++) {
          const px = 245 + x, py = 125 + Math.sin(x / 6 + t * 5) * 7;
          x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.fillText('220V AC', 265, 155);
      }

      if (activeIdx >= 4) {
        ctx.strokeStyle = '#556'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(345, 90); ctx.lineTo(345, 200); ctx.stroke();
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(325, 110 + i * 25); ctx.lineTo(365, 110 + i * 25); ctx.stroke(); }
      }

      if (activeIdx >= 5) {
        ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#e040fb44';
        ctx.beginPath(); ctx.moveTo(420, 155); ctx.lineTo(395, 175); ctx.lineTo(445, 175); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e040fb'; ctx.font = '8px monospace'; ctx.fillText('负载', 420, 190);
      }

      ctx.fillStyle = `rgba(255,214,0,${0.6 + 0.3 * Math.sin(t * 3)})`;
      ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(ENERGY_CHAIN_STEPS[activeIdx]?.text?.slice(0, 42) + '…' || '', W / 2, H - 12);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stepRef, irrRef]);

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

export default function CosmosEnergy() {
  const navigate = useNav();
  const [step, setStep] = useState('fusion');
  const [irr, setIrr] = useState(80);
  const stepRef = useRef(step);
  const irrRef = useRef(irr);
  useEffect(() => { stepRef.current = step; });
  useEffect(() => { irrRef.current = irr; });

  const current = ENERGY_CHAIN_STEPS.find(s => s.id === step) || ENERGY_CHAIN_STEPS[0];
  const pvW = Math.round(irr * 3);

  const btn = (id, col, label) => (
    <button type="button" onClick={() => setStep(id)} style={{
      padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600,
      border: `1px solid ${step === id ? col : 'rgba(255,255,255,.12)'}`,
      background: step === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: step === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="cosmos-energy" className="sec">
      <div className="sh">
        <span className="sh-icon">🔗</span>
        <div>
          <div className="sh-tag">Cosmos × Circuit · 能源链</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(255,214,0,.35)' }}>太阳系能源链</h2>
          <p className="sh-sub">从太阳核心聚变到家庭插座：完整走一遍能量形态变化。衔接「光伏」「家用电路」「储能」章节——宇宙专题不是孤立天文，而是电力系统的源头。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,214,0,.25)', flexDirection: 'column', gap: 12 }}>
          <EnergyChainCanvas stepRef={stepRef} irrRef={irrRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {btn('fusion', '#ffc850', '☉ 聚变')}
            {btn('radiation', '#ffab00', '辐射')}
            {btn('pv', '#4a9eff', '光伏')}
            {btn('inv', ACC, '逆变')}
            {btn('grid', '#00e676', '电网')}
            {btn('load', '#e040fb', '负载')}
          </div>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            辐照强度 W/m²（地球大气层外最大约 {SOLAR_CONSTANT}）
            <input type="range" min={10} max={100} value={irr} onChange={e => setIrr(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
            <span style={{ color: ACC }}> 示意功率 ≈ {pvW} W</span>
          </label>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,214,0,.25)' }}>
            <div className="formula" style={{ color: ACC }}>P = U × I · W = P × t</div>
            <div className="fdesc">功率与能量 · 光伏输出的物理基础</div>
          </div>
          <div className="glass" style={{ borderColor: `${current.color}44` }}>
            <h4 style={{ color: current.color, marginBottom: 10 }}>{current.icon} {current.title}</h4>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.75 }}>{current.text}</p>
          </div>
          <ICard color={ACC} title="☀️ 太阳常数">
            地球大气层外垂直辐照度约 <strong style={{ color: ACC }}>{SOLAR_CONSTANT} W/m²</strong>。大气吸收、入射角、云层会使地面实际值更低。
          </ICard>
          <ICard color="#4a9eff" title="🔆 光伏效应">
            光子能量 &gt; 禁带宽度时激发电子-空穴对；PN 结内建电场分离电荷形成直流。单晶硅组件效率约 20–24%。
          </ICard>
          <ICard color="#00e676" title="〰️ 逆变与并网">
            MPPT 追踪最大功率点；逆变器同步 220 V / 50 Hz；防孤岛保护在电网断电时自动脱网。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('solar')}>→ 家用光伏（完整动画）</button>
            <button type="button" className="chip" onClick={() => navigate('energy-storage')}>→ 储能系统</button>
            <button type="button" className="chip" onClick={() => navigate('home-ckt')}>→ 家用电路</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_ENERGY} accentColor={ACC} title="能源链测验" />
      <RelatedSections sectionId="cosmos-energy" />
    </section>
  );
}
