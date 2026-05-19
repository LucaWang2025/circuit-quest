import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import { useNav } from '../../NavContext';
import RelatedSections from '../RelatedSections';
import {
  PANEL_ACC, HUB_LINKS, PANEL_LEARNING_PATH, QUIZ_HUB,
} from '../../data/panelData';

function HubCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 200;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;
      const px = 70, py = 30, pw = 120, ph = 150;

      ctx.fillStyle = 'rgba(38,166,154,.15)';
      ctx.beginPath(); ctx.roundRect(10, 10, W - 20, 24, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('家用配电箱 · 总开 → 漏电 → 分路 → 零地排', W / 2, 26);

      ctx.fillStyle = '#0d1b2a'; ctx.strokeStyle = PANEL_ACC; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 8); ctx.fill(); ctx.stroke();

      const rows = [
        { y: 42, c: '#ff6b35', label: '总开' },
        { y: 72, c: '#00e676', label: 'RCD' },
        { y: 102, c: '#ffab00', label: '分路' },
        { y: 132, c: '#00bcd4', label: '零排' },
        { y: 158, c: '#4caf50', label: '地排' },
      ];
      rows.forEach((r, i) => {
        const glow = 0.4 + 0.3 * Math.sin(t * 2 + i);
        ctx.fillStyle = r.c + '44';
        ctx.beginPath(); ctx.roundRect(px + 12, py + r.y, pw - 24, 22, 4); ctx.fill();
        ctx.strokeStyle = r.c; ctx.globalAlpha = glow;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = r.c; ctx.font = '9px monospace'; ctx.textAlign = 'left';
        ctx.fillText(r.label, px + 18, py + r.y + 14);
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

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

export default function PanelHub() {
  const navigate = useNav();

  return (
    <div id="panel-hub" className="sec">
      <div className="sh">
        <span className="sh-icon">🗂️</span>
        <div>
          <div className="sh-tag">Panel · 配电箱全景 · 入口</div>
          <h2 className="sh-title" style={{ color: PANEL_ACC, textShadow: `0 0 35px ${PANEL_ACC}55` }}>配电箱全景</h2>
          <p className="sh-sub">
            从箱内结构剖面到空开跳闸、漏电保护与浪涌泄放——把家用配电箱拆成可交互的工程师视角。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${PANEL_ACC},transparent)` }} />

      <div className="grid2" style={{ marginBottom: 28 }}>
        <div className="anim-box reveal" style={{ borderColor: `${PANEL_ACC}44`, flexDirection: 'column' }}>
          <HubCanvas />
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center', lineHeight: 1.6 }}>
            进户 → 总开 → 漏电保护 → 分路空开 → 零线排 / 地线排 → 出线至各回路。
          </p>
        </div>
        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${PANEL_ACC}33` }}>
            <div className="formula" style={{ color: PANEL_ACC }}>I_进 ≈ Σ I_分路</div>
            <div className="fdesc">过载 · 短路 · 漏电 · 浪涌 四类保护</div>
          </div>
          <ICard color={PANEL_ACC} title="📚 专题结构">
            4 个互动模拟 + 测验：箱内剖面、空开跳闸、漏电保护、SPD 浪涌。
          </ICard>
          <ICard color="var(--cyan)" title="🔌 与现有章节">
            衔接家用电路、配电箱详解、跳闸排查、防雷接地与安全用电。
          </ICard>
        </div>
      </div>

      <div className="glass reveal" style={{ maxWidth: 1100, margin: '0 auto 24px', padding: 18, borderColor: `${PANEL_ACC}44` }}>
        <h4 style={{ color: PANEL_ACC, font: '11px monospace', letterSpacing: 2, marginBottom: 12 }}>推荐路径</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {PANEL_LEARNING_PATH.map((s, i) => (
            <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" className="chip" onClick={() => navigate(s.id)}>{s.icon} {s.label}</button>
              {i < PANEL_LEARNING_PATH.length - 1 && <span style={{ color: 'var(--dim)' }}>→</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18, maxWidth: 1100, margin: '0 auto 28px' }}>
        {HUB_LINKS.map(link => (
          <div key={link.id} className="glass reveal icard" role="button" tabIndex={0}
            onClick={() => navigate(link.id)} onKeyDown={e => { if (e.key === 'Enter') navigate(link.id); }}
            style={{ cursor: 'pointer', borderColor: `${link.color}44` }}>
            <span style={{ fontSize: 28 }}>{link.icon}</span>
            <div style={{ fontWeight: 700, margin: '8px 0 2px' }}>{link.title}</div>
            <div style={{ font: '10px monospace', color: link.color, letterSpacing: 2, marginBottom: 8 }}>{link.en}</div>
            <p style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.6 }}>{link.desc}</p>
            <div style={{ marginTop: 10, font: '11px monospace', color: 'var(--cyan)' }}>进入章节 →</div>
          </div>
        ))}
      </div>

      <Quiz questions={QUIZ_HUB} accentColor={PANEL_ACC} title="配电箱常识测验" />
      <RelatedSections sectionId="panel-hub" />
    </div>
  );
}
