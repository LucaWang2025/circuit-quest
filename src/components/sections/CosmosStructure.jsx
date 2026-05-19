import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { COSMOS_ACC, STRUCTURE_LAYERS, QUIZ_STRUCTURE } from '../../data/cosmosData';

function StructureCanvas({ layerRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 340;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    const icons = {
      sun: (x, y) => { ctx.fillStyle = '#ffc850'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill(); },
      inner: (x, y) => { ctx.fillStyle = '#4a9eff'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x - 18 + i * 12, y, 3, 0, Math.PI * 2); ctx.fill(); } },
      belt: (x, y) => { ctx.fillStyle = '#887766'; for (let i = 0; i < 8; i++) { ctx.fillRect(x - 20 + i * 5, y - 2, 2, 2); } },
      giant: (x, y) => { ctx.fillStyle = '#d4a574'; ctx.beginPath(); ctx.arc(x - 12, y, 8, 0, Math.PI * 2); ctx.arc(x + 14, y, 6, 0, Math.PI * 2); ctx.fill(); },
      kuiper: (x, y) => { ctx.fillStyle = '#6eb5ff'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#889'; ctx.font = '7px monospace'; ctx.fillText('冥', x - 4, y + 3); },
      oort: (x, y) => { ctx.strokeStyle = '#9c7dff'; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 10); ctx.stroke(); } },
    };

    function draw() {
      const layerIdx = layerRef.current;
      const layer = STRUCTURE_LAYERS[layerIdx];
      ctx.clearRect(0, 0, W, H);
      t += 0.02;
      const bandH = (H - 60) / STRUCTURE_LAYERS.length;

      STRUCTURE_LAYERS.forEach((L, i) => {
        const y = 40 + i * bandH;
        const active = i === layerIdx;
        ctx.fillStyle = active ? `${L.color}33` : 'rgba(255,255,255,.03)';
        ctx.strokeStyle = active ? L.color : 'rgba(255,255,255,.08)';
        ctx.lineWidth = active ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(24, y, W - 48, bandH - 6, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = active ? L.color : '#6b8cad';
        ctx.font = `bold ${active ? 12 : 10}px monospace`; ctx.textAlign = 'left';
        ctx.fillText(L.label, 36, y + bandH / 2 - 2);
        ctx.fillStyle = '#889'; ctx.font = '9px monospace';
        ctx.fillText(L.range, 36, y + bandH / 2 + 12);
        if (icons[L.id]) icons[L.id](W - 80, y + bandH / 2);
      });

      const probeY = 40 + layerIdx * bandH + bandH / 2;
      const probeX = W - 55 + Math.sin(t * 3) * 4;
      ctx.fillStyle = COSMOS_ACC; ctx.shadowColor = COSMOS_ACC; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(probeX - 10, probeY); ctx.lineTo(probeX, probeY - 7); ctx.lineTo(probeX + 10, probeY); ctx.lineTo(probeX, probeY + 7); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;

      for (let i = 0; i < 5; i++) {
        const frac = ((t * 0.4 + i * 0.18) % 1);
        ctx.fillStyle = `rgba(156,125,255,${0.35 - frac * 0.3})`;
        ctx.beginPath(); ctx.arc(16, 40 + frac * (H - 60), 2, 0, Math.PI * 2); ctx.fill();
      }

      ctx.fillStyle = 'rgba(156,125,255,.25)'; ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`太阳系结构剖面 · ${layer.label}`, W / 2, 24);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [layerRef]);

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

export default function CosmosStructure() {
  const [layerIdx, setLayerIdx] = useState(0);
  const layerRef = useRef(layerIdx);
  useEffect(() => { layerRef.current = layerIdx; });
  const layer = STRUCTURE_LAYERS[layerIdx];

  return (
    <section id="cosmos-structure" className="sec">
      <div className="sh">
        <span className="sh-icon">💫</span>
        <div>
          <div className="sh-tag">Cosmos · Chapter 04 · 太阳系结构</div>
          <h2 className="sh-title" style={{ color: COSMOS_ACC, textShadow: '0 0 35px rgba(156,125,255,.35)' }}>太阳系结构</h2>
          <p className="sh-sub">从太阳到奥尔特云：类地行星、小行星带、巨行星、柯伊伯带与彗星储库。理解「中心供能 + 分层环境」如何影响航天任务与空间天气。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${COSMOS_ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.25)', flexDirection: 'column', gap: 14 }}>
          <StructureCanvas layerRef={layerRef} />
          <input type="range" min={0} max={STRUCTURE_LAYERS.length - 1} step={1} value={layerIdx} onChange={e => setLayerIdx(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: COSMOS_ACC }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {STRUCTURE_LAYERS.map((L, i) => (
              <button key={L.id} type="button" className="chip" style={{ borderColor: layerIdx === i ? L.color : undefined }} onClick={() => setLayerIdx(i)}>{L.label}</button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${layer.color}55` }}>
            <h3 style={{ color: layer.color, marginBottom: 6 }}>{layer.label}</h3>
            <div style={{ font: '11px monospace', color: 'var(--dim)', marginBottom: 10 }}>范围：{layer.range}</div>
            <p style={{ fontSize: 14, color: '#aabfc8', lineHeight: 1.75, marginBottom: 12 }}>{layer.desc}</p>
            <ul style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.8, paddingLeft: 18 }}>
              {layer.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
          </div>
          <ICard color={COSMOS_ACC} title="🔌 系统类比">
            太阳 = <strong style={{ color: 'var(--white)' }}>中心电源</strong>（核聚变）；内行星 = 近端负载区；巨行星 = 强引力/辐射环境；外层 = 彗星「储能库」与原始物质档案。
          </ICard>
          <ICard color="var(--cyan)" title="🛰️ 人类探测器足迹">
            旅行者 1/2 已越过日球层进入星际空间；新视野号飞掠冥王星；帕克太阳探测器近距离观测日冕。
          </ICard>
          <ICard color="#ff6b35" title="⚠️ 工程注意">
            小行星带密度远低于科幻电影——探测器可安全穿越；真正威胁来自未预报的高速流星体与木星辐射带。
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_STRUCTURE} accentColor={COSMOS_ACC} title="太阳系结构测验" />
      <RelatedSections sectionId="cosmos-structure" />
    </section>
  );
}
