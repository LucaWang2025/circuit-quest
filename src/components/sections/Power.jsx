import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ff6b35';

// ── Power Meter Canvas ────────────────────────────────────
function PowerMeter({ watt }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = setupHiDpi(cv, 320, 300);
    const W = 320, H = 300;
    let rafId, t = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;
      const CX = W / 2, CY = H * 0.52;
      const R = Math.min(W, H) * 0.34;

      // Gauge background arc
      const startA = Math.PI * 0.75, endA = Math.PI * 2.25;
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 18; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(CX, CY, R, startA, endA); ctx.stroke();

      // Gauge fill – dynamic shimmer
      const pct = Math.min(watt / 3000, 1);
      const fillA = startA + (endA - startA) * pct;
      const grad = ctx.createLinearGradient(CX - R, CY, CX + R, CY);
      grad.addColorStop(0, '#00e676'); grad.addColorStop(0.5, '#ffab00'); grad.addColorStop(1, '#ff1744');
      ctx.strokeStyle = grad; ctx.lineWidth = 18; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(CX, CY, R, startA, fillA); ctx.stroke();

      // Needle
      const needleA = startA + (endA - startA) * pct;
      const nx = CX + Math.cos(needleA) * (R - 6);
      const ny = CY + Math.sin(needleA) * (R - 6);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#fff'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(nx, ny); ctx.stroke();
      ctx.shadowBlur = 0;

      // Center dot
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(CX, CY, 7, 0, Math.PI * 2); ctx.fill();

      // Labels on arc
      const zones = [['省电', 0.1, '#00e676'], ['适中', 0.45, '#ffab00'], ['高耗', 0.85, '#ff1744']];
      ctx.font = '11px "Courier New",monospace'; ctx.textAlign = 'center';
      zones.forEach(([text, p, color]) => {
        const a = startA + (endA - startA) * p;
        const lx = CX + Math.cos(a) * (R + 22); const ly = CY + Math.sin(a) * (R + 22);
        ctx.fillStyle = color; ctx.fillText(text, lx, ly);
      });

      // Watt display
      ctx.shadowColor = ACC; ctx.shadowBlur = 20;
      ctx.fillStyle = ACC; ctx.font = `bold ${watt >= 1000 ? 32 : 38}px "Courier New",monospace`;
      ctx.textAlign = 'center'; ctx.fillText(`${watt}`, CX, CY + 14);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,107,53,.6)'; ctx.font = '14px "Courier New",monospace';
      ctx.fillText('W', CX, CY + 36);

      // Tick marks
      for (let i = 0; i <= 20; i++) {
        const a = startA + (endA - startA) * (i / 20);
        const r1 = R - 24, r2 = i % 5 === 0 ? R - 12 : R - 18;
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(CX + Math.cos(a) * r1, CY + Math.sin(a) * r1);
        ctx.lineTo(CX + Math.cos(a) * r2, CY + Math.sin(a) * r2);
        ctx.stroke();
      }

      // Sine wave at bottom (AC current)
      ctx.strokeStyle = `rgba(255,107,53,${0.4 + 0.15 * Math.sin(t * 2)})`; ctx.lineWidth = 1.5;
      ctx.beginPath();
      const waveY = H - 30, waveW = W * 0.7, waveX0 = W * 0.15;
      for (let x = 0; x <= waveW; x += 2) {
        const y = waveY + 14 * Math.sin((x / waveW) * Math.PI * 4 + t * 3);
        x === 0 ? ctx.moveTo(waveX0 + x, y) : ctx.lineTo(waveX0 + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,107,53,0.45)'; ctx.font = '10px "Courier New",monospace';
      ctx.textAlign = 'center';
      ctx.fillText('50Hz 正弦波 · AC', W / 2, H - 8);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [watt]);
  return <canvas ref={ref} width={320} height={300} />;
}

// ── Data ──────────────────────────────────────────────────
const DEVICES = [
  { name: 'LED 灯泡',   watt: 9,    icon: '💡' },
  { name: '电风扇',     watt: 45,   icon: '🌀' },
  { name: '冰箱',       watt: 90,   icon: '❄️' },
  { name: '电视机',     watt: 120,  icon: '📺' },
  { name: '洗衣机',     watt: 500,  icon: '🫧' },
  { name: '空调 1匹',   watt: 735,  icon: '❄' },
  { name: '电热水器',   watt: 1500, icon: '🚿' },
  { name: '电磁炉',     watt: 2000, icon: '🍳' },
];

const FORMULAS = [
  { f: 'P = U × I', desc: '功率 = 电压 × 电流', note: '单位：W = V × A' },
  { f: 'P = I² × R', desc: '功率 = 电流² × 电阻', note: '适合计算导线热损耗' },
  { f: 'P = U² / R', desc: '功率 = 电压² / 电阻', note: '已知电压和负载时常用' },
  { f: 'W = P × t', desc: '电能 = 功率 × 时间', note: '单位：Wh（瓦时）= W × h' },
  { f: '1 度 = 1 kWh', desc: '1 千瓦·小时 = 1 度电', note: '1000W 设备运行 1 小时耗 1 度' },
];

