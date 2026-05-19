import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { PANEL_ACC, PANEL_LAYERS, QUIZ_ANATOMY } from '../../data/panelData';

function AnatomyCanvas({ layerRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 340;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    const icons = {
      main: (x, y) => { ctx.fillStyle = '#ff6b35'; ctx.fillRect(x - 14, y - 6, 28, 12); ctx.fillStyle = '#fff'; ctx.font = '7px monospace'; ctx.textAlign = 'center'; ctx.fillText('2P', x, y + 3); },
      rcd: (x, y) => { ctx.fillStyle = '#00e676'; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.font = '7px monospace'; ctx.fillText('Δ', x, y + 2); },
      branch: (x, y) => { ctx.fillStyle = '#ffab00'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 16 + i * 11, y - 5, 8, 10); },
      neutral: (x, y) => { ctx.fillStyle = '#00bcd4'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x - 16 + i * 8, y, 2.5, 0, Math.PI * 2); ctx.fill(); } },
      ground: (x, y) => { ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 12, y + 4); ctx.lineTo(x + 12, y + 4); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 4); ctx.stroke(); },
      spd: (x, y) => { ctx.fillStyle = '#7c4dff'; ctx.fillRect(x - 10, y - 8, 20, 16); ctx.fillStyle = '#fff'; ctx.font = '7px monospace'; ctx.fillText('SPD', x, y + 3); },
    };

    function draw() {
      const layerIdx = layerRef.current;
      const layer = PANEL_LAYERS[layerIdx];
      ctx.clearRect(0, 0, W, H);
      t += 0.02;
      const bandH = (H - 60) / PANEL_LAYERS.length;

      PANEL_LAYERS.forEach((L, i) => {
        const y = 40 + i * bandH;
        const active = i === layerIdx;
        ctx.fillStyle = active ? `${L.color}33` : 'rgba(255,255,255,.03)';
        ctx.strokeStyle = active ? L.color : 'rgba(255,255,255,.08)';
        ctx.lineWidth = active ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(24, y, W - 48, bandH - 6, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = active ? L.color : '#6b8cad';
        ctx.font = `bold ${active ? 12 : 10}px monospace`; ctx.textAlign = 'left';
        ctx.fillText(L.label, 36, y + bandH / 2 + 4);
        if (icons[L.id]) icons[L.id](W - 80, y + bandH / 2);
      });

      const probeY = 40 + layerIdx * bandH + bandH / 2;
      const probeX = W - 55 + Math.sin(t * 3) * 4;
      ctx.fillStyle = PANEL_ACC; ctx.shadowColor = PANEL_ACC; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(probeX - 10, probeY); ctx.lineTo(probeX, probeY - 7); ctx.lineTo(probeX + 10, probeY); ctx.lineTo(probeX, probeY + 7); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(38,166,154,.25)'; ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`配电箱剖面 · ${layer.label}`, W / 2, 24);

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

export default function PanelAnatomy() {
  const [layerIdx, setLayerIdx] = useState(0);
  const layerRef = useRef(layerIdx);
  useEffect(() => { layerRef.current = layerIdx; });
  const layer = PANEL_LAYERS[layerIdx];

  return (
    <div id="panel-anatomy" className="sec">
      <div className="sh">
        <span className="sh-icon">🗂️</span>
        <div>
          <div className="sh-tag">Panel · 箱内结构</div>
          <h2 className="sh-title" style={{ color: PANEL_ACC, textShadow: `0 0 35px ${PANEL_ACC}55` }}>配电箱内结构</h2>
          <p className="sh-sub">总断路器、漏电保护、分路空开、零线排、地线排与 SPD——滑动剖面理解各层职责。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${PANEL_ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${PANEL_ACC}44`, flexDirection: 'column', gap: 14 }}>
          <AnatomyCanvas layerRef={layerRef} />
          <input type="range" min={0} max={PANEL_LAYERS.length - 1} step={1} value={layerIdx}
            onChange={e => setLayerIdx(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: PANEL_ACC }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {PANEL_LAYERS.map((L, i) => (
              <button key={L.id} type="button" className="chip" style={{ borderColor: layerIdx === i ? L.color : undefined }} onClick={() => setLayerIdx(i)}>{L.label}</button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${layer.color}55` }}>
            <h3 style={{ color: layer.color, marginBottom: 8 }}>{layer.label}</h3>
            <p style={{ fontSize: 14, color: '#aabfc8', lineHeight: 1.75 }}>{layer.desc}</p>
          </div>
          <ICard color={PANEL_ACC} title="🔌 电流路径">
            进线 → 总开 →（漏电）→ 分路 → 负载；零线回零排，保护地接地排，<strong style={{ color: 'var(--white)' }}>零地不可混接</strong>。
          </ICard>
          <ICard color="#7c4dff" title="🌩️ SPD 位置">
            通常装在总箱进线侧，与防雷接地配合，将浪涌导入大地。
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_ANATOMY} accentColor={PANEL_ACC} title="箱内结构测验" />
      <RelatedSections sectionId="panel-anatomy" />
    </div>
  );
}
