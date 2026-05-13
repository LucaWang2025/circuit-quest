import { useEffect, useRef, useState } from 'react';

const ACC = '#9c7dff';

// ── Transistor Canvas ─────────────────────────────────────
function TransistorCanvas({ ibLevel, icLevel }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 360, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, rafId;

    // ibLevel: 0 (cutoff) to 1 (saturation)
    const hFE = 100;
    const icLevel = Math.min(ibLevel * hFE / 100, 1); // normalized

    function drawBJT(bx, by) {
      const col = ACC;

      // Vertical base line
      ctx.strokeStyle = `rgba(156,125,255,.6)`; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(bx, by - 36); ctx.lineTo(bx, by + 36); ctx.stroke();

      // Collector line (upper diagonal)
      ctx.strokeStyle = icLevel > 0.05 ? `rgba(156,125,255,${0.4 + icLevel * 0.5})` : 'rgba(156,125,255,.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx, by - 18); ctx.lineTo(bx + 28, by - 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + 28, by - 40); ctx.lineTo(bx + 28, by - 60); ctx.stroke();

      // Emitter line (lower diagonal with arrow)
      ctx.strokeStyle = icLevel > 0.05 ? `rgba(156,125,255,${0.4 + icLevel * 0.5})` : 'rgba(156,125,255,.35)';
      ctx.beginPath(); ctx.moveTo(bx, by + 18); ctx.lineTo(bx + 28, by + 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + 28, by + 40); ctx.lineTo(bx + 28, by + 60); ctx.stroke();

      // Arrowhead on emitter (NPN: arrow pointing outward)
      const ax = bx + 28, ay = by + 40;
      ctx.fillStyle = icLevel > 0.05 ? col : 'rgba(156,125,255,.35)';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 7, ay - 6);
      ctx.lineTo(ax + 2, ay - 8);
      ctx.closePath(); ctx.fill();

      // Base wire
      ctx.strokeStyle = ibLevel > 0.05 ? 'rgba(255,171,0,.7)' : 'rgba(255,255,255,.2)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx - 32, by); ctx.lineTo(bx, by); ctx.stroke();

      // Labels
      ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,171,0,.8)'; ctx.fillText('B', bx - 42, by + 4);
      ctx.fillStyle = col; ctx.fillText('C', bx + 28, by - 66);
      ctx.fillStyle = col; ctx.fillText('E', bx + 28, by + 68);

      // NPN label
      ctx.fillStyle = 'rgba(156,125,255,.5)'; ctx.font = '10px "Courier New",monospace';
      ctx.fillText('NPN BJT', bx - 2, by + 82);

      // Ib label
      ctx.fillStyle = 'rgba(255,171,0,.7)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillText(`Ib=${(ibLevel * 0.1).toFixed(2)}mA`, bx - 60, by - 46);
      // Ic label
      ctx.fillStyle = icLevel > 0.05 ? ACC : 'rgba(255,255,255,.25)';
      ctx.fillText(`Ic=${(icLevel * 10).toFixed(1)}mA`, bx + 32, by - 46);
    }

    function drawMOSFET(mx, my) {
      // Gate
      ctx.strokeStyle = 'rgba(255,171,0,.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(mx - 34, my); ctx.lineTo(mx - 14, my); ctx.stroke();

      // Gate plate
      ctx.strokeStyle = 'rgba(255,171,0,.8)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(mx - 14, my - 28); ctx.lineTo(mx - 14, my + 28); ctx.stroke();

      // Insulation gap
      ctx.strokeStyle = 'rgba(255,255,255,.08)';
      ctx.beginPath(); ctx.moveTo(mx - 10, my - 28); ctx.lineTo(mx - 10, my + 28); ctx.stroke();

      // Channel and body lines
      ctx.strokeStyle = `rgba(0,188,212,${0.3 + icLevel * 0.6})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(mx - 8, my - 28); ctx.lineTo(mx - 8, my - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx - 8, my + 8); ctx.lineTo(mx - 8, my + 28); ctx.stroke();

      // If above threshold, show channel connection (conducting)
      if (icLevel > 0.1) {
        ctx.strokeStyle = `rgba(0,188,212,${icLevel * 0.8})`; ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(mx - 8, my - 8); ctx.lineTo(mx - 8, my + 8); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Drain (top)
      ctx.strokeStyle = `rgba(0,188,212,${0.35 + icLevel * 0.55})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(mx - 8, my - 28); ctx.lineTo(mx + 8, my - 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + 8, my - 28); ctx.lineTo(mx + 8, my - 55); ctx.stroke();

      // Source (bottom)
      ctx.beginPath(); ctx.moveTo(mx - 8, my + 28); ctx.lineTo(mx + 8, my + 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + 8, my + 28); ctx.lineTo(mx + 8, my + 55); ctx.stroke();

      // Arrow (N-channel: pointing inward)
      ctx.fillStyle = `rgba(0,188,212,${0.4 + icLevel * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(mx - 8, my);
      ctx.lineTo(mx - 18, my - 6);
      ctx.lineTo(mx - 18, my + 6);
      ctx.closePath(); ctx.fill();

      // Labels
      ctx.font = 'bold 11px "Courier New",monospace';
      ctx.fillStyle = 'rgba(255,171,0,.8)'; ctx.textAlign = 'center'; ctx.fillText('G', mx - 42, my + 4);
      ctx.fillStyle = '#00bcd4'; ctx.fillText('D', mx + 8, my - 62);
      ctx.fillStyle = '#00bcd4'; ctx.fillText('S', mx + 8, my + 65);

      ctx.fillStyle = 'rgba(0,188,212,.5)'; ctx.font = '10px "Courier New",monospace';
      ctx.fillText('N-MOSFET', mx - 4, my + 80);

      // Vgs label
      ctx.fillStyle = 'rgba(255,171,0,.7)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'right';
      ctx.fillText(`Vgs=${(ibLevel * 10).toFixed(1)}V`, mx - 18, my - 44);
      ctx.fillStyle = icLevel > 0.1 ? '#00bcd4' : 'rgba(255,255,255,.25)';
      ctx.textAlign = 'left';
      ctx.fillText(icLevel > 0.1 ? '导通' : '截止', mx + 14, my - 44);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      // Divider line
      ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10); ctx.stroke();
      ctx.setLineDash([]);

      // ── Left: BJT ──
      drawBJT(W * 0.22, H * 0.46);

      // BJT particle flows
      if (ibLevel > 0.05) {
        // Base current (small, orange dots going in)
        for (let i = 0; i < 2; i++) {
          const frac = ((t * 0.6 + i * 0.5) % 1);
          const px = W * 0.22 - 32 + 32 * frac;
          ctx.fillStyle = `rgba(255,171,0,${0.6 + frac * 0.3})`;
          ctx.shadowColor = '#ffab00'; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(px, H * 0.46, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;

        if (icLevel > 0.05) {
          // Collector current (large flow, purple dots)
          const flowCount = Math.round(2 + icLevel * 6);
          for (let i = 0; i < flowCount; i++) {
            const frac = ((t * 0.8 + i / flowCount) % 1);
            // Flowing from collector (top) through to emitter (bottom)
            const baseX = W * 0.22 + 28;
            const py = (H * 0.46 - 60) + (120) * frac;
            const jitter = Math.sin(t * 4 + i * 1.3) * 2;
            const alpha = 0.4 + icLevel * 0.5;
            ctx.fillStyle = `rgba(156,125,255,${alpha})`;
            ctx.shadowColor = ACC; ctx.shadowBlur = 7;
            ctx.beginPath(); ctx.arc(baseX + jitter, py, 2.5, 0, Math.PI * 2); ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
      }

      // ── Right: MOSFET ──
      drawMOSFET(W * 0.74, H * 0.44);

      // MOSFET particle flows (voltage controlled)
      if (icLevel > 0.1) {
        const flowCount = Math.round(2 + icLevel * 7);
        for (let i = 0; i < flowCount; i++) {
          const frac = ((t * 0.9 + i / flowCount) % 1);
          const mx = W * 0.74 + 8;
          const py = (H * 0.44 - 55) + 110 * frac;
          const jitter = Math.sin(t * 5 + i * 1.1) * 1.5;
          const alpha = 0.35 + icLevel * 0.6;
          ctx.fillStyle = `rgba(0,188,212,${alpha})`;
          ctx.shadowColor = '#00bcd4'; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(mx + jitter, py, 2.3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Bottom labels
      ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,171,0,.6)';
      ctx.fillText('电流控制（Ib→Ic）', W * 0.22, H - 10);
      ctx.fillStyle = 'rgba(0,188,212,.6)';
      ctx.fillText('电压控制（Vgs→Id）', W * 0.74, H - 10);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [ibLevel, icLevel]);
  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const BJT_VS_MOSFET = [
  { item: '控制方式',   bjt: '电流控制（Ib控制Ic）', mos: '电压控制（Vgs控制Id）' },
  { item: '输入阻抗',   bjt: '低（kΩ级）',            mos: '极高（GΩ级，几乎不耗能）' },
  { item: '开关速度',   bjt: '较慢（载流子存储效应）', mos: '极快（多数载流子）' },
  { item: '导通特性',   bjt: 'VCE(sat) ≈ 0.2V',       mos: 'RDS(on) × Id（低压管更好）' },
  { item: '驱动难度',   bjt: '简单，直接注入基极电流', mos: '需充电容性栅极（驱动电路）' },
  { item: '噪声特性',   bjt: '低频噪声小，适合音频',   mos: '高频噪声小，适合开关电源' },
  { item: '典型应用',   bjt: '音频放大、小信号处理',   mos: '开关电源、电机驱动、逻辑门' },
];

const BJT_REGIONS = [
  { name: '截止区', cond: 'Vbe < 0.5V，Ib ≈ 0', ic: 'Ic ≈ 0（几乎截止）',       use: '开关断开状态，BJT不导通', color: '#ff5252' },
  { name: '放大区', cond: '0.5V < Vbe < 0.7V',  ic: 'Ic = hFE × Ib（线性放大）', use: '信号放大，Ic随Ib线性变化',  color: ACC },
  { name: '饱和区', cond: 'Vbe > 0.7V，Ib足够大', ic: 'VCE ≈ 0.2V，最大Ic',     use: '开关导通状态，压降最小',    color: '#00e676' },
];

const PACKAGES = [
  { name: 'TO-92',   desc: '小型塑封，3脚直插，适合小功率（≤300mA），常见于小信号三极管', color: '#9c7dff' },
  { name: 'TO-220',  desc: '带散热片安装孔，中功率（≤10A），开关电源、稳压器常用封装', color: '#ffab00' },
  { name: 'SOT-23',  desc: '贴片小封装，SMD工艺，3脚，手机板/微型电路首选', color: '#00bcd4' },
  { name: 'D-PAK',   desc: '带铜底大散热面，SMD大功率，等效TO-220的贴片版本', color: '#ff6b35' },
  { name: 'TO-247',  desc: '大功率封装（≥30A），IGBT/大功率MOSFET，变频器、逆变器', color: '#00e676' },
];

const APPS = [
  { icon: '🌀', t: 'BLDC电机驱动', d: '三相桥式6个MOSFET或IGBT，PWM控制换相，效率高于有刷电机，用于电风扇、空调压缩机' },
  { icon: '⚡', t: '开关电源', d: 'Buck/Boost/Flyback拓扑中的功率开关管，控制能量传输，MOSFET导通电阻小发热少' },
  { icon: '💡', t: 'LED调光驱动', d: 'N沟道MOSFET低边开关，MCU输出PWM信号调节占空比控制亮度，简单高效' },
  { icon: '🔊', t: '音频放大', d: 'BJT组成共射放大器，小信号Ib控制大电流Ic，电压增益 Av = -Rc/re（re=26/Ic）' },
  { icon: '🔒', t: '逻辑开关', d: '数字电路中BJT/MOSFET作为逻辑门开关，低电平关断高电平导通，TTL/CMOS逻辑' },
  { icon: '🌡️', t: '温控保护', d: 'NTC热敏电阻 + BJT 比较电路：温度升高→Ib升高→继电器吸合→切断加热元件' },
];

export default function Transistor() {
  const [ibLevel, setIbLevel] = useState(0.5);
  const icLevel = Math.min(ibLevel, 1);

  const bjtRegion = ibLevel < 0.08 ? '截止区' : ibLevel < 0.85 ? '放大区' : '饱和区';
  const regionColor = ibLevel < 0.08 ? '#ff5252' : ibLevel < 0.85 ? ACC : '#00e676';
  const vgsV = (ibLevel * 10).toFixed(1);

  return (
    <section id="transistor" className="sec">
      <div className="sh">
        <span className="sh-icon">⚙️</span>
        <div className="sh-tag">Stage 5 · Components · Transistor</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(156,125,255,.4)` }}>
          三极管基础
        </h2>
        <p className="sh-sub">
          BJT 和 MOSFET 是现代电子设备的核心开关/放大元件。一台手机内含数十亿个 MOSFET，开关电源、电机驱动离不开它们。
        </p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Canvas + Controls */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.2)', flexDirection: 'column', gap: 16 }}>
          <TransistorCanvas ibLevel={ibLevel} icLevel={icLevel} />

          {/* Control slider */}
          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: '10px "Courier New",monospace', color: 'var(--dim)', width: 50 }}>控制量:</span>
              <input
                type="range" min={0} max={1} step={0.01} value={ibLevel}
                onChange={e => setIbLevel(+e.target.value)}
                style={{ flex: 1, accentColor: ACC }}
              />
              <span style={{ font: '11px "Courier New",monospace', color: ACC, width: 50 }}>
                {(ibLevel * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', font: '11px "Courier New",monospace' }}>
              <span style={{ color: 'rgba(255,171,0,.7)' }}>BJT Ib = {(ibLevel * 0.1).toFixed(2)} mA</span>
              <span style={{ color: 'rgba(0,188,212,.7)' }}>MOS Vgs = {vgsV} V</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[['截止', 0], ['放大', 0.4], ['饱和', 1]].map(([lbl, v]) => (
                <button key={lbl} onClick={() => setIbLevel(v)} style={{
                  padding: '5px 18px', borderRadius: 16, cursor: 'pointer', fontSize: 11,
                  border: `1px solid ${Math.abs(ibLevel - v) < 0.15 ? ACC : 'rgba(156,125,255,.25)'}`,
                  background: Math.abs(ibLevel - v) < 0.15 ? 'rgba(156,125,255,.18)' : 'transparent',
                  color: Math.abs(ibLevel - v) < 0.15 ? ACC : 'var(--dim)', transition: 'all .18s',
                }}>{lbl}</button>
              ))}
            </div>
            <div style={{ textAlign: 'center', font: '12px "Courier New",monospace', color: regionColor, fontWeight: 700 }}>
              BJT 工作区：{bjtRegion}
            </div>
          </div>
        </div>

        {/* BJT vs MOSFET comparison */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            ⚙️ BJT vs MOSFET 对比
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(156,125,255,.2)' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--dim)' }}>项目</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: '#ffab00' }}>BJT</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: '#00bcd4' }}>MOSFET</th>
                </tr>
              </thead>
              <tbody>
                {BJT_VS_MOSFET.map((row, i) => (
                  <tr key={row.item} style={{ borderBottom: '1px solid rgba(255,255,255,.04)', background: i % 2 ? 'rgba(255,255,255,.02)' : 'transparent' }}>
                    <td style={{ padding: '6px 8px', color: 'var(--dim)', whiteSpace: 'nowrap' }}>{row.item}</td>
                    <td style={{ padding: '6px 8px', color: '#8aacb8' }}>{row.bjt}</td>
                    <td style={{ padding: '6px 8px', color: '#8aacb8' }}>{row.mos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BJT working regions */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>📊 BJT 三个工作区</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {BJT_REGIONS.map(r => (
            <div key={r.name} className="glass reveal" style={{ borderColor: `${r.color}28`, borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: r.color }}>
              <div style={{ fontWeight: 700, color: r.color, fontSize: 14, marginBottom: 8 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: '#8aacb8', marginBottom: 4 }}>
                <span style={{ fontFamily: '"Courier New",monospace', color: r.color }}>条件：</span>{r.cond}
              </div>
              <div style={{ fontSize: 12, color: '#8aacb8', marginBottom: 4 }}>
                <span style={{ fontFamily: '"Courier New",monospace', color: r.color }}>Ic：</span>{r.ic}
              </div>
              <div style={{ fontSize: 12, color: '#8aacb8' }}>
                <span style={{ fontFamily: '"Courier New",monospace', color: r.color }}>用途：</span>{r.use}
              </div>
            </div>
          ))}
        </div>

        {/* hFE formula */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <div className="fbox" style={{ borderColor: 'rgba(156,125,255,.22)' }}>
            <div className="fbox-f" style={{ color: ACC }}>Ic = hFE × Ib</div>
            <div className="fbox-desc">集电极电流 = 电流放大系数 × 基极电流</div>
            <div className="fbox-note">hFE 通常 50~300，小信号管可达 500+；在放大区线性成立</div>
          </div>
          <div className="fbox" style={{ borderColor: 'rgba(0,188,212,.22)' }}>
            <div className="fbox-f" style={{ color: '#00bcd4' }}>RDS(on) = f(Vgs)</div>
            <div className="fbox-desc">MOSFET 导通电阻随栅极电压升高而降低</div>
            <div className="fbox-note">低压 MOSFET（4.5V Vgs驱动）RDS(on) 可低至 1mΩ，发热极小</div>
          </div>
          <div className="fbox" style={{ borderColor: 'rgba(0,188,212,.22)' }}>
            <div className="fbox-f" style={{ color: '#00bcd4' }}>Vth（阈值电压）</div>
            <div className="fbox-desc">N沟道 MOSFET 栅源电压超过 Vth 才开始导通</div>
            <div className="fbox-note">逻辑电平 MOSFET Vth ≈ 1~2.5V，可直接由 MCU 驱动</div>
          </div>
        </div>
      </div>

      {/* Package types */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>📦 常见封装识别</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {PACKAGES.map(p => (
            <div key={p.name} className="glass reveal" style={{ borderColor: `${p.color}25` }}>
              <div style={{ fontFamily: '"Courier New",monospace', fontWeight: 700, color: p.color, fontSize: 15, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '12px 18px', background: 'rgba(156,125,255,.06)', border: '1px solid rgba(156,125,255,.15)', borderRadius: 10, fontSize: 13, color: '#8aacb8', lineHeight: 1.65 }}>
          <span style={{ color: ACC, fontWeight: 700 }}>📌 识别技巧：</span>
          TO-92（小黑圆柱）/TO-220（带金属散热片）常见于直插板；SOT-23（超小3脚贴片）/D-PAK（宽体贴片）用于SMD板；
          引脚顺序可查规格书，E/B/C 或 G/D/S 排列因厂家而异！
        </div>
      </div>

      {/* Applications */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🔩 三极管应用场景</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {APPS.map(u => (
            <div key={u.t} className="glass reveal" style={{ borderColor: 'rgba(156,125,255,.14)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{u.icon}</div>
              <div style={{ fontWeight: 700, color: ACC, marginBottom: 6, fontSize: 14 }}>{u.t}</div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>{u.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety tip */}
      <div style={{ marginTop: 32, background: 'rgba(156,125,255,.06)', border: '1px solid rgba(156,125,255,.2)', borderRadius: 14, padding: '16px 22px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 10, fontSize: 15 }}>⚠️ 使用注意</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {[
            'MOSFET 栅极悬空会感应静电自行导通，驱动电路必须有下拉电阻（通常 10kΩ）保证关断可靠',
            'BJT 开关电路基极电阻不可过大，否则进不了饱和区，开关管发热大；公式：Rb < (Vcc-0.7)/Ib_sat',
            '感性负载（继电器/电机）必须在集电极或漏极并联续流二极管，反向感应电压会损坏三极管',
            '高频开关应用选 MOSFET，低噪声音频放大选 BJT，两者特性互补各有优势',
          ].map(tip => (
            <div key={tip} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8aacb8', lineHeight: 1.55 }}>
              <span style={{ color: ACC, flexShrink: 0 }}>▸</span>{tip}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
