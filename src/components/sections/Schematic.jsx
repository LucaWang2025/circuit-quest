import { useEffect, useRef, useState } from 'react';

const ACC = '#ffab00';

// ── Schematic Canvas ──────────────────────────────────────
// Shows physical layout (left) vs schematic symbols (right),
// with animated highlight panning across corresponding parts.
function SchematicCanvas({ highlight }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 380, H = 280;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, rafId;

    // Circuit elements to highlight: battery, resistor, LED
    // highlight: 0=none, 1=battery, 2=resistor, 3=led
    // Auto-cycle when highlight===0

    // ── Physical layout coords (left half: 0 to W*0.46) ──
    const phys = {
      battery: { x: 55, y: 140, w: 36, h: 56 },
      resistor: { x: 55, y: 60, w: 76, h: 20 },
      led:      { x: 185, y: 100, w: 22, h: 40 },
    };
    // ── Schematic symbol coords (right half: W*0.54 to W) ──
    const schem = {
      battery:  { x: 260, y: 140 },
      resistor: { x: 260, y: 80 },
      led:      { x: 320, y: 110 },
    };

    function drawPhysical(activeEl) {
      // Background
      ctx.fillStyle = 'rgba(255,171,0,.03)';
      ctx.fillRect(0, 0, W * 0.48, H);

      // Title
      ctx.fillStyle = 'rgba(255,171,0,.45)';
      ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('实物图', W * 0.24, 14);

      // Breadboard hint
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 9; col++) {
          ctx.beginPath();
          ctx.arc(20 + col * 20, 30 + row * 28, 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ── Battery (AA battery style) ──
      const isB = activeEl === 'battery';
      if (isB) {
        ctx.shadowColor = ACC; ctx.shadowBlur = 18;
        ctx.strokeStyle = 'rgba(255,171,0,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(phys.battery.x - 4, phys.battery.y - 4, phys.battery.w + 8, phys.battery.h + 8, 6); ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Battery body
      const bg = ctx.createLinearGradient(phys.battery.x, phys.battery.y, phys.battery.x + phys.battery.w, phys.battery.y);
      bg.addColorStop(0, 'rgba(180,120,20,.7)'); bg.addColorStop(1, 'rgba(220,160,40,.5)');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(phys.battery.x, phys.battery.y, phys.battery.w, phys.battery.h, 4); ctx.fill();
      ctx.strokeStyle = isB ? ACC : 'rgba(255,171,0,.35)'; ctx.lineWidth = 1.5; ctx.stroke();

      // + / - terminals
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('+', phys.battery.x + phys.battery.w / 2, phys.battery.y + 14);
      ctx.fillText('−', phys.battery.x + phys.battery.w / 2, phys.battery.y + phys.battery.h - 4);
      ctx.fillStyle = isB ? ACC : 'rgba(255,171,0,.5)';
      ctx.font = '8px "Courier New",monospace';
      ctx.fillText('9V', phys.battery.x + phys.battery.w / 2, phys.battery.y + phys.battery.h + 13);

      // ── Resistor (brown body with color bands) ──
      const isR = activeEl === 'resistor';
      if (isR) {
        ctx.shadowColor = '#ff6b35'; ctx.shadowBlur = 16;
        ctx.strokeStyle = 'rgba(255,107,53,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(phys.resistor.x - 4, phys.resistor.y - 8, phys.resistor.w + 8, phys.resistor.h + 16, 5); ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#8B5A2B';
      ctx.beginPath(); ctx.roundRect(phys.resistor.x, phys.resistor.y, phys.resistor.w, phys.resistor.h, 3); ctx.fill();
      ctx.strokeStyle = isR ? '#ff6b35' : 'rgba(255,107,53,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      // Color bands
      [['#ffd700', 14], ['#7B00B4', 30], ['#7B3F00', 46], ['#ffd700', 58]].forEach(([c, x]) => {
        ctx.fillStyle = c;
        ctx.fillRect(phys.resistor.x + x, phys.resistor.y, 8, phys.resistor.h);
      });
      ctx.fillStyle = isR ? '#ff6b35' : 'rgba(255,107,53,.5)';
      ctx.font = '8px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('470Ω', phys.resistor.x + phys.resistor.w / 2, phys.resistor.y - 6);

      // ── LED (dome shape) ──
      const isL = activeEl === 'led';
      const ledGlow = isL ? 0.6 : 0.2;
      if (isL) {
        ctx.shadowColor = '#00e676'; ctx.shadowBlur = 20;
      }
      // Glow halo
      const ledGrd = ctx.createRadialGradient(phys.led.x + phys.led.w / 2, phys.led.y + 10, 0, phys.led.x + phys.led.w / 2, phys.led.y + 10, 28);
      ledGrd.addColorStop(0, `rgba(0,230,118,${ledGlow})`); ledGrd.addColorStop(1, 'rgba(0,230,118,0)');
      ctx.fillStyle = ledGrd;
      ctx.beginPath(); ctx.arc(phys.led.x + phys.led.w / 2, phys.led.y + 10, 28, 0, Math.PI * 2); ctx.fill();
      // LED body
      ctx.fillStyle = `rgba(0,200,100,${0.4 + ledGlow * 0.3})`;
      ctx.beginPath(); ctx.roundRect(phys.led.x, phys.led.y, phys.led.w, phys.led.h, [10, 10, 2, 2]); ctx.fill();
      ctx.strokeStyle = isL ? '#00e676' : 'rgba(0,230,118,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      // Pins (anode longer)
      ctx.strokeStyle = 'rgba(200,200,200,.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(phys.led.x + 6, phys.led.y + phys.led.h); ctx.lineTo(phys.led.x + 6, phys.led.y + phys.led.h + 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(phys.led.x + 16, phys.led.y + phys.led.h); ctx.lineTo(phys.led.x + 16, phys.led.y + phys.led.h + 14); ctx.stroke();
      ctx.fillStyle = isL ? '#00e676' : 'rgba(0,230,118,.5)';
      ctx.font = '8px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('LED', phys.led.x + phys.led.w / 2, phys.led.y - 6);
      ctx.shadowBlur = 0;

      // Wires (physical jumper wires)
      const wireAlpha = 0.35;
      ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      // Red wire: battery + → resistor
      ctx.strokeStyle = `rgba(255,82,82,${wireAlpha})`;
      ctx.beginPath(); ctx.moveTo(phys.battery.x + 18, phys.battery.y); ctx.lineTo(phys.battery.x + 18, phys.resistor.y + 30); ctx.lineTo(phys.resistor.x, phys.resistor.y + 10); ctx.stroke();
      // Resistor → LED anode
      ctx.strokeStyle = `rgba(255,171,0,${wireAlpha})`;
      ctx.beginPath(); ctx.moveTo(phys.resistor.x + phys.resistor.w, phys.resistor.y + 10); ctx.lineTo(phys.led.x + 6, phys.resistor.y + 10); ctx.lineTo(phys.led.x + 6, phys.led.y + phys.led.h); ctx.stroke();
      // Black wire: LED cathode → battery −
      ctx.strokeStyle = `rgba(80,120,160,${wireAlpha})`;
      ctx.beginPath(); ctx.moveTo(phys.led.x + 16, phys.led.y + phys.led.h + 14); ctx.lineTo(phys.led.x + 16, phys.battery.y + phys.battery.h + 10); ctx.lineTo(phys.battery.x + 18, phys.battery.y + phys.battery.h + 10); ctx.lineTo(phys.battery.x + 18, phys.battery.y + phys.battery.h); ctx.stroke();
    }

    function drawSchematic(activeEl) {
      // Background
      ctx.fillStyle = 'rgba(255,171,0,.03)';
      ctx.fillRect(W * 0.52, 0, W * 0.48, H);

      ctx.fillStyle = 'rgba(255,171,0,.45)';
      ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('电路原理图', W * 0.76, 14);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
      for (let gx = W * 0.54; gx <= W - 4; gx += 20) {
        ctx.beginPath(); ctx.moveTo(gx, 20); ctx.lineTo(gx, H - 10); ctx.stroke();
      }
      for (let gy = 20; gy <= H - 10; gy += 20) {
        ctx.beginPath(); ctx.moveTo(W * 0.54, gy); ctx.lineTo(W - 4, gy); ctx.stroke();
      }

      // ── Schematic: Battery symbol ──
      const isB = activeEl === 'battery';
      const bx = schem.battery.x, by = schem.battery.y;
      if (isB) { ctx.shadowColor = ACC; ctx.shadowBlur = 14; }
      ctx.strokeStyle = isB ? ACC : 'rgba(255,171,0,.5)'; ctx.lineWidth = 2;
      // Long line (positive terminal)
      ctx.beginPath(); ctx.moveTo(bx - 16, by - 16); ctx.lineTo(bx + 16, by - 16); ctx.stroke();
      // Short line (negative terminal)
      ctx.strokeStyle = isB ? ACC : 'rgba(255,171,0,.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx - 10, by - 6); ctx.lineTo(bx + 10, by - 6); ctx.stroke();
      // Lead wires up/down
      ctx.strokeStyle = isB ? ACC : 'rgba(200,220,232,.3)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx, by - 16); ctx.lineTo(bx, by - 36); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by - 6); ctx.lineTo(bx, by + 14); ctx.stroke();
      // +/- labels
      ctx.shadowBlur = 0;
      ctx.fillStyle = isB ? ACC : 'rgba(255,171,0,.6)';
      ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText('+', bx + 18, by - 12); ctx.fillText('−', bx + 18, by - 2);
      ctx.fillStyle = isB ? ACC : 'rgba(255,171,0,.5)';
      ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('B1', bx, by + 28); ctx.fillText('9V', bx, by + 40);

      // ── Schematic: Resistor symbol (zigzag) ──
      const isR = activeEl === 'resistor';
      const rx = schem.resistor.x, ry = schem.resistor.y;
      if (isR) { ctx.shadowColor = '#ff6b35'; ctx.shadowBlur = 12; }
      ctx.strokeStyle = isR ? '#ff6b35' : 'rgba(255,107,53,.5)'; ctx.lineWidth = 2;
      // Lead wires
      ctx.beginPath(); ctx.moveTo(rx - 28, ry); ctx.lineTo(rx - 14, ry); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx + 14, ry); ctx.lineTo(rx + 28, ry); ctx.stroke();
      // Zigzag body
      ctx.beginPath();
      ctx.moveTo(rx - 14, ry);
      const zz = [[-10, -8], [-5, 8], [0, -8], [5, 8], [10, -8], [14, 0]];
      zz.forEach(([dx, dy]) => ctx.lineTo(rx + dx, ry + dy));
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = isR ? '#ff6b35' : 'rgba(255,107,53,.5)';
      ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('R1', rx, ry - 12); ctx.fillText('470Ω', rx, ry + 18);

      // ── Schematic: LED symbol (triangle + bar + arrows) ──
      const isL = activeEl === 'led';
      const lx = schem.led.x, ly = schem.led.y;
      if (isL) { ctx.shadowColor = '#00e676'; ctx.shadowBlur = 14; }
      ctx.strokeStyle = isL ? '#00e676' : 'rgba(0,230,118,.5)';
      ctx.fillStyle = isL ? 'rgba(0,230,118,.25)' : 'rgba(0,230,118,.08)';
      ctx.lineWidth = 2;
      // Triangle
      ctx.beginPath(); ctx.moveTo(lx - 14, ly - 14); ctx.lineTo(lx - 14, ly + 14); ctx.lineTo(lx + 14, ly); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cathode bar
      ctx.strokeStyle = isL ? '#00e676' : 'rgba(0,230,118,.5)';
      ctx.beginPath(); ctx.moveTo(lx + 14, ly - 14); ctx.lineTo(lx + 14, ly + 14); ctx.stroke();
      // Lead wires
      ctx.strokeStyle = 'rgba(200,220,232,.3)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(lx, ly - 30); ctx.lineTo(lx - 14, ly - 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx + 14, ly); ctx.lineTo(lx + 14, ly + 30); ctx.stroke();
      // Light arrows
      if (isL) {
        ctx.strokeStyle = 'rgba(0,230,118,.6)'; ctx.lineWidth = 1.5;
        [[10, -4], [16, -10]].forEach(([dx, dy]) => {
          const ax = lx + dx, ay = ly + dy;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 10, ay - 10); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ax + 10, ay - 10); ctx.lineTo(ax + 5, ay - 10); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ax + 10, ay - 10); ctx.lineTo(ax + 10, ay - 5); ctx.stroke();
        });
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = isL ? '#00e676' : 'rgba(0,230,118,.5)';
      ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillText('D1', lx + 20, ly - 10); ctx.fillText('LED', lx + 20, ly + 2);

      // Wires (schematic)
      ctx.strokeStyle = 'rgba(200,220,232,.3)'; ctx.lineWidth = 1.5; ctx.lineCap = 'square';
      // Power rail (top wire): battery+ → resistor → LED anode
      ctx.beginPath();
      ctx.moveTo(bx, by - 36);
      ctx.lineTo(bx, ry - 14);
      ctx.lineTo(rx - 28, ry);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx + 28, ry);
      ctx.lineTo(lx, ry);
      ctx.lineTo(lx, ly - 30);
      ctx.stroke();
      // Ground rail (bottom wire): LED cathode → battery−
      ctx.beginPath();
      ctx.moveTo(lx + 14, ly + 30);
      ctx.lineTo(lx + 14, H - 30);
      ctx.lineTo(bx, H - 30);
      ctx.lineTo(bx, by + 14);
      ctx.stroke();

      // Ground symbol
      ctx.strokeStyle = 'rgba(200,220,232,.35)'; ctx.lineWidth = 1.5;
      const gndX = bx, gndY = H - 18;
      ctx.beginPath(); ctx.moveTo(gndX - 12, gndY); ctx.lineTo(gndX + 12, gndY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gndX - 7, gndY + 5); ctx.lineTo(gndX + 7, gndY + 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gndX - 3, gndY + 10); ctx.lineTo(gndX + 3, gndY + 10); ctx.stroke();
      ctx.fillStyle = 'rgba(200,220,232,.3)'; ctx.font = '8px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('GND', gndX, gndY + 20);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.015;

      // Auto-cycle highlight: each 2 seconds
      const cycleEl = ['battery', 'resistor', 'led', null][Math.floor((t * 0.4) % 4)];
      const activeEl = highlight || cycleEl;

      drawPhysical(activeEl);

      // Center divider
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(W / 2, 18); ctx.lineTo(W / 2, H - 8); ctx.stroke();
      ctx.setLineDash([]);

      drawSchematic(activeEl);

      // Correspondence arrows when an element is active
      if (activeEl) {
        const physMap = { battery: { x: phys.battery.x + 18, y: phys.battery.y + 20 }, resistor: { x: phys.resistor.x + 38, y: phys.resistor.y + 10 }, led: { x: phys.led.x + 11, y: phys.led.y + 20 } };
        const schemMap = { battery: { x: schem.battery.x - 16, y: schem.battery.y - 11 }, resistor: { x: schem.resistor.x - 14, y: schem.resistor.y }, led: { x: schem.led.x - 14, y: schem.led.y } };
        const pEl = physMap[activeEl], sEl = schemMap[activeEl];
        if (pEl && sEl) {
          const col = activeEl === 'battery' ? ACC : activeEl === 'resistor' ? '#ff6b35' : '#00e676';
          const pulse = 0.4 + Math.sin(t * 4) * 0.25;
          ctx.strokeStyle = `rgba(${col === ACC ? '255,171,0' : col === '#ff6b35' ? '255,107,53' : '0,230,118'},${pulse})`;
          ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(pEl.x + 30, pEl.y); ctx.lineTo(sEl.x - 10, sEl.y); ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [highlight]);
  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const SYMBOLS = [
  { sym: '─╲╱─',  name: '电阻 R',      desc: '锯齿线（ANSI）或矩形（IEC），单位 Ω',  color: '#ff6b35' },
  { sym: '─┤├─',  name: '电容 C',      desc: '两条平行线，单位 F / μF / pF',           color: '#00bcd4' },
  { sym: '─⌒⌒─', name: '电感 L',      desc: '弧形线圈符号，单位 H / mH / μH',         color: '#00bcd4' },
  { sym: '─▷|─',  name: '二极管 D',   desc: '三角形+竖线，箭头方向=电流方向',           color: '#ff6b35' },
  { sym: '⊓',     name: '三极管 Q',   desc: 'BJT：B/C/E三端；MOSFET：G/D/S三端',      color: '#9c7dff' },
  { sym: '─⊗⊗─', name: '变压器 T',   desc: '两组线圈符号，有时带铁芯双竖线',           color: '#ffab00' },
  { sym: '─/ ─',  name: '开关 S',     desc: '断开的线段，各类开关符号',                 color: '#00e676' },
  { sym: '─|/|─', name: '电池/电源',  desc: '长短交替的竖线，长=正极短=负极',            color: '#ffab00' },
  { sym: '─⏚',   name: '接地 GND',   desc: '向下的三角形，参考零电位',                  color: 'rgba(255,255,255,.5)' },
  { sym: '(V)',    name: '电压源',     desc: '圆圈内V，理想电压源；圆圈内I为电流源',     color: '#ffab00' },
];

const WIRE_RULES = [
  {
    name: '交叉不连接',
    desc: '两条导线交叉但没有节点圆点，表示它们不相连，只是立体空间"飞越"。',
    color: 'rgba(255,82,82,.7)',
  },
  {
    name: '连接节点（丁字/T形）',
    desc: 'T形交叉或在交点处画实心圆点（节点），表示两线实际相连，电位相同。',
    color: '#00e676',
  },
  {
    name: '同名网络标签',
    desc: '用相同的网络名（如 VCC、GND、NET_A）连接远处的点，等同于用导线相连，避免导线交叉混乱。',
    color: '#00bcd4',
  },
];

const READ_STEPS = [
  { n: '1', title: '找电源', detail: '定位 VCC/VDD/+5V 等供电节点，以及 GND 接地网络，建立参考电位体系' },
  { n: '2', title: '找地', detail: '追踪所有 GND 汇聚点，确认单点接地还是多点接地，是否有数字地/模拟地分割' },
  { n: '3', title: '追信号流', detail: '从输入端（传感器/接口）→ 处理模块（运放/MCU）→ 输出端（驱动/负载）顺序追踪' },
  { n: '4', title: '识别功能模块', detail: '把电路分成：电源模块、振荡电路、放大级、滤波电路、输出驱动等功能块分析' },
];

const NAMING = [
  { prefix: 'R', full: '电阻（Resistor）',     example: 'R1, R2, R_pullup' },
  { prefix: 'C', full: '电容（Capacitor）',    example: 'C1, C_bypass, C_filter' },
  { prefix: 'L', full: '电感（Inductor）',     example: 'L1, L_choke' },
  { prefix: 'D', full: '二极管（Diode）',      example: 'D1, D_LED, D_zener' },
  { prefix: 'Q', full: '三极管（Transistor）', example: 'Q1, Q_switch' },
  { prefix: 'U', full: '集成电路（IC）',       example: 'U1, U_MCU, U_LDO' },
  { prefix: 'T', full: '变压器（Transformer）', example: 'T1, T_power' },
  { prefix: 'SW', full: '开关（Switch）',      example: 'SW1, SW_reset' },
];

const CHARGER_PARTS = [
  { ref: 'T1',   part: '变压器',         func: '220V AC → 12V AC 降压隔离，确保安全' },
  { ref: 'D1-D4', part: '桥式整流',      func: '4个二极管将交流变为脉动直流' },
  { ref: 'C1',   part: '滤波电容',       func: '大电解电容（1000μF）平滑纹波' },
  { ref: 'U1',   part: '稳压 IC（7805）', func: '输出稳定 5V 直流，内置过热保护' },
  { ref: 'C2',   part: '输出滤波',       func: '100μF + 100nF 组合，去除高频噪声' },
  { ref: 'D5',   part: '指示 LED',       func: '限流电阻 R1 串联，指示充电状态' },
];

export default function Schematic() {
  const [highlight, setHighlight] = useState(null);

  return (
    <section id="schematic" className="sec">
      <div className="sh">
        <span className="sh-icon">📐</span>
        <div className="sh-tag">Stage 6 · Skills · Schematic</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,171,0,.45)` }}>
          电路图识读
        </h2>
        <p className="sh-sub">
          学会读懂电路原理图是家电维修、电子制作的必备技能。从实物到符号，建立对应关系是第一步。
        </p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Canvas + Controls */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,171,0,.2)', flexDirection: 'column', gap: 16 }}>
          <SchematicCanvas highlight={highlight} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['自动', null], ['电源', 'battery'], ['电阻', 'resistor'], ['LED', 'led']].map(([lbl, val]) => (
              <button key={lbl} onClick={() => setHighlight(val)} style={{
                padding: '5px 18px', borderRadius: 16, cursor: 'pointer', fontSize: 11,
                border: `1px solid ${highlight === val ? ACC : 'rgba(255,171,0,.25)'}`,
                background: highlight === val ? 'rgba(255,171,0,.18)' : 'transparent',
                color: highlight === val ? ACC : 'var(--dim)', transition: 'all .18s',
              }}>{lbl}</button>
            ))}
          </div>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', textAlign: 'center', paddingBottom: 4 }}>
            虚线连接实物与对应符号，点击高亮元件
          </div>
        </div>

        {/* Wire rules + Reading steps */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            📐 导线连接规则
          </div>
          {WIRE_RULES.map(r => (
            <div key={r.name} className="glass" style={{ borderColor: `${r.color}30`, borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: r.color }}>
              <div style={{ fontWeight: 700, color: r.color, fontSize: 13, marginBottom: 6 }}>{r.name}</div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>{r.desc}</div>
            </div>
          ))}

          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center', marginTop: 4 }}>
            📖 阅读步骤
          </div>
          {READ_STEPS.map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,171,0,.15)', border: '1px solid rgba(255,171,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACC, fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 2 }}>
                {s.n}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: ACC, fontSize: 13, marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.6 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symbol table */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🔣 基础元件符号大全</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {SYMBOLS.map(s => (
            <div key={s.name} className="glass reveal" style={{ borderColor: `${s.color}28`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: '"Courier New",monospace', fontSize: 15, color: s.color, minWidth: 44, textAlign: 'center', paddingTop: 2 }}>{s.sym}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: 13, marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Naming conventions */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🏷️ 元件位号命名规范</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,171,0,.2)' }}>
                {['前缀', '元件类型', '示例'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: ACC, fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NAMING.map((row, i) => (
                <tr key={row.prefix} style={{ borderBottom: '1px solid rgba(255,255,255,.05)', background: i % 2 ? 'rgba(255,255,255,.02)' : 'transparent' }}>
                  <td style={{ padding: '7px 14px', color: ACC, fontWeight: 700, fontFamily: '"Courier New",monospace', fontSize: 15 }}>{row.prefix}</td>
                  <td style={{ padding: '7px 14px', color: '#8aacb8' }}>{row.full}</td>
                  <td style={{ padding: '7px 14px', color: '#8aacb8', fontFamily: '"Courier New",monospace', fontSize: 12 }}>{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charger circuit annotation */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🔌 实战：充电器电路图解析</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,171,0,.2)' }}>
                {['位号', '元件', '功能说明'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: ACC, fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHARGER_PARTS.map((row, i) => (
                <tr key={row.ref} style={{ borderBottom: '1px solid rgba(255,255,255,.05)', background: i % 2 ? 'rgba(255,255,255,.02)' : 'transparent' }}>
                  <td style={{ padding: '8px 14px', color: ACC, fontWeight: 700, fontFamily: '"Courier New",monospace' }}>{row.ref}</td>
                  <td style={{ padding: '8px 14px', color: '#8aacb8', whiteSpace: 'nowrap' }}>{row.part}</td>
                  <td style={{ padding: '8px 14px', color: '#8aacb8', lineHeight: 1.6 }}>{row.func}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Measurement tips */}
      <div style={{ marginTop: 32, background: 'rgba(255,171,0,.06)', border: '1px solid rgba(255,171,0,.2)', borderRadius: 14, padding: '16px 22px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 15 }}>🔧 万用表/示波器测量点选择技巧</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {[
            { title: '电源测量点', detail: '在 VCC 和 GND 之间测量，验证供电是否正常（万用表DC档）。电容两端电压应与标称电压接近。' },
            { title: '信号节点', detail: '在元件引脚与导线交叉处（T节点）探针接触最可靠。悬空引脚可能给出虚假读数。' },
            { title: '示波器接地', detail: '示波器夹子（黑线）必须接被测电路的GND，否则测量波形会偏移甚至损坏探头。' },
            { title: '隔离测量', detail: '测量高压电路（220V）时，必须使用1000:1隔离探头或差分探头，严禁直接接示波器接地端。' },
          ].map(item => (
            <div key={item.title} style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.65 }}>
              <div style={{ color: ACC, fontWeight: 700, marginBottom: 4 }}>▸ {item.title}</div>
              {item.detail}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
