import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { IND_ACC, QUIZ_PHASE } from '../../data/industrialData';

const ACC = IND_ACC;
const SQ3 = Math.sqrt(3);
const U_PHASE = 220;

function PhaseCanvas({ freqRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const colors = ['#ff9800', '#ffc107', '#ff6b35'];
    const labels = ['L1', 'L2', 'L3'];

    function draw() {
      const freq = freqRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.02 * (freq / 50);

      ctx.fillStyle = 'rgba(255,152,0,.35)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`三相相量 · ${freq} Hz · 相位差 120°`, W / 2, 25);

      const cx = W / 2, cy = 175, R = 85;
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2); ctx.stroke();

      for (let d = 0; d < 360; d += 30) {
        const rad = (d * Math.PI) / 180;
        ctx.strokeStyle = 'rgba(255,255,255,.06)';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(rad) * R, cy + Math.sin(rad) * R); ctx.stroke();
      }

      const tips = [];
      [0, 1, 2].forEach(i => {
        const base = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const ang = base + t * 2;
        const x = cx + Math.cos(ang) * R;
        const y = cy + Math.sin(ang) * R;
        tips.push({ x, y });
        ctx.strokeStyle = colors[i]; ctx.lineWidth = 2.5;
        ctx.shadowColor = colors[i]; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = colors[i];
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c8dce6'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(labels[i], x, y - 14);
        const deg = ((ang * 180) / Math.PI + 360) % 360;
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '9px monospace';
        ctx.fillText(`${deg.toFixed(0)}°`, x, y + 20);
      });

      ctx.strokeStyle = 'rgba(255,152,0,.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(tips[0].x, tips[0].y); ctx.lineTo(tips[1].x, tips[1].y);
      ctx.lineTo(tips[2].x, tips[2].y); ctx.closePath(); ctx.stroke();
      ctx.setLineDash([]);

      const uL = SQ3 * U_PHASE;
      ctx.fillStyle = 'rgba(255,152,0,.12)'; ctx.strokeStyle = 'rgba(255,152,0,.3)';
      ctx.beginPath(); ctx.roundRect(12, H - 58, W - 24, 46, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`相电压 U_P ≈ ${U_PHASE} V  →  线电压 U_L = √3·U_P ≈ ${uL.toFixed(0)} V`, 22, H - 38);
      ctx.fillText('对称三相：旋转磁场 · 中性线电流理论上为零', 22, H - 20);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [freqRef]);

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

export default function IndustrialPhase() {
  const [freq, setFreq] = useState(50);
  const freqRef = useRef(freq);
  useEffect(() => { freqRef.current = freq; });

  const uL = SQ3 * U_PHASE;

  return (
    <section id="industrial-phase" className="sec">
      <div className="sh">
        <span className="sh-icon">🔺</span>
        <div>
          <div className="sh-tag">Industrial · Chapter 01 · 三相基础</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}55` }}>三相电与 120° 相位</h2>
          <p className="sh-sub">
            对称三相彼此相差 120°，在空间绕组上产生旋转磁场。理解相电压与线电压关系，是工业配电与电机原理的起点。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 14 }}>
          <PhaseCanvas freqRef={freqRef} />
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: '11px monospace', color: 'var(--dim)', marginBottom: 6 }}>
              <span>10 Hz</span><span style={{ color: ACC, fontWeight: 700 }}>{freq} Hz</span><span>100 Hz</span>
            </div>
            <input type="range" min={10} max={100} step={1} value={freq} onChange={e => setFreq(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center' }}>拖动频率观察相量旋转速度（示意，非真实比例）。</p>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${ACC}33` }}>
            <div className="formula" style={{ color: ACC }}>U_L = √3 · U_P</div>
            <div className="fdesc">星形接法 · 线电压与相电压</div>
          </div>
          <div className="glass" style={{ borderColor: `${ACC}33` }}>
            <h4 style={{ color: ACC, marginBottom: 10 }}>数值示例（三相四线）</h4>
            <p style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.8 }}>
              相电压 <strong style={{ color: 'var(--white)' }}>U_P ≈ 220 V</strong>（相线–零线）<br />
              线电压 <strong style={{ color: ACC }}>U_L ≈ {uL.toFixed(0)} V</strong>（相间）<br />
              三相功率 <strong style={{ color: 'var(--white)' }}>P = √3 · U_L · I_L · cosφ</strong>
            </p>
          </div>
          <ICard color={ACC} title="📐 为什么是 √3？">
            两相量相差 120° 时，线电压幅值为相电压的 √3 倍。380 V 线电压对应约 220 V 相电压。
          </ICard>
          <ICard color="var(--cyan)" title="🌀 旋转磁场">
            三相对称交流通过空间差 120° 的绕组，合成旋转磁场，驱动感应电机。
          </ICard>
          <ICard color="#ff6b35" title="⚠️ 缺相危害">
            缺相时转矩脉动、电流异常增大，电机可能过热烧毁——工业现场需相序与缺相保护。
          </ICard>
        </div>
      </div>

      <div className="fbox reveal" style={{ maxWidth: 980, margin: '20px auto 0', borderLeft: `3px solid ${ACC}` }}>
        <strong>相序</strong>：L1→L2→L3 决定旋转磁场方向；接反可能导致电机反转。本动画为教学示意。
      </div>

      <Quiz questions={QUIZ_PHASE} title="三相基础小测验" accentColor={ACC} />
      <RelatedSections sectionId="industrial-phase" />
    </section>
  );
}
