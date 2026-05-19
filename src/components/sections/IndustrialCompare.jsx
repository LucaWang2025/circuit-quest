import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { IND_ACC, QUIZ_COMPARE } from '../../data/industrialData';

const ACC = IND_ACC;

function CompareCanvas({ highlightRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function drawHome(x0, w, lit) {
      const cx = x0 + w / 2, cy = 150;
      ctx.fillStyle = lit ? 'rgba(0,188,212,.15)' : 'rgba(255,255,255,.03)';
      ctx.strokeStyle = lit ? '#00bcd4' : 'rgba(255,255,255,.15)';
      ctx.beginPath(); ctx.roundRect(x0 + 8, 40, w - 16, 220, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = lit ? '#00bcd4' : '#8ab4d4';
      ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText('家用 · 单相 220V', cx, 58);

      ctx.strokeStyle = lit ? '#00bcd4' : 'rgba(0,188,212,.4)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 40, cy); ctx.lineTo(cx + 40, cy); ctx.stroke();
      ctx.fillStyle = '#ff5252'; ctx.beginPath(); ctx.arc(cx - 40, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#64c8ff'; ctx.beginPath(); ctx.arc(cx + 40, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#aabfc8'; ctx.font = '9px monospace';
      ctx.fillText('L', cx - 40, cy + 18); ctx.fillText('N', cx + 40, cy + 18);

      const wave = Math.sin(t * 3) * 12;
      ctx.strokeStyle = lit ? '#00bcd4' : 'rgba(0,188,212,.5)';
      ctx.beginPath();
      for (let x = 0; x < w - 40; x++) {
        const y = cy + 50 + Math.sin((x / 30) + t * 4) * (8 + wave * 0.2);
        x === 0 ? ctx.moveTo(x0 + 20 + x, y) : ctx.lineTo(x0 + 20 + x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace';
      ctx.fillText('插座 · 照明 · 空调', cx, cy + 85);
      ctx.fillText('1 相 + 零线', cx, cy + 100);
    }

    function drawIndustrial(x0, w, lit) {
      const cx = x0 + w / 2, cy = 150;
      ctx.fillStyle = lit ? 'rgba(255,152,0,.15)' : 'rgba(255,255,255,.03)';
      ctx.strokeStyle = lit ? ACC : 'rgba(255,255,255,.15)';
      ctx.beginPath(); ctx.roundRect(x0 + 8, 40, w - 16, 220, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = lit ? ACC : '#8ab4d4';
      ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText('工业 · 三相 380V', cx, 58);

      const colors = ['#ff9800', '#ffc107', '#ff6b35'];
      const labels = ['L1', 'L2', 'L3'];
      [0, 1, 2].forEach(i => {
        const ang = t * 2 + (i * 2 * Math.PI) / 3;
        const px = cx + Math.cos(ang) * 45;
        const py = cy + Math.sin(ang) * 28;
        ctx.strokeStyle = colors[i]; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
        ctx.fillStyle = colors[i];
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#aabfc8'; ctx.font = '8px monospace';
        ctx.fillText(labels[i], px, py + (py > cy ? 14 : -10));
      });

      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace';
      ctx.fillText('机床 · 风机 · 水泵', cx, cy + 75);
      ctx.fillText('3 相 · 旋转磁场', cx, cy + 90);
      ctx.fillText('U_L ≈ 380 V', cx, cy + 108);
    }

    function draw() {
      const hi = highlightRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(255,152,0,.3)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText('220 V 单相住宅  vs  380 V 三相动力', W / 2, 24);

      const half = W / 2;
      drawHome(0, half, hi === 'home' || hi === 'both');
      drawIndustrial(half, half, hi === 'ind' || hi === 'both');

      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(half, 36); ctx.lineTo(half, H - 20); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,152,0,.12)'; ctx.strokeStyle = 'rgba(255,152,0,.3)';
      ctx.beginPath(); ctx.roundRect(12, H - 44, W - 24, 32, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('同一配电变压器：线间 380V · 相-零 220V', W / 2, H - 24);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [highlightRef]);

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

export default function IndustrialCompare() {
  const [highlight, setHighlight] = useState('both');
  const highlightRef = useRef(highlight);
  useEffect(() => { highlightRef.current = highlight; });

  return (
    <section id="industrial-compare" className="sec">
      <div className="sh">
        <span className="sh-icon">⚖️</span>
        <div>
          <div className="sh-tag">Industrial · Chapter 04 · 家用对比</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}55` }}>220V 家用 vs 380V 工业</h2>
          <p className="sh-sub">
            居民进户多为单相 220 V；车间大功率设备常用三相 380 V。二者来自同一低压配电系统，但接线、危险性与保护要求不同。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 14 }}>
          <CompareCanvas highlightRef={highlightRef} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'home', label: '🏠 突出家用' },
              { id: 'ind', label: '🏭 突出工业' },
              { id: 'both', label: '⚖️ 对比' },
            ].map(o => (
              <button
                key={o.id}
                type="button"
                className="chip"
                style={{ borderColor: highlight === o.id ? ACC : undefined, background: highlight === o.id ? 'rgba(255,152,0,.12)' : undefined }}
                onClick={() => setHighlight(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${ACC}33` }}>
            <div className="formula" style={{ color: ACC }}>380 V / √3 ≈ 220 V</div>
            <div className="fdesc">同一变压器下的两种取电方式</div>
          </div>
          <ICard color="#00bcd4" title="🏠 家用单相">
            火线 L + 零线 N，约 220 V。适用于照明、插座、小家电；配电箱空开 + 漏电保护。
          </ICard>
          <ICard color={ACC} title="🏭 工业三相">
            三相四线 L1/L2/L3 + N，线电压约 380 V。大电机、焊机、配电柜；需规范挂牌与锁定挂牌 (LOTO)。
          </ICard>
          <ICard color="#ff6b35" title="⚡ 安全差异">
            更高电压触电风险更大；工业现场强调绝缘、接地、监护与持证操作，切勿带电作业。
          </ICard>
          <ICard color="var(--cyan)" title="📊 功率因数">
            大感性负载（电机）消耗无功，工业侧常装电容补偿；家庭负荷功率因数通常不是主要问题。
          </ICard>
        </div>
      </div>

      <div className="fbox reveal" style={{ maxWidth: 980, margin: '20px auto 0', borderLeft: `3px solid ${ACC}` }}>
        <strong>入户</strong>：居民表计多为单相或三相（别墅/大户型），但多数插座回路仍为 220 V 单相。三相入户可接 380 V 动力设备。
      </div>

      <Quiz questions={QUIZ_COMPARE} title="家用与工业对比测验" accentColor={ACC} />
      <RelatedSections sectionId="industrial-compare" />
    </section>
  );
}
