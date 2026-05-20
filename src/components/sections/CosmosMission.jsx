import { useEffect, useRef, useMemo, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import { themeCanvasColors } from '../../utils/themeColors';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { COSMOS_ACC, MISSION_TARGETS, QUIZ_MISSION, lightTravelMinutes } from '../../data/cosmosData';

function MissionCanvas({ targetRef, cmdRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const target = targetRef.current;
      const cmdSent = cmdRef.current;
      const delaySec = target.delaySec ?? (target.delayMin ? target.delayMin * 60 : lightTravelMinutes(target.au) * 60);
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(110,181,255,.35)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`任务链路 · ${target.name} · 单程 ${(delaySec / 60).toFixed(1)} 分钟（光时）`, W / 2, 25);

      const earthX = 80, probeX = 80 + Math.min(320, Math.log10(target.au * 1000 + 1) * 80);
      const midY = 150;

      ctx.fillStyle = '#4a9eff';
      ctx.beginPath(); ctx.arc(earthX, midY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('地球', earthX, midY + 28);

      ctx.fillStyle = '#ffc850';
      ctx.beginPath(); ctx.arc(probeX, midY, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(target.name.split(' ')[0], probeX, midY + 24);

      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(earthX + 16, midY); ctx.lineTo(probeX - 12, midY); ctx.stroke();
      ctx.setLineDash([]);

      if (cmdSent) {
        const age = (t % (delaySec / 15 + 2));
        const frac = Math.min(1, age / (delaySec / 15));
        const px = earthX + 20 + frac * (probeX - earthX - 32);
        ctx.fillStyle = `rgba(0,230,118,${0.9 - frac * 0.3})`;
        ctx.beginPath(); ctx.arc(px, midY - 15, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#00e676'; ctx.font = '8px monospace';
        ctx.fillText('指令', px, midY - 22);
        if (frac >= 0.98) {
          ctx.fillStyle = '#00e676';
          ctx.fillText('✓ 已到达', probeX, midY - 20);
        }
      }

      const logY = 220;
      ctx.fillStyle = 'rgba(0,0,0,.4)';
      ctx.beginPath(); ctx.roundRect(20, logY, W - 40, 70, 8); ctx.fill();
      ctx.fillStyle = themeCanvasColors().muted;
      ctx.font = '9px monospace'; ctx.textAlign = 'left';
      ctx.fillText('> 慢回路：发出指令 → 等待单程光时 → 执行 → 等待回传', 28, logY + 18);
      ctx.fillText(`> 往返确认需 ${((delaySec * 2) / 60).toFixed(1)} 分钟`, 28, logY + 34);
      ctx.fillText('> 无法像遥控车一样实时操作', 28, logY + 50);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [targetRef, cmdRef]);

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

export default function CosmosMission() {
  const [targetId, setTargetId] = useState('mars');
  const [cmdSent, setCmdSent] = useState(false);
  const target = MISSION_TARGETS.find(t => t.id === targetId) || MISSION_TARGETS[2];
  const targetRef = useRef(target);
  const cmdRef = useRef(cmdSent);
  useEffect(() => { targetRef.current = target; });
  useEffect(() => { cmdRef.current = cmdSent; });

  const delay = useMemo(() => {
    if (target.delaySec != null) return { oneWay: (target.delaySec / 60).toFixed(2), roundTrip: (target.delaySec * 2 / 60).toFixed(2) };
    const min = lightTravelMinutes(target.au);
    return { oneWay: min.toFixed(1), roundTrip: (min * 2).toFixed(1) };
  }, [target]);

  return (
    <section id="cosmos-mission" className="sec">
      <div className="sh">
        <span className="sh-icon">🛰️</span>
        <div>
          <div className="sh-tag">Cosmos · 深空任务控制台</div>
          <h2 className="sh-title" style={{ color: COSMOS_ACC, textShadow: '0 0 35px rgba(156,125,255,.35)' }}>深空任务控制台</h2>
          <p className="sh-sub">选择任务目标，体验光速限制下的「慢回路」遥控：通信延迟、Δv 预算、功耗与储能建议。把天文尺度转化为工程师必须面对的真实约束。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${COSMOS_ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(110,181,255,.25)', flexDirection: 'column', gap: 14 }}>
          <MissionCanvas targetRef={targetRef} cmdRef={cmdRef} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MISSION_TARGETS.map(t => (
              <button key={t.id} type="button" onClick={() => { setTargetId(t.id); setCmdSent(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 12, cursor: 'pointer', font: 'inherit',
                border: `1px solid ${targetId === t.id ? COSMOS_ACC : 'rgba(255,255,255,.1)'}`,
                background: targetId === t.id ? 'rgba(156,125,255,.15)' : 'rgba(255,255,255,.03)',
                color: targetId === t.id ? 'var(--white)' : 'var(--text-muted)',
              }}>
                <strong>{t.name}</strong>
                <span style={{ float: 'right', fontSize: 11, color: 'var(--dim)' }}>{t.au} AU</span>
              </button>
            ))}
          </div>
          <button type="button" className="chip" style={{ borderColor: cmdSent ? '#00e676' : COSMOS_ACC, alignSelf: 'center' }} onClick={() => setCmdSent(true)}>
            {cmdSent ? '指令传播中…' : '📡 发送遥控指令'}
          </button>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${COSMOS_ACC}44` }}>
            <div className="formula" style={{ color: COSMOS_ACC }}>t = d / c</div>
            <div className="fdesc">通信延迟 · 距离 ÷ 光速</div>
          </div>
          <div className="glass">
            <h3 style={{ color: COSMOS_ACC, marginBottom: 12 }}>{target.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, marginBottom: 12 }}>
              <div style={{ padding: 10, background: 'rgba(0,0,0,.2)', borderRadius: 8 }}><div style={{ fontSize: 10, color: 'var(--dim)' }}>单程光时</div><strong>{delay.oneWay} 分</strong></div>
              <div style={{ padding: 10, background: 'rgba(0,0,0,.2)', borderRadius: 8 }}><div style={{ fontSize: 10, color: 'var(--dim)' }}>往返光时</div><strong>{delay.roundTrip} 分</strong></div>
              <div style={{ padding: 10, background: 'rgba(0,0,0,.2)', borderRadius: 8 }}><div style={{ fontSize: 10, color: 'var(--dim)' }}>Δv 量级</div><strong>{target.deltaV}</strong></div>
              <div style={{ padding: 10, background: 'rgba(0,0,0,.2)', borderRadius: 8 }}><div style={{ fontSize: 10, color: 'var(--dim)' }}>建议储能</div><strong>{target.batteryKWh} kWh</strong></div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{target.note}</p>
            {target.powerW && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--cyan)' }}>典型功耗 {target.powerW}</p>}
          </div>
          <ICard color={COSMOS_ACC} title="🎮 慢回路控制">火星车不能实时转向：先上传指令序列，等待执行结果。软件需容错、超时与状态机。</ICard>
          <ICard color="#ffd600" title="🚀 霍曼转移">地火转移常用霍曼轨道，约 6–9 个月航程，在发射窗口（约 26 个月一轮）规划。</ICard>
          <ICard color="#00e676" title="🔋 任务电源">近地：太阳能；火星：太阳能+储能+休眠；外行星：RTG 为主。见「深空供电预算」章节。</ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_MISSION} accentColor={COSMOS_ACC} title="任务控制台测验" />
      <RelatedSections sectionId="cosmos-mission" />
    </section>
  );
}