export default function Power() {
  const [watt, setWatt] = useState(100);
  const [hours, setHours] = useState(8);
  const kwh = ((watt * hours) / 1000).toFixed(3);
  const fee = (kwh * 0.6).toFixed(2);

  return (
    <section id="power" className="sec">
      <div className="sh">
        <span className="sh-icon">💡</span>
        <div className="sh-tag">Stage 2 · Power & Energy</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,107,53,.4)` }}>
          电功率与电能
        </h2>
        <p className="sh-sub">功率是电能转化的速率，理解它才能看懂用电设备的耗能、计算电费、合理用电。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Meter + Formulas */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,.2)', flexDirection: 'column', gap: 14 }}>
          <PowerMeter watt={watt} />
          <div style={{ width: '88%' }}>
            <input type="range" min={1} max={3000} value={watt}
              onChange={e => setWatt(+e.target.value)}
              style={{ width: '100%', accentColor: ACC }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', font: '11px "Courier New",monospace', color: 'var(--dim)', marginTop: 4 }}>
              <span>1 W</span><span style={{ color: ACC }}>{watt} W</span><span>3000 W</span>
            </div>
          </div>
          {/* Device presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', width: '90%' }}>
            {DEVICES.map(d => (
              <button key={d.name} onClick={() => setWatt(d.watt)} style={{
                padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${watt === d.watt ? ACC : 'rgba(255,107,53,.22)'}`,
                background: watt === d.watt ? 'rgba(255,107,53,.18)' : 'transparent',
                color: watt === d.watt ? ACC : 'var(--dim)', font: '11.5px/1 inherit', transition: 'all .18s',
              }}>{d.icon} {d.name}</button>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            ⚡ 核心公式
          </div>
          {FORMULAS.map(row => (
            <div key={row.f} className="fbox" style={{ borderColor: 'rgba(255,107,53,.22)' }}>
              <div className="fbox-f" style={{ color: ACC }}>{row.f}</div>
              <div className="fbox-desc">{row.desc}</div>
              <div className="fbox-note">{row.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Electric bill calculator */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          🧮 电费计算器
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div className="glass reveal" style={{ borderColor: 'rgba(255,107,53,.2)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontWeight: 600, color: 'var(--white)' }}>设备功率（W）</div>
            <input type="number" value={watt} min={1} max={30000}
              onChange={e => setWatt(Math.min(30000, Math.max(1, +e.target.value)))}
              style={{
                background: 'rgba(255,107,53,.1)', border: '1px solid rgba(255,107,53,.3)',
                borderRadius: 8, padding: '8px 14px', color: ACC,
                font: 'bold 20px "Courier New",monospace', width: '100%',
              }} />
            <div style={{ fontWeight: 600, color: 'var(--white)' }}>每天使用时长（h）</div>
            <input type="range" min={0.5} max={24} step={0.5} value={hours}
              onChange={e => setHours(+e.target.value)} style={{ accentColor: ACC }} />
            <div style={{ color: ACC, font: '13px "Courier New",monospace' }}>
              {hours} 小时 / 天
            </div>
          </div>
          <div className="glass reveal" style={{ borderColor: 'rgba(255,107,53,.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, textAlign: 'center' }}>
            <div>
              <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', marginBottom: 6 }}>每天耗电</div>
              <div style={{ font: `bold 38px "Courier New",monospace`, color: ACC, textShadow: `0 0 20px rgba(255,107,53,.5)` }}>{kwh}</div>
              <div style={{ font: '14px "Courier New",monospace', color: 'rgba(255,107,53,.6)' }}>度 / 天</div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,107,53,.18)' }} />
            <div>
              <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', marginBottom: 6 }}>每月电费（≈0.6元/度）</div>
              <div style={{ font: `bold 34px "Courier New",monospace`, color: '#ffab00', textShadow: `0 0 20px rgba(255,171,0,.5)` }}>¥ {(+fee * 30).toFixed(1)}</div>
              <div style={{ font: '12px "Courier New",monospace', color: 'rgba(255,171,0,.6)' }}>元 / 月</div>
            </div>
          </div>
          <div className="glass reveal" style={{ borderColor: 'rgba(255,107,53,.2)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 14 }}>常见设备月耗对比</div>
            {DEVICES.map(d => {
              const monthKwh = (d.watt * 8 * 30 / 1000).toFixed(1);
              const barPct = Math.min((d.watt / 2000) * 100, 100);
              return (
                <div key={d.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', font: '12px inherit', color: 'var(--dim)', marginBottom: 3 }}>
                    <span>{d.icon} {d.name}</span>
                    <span style={{ color: ACC }}>{monthKwh} 度</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.07)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${barPct}%`, height: '100%', background: `linear-gradient(90deg,#00e676,${ACC})`, borderRadius: 4, transition: 'width .5s' }} />
                  </div>
                </div>
              );
            })}
            <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', marginTop: 8 }}>* 按每天 8 小时计算</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { icon: '🔍', t: '认识铭牌', d: '电器铭牌标注额定功率，是计算电费的基础数据' },
          { icon: '📊', t: '峰谷电价', d: '部分地区白天和夜间电价不同，合理调度用电可节省费用' },
          { icon: '🌙', t: '待机功耗', d: '电视、机顶盒等设备关机后仍有待机功耗，长期积累可观' },
          { icon: '⚡', t: '功率因数', d: '感性负载（电机、变压器）的实际功耗比视在功率低，需关注' },
        ].map(tip => (
          <div key={tip.t} className="icard reveal" style={{ borderColor: 'rgba(255,107,53,.15)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{tip.icon}</div>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 6, fontSize: 14 }}>{tip.t}</div>
            <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>{tip.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
