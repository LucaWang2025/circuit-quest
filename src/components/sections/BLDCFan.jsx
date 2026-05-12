import { useEffect, useRef, useState } from 'react';

const ACC = '#e040fb';   // magenta

// ── BLDC Motor Canvas ─────────────────────────────────────
// Shows 6-step commutation on a 3-phase stator
function BLDCCanvas({ pwm, step: extStep }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, rafId;
    const CX = W * 0.38, CY = H * 0.5;
    const SR = 80;   // stator radius
    const RR = 34;   // rotor radius

    // 6-step commutation: [phase_high, phase_low] index (0=U,1=V,2=W)
    const STEPS = [
      [0, 2], [0, 1], [2, 1], [2, 0], [1, 0], [1, 2],
    ];
    // Phase colors
    const PHASE = ['rgba(255,82,82,1)', 'rgba(100,181,246,1)', 'rgba(76,175,80,1)'];
    const PNAME = ['U', 'V', 'W'];

    function drawCoil(phaseIdx, angle, current) {
      // current: 1=positive, -1=negative, 0=off
      const x = CX + Math.cos(angle) * SR * 0.72;
      const y = CY + Math.sin(angle) * SR * 0.72;
      const r = 14;
      const alpha = current !== 0 ? 0.85 : 0.15;
      ctx.fillStyle = PHASE[phaseIdx].replace('1)', `${alpha})`);
      ctx.strokeStyle = PHASE[phaseIdx].replace('1)', `${current !== 0 ? 0.9 : 0.2})`);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (current !== 0) {
        ctx.shadowColor = PHASE[phaseIdx]; ctx.shadowBlur = 10;
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText(current > 0 ? '⊙' : '⊗', x, y + 4);
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = PHASE[phaseIdx].replace('1)', '0.6)');
      ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(PNAME[phaseIdx], x, y + r + 11);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      // Determine step
      const commStep = extStep ?? Math.floor((t * pwm / 40) % 6);
      const [hi, lo] = STEPS[commStep % 6];
      const currents = [0, 0, 0];
      currents[hi] = 1; currents[lo] = -1;

      // Stator housing
      ctx.strokeStyle = 'rgba(224,64,251,.2)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(CX, CY, SR + 22, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(224,64,251,.1)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(CX, CY, SR + 4, 0, Math.PI * 2); ctx.stroke();

      // Stator teeth (6 slots, 3 phases × 2 poles)
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const phIdx = i % 3;
        drawCoil(phIdx, angle, currents[phIdx] * (i < 3 ? 1 : -1));
      }

      // Air gap
      ctx.strokeStyle = 'rgba(200,220,232,.08)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(CX, CY, RR + 8, 0, Math.PI * 2); ctx.stroke();

      // Rotor (permanent magnet)
      const rotorAngle = (commStep % 6) * (Math.PI / 3) + t * 0.05;
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(rotorAngle);
      // N pole
      const ng = ctx.createLinearGradient(-RR, 0, 0, 0);
      ng.addColorStop(0, 'rgba(255,82,82,.8)'); ng.addColorStop(1, 'rgba(224,64,251,.6)');
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, RR, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
      // S pole
      const sg = ctx.createLinearGradient(0, 0, RR, 0);
      sg.addColorStop(0, 'rgba(100,181,246,.8)'); sg.addColorStop(1, 'rgba(76,175,80,.6)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, RR, Math.PI / 2, -Math.PI / 2); ctx.closePath(); ctx.fill();
      // Labels
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText('N', -RR * 0.55, 4); ctx.fillText('S', RR * 0.55, 4);
      // Center shaft
      ctx.fillStyle = 'rgba(200,200,200,.5)'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Step indicator (right side)
      const IX = W * 0.68, IY = H * 0.1;
      ctx.fillStyle = 'rgba(224,64,251,.7)'; ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillText(`换相步骤 ${(commStep % 6) + 1} / 6`, IX, IY);

      // Phase current bars
      PNAME.forEach((name, i) => {
        const barY = IY + 24 + i * 38;
        const cur = currents[i];
        ctx.fillStyle = 'rgba(255,255,255,.07)';
        ctx.beginPath(); ctx.roundRect(IX, barY, 100, 14, 3); ctx.fill();
        if (cur !== 0) {
          ctx.fillStyle = PHASE[i].replace('1)', '0.7)');
          ctx.shadowColor = PHASE[i]; ctx.shadowBlur = 6;
          if (cur > 0) {
            ctx.beginPath(); ctx.roundRect(IX + 50, barY, 50, 14, 3); ctx.fill();
          } else {
            ctx.beginPath(); ctx.roundRect(IX, barY, 50, 14, 3); ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = PHASE[i].replace('1)', '0.7)');
        ctx.font = '11px "Courier New",monospace'; ctx.textAlign = 'left';
        ctx.fillText(`${name}: ${cur > 0 ? '+ 正向' : cur < 0 ? '- 反向' : '  断开'}`, IX, barY + 24);
      });

      // PWM wave
      const wY = H * 0.75, wX0 = IX, wW = 110;
      ctx.strokeStyle = 'rgba(224,64,251,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= wW; x++) {
        const phase = (x / wW) * Math.PI * 8 + t * 4;
        const high = Math.sin(phase) > (1 - pwm / 50);
        const y = wY + (high ? 0 : 16);
        x === 0 ? ctx.moveTo(wX0 + x, y) : ctx.lineTo(wX0 + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(224,64,251,.5)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillText(`PWM 占空比: ${pwm}%`, IX, wY + 30);

      // Hall sensors (3 dots on stator)
      for (let i = 0; i < 3; i++) {
        const ha = (i / 3) * Math.PI * 2 + Math.PI / 6;
        const hx = CX + Math.cos(ha) * (SR - 8), hy = CY + Math.sin(ha) * (SR - 8);
        const hActive = currents[i] !== 0;
        ctx.fillStyle = hActive ? '#00e676' : 'rgba(200,220,232,.2)';
        ctx.shadowColor = hActive ? '#00e676' : 'transparent'; ctx.shadowBlur = hActive ? 8 : 0;
        ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = 'rgba(0,230,118,.5)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('● 霍尔传感器', CX, CY + SR + 18);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [pwm, extStep]);
  return <canvas ref={ref} width={360} height={300} style={{ maxWidth: '100%' }} />;
}

// ── Circuit topology diagram (SVG-like on canvas) ─────────
function CircuitDiagram() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, rafId;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      // Blocks
      const blocks = [
        { x: 20,  y: 110, w: 60, h: 80, label: '直流\n电源', sub: 'DC Bus\n12~48V', color: '#ffab00' },
        { x: 110, y: 90,  w: 65, h: 120, label: '控制\nMCU', sub: 'Arduino\nSTM32', color: '#00bcd4' },
        { x: 205, y: 90,  w: 65, h: 120, label: '驱动\nIC', sub: 'DRV8313\nL6234', color: '#9c7dff' },
        { x: 300, y: 60,  w: 65, h: 180, label: '三相\nMOSFET', sub: '全桥\n6管', color: '#ff6b35' },
        { x: 395, y: 110, w: 60, h: 80, label: 'BLDC\n电机', sub: 'U/V/W\n三相', color: ACC },
      ];

      blocks.forEach(b => {
        ctx.fillStyle = b.color + '18'; ctx.strokeStyle = b.color + '55'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 8); ctx.fill(); ctx.stroke();
        // Label
        ctx.fillStyle = b.color; ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
        b.label.split('\n').forEach((line, i) => ctx.fillText(line, b.x + b.w / 2, b.y + 22 + i * 14));
        ctx.fillStyle = b.color + 'aa'; ctx.font = '9px "Courier New",monospace';
        b.sub.split('\n').forEach((line, i) => ctx.fillText(line, b.x + b.w / 2, b.y + b.h - 22 + i * 12));
      });

      // Connecting arrows
      const arrows = [
        { x1: 80, y1: 150, x2: 110, y2: 150, label: 'Vcc', color: '#ffab00' },
        { x1: 175, y1: 150, x2: 205, y2: 150, label: 'PWM\n信号', color: '#00bcd4' },
        { x1: 270, y1: 150, x2: 300, y2: 150, label: '栅极\n驱动', color: '#9c7dff' },
        { x1: 365, y1: 150, x2: 395, y2: 150, label: 'UVW', color: '#ff6b35' },
      ];
      arrows.forEach(a => {
        ctx.strokeStyle = a.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(a.x1, a.y1); ctx.lineTo(a.x2 - 8, a.y1); ctx.stroke();
        // Arrowhead
        ctx.fillStyle = a.color;
        ctx.beginPath(); ctx.moveTo(a.x2 - 8, a.y1 - 4); ctx.lineTo(a.x2, a.y1); ctx.lineTo(a.x2 - 8, a.y1 + 4); ctx.fill();
        ctx.fillStyle = a.color + 'cc'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        a.label.split('\n').forEach((line, i) => ctx.fillText(line, (a.x1 + a.x2) / 2, a.y1 - 8 + i * 10));
      });

      // Hall sensor feedback arrow (curved back)
      ctx.strokeStyle = 'rgba(0,230,118,.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(427, 60); ctx.bezierCurveTo(427, 20, 142, 20, 142, 90); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0,230,118,.5)';
      ctx.beginPath(); ctx.moveTo(138, 90); ctx.lineTo(142, 82); ctx.lineTo(146, 90); ctx.fill();
      ctx.fillStyle = 'rgba(0,230,118,.6)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('霍尔传感器反馈', 280, 14);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);
  return <canvas ref={ref} width={470} height={260} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const COMMUTATION = [
  { step: 1, hi: 'U+', lo: 'W−', hall: '101', flow: 'U → W' },
  { step: 2, hi: 'U+', lo: 'V−', hall: '100', flow: 'U → V' },
  { step: 3, hi: 'W+', lo: 'V−', hall: '110', flow: 'W → V' },
  { step: 4, hi: 'W+', lo: 'U−', hall: '010', flow: 'W → U' },
  { step: 5, hi: 'V+', lo: 'U−', hall: '011', flow: 'V → U' },
  { step: 6, hi: 'V+', lo: 'W−', hall: '001', flow: 'V → W' },
];

const VS_DATA = [
  { label: '换向方式', bldc: '电子换向（MCU+MOSFET）', brush: '机械碳刷+换向器' },
  { label: '效率',     bldc: '85~95%',              brush: '70~80%' },
  { label: '寿命',     bldc: '10000+ 小时',         brush: '2000~5000 小时' },
  { label: '噪音',     bldc: '极低（无机械摩擦）',  brush: '中等（碳刷摩擦）' },
  { label: '调速精度', bldc: '精确 PWM 调速',        brush: '一般（电阻分压）' },
  { label: '成本',     bldc: '较高（需控制IC）',     brush: '低（结构简单）' },
  { label: '典型应用', bldc: '台扇/吊扇/电动车/无人机', brush: '电钻/玩具/老式电器' },
];

export default function BLDCFan() {
  const [pwm, setPwm] = useState(60);
  const [manualStep, setManualStep] = useState(null);

  return (
    <section id="bldc-fan" className="sec">
      <div className="sh">
        <span className="sh-icon">🌀</span>
        <div className="sh-tag">Stage 3 · Small Appliance · BLDC Motor</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(224,64,251,.4)` }}>
          无刷电机风扇电路
        </h2>
        <p className="sh-sub">从三相绕组到 MOSFET 全桥，全面解析无刷直流电机（BLDC）台扇/吊扇的电路实现原理与六步换相控制。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Motor animation + commutation */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(224,64,251,.2)', flexDirection: 'column', gap: 14 }}>
          <BLDCCanvas pwm={pwm} step={manualStep} />
          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 60 }}>PWM 占空:</span>
              <input type="range" min={10} max={100} value={pwm} onChange={e => setPwm(+e.target.value)} style={{ flex: 1, accentColor: ACC }} />
              <span style={{ font: '12px "Courier New",monospace', color: ACC, width: 40 }}>{pwm}%</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)' }}>手动换相：</span>
              {[1,2,3,4,5,6].map(s => (
                <button key={s} onClick={() => setManualStep(manualStep === s - 1 ? null : s - 1)} style={{
                  width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                  border: `1px solid ${manualStep === s - 1 ? ACC : 'rgba(224,64,251,.25)'}`,
                  background: manualStep === s - 1 ? 'rgba(224,64,251,.22)' : 'transparent',
                  color: manualStep === s - 1 ? ACC : 'var(--dim)',
                  font: '11px monospace', transition: 'all .18s',
                }}>{s}</button>
              ))}
              {manualStep !== null && (
                <button onClick={() => setManualStep(null)} style={{
                  padding: '3px 10px', borderRadius: 10, cursor: 'pointer', fontSize: 11,
                  border: '1px solid rgba(255,255,255,.15)', background: 'transparent', color: 'var(--dim)', font: 'inherit',
                }}>自动</button>
              )}
            </div>
          </div>
        </div>

        {/* Commutation table */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            🔁 六步换相时序表
          </div>
          <div style={{ background: 'rgba(6,12,28,.7)', borderRadius: 14, overflow: 'hidden', border: `1px solid rgba(224,64,251,.15)` }}>
            <div style={{ display: 'flex', padding: '10px 14px', background: 'rgba(224,64,251,.1)', font: 'bold 11px "Courier New",monospace', color: ACC }}>
              <span style={{ flex: '0 0 36px' }}>步骤</span>
              <span style={{ flex: '0 0 52px' }}>高侧</span>
              <span style={{ flex: '0 0 52px' }}>低侧</span>
              <span style={{ flex: '0 0 52px' }}>Hall</span>
              <span style={{ flex: 1 }}>电流路径</span>
            </div>
            {COMMUTATION.map((row, i) => (
              <div key={row.step} onClick={() => setManualStep(manualStep === i ? null : i)} style={{
                display: 'flex', padding: '9px 14px', cursor: 'pointer',
                borderTop: '1px solid rgba(255,255,255,.05)',
                background: manualStep === i ? 'rgba(224,64,251,.1)' : i % 2 === 0 ? 'rgba(224,64,251,.03)' : 'transparent',
                transition: 'background .18s',
              }}>
                <span style={{ flex: '0 0 36px', color: manualStep === i ? ACC : 'var(--dim)', font: 'bold 12px monospace' }}>{row.step}</span>
                <span style={{ flex: '0 0 52px', color: '#ff5252', font: '12px "Courier New",monospace' }}>{row.hi}</span>
                <span style={{ flex: '0 0 52px', color: '#64b5f6', font: '12px "Courier New",monospace' }}>{row.lo}</span>
                <span style={{ flex: '0 0 52px', color: '#00e676', font: '12px "Courier New",monospace' }}>{row.hall}</span>
                <span style={{ flex: 1, fontSize: 12, color: '#8aacb8' }}>{row.flow}</span>
              </div>
            ))}
          </div>
          <div className="glass" style={{ borderColor: 'rgba(224,64,251,.15)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 8, fontSize: 14 }}>💡 换相原理简述</div>
            <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.7 }}>
              BLDC 电机靠<strong style={{ color: 'var(--white)' }}>电子换相</strong>代替碳刷：MCU 读取 3 个霍尔传感器状态，判断转子当前位置，
              对应选通 6 个 MOSFET 中的 2 个，使定子产生超前转子 90° 的旋转磁场，持续驱动转子跟随旋转。
              PWM 占空比控制平均电流 → 控制电机转矩和转速。
            </div>
          </div>
        </div>
      </div>

      {/* Circuit topology */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 16 }}>🔌 电路拓扑结构</h3>
        <div className="anim-box reveal" style={{ borderColor: 'rgba(224,64,251,.15)', width: '100%', overflowX: 'auto', padding: '20px 10px' }}>
          <CircuitDiagram />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16 }}>
          {[
            { c: '#ffab00', t: '直流母线', d: '电源输入，台扇通常 12~24V DC，由开关电源整流提供' },
            { c: '#00bcd4', t: '控制 MCU', d: 'STM32/Arduino 读 Hall 传感器，生成 6 路 PWM 信号，实现换相逻辑' },
            { c: '#9c7dff', t: '栅极驱动 IC', d: '将 MCU 低压信号放大到足以驱动 MOSFET 栅极的电压和电流' },
            { c: '#ff6b35', t: '三相 MOSFET 全桥', d: '6 个 N 沟道 MOSFET（上下各 3），导通时把 DC 母线电压切换到三相绕组' },
            { c: ACC,       t: 'BLDC 电机', d: '三相星形绕组，永磁转子，3 个霍尔传感器检测位置后反馈给 MCU' },
          ].map(item => (
            <div key={item.t} className="icard reveal" style={{ borderColor: item.c + '28' }}>
              <div style={{ fontWeight: 700, color: item.c, marginBottom: 6, fontSize: 13 }}>{item.t}</div>
              <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BLDC vs Brushed */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 16 }}>⚖️ 无刷 vs 有刷电机对比</h3>
        <div style={{ background: 'rgba(6,12,28,.7)', borderRadius: 14, overflow: 'hidden', border: `1px solid rgba(224,64,251,.15)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', background: 'rgba(224,64,251,.1)', padding: '10px 18px', font: 'bold 12px "Courier New",monospace' }}>
            <span style={{ color: 'var(--dim)' }}>参数</span>
            <span style={{ color: ACC }}>无刷 BLDC</span>
            <span style={{ color: '#ffab00' }}>有刷 Brushed</span>
          </div>
          {VS_DATA.map((row, i) => (
            <div key={row.label} style={{
              display: 'grid', gridTemplateColumns: '140px 1fr 1fr',
              padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,.05)',
              background: i % 2 === 0 ? 'rgba(224,64,251,.03)' : 'transparent',
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--dim)', font: '12px "Courier New",monospace' }}>{row.label}</span>
              <span style={{ color: '#c8dce8', paddingRight: 12 }}>{row.bldc}</span>
              <span style={{ color: '#8aacb8' }}>{row.brush}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fan product circuit breakdown */}
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <div className="glass reveal" style={{ borderColor: 'rgba(224,64,251,.2)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 12 }}>🌀 台扇典型方案（12V DC）</div>
          {[
            ['电源', '220V AC → 开关电源 → 12V/2A DC'],
            ['MCU', 'GD32/STM32F030（低成本ARM）'],
            ['驱动', 'DRV8313（三相全桥驱动）'],
            ['功率管','6× MOSFET（耐压 30V，10A）'],
            ['检测', '3× 霍尔传感器 SS41'],
            ['调速', '电位器→ADC→PWM占空比'],
            ['保护', '过流检测（采样电阻+比较器）'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', fontSize: 12.5, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <span style={{ color: ACC, width: 48, flexShrink: 0, font: '11px "Courier New",monospace' }}>{k}</span>
              <span style={{ color: '#8aacb8' }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="glass reveal" style={{ borderColor: 'rgba(0,188,212,.2)' }}>
          <div style={{ fontWeight: 700, color: '#00bcd4', marginBottom: 12 }}>💡 PWM 调速原理</div>
          <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.7, marginBottom: 12 }}>
            通过改变 MOSFET 导通时间占整个周期的比例（占空比）来控制电机绕组的平均电压：
          </div>
          {[
            ['占空比 20%', '→ 低风速（约 800 RPM）'],
            ['占空比 50%', '→ 中风速（约 1500 RPM）'],
            ['占空比 80%', '→ 高风速（约 2400 RPM）'],
            ['占空比100%', '→ 最大风速'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: '#00bcd4', font: '12px "Courier New",monospace', flexShrink: 0 }}>{k}</span>
              <span style={{ color: '#8aacb8' }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0,188,212,.5)' }}>
            开关频率通常 16~32 kHz，超过人耳听觉范围，避免噪声
          </div>
        </div>
        <div className="glass reveal" style={{ borderColor: 'rgba(0,230,118,.2)' }}>
          <div style={{ fontWeight: 700, color: '#00e676', marginBottom: 12 }}>🔧 常见故障与检修</div>
          {[
            ['电机不转', '检查 Hall 传感器供电（通常 5V），用万用表测 3 个 Hall 输出是否有 0/5V 变化'],
            ['转速异常', 'ADC 采样电位器是否接触不良，或 PWM 输出频率是否正常（示波器验证）'],
            ['异响抖动', '某相 MOSFET 损坏或驱动 IC 输出异常，对比六路 PWM 波形'],
            ['过热保护', '检查电机绕组阻值（三相应对称），散热是否不良'],
          ].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ color: '#00e676', fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>▸ {k}</div>
              <div style={{ color: '#8aacb8', fontSize: 12, lineHeight: 1.55 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
