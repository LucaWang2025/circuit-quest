import { useEffect, useRef, useState } from 'react';

const ACC = '#ffd740';   // amber

// ── Flashlight + Battery Canvas ───────────────────────────
function FlashlightCanvas({ mode, soc, charging }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, rafId;

    const MODES = { off: 0, eco: 0.12, low: 0.3, mid: 0.6, high: 0.88, turbo: 1 };
    const brightness = MODES[mode] ?? 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      // ── Flashlight body (left) ──
      const FX = W * 0.28, FY = H * 0.5;

      // Beam (behind flashlight)
      if (brightness > 0) {
        const beamAlpha = brightness * (0.7 + 0.12 * Math.sin(t * 3));
        const bLen = brightness * 140;
        const grad = ctx.createRadialGradient(FX + 32, FY, 8, FX + 80, FY, bLen);
        grad.addColorStop(0, `rgba(255,230,100,${beamAlpha})`);
        grad.addColorStop(0.4, `rgba(255,215,64,${beamAlpha * 0.35})`);
        grad.addColorStop(1, 'rgba(255,215,64,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(FX + 32, FY - 22); ctx.lineTo(FX + bLen + 40, FY - bLen * 0.55); ctx.lineTo(FX + bLen + 40, FY + bLen * 0.55); ctx.lineTo(FX + 32, FY + 22); ctx.closePath(); ctx.fill();
        // Center hot spot
        ctx.shadowColor = '#ffd740'; ctx.shadowBlur = brightness * 25;
        ctx.fillStyle = `rgba(255,255,200,${brightness * 0.9})`;
        ctx.beginPath(); ctx.arc(FX + 32, FY, 14 * brightness + 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Body tube
      const bodyGrad = ctx.createLinearGradient(FX - 55, FY - 12, FX + 5, FY + 12);
      bodyGrad.addColorStop(0, '#555'); bodyGrad.addColorStop(0.5, '#999'); bodyGrad.addColorStop(1, '#555');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.roundRect(FX - 60, FY - 13, 95, 26, 4); ctx.fill();
      // Grip knurling lines
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1;
      for (let x = FX - 55; x < FX + 30; x += 5) {
        ctx.beginPath(); ctx.moveTo(x, FY - 13); ctx.lineTo(x, FY + 13); ctx.stroke();
      }

      // Head (front)
      const headGrad = ctx.createLinearGradient(FX + 30, FY - 22, FX + 50, FY + 22);
      headGrad.addColorStop(0, '#666'); headGrad.addColorStop(0.5, '#aaa'); headGrad.addColorStop(1, '#666');
      ctx.fillStyle = headGrad;
      ctx.beginPath(); ctx.moveTo(FX + 30, FY - 14); ctx.lineTo(FX + 48, FY - 22); ctx.lineTo(FX + 52, FY - 22); ctx.lineTo(FX + 52, FY + 22); ctx.lineTo(FX + 48, FY + 22); ctx.lineTo(FX + 30, FY + 14); ctx.closePath(); ctx.fill();

      // LED inside head
      const ledColor = brightness > 0
        ? `rgba(255,245,${Math.round(200 - brightness * 100)},${brightness})`
        : 'rgba(150,150,150,.3)';
      ctx.fillStyle = ledColor;
      if (brightness > 0) { ctx.shadowColor = ACC; ctx.shadowBlur = brightness * 15; }
      ctx.beginPath(); ctx.arc(FX + 44, FY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Tail cap with USB-C port
      ctx.fillStyle = '#444'; ctx.strokeStyle = '#666'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(FX - 70, FY - 13, 12, 26, 3); ctx.fill(); ctx.stroke();
      // Type-C port
      ctx.fillStyle = '#222'; ctx.strokeStyle = charging ? '#00e676' : 'rgba(200,200,200,.3)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(FX - 68, FY - 4, 7, 8, 2); ctx.fill(); ctx.stroke();
      if (charging) {
        // Charging flow animation
        const cp = (t * 2) % 1;
        ctx.fillStyle = `rgba(0,230,118,${0.8 - cp * 0.6})`;
        ctx.shadowColor = '#00e676'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(FX - 61 - cp * 15, FY, 3, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00e676'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('充电中', FX - 70, FY + 28);
      }

      // Mode label
      ctx.fillStyle = brightness > 0 ? `rgba(255,215,64,${0.7 + 0.2 * Math.sin(t)})` : 'rgba(200,220,232,.3)';
      ctx.font = '11px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(mode.toUpperCase(), FX - 14, FY + 34);

      // ── Battery indicator (right side) ──
      const BX = W * 0.72, BY = H * 0.2;

      // Battery outline
      const voltage = 2.8 + soc / 100 * (4.2 - 2.8);
      ctx.strokeStyle = 'rgba(255,215,64,.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(BX - 20, BY, 40, 120, 5); ctx.stroke();
      // + terminal
      ctx.fillStyle = 'rgba(255,215,64,.4)'; ctx.beginPath(); ctx.roundRect(BX - 8, BY - 8, 16, 8, 3); ctx.fill();

      // Fill level
      const fillH = (soc / 100) * 112;
      const fillColor = soc > 50 ? '#00e676' : soc > 20 ? '#ffab00' : '#ff1744';
      ctx.fillStyle = fillColor + 'cc';
      ctx.shadowColor = fillColor; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.roundRect(BX - 17, BY + 4 + (112 - fillH), 34, fillH, 3); ctx.fill();
      ctx.shadowBlur = 0;

      // SOC %
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${soc}%`, BX, BY + 66);
      ctx.fillStyle = 'rgba(200,220,232,.6)'; ctx.font = '10px "Courier New",monospace';
      ctx.fillText(`${voltage.toFixed(2)}V`, BX, BY + 82);

      // Battery type label
      ctx.fillStyle = ACC; ctx.font = 'bold 10px "Courier New",monospace';
      ctx.fillText('18650', BX, BY + 136);

      // Charging lightning bolt
      if (charging) {
        ctx.fillStyle = `rgba(0,230,118,${0.7 + 0.3 * Math.sin(t * 4)})`;
        ctx.shadowColor = '#00e676'; ctx.shadowBlur = 10;
        ctx.font = '18px serif'; ctx.fillText('⚡', BX, BY - 18);
        ctx.shadowBlur = 0;
      }

      // Mode brightness bar
      const mbY = H - 52;
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      ctx.beginPath(); ctx.roundRect(W * 0.12, mbY, W * 0.76, 10, 5); ctx.fill();
      if (brightness > 0) {
        const barGrad = ctx.createLinearGradient(W * 0.12, mbY, W * 0.88, mbY);
        barGrad.addColorStop(0, '#ffab00'); barGrad.addColorStop(1, '#fff8e1');
        ctx.fillStyle = barGrad;
        ctx.shadowColor = ACC; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.roundRect(W * 0.12, mbY, W * 0.76 * brightness, 10, 5); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = 'rgba(255,215,64,.5)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`亮度 ${Math.round(brightness * 100)}%`, W / 2, mbY + 24);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [mode, soc, charging]);
  return <canvas ref={ref} width={340} height={260} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const BATTERIES = [
  {
    model: '18650', dia: '18 mm', len: '65 mm', color: '#ffab00',
    volt: '3.6 V（标称）/ 4.2 V（满电）/ 2.8 V（截止）',
    cap: '2000 ~ 3500 mAh（典型 3000 mAh）',
    maxI: '最大持续放电 10~20 A',
    energy: '约 11 Wh（3000mAh × 3.7V）',
    use: '手电筒、笔记本电池组、早期电动车',
    note: '市场保有量最大，货源充足，保护板版和裸电芯均有',
  },
  {
    model: '21700', dia: '21 mm', len: '70 mm', color: '#e040fb',
    volt: '3.6 V（标称）/ 4.2 V（满电）/ 2.8 V（截止）',
    cap: '4000 ~ 5000 mAh（典型 4800 mAh）',
    maxI: '最大持续放电 20~45 A',
    energy: '约 17.8 Wh（4800mAh × 3.7V）',
    use: '高性能手电筒、特斯拉 Model 3/Y、电动工具',
    note: '体积比 18650 大 ~50%，容量提升约 60%，是新一代标准',
  },
];

const CHARGING_CHIPS = [
  { name: 'TP4056', color: '#00e676', spec: '1A 线性充电，5V 输入', use: '低成本手电筒，单节 18650', note: '发热较高，需散热，不带保护功能' },
  { name: 'IP5306',  color: '#00bcd4', spec: '2A 充电 + 5V/2A 输出', use: '充电宝 + 手电二合一方案', note: '集成 LED 电量指示，自带 USB 输出' },
  { name: 'BQ25895', color: '#9c7dff', spec: '5A 快充，5~20V 宽压', use: '高端智能手电（PD 快充）', note: '支持 USB PD/QC，I²C 可编程，效率 >93%' },
  { name: 'MCP73831',color: '#ffab00', spec: '500mA 线性充电', use: '轻量级小手电、头灯', note: 'SOT-23-5 封装，体积极小，适合空间受限产品' },
];

const PROTECT_TABLE = [
  ['过充保护', '4.25 V', '防止锂电池过充起火，超压立即断开充电回路'],
  ['过放保护', '2.50 V', '防止深度放电损坏电池，低于截止电压断开负载'],
  ['过流保护', '4~8 A', '短路或异常大电流时 MOSFET 断开，通常 < 100μs'],
  ['短路保护', '即时断开', '输出端短路时硬件保护立即触发，自动恢复或按键复位'],
  ['温度保护', '> 60°C', '高端 BMS 集成 NTC 测温，过热停止充放电'],
];

const MODES_TABLE = [
  { name: 'Eco / 萤火', mA: 15,    lm: 5,     hours: '200+h', use: '应急标记、夜间行走不晃眼' },
  { name: 'Low 低档',   mA: 150,   lm: 60,    hours: '18h',   use: '室内使用、长时间续航' },
  { name: 'Mid 中档',   mA: 500,   lm: 300,   hours: '5h',    use: '户外行走、日常使用最佳平衡' },
  { name: 'High 高档',  mA: 1500,  lm: 1000,  hours: '1.5h',  use: '搜索照明、夜骑前灯' },
  { name: 'Turbo 爆闪', mA: 4000,  lm: 3000,  hours: '< 30min', use: '短时最亮，需散热，电池快速消耗' },
];

export default function Flashlight() {
  const [mode, setMode] = useState('mid');
  const [soc, setSoc] = useState(72);
  const [charging, setCharging] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const timer = setTimeout(() => {
      const io = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }),
        { threshold: 0.08 }
      );
      section.querySelectorAll('.reveal:not(.vis)').forEach(el => io.observe(el));
      return () => io.disconnect();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="flashlight" className="sec" ref={sectionRef}>
      <div className="sh">
        <span className="sh-icon">🔦</span>
        <div className="sh-tag">Stage 3 · Small Appliance · Flashlight</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,215,64,.4)` }}>
          手电筒电路设计
        </h2>
        <p className="sh-sub">从 18650/21700 锂电池到 Type-C 充电管理、恒流 LED 驱动与多档调光，解析现代手电筒的完整电路架构。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Interactive demo + modes */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,215,64,.2)', flexDirection: 'column', gap: 14 }}>
          <FlashlightCanvas mode={mode} soc={soc} charging={charging} />
          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Mode selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
              {['off','eco','low','mid','high','turbo'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${mode === m ? ACC : 'rgba(255,215,64,.22)'}`,
                  background: mode === m ? 'rgba(255,215,64,.18)' : 'transparent',
                  color: mode === m ? ACC : 'var(--dim)', font: '12px/1 inherit', transition: 'all .18s',
                }}>{m.toUpperCase()}</button>
              ))}
            </div>
            {/* Battery SOC */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 40 }}>电量:</span>
              <input type="range" min={0} max={100} value={soc} onChange={e => setSoc(+e.target.value)} style={{ flex: 1, accentColor: ACC }} />
              <span style={{ font: '12px "Courier New",monospace', color: ACC, width: 36 }}>{soc}%</span>
            </div>
            {/* Charging toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setCharging(c => !c)} style={{
                padding: '6px 20px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${charging ? '#00e676' : 'rgba(0,230,118,.22)'}`,
                background: charging ? 'rgba(0,230,118,.15)' : 'transparent',
                color: charging ? '#00e676' : 'var(--dim)', font: '13px/1 inherit', transition: 'all .22s',
              }}>🔌 {charging ? '拔出 Type-C' : '插入 Type-C 充电'}</button>
            </div>
          </div>
        </div>

        {/* Modes table */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            💡 档位规格对照表
          </div>
          <div style={{ background: 'rgba(6,12,28,.7)', borderRadius: 14, overflow: 'hidden', border: `1px solid rgba(255,215,64,.14)` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 60px 60px 60px 1fr', padding: '9px 14px', background: 'rgba(255,215,64,.08)', font: 'bold 11px "Courier New",monospace', color: ACC }}>
              <span>档位</span><span>电流</span><span>亮度</span><span>续航</span><span>适用场景</span>
            </div>
            {MODES_TABLE.map((m, i) => (
              <div key={m.name} onClick={() => setMode(m.name.split(' ')[0].toLowerCase())} style={{
                display: 'grid', gridTemplateColumns: '90px 60px 60px 60px 1fr',
                padding: '9px 14px', cursor: 'pointer',
                borderTop: '1px solid rgba(255,255,255,.05)',
                background: mode === m.name.split(' ')[0].toLowerCase() ? 'rgba(255,215,64,.08)' : i % 2 === 0 ? 'rgba(255,215,64,.02)' : 'transparent',
                transition: 'background .18s', fontSize: 12,
              }}>
                <span style={{ color: ACC, font: '11px "Courier New",monospace' }}>{m.name}</span>
                <span style={{ color: '#8aacb8' }}>{m.mA}mA</span>
                <span style={{ color: '#8aacb8' }}>{m.lm}lm</span>
                <span style={{ color: '#00e676' }}>{m.hours}</span>
                <span style={{ color: '#8aacb8' }}>{m.use}</span>
              </div>
            ))}
          </div>
          <div className="glass" style={{ borderColor: 'rgba(255,215,64,.15)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 8, fontSize: 14 }}>📐 恒流驱动的意义</div>
            <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.7 }}>
              LED 是<strong style={{ color: 'var(--white)' }}>电流器件</strong>，相同电压下温度升高会导致电流急剧增大（热失控）。
              恒流驱动电路通过反馈控制保持电流恒定，确保亮度稳定、延长 LED 寿命。
              手电筒常用 <strong style={{ color: ACC }}>AMC7135</strong>（350mA 线性恒流）或 Buck/Boost 拓扑驱动 IC。
            </div>
          </div>
        </div>
      </div>

      {/* Battery comparison */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🔋 18650 vs 21700 电池对比</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {BATTERIES.map(b => (
            <div key={b.model} className="glass reveal" style={{ borderColor: b.color + '30' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                {/* Battery icon */}
                <div style={{ width: b.model === '21700' ? 28 : 24, height: 70, borderRadius: 4, background: `${b.color}22`, border: `2px solid ${b.color}88`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '80%', height: '75%', background: b.color + 'aa', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: -6, left: '25%', width: '50%', height: 6, background: b.color + '88', borderRadius: '2px 2px 0 0' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: b.color, fontSize: 20 }}>{b.model}</div>
                  <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)' }}>{b.dia} × {b.len}</div>
                </div>
              </div>
              {[['电压', b.volt], ['容量', b.cap], ['放电', b.maxI], ['能量', b.energy], ['应用', b.use]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', fontSize: 13, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <span style={{ color: b.color, width: 44, flexShrink: 0, font: '11px "Courier New",monospace' }}>{k}</span>
                  <span style={{ color: '#8aacb8' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(200,220,232,.4)', fontStyle: 'italic' }}>{b.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Type-C charging circuit */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#00e676', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          🔌 Type-C 充电电路
        </h3>
        <div style={{ fontSize: 13, color: '#8aacb8', marginBottom: 20, lineHeight: 1.7 }}>
          手电筒内置 Type-C 充电的核心是<strong style={{ color: 'var(--white)' }}>充电管理 IC</strong> + <strong style={{ color: 'var(--white)' }}>锂电保护板</strong>，
          充电 IC 实现 CC/CV 充电曲线，保护板防止过充/过放/短路。
        </div>

        {/* Charging IC comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 28 }}>
          {CHARGING_CHIPS.map(chip => (
            <div key={chip.name} className="glass reveal" style={{ borderColor: chip.color + '28' }}>
              <div style={{ fontWeight: 700, color: chip.color, fontSize: 16, marginBottom: 6 }}>{chip.name}</div>
              <div style={{ font: '11px "Courier New",monospace', color: chip.color + 'cc', marginBottom: 8 }}>{chip.spec}</div>
              <div style={{ fontSize: 12.5, color: '#8aacb8', marginBottom: 6 }}>📌 {chip.use}</div>
              <div style={{ fontSize: 12, color: 'var(--dim)', fontStyle: 'italic' }}>{chip.note}</div>
            </div>
          ))}
        </div>

        {/* CC/CV curve explanation */}
        <div style={{ background: 'rgba(0,230,118,.06)', border: '1px solid rgba(0,230,118,.2)', borderRadius: 14, padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, color: '#00e676', marginBottom: 14 }}>📈 CC/CV 充电曲线（锂电池标准充电方式）</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { phase: '阶段一：预充', color: '#ff6b35', d: '电池电压过低时（< 3V），以小电流（1/10 C）缓慢充电，防止大电流损坏亏电电芯' },
              { phase: '阶段二：恒流 CC', color: '#00bcd4', d: '以设定电流（如 1A）快速充电，电压从 3V 逐步升至 4.2V，此阶段充入约 70% 电量' },
              { phase: '阶段三：恒压 CV', color: '#00e676', d: '电压维持 4.2V 不变，电流逐渐下降，充入剩余 30% 电量，电流降到 1/10 额定值时截止充电' },
            ].map(p => (
              <div key={p.phase} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 3, minHeight: 60, background: p.color, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: p.color, fontSize: 13, marginBottom: 5 }}>{p.phase}</div>
                  <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Battery protection */}
      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#ff6b35', marginBottom: 16 }}>🛡️ 锂电保护电路（BMS）</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
          {PROTECT_TABLE.map(([name, threshold, desc]) => (
            <div key={name} className="glass reveal" style={{ borderColor: 'rgba(255,107,53,.15)', display: 'flex', gap: 12 }}>
              <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,107,53,.18)', border: '1px solid rgba(255,107,53,.5)', color: '#ff6b35', font: '16px serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡</div>
              <div>
                <div style={{ fontWeight: 700, color: '#ff6b35', fontSize: 13, marginBottom: 3 }}>{name}</div>
                <div style={{ font: '12px "Courier New",monospace', color: ACC, marginBottom: 5 }}>{threshold}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,23,68,.06)', border: '1px solid rgba(255,23,68,.2)', borderRadius: 14, padding: '14px 20px' }}>
          <div style={{ fontWeight: 700, color: '#ff1744', marginBottom: 8 }}>⚠️ 锂电池使用安全准则</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
            {['不得使用穿刺、挤压、高温（> 60°C）等方式对待锂电池，轻则损坏重则爆炸起火',
              '发现电池膨胀鼓包必须立即停止使用并妥善处置，切勿强行充电',
              '长期存储时建议保持 40~60% 电量，避免满电或零电存放',
              '只使用原厂或同规格充电器，禁止超压充电（超过 4.25V）',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>
                <span style={{ color: '#ff1744', flexShrink: 0 }}>▸</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIY flashlight circuit summary */}
      <div style={{ marginTop: 32, background: 'rgba(255,215,64,.06)', border: '1px solid rgba(255,215,64,.2)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 14, fontSize: 15 }}>🔦 自制 USB-C 充电手电筒 · BOM 参考</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            ['电池', '21700 锂电池（4800mAh）', '¥15~25'],
            ['充电IC', 'TP4056（5V 1A 充电）', '¥0.5~1'],
            ['保护板', 'DW01A + FS8205A', '¥1~2'],
            ['LED 驱动', 'AMC7135 × 3（350mA）', '¥2~3'],
            ['LED', 'CREE XP-L / Luminus SST-40', '¥5~15'],
            ['Type-C 口', 'USB-C 母座插件', '¥0.5~2'],
            ['外壳', '铝合金手电筒壳体（带散热）', '¥10~30'],
            ['主控MCU', 'ATTiny85（选配调光控制）', '¥2~5'],
          ].map(([name, spec, price]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '8px 12px', background: 'rgba(255,215,64,.05)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, color: ACC, fontSize: 12 }}>{name}</div>
              <div style={{ fontSize: 12, color: '#8aacb8' }}>{spec}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,215,64,.5)', font: '11px "Courier New",monospace' }}>{price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
