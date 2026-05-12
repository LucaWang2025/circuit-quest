import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00e676';

function RouterCanvas({ activePort }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = setupHiDpi(cv, 360, 280);
    const W = 360, H = 280;
    let t = 0, raf;

    const PORTS = [
      { label: 'WAN', color: '#ff9800', x: 0.28 },
      { label: 'LAN1', color: ACC, x: 0.40 },
      { label: 'LAN2', color: ACC, x: 0.52 },
      { label: 'LAN3', color: ACC, x: 0.64 },
      { label: 'LAN4', color: ACC, x: 0.76 },
    ];

    function drawSignalRing(cx, cy, r, color, phase) {
      const rings = 3;
      for (let i = 1; i <= rings; i++) {
        const progress = ((t * 0.8 + phase - i * 0.35) % 1 + 1) % 1;
        const alpha = (1 - progress) * 0.5;
        ctx.beginPath(); ctx.arc(cx, cy, r * i * progress + r * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5; ctx.stroke();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      // Router body
      const RX = W / 2, RY = H * 0.55;
      const RW = 220, RH = 60;
      const bodyGrad = ctx.createLinearGradient(RX - RW/2, RY - RH/2, RX + RW/2, RY + RH/2);
      bodyGrad.addColorStop(0, '#2a2a3e'); bodyGrad.addColorStop(1, '#1a1a2a');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.roundRect(RX - RW/2, RY - RH/2, RW, RH, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(0,230,118,.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(RX - RW/2, RY - RH/2, RW, RH, 8); ctx.stroke();

      // Antennas
      const antennaPositions = [-0.4, -0.1, 0.1, 0.4];
      antennaPositions.forEach((offset, i) => {
        const ax = RX + RW * offset;
        const ayBase = RY - RH / 2;
        ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ax, ayBase); ctx.lineTo(ax, ayBase - 55); ctx.stroke();
        // Antenna tip glow
        ctx.fillStyle = 'rgba(0,230,118,.6)'; ctx.shadowColor = ACC; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.arc(ax, ayBase - 56, 3, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // WiFi signal
        drawSignalRing(ax, ayBase - 56, 8, ACC, i * 0.25);
      });

      // Status LEDs
      const ledData = [
        { label: 'PWR', color: '#00e676', x: -0.38 },
        { label: 'SYS', color: '#ffab00', x: -0.24 },
        { label: 'WLAN', color: '#00bcd4', x: -0.10 },
        { label: 'WAN', color: '#ff9800', x: 0.06 },
        { label: 'LAN', color: '#00e676', x: 0.22 },
      ];
      ledData.forEach(led => {
        const blink = led.label === 'WAN' || led.label === 'LAN';
        const on = blink ? Math.sin(t * 8 + led.x * 10) > 0 : true;
        const lx = RX + RW * led.x * 0.5; const ly = RY - RH / 2 + 12;
        ctx.fillStyle = on ? led.color : led.color + '22';
        if (on) { ctx.shadowColor = led.color; ctx.shadowBlur = 5; }
        ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(200,220,232,.25)'; ctx.font = '7px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText(led.label, lx, ly + 11);
      });

      // Ports at bottom of router
      PORTS.forEach(p => {
        const px = W * p.x, py = RY + RH / 2;
        const isActive = activePort === p.label;
        ctx.fillStyle = isActive ? p.color + '30' : '#333';
        ctx.strokeStyle = isActive ? p.color : '#555'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(px - 8, py, 16, 10, 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isActive ? p.color : 'var(--dim)'; ctx.font = '7px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText(p.label, px, py + 20);
        // Data flow
        if (isActive) {
          const progress = (t * 1.5) % 1;
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(px, py - 20 * progress, 3, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Power adapter (left)
      const adX = 42, adY = RY - 8;
      ctx.fillStyle = '#2a2a3e'; ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(adX - 16, adY - 22, 32, 44, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '8px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('12V', adX, adY - 5); ctx.fillText('1.5A', adX, adY + 5);
      // Power cord to router
      ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(adX + 16, adY); ctx.lineTo(RX - RW/2, adY); ctx.stroke();
      const dc = (t * 0.8) % 1;
      ctx.fillStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.arc(adX + 16 + (RX - RW/2 - adX - 16) * dc, adY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = ACC + '88'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('DC 12V', (adX + RX - RW/2)/2, adY - 8);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [activePort]);
  return <canvas ref={ref} width={360} height={280} style={{ maxWidth: '100%' }} />;
}

const POWER_STAGES = [
  { v: '220V AC', label: '市电输入', color: '#ff6b35', w: 220 },
  { v: '12V DC', label: 'SMPS输出', color: '#ffab00', w: 180 },
  { v: '5V / 3.3V', label: 'DC-DC降压', color: ACC, w: 160 },
  { v: '1.2V / 1.8V', label: 'SoC内核', color: '#9c7dff', w: 130 },
];

export default function Router() {
  const [activePort, setActivePort] = useState('LAN1');

  return (
    <section id="router" className="sec">
      <div className="sh">
        <span className="sh-icon">📡</span>
        <div className="sh-tag">Stage 3 · Small Appliance · WiFi Router</div>
        <h2 className="sh-title" style={{ color: ACC }}>WiFi 路由器电路设计</h2>
        <p className="sh-sub">开关电源 SMPS、多路 DC-DC 降压、SoC 处理器供电、RF 射频前端——路由器的完整电源与信号架构。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.18)', flexDirection: 'column', gap: 14 }}>
          <RouterCanvas activePort={activePort} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['WAN','LAN1','LAN2','LAN3','LAN4'].map(p => (
              <button key={p} onClick={() => setActivePort(p)} style={{
                padding: '5px 13px', borderRadius: 16, cursor: 'pointer',
                border: `1px solid ${activePort === p ? (p === 'WAN' ? '#ff9800' : ACC) : 'rgba(255,255,255,.12)'}`,
                background: activePort === p ? `rgba(${p === 'WAN' ? '255,152,0' : '0,230,118'},.12)` : 'transparent',
                color: activePort === p ? (p === 'WAN' ? '#ff9800' : ACC) : 'var(--dim)',
                font: '12px/1 inherit', transition: 'all .18s',
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Power stages */}
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2 }}>⚡ 供电链路（220V → 芯片核心）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {POWER_STAGES.map((s, i) => (
              <div key={s.v} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: s.w, height: 32, borderRadius: 6, background: `${s.color}18`, border: `1px solid ${s.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ font: 'bold 13px "Courier New",monospace', color: s.color }}>{s.v}</span>
                  <span style={{ fontSize: 11, color: 'var(--dim)' }}>{s.label}</span>
                </div>
                {i < POWER_STAGES.length - 1 && <span style={{ color: s.color, fontSize: 14 }}>↓</span>}
              </div>
            ))}
          </div>

          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.15)', marginTop: 4 }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 8 }}>🔧 核心硬件模块</div>
            {[
              ['SoC 主芯片', '#00e676', '高通 IPQ / 联发科 MT76xx，集成 CPU + 网络交换 + WiFi 基带，运行 OpenWrt 等嵌入式 Linux'],
              ['RF 射频前端', '#00bcd4', '2.4G / 5G / 6G 三频各有独立 PA（功放）和 LNA（低噪放），控制发射功率（20~30 dBm）'],
              ['DDR 内存', '#9c7dff', 'DDR3/DDR4 128MB~1GB，存储路由表、连接状态、固件缓存，直接影响多设备连接性能'],
              ['Flash 存储', '#ffab00', 'SPI Nor/Nand Flash 8~256MB，存储固件（OpenWrt/Padavan），可刷自定义固件'],
            ].map(([n, c, d]) => (
              <div key={n} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <span style={{ fontWeight: 700, color: c, fontSize: 12 }}>{n}</span>
                <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.55, marginTop: 2 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
        {[
          { title: '📶 WiFi 频段功耗对比', color: ACC, rows: [['2.4 GHz','穿墙强，速率低','约 3~5W'],['5 GHz','速率高，距离短','约 5~8W'],['6 GHz（WiFi 6E）','超高速，新设备','约 6~10W'],['总整机功耗','典型路由器','8~25W']] },
          { title: '🔌 适配器规格解读', color: '#ffab00', rows: [['输入','100~240V AC 50/60Hz','全球通用'],['输出','12V DC 1~3A','取决于路由器'],['接口','DC 5.5/2.1mm','常见规格'],['代换要求','电压必须匹配','电流≥原规格']] },
          { title: '⚠️ 维修排查', color: '#ff6b35', rows: [['不开机','先测适配器输出电压','电压正确再查保险'],['频繁断网','检查散热，CPU过热','或 Flash 有坏块'],['WiFi信号弱','天线连接松动','或PA芯片损坏'],['端口不通','用万用表测PHY芯片','或换网线排查']] },
        ].map(card => (
          <div key={card.title} className="glass reveal" style={{ borderColor: card.color + '22' }}>
            <div style={{ fontWeight: 700, color: card.color, marginBottom: 10, fontSize: 13 }}>{card.title}</div>
            {card.rows.map(r => (
              <div key={r[0]} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,.05)', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: card.color, font: '11px "Courier New",monospace', minWidth: 70 }}>{r[0]}</span>
                <span style={{ color: '#8aacb8', flex: 1 }}>{r[1]}</span>
                {r[2] && <span style={{ color: 'var(--dim)', fontSize: 11 }}>{r[2]}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
