import { useEffect, useRef, useState } from 'react';

const ACC = '#ff6b35';

// ── Diode IV-Curve Canvas ─────────────────────────────────
function DiodeCanvas({ voltage }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 340, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, rafId;

    // Shockley diode equation (simplified)
    function diodeCurrent(v) {
      const Is = 1e-9, Vt = 0.026;
      if (v < -50) return -1;                      // Breakdown (Zener ~50V)
      if (v < 0) return Is * (Math.exp(v / (40 * Vt)) - 1) * 1e3; // Reverse leakage (nA scale, scaled)
      return Is * (Math.exp(v / Vt) - 1) * 1e-3;   // Forward: clamp for display
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const isForward = voltage > 0.5;
      const isBreakdown = voltage < -45;

      // ── Left: Diode symbol ──
      const sx = W * 0.17, sy = H * 0.46;

      // PN junction glow
      if (isForward) {
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30);
        grd.addColorStop(0, 'rgba(255,107,53,.3)');
        grd.addColorStop(1, 'rgba(255,107,53,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(sx, sy, 30, 0, Math.PI * 2); ctx.fill();
      }

      // Triangle body (anode left, cathode right)
      ctx.fillStyle = isForward ? 'rgba(255,107,53,.35)' : 'rgba(255,255,255,.06)';
      ctx.strokeStyle = isForward ? ACC : 'rgba(255,255,255,.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 20, sy - 18);
      ctx.lineTo(sx - 20, sy + 18);
      ctx.lineTo(sx + 20, sy);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Cathode bar
      ctx.strokeStyle = isForward ? ACC : 'rgba(255,255,255,.4)';
      ctx.lineWidth = 3;
      ctx.shadowColor = isForward ? ACC : 'transparent'; ctx.shadowBlur = isForward ? 8 : 0;
      ctx.beginPath(); ctx.moveTo(sx + 20, sy - 18); ctx.lineTo(sx + 20, sy + 18); ctx.stroke();
      ctx.shadowBlur = 0;

      // Lead wires
      ctx.strokeStyle = 'rgba(200,220,232,.3)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx - 50, sy); ctx.lineTo(sx - 20, sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + 20, sy); ctx.lineTo(sx + 50, sy); ctx.stroke();

      // P / N labels
      ctx.font = 'bold 10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,82,82,.7)'; ctx.fillText('P', sx - 35, sy - 24);
      ctx.fillStyle = 'rgba(100,181,246,.7)'; ctx.fillText('N', sx + 35, sy - 24);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.fillText('阳极', sx - 35, sy + 30);
      ctx.fillText('阴极', sx + 35, sy + 30);

      // Voltage label
      ctx.fillStyle = isForward ? ACC : (isBreakdown ? '#ff5252' : 'rgba(255,255,255,.35)');
      ctx.font = 'bold 12px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${voltage > 0 ? '+' : ''}${voltage.toFixed(1)}V`, sx, sy - 36);

      // Particle animation (forward biased only)
      if (isForward) {
        for (let i = 0; i < 5; i++) {
          const frac = ((t * 0.9 + i * 0.2) % 1);
          const px = (sx - 50) + 100 * frac;
          const jitter = Math.sin(t * 3 + i) * 3;
          ctx.fillStyle = `rgba(255,107,53,${0.4 + (1 - frac) * 0.5})`;
          ctx.shadowColor = ACC; ctx.shadowBlur = 7;
          ctx.beginPath(); ctx.arc(px, sy + jitter, 2.8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,107,53,.6)';
        ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('正向导通 →', sx, H - 28);
      } else if (isBreakdown) {
        ctx.fillStyle = '#ff5252';
        ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('⚡ 击穿（稳压管工作区）', sx, H - 28);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,.3)';
        ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('反向截止', sx, H - 28);
      }

      // ── Right: I-V characteristic curve ──
      const gx = W * 0.38, gy = H * 0.07, gw = W * 0.59, gh = H * 0.78;
      ctx.fillStyle = 'rgba(255,255,255,.02)';
      ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
      ctx.stroke();

      // Origin (0,0) in the curve coordinate system
      // X: -60V (left) to +2V (right)  Y: -1mA (bottom) to 50mA (top, but clamped)
      const ox = gx + gw * 0.88, oy = gy + gh * 0.82; // origin point
      const xScale = (gw - 10) / 62;  // pixels per volt
      const yScale = (gh - 10) / 55;  // pixels per mA (forward)

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      for (let v = -60; v <= 2; v += 10) {
        const px = ox + v * xScale;
        if (px >= gx + 2 && px <= gx + gw - 2) {
          ctx.beginPath(); ctx.moveTo(px, gy + 4); ctx.lineTo(px, gy + gh - 4); ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1;
      // X axis (current = 0 line)
      ctx.beginPath(); ctx.moveTo(gx + 4, oy); ctx.lineTo(gx + gw - 4, oy); ctx.stroke();
      // Y axis (voltage = 0 line)
      ctx.beginPath(); ctx.moveTo(ox, gy + 4); ctx.lineTo(ox, gy + gh - 4); ctx.stroke();

      // Axis labels
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.font = '8px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('V (伏特)', gx + gw - 18, oy + 14);
      ctx.fillText('I (mA)', ox + 4, gy + 10);
      ctx.textAlign = 'right';
      ctx.fillText('0.7V', ox + 1 * xScale, oy + 12);
      ctx.textAlign = 'center';
      ctx.fillText('-50V', ox - 50 * xScale, oy + 12);

      // IV curve path
      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.shadowColor = ACC; ctx.shadowBlur = 4;
      ctx.beginPath();
      let started = false;
      for (let v = -62; v <= 2; v += 0.1) {
        let i_mA;
        if (v < -50) {
          i_mA = -40 + (v + 62) * 8;  // Steep reverse breakdown
        } else if (v < 0) {
          i_mA = -0.01;                // Near-zero reverse
        } else if (v < 0.7) {
          i_mA = Math.exp((v - 0.7) * 12) * 15 - 0.01;
        } else {
          i_mA = Math.min((v - 0.68) * 80, 50); // Steep forward
        }
        const px = ox + v * xScale;
        const py = oy - i_mA * yScale;
        if (px < gx + 3 || px > gx + gw - 3) continue;
        const cy_clamped = Math.max(gy + 3, Math.min(gy + gh - 3, py));
        started ? ctx.lineTo(px, cy_clamped) : (ctx.moveTo(px, cy_clamped), started = true);
      }
      ctx.stroke(); ctx.shadowBlur = 0;

      // Current operating point dot
      const vOp = voltage;
      let iOp;
      if (vOp < -50) iOp = -40 + (vOp + 62) * 8;
      else if (vOp < 0) iOp = -0.01;
      else if (vOp < 0.7) iOp = Math.exp((vOp - 0.7) * 12) * 15 - 0.01;
      else iOp = Math.min((vOp - 0.68) * 80, 50);
      const dotPx = ox + vOp * xScale;
      const dotPy = Math.max(gy + 4, Math.min(gy + gh - 4, oy - iOp * yScale));

      if (dotPx >= gx + 3 && dotPx <= gx + gw - 3) {
        ctx.fillStyle = '#fff'; ctx.shadowColor = ACC; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(dotPx, dotPy, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = ACC;
        ctx.font = 'bold 10px "Courier New",monospace'; ctx.textAlign = 'left';
        const iLabel = Math.abs(iOp) < 0.05 ? '~0 mA' : `${iOp.toFixed(1)} mA`;
        ctx.fillText(iLabel, Math.min(dotPx + 6, gx + gw - 45), Math.max(gy + 14, dotPy - 6));
      }

      // Annotations
      ctx.font = '8px "Courier New",monospace';
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.textAlign = 'left';
      ctx.fillText('正向', ox + 4, gy + 22);
      ctx.fillText('导通', ox + 4, gy + 32);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ff5252'; ctx.fillText('击穿区', gx + 28, oy - 18);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillText('截止区', ox - 8, oy - 8);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [voltage]);
  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const TYPES = [
  { name: '整流二极管', vf: '0.7 ~ 1.1V', vbr: '50 ~ 1000V', if_: '1 ~ 20A',    use: '交流变直流、电源整流', color: '#ff6b35', icon: '🔴' },
  { name: '肖特基二极管', vf: '0.2 ~ 0.4V', vbr: '20 ~ 60V',  if_: '1 ~ 60A',    use: '低压降、开关电源续流', color: '#ffab00', icon: '🟡' },
  { name: '稳压（齐纳）',  vf: '0.7V',       vbr: '2.4 ~ 200V', if_: '5 ~ 50mA', use: '稳压基准、过压保护',   color: '#9c7dff', icon: '🟣' },
  { name: '发光二极管',    vf: '1.8 ~ 3.5V', vbr: '5 ~ 30V',   if_: '10 ~ 30mA', use: '指示灯、背光、照明',   color: '#00e676', icon: '🟢' },
  { name: '光电二极管',    vf: '0.7V',        vbr: '30V+',       if_: '微安级',    use: '光传感器、遥控接收',   color: '#00bcd4', icon: '🔵' },
];

const RECTIFIER = [
  {
    name: '半波整流', icon: '〜→↗',
    desc: '单个二极管，只利用交流的正半周，效率仅50%，纹波大，适合简单小功率应用。',
    formula: 'Vout ≈ 0.45Vin',
  },
  {
    name: '全波整流', icon: '〜→⌇',
    desc: '中心抽头变压器 + 2个二极管，利用交流两个半周，效率提升，需要带中心抽头的变压器。',
    formula: 'Vout ≈ 0.9Vin',
  },
  {
    name: '桥式整流', icon: '〜→⌇⌇',
    desc: '4个二极管组成桥路，正负半周都整流，最常用。适配器、充电器全部使用此方案。',
    formula: 'Vout ≈ 0.9Vin（无需CT）',
  },
];

const APPS = [
  { icon: '🔌', t: '适配器整流', d: '手机/笔记本充电器：变压器降压→桥式整流→电容滤波→稳压芯片，输出5V/12V直流' },
  { icon: '🔄', t: '续流二极管', d: '继电器、电机线圈反并联肖特基二极管，吸收断电瞬间产生的反向感应高压，保护驱动电路' },
  { icon: '💡', t: 'LED 指示灯', d: '必须串联限流电阻（R = (Vcc-Vf)/If），常见：5V供电 + 红LED（2V/10mA）→ R = 300Ω' },
  { icon: '⚡', t: '电源防反接', d: '串联在电源正极，防止电池/供电接反时损坏电路，也用于二极管或运算（电压OR逻辑）' },
  { icon: '📏', t: '稳压基准', d: '齐纳二极管反向接在电路中，当电压超过击穿电压 Vzener 时导通，起到钳位稳压作用' },
  { icon: '🌡️', t: '温度传感', d: '二极管正向压降有负温度系数（约-2mV/°C），可用作简单温度传感器或温度补偿元件' },
];

export default function Diode() {
  const [voltage, setVoltage] = useState(0.8);

  const isForward = voltage > 0.5;
  const isBreakdown = voltage < -45;
  const stateColor = isForward ? ACC : isBreakdown ? '#ff5252' : 'rgba(255,255,255,.4)';
  const stateLabel = isForward ? '正向导通' : isBreakdown ? '击穿区（稳压管）' : '反向截止';

  return (
    <section id="diode" className="sec">
      <div className="sh">
        <span className="sh-icon">↗</span>
        <div className="sh-tag">Stage 4 · Components · Diode</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,107,53,.4)` }}>
          二极管基础
        </h2>
        <p className="sh-sub">
          二极管是最基础的半导体器件，只允许电流单向流动。PN结的单向导电性是所有半导体器件的基础。
        </p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Canvas + Formulas */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,.2)', flexDirection: 'column', gap: 16 }}>
          <DiodeCanvas voltage={voltage} />

          {/* Voltage slider */}
          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 28 }}>V:</span>
              <input
                type="range" min={-60} max={2} step={0.1} value={voltage}
                onChange={e => setVoltage(+e.target.value)}
                style={{ flex: 1, accentColor: ACC }}
              />
              <span style={{ font: '13px "Courier New",monospace', color: ACC, width: 48 }}>
                {voltage > 0 ? '+' : ''}{voltage.toFixed(1)}V
              </span>
            </div>
            <div style={{ textAlign: 'center', font: '12px "Courier New",monospace', color: stateColor, fontWeight: 700 }}>
              {stateLabel}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['正向(0.8V)', 0.8], ['截止(-5V)', -5], ['击穿(-50V)', -50]].map(([lbl, v]) => (
                <button key={lbl} onClick={() => setVoltage(v)} style={{
                  padding: '5px 14px', borderRadius: 16, cursor: 'pointer', fontSize: 11,
                  border: `1px solid ${Math.abs(voltage - v) < 0.2 ? ACC : 'rgba(255,107,53,.25)'}`,
                  background: Math.abs(voltage - v) < 0.2 ? 'rgba(255,107,53,.18)' : 'transparent',
                  color: Math.abs(voltage - v) < 0.2 ? ACC : 'var(--dim)', transition: 'all .18s',
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* PN junction explanation */}
          <div className="glass" style={{ borderColor: 'rgba(255,107,53,.18)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10, fontSize: 14 }}>🔬 PN结原理</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#8aacb8', lineHeight: 1.65 }}>
              <div><span style={{ color: '#ff5252' }}>P型半导体</span>：掺硼，空穴（正电荷载流子）多数</div>
              <div><span style={{ color: '#64b5f6' }}>N型半导体</span>：掺磷，自由电子多数</div>
              <div>两种半导体接触→界面空穴/电子复合→形成<span style={{ color: ACC }}>耗尽层</span>（内建电场）</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,.06)' }} />
              <div>正偏：外加电压抵消内建电场→耗尽层变窄→<span style={{ color: '#00e676' }}>大量导通</span></div>
              <div>反偏：外加电压增强内建电场→耗尽层加宽→<span style={{ color: '#ff5252' }}>几乎截止</span></div>
            </div>
          </div>

          {/* Key parameters */}
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            ↗ 关键参数
          </div>
          {[
            { f: 'Vf ≈ 0.7V',          desc: '正向导通压降（硅管），压降越低效率越高', note: '肖特基管 Vf ≈ 0.3V，锗管 Vf ≈ 0.2V' },
            { f: 'Vbr（反向击穿电压）', desc: '反偏电压超过此值时强制导通，永久损坏或稳压工作', note: '稳压管设计在此区工作，普通管需避免' },
            { f: 'IF（额定正向电流）',   desc: '最大允许正向电流，超过会过热损坏', note: '需预留2倍余量，加散热片降低热阻' },
          ].map(row => (
            <div key={row.f} className="fbox" style={{ borderColor: 'rgba(255,107,53,.22)' }}>
              <div className="fbox-f" style={{ color: ACC }}>{row.f}</div>
              <div className="fbox-desc">{row.desc}</div>
              <div className="fbox-note">{row.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Types table */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🗂️ 常见二极管类型对比</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,107,53,.2)' }}>
                {['类型', 'Vf', '反压Vbr', '电流If', '典型应用'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: ACC, fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TYPES.map((row, i) => (
                <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,.05)', background: i % 2 ? 'rgba(255,255,255,.02)' : 'transparent' }}>
                  <td style={{ padding: '8px 12px', color: row.color, fontWeight: 600 }}>{row.icon} {row.name}</td>
                  <td style={{ padding: '8px 12px', color: '#8aacb8', fontFamily: '"Courier New",monospace' }}>{row.vf}</td>
                  <td style={{ padding: '8px 12px', color: '#8aacb8', fontFamily: '"Courier New",monospace' }}>{row.vbr}</td>
                  <td style={{ padding: '8px 12px', color: '#8aacb8', fontFamily: '"Courier New",monospace' }}>{row.if_}</td>
                  <td style={{ padding: '8px 12px', color: '#8aacb8' }}>{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rectifier circuits */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>〜→ 三种整流电路</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {RECTIFIER.map(r => (
            <div key={r.name} className="glass reveal" style={{ borderColor: 'rgba(255,107,53,.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 20, fontFamily: 'monospace', color: ACC }}>{r.icon}</span>
                <div style={{ fontWeight: 700, color: ACC, fontSize: 14 }}>{r.name}</div>
              </div>
              <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.6, marginBottom: 8 }}>{r.desc}</div>
              <div style={{ fontFamily: '"Courier New",monospace', fontSize: 12, color: '#ffab00', background: 'rgba(255,171,0,.08)', padding: '4px 8px', borderRadius: 6 }}>
                {r.formula}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🔩 二极管应用场景</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {APPS.map(u => (
            <div key={u.t} className="glass reveal" style={{ borderColor: 'rgba(255,107,53,.14)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{u.icon}</div>
              <div style={{ fontWeight: 700, color: ACC, marginBottom: 6, fontSize: 14 }}>{u.t}</div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>{u.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Measurement method */}
      <div style={{ marginTop: 32, background: 'rgba(255,107,53,.06)', border: '1px solid rgba(255,107,53,.2)', borderRadius: 14, padding: '16px 22px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 15 }}>🔧 万用表测量二极管</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { step: '档位选择', detail: '万用表拨到"二极管"档（符号：→|），红表笔接正（+VCC），黑表笔接负（GND）' },
            { step: '正向测量', detail: '红笔接阳极（P），黑笔接阴极（N）→ 正常读数 0.5～0.7V（硅管），说明二极管正常' },
            { step: '反向测量', detail: '红黑笔对调 → 正常读数应为 OL（超量程）即无穷大，说明反向截止正常' },
            { step: '击穿判断', detail: '正反向都导通（两次都有小读数）→ 二极管内部击穿短路，已损坏，需更换' },
          ].map(item => (
            <div key={item.step} style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.65 }}>
              <div style={{ color: ACC, fontWeight: 700, marginBottom: 4 }}>▸ {item.step}</div>
              {item.detail}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
