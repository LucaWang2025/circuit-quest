import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ffd600';

function SolarCanvas({ stateRef, sunRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const st = stateRef.current; // day / night / cloudy
      const sunPct = sunRef.current; // 0-100
      const on = st !== 'night';
      const irr = st === 'cloudy' ? sunPct * 0.3 : st === 'day' ? sunPct : 0; // W/m² scaled 0-100
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = on ? 'rgba(255,214,0,.44)' : 'rgba(60,70,90,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = on ? '#111' : '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      const pvW = Math.round(irr * 3); // 模拟瓦数，最大 300W
      ctx.fillText(
        on ? `光伏发电 ${pvW}W · 逆变器 → 并网 · 辐照 ${Math.round(irr * 10)}W/m²` : '夜晚 · 停止发电 · 从电网取电',
        W / 2, 27
      );

      // ── 太阳 ──
      const sunX = 60, sunY = 80;
      if (on) {
        ctx.fillStyle = `rgba(255,214,0,${0.3 + 0.2 * Math.sin(t * 2)})`; ctx.shadowColor = '#ffd600'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(sunX, sunY, 24, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t * 0.5;
          ctx.strokeStyle = `rgba(255,214,0,${0.5 * irr / 100})`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sunX + Math.cos(a) * 26, sunY + Math.sin(a) * 26);
          ctx.lineTo(sunX + Math.cos(a) * 36, sunY + Math.sin(a) * 36); ctx.stroke();
        }
        if (st === 'cloudy') {
          ctx.fillStyle = 'rgba(150,160,180,.5)'; ctx.beginPath(); ctx.ellipse(sunX + 18, sunY + 5, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(sunX + 8, sunY + 12, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        ctx.fillStyle = 'rgba(180,190,210,.5)'; ctx.beginPath(); ctx.arc(sunX, sunY, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillText('月夜', sunX, sunY + 30);
      }

      // ── 光子射线 → 组件 ──
      const pvX = 155, pvY = 130;
      if (on && irr > 10) {
        for (let r = 0; r < 4; r++) {
          const frac = ((t * 0.7 + r * 0.25) % 1);
          const px = sunX + 30 + frac * (pvX - sunX - 55), py = sunY + 5 + frac * (pvY - sunY - 20);
          ctx.fillStyle = `rgba(255,214,0,${0.8 - frac * 0.6})`; ctx.shadowColor = '#ffd600'; ctx.shadowBlur = 4;
          ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ── 光伏板 ──
      const cols = 3, rows = 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = pvX + c * 42, cy = pvY + r * 36;
          const glow = on && irr > 0 ? irr / 100 : 0;
          ctx.fillStyle = `rgba(25,35,80,${0.8 + glow * 0.2})`;
          ctx.strokeStyle = `rgba(100,150,255,${0.2 + glow * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.roundRect(cx, cy, 38, 32, 3); ctx.fill(); ctx.stroke();
          if (glow > 0.1) {
            ctx.fillStyle = `rgba(0,100,255,${glow * 0.15})`;
            ctx.fill();
          }
          // 栅线
          ctx.strokeStyle = `rgba(150,170,255,${0.1 + glow * 0.3})`; ctx.lineWidth = 0.7;
          for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(cx + k * 9, cy); ctx.lineTo(cx + k * 9, cy + 32); ctx.stroke(); }
        }
      }
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('光伏组件 (6× 50W)', pvX + 58, pvY + 80);

      // 直流导线 PV→逆变器
      ctx.strokeStyle = on ? `rgba(255,214,0,${0.5 + 0.2 * Math.sin(t * 4)})` : 'rgba(80,90,110,.25)';
      ctx.lineWidth = 2.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(pvX + 116, pvY + 35); ctx.lineTo(290, 165); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`DC ${Math.round(irr * 4)}V`, 240, 152);

      // ── 逆变器 ──
      const invX = 305, invY = 170;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = on ? ACC : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(invX - 36, invY - 44, 72, 88, 8); ctx.fill(); ctx.stroke();
      if (on && pvW > 0) {
        const phase = t * 3;
        ctx.strokeStyle = `rgba(255,214,0,${0.5 + 0.2 * Math.sin(t * 5)})`; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 56; x++) {
          const px = invX - 24 + x, py = invY + Math.sin(x / 56 * Math.PI * 2 + phase) * 12;
          x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.fillStyle = on ? ACC : '#556'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('逆变器', invX, invY + 30);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText('DC→AC 220V', invX, invY + 43);

      // AC导线→电网
      ctx.strokeStyle = on ? `rgba(0,230,118,${0.5 + 0.2 * Math.sin(t * 3)})` : 'rgba(80,90,110,.25)';
      ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(invX + 36, invY); ctx.lineTo(430, invY); ctx.stroke();
      ctx.setLineDash([]);

      // ── 电网/家庭负载 ──
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(418, invY - 30, 52, 60, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(pvW > 100 ? '余电' : '补电', 444, invY - 8);
      ctx.fillText('并网', 444, invY + 6);
      ctx.fillText('电网', 444, invY + 20);

      // 底部
      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = on ? `rgba(255,214,0,${0.7 + 0.3 * Math.sin(t * 3)})` : 'rgba(100,120,145,.6)';
      ctx.fillText(
        on ? `光子→电子（PN结光电效应）→ DC ${Math.round(irr * 4)}V → 逆变 220V AC → 并网` : '○ 夜间无发电，从电网取电',
        W / 2, H - 10
      );

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stateRef, sunRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function Solar() {
  const [state, setState] = useState('day');
  const [sun, setSun] = useState(80);
  const stateRef = useRef(state);
  const sunRef = useRef(sun);
  useEffect(() => { stateRef.current = state; sunRef.current = sun; });

  const btn = (id, col, label) => (
    <button onClick={() => setState(id)} style={{
      padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${state === id ? col : 'rgba(255,255,255,.12)'}`,
      background: state === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: state === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="solar" className="sec">
      <div className="sh">
        <span className="sh-icon">☀️</span>
        <div>
          <div className="sh-tag">SOLAR PV · 光伏 · 逆变器 · 并网</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>家用光伏</h2>
          <p className="sh-sub">光电效应 → 直流发电 → 逆变并网——从光子到家用电</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,214,0,.2)', flexDirection: 'column', gap: 14 }}>
          <SolarCanvas stateRef={stateRef} sunRef={sunRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {btn('day', ACC, '☀️ 晴天')}
            {btn('cloudy', '#607d8b', '⛅ 阴天')}
            {btn('night', '#3f51b5', '🌙 夜晚')}
          </div>
          {state !== 'night' && (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>辐照强度 {sun}%</div>
              <input type="range" min={10} max={100} value={sun} onChange={e => setSun(+e.target.value)}
                style={{ width: '100%', accentColor: ACC }} />
            </div>
          )}
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,214,0,.18)' }}>
            <div className="formula" style={{ color: ACC }}>光子 → PN结 → 直流电 → 逆变并网</div>
            <div className="fdesc">典型家用屋顶 5kWp，年发电 5000~6000kWh</div>
          </div>
          <ICard color={ACC} title="🔆 光电效应 PN 结">
            P 型硅与 N 型硅形成 PN 结，光子激发电子-空穴对，内建电场将其分开形成电流。
            单晶硅组件效率 20~24%，多晶 16~18%，钙钛矿 &gt;30%（实验室）。
          </ICard>
          <ICard color={ACC} title="🔄 逆变器类型">
            <strong>组串逆变器</strong>：多块串联组件接一个逆变器，成本低；
            <strong>微逆</strong>：每块组件配一个，遮挡影响小；
            <strong>储能逆变器</strong>：集成电池储能功能（白天蓄电，晚上放电）。
          </ICard>
          <ICard color={ACC} title="🏠 并网模式">
            发电&gt;用电：余电上网（卖给电网，通常 0.3~0.4 元/kWh）；
            发电&lt;用电：从电网补充；双向智能电表计量双向电量。
          </ICard>
          <ICard color="#ff5252" title="⚠️ 安装安全">
            组件满负荷时开路电压可达 600V DC，不可徒手触碰正负极；
            安装须专业电工操作；防雷接地必不可少。
          </ICard>
        </div>
      </div>
    </section>
  );
}
