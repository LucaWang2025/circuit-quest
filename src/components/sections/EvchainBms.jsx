import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { EV_ACC, BMS_STAGES, QUIZ_BMS } from '../../data/evchainData';

const ACC = '#00c853';

function BmsStateCanvas({ stageRef, autoRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const stageIdx = Object.fromEntries(BMS_STAGES.map((s, i) => [s.id, i]));

    function draw() {
      const stage = stageRef.current;
      const auto = autoRef.current;
      const activeIdx = stageIdx[stage] ?? 0;
      const cur = BMS_STAGES[activeIdx] || BMS_STAGES[0];
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = `${cur.color}35`;
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`BMS 充电状态机 · ${cur.label}${auto ? ' · 自动演示' : ''}`, W / 2, 25);

      const boxW = 68, gap = 12;
      const totalW = BMS_STAGES.length * boxW + (BMS_STAGES.length - 1) * gap;
      const startX = (W - totalW) / 2 + boxW / 2;
      const midY = 115;

      BMS_STAGES.forEach((s, i) => {
        const x = startX + i * (boxW + gap);
        const done = i < activeIdx;
        const active = i === activeIdx;
        ctx.fillStyle = done || active ? `${s.color}28` : 'rgba(255,255,255,.04)';
        ctx.strokeStyle = active ? s.color : done ? `${s.color}55` : 'rgba(255,255,255,.1)';
        ctx.lineWidth = active ? 2.5 : 1;
        ctx.beginPath(); ctx.roundRect(x - boxW / 2, midY - 28, boxW, 56, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = active || done ? s.color : '#556';
        ctx.font = `bold ${active ? 9 : 8}px monospace`;
        ctx.fillText(s.label, x, midY + 4);
        if (i < BMS_STAGES.length - 1) {
          const nx = startX + (i + 1) * (boxW + gap);
          ctx.strokeStyle = i < activeIdx ? `${EV_ACC}88` : '#334';
          ctx.lineWidth = i < activeIdx ? 2 : 1;
          ctx.beginPath(); ctx.moveTo(x + boxW / 2, midY); ctx.lineTo(nx - boxW / 2, midY); ctx.stroke();
          if (i < activeIdx || (active && auto)) {
            const frac = auto && active ? ((t * 0.5) % 1) : 1;
            const px = x + boxW / 2 + frac * (nx - x - boxW);
            ctx.fillStyle = EV_ACC;
            ctx.beginPath(); ctx.arc(px, midY, 4, 0, Math.PI * 2); ctx.fill();
          }
        }
      });

      const batX = W / 2, batY = 220;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = cur.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(batX - 50, batY - 55, 100, 110, 10); ctx.fill(); ctx.stroke();
      const socMap = { idle: 0.15, handshake: 0.2, precharge: 0.25, cc: 0.55 + (t * 0.003) % 0.25, cv: 0.82 + (t * 0.001) % 0.1, full: 0.98 };
      const soc = socMap[stage] ?? 0.3;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i < Math.round(soc * 6) ? (soc > 0.85 ? '#00e676' : soc > 0.5 ? '#ffab00' : '#334') : '#334';
        ctx.beginPath(); ctx.roundRect(batX - 38, batY - 44 + i * 15, 76, 11, 2); ctx.fill();
      }
      ctx.fillStyle = cur.color; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(soc * 100)}% SOC`, batX, batY + 68);

      if (stage === 'cc' || stage === 'cv') {
        ctx.strokeStyle = `rgba(0,230,118,${0.4 + 0.2 * Math.sin(t * 4)})`; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 120; x++) {
          const px = 80 + x;
          const py = 268 + (stage === 'cc' ? Math.sin(x / 8) * 4 : Math.sin(x / 8 + t) * 8 * (1 - x / 120));
          x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = '#889'; ctx.font = '8px monospace';
        ctx.fillText(stage === 'cc' ? '恒流 CC' : '恒压 CV · 电流 taper', W / 2, 298);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stageRef, autoRef]);

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

const STAGE_DESC = {
  idle: '车辆未连接或充电结束，主接触器断开，仅低压唤醒电路工作。',
  handshake: '桩车 CAN 交换版本、电压电流能力、绝缘检测请求。',
  precharge: '预充电阻限制浪涌，母线电压逼近电池电压后闭合主继电器。',
  cc: '恒流阶段：在允许电压范围内以最大安全电流充电，SOC 上升最快。',
  cv: '恒压阶段：电压钳位，电流逐渐减小（taper），接近满充。',
  full: '达到截止条件，停止充电；可能进入均衡或涓流维护。',
};

export default function EvchainBms() {
  const navigate = useNav();
  const [stage, setStage] = useState('idle');
  const [auto, setAuto] = useState(false);
  const stageRef = useRef(stage);
  const autoRef = useRef(auto);
  useEffect(() => { stageRef.current = stage; });
  useEffect(() => { autoRef.current = auto; });

  useEffect(() => {
    if (!auto) return undefined;
    const ids = BMS_STAGES.map(s => s.id);
    const timer = setInterval(() => {
      setStage(prev => {
        const i = ids.indexOf(prev);
        return ids[(i + 1) % ids.length];
      });
    }, 2200);
    return () => clearInterval(timer);
  }, [auto]);

  const cur = BMS_STAGES.find(s => s.id === stage) || BMS_STAGES[0];

  return (
    <section id="evchain-bms" className="sec">
      <div className="sh">
        <span className="sh-icon">🔋</span>
        <div>
          <div className="sh-tag">EV Chain · Chapter 03 · BMS</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>BMS 充电状态机</h2>
          <p className="sh-sub">从待机、握手、预充到恒流恒压与满充截止——BMS 是高压电池包的「大脑」，决定每一安培能否进入电芯。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 12 }}>
          <BmsStateCanvas stageRef={stageRef} autoRef={autoRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {BMS_STAGES.map(s => (
              <button key={s.id} type="button" onClick={() => setStage(s.id)} style={{
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 10, fontWeight: 600,
                border: `1px solid ${stage === s.id ? s.color : 'rgba(255,255,255,.12)'}`,
                background: stage === s.id ? s.color + '22' : 'rgba(255,255,255,.04)',
                color: stage === s.id ? s.color : 'rgba(255,255,255,.5)',
              }}>{s.label}</button>
            ))}
          </div>
          <button type="button" className="chip" style={{ borderColor: auto ? ACC : undefined }} onClick={() => setAuto(a => !a)}>
            {auto ? '⏸ 停止自动演示' : '▶ 自动演示状态流转'}
          </button>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${cur.color}44` }}>
            <div className="formula" style={{ color: cur.color }}>CC → CV → 截止</div>
            <div className="fdesc">典型锂电充电曲线 · BMS 全程监护</div>
          </div>
          <div className="glass" style={{ borderColor: `${cur.color}33` }}>
            <h4 style={{ color: cur.color, marginBottom: 10 }}>{cur.label}</h4>
            <p style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.75 }}>{STAGE_DESC[stage]}</p>
          </div>
          <ICard color={ACC} title="⚡ 预充">防止上电瞬间大电流冲击母线电容与电芯。</ICard>
          <ICard color={EV_ACC} title="🌡️ 热保护">温差过大或温度过高时降功率或停止充电。</ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('battery-tech')}>→ 锂电池</button>
            <button type="button" className="chip" onClick={() => navigate('ev-power')}>→ 汽车三电</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_BMS} accentColor={ACC} title="BMS 测验" />
      <RelatedSections sectionId="evchain-bms" />
    </section>
  );
}
