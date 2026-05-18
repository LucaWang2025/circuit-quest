import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ff6b35';

function MicrowaveCanvas({ stateRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const st = stateRef.current;
      const running = st === 'on';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      // 顶部状态条
      ctx.fillStyle = running ? 'rgba(255,107,53,.5)' : 'rgba(60,70,90,.45)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(running ? '微波加热中 · 磁控管 2.45GHz · 高压 2kV' : '待机 · 门开关联锁 · 高压断路', W / 2, 27);

      // ── 磁控管（左侧） ──
      const mgX = 130, mgY = 160;
      ctx.fillStyle = '#2a3040'; ctx.strokeStyle = running ? '#ff6b35' : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(mgX - 38, mgY - 55, 76, 110, 8); ctx.fill(); ctx.stroke();
      // 天线
      ctx.strokeStyle = running ? `rgba(255,107,53,${0.7 + 0.3 * Math.sin(t * 10)})` : '#334';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(mgX, mgY - 55); ctx.lineTo(mgX, mgY - 75); ctx.stroke();
      ctx.beginPath(); ctx.arc(mgX, mgY - 75, 5, 0, Math.PI * 2); ctx.fill();
      // 磁控管标签
      ctx.fillStyle = running ? '#ff9800' : '#556'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('磁控管', mgX, mgY);
      ctx.fillStyle = running ? ACC : '#445'; ctx.font = '8px monospace';
      ctx.fillText('2.45GHz', mgX, mgY + 14);

      // ── 高压变压器（中央） ──
      const txX = 240, txY = 170;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = running ? '#ffab00' : '#334'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(txX - 40, txY - 50, 80, 100, 8); ctx.fill(); ctx.stroke();
      if (running) {
        ctx.strokeStyle = `rgba(255,171,0,${0.3 + 0.2 * Math.sin(t * 3)})`; ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.roundRect(txX - 34, txY - 44, 68, 88, 6); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = running ? '#ffab00' : '#556'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('高压变压器', txX, txY - 8);
      ctx.fillStyle = running ? 'rgba(255,82,82,.9)' : '#445'; ctx.font = '8px monospace';
      ctx.fillText(running ? '~2000V' : '~220V→2kV', txX, txY + 6);
      ctx.fillStyle = '#668'; ctx.font = '8px monospace';
      ctx.fillText('初级 220V', txX, txY + 20);
      ctx.fillText('次级 2kV', txX, txY + 32);

      // ── 腔体（右侧） ──
      const cavX = 370, cavY = 155, cavW = 80, cavH = 70;
      ctx.fillStyle = running ? '#1a1a24' : '#151820';
      ctx.strokeStyle = '#3a4050'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(cavX - cavW / 2, cavY - cavH / 2, cavW, cavH, 4); ctx.fill(); ctx.stroke();
      // 微波波纹
      if (running) {
        for (let r = 0; r < 4; r++) {
          const radius = 10 + r * 10 + (t * 18 % 10);
          const alpha = Math.max(0, 0.7 - r * 0.18 - (t * 18 % 10) / 10 * 0.7);
          ctx.strokeStyle = `rgba(255,107,53,${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cavX, cavY, Math.min(radius, cavH / 2 - 2), 0, Math.PI * 2); ctx.stroke();
        }
      }
      // 食物旋转盘
      const foodA = t * 0.8;
      ctx.strokeStyle = '#556'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cavX, cavY + 18, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = running ? `rgba(255,140,0,${0.5 + 0.3 * Math.sin(t * 5)})` : '#88530022';
      ctx.beginPath();
      ctx.arc(cavX + Math.cos(foodA) * 10, cavY + 18 + Math.sin(foodA) * 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('转盘', cavX, cavY + 36);

      // ── 导线连接 ──
      const wCol = running ? `rgba(255,171,0,${0.5 + 0.2 * Math.sin(t * 4)})` : 'rgba(80,90,110,.3)';
      ctx.strokeStyle = wCol; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      // 220V → 变压器
      ctx.beginPath(); ctx.moveTo(44, txY); ctx.lineTo(txX - 40, txY); ctx.stroke();
      // 变压器 → 磁控管
      ctx.beginPath(); ctx.moveTo(txX - 40, txY - 20); ctx.lineTo(mgX + 38, mgY - 20); ctx.stroke();
      // 磁控管天线 → 腔体
      ctx.strokeStyle = running ? `rgba(255,107,53,${0.6 + 0.3 * Math.sin(t * 8)})` : 'rgba(80,90,110,.2)';
      ctx.beginPath(); ctx.moveTo(mgX + 38, mgY - 55); ctx.lineTo(cavX - cavW / 2, cavY - 8); ctx.stroke();
      ctx.setLineDash([]);
      // 220V 插头标记
      ctx.fillStyle = '#667'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('220V', 28, txY);

      // ── 门联锁开关（底部） ──
      const swY = 270;
      const doorClosed = running;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = doorClosed ? '#00e676' : '#ff5252'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(130, swY - 15, 90, 30, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = doorClosed ? '#00e676' : '#ff5252'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(doorClosed ? '门关 · 联锁接通' : '门开 · 联锁断开', 175, swY + 4);

      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#667'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(260, swY - 15, 90, 30, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('⚠ 高压电容 · 断电放电', 305, swY + 4);

      // 底部状态
      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = running ? `rgba(255,107,53,${0.7 + 0.3 * Math.sin(t * 3)})` : 'rgba(100,120,145,.6)';
      ctx.fillText(running ? '⚡ 磁控管电子回旋 → 2.45GHz 微波 → 水分子摩擦生热' : '○ 待机 · 开门断高压', W / 2, H - 10);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function Microwave() {
  const [state, setState] = useState('off');
  const stateRef = useRef(state);
  stateRef.current = state;

  const btn = (active) => ({
    padding: '9px 22px', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${active ? ACC : 'rgba(255,255,255,.12)'}`,
    background: active ? ACC + '22' : 'rgba(255,255,255,.04)',
    color: active ? ACC : 'rgba(255,255,255,.5)', font: '13px/1 inherit',
  });

  return (
    <section id="microwave" className="sec">
      <div className="sh">
        <span className="sh-icon">📻</span>
        <div>
          <div className="sh-tag">MICROWAVE · 磁控管 · 2kV 高压</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>微波炉</h2>
          <p className="sh-sub">从 220V 到 2kV 高压，再到 2.45GHz 微波——电路链路全解析</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,.2)', flexDirection: 'column', gap: 14 }}>
          <MicrowaveCanvas stateRef={stateRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={btn(state === 'on')} onClick={() => setState('on')}>▶ 启动加热</button>
            <button style={btn(state === 'off')} onClick={() => setState('off')}>⏹ 停止/开门</button>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,82,82,.8)', textAlign: 'center', lineHeight: 1.5 }}>
            ⚠ 真机维修：断电后高压电容仍储有 2kV，必须先短路放电再触碰内部！
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,107,53,.18)' }}>
            <div className="formula" style={{ color: ACC }}>220V → 2kV → 2.45GHz</div>
            <div className="fdesc">供电链路：整流升压 → 磁控管振荡 → 微波加热</div>
          </div>
          <ICard color={ACC} title="⚙️ 磁控管原理">
            磁控管是微波炉的核心振荡器。阴极发射电子，在恒定磁场（磁铁提供）作用下做回旋运动，
            谐振腔频率锁定为 <strong style={{ color: ACC }}>2.45GHz</strong>。此频率恰好被水分子高效吸收，
            水分子摩擦产热→食物升温。
          </ICard>
          <ICard color={ACC} title="🔌 高压变压器">
            初级 220V AC，次级约 <strong>2000V AC</strong>（倍压整流后≈2.8kV DC）。
            整流二极管（HV）+ 大电容（2000V/1μF）滤波后供磁控管灯丝和高压极。
          </ICard>
          <ICard color="#00e676" title="🚪 门联锁开关">
            两个串联微动开关。门未关闭时 <strong>断开高压回路</strong>，防止微波泄漏。
            门开时同时接通一个"监控开关"使保险丝断路——这是安全关键设计。
          </ICard>
          <ICard color="#ff5252" title="⚠️ 维修安全守则">
            ① 拔电后静置 5 分钟 ②用 10kΩ/10W 电阻对地短路放电容 ③
            勿拆封磁控管本体 ④勿在腔体内放金属——弧光可损坏磁控管。
          </ICard>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        {[
          { c: ACC, t: '🔧 常见故障', b: '不加热→磁控管灯丝断/高压电容坏；转盘不转→转盘电机故障；无法启动→门开关接触不良。' },
          { c: '#ffab00', t: '📊 功率档位', b: '微波炉通过脉冲宽度调制（PWM）控制磁控管工作时间比来实现多档功率（100%/70%/30%）。' },
          { c: '#00bcd4', t: '🌡️ 为何不能加热金属？', b: '金属导体产生感应涡流，形成弧光放电；同时反射微波损坏腔壁和磁控管天线。' },
        ].map(x => (
          <div key={x.t} className="glass reveal" style={{ borderColor: `${x.c}33` }}>
            <div style={{ fontWeight: 700, color: x.c, marginBottom: 8 }}>{x.t}</div>
            <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.85 }}>{x.b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
