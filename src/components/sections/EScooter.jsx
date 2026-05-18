import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#e040fb';

function ScooterCanvas({ stateRef, throttleRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const st = stateRef.current;
      const thr = throttleRef.current / 100;
      const running = st !== 'off';
      const braking = st === 'brake';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = running ? (braking ? 'rgba(255,23,68,.45)' : 'rgba(224,64,251,.45)') : 'rgba(60,70,90,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      const topLabel = braking ? '制动回收 · BLDC 反转发电 → 回充电池'
        : running ? `BLDC 驱动 · 油门 ${Math.round(thr * 100)}% · ${Math.round(thr * 48)}V/${Math.round(thr * 15)}A`
        : '待机 · BMS 保护 · 等待油门';
      ctx.fillText(topLabel, W / 2, 27);

      // ── 电池包（左侧）──
      const batX = 65, batY = 140;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = running ? '#00e676' : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(batX - 30, batY - 55, 60, 110, 8); ctx.fill(); ctx.stroke();
      // 电量格
      const cells = 8, fullCells = Math.round(cells * 0.7);
      for (let i = 0; i < cells; i++) {
        const active = i < fullCells;
        ctx.fillStyle = active ? (i < fullCells * 0.3 ? '#ff5252' : '#00e676') : '#334';
        ctx.beginPath(); ctx.roundRect(batX - 22, batY - 48 + i * 13, 44, 10, 2); ctx.fill();
      }
      ctx.fillStyle = '#00e676'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('电池包', batX, batY + 62);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText('48V 20Ah', batX, batY + 73);

      // ── BMS（电池右侧）──
      const bmsX = batX + 56, bmsY = batY + 20;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = running ? '#00e676' : '#334'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(bmsX - 22, bmsY - 18, 44, 36, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = running ? '#00e676' : '#446'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('BMS', bmsX, bmsY - 5);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText('过流/过压', bmsX, bmsY + 7);
      ctx.fillText('保护', bmsX, bmsY + 17);

      // ── 控制器（中间）──
      const ctrlX = 230, ctrlY = 155;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = running ? ACC : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(ctrlX - 44, ctrlY - 44, 88, 88, 8); ctx.fill(); ctx.stroke();
      // MOSFET 桥
      const mosPts = [
        { x: ctrlX - 20, y: ctrlY - 18 }, { x: ctrlX, y: ctrlY - 18 }, { x: ctrlX + 20, y: ctrlY - 18 },
        { x: ctrlX - 20, y: ctrlY + 18 }, { x: ctrlX, y: ctrlY + 18 }, { x: ctrlX + 20, y: ctrlY + 18 },
      ];
      mosPts.forEach((p, i) => {
        const active = running && !braking;
        const pulse = active && ((Math.floor(t * 8 + i * 0.5)) % 6 === i % 3);
        ctx.fillStyle = pulse ? ACC : (active ? 'rgba(224,64,251,.35)' : '#334');
        ctx.shadowColor = pulse ? ACC : 'transparent'; ctx.shadowBlur = pulse ? 8 : 0;
        ctx.beginPath(); ctx.roundRect(p.x - 7, p.y - 7, 14, 14, 3); ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.fillStyle = running ? ACC : '#556'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('6× MOSFET', ctrlX, ctrlY + 34);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText('三相全桥', ctrlX, ctrlY + 44);

      // ── BLDC 轮毂电机（右侧）──
      const motX = 390, motY = 155;
      const motorSpeed = running && !braking ? thr * 0.3 : 0;
      ctx.fillStyle = '#2a3040'; ctx.strokeStyle = running ? (braking ? '#ff5252' : '#00bcd4') : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(motX, motY, 38, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 三相绕组
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + t * motorSpeed * 20;
        const cols = ['#ff5252', '#00bcd4', '#00e676'];
        const alpha = running && !braking ? 0.7 + 0.3 * Math.sin(t * 8 + i * 2) : 0.15;
        ctx.strokeStyle = cols[i].replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('(#', '(');
        ctx.strokeStyle = running ? cols[i] + (Math.round(alpha * 255)).toString(16).padStart(2, '0') : '#334';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(motX, motY);
        ctx.lineTo(motX + Math.cos(a) * 30, motY + Math.sin(a) * 30);
        ctx.stroke();
      }
      // 转子轮毂
      const rota = t * motorSpeed * 20;
      ctx.fillStyle = '#3a4050'; ctx.strokeStyle = '#556';
      ctx.beginPath(); ctx.arc(motX, motY, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const sa = i * Math.PI / 2 + rota;
        ctx.strokeStyle = '#667'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(motX, motY); ctx.lineTo(motX + Math.cos(sa) * 14, motY + Math.sin(sa) * 14); ctx.stroke();
      }
      ctx.fillStyle = running ? (braking ? '#ff5252' : '#00bcd4') : '#556'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('BLDC', motX, motY + 52);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText(braking ? '发电模式' : running ? `${Math.round(thr * 500)}rpm` : '轮毂电机', motX, motY + 63);

      // 导线
      ctx.setLineDash([4, 4]);
      const wCol = running ? `rgba(224,64,251,${0.5 + 0.2 * Math.sin(t * 4)})` : 'rgba(80,90,110,.25)';
      ctx.strokeStyle = wCol; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(batX + 30, batY - 15); ctx.lineTo(bmsX - 22, batY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bmsX + 22, bmsY); ctx.lineTo(ctrlX - 44, ctrlY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ctrlX + 44, ctrlY); ctx.lineTo(motX - 38, motY); ctx.stroke();
      ctx.setLineDash([]);

      // 制动能量回收箭头
      if (braking) {
        ctx.strokeStyle = `rgba(255,23,68,${0.6 + 0.3 * Math.sin(t * 6)})`; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(motX - 38, motY); ctx.lineTo(ctrlX + 44, ctrlY); ctx.stroke();
        ctx.fillStyle = '#ff5252'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('← 回充', (ctrlX + motX) / 2, ctrlY - 12);
      }

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = running
        ? (braking ? 'rgba(255,23,68,.75)' : `rgba(224,64,251,${0.7 + 0.3 * Math.sin(t * 3)})`)
        : 'rgba(100,120,145,.6)';
      ctx.fillText(
        braking ? '动能 → BLDC 发电 → 回充电池 · 制动能量回收' :
        running ? `BMS → 控制器 MOSFET 六步换相 → BLDC → 轮毂驱动` :
        '○ 油门推 → 控制器采样 → PWM 调速',
        W / 2, H - 10
      );

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stateRef, throttleRef]);

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

export default function EScooter() {
  const [state, setState] = useState('off');
  const [throttle, setThrottle] = useState(50);
  const stateRef = useRef(state);
  const throttleRef = useRef(throttle);
  useEffect(() => { stateRef.current = state; throttleRef.current = throttle; });

  const btn = (id, col, label) => (
    <button onClick={() => setState(id)} style={{
      padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${state === id ? col : 'rgba(255,255,255,.12)'}`,
      background: state === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: state === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="escooter" className="sec">
      <div className="sh">
        <span className="sh-icon">🛴</span>
        <div>
          <div className="sh-tag">E-SCOOTER · BLDC · BMS · 能量回收</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>电动滑板车</h2>
          <p className="sh-sub">锂电 BMS + 控制器 MOSFET + BLDC 轮毂电机——三电系统全解析</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(224,64,251,.2)', flexDirection: 'column', gap: 14 }}>
          <ScooterCanvas stateRef={stateRef} throttleRef={throttleRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {btn('off', '#607d8b', '⏹ 待机')}
            {btn('run', ACC, '🛴 行驶')}
            {btn('brake', '#ff5252', '🔴 制动回收')}
          </div>
          {state === 'run' && (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>油门 {throttle}%</div>
              <input type="range" min={5} max={100} value={throttle} onChange={e => setThrottle(+e.target.value)}
                style={{ width: '100%', accentColor: ACC }} />
            </div>
          )}
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(224,64,251,.18)' }}>
            <div className="formula" style={{ color: ACC }}>电池 → BMS → 控制器 → BLDC</div>
            <div className="fdesc">制动时反向：BLDC 发电 → 回充电池</div>
          </div>
          <ICard color={ACC} title="🔋 BMS 电池管理">
            保护电芯免受过充（≥4.2V）、过放（≤2.8V）、过流（短路）、过温。
            均衡功能让各节电芯容量趋同，延长寿命。
          </ICard>
          <ICard color={ACC} title="⚙️ 控制器 6 路 MOSFET">
            三相全桥 6 个 MOSFET，按 120° 六步换相驱动 BLDC。
            油门信号→MCU→PWM 占空比→调节平均电压→调速。
          </ICard>
          <ICard color={ACC} title="🌀 BLDC 轮毂电机">
            外转子 BLDC：定子线圈固定，永磁转子嵌入轮毂。霍尔传感器检测转子位置→换相时序。
            额定功率通常 250~350W，峰值可达 600W。
          </ICard>
          <ICard color="#00e676" title="⚡ 制动能量回收">
            刹车时 BLDC 切换为发电机模式，动能→电能→回充电池。
            典型回收效率约 10~20%，延长续航。
          </ICard>
        </div>
      </div>
    </section>
  );
}
