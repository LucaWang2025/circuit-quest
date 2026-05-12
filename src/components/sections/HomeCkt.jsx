import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ffab00';

// ── House Circuit Canvas ──────────────────────────────────
function HouseCktCanvas({ activeBreaker }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = setupHiDpi(cv, 360, 310);
    const W = 360, H = 310;
    let t = 0, rafId;

    // Wire paths: [x1,y1,x2,y2, label, color]
    const LIVE  = '#ff5252';
    const NEUT  = '#c8dce8';
    const GND   = '#4caf50';
    const DIM   = 'rgba(200,220,232,0.2)';

    const routes = [
      // Main panel feeds
      { path: [[40, 80],[40,200]], c: LIVE,  w: 3 },
      { path: [[60, 80],[60,200]], c: NEUT,  w: 3 },
      { path: [[50,200],[50,290]], c: GND,   w: 3 },
      // Branch to lighting
      { path: [[40,120],[200,120],[200,60],[270,60]],  c: activeBreaker === 'light' ? LIVE : DIM, w: 2 },
      { path: [[60,120],[200,120],[200,70],[270,70]],  c: activeBreaker === 'light' ? NEUT : DIM, w: 2 },
      // Branch to outlet
      { path: [[40,160],[200,160],[200,160],[270,160]], c: activeBreaker === 'outlet' ? LIVE : DIM, w: 2 },
      { path: [[60,160],[200,170],[200,170],[270,170]], c: activeBreaker === 'outlet' ? NEUT : DIM, w: 2 },
      { path: [[50,200],[200,200],[200,180],[270,180]], c: activeBreaker === 'outlet' ? GND  : DIM, w: 2 },
      // Branch to AC
      { path: [[40,200],[200,200],[200,250],[270,250]], c: activeBreaker === 'ac' ? LIVE : DIM, w: 3 },
      { path: [[60,200],[200,210],[200,260],[270,260]], c: activeBreaker === 'ac' ? NEUT : DIM, w: 3 },
    ];

    function drawPolyline(pts, color, width, glowing = false) {
      if (glowing) { ctx.shadowColor = color; ctx.shadowBlur = 8; }
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawComponent(x, y, label, color, active) {
      ctx.fillStyle = active ? `rgba(${color},0.22)` : 'rgba(255,255,255,0.05)';
      ctx.strokeStyle = active ? `rgba(${color},0.8)` : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x - 28, y - 18, 56, 36, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = active ? `rgba(${color},1)` : 'rgba(200,220,232,0.4)';
      ctx.font = '11px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 5);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.04;

      // Grid
      ctx.strokeStyle = 'rgba(255,171,0,0.05)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // === Panel box ===
      ctx.strokeStyle = 'rgba(255,171,0,0.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(20, 50, 60, 170, 8); ctx.stroke();
      ctx.fillStyle = 'rgba(255,171,0,0.08)'; ctx.fill();
      ctx.fillStyle = ACC; ctx.font = 'bold 10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('配电箱', 50, 38);

      // Main breaker
      ctx.fillStyle = '#ffab00'; ctx.beginPath(); ctx.roundRect(30, 58, 40, 22, 4); ctx.fill();
      ctx.fillStyle = '#1a0a00'; ctx.font = 'bold 9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('总闸', 50, 73);

      // Branch breakers
      [['照明', 'light', 90], ['插座', 'outlet', 120], ['空调', 'ac', 155]].forEach(([label, id, y]) => {
        const isOn = activeBreaker === id;
        ctx.fillStyle = isOn ? 'rgba(0,230,118,.5)' : 'rgba(255,82,82,.3)';
        ctx.strokeStyle = isOn ? 'rgba(0,230,118,.8)' : 'rgba(255,82,82,.5)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(30, y, 40, 20, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isOn ? '#00e676' : '#ff5252'; ctx.font = '9px "Courier New",monospace';
        ctx.fillText(`${label}${isOn ? '✓' : '✗'}`, 50, y + 13);
      });

      // Wires
      routes.forEach(r => {
        const glowing = r.c !== DIM;
        drawPolyline(r.path, r.c, r.w, glowing);
        // Flowing dots on active lines
        if (glowing) {
          const pts = r.path;
          const totalLen = pts.reduce((acc, pt, i) => {
            if (i === 0) return 0;
            const dx = pt[0] - pts[i - 1][0], dy = pt[1] - pts[i - 1][1];
            return acc + Math.sqrt(dx * dx + dy * dy);
          }, 0);
          const dotPhase = (t * 60) % totalLen;
          let len = 0;
          for (let i = 1; i < pts.length; i++) {
            const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
            const seg = Math.sqrt(dx * dx + dy * dy);
            if (dotPhase >= len && dotPhase < len + seg) {
              const frac = (dotPhase - len) / seg;
              const ex = pts[i - 1][0] + dx * frac, ey = pts[i - 1][1] + dy * frac;
              ctx.fillStyle = r.c; ctx.shadowColor = r.c; ctx.shadowBlur = 6;
              ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2); ctx.fill();
              ctx.shadowBlur = 0;
            }
            len += seg;
          }
        }
      });

      // Components
      const isLight  = activeBreaker === 'light';
      const isOutlet = activeBreaker === 'outlet';
      const isAc     = activeBreaker === 'ac';

      // Lightbulb
      ctx.fillStyle = isLight ? `rgba(255,230,0,${0.5 + 0.3 * Math.sin(t * 3)})` : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = isLight ? '#ffe000' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(300, 65, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (isLight) { ctx.shadowColor = '#ffe000'; ctx.shadowBlur = 22; ctx.fill(); ctx.shadowBlur = 0; }
      ctx.fillStyle = isLight ? '#fff8' : 'rgba(200,220,232,0.3)'; ctx.font = '14px serif';
      ctx.fillText('💡', 293, 72);

      // Outlet
      ctx.strokeStyle = isOutlet ? 'rgba(0,229,255,.8)' : 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(275, 148, 50, 36, 4); ctx.stroke();
      ctx.fillStyle = isOutlet ? '#0af' : 'rgba(200,220,232,0.15)'; ctx.font = '9px "Courier New",monospace';
      ctx.textAlign = 'center'; ctx.fillText('插座', 300, 170);

      // AC unit
      ctx.strokeStyle = isAc ? 'rgba(0,188,212,.8)' : 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(272, 238, 56, 32, 4); ctx.stroke();
      ctx.fillStyle = isAc ? '#00bcd4' : 'rgba(200,220,232,0.15)';
      ctx.fillText('空调', 300, 258);

      // Legend
      ctx.textAlign = 'left';
      const legend = [['─', LIVE, '火线 L（棕/红）'], ['─', NEUT, '零线 N（蓝）'], ['─', GND, '地线 PE（黄绿）']];
      legend.forEach(([sym, c, text], i) => {
        ctx.strokeStyle = c; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(18, H - 55 + i * 17); ctx.lineTo(36, H - 55 + i * 17); ctx.stroke();
        ctx.fillStyle = 'rgba(200,220,232,0.55)'; ctx.font = '10.5px "Courier New",monospace';
        ctx.fillText(text, 42, H - 50 + i * 17);
      });

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [activeBreaker]);
  return <canvas ref={ref} width={360} height={310} />;
}

const BREAKERS = [
  { id: 'light',  label: '照明回路',  icon: '💡', desc: '控制房间内所有灯具，通常 10A 断路器，导线截面 ≥ 1.5mm²' },
  { id: 'outlet', label: '普通插座',  icon: '🔌', desc: '控制普通插座，通常 16A，导线 ≥ 2.5mm²，支持大多数家电' },
  { id: 'ac',     label: '空调专线',  icon: '❄️', desc: '空调独占一路，20~32A，导线 4~6mm²，避免与其他设备共用' },
];

const CONCEPTS = [
  { icon: '🔴', t: '火线 L', color: '#ff5252', d: '带电导线，对地电压 220V（中国标准）。颜色：棕色或红色，碰触会触电，最危险。' },
  { icon: '🔵', t: '零线 N', color: '#64b5f6', d: '与大地相连的回路线，正常时对地电压接近 0V。颜色：蓝色，但断线后也可能带电！' },
  { icon: '🟢', t: '地线 PE', color: '#4caf50', d: '保护接地线，将设备外壳与大地连接。颜色：黄绿双色，漏电时提供安全泄流路径。' },
  { icon: '⚡', t: '断路器 MCB', color: '#ffab00', d: '过载或短路时自动断开回路的保护装置，比保险丝可靠，可手动复位重复使用。' },
  { icon: '🛡️', t: '漏电保护 RCD', color: '#9c7dff', d: '检测火线和零线电流差，差值超过 30mA 时在 0.1s 内断电，是防触电的重要防线。' },
  { icon: '🏠', t: '配电箱', color: '#00bcd4', d: '汇集全屋电路断路器的金属箱体，通常在入户门旁，所有回路均从此分出。' },
];

export default function HomeCkt() {
  const [activeBreaker, setActiveBreaker] = useState('light');

  return (
    <section id="home-ckt" className="sec">
      <div className="sh">
        <span className="sh-icon">🏠</span>
        <div className="sh-tag">Stage 2 · Home Electrical System</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,171,0,.4)` }}>
          家用电路基础
        </h2>
        <p className="sh-sub">了解家庭配电系统的组成，认识火线、零线、地线的作用，掌握断路器和各回路的关系。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Circuit diagram + breaker selector */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,171,0,.2)', flexDirection: 'column', gap: 14 }}>
          <HouseCktCanvas activeBreaker={activeBreaker} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {BREAKERS.map(b => (
              <button key={b.id} onClick={() => setActiveBreaker(b.id)} style={{
                padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${activeBreaker === b.id ? ACC : 'rgba(255,171,0,.22)'}`,
                background: activeBreaker === b.id ? 'rgba(255,171,0,.18)' : 'transparent',
                color: activeBreaker === b.id ? ACC : 'var(--dim)',
                font: '12.5px/1 inherit', transition: 'all .18s',
              }}>{b.icon} {b.label}</button>
            ))}
          </div>
          <div className="icard" style={{ width: '88%', borderColor: 'rgba(255,171,0,.2)', textAlign: 'left', padding: '12px 16px' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 6, fontSize: 14 }}>
              {BREAKERS.find(b => b.id === activeBreaker)?.icon} {BREAKERS.find(b => b.id === activeBreaker)?.label}
            </div>
            <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>
              {BREAKERS.find(b => b.id === activeBreaker)?.desc}
            </div>
          </div>
        </div>

        {/* AC vs DC */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center', marginBottom: 4 }}>
            ⚡ 交流 vs 直流
          </div>
          {[
            { t: '交流电 AC', color: '#ff6b35', items: ['频率 50Hz，每秒换向 100 次', '家庭用电标准：220V / 50Hz', '长距离输电损耗小，是电网主力', '空调、洗衣机、热水器均使用 AC'] },
            { t: '直流电 DC', color: '#00bcd4', items: ['电压方向固定不变', '手机、电脑内部电路使用 DC', '充电器、开关电源将 AC 转为 DC', 'USB 标准：5V DC / PD最高 20V'] },
          ].map(row => (
            <div key={row.t} className="glass" style={{ borderColor: `rgba(${row.color === '#ff6b35' ? '255,107,53' : '0,188,212'},.2)` }}>
              <div style={{ fontWeight: 700, color: row.color, marginBottom: 10, fontSize: 15 }}>{row.t}</div>
              {row.items.map(item => (
                <div key={item} style={{ fontSize: 13, color: '#8aacb8', display: 'flex', gap: 8, marginBottom: 6, lineHeight: 1.5 }}>
                  <span style={{ color: row.color, flexShrink: 0 }}>▸</span>{item}
                </div>
              ))}
            </div>
          ))}
          <div className="glass reveal" style={{ borderColor: 'rgba(255,171,0,.18)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10 }}>🇨🇳 中国家用电气标准</div>
            {[['电压', '220 V（单相）/ 380 V（三相）'],['频率', '50 Hz'],['插座', '两孔 + 三孔（扁孔）'],['接地', '必须有独立接地线'],['断路器', 'C 型曲线适合家用感性负载'],].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <span style={{ color: ACC, width: 60, flexShrink: 0, font: '12px "Courier New",monospace' }}>{k}</span>
                <span style={{ color: '#c8dce8' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core concepts */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          📚 核心概念详解
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {CONCEPTS.map(c => (
            <div key={c.t} className="glass reveal" style={{ borderColor: `rgba(${c.color.slice(1).match(/.{2}/g).map(x=>parseInt(x,16)).join(',')}, .18)` }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: c.color, marginBottom: 7, fontSize: 14 }}>{c.t}</div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.65 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wiring rules */}
      <div style={{ marginTop: 32, background: 'rgba(255,171,0,.07)', border: '1px solid rgba(255,171,0,.25)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 14 }}>📋 家用配电常见规则</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {[
            '照明回路和插座回路必须分开布线',
            '厨房、卫生间插座必须有独立回路',
            '大功率设备（空调、热水器）独占专线',
            '每个回路前端必须安装断路器保护',
            '总进线必须安装带漏电保护的断路器',
            '所有接线头必须放在接线盒内，禁止裸露',
            '穿线管内禁止有接头，接头只能在盒内',
            '进户总线截面积一般不小于 10mm²',
          ].map(rule => (
            <div key={rule} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8aacb8', lineHeight: 1.5 }}>
              <span style={{ color: ACC, flexShrink: 0 }}>✓</span>{rule}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
