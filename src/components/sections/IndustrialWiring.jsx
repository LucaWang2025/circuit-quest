import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { IND_ACC, QUIZ_WIRING } from '../../data/industrialData';

const ACC = IND_ACC;

function WiringCanvas({ modeRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function drawWinding(cx, cy, label, angle, lit) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = lit ? ACC : 'rgba(255,152,0,.35)';
      ctx.lineWidth = lit ? 3 : 1.5;
      ctx.shadowColor = lit ? ACC : 'transparent';
      ctx.shadowBlur = lit ? 8 : 0;
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(-18 + i * 14, (i % 2 ? -12 : 12));
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = lit ? '#fff' : '#8ab4d4';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, -20);
      ctx.restore();
    }

    function draw() {
      const isY = modeRef.current === 'y';
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(255,152,0,.35)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(isY ? '星形 Y 接 · 可接中性线 N' : '三角形 Δ 接 · 无中性线', W / 2, 25);

      const cx = W / 2, cy = 165;
      const nodes = [
        { x: cx, y: cy - 75, label: 'L1', color: '#ff9800' },
        { x: cx - 72, y: cy + 42, label: 'L2', color: '#ffc107' },
        { x: cx + 72, y: cy + 42, label: 'L3', color: '#ff6b35' },
      ];

      if (isY) {
        const nx = cx, ny = cy + 95;
        ctx.strokeStyle = 'rgba(100,200,255,.5)'; ctx.lineWidth = 2;
        nodes.forEach(n => {
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nx, ny); ctx.stroke();
        });
        ctx.fillStyle = '#64c8ff';
        ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('N (中性线)', nx, ny + 22);
        drawWinding(cx, cy, 'M', 0, true);
      } else {
        ctx.strokeStyle = 'rgba(255,152,0,.6)'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        ctx.lineTo(nodes[1].x, nodes[1].y);
        ctx.lineTo(nodes[2].x, nodes[2].y);
        ctx.closePath();
        ctx.stroke();
        const pairs = [[0, 1], [1, 2], [2, 0]];
        pairs.forEach(([a, b], i) => {
          const mx = (nodes[a].x + nodes[b].x) / 2;
          const my = (nodes[a].y + nodes[b].y) / 2;
          drawWinding(mx, my, `W${i + 1}`, Math.atan2(nodes[b].y - nodes[a].y, nodes[b].x - nodes[a].x), true);
        });
      }

      nodes.forEach((n, i) => {
        const pulse = 6 + Math.sin(t * 3 + i * 2) * 2;
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(n.x, n.y, pulse, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y - 16);
      });

      ctx.fillStyle = 'rgba(255,152,0,.12)'; ctx.strokeStyle = 'rgba(255,152,0,.3)';
      ctx.beginPath(); ctx.roundRect(12, H - 52, W - 24, 40, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(
        isY ? 'Y：相电压=绕组电压 · 可提供 220V(相-零) 与 380V(线间)' : 'Δ：绕组电压=线电压 · 常用于额定 380V 运行',
        22, H - 28,
      );

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

export default function IndustrialWiring() {
  const [mode, setMode] = useState('y');
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; });

  const chip = active => ({
    borderColor: active ? ACC : undefined,
    background: active ? 'rgba(255,152,0,.12)' : undefined,
  });

  return (
    <section id="industrial-wiring" className="sec">
      <div className="sh">
        <span className="sh-icon">△</span>
        <div>
          <div className="sh-tag">Industrial · Chapter 02 · 星形与三角</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}55` }}>星形 Y 与三角形 Δ</h2>
          <p className="sh-sub">
            电机绕组与配电变压器常用 Y 或 Δ 接法。切换接法改变每相电压与电流分配，星三角启动正是利用这一原理降压。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 14 }}>
          <WiringCanvas modeRef={modeRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="chip" style={chip(mode === 'y')} onClick={() => setMode('y')}>⭐ 星形 Y</button>
            <button type="button" className="chip" style={chip(mode === 'delta')} onClick={() => setMode('delta')}>△ 三角 Δ</button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center' }}>示意电机三相绕组与外部端子连接方式。</p>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${ACC}33` }}>
            <div className="formula" style={{ color: ACC }}>Y: U_L=√3·U_P · Δ: U_绕组=U_L</div>
            <div className="fdesc">接法决定绕组两端电压</div>
          </div>
          <ICard color={ACC} title="⭐ 星形 Y 接">
            三相四线：线间 380 V，相与零线 220 V。对称负载时中性线电流接近零；工业照明与动力可同源。
          </ICard>
          <ICard color="#ffc107" title="△ 三角接">
            无中性线，仅接三相平衡负载。每相绕组承受线电压，适用于额定 380 V 三角形运行的电机。
          </ICard>
          <ICard color="var(--cyan)" title="🔄 星三角启动">
            启动时 Y 接降低绕组电压（约为 Δ 的 1/√3），转速上升后切换 Δ 接满压运行，减小启动电流冲击。
          </ICard>
          <ICard color="#ff6b35" title="⚠️ 接错相序">
            相序接反会使电机反转，可能损坏泵阀机械——通电前可用相序表确认。
          </ICard>
        </div>
      </div>

      <div className="fbox reveal" style={{ maxWidth: 980, margin: '20px auto 0', borderLeft: `3px solid ${ACC}` }}>
        <strong>注意</strong>：Δ 接不可随意引出「单相 220 V」；需要 220 V 时应使用 Y 接或独立变压器。接线端子铭牌标明 Y/Δ 与电压。
      </div>

      <Quiz questions={QUIZ_WIRING} title="星三角接法小测验" accentColor={ACC} />
      <RelatedSections sectionId="industrial-wiring" />
    </section>
  );
}
