import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { PANEL_ACC, QUIZ_BREAKER } from '../../data/panelData';

const ACC = '#ff6b35';

const MODE_INFO = {
  normal: { label: '正常运行', desc: '负载电流在额定范围内，双金属片未过热，触点闭合。', color: '#00e676' },
  overload: { label: '过载跳闸', desc: '持续过流（如多台大功率同时运行）使双金属片弯曲，数秒至数分钟后热脱扣。', color: '#ffab00' },
  short: { label: '短路跳闸', desc: '相间或相零短接产生极大电流，电磁脱扣瞬间动作，伴随电弧。', color: '#ff5252' },
};

function BreakerCanvas({ modeRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf, tripAt = -999;

    function draw() {
      const mode = modeRef.current;
      const tripped = mode !== 'normal';
      if (tripped && t - tripAt > 5) tripAt = t;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(255,107,53,.2)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(
        mode === 'normal' ? '空开 · 额定 16A · 触点闭合' : mode === 'overload' ? '过载 · 热脱扣 · 双金属弯曲' : '短路 · 磁脱扣 · 瞬时断开',
        W / 2, 25,
      );

      const bx = 180, by = 70, bw = 120, bh = 140;
      ctx.fillStyle = '#0d1b2a'; ctx.strokeStyle = tripped ? '#f44336' : ACC;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 10); ctx.fill(); ctx.stroke();

      const heat = mode === 'overload' ? 0.5 + 0.5 * Math.sin(t * 2) : 0;
      if (mode === 'overload') {
        ctx.fillStyle = `rgba(255,171,0,${heat * 0.35})`;
        ctx.beginPath(); ctx.roundRect(bx + 8, by + 50, bw - 16, 50, 6); ctx.fill();
      }

      const handleDown = tripped;
      const hx = bx + bw / 2, hy = handleDown ? by + bh * 0.72 : by + bh * 0.38;
      ctx.fillStyle = tripped ? '#f44336' : ACC;
      ctx.beginPath(); ctx.roundRect(hx - 22, hy, 44, 12, 4); ctx.fill();
      ctx.fillStyle = tripped ? '#f44' : '#e8f5e9';
      ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(tripped ? '已跳闸' : '合闸', hx, hy - 10);

      if (!tripped) {
        ctx.strokeStyle = `rgba(255,215,64,${0.5 + 0.2 * Math.sin(t * 4)})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(bx + 20, by + 20); ctx.lineTo(bx + bw - 20, by + 20); ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const px = bx + 30 + ((t * 0.15 + i * 0.2) % 1) * (bw - 60);
          ctx.fillStyle = '#ffd740';
          ctx.beginPath(); ctx.arc(px, by + 20, 3, 0, Math.PI * 2); ctx.fill();
        }
      }

      if (mode === 'short' && t - tripAt < 0.5) {
        for (let i = 0; i < 8; i++) {
          const ang = Math.random() * Math.PI * 2;
          const r = 20 + Math.random() * 40;
          ctx.strokeStyle = `rgba(255,82,82,${0.8 - (t - tripAt) * 1.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(ang) * r, hy + Math.sin(ang) * r); ctx.stroke();
        }
      }

      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
      ctx.fillText('进线 L', bx - 50, by + 30);
      ctx.fillText('出线 → 负载', bx + bw + 12, by + bh - 20);

      ctx.fillStyle = `rgba(255,107,53,${0.6 + 0.3 * Math.sin(t * 3)})`;
      ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(MODE_INFO[mode].label, W / 2, H - 14);

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

export default function PanelBreakerSim() {
  const [mode, setMode] = useState('normal');
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; });
  const info = MODE_INFO[mode];

  const btn = (id, col, label) => (
    <button type="button" onClick={() => setMode(id)} style={{
      padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${mode === id ? col : 'rgba(255,255,255,.12)'}`,
      background: mode === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: mode === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <div id="panel-breaker-sim" className="sec">
      <div className="sh">
        <span className="sh-icon">⚡</span>
        <div>
          <div className="sh-tag">Panel · 空开跳闸模拟</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}55` }}>空开跳闸模拟</h2>
          <p className="sh-sub">对比正常运行、过载热脱扣与短路磁脱扣——理解为何跳闸后须先查因再合闸。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 14 }}>
          <BreakerCanvas modeRef={modeRef} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {btn('normal', '#00e676', '○ 正常')}
            {btn('overload', '#ffab00', '🔥 过载')}
            {btn('short', '#ff5252', '⚡ 短路')}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${info.color}44` }}>
            <h4 style={{ color: info.color, marginBottom: 8 }}>{info.label}</h4>
            <p style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.75 }}>{info.desc}</p>
          </div>
          <ICard color={ACC} title="📐 选型要点">
            空开额定电流应匹配导线载流量与负载，总开关大于分路，形成选择性保护。
          </ICard>
          <ICard color={PANEL_ACC} title="⚠️ 合闸前">
            短路未排除时切勿反复合闸；过载应减少同时运行的负载。
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_BREAKER} accentColor={ACC} title="空开跳闸测验" />
      <RelatedSections sectionId="panel-breaker-sim" />
    </div>
  );
}
