import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00bcd4';

// ── RC Charging / Discharging Canvas ─────────────────────
function RCCanvas({ charging, R, C }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = setupHiDpi(cv, 360, 280);
    const W = 360, H = 280;
    let t = 0, rafId;
    const tau = R * C;          // time constant τ = RC

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      // ── Circuit diagram (left half) ──
      const cx = W * 0.3, cy = H * 0.5;

      // Battery
      ctx.strokeStyle = 'rgba(255,171,0,.7)'; ctx.lineWidth = 2;
      [-4, 4].forEach(o => {
        ctx.beginPath(); ctx.moveTo(cx - 25, cy + o * 4); ctx.lineTo(cx + 25, cy + o * 4); ctx.stroke();
      });
      ctx.strokeStyle = 'rgba(255,171,0,.4)'; ctx.lineWidth = 1;
      [-12, 12].forEach(o => {
        ctx.beginPath(); ctx.moveTo(cx + o, cy - 14); ctx.lineTo(cx + o, cy + 14); ctx.stroke();
      });
      ctx.fillStyle = 'rgba(255,171,0,.7)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('5V', cx, cy - 20);

      // Resistor
      const rx = cx + 70, ry = cy - 55;
      ctx.strokeStyle = 'rgba(255,107,53,.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(rx - 22, ry - 8, 44, 16, 3); ctx.stroke();
      ctx.fillStyle = 'rgba(255,107,53,.5)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${R}kΩ`, rx, ry + 22);

      // Capacitor plates
      const capX = cx + 70, capY = cy + 50;
      const vcRatio = Math.min(t / (3 * tau), 1);
      const vc = charging ? 5 * (1 - Math.exp(-t / tau)) : 5 * Math.exp(-t / tau);
      const vcPct = Math.min(vc / 5, 1);

      // Plate fill showing charge
      ctx.fillStyle = `rgba(0,188,212,${vcPct * 0.35})`;
      ctx.beginPath(); ctx.roundRect(capX - 20, capY - 18, 40, 36, 2); ctx.fill();

      ctx.strokeStyle = `rgba(0,188,212,${0.4 + vcPct * 0.5})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(capX - 14, capY - 8); ctx.lineTo(capX + 14, capY - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(capX - 14, capY + 8); ctx.lineTo(capX + 14, capY + 8); ctx.stroke();
      // + - labels
      ctx.fillStyle = `rgba(255,82,82,${vcPct})`; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('+', capX, capY - 14);
      ctx.fillStyle = `rgba(100,181,246,${vcPct})`; ctx.fillText('−', capX, capY + 20);
      ctx.fillStyle = 'rgba(0,188,212,.6)'; ctx.font = '9px "Courier New",monospace';
      ctx.fillText(`${C}μF`, capX, capY + 30);

      // Wires connecting
      ctx.strokeStyle = 'rgba(200,220,232,.25)'; ctx.lineWidth = 1.5;
      // top wire: battery + → resistor → cap top
      ctx.beginPath(); ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy - 55); ctx.lineTo(rx - 22, cy - 55); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx + 22, cy - 55); ctx.lineTo(capX, cy - 55); ctx.lineTo(capX, capY - 8); ctx.stroke();
      // bottom wire: battery - → cap bottom
      ctx.beginPath(); ctx.moveTo(cx, cy + 16); ctx.lineTo(cx, cy + 55); ctx.lineTo(capX, cy + 55); ctx.lineTo(capX, capY + 8); ctx.stroke();

      // Flowing charge dots
      if (charging && t < 4 * tau) {
        const flowFrac = (t * 30) % 100 / 100;
        // Along top wire
        const tx = cx + (capX - cx) * flowFrac, ty1 = cy - 55;
        ctx.fillStyle = 'rgba(255,82,82,.8)'; ctx.shadowColor = '#ff5252'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(tx, ty1, 3, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      } else if (!charging && vc > 0.05) {
        const flowFrac = (t * 20) % 100 / 100;
        const tx = capX - (capX - cx) * flowFrac, ty1 = cy - 55;
        ctx.fillStyle = 'rgba(100,181,246,.8)'; ctx.shadowColor = '#64b5f6'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(tx, ty1, 3, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── Voltage/time graph (right half) ──
      const gx = W * 0.58, gy = H * 0.18, gw = W * 0.36, gh = H * 0.64;
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 4); ctx.stroke();

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx + 4, gy + 4); ctx.lineTo(gx + 4, gy + gh - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + 4, gy + gh - 4); ctx.lineTo(gx + gw - 4, gy + gh - 4); ctx.stroke();
      ctx.fillStyle = 'rgba(200,220,232,.4)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillText('Vc', gx + 6, gy + 12);
      ctx.textAlign = 'right'; ctx.fillText('t', gx + gw - 4, gy + gh - 6);

      // Curve
      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.shadowColor = ACC; ctx.shadowBlur = 4;
      ctx.beginPath();
      const maxT = 5 * tau;
      for (let i = 0; i <= gw - 8; i += 2) {
        const ti = (i / (gw - 8)) * maxT;
        const v = charging ? 5 * (1 - Math.exp(-ti / tau)) : 5 * Math.exp(-ti / tau);
        const px = gx + 4 + i;
        const py = gy + gh - 4 - (v / 5) * (gh - 8);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Tau line
      const tauX = gx + 4 + (tau / maxT) * (gw - 8);
      const tauV = charging ? 5 * (1 - Math.exp(-1)) : 5 * Math.exp(-1);
      const tauY = gy + gh - 4 - (tauV / 5) * (gh - 8);
      ctx.strokeStyle = 'rgba(255,171,0,.5)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(tauX, gy + gh - 4); ctx.lineTo(tauX, tauY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,171,0,.7)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('τ', tauX, gy + gh + 4);

      // Moving dot on curve
      const nowT = Math.min(t, maxT);
      const nowV = charging ? 5 * (1 - Math.exp(-nowT / tau)) : 5 * Math.exp(-nowT / tau);
      const dotX = gx + 4 + (nowT / maxT) * (gw - 8);
      const dotY = gy + gh - 4 - (nowV / 5) * (gh - 8);
      ctx.fillStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(Math.min(dotX, gx + gw - 4), dotY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Vc display
      ctx.fillStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 12;
      ctx.font = `bold 22px "Courier New",monospace`; ctx.textAlign = 'center';
      ctx.fillText(`${nowV.toFixed(2)}V`, gx + gw / 2, gy + gh + 22);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,188,212,.5)'; ctx.font = '10px "Courier New",monospace';
      ctx.fillText(charging ? '充电中 ▶' : '放电中 ◀', gx + gw / 2, gy + gh + 36);

      // Reset when done
      if (t > 5 * tau + 0.5) t = 0;

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [charging, R, C]);
  return <canvas ref={ref} width={360} height={280} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const TYPES = [
  { name: '陶瓷电容', range: '1pF ~ 100nF', volt: '10V~1kV', icon: '🟡', color: '#ffab00',
    pros: '体积小、频率高、稳定', cons: '容值小，不适合储能', use: '高频滤波、去耦、振荡电路' },
  { name: '电解电容', range: '1μF ~ 10000μF', volt: '6V~450V', icon: '⚫', color: '#9c7dff',
    pros: '容值大、价格低', cons: '有极性、频率差、寿命有限', use: '电源滤波、低频耦合、储能' },
  { name: '薄膜电容', range: '1nF ~ 100μF', volt: '63V~1200V', icon: '🟩', color: '#00e676',
    pros: '无极性、稳定、噪声低', cons: '体积较大', use: '音频、电机启动、EMI 滤波' },
  { name: '超级电容', range: '0.1F ~ 3000F', volt: '2.5V~5V', icon: '🔵', color: '#00bcd4',
    pros: '极大容值、充放电快', cons: '耐压低、不可串联市电', use: '储能缓冲、UPS、汽车启停' },
];

const FORMULAS = [
  { f: 'Q = C × V',       desc: '电荷 = 电容量 × 电压',      note: '单位：C = F × V' },
  { f: 'E = ½CV²',        desc: '储存能量 = ½ × 容值 × 电压²', note: '单位：J = ½ × F × V²' },
  { f: 'τ = R × C',       desc: '时间常数 = 电阻 × 电容',      note: '充到 63.2% 或放到 36.8% 所需时间' },
  { f: 'Xc = 1/(2πfC)', desc: '容抗 = 1/(2π × 频率 × 容值)', note: '频率越高容抗越小（通高频阻低频）' },
];

const USES = [
  { icon: '🔋', t: '电源滤波', d: '整流后接大电解电容，平滑脉动直流，减少纹波，让输出更稳定' },
  { icon: '📡', t: '去耦旁路', d: '芯片电源引脚旁接 100nF 陶瓷电容，吸收高频噪声，防止数字干扰' },
  { icon: '⏱️', t: 'RC 定时', d: '结合电阻形成固定延时，广泛用于 555 定时器和充放电计时电路' },
  { icon: '🔊', t: '耦合隔直', d: '串联在信号路径上，隔断直流偏置只传交流信号（如音频耦合）' },
  { icon: '🔄', t: '电机启动', d: '单相电机用移相电容产生相位差，提供启动转矩（洗衣机、空调压缩机）' },
  { icon: '⚡', t: '功率因数校正', d: '感性负载（电机）的无功补偿，减少线路无效电流，节省电费' },
];

export default function Capacitor() {
  const [charging, setCharging] = useState(true);
  const [R, setR] = useState(10);
  const [C, setC] = useState(100);

  return (
    <section id="capacitor" className="sec">
      <div className="sh">
        <span className="sh-icon">⚡</span>
        <div className="sh-tag">Stage 2 · Components · Capacitor</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(0,188,212,.4)` }}>
          电容基础
        </h2>
        <p className="sh-sub">电容是存储电能的元件，理解它的充放电特性是看懂电源电路、维修家电的关键一步。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Animation + Formulas */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 14 }}>
          <RCCanvas charging={charging} R={R / 10} C={C / 1000} />

          {/* Controls */}
          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[['充电', true], ['放电', false]].map(([label, val]) => (
                <button key={label} onClick={() => setCharging(val)} style={{
                  padding: '6px 22px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${charging === val ? ACC : 'rgba(0,188,212,.25)'}`,
                  background: charging === val ? 'rgba(0,188,212,.18)' : 'transparent',
                  color: charging === val ? ACC : 'var(--dim)', font: '13px/1 inherit', transition: 'all .18s',
                }}>{label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 40 }}>R:</span>
              <input type="range" min={5} max={50} value={R} onChange={e => setR(+e.target.value)} style={{ flex: 1, accentColor: ACC }} />
              <span style={{ font: '12px "Courier New",monospace', color: ACC, width: 40 }}>{R / 10}kΩ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 40 }}>C:</span>
              <input type="range" min={10} max={500} step={10} value={C} onChange={e => setC(+e.target.value)} style={{ flex: 1, accentColor: ACC }} />
              <span style={{ font: '12px "Courier New",monospace', color: ACC, width: 50 }}>{C}μF</span>
            </div>
            <div style={{ textAlign: 'center', font: '11px "Courier New",monospace', color: 'var(--dim)' }}>
              τ = {((R / 10) * (C / 1000)).toFixed(3)} s &nbsp;|&nbsp; 完全充/放电 ≈ {(5 * (R / 10) * (C / 1000)).toFixed(2)} s
            </div>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>⚡ 核心公式</div>
          {FORMULAS.map(row => (
            <div key={row.f} className="fbox" style={{ borderColor: 'rgba(0,188,212,.22)' }}>
              <div className="fbox-f" style={{ color: ACC }}>{row.f}</div>
              <div className="fbox-desc">{row.desc}</div>
              <div className="fbox-note">{row.note}</div>
            </div>
          ))}

          <div className="glass" style={{ borderColor: 'rgba(0,188,212,.15)', marginTop: 6 }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10, fontSize: 14 }}>💡 类比理解</div>
            <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.7 }}>
              电容就像一个<strong style={{ color: 'var(--white)' }}>弹性气囊</strong>：<br />
              · 充电时气囊充气，压力（电压）升高，气体（电荷）增多<br />
              · 放电时气囊泄气，电压下降，向外释放能量<br />
              · 气囊越大（C 越大），存储越多；管道越粗（R 越小），充放越快
            </div>
          </div>
        </div>
      </div>

      {/* Types comparison */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🗂️ 四大类电容对比</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {TYPES.map(t => (
            <div key={t.name} className="glass reveal" style={{ borderColor: `${t.color}28` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <div style={{ fontWeight: 700, color: t.color, fontSize: 14 }}>{t.name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[['容值', t.range], ['耐压', t.volt]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                    <span style={{ color: t.color, font: '11px "Courier New",monospace', width: 28 }}>{k}</span>
                    <span style={{ color: '#8aacb8' }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '6px 0' }} />
                <div style={{ fontSize: 12, color: '#00e676' }}>✓ {t.pros}</div>
                <div style={{ fontSize: 12, color: '#ff5252' }}>✗ {t.cons}</div>
                <div style={{ fontSize: 12, color: '#8aacb8', marginTop: 4 }}>📌 {t.use}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🔩 电容的六大应用场景</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {USES.map(u => (
            <div key={u.t} className="icard reveal" style={{ borderColor: 'rgba(0,188,212,.15)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{u.icon}</div>
              <div style={{ fontWeight: 700, color: ACC, marginBottom: 6, fontSize: 14 }}>{u.t}</div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>{u.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Repair tip */}
      <div style={{ marginTop: 32, background: 'rgba(255,171,0,.07)', border: '1px solid rgba(255,171,0,.25)', borderRadius: 14, padding: '16px 22px' }}>
        <div style={{ fontWeight: 700, color: '#ffab00', marginBottom: 10 }}>🔧 维修实用提示</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {[
            '电解电容老化是家电故障最常见原因：顶部鼓包、液体溢出即需更换',
            '更换电解电容必须注意极性，正极接正极，接反会爆炸！',
            '空调、洗衣机电机不转，常见原因是启动电容失效（容值偏低）',
            '用万用表电容档可直接测量容值，偏差超过 20% 应更换',
          ].map(tip => (
            <div key={tip} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8aacb8', lineHeight: 1.55 }}>
              <span style={{ color: '#ffab00', flexShrink: 0 }}>▸</span>{tip}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
