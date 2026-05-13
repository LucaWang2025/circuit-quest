import { useEffect, useRef, useState } from 'react';

const ACC = '#9c7dff';

// Breadboard layout constants
const BB = {
  cols: 30,       // half cols for display
  rows: 10,
  cellW: 10,
  cellH: 10,
  marginX: 12,
  marginY: 35,
  railH: 10,
  railGap: 8,
};

const CIRCUIT_STEPS = [
  { id: 'none',   label: '初始状态',   icon: '⊡' },
  { id: 'led',    label: '插入LED',    icon: '💡' },
  { id: 'res',    label: '插入电阻',   icon: '⬛' },
  { id: 'power',  label: '接通电源',   icon: '⚡' },
];

export default function Breadboard() {
  const canvasRef = useRef(null);
  const [step, setStep] = useState('none');
  const stepRef = useRef('none');

  useEffect(() => { stepRef.current = step; }, [step]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 380, H = 300;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let frame = 0;
    let rafId;

    // Current particles
    const currentParticles = Array.from({ length: 25 }, () => ({
      x: 0, y: 0, t: Math.random(), speed: 0.004 + Math.random() * 0.003,
    }));

    // LED glow anim
    let ledGlow = 0;

    // Circuit path: power+ → row5 col3 → LED (col3,4 row5) → wire to row5 col8 → resistor → GND rail
    const circuitPath = [
      // Power rail → jumper to row5 at col3
      { x: BB.marginX + 2 * BB.cellW, y: BB.marginY - BB.railH - BB.railGap },
      { x: BB.marginX + 2 * BB.cellW, y: BB.marginY + 4 * BB.cellH },
      // across LED (col3→col5, row5)
      { x: BB.marginX + 5 * BB.cellW, y: BB.marginY + 4 * BB.cellH },
      // wire to resistor col7
      { x: BB.marginX + 7 * BB.cellW, y: BB.marginY + 4 * BB.cellH },
      // resistor (col7→col10)
      { x: BB.marginX + 10 * BB.cellW, y: BB.marginY + 4 * BB.cellH },
      // jumper to GND rail
      { x: BB.marginX + 10 * BB.cellW, y: BB.marginY + 5 * BB.cellH + BB.railGap },
    ];

    function getPathLength(path) {
      let len = 0;
      for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;
        len += Math.sqrt(dx * dx + dy * dy);
      }
      return len;
    }

    function getPointOnPath(path, t) {
      const total = getPathLength(path);
      let target = t * total;
      for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        if (target <= segLen) {
          return {
            x: path[i - 1].x + (dx / segLen) * target,
            y: path[i - 1].y + (dy / segLen) * target,
          };
        }
        target -= segLen;
      }
      return path[path.length - 1];
    }

    function drawBreadboard() {
      const bW = BB.cols * BB.cellW + BB.marginX * 2;
      const bH = BB.rows * BB.cellH + BB.marginY * 2 + BB.railH * 2 + BB.railGap * 2 + 10;

      // Breadboard body
      ctx.fillStyle = '#e8e0d0';
      ctx.beginPath(); ctx.roundRect(6, 6, bW, bH, 8); ctx.fill();
      ctx.strokeStyle = '#c0b8a8'; ctx.lineWidth = 1.5; ctx.stroke();

      // Rails
      const railColors = ['#ff3333', '#222222'];
      [[BB.marginY - BB.railH - BB.railGap, 0], [BB.marginY + BB.rows * BB.cellH + BB.railGap, 1]].forEach(([ry, ci]) => {
        // Rail bg
        ctx.fillStyle = ci === 0 ? '#ffe0e0' : '#e0e0e0';
        ctx.beginPath(); ctx.roundRect(BB.marginX - 4, ry - 3, BB.cols * BB.cellW + 8, BB.railH + 6, 3); ctx.fill();

        // Rail stripe
        ctx.strokeStyle = railColors[ci]; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(BB.marginX, ry + BB.railH / 2);
        ctx.lineTo(BB.marginX + BB.cols * BB.cellW, ry + BB.railH / 2);
        ctx.stroke();

        // Rail holes
        for (let c = 0; c < BB.cols; c++) {
          if (c % 5 === 0 && c > 0) continue; // skip at dividers
          const hx = BB.marginX + c * BB.cellW + BB.cellW / 2;
          const hy = ry + BB.railH / 2;
          ctx.fillStyle = '#888';
          ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI * 2); ctx.fill();
        }

        // +/- label
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = railColors[ci];
        ctx.fillText(ci === 0 ? '+' : '−', BB.marginX - 10, ry + BB.railH / 2 + 3);
      });

      // Center gap
      ctx.fillStyle = '#d0c8b8';
      ctx.fillRect(BB.marginX - 4, BB.marginY + BB.rows / 2 * BB.cellH - 3, BB.cols * BB.cellW + 8, 6);
      ctx.fillStyle = '#b0a898';
      ctx.fillRect(BB.marginX - 4, BB.marginY + BB.rows / 2 * BB.cellH - 1, BB.cols * BB.cellW + 8, 2);

      // Main holes
      for (let c = 0; c < BB.cols; c++) {
        for (let r = 0; r < BB.rows; r++) {
          const hx = BB.marginX + c * BB.cellW + BB.cellW / 2;
          const hy = BB.marginY + r * BB.cellH + BB.cellH / 2;

          // Color columns that are electrically connected (same column, same side of gap)
          const topSide = r < BB.rows / 2;
          const isHighlighted = stepRef.current !== 'none' && (
            (topSide && c >= 2 && c <= 10 && r >= 3 && r <= 6)
          );

          ctx.fillStyle = isHighlighted ? 'rgba(156,125,255,0.5)' : '#999';
          ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Column labels (every 5)
      ctx.font = '8px monospace'; ctx.fillStyle = '#777'; ctx.textAlign = 'center';
      for (let c = 0; c < BB.cols; c += 5) {
        ctx.fillText((c + 1).toString(), BB.marginX + c * BB.cellW + BB.cellW / 2, BB.marginY - BB.railH - BB.railGap - 4);
      }
      // Row labels
      ctx.textAlign = 'left';
      const rowLabels = 'abcdefghij';
      for (let r = 0; r < BB.rows; r++) {
        ctx.fillStyle = '#777';
        ctx.fillText(rowLabels[r], BB.marginX - 10, BB.marginY + r * BB.cellH + BB.cellH / 2 + 3);
      }
    }

    function drawLED() {
      if (!['led', 'res', 'power'].includes(stepRef.current)) return;
      const x = BB.marginX + 3 * BB.cellW + BB.cellW / 2;
      const y = BB.marginY + 4 * BB.cellH;
      const glowing = stepRef.current === 'power';
      const glow = glowing ? ledGlow : 0;

      ctx.save();
      if (glowing) {
        ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 15 + glow * 10;
      }

      // LED body (transparent dome)
      const ledGrad = ctx.createRadialGradient(x, y - 3, 0, x, y, 8);
      ledGrad.addColorStop(0, glowing ? '#ffffaa' : '#dddddd');
      ledGrad.addColorStop(0.5, glowing ? '#ffcc00' : '#aaaaaa');
      ledGrad.addColorStop(1, glowing ? '#ff8800' : '#666666');
      ctx.fillStyle = ledGrad;
      ctx.beginPath(); ctx.arc(x, y - 2, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = glowing ? '#ffaa00' : '#888';
      ctx.lineWidth = 1; ctx.stroke();

      // Cathode/anode legs
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 4, y + 5); ctx.lineTo(x - 4, y + 12);  // anode (longer)
      ctx.moveTo(x + 4, y + 5); ctx.lineTo(x + 4, y + 10);  // cathode
      ctx.stroke();

      // LED label
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = glowing ? '#ffcc00' : '#666';
      ctx.textAlign = 'center';
      ctx.fillText('LED', x, y + 22);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawResistor() {
      if (!['res', 'power'].includes(stepRef.current)) return;
      const x = BB.marginX + 7 * BB.cellW + BB.cellW / 2;
      const y = BB.marginY + 4 * BB.cellH;

      // Resistor body
      ctx.fillStyle = '#d4a254';
      ctx.beginPath(); ctx.roundRect(x - 14, y - 5, 28, 10, 3); ctx.fill();
      ctx.strokeStyle = '#a07030'; ctx.lineWidth = 1; ctx.stroke();

      // Color bands (brown-green-brown-gold = 150Ω)
      const bands = ['#8b4513', '#007a00', '#8b4513', '#d4af37'];
      bands.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(x - 10 + i * 6, y - 5, 4, 10);
      });

      // Leads
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 14, y); ctx.lineTo(x - 24, y);
      ctx.moveTo(x + 14, y); ctx.lineTo(x + 24, y);
      ctx.stroke();

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#888'; ctx.textAlign = 'center';
      ctx.fillText('150Ω', x, y + 16);
    }

    function drawWires() {
      if (!['res', 'power'].includes(stepRef.current)) return;

      const wires = [
        // Red: VCC rail → LED anode (col3 row5 top)
        {
          color: '#ff3333',
          pts: [
            [BB.marginX + 2 * BB.cellW + BB.cellW / 2, BB.marginY - BB.railH / 2 - BB.railGap],
            [BB.marginX + 2 * BB.cellW + BB.cellW / 2, BB.marginY + 4 * BB.cellH],
          ],
        },
        // Black: Resistor end → GND rail
        {
          color: '#333',
          pts: [
            [BB.marginX + 10 * BB.cellW + BB.cellW / 2, BB.marginY + 4 * BB.cellH],
            [BB.marginX + 10 * BB.cellW + BB.cellW / 2, BB.marginY + BB.rows * BB.cellH + BB.railGap + BB.railH / 2],
          ],
        },
      ];

      wires.forEach(w => {
        ctx.strokeStyle = w.color; ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        w.pts.forEach(([px, py], i) => {
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
    }

    function drawCurrentFlow() {
      if (stepRef.current !== 'power') return;
      currentParticles.forEach(p => {
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;
        const pos = getPointOnPath(circuitPath, p.t);
        const glow = 0.6 + Math.sin(frame * 0.1 + p.t * Math.PI * 4) * 0.4;
        ctx.fillStyle = `rgba(255,220,0,${glow * 0.8})`;
        ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // LED glow pulse
      ledGlow = 0.5 + Math.sin(frame * 0.08) * 0.5;
    }

    function drawPowerIndicator() {
      const isPowered = stepRef.current === 'power';
      const bx = W - 75, by = 8;
      ctx.fillStyle = isPowered ? 'rgba(0,200,80,0.2)' : 'rgba(100,100,100,0.2)';
      ctx.beginPath(); ctx.roundRect(bx, by, 68, 24, 5); ctx.fill();
      ctx.strokeStyle = isPowered ? '#00c850' : '#444';
      ctx.lineWidth = 1; ctx.stroke();
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = isPowered ? '#00e676' : '#555';
      ctx.textAlign = 'center';
      ctx.fillText(isPowered ? '5V  ●ON' : '5V  ○OFF', bx + 34, by + 16);
      ctx.textAlign = 'left';
    }

    function draw() {
      rafId = requestAnimationFrame(draw);
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, W, H);

      drawBreadboard();
      drawWires();
      drawCurrentFlow();
      drawLED();
      drawResistor();
      drawPowerIndicator();

      // Step annotation
      const stepInfo = {
        none:  '点击下方按钮开始搭建电路',
        led:   'LED 已插入 — 长脚(阳极)靠近电源轨',
        res:   '150Ω 限流电阻已连入',
        power: '电路已接通！电流正在流动 →',
      };
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.roundRect(8, H - 32, W - 16, 24, 6); ctx.fill();
      ctx.font = '11px monospace';
      ctx.fillStyle = stepRef.current === 'power' ? '#9c7dff' : 'rgba(255,255,255,0.7)';
      ctx.fillText(stepInfo[stepRef.current] || '', 16, H - 15);
    }

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Step progression
  const stepOrder = ['none', 'led', 'res', 'power'];
  const canNext = step !== 'power';
  const canReset = step !== 'none';

  function nextStep() {
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
  }

  return (
    <section id="breadboard" className="sec">
      <div className="sh">
        <span className="sh-icon" style={{ color: ACC }}>🔌</span>
        <div>
          <div className="sh-title">面包板电路搭建</div>
          <div className="sh-tag" style={{ color: ACC }}>进阶动手 · 原型验证</div>
        </div>
      </div>

      <div className="divider" />

      {/* Canvas */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid rgba(156,125,255,0.2)' }} />

        {/* Step controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {CIRCUIT_STEPS.map((s) => {
            const stepIdx = stepOrder.indexOf(step);
            const sIdx = stepOrder.indexOf(s.id);
            const isActive = s.id === step;
            const isDone = sIdx < stepIdx;
            return (
              <button key={s.id}
                onClick={() => sIdx <= stepIdx + 1 ? setStep(s.id) : null}
                style={{
                  padding: '7px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                  background: isActive ? ACC : isDone ? 'rgba(156,125,255,0.25)' : 'rgba(156,125,255,0.05)',
                  color: isActive ? '#000' : isDone ? ACC : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${isActive ? ACC : isDone ? 'rgba(156,125,255,0.5)' : 'rgba(156,125,255,0.15)'}`,
                  fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.2s',
                }}>
                {s.icon} {s.label} {isDone ? '✓' : ''}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={nextStep} disabled={!canNext} style={{
            padding: '8px 20px', borderRadius: '8px', fontSize: '13px', cursor: canNext ? 'pointer' : 'not-allowed',
            background: canNext ? ACC : 'rgba(156,125,255,0.1)',
            color: canNext ? '#000' : 'rgba(255,255,255,0.2)',
            border: 'none', fontWeight: 'bold', transition: 'all 0.2s',
          }}>下一步 →</button>
          <button onClick={() => setStep('none')} disabled={!canReset} style={{
            padding: '8px 20px', borderRadius: '8px', fontSize: '13px', cursor: canReset ? 'pointer' : 'not-allowed',
            background: 'transparent', color: canReset ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
            border: `1px solid ${canReset ? 'rgba(156,125,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
            transition: 'all 0.2s',
          }}>重置</button>
        </div>
      </div>

      <div className="divider" />

      {/* Internal structure */}
      <div className="sh-sub">🔍 面包板内部结构</div>
      <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,0.3)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { icon: '⬆', title: '纵向5孔连通', desc: '主区域同一列的 a~e 五孔内部金属弹片相连，e~j 另组连通，中间凹槽断开。' },
            { icon: '↔', title: '电源轨横向连通', desc: '顶部和底部电源轨（+和-）沿水平方向全程连通，方便多处引入电源。' },
            { icon: '✂', title: '中间凹槽断开', desc: '凹槽用于安装 DIP 封装 IC，两侧引脚自然分离，避免相互短接。' },
          ].map(item => (
            <div key={item.title} style={{ flex: '1', minWidth: '100px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontWeight: 'bold', color: ACC, fontSize: '12px', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.6' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resistor calculation */}
      <div className="sh-sub">🧮 LED 限流电阻计算</div>
      <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,0.25)', marginBottom: '16px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>R = </span>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>(Vcc − Vf)</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}> / </span>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>If</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { expr: 'Vcc = 5V', note: '电源电压' },
            { expr: 'Vf ≈ 2V', note: 'LED正向压降' },
            { expr: 'If = 20mA', note: '额定工作电流' },
            { expr: 'R = 150Ω', note: '→ 取标称值', highlight: true },
          ].map(item => (
            <div key={item.expr} style={{
              background: item.highlight ? 'rgba(156,125,255,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${item.highlight ? ACC : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px', padding: '8px 14px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: item.highlight ? ACC : '#fff', fontSize: '14px' }}>{item.expr}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wire colors */}
      <div className="sh-sub">🎨 跳线颜色规范</div>
      <div className="grid2">
        {[
          { color: '#ff3333', label: '红色', use: 'VCC / 正电源，永远不要接错' },
          { color: '#333333', label: '黑色', use: 'GND / 负极，接地线' },
          { color: '#3399ff', label: '蓝色', use: '信号线或控制线' },
          { color: '#33cc33', label: '绿色', use: '数据线或次要信号' },
          { color: '#ffaa00', label: '黄色', use: '通用信号线' },
          { color: '#ffffff', label: '白色', use: '通用，或总线信号' },
        ].map(w => (
          <div key={w.label} className="glass reveal" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: w.color, flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }} />
            <div>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{w.label}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }}>{w.use}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Typical circuits */}
      <div className="sh-sub">⚡ 典型入门电路</div>
      <div className="grid2">
        {[
          { name: 'LED 限流点亮', diff: '初级', desc: 'VCC → 电阻 → LED → GND，掌握欧姆定律应用。' },
          { name: 'LED 流水灯', diff: '初级', desc: '8个LED并排，单片机依次 HIGH/LOW 形成流动效果。' },
          { name: '按键控制LED', diff: '初级', desc: '数字输入+数字输出，理解上下拉电阻和消抖。' },
          { name: '分压电路', diff: '中级', desc: '两电阻串联分压，测量 ADC 或接传感器模拟输出。' },
        ].map(c => (
          <div key={c.name} className="glass reveal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{c.name}</span>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                background: 'rgba(156,125,255,0.15)', color: ACC, border: '1px solid rgba(156,125,255,0.3)',
              }}>{c.diff}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Common mistakes */}
      <div className="sh-sub">⚠ 常见错误</div>
      <div style={{ marginBottom: '16px' }}>
        {[
          { err: '跨过中间凹槽', fix: '凹槽两侧不连通，IC引脚会短接。元件不能横跨中间沟槽两侧孔位。' },
          { err: 'VCC/GND 短接', fix: '红黑跳线接到同一列会立即短路，检查连接前先断电。' },
          { err: 'LED 极性接反', fix: 'LED 不亮但也没短路，调换两端重新插入即可（有保护电阻时安全）。' },
          { err: '跳线接触不良', fix: '面包板孔位磨损后弹片松动，更换新孔位或更换面包板。' },
        ].map((item, i) => (
          <div key={i} className="fbox reveal" style={{ animationDelay: `${i * 0.05}s`, marginBottom: '6px' }}>
            <div className="fbox-f" style={{ color: '#ff6b6b', fontSize: '18px' }}>!</div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#ff6b6b', fontSize: '13px' }}>{item.err}</div>
              <div className="fbox-desc">{item.fix}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Starter kit */}
      <div className="fbox-note reveal" style={{ borderLeft: `3px solid ${ACC}` }}>
        <div style={{ fontWeight: 'bold', color: ACC, marginBottom: '6px' }}>🛒 推荐入门工具包（约¥30起步）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['830孔面包板 × 1', '跳线套装（公公/公母）', 'LED 包（多色各10个）', '电阻包（1/4W 常用阻值）', '按键开关 × 10', '9V电池+导线'].map(item => (
            <span key={item} style={{
              background: 'rgba(156,125,255,0.12)', border: '1px solid rgba(156,125,255,0.3)',
              borderRadius: '12px', padding: '4px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.7)',
            }}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
