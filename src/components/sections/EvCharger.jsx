import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00bcd4';

function ChargerCanvas({ stateRef } ) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const st = stateRef.current;
      const charging = st === 'charge';
      const fast = st === 'dc';
      const active = charging || fast;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = active ? (fast ? 'rgba(255,152,0,.5)' : 'rgba(0,188,212,.45)') : 'rgba(60,70,90,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(
        fast ? 'DC 快充 · 250kW · 直流直充电池' :
        charging ? 'AC 慢充 · 7kW · OBC 车载充电机' : '待机 · 等待车辆连接 · CP 信号检测',
        W / 2, 27
      );

      const gpX = fast ? 330 : 280, gpY = 170;

      // ── 电网电源（左）──
      ctx.strokeStyle = '#667'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const wy = 140 + i * 25;
        ctx.strokeStyle = ['#f44336', '#bdbdbd', '#4caf50'][i]; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(20, wy); ctx.lineTo(80, wy); ctx.stroke();
      }
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('三相 380V', 50, 205);

      // ── 充电桩主体 ──
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = active ? ACC : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(85, 100, 100, 160, 10); ctx.fill(); ctx.stroke();
      // 桩屏幕
      ctx.fillStyle = '#0d1520'; ctx.beginPath(); ctx.roundRect(98, 112, 74, 44, 5); ctx.fill();
      ctx.fillStyle = active ? '#00e676' : '#445'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText(active ? (fast ? `${(250 * (0.8 + 0.2 * Math.sin(t * 2))).toFixed(0)}kW` : '7.0kW') : '---kW', 135, 130);
      ctx.fillStyle = ACC; ctx.font = '7px monospace';
      ctx.fillText(active ? `${(fast ? 400 + 20 * Math.sin(t * 1.5) : 30 + 3 * Math.sin(t)).toFixed(0)}V  ${active ? (fast ? '620' : '32') : '0'}A` : '-- V -- A', 135, 146);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText('充电桩', 135, 240);
      ctx.fillStyle = '#667'; ctx.font = '7px monospace';
      ctx.fillText(fast ? 'DC 直流桩' : 'AC 交流桩', 135, 252);
      // 充电枪连接线
      ctx.strokeStyle = active ? `rgba(0,188,212,${0.5 + 0.2 * Math.sin(t * 4)})` : 'rgba(80,90,110,.3)';
      ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(185, 175); ctx.lineTo(gpX - 38, gpY); ctx.stroke();
      ctx.setLineDash([]);

      // ── OBC / 或直流 ──
      if (!fast) {
        const obcX = 270, obcY = 170;
        ctx.fillStyle = '#1a2030'; ctx.strokeStyle = charging ? '#00e676' : '#334'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(obcX - 30, obcY - 25, 60, 50, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = charging ? '#00e676' : '#446'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('OBC', obcX, obcY - 8);
        ctx.fillStyle = '#889'; ctx.font = '7px monospace';
        ctx.fillText('车载充电机', obcX, obcY + 5);
        ctx.fillText('AC→DC', obcX, obcY + 17);
        // OBC→电池 导线
        ctx.strokeStyle = charging ? `rgba(0,188,212,${0.5 + 0.2 * Math.sin(t * 4)})` : '#2a3040';
        ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(obcX + 30, obcY); ctx.lineTo(gpX - 36, gpY); ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── 电池包 ──
      const batCols = 6;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = active ? '#00e676' : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(gpX - 36, gpY - 55, 72, 110, 8); ctx.fill(); ctx.stroke();
      const soc = 0.45 + (active ? (t * 0.003) % 0.45 : 0);
      const filled = Math.round(batCols * soc);
      for (let i = 0; i < batCols; i++) {
        ctx.fillStyle = i < filled ? (soc > 0.8 ? '#00e676' : soc > 0.5 ? '#ffab00' : '#f44336') : '#334';
        ctx.beginPath(); ctx.roundRect(gpX - 28, gpY - 46 + i * 17, 56, 13, 2); ctx.fill();
      }
      ctx.fillStyle = active ? '#00e676' : '#667'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('车载电池', gpX, gpY + 64);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText(`${Math.round(soc * 100)}% SOC`, gpX, gpY + 76);

      // ── BMS ──
      const bmsX = gpX + 50, bmsY = gpY - 20;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = active ? '#00e676' : '#334'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(bmsX - 24, bmsY - 18, 48, 36, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = active ? '#00e676' : '#446'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('BMS', bmsX, bmsY - 3); ctx.fillStyle = '#889'; ctx.font = '7px monospace'; ctx.fillText('均衡保护', bmsX, bmsY + 10);

      // CP 信号波形（底部）
      const cpY = 275;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(30, cpY - 18, 180, 36, 5); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = active ? '#ffab00' : '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < 160; x++) {
        const px = 40 + x, phase = (x / 20 + t * 3) % 1;
        const py = cpY + (phase < 0.5 ? -10 : 6) * (active ? 1 : 0.3);
        x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('CP 导引信号', 120, cpY + 22);

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = active ? `rgba(0,188,212,${0.7 + 0.3 * Math.sin(t * 3)})` : 'rgba(100,120,145,.6)';
      ctx.fillText(
        fast ? 'DC 直流快充：电流直接注入电池，功率可达 250kW，30min 充至 80%' :
        charging ? 'AC 慢充：220/380V → OBC → DC 给电池，7kW 满电约 8 小时' :
        '○ 待机：CP 信号 1kHz PWM 占空比携带最大允许充电电流信息',
        W / 2, H - 10
      );

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stateRef]);

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

export default function EvCharger() {
  const [state, setState] = useState('idle');
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  const btn = (id, col, label) => (
    <button onClick={() => setState(id)} style={{
      padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${state === id ? col : 'rgba(255,255,255,.12)'}`,
      background: state === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: state === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="ev-charger" className="sec">
      <div className="sh">
        <span className="sh-icon">🔌</span>
        <div>
          <div className="sh-tag">EV CHARGER · AC 慢充 · DC 快充 · OBC</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>充电桩</h2>
          <p className="sh-sub">AC 交流 7kW 慢充 vs DC 直流 250kW 快充——原理与选型对比</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 14 }}>
          <ChargerCanvas stateRef={stateRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {btn('idle', '#607d8b', '○ 待机')}
            {btn('charge', ACC, '⚡ AC 慢充 7kW')}
            {btn('dc', '#ff9800', '🚀 DC 快充 250kW')}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,188,212,.18)' }}>
            <div className="formula" style={{ color: ACC }}>AC慢充: 电网→OBC→电池</div>
            <div className="fdesc">DC快充: 电网→整流→直接注入电池（绕过OBC）</div>
          </div>
          <ICard color={ACC} title="🔌 CP 导引信号">
            充电枪插入后，充电桩在 CP 线上发送 <strong>1kHz PWM</strong> 信号：
            占空比携带最大允许电流信息（如占空比 25% = 16A 限流）。
            车辆响应确认握手，充电才开始。
          </ICard>
          <ICard color={ACC} title="🏠 AC 慢充 (7kW)">
            家用 7kW = 单相 220V × 32A。车载 OBC 将 AC 转为 DC 后按 CC/CV 给电池充电。
            充满一辆 60kWh 电车约需 8~9 小时，适合夜间充电。
          </ICard>
          <ICard color="#ff9800" title="⚡ DC 快充 (150~350kW)">
            桩内含大功率整流（PFC + DC-DC），直接输出高压直流（250~1000V DC），
            旁路 OBC 直接给电池补能。30min 可从 20% 补至 80%。
          </ICard>
          <ICard color="#ff5252" title="⚠️ 安全注意">
            DC 快充电缆内有冷却液循环，禁止折弯；雨天充电由桩侧防护，勿私接延长线；
            充满后及时拔枪——过充保护虽有但减少寿命。
          </ICard>
        </div>
      </div>
    </section>
  );
}
