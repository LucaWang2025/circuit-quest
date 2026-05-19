import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { EV_ACC, QUIZ_AC } from '../../data/evchainData';

const ACC = EV_ACC;
const STEPS = [
  { id: 'grid', label: '电网', col: '#ffab00', desc: '220V 单相或 380V 三相接入配电，经 RCD/断路器保护后送至充电桩。' },
  { id: 'pile', label: '交流桩', col: ACC, desc: '桩内计量、CP 导引与接触器；输出仍为交流，典型 7 kW（32A×220V）。' },
  { id: 'obc', label: 'OBC', col: '#00bcd4', desc: '车载充电机 On-Board Charger：整流、PFC、隔离 DC-DC，将 AC 变为电池所需直流。' },
  { id: 'battery', label: '电池', col: '#00c853', desc: '经 BMS 允许后电流进入 PACK；恒流→恒压，SOC 越高电流越小。' },
];
const stepIdx = { grid: 0, pile: 1, obc: 2, battery: 3 };

function AcChainCanvas({ stepRef, ampRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const nodes = [
      { id: 'grid', x: 52, label: '电网', sub: '220V AC', col: '#ffab00' },
      { id: 'pile', x: 155, label: '交流桩', sub: '7 kW', col: ACC },
      { id: 'obc', x: 280, label: 'OBC', sub: 'AC→DC', col: '#00bcd4' },
      { id: 'battery', x: 410, label: '电池', sub: 'PACK', col: '#00c853' },
    ];

    function draw() {
      const step = stepRef.current;
      const amps = ampRef.current;
      const activeIdx = stepIdx[step] ?? 0;
      const stepInfo = STEPS.find(s => s.id === step) || STEPS[0];
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = `${ACC}35`;
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`交流慢充链路 · ${stepInfo.label} · 约 ${amps}A`, W / 2, 25);

      nodes.forEach((n, i) => {
        const on = i <= activeIdx;
        const active = n.id === step;
        ctx.fillStyle = on ? `${n.col}28` : 'rgba(255,255,255,.04)';
        ctx.strokeStyle = active ? n.col : on ? `${n.col}66` : 'rgba(255,255,255,.1)';
        ctx.lineWidth = active ? 2.5 : 1;
        ctx.beginPath(); ctx.roundRect(n.x - 38, 88, 76, 72, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = on ? n.col : '#556';
        ctx.font = `bold ${active ? 11 : 10}px monospace`;
        ctx.fillText(n.label, n.x, 128);
        ctx.fillStyle = '#889'; ctx.font = '8px monospace';
        ctx.fillText(n.sub, n.x, 142);
        if (i < nodes.length - 1 && on) {
          const nx = nodes[i + 1].x;
          ctx.strokeStyle = `${ACC}${activeIdx > i ? 'aa' : '44'}`; ctx.lineWidth = 2;
          ctx.setLineDash(i === 0 ? [] : [4, 4]);
          ctx.beginPath(); ctx.moveTo(n.x + 38, 124); ctx.lineTo(nx - 38, 124); ctx.stroke();
          ctx.setLineDash([]);
          if (activeIdx > i) {
            for (let p = 0; p < 2; p++) {
              const frac = ((t * 0.65 + p * 0.4 + i * 0.15) % 1);
              const px = n.x + 38 + frac * (nx - n.x - 76);
              ctx.fillStyle = i < 2 ? '#ffab00' : ACC;
              ctx.beginPath(); ctx.arc(px, 124, 3.5, 0, Math.PI * 2); ctx.fill();
            }
          }
        }
      });

      if (activeIdx >= 2) {
        ctx.strokeStyle = `rgba(0,188,212,${0.5 + 0.2 * Math.sin(t * 4)})`; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 40; x++) {
          const px = 258 + x, py = 108 + Math.sin(x / 5 + t * 5) * 6;
          x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.fillText('整流波形', 280, 108);
      }

      if (activeIdx >= 3) {
        const bx = 410;
        for (let i = 0; i < 5; i++) {
          const fill = 0.35 + (t * 0.002 + i * 0.12) % 0.55;
          ctx.fillStyle = fill > 0.7 ? '#00e676' : fill > 0.45 ? '#ffab00' : '#334';
          ctx.beginPath(); ctx.roundRect(bx - 24, 100 + i * 14, 48, 10, 2); ctx.fill();
        }
      }

      ctx.fillStyle = `rgba(0,230,118,${0.65 + 0.25 * Math.sin(t * 3)})`;
      ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(stepInfo.desc.slice(0, 46) + '…', W / 2, H - 12);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stepRef, ampRef]);

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

export default function EvchainAc() {
  const navigate = useNav();
  const [step, setStep] = useState('grid');
  const [amps, setAmps] = useState(32);
  const stepRef = useRef(step);
  const ampRef = useRef(amps);
  useEffect(() => { stepRef.current = step; });
  useEffect(() => { ampRef.current = amps; });

  const current = STEPS.find(s => s.id === step) || STEPS[0];
  const powerKw = ((220 * amps) / 1000).toFixed(1);

  const btn = (id, col, label) => (
    <button type="button" onClick={() => setStep(id)} style={{
      padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600,
      border: `1px solid ${step === id ? col : 'rgba(255,255,255,.12)'}`,
      background: step === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: step === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="evchain-ac" className="sec">
      <div className="sh">
        <span className="sh-icon">🔌</span>
        <div>
          <div className="sh-tag">EV Chain · Chapter 01 · 交流慢充</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>交流慢充链路</h2>
          <p className="sh-sub">电网 → 交流桩 → 车载 OBC → 电池：看清能量在哪一段仍是交流、在哪一段变为直流，以及 7 kW 家用桩的功率从哪来。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 12 }}>
          <AcChainCanvas stepRef={stepRef} ampRef={ampRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {btn('grid', '#ffab00', '⚡ 电网')}
            {btn('pile', ACC, '🔌 交流桩')}
            {btn('obc', '#00bcd4', '↔ OBC')}
            {btn('battery', '#00c853', '🔋 电池')}
          </div>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            充电电流 A（单相示意）
            <input type="range" min={6} max={32} value={amps} onChange={e => setAmps(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
            <span style={{ color: ACC }}> P ≈ {powerKw} kW</span>
          </label>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${ACC}33` }}>
            <div className="formula" style={{ color: ACC }}>P ≈ U × I × cosφ</div>
            <div className="fdesc">7 kW ≈ 220V × 32A（单相简化）</div>
          </div>
          <div className="glass" style={{ borderColor: `${current.col}44` }}>
            <h4 style={{ color: current.col, marginBottom: 10 }}>{current.label}</h4>
            <p style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.75 }}>{current.desc}</p>
          </div>
          <ICard color={ACC} title="🔌 交流桩职责">计量、漏电保护、CP 占空比告知最大电流；不完成 AC→DC 变换。</ICard>
          <ICard color="#00bcd4" title="↔ 车载 OBC">PFC + 隔离 DC-DC；功率等级决定慢充上限（常见 3.3–11 kW）。</ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('ev-charger')}>→ 充电桩（AC/DC 对比）</button>
            <button type="button" className="chip" onClick={() => navigate('evchain-bms')}>→ BMS 状态机</button>
            <button type="button" className="chip" onClick={() => navigate('home-ckt')}>→ 家用电路</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_AC} accentColor={ACC} title="交流慢充测验" />
      <RelatedSections sectionId="evchain-ac" />
    </section>
  );
}
