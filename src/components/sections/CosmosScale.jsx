import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import {
  COSMOS_ACC, AU_KM, LY_KM, MARS_DELAY_FACTS, SCALE_REFERENCES,
  QUIZ_SCALE, auToKm, formatSci, lightTravelMinutes, lightTravelSeconds, C_KM_S,
} from '../../data/cosmosData';

const ORBIT_MARKERS = [
  { au: 0.39, label: '水星' }, { au: 0.72, label: '金星' }, { au: 1, label: '地球' },
  { au: 1.52, label: '火星' }, { au: 5.2, label: '木星' }, { au: 9.5, label: '土星' },
  { au: 19.2, label: '天王星' }, { au: 30.1, label: '海王星' },
];

function ScaleCanvas({ auRef, unitRef, pulseRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const logPos = (au, maxAu) => {
      const log = Math.log10(Math.max(au, 0.1));
      return 70 + ((log / Math.log10(maxAu)) * (W - 120));
    };

    function draw() {
      const au = auRef.current;
      const unit = unitRef.current;
      const pulse = pulseRef.current;
      const maxAu = 35;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(156,125,255,.35)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`对数距离尺 · ${au.toFixed(2)} AU · 光速 ${C_KM_S.toLocaleString()} km/s`, W / 2, 25);

      const sunX = 48, midY = 155;
      ctx.fillStyle = '#ffc850'; ctx.shadowColor = '#ffc850'; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(sunX, midY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sunX + 18, midY); ctx.lineTo(W - 30, midY); ctx.stroke();

      ORBIT_MARKERS.forEach(m => {
        const x = logPos(m.au, maxAu);
        ctx.strokeStyle = 'rgba(110,181,255,.15)'; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(x, midY - 50); ctx.lineTo(x, midY + 50); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = m.au <= au ? COSMOS_ACC : '#5a7a9a';
        ctx.beginPath(); ctx.arc(x, midY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8ab4d4'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillText(m.label, x, midY + 68);
        ctx.fillText(`${m.au}`, x, midY - 58);
      });

      const probeX = logPos(au, maxAu);
      ctx.strokeStyle = COSMOS_ACC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sunX, midY); ctx.lineTo(probeX, midY); ctx.stroke();

      if (pulse) {
        const frac = (t * 0.5) % 1;
        const px = sunX + 20 + frac * (probeX - sunX - 20);
        ctx.fillStyle = `rgba(255,220,100,${0.9 - frac * 0.7})`;
        ctx.shadowColor = '#ffd600'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(px, midY - 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      const pulseR = 6 + Math.sin(t * 4) * 2;
      ctx.fillStyle = COSMOS_ACC; ctx.shadowColor = COSMOS_ACC; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(probeX, midY, pulseR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      const km = auToKm(au);
      let conv = formatSci(km);
      if (unit === 'ly') conv = `${(km / LY_KM).toExponential(2)} ly`;
      if (unit === 'lt-min') conv = `${lightTravelMinutes(au).toFixed(1)} 光分`;
      if (unit === 'lt-sec') conv = `${lightTravelSeconds(au).toFixed(0)} 光秒`;

      ctx.fillStyle = 'rgba(156,125,255,.12)'; ctx.strokeStyle = 'rgba(156,125,255,.3)';
      ctx.beginPath(); ctx.roundRect(12, H - 56, W - 24, 44, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`距离 ${au.toFixed(2)} AU → ${conv}`, 22, H - 36);
      ctx.fillText(`单程光时 ${lightTravelMinutes(au).toFixed(2)} 分 · 往返 ${(lightTravelMinutes(au) * 2).toFixed(2)} 分`, 22, H - 20);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [auRef, unitRef, pulseRef]);

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

export default function CosmosScale() {
  const [au, setAu] = useState(1);
  const [unit, setUnit] = useState('km');
  const [pulse, setPulse] = useState(true);
  const auRef = useRef(au);
  const unitRef = useRef(unit);
  const pulseRef = useRef(pulse);
  useEffect(() => { auRef.current = au; });
  useEffect(() => { unitRef.current = unit; });
  useEffect(() => { pulseRef.current = pulse; });

  const km = auToKm(au);
  const ltMin = lightTravelMinutes(au);

  return (
    <section id="cosmos-scale" className="sec">
      <div className="sh">
        <span className="sh-icon">📏</span>
        <div>
          <div className="sh-tag">Cosmos · Chapter 02 · 天文尺度</div>
          <h2 className="sh-title" style={{ color: COSMOS_ACC, textShadow: '0 0 35px rgba(156,125,255,.35)' }}>
            天文尺度与单位
          </h2>
          <p className="sh-sub">
            AU、千米、光分与光年描述不同量级的距离。拖动滑块在对数尺上「旅行」，理解为什么太阳系内用 AU、恒星际用光年——并与通信延迟、深空任务预算衔接。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${COSMOS_ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.25)', flexDirection: 'column', gap: 14 }}>
          <ScaleCanvas auRef={auRef} unitRef={unitRef} pulseRef={pulseRef} />
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: '11px monospace', color: 'var(--dim)', marginBottom: 6 }}>
              <span>0.1 AU</span><span style={{ color: COSMOS_ACC, fontWeight: 700 }}>{au.toFixed(2)} AU</span><span>35 AU</span>
            </div>
            <input type="range" min={0.1} max={35} step={0.1} value={au} onChange={e => setAu(parseFloat(e.target.value))} style={{ width: '100%', accentColor: COSMOS_ACC }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {ORBIT_MARKERS.map(m => (
              <button key={m.label} type="button" className="chip" style={{ borderColor: Math.abs(au - m.au) < 0.2 ? COSMOS_ACC : undefined }} onClick={() => setAu(m.au)}>{m.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button type="button" className="chip" style={{ borderColor: pulse ? COSMOS_ACC : undefined }} onClick={() => setPulse(p => !p)}>
              {pulse ? '⏸ 暂停光脉冲' : '▶ 显示光脉冲'}
            </button>
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(156,125,255,.2)' }}>
            <div className="formula" style={{ color: COSMOS_ACC }}>d = v × t · v ≈ c</div>
            <div className="fdesc">光速有限 → 距离即「通信时间」</div>
          </div>
          <div className="glass" style={{ borderColor: 'rgba(156,125,255,.2)' }}>
            <h4 style={{ color: COSMOS_ACC, marginBottom: 10 }}>单位换算</h4>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {[{ id: 'km', label: '千米' }, { id: 'ly', label: '光年' }, { id: 'lt-min', label: '光分' }, { id: 'lt-sec', label: '光秒' }].map(u => (
                <button key={u.id} type="button" className="chip" style={{ borderColor: unit === u.id ? COSMOS_ACC : undefined, background: unit === u.id ? 'rgba(156,125,255,.12)' : undefined }} onClick={() => setUnit(u.id)}>{u.label}</button>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--white)' }}>{au.toFixed(2)} AU</strong> ≈ {formatSci(km)}<br />
              ≈ {(km / LY_KM).toExponential(2)} 光年<br />
              单程光时 <strong style={{ color: COSMOS_ACC }}>{ltMin.toFixed(2)} 分钟</strong>（地球–太阳约 8.3 光分）
            </p>
          </div>
          <ICard color={COSMOS_ACC} title="📐 1 AU 是什么？">
            1 AU（天文单位）≈ {AU_KM.toExponential(2)} km，定义为地球与太阳的平均距离。太阳系内轨道、任务设计常用 AU。
          </ICard>
          <ICard color="var(--cyan)" title="🌟 为什么需要光年？">
            比邻星约 4.24 ly。若用 AU 表示需约 27 万 AU，数字极不便。恒星际距离用 ly 或秒差距（pc）。
          </ICard>
          <ICard color="#ff6b35" title="📡 火星通信延迟">
            地火距离变化导致单程光时约 3–22 分钟。遥控无法实时，须预编程或等待确认——「慢回路」控制。
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {MARS_DELAY_FACTS.map(m => (
                <span key={m.dist} className="chip" style={{ fontSize: 11 }} title={m.note}>{m.dist} {m.min} 分</span>
              ))}
            </div>
          </ICard>
        </div>
      </div>

      <div className="glass reveal" style={{ maxWidth: 980, margin: '28px auto 0', padding: '18px 22px', borderColor: 'rgba(156,125,255,.2)' }}>
        <h4 style={{ color: COSMOS_ACC, marginBottom: 12 }}>距离参照表</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, fontSize: 12 }}>
          {SCALE_REFERENCES.map(r => (
            <div key={r.label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 8 }}>
              <div style={{ color: 'var(--dim)', marginBottom: 4 }}>{r.label}</div>
              <strong style={{ color: 'var(--white)' }}>{r.ly ? `${r.ly} ly` : r.au != null ? `${r.au} AU` : formatSci(r.km)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="fbox reveal" style={{ maxWidth: 980, margin: '16px auto 0', borderLeft: `3px solid ${COSMOS_ACC}` }}>
        <strong>对数尺说明</strong>：外行星轨道间距差异巨大，线性尺难以同屏展示，故采用 log₁₀ 压缩（教学示意）。3D 场景同样为示意比例。
      </div>

      <Quiz questions={QUIZ_SCALE} title="天文尺度小测验" accentColor={COSMOS_ACC} />
      <RelatedSections sectionId="cosmos-scale" />
    </section>
  );
}
