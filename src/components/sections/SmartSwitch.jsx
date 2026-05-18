import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00e5ff';

function SmartCanvas({ stateRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const st = stateRef.current; // wifi / zigbee / timer / off
      const active = st !== 'off';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = active ? 'rgba(0,229,255,.42)' : 'rgba(60,70,90,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = active ? '#111' : '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      const labels = { wifi: 'WiFi 智能开关 · 云端控制 · 2.4GHz', zigbee: 'Zigbee 智能开关 · 网关桥接 · 2.4GHz', timer: '定时开关 · MCU RTC 控制 · 无云依赖', off: '关闭 · 待机仅 0.1W · MCU 监听' };
      ctx.fillText(labels[st] || labels.off, W / 2, 27);

      // ── 开关面板 ──
      const swX = 110, swY = 165;
      ctx.fillStyle = '#2a3545'; ctx.strokeStyle = active ? ACC : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(swX - 40, swY - 65, 80, 130, 10); ctx.fill(); ctx.stroke();
      // 触摸区
      ctx.fillStyle = active ? `rgba(0,229,255,${0.12 + 0.06 * Math.sin(t * 3)})` : '#1a2030';
      ctx.beginPath(); ctx.roundRect(swX - 28, swY - 50, 56, 56, 8); ctx.fill();
      ctx.strokeStyle = active ? ACC : '#445'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(swX - 28, swY - 50, 56, 56, 8); ctx.stroke();
      ctx.fillStyle = active ? ACC : '#556'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(active ? 'ON' : 'OFF', swX, swY - 18);
      // 状态 LED
      ctx.fillStyle = active ? '#00e676' : '#334';
      ctx.shadowColor = active ? '#00e676' : 'transparent'; ctx.shadowBlur = active ? 8 : 0;
      ctx.beginPath(); ctx.arc(swX, swY + 15, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('智能开关', swX, swY + 50);

      // ── 内部电路图（右侧面板内）──
      const cX = 265, cY = 165;

      // 电源（L+N）
      ctx.strokeStyle = '#f44336'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, 145); ctx.lineTo(80, 145); ctx.stroke();
      ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, 195); ctx.lineTo(80, 195); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('L', 30, 140); ctx.fillText('N', 30, 190);

      // 变压器/降压电路（MCU供电）
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(82, 130, 44, 50, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#667'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('降压电路', 104, 148);
      ctx.fillText('220V→3.3V', 104, 162);

      // MCU
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = active ? ACC : '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(cX - 32, cY - 28, 64, 56, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = active ? ACC : '#556'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('MCU', cX, cY - 8);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText('ESP32/EFR32', cX, cY + 5);
      ctx.fillText(active ? (st === 'timer' ? 'RTC 定时' : '联网中') : '监听中', cX, cY + 18);

      // TRIAC/继电器（负载控制）
      const trX = 370, trY = 165;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = active ? '#00e676' : '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(trX - 28, trY - 28, 56, 56, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = active ? '#00e676' : '#556'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('继电器', trX, trY - 6);
      ctx.fillText(active ? '闭合' : '断开', trX, trY + 8);
      ctx.fillText('10A', trX, trY + 20);
      // 继电器→负载
      ctx.strokeStyle = active ? `rgba(0,230,118,${0.5 + 0.2 * Math.sin(t * 4)})` : 'rgba(80,90,110,.25)';
      ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(trX + 28, trY); ctx.lineTo(450, trY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#667'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(active ? '💡 灯亮' : '💡 灯灭', 462, trY + 3);

      // MCU→继电器
      ctx.strokeStyle = active ? `rgba(0,229,255,${0.5 + 0.2 * Math.sin(t * 5)})` : '#334';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cX + 32, cY + 10); ctx.lineTo(trX - 28, trY + 10); ctx.stroke();
      ctx.fillStyle = '#667'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('GPIO 驱动', (cX + trX) / 2, cY + 24);

      // 无线信号
      if (active && st !== 'timer') {
        for (let r = 1; r <= 3; r++) {
          const radius = r * 18 + (t * 15 % 18);
          const alpha = Math.max(0, 0.5 - r * 0.12 - (t * 15 % 18) / 18 * 0.5);
          ctx.strokeStyle = `rgba(0,229,255,${alpha})`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(swX, swY - 80, radius, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        }
        ctx.fillStyle = '#00bcd4'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillText(st === 'zigbee' ? 'Zigbee' : 'WiFi', swX, swY - 105);
      }

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = active ? `rgba(0,229,255,${0.7 + 0.3 * Math.sin(t * 3)})` : 'rgba(100,120,145,.6)';
      ctx.fillText(
        st === 'wifi' ? '手机/语音→云端→2.4GHz→ESP32 MCU→GPIO→继电器→开灯' :
        st === 'zigbee' ? 'Zigbee 网关→低功耗 mesh→MCU→继电器，不依赖云端' :
        st === 'timer' ? 'MCU RTC 定时器→到时触发 GPIO→继电器动作，纯本地离线控制' :
        '○ 待机 0.1W：MCU 持续监听 WiFi/Zigbee 指令',
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

export default function SmartSwitch() {
  const [state, setState] = useState('wifi');
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
    <section id="smart-switch" className="sec">
      <div className="sh">
        <span className="sh-icon">💡</span>
        <div>
          <div className="sh-tag">SMART SWITCH · WiFi · Zigbee · MCU</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>智能开关</h2>
          <p className="sh-sub">降压取电 + MCU + 无线通信 + 继电器——智能开关电路全解析</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,229,255,.2)', flexDirection: 'column', gap: 14 }}>
          <SmartCanvas stateRef={stateRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {btn('wifi', ACC, '📶 WiFi 控')}
            {btn('zigbee', '#7c4dff', '🌐 Zigbee')}
            {btn('timer', '#ff9800', '⏰ 定时')}
            {btn('off', '#607d8b', '○ 关闭')}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,229,255,.18)' }}>
            <div className="formula" style={{ color: ACC }}>220V → 降压 → MCU → GPIO → 继电器</div>
            <div className="fdesc">待机功耗仅 0.1W，支持多种无线协议</div>
          </div>
          <ICard color={ACC} title="⚡ 降压取电电路">
            智能开关内置阻容降压或小型变压器，将 220V 降至 MCU 工作所需的 3.3V/5V DC，
            保证待机状态下 MCU 持续运行监听，待机功耗 &lt; 0.1W。
          </ICard>
          <ICard color={ACC} title="📶 WiFi vs Zigbee">
            <strong style={{ color: ACC }}>WiFi</strong>：无需网关，直连路由器，方便；断网则无法远程控制。
            <strong style={{ color: '#7c4dff' }}> Zigbee</strong>：低功耗 mesh，需网关，延迟更低，可本地自动化，
            不依赖云端，更适合智能家居生态。
          </ICard>
          <ICard color={ACC} title="🔧 继电器 vs 双向可控硅">
            <strong>继电器</strong>：机械触点，适合纯阻性/感性负载，有声音。
            <strong>双向可控硅（TRIAC）</strong>：无触点，调光用（PWM），寿命更长，但待机略发热。
          </ICard>
          <ICard color="#ff9800" title="🔌 安装接线">
            替换传统开关：L 进→开关→L 出→灯；N 线接 MCU 供电参考端（零火 2 线接法，某些旧房无N线需单火模块）。
          </ICard>
        </div>
      </div>
    </section>
  );
}
