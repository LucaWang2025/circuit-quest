import { useEffect, useRef, useState } from 'react';

const ACC = '#00bcd4';

// ── Inductor Canvas ───────────────────────────────────────
function InductorCanvas({ powered }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 340, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, rafId;

    function drawCoil(cx, cy) {
      // Lead-in
      ctx.strokeStyle = ACC; ctx.lineWidth = 2.5;
      ctx.shadowColor = ACC; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(cx - 62, cy); ctx.lineTo(cx - 46, cy); ctx.stroke();
      // 5 bumps
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(cx - 46 + i * 18 + 9, cy, 9, Math.PI, 0, false);
        ctx.stroke();
      }
      // Lead-out
      ctx.beginPath(); ctx.moveTo(cx + 44, cy); ctx.lineTo(cx + 60, cy); ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      // Left panel background
      ctx.fillStyle = 'rgba(0,188,212,.04)';
      ctx.fillRect(0, 0, W * 0.53, H);

      const cx = W * 0.265, cy = H * 0.42;

      // Magnetic field ellipses
      for (let ring = 0; ring < 5; ring++) {
        const progress = powered
          ? ((t * 0.5 + ring * 0.2) % 1)
          : (1 - ((t * 0.5 + ring * 0.2) % 1));
        const rx = 16 + progress * 60, ry = rx * 0.44;
        const alpha = powered ? (1 - progress) * 0.55 : progress * 0.5;
        ctx.strokeStyle = `rgba(0,188,212,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Iron core (double lines below coil)
      ctx.strokeStyle = 'rgba(255,171,0,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 46, cy + 12); ctx.lineTo(cx + 44, cy + 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 46, cy + 17); ctx.lineTo(cx + 44, cy + 17); ctx.stroke();

      // Coil
      drawCoil(cx, cy);

      if (powered) {
        // Current flow dots (red, flowing along wire path)
        for (let d = 0; d < 3; d++) {
          const frac = ((t * 0.7 + d * 0.333) % 1);
          const px = (cx - 62) + ((cx + 60) - (cx - 62)) * frac;
          ctx.fillStyle = 'rgba(255,82,82,.9)';
          ctx.shadowColor = '#ff5252'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(px, cy - 5, 2.8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        // Magnetic polarity label
        ctx.fillStyle = 'rgba(0,188,212,.6)';
        ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('N ←  → S', cx, cy - 30);
      } else {
        // Back-EMF particles (orange, spiraling out)
        for (let i = 0; i < 7; i++) {
          const pFrac = ((t * 0.8 + i / 7) % 1);
          const angle = (i / 7) * Math.PI * 2 + t * 1.5;
          const dist = 20 + pFrac * 42;
          const px = cx + Math.cos(angle) * dist * 1.35;
          const py = cy + Math.sin(angle) * dist * 0.48;
          const alpha = (1 - pFrac) * 0.85;
          ctx.fillStyle = `rgba(255,107,53,${alpha})`;
          ctx.shadowColor = '#ff6b35'; ctx.shadowBlur = 5;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,107,53,.75)';
        ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('反电动势粒子', cx, cy + 60);
      }

      // Status indicator
      ctx.fillStyle = powered ? ACC : '#ff6b35';
      ctx.font = 'bold 10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(powered ? '▶ 通电 · 磁场建立' : '■ 断电 · 磁场释放', cx, H - 12);

      // ── Right: V / I waveforms ──
      const gx = W * 0.56, gy = H * 0.07, gw = W * 0.41, gh = H * 0.77;
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 4); ctx.stroke();

      const midY = gy + gh / 2;
      ctx.strokeStyle = 'rgba(255,255,255,.13)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx + 4, gy + 4); ctx.lineTo(gx + 4, gy + gh - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + 4, midY); ctx.lineTo(gx + gw - 4, midY); ctx.stroke();

      // V(t) — leads I by 90°
      ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 1.8;
      ctx.shadowColor = '#ffab00'; ctx.shadowBlur = 3;
      ctx.beginPath();
      for (let i = 0; i <= gw - 8; i++) {
        const ph = (i / (gw - 8)) * Math.PI * 4;
        const y = midY - Math.sin(ph + Math.PI / 2) * (gh * 0.36);
        i === 0 ? ctx.moveTo(gx + 4 + i, y) : ctx.lineTo(gx + 4 + i, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;

      // I(t)
      ctx.strokeStyle = ACC; ctx.lineWidth = 1.8;
      ctx.shadowColor = ACC; ctx.shadowBlur = 3;
      ctx.beginPath();
      for (let i = 0; i <= gw - 8; i++) {
        const ph = (i / (gw - 8)) * Math.PI * 4;
        const y = midY - Math.sin(ph) * (gh * 0.30);
        i === 0 ? ctx.moveTo(gx + 4 + i, y) : ctx.lineTo(gx + 4 + i, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;

      // Moving dots
      const dotFrac = (t * 0.45) % 1;
      const dotX = gx + 4 + dotFrac * (gw - 8);
      const dotPh = dotFrac * Math.PI * 4;
      ctx.fillStyle = '#ffab00'; ctx.shadowColor = '#ffab00'; ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.arc(dotX, midY - Math.sin(dotPh + Math.PI / 2) * (gh * 0.36), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.arc(dotX, midY - Math.sin(dotPh) * (gh * 0.30), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Legend
      ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'right';
      ctx.fillStyle = '#ffab00'; ctx.fillText('V(t)', gx + gw - 5, gy + 12);
      ctx.fillStyle = ACC; ctx.fillText('I(t)', gx + gw - 5, gy + 24);
      ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.textAlign = 'center';
      ctx.fillText('电压超前电流 90°', gx + gw / 2, gy + gh + 14);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [powered]);
  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const FORMULAS = [
  { f: 'L = N²μA / l',    desc: '电感量 = 匝数² × 磁导率 × 截面积 / 磁路长度', note: '单位：H（亨利）' },
  { f: 'XL = 2πfL',       desc: '感抗 = 2π × 频率 × 电感量',                   note: '频率越高，阻抗越大（阻高频通低频）' },
  { f: 'E = ½LI²',        desc: '储存能量 = ½ × 电感量 × 电流²',               note: '单位：J = ½ × H × A²' },
  { f: 'v = L × dI/dt',   desc: '电感电压 = 电感量 × 电流变化率',               note: '电流不能突变（防止电压尖峰）' },
  { f: 'f = 1/(2π√LC)',   desc: 'LC 谐振频率',                                  note: '谐振时感抗 = 容抗，电路阻抗最小' },
];

const TYPES = [
  { name: '空心线圈', range: 'nH ~ μH',   app: '高频滤波、RF电路、天线',   color: '#00bcd4', icon: '⭕' },
  { name: '铁芯电感', range: 'mH ~ H',    app: '工频变压器、音频、低频',    color: '#ffab00', icon: '🔴' },
  { name: '磁环电感', range: 'μH ~ mH',   app: 'EMI抑制、电源滤波',        color: '#9c7dff', icon: '🟣' },
  { name: '贴片电感', range: 'nH ~ μH',   app: 'DC-DC开关电源、手机电路',  color: '#00e676', icon: '🟩' },
];

const APPS = [
  { icon: '📡', t: 'EMI 滤波', d: '开关电源输入端用共模电感抑制高频干扰，防止辐射干扰其他设备' },
  { icon: '⚡', t: 'Boost / Buck', d: '开关电源核心元件：Buck降压时电感续流储能，Boost升压时电感积累能量释放' },
  { icon: '💡', t: '日光灯镇流器', d: '传统电感镇流器限制启动电流，现代电子镇流器用高频振荡取代' },
  { icon: '🔄', t: 'LC 谐振槽路', d: '收音机调谐回路，配合可变电容选择电台频率，f = 1/(2π√LC)' },
  { icon: '🛡️', t: '续流保护', d: '感性负载（电机、继电器）断电时产生反向高压，与二极管配合保护开关管' },
  { icon: '🔌', t: '功率因数校正', d: 'PFC电路用电感实现近似正弦波输入电流，减少谐波，节省电能' },
];

export default function Inductor() {
  const [powered, setPowered] = useState(true);

  return (
    <section id="inductor" className="sec">
      <div className="sh">
        <span className="sh-icon">🌀</span>
        <div className="sh-tag">Stage 3 · Components · Inductor</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(0,188,212,.45)` }}>
          电感基础
        </h2>
        <p className="sh-sub">
          电感是存储磁场能量的元件，电流无法突变是其最重要的特性。理解它是看懂开关电源、EMI 滤波电路的基础。
        </p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Canvas + Formulas */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 16 }}>
          <InductorCanvas powered={powered} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[['通电', true], ['断电', false]].map(([lbl, val]) => (
              <button key={lbl} onClick={() => setPowered(val)} style={{
                padding: '6px 26px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${powered === val ? ACC : 'rgba(0,188,212,.25)'}`,
                background: powered === val ? 'rgba(0,188,212,.18)' : 'transparent',
                color: powered === val ? ACC : 'var(--dim)', font: '13px/1 inherit', transition: 'all .18s',
              }}>{lbl}</button>
            ))}
          </div>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', textAlign: 'center', paddingBottom: 4 }}>
            通电时磁场扩展，断电时产生反电动势
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            🌀 核心公式
          </div>
          {FORMULAS.map(row => (
            <div key={row.f} className="fbox" style={{ borderColor: 'rgba(0,188,212,.22)' }}>
              <div className="fbox-f" style={{ color: ACC }}>{row.f}</div>
              <div className="fbox-desc">{row.desc}</div>
              <div className="fbox-note">{row.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inductor types */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🗂️ 四大类电感对比</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {TYPES.map(t => (
            <div key={t.name} className="glass reveal" style={{ borderColor: `${t.color}28` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <div style={{ fontWeight: 700, color: t.color, fontSize: 14 }}>{t.name}</div>
              </div>
              <div style={{ fontSize: 12, color: '#8aacb8', marginBottom: 4 }}>
                <span style={{ color: t.color, fontFamily: '"Courier New",monospace' }}>范围 </span>{t.range}
              </div>
              <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.5 }}>
                <span style={{ color: t.color, fontFamily: '"Courier New",monospace' }}>应用 </span>{t.app}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time domain characteristic */}
      <div style={{ marginTop: 36, padding: '16px 22px', background: 'rgba(0,188,212,.05)', border: '1px solid rgba(0,188,212,.18)', borderRadius: 14 }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 15 }}>⏱️ 时域特性——电流不能突变</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {[
            { title: '开关瞬间', detail: '开关断开时，电流趋于突变为零，但 v = L·dI/dt 使电感产生极高的感应电压（可能数百伏），损坏开关管。' },
            { title: '续流作用', detail: '在 Buck 降压电路中，开关关断后电感继续通过续流二极管提供电流，维持输出电流连续，减少纹波。' },
            { title: '类比记忆', detail: '电感就像电路中的"惯性飞轮"：飞轮转动（电流流动）后不能立刻停止，同理，改变电感中的电流需要时间和能量。' },
          ].map(item => (
            <div key={item.title} style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.65 }}>
              <div style={{ color: ACC, fontWeight: 700, marginBottom: 4 }}>▸ {item.title}</div>
              {item.detail}
            </div>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>🔩 电感的六大应用场景</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {APPS.map(u => (
            <div key={u.t} className="glass reveal" style={{ borderColor: 'rgba(0,188,212,.14)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{u.icon}</div>
              <div style={{ fontWeight: 700, color: ACC, marginBottom: 6, fontSize: 14 }}>{u.t}</div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>{u.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Repair tip */}
      <div style={{ marginTop: 32, background: 'rgba(255,82,82,.06)', border: '1px solid rgba(255,82,82,.2)', borderRadius: 14, padding: '16px 22px' }}>
        <div style={{ fontWeight: 700, color: '#ff5252', marginBottom: 10 }}>⚠️ 维修注意事项</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {[
            '感性负载（继电器、电机）必须加续流二极管，否则关断时反压会烧毁三极管/MOS管',
            '拆除电感前先用万用表量直流电阻（DCR），断线的电感阻值无穷大',
            '开关电源电感饱和会导致输出电压失控，检查额定电流是否超规格',
            '磁环电感绕线时要均匀分布，避免电场耦合引入噪声',
          ].map(tip => (
            <div key={tip} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8aacb8', lineHeight: 1.55 }}>
              <span style={{ color: '#ff5252', flexShrink: 0 }}>▸</span>{tip}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
