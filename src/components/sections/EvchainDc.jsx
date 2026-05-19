import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { EV_ACC, QUIZ_DC } from '../../data/evchainData';

const ACC = '#00e676';
const STEPS = [
  { id: 'grid', label: '电网', col: '#ffab00', desc: '三相 380V 或高压进线送入直流桩机柜，功率可达数百 kW。' },
  { id: 'rect', label: '桩内 AC/DC', col: '#ff9800', desc: '大功率 PFC + 整流模块，输出 200–1000V 级直流母线。' },
  { id: 'bms', label: 'BMS 握手', col: '#00bcd4', desc: 'CAN 通信协商电压电流上限、绝缘检测、预充完成后闭合主接触器。' },
  { id: 'cell', label: '电芯', col: '#00c853', desc: '电流直接注入 PACK；80% SOC 后 BMS 降流 taper，保护电芯。' },
];
const stepIdx = { grid: 0, rect: 1, bms: 2, cell: 3 };

function DcChainCanvas({ stepRef, kwRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const nodes = [
      { id: 'grid', x: 50, label: '电网', col: '#ffab00' },
      { id: 'rect', x: 155, label: 'AC/DC', col: '#ff9800' },
      { id: 'bms', x: 285, label: 'BMS', col: '#00bcd4' },
      { id: 'cell', x: 410, label: '电芯', col: '#00c853' },
    ];

    function draw() {
      const step = stepRef.current;
      const kw = kwRef.current;
      const activeIdx = stepIdx[step] ?? 0;
      const info = STEPS.find(s => s.id === step) || STEPS[0];
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = 'rgba(255,152,0,.45)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`直流快充 · ${info.label} · ${kw} kW`, W / 2, 27);

      nodes.forEach((n, i) => {
        const on = i <= activeIdx;
        const active = n.id === step;
        ctx.fillStyle = on ? `${n.col}28` : 'rgba(255,255,255,.04)';
        ctx.strokeStyle = active ? n.col : on ? `${n.col}66` : 'rgba(255,255,255,.1)';
        ctx.lineWidth = active ? 2.5 : 1;
        ctx.beginPath(); ctx.roundRect(n.x - 40, 95, 80, 78, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = on ? n.col : '#556';
        ctx.font = `bold ${active ? 12 : 10}px monospace`;
        ctx.fillText(n.label, n.x, 140);
        if (i < nodes.length - 1 && on) {
          const nx = nodes[i + 1].x;
          ctx.strokeStyle = `rgba(0,230,118,${activeIdx > i ? 0.7 : 0.25})`;
          ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
          ctx.beginPath(); ctx.moveTo(n.x + 40, 134); ctx.lineTo(nx - 40, 134); ctx.stroke();
          ctx.setLineDash([]);
          if (activeIdx > i) {
            const nP = Math.min(6, Math.round(kw / 40));
            for (let p = 0; p < nP; p++) {
              const frac = ((t * 0.9 + p / nP) % 1);
              const px = n.x + 40 + frac * (nx - n.x - 80);
              ctx.fillStyle = '#00e676'; ctx.shadowColor = ACC; ctx.shadowBlur = 6;
              ctx.beginPath(); ctx.arc(px, 134, 4, 0, Math.PI * 2); ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      });

      if (activeIdx >= 1) {
        ctx.fillStyle = '#334'; ctx.strokeStyle = '#ff9800';
        ctx.beginPath(); ctx.roundRect(130, 108, 50, 28, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff9800'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
        ctx.fillText('GaN/SiC', 155, 125);
      }

      if (activeIdx >= 2) {
        ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(248, 108, 74, 36, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00bcd4'; ctx.font = '8px monospace';
        ctx.fillText('CAN 握手', 285, 128);
      }

      if (activeIdx >= 3) {
        const soc = 0.5 + (t * 0.004) % 0.35;
        ctx.fillStyle = '#1e2635'; ctx.strokeStyle = ACC; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(372, 100, 76, 90, 8); ctx.fill(); ctx.stroke();
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i < Math.round(soc * 5) ? (soc > 0.75 ? '#00e676' : '#ffab00') : '#334';
          ctx.beginPath(); ctx.roundRect(380, 108 + i * 16, 60, 12, 2); ctx.fill();
        }
        ctx.fillStyle = ACC; ctx.font = '9px monospace';
        ctx.fillText(`${Math.round(soc * 100)}% SOC`, 410, 205);
      }

      ctx.fillStyle = `rgba(0,230,118,${0.7 + 0.25 * Math.sin(t * 3)})`;
      ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(info.desc.slice(0, 48) + '…', W / 2, H - 10);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stepRef, kwRef]);

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

export default function EvchainDc() {
  const navigate = useNav();
  const [step, setStep] = useState('grid');
  const [kw, setKw] = useState(120);
  const stepRef = useRef(step);
  const kwRef = useRef(kw);
  useEffect(() => { stepRef.current = step; });
  useEffect(() => { kwRef.current = kw; });

  const current = STEPS.find(s => s.id === step) || STEPS[0];
  const approxA = Math.round((kw * 1000) / 400);

  const btn = (id, col, label) => (
    <button type="button" onClick={() => setStep(id)} style={{
      padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600,
      border: `1px solid ${step === id ? col : 'rgba(255,255,255,.12)'}`,
      background: step === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: step === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="evchain-dc" className="sec">
      <div className="sh">
        <span className="sh-icon">⚡</span>
        <div>
          <div className="sh-tag">EV Chain · Chapter 02 · 直流快充</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>直流快充链路</h2>
          <p className="sh-sub">桩内大功率 AC/DC 直接对接车端高压母线：跳过 OBC，但 BMS 握手与热管理要求更严。拖动功率感受电流粒子密度变化。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 12 }}>
          <DcChainCanvas stepRef={stepRef} kwRef={kwRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {btn('grid', '#ffab00', '电网')}
            {btn('rect', '#ff9800', 'AC/DC')}
            {btn('bms', '#00bcd4', 'BMS')}
            {btn('cell', '#00c853', '电芯')}
          </div>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            充电功率 kW
            <input type="range" min={30} max={250} step={10} value={kw} onChange={e => setKw(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
            <span style={{ color: ACC }}> 约 {approxA}A @ 400V</span>
          </label>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${ACC}33` }}>
            <div className="formula" style={{ color: ACC }}>P = U × I</div>
            <div className="fdesc">400V 平台 · 250kW ≈ 625A（简化）</div>
          </div>
          <div className="glass" style={{ borderColor: `${current.col}44` }}>
            <h4 style={{ color: current.col, marginBottom: 10 }}>{current.label}</h4>
            <p style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.75 }}>{current.desc}</p>
          </div>
          <ICard color="#ff9800" title="🌡️ 热管理">液冷枪线、电池冷却回路；大电流 I²R 发热必须带走。</ICard>
          <ICard color={ACC} title="📉 SOC taper">恒压阶段 BMS 限制电流，桩端显示功率下降属正常保护。</ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('fast-charge')}>→ 快充协议</button>
            <button type="button" className="chip" onClick={() => navigate('evchain-bms')}>→ BMS 状态机</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_DC} accentColor={ACC} title="直流快充测验" />
      <RelatedSections sectionId="evchain-dc" />
    </section>
  );
}
