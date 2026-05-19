import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { IND_ACC, QUIZ_MOTOR } from '../../data/industrialData';

const ACC = IND_ACC;

function MotorCanvas({ modeRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    let phase = 0;

    function draw() {
      const mode = modeRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.016;
      phase = (phase + 0.008) % 1;

      let voltage = 1;
      let label = '直接启动 · 全压合闸';
      if (mode === 'yd') {
        voltage = phase < 0.45 ? 0.58 : 1;
        label = phase < 0.45 ? '星接启动 · 降压 ~58%' : '切换 Δ · 满压运行';
        if (phase > 0.92) phase = 0;
      } else if (mode === 'soft') {
        voltage = Math.min(1, phase * 1.2);
        label = `软启动 · 电压爬升 ${(voltage * 100).toFixed(0)}%`;
        if (phase >= 1) phase = 0.15;
      }

      const rpm = voltage * 1480 + Math.sin(t * 8) * (mode === 'direct' ? 15 : 8);
      const current = mode === 'direct' ? 6.5 : mode === 'yd' ? (voltage < 0.7 ? 2.2 : 5.8) : 2 + voltage * 4;

      ctx.fillStyle = 'rgba(255,152,0,.35)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, W / 2, 25);

      const mx = 155, my = 175;
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.strokeStyle = 'rgba(255,152,0,.25)';
      ctx.beginPath(); ctx.roundRect(mx - 55, my - 45, 110, 90, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#aabfc8'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('三相电机', mx, my - 52);

      const spin = t * voltage * 4;
      ctx.strokeStyle = ACC; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(mx, my, 32, spin, spin + Math.PI * 1.6); ctx.stroke();
      ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = 'bold 11px monospace';
      ctx.fillText(`${rpm.toFixed(0)} rpm`, mx, my + 58);

      const bx = 300, by = 60, bw = 150, bh = 200;
      ctx.fillStyle = 'rgba(255,255,255,.03)';
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill(); ctx.stroke();

      const barH = bh - 50;
      const vH = barH * voltage;
      const iH = barH * (current / 7);
      ctx.fillStyle = 'rgba(255,152,0,.15)'; ctx.fillRect(bx + 20, by + 30, 45, barH);
      ctx.fillStyle = ACC; ctx.fillRect(bx + 20, by + 30 + barH - vH, 45, vH);
      ctx.fillStyle = 'rgba(255,107,53,.15)'; ctx.fillRect(bx + 85, by + 30, 45, barH);
      ctx.fillStyle = '#ff6b35'; ctx.fillRect(bx + 85, by + 30 + barH - iH, 45, iH);
      ctx.fillStyle = '#8ab4d4'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('电压', bx + 42, by + bh - 8);
      ctx.fillText('电流', bx + 107, by + bh - 8);
      ctx.fillText(`${(voltage * 380).toFixed(0)}V`, bx + 42, by + 18);
      ctx.fillText(`${current.toFixed(1)}A`, bx + 107, by + 18);

      if (mode === 'yd' && phase > 0.42 && phase < 0.48) {
        ctx.fillStyle = 'rgba(255,193,7,.9)';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('⇄ 星三角切换', W / 2, H - 18);
      }

      ctx.fillStyle = 'rgba(255,152,0,.12)'; ctx.strokeStyle = 'rgba(255,152,0,.3)';
      ctx.beginPath(); ctx.roundRect(12, H - 44, W - 24, 32, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText('大功率电机直接启动电流可达额定 5–7 倍 · 需降压或限流启动', 22, H - 24);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [modeRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function IndustrialMotor() {
  const [mode, setMode] = useState('direct');
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; });

  const modes = [
    { id: 'direct', label: '⚡ 直接启动' },
    { id: 'yd', label: '⭐△ 星三角' },
    { id: 'soft', label: '📈 软启动' },
  ];

  return (
    <section id="industrial-motor" className="sec">
      <div className="sh">
        <span className="sh-icon">🌀</span>
        <div>
          <div className="sh-tag">Industrial · Chapter 03 · 电机启动</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}55` }}>三相电机启动方式</h2>
          <p className="sh-sub">
            大功率电机直接合闸会产生巨大启动电流与机械冲击。星三角降压、软启动器平滑升压、变频器调速是现场常见方案。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 14 }}>
          <MotorCanvas modeRef={modeRef} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {modes.map(m => (
              <button
                key={m.id}
                type="button"
                className="chip"
                style={{ borderColor: mode === m.id ? ACC : undefined, background: mode === m.id ? 'rgba(255,152,0,.12)' : undefined }}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${ACC}33` }}>
            <div className="formula" style={{ color: ACC }}>I_启动 ∝ U / Z</div>
            <div className="fdesc">降低启动电压 → 减小冲击电流</div>
          </div>
          <ICard color={ACC} title="⚡ 直接启动 (DOL)">
            接触器一键合闸，简单廉价。适用于小功率电机（通常 ≤7.5 kW，视电网与规程而定）。
          </ICard>
          <ICard color="#ffc107" title="⭐△ 星三角启动">
            启动 Y 接、运行 Δ 接，启动电流约为直接启动的 1/3。需电机绕组支持双接法且切换时间受控。
          </ICard>
          <ICard color="var(--cyan)" title="📈 软启动 (SSR)">
            通过晶闸管控制导通角，平滑升高端电压，减小机械与电气冲击，常配旁路接触器。
          </ICard>
          <ICard color="#ff6b35" title="🛡️ 保护器件">
            热继电器防过载、断路器/熔断器防短路、漏电与缺相保护依规程配置。
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_MOTOR} title="电机启动小测验" accentColor={ACC} />
      <RelatedSections sectionId="industrial-motor" />
    </section>
  );
}
