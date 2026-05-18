import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#40c4ff';

function EvCanvas({ stateRef, throttleRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const st = stateRef.current;  // drive / regen / charge
      const thr = throttleRef.current / 100;
      const active = st !== 'idle';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = active ? 'rgba(64,196,255,.42)' : 'rgba(60,70,90,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(
        st === 'drive' ? `驱动模式 · ${Math.round(thr * 350)}kW · PMSM 永磁同步电机` :
        st === 'regen' ? '能量回收 · PMSM 发电 → 电池回充' :
        st === 'charge' ? '充电模式 · OBC 车载充电机 · CC/CV' : '○ 待机 · 三电系统待机',
        W / 2, 27
      );

      // ── 电池包（左）──
      const batX = 70, batY = 165;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = st === 'charge' ? '#00e676' : (st === 'drive' ? '#ffab00' : '#445'); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(batX - 42, batY - 65, 84, 130, 10); ctx.fill(); ctx.stroke();
      const soc = 0.65 + (st === 'charge' ? (t * 0.004) % 0.3 : st === 'drive' ? -((t * 0.003 * thr) % 0.3) : 0);
      const clampedSoc = Math.max(0.1, Math.min(0.95, soc));
      const filled = Math.round(clampedSoc * 8);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i < filled ? (clampedSoc > 0.7 ? '#00e676' : clampedSoc > 0.4 ? '#ff9800' : '#f44336') : '#334';
        ctx.beginPath(); ctx.roundRect(batX - 30, batY - 56 + i * 15, 60, 11, 2); ctx.fill();
      }
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`电池包`, batX, batY + 74);
      ctx.fillText(`${Math.round(clampedSoc * 100)}% SOC`, batX, batY + 86);

      // ── BMS ──
      const bmsX = batX + 60, bmsY = batY - 28;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bmsX - 20, bmsY - 14, 40, 28, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#00e676'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('BMS', bmsX, bmsY + 4);

      // ── 逆变器/VCU（中）──
      const invX = 240, invY = 165;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(invX - 44, invY - 54, 88, 108, 10); ctx.fill(); ctx.stroke();
      // IGBT 桥
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const bx = invX - 30 + c * 30, by = invY - 36 + r * 40;
          const pulse = active && (Math.floor(t * 6 + r * 3 + c * 1.5)) % 6 === c + r * 3;
          ctx.fillStyle = pulse ? ACC + '55' : '#334';
          ctx.shadowColor = pulse ? ACC : 'transparent'; ctx.shadowBlur = pulse ? 8 : 0;
          ctx.beginPath(); ctx.roundRect(bx - 10, by - 10, 20, 20, 3); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.fillStyle = ACC; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('逆变器', invX, invY + 30);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText(active ? `三相 IGBT / SiC` : 'DC-AC', invX, invY + 42);

      // ── PMSM 电机（右）──
      const motX = 390, motY = 165;
      const motorOn = st === 'drive';
      const regenOn = st === 'regen';
      const rotSpeed = motorOn ? thr * 0.3 : (regenOn ? -0.15 : 0);
      ctx.fillStyle = '#2a3040'; ctx.strokeStyle = (motorOn || regenOn) ? (motorOn ? '#ff9800' : '#40c4ff') : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(motX, motY, 40, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 定子绕组
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + t * rotSpeed * 20;
        const cols = ['#ff5252', '#00bcd4', '#00e676'];
        ctx.strokeStyle = (motorOn || regenOn) ? cols[i] : '#334'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(motX, motY);
        ctx.lineTo(motX + Math.cos(a) * 32, motY + Math.sin(a) * 32);
        ctx.stroke();
      }
      // 永磁转子
      const rota = t * rotSpeed * 20;
      ctx.fillStyle = '#3a4050'; ctx.strokeStyle = '#667';
      ctx.beginPath(); ctx.arc(motX, motY, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = motorOn ? '#ff9800' : (regenOn ? ACC : '#556');
      ctx.beginPath();
      ctx.arc(motX + Math.cos(rota) * 10, motY + Math.sin(rota) * 10, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(motX + Math.cos(rota + Math.PI) * 10, motY + Math.sin(rota + Math.PI) * 10, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('PMSM', motX, motY + 54);
      ctx.fillStyle = '#667'; ctx.font = '8px monospace';
      ctx.fillText(motorOn ? `${Math.round(thr * 12000)}rpm` : (regenOn ? '发电' : '停'), motX, motY + 65);

      // 导线
      ctx.setLineDash([4, 4]);
      // 电池→逆变器
      const dCol = st === 'drive' ? `rgba(255,171,0,${0.5 + 0.2 * Math.sin(t * 4)})` :
                   st === 'regen' ? `rgba(64,196,255,${0.5 + 0.2 * Math.sin(t * 4)})` :
                   st === 'charge' ? `rgba(0,230,118,${0.5 + 0.2 * Math.sin(t * 4)})` : 'rgba(80,90,110,.2)';
      ctx.strokeStyle = dCol; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(batX + 42, batY - 20); ctx.lineTo(invX - 44, invY - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(batX + 42, batY + 10); ctx.lineTo(invX - 44, invY + 10); ctx.stroke();
      // 逆变器→电机
      for (let i = 0; i < 3; i++) {
        const cols = ['#ff5252', '#00bcd4', '#00e676'];
        ctx.strokeStyle = active ? `${cols[i]}88` : 'rgba(80,90,110,.2)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(invX + 44, invY - 24 + i * 24); ctx.lineTo(motX - 40, motY - 24 + i * 24); ctx.stroke();
      }
      ctx.setLineDash([]);
      // 粒子
      if (active) {
        for (let p = 0; p < 3; p++) {
          const frac = ((t * 0.8 + p / 3) % 1);
          const dir = st === 'regen' ? 1 - frac : frac;
          const px = (st === 'regen' ? invX + 44 : batX + 42) + dir * ((st === 'regen' ? batX + 42 - invX - 44 : invX - 44 - batX - 42));
          ctx.fillStyle = dCol.startsWith('rgba') ? dCol : '#fff'; ctx.shadowColor = '#ff9800'; ctx.shadowBlur = 5;
          ctx.beginPath(); ctx.arc(px, batY - 20, 4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 减速器标注
      ctx.fillStyle = '#556'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('减速器', (invX + motX) / 2, invY + 86);
      ctx.fillText('10:1', (invX + motX) / 2, invY + 97);

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = `rgba(64,196,255,${0.7 + 0.3 * Math.sin(t * 3)})`;
      ctx.fillText(
        st === 'drive' ? `DC→逆变器三相AC→PMSM→减速器→车轮 | ${Math.round(thr * 350)}kW` :
        st === 'regen' ? '车轮→PMSM 发电→逆变器整流→回充电池（动能回收）' :
        st === 'charge' ? 'OBC: AC 220V → DC 高压→CC/CV 充电池' :
        '○ 待机：BMS 守护电芯，VCU 监控全车',
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

export default function EvPower() {
  const [state, setState] = useState('drive');
  const [throttle, setThrottle] = useState(60);
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
    <section id="ev-power" className="sec">
      <div className="sh">
        <span className="sh-icon">🚗</span>
        <div>
          <div className="sh-tag">EV · 三电系统 · PMSM · 能量回收</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>电动汽车三电</h2>
          <p className="sh-sub">电池包 + 电机 + 电控——电动车驱动、回收与充电全链路</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(64,196,255,.2)', flexDirection: 'column', gap: 14 }}>
          <EvCanvas stateRef={stateRef} throttleRef={throttleRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {btn('drive', '#ff9800', '🚗 驱动')}
            {btn('regen', ACC, '♻️ 能量回收')}
            {btn('charge', '#00e676', '🔌 充电')}
            {btn('idle', '#607d8b', '○ 待机')}
          </div>
          {state === 'drive' && (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>油门 {throttle}%（≈{Math.round(throttle * 3.5)}kW）</div>
              <input type="range" min={5} max={100} value={throttle} onChange={e => setThrottle(+e.target.value)}
                style={{ width: '100%', accentColor: '#ff9800' }} />
            </div>
          )}
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(64,196,255,.18)' }}>
            <div className="formula" style={{ color: ACC }}>电池 → 逆变器 → PMSM → 减速器</div>
            <div className="fdesc">三电：电池系统 + 驱动电机 + 电控系统</div>
          </div>
          <ICard color={ACC} title="⚡ 电控（逆变器/VCU）">
            VCU（整车控制器）根据油门信号调节逆变器 IGBT / SiC MOSFET 的 PWM，
            输出三相交流驱动 PMSM。矢量控制（FOC）实现精确扭矩响应。
          </ICard>
          <ICard color={ACC} title="🌀 PMSM 永磁同步电机">
            转子内置永磁体，效率高达 97%+，无碳刷维护。
            与 BLDC 原理相似，但使用正弦电流（FOC）而非方波，噪声低、平滑性更好。
          </ICard>
          <ICard color="#00e676" title="♻️ 制动能量回收">
            松油门/刹车时 PMSM 切换为发电机：机械能→电能→回充电池。
            典型回收率 15~25%，配合 One-Pedal 驾驶模式效果更佳。
          </ICard>
          <ICard color="#ff9800" title="📊 热管理系统">
            电池工作温区 15~35°C，超温降额。液冷板贴合电芯，
            热泵空调系统冬季同时为乘客和电池供暖，效率比 PTC 电阻加热提升 3 倍。
          </ICard>
        </div>
      </div>
    </section>
  );
}
