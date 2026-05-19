import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { PANEL_ACC, QUIZ_SPD } from '../../data/panelData';

const ACC = '#7c4dff';

function SpdCanvas({ stateRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf, strikeT = -999;

    function drawBolt(x1, y1, x2, y2, depth, alpha) {
      if (depth === 0 || alpha < 0.05) return;
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 28;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 12;
      ctx.strokeStyle = `rgba(200,160,255,${alpha})`;
      ctx.lineWidth = depth;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, my); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x2, y2); ctx.stroke();
      drawBolt(x1, y1, mx, my, depth - 0.3, alpha * 0.7);
      drawBolt(mx, my, x2, y2, depth - 0.3, alpha * 0.7);
    }

    function draw() {
      const surge = stateRef.current === 'surge';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;
      if (surge && t - strikeT > 2.5) strikeT = t;

      ctx.fillStyle = surge ? 'rgba(255,82,82,.35)' : 'rgba(124,77,255,.25)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(surge ? '浪涌过电压 · MOV 导通泄流 → 接地' : 'SPD 待机 · MOV 高阻 · 电网正常', W / 2, 27);

      const boxX = 60, boxY = 80, boxW = 160, boxH = 180;
      ctx.fillStyle = '#0d1b2a'; ctx.strokeStyle = PANEL_ACC; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(boxX, boxY, boxW, boxH, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#aab'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('总配电箱', boxX + boxW / 2, boxY + 16);

      const spdX = boxX + boxW / 2, spdY = boxY + 70;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = surge ? '#ff5252' : '#667';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(spdX - 28, spdY - 28, 56, 56, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = surge ? '#ff5252' : '#7c4dff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('SPD', spdX, spdY - 4);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText('MOV', spdX, spdY + 10);

      if (surge) {
        ctx.fillStyle = `rgba(124,77,255,${0.3 + 0.2 * Math.sin(t * 8)})`;
        ctx.beginPath(); ctx.roundRect(spdX - 20, spdY + 18, 40, 8, 3); ctx.fill();
        ctx.fillStyle = '#ff5252'; ctx.font = '7px monospace';
        ctx.fillText('导通', spdX, spdY + 24);
      }

      const gdY = boxY + boxH + 35;
      ctx.strokeStyle = surge ? `rgba(76,175,80,${0.6 + 0.2 * Math.sin(t * 4)})` : '#4caf50';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(boxX + 20, gdY); ctx.lineTo(boxX + boxW - 20, gdY); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(boxX + 35 + i * 30, gdY); ctx.lineTo(boxX + 35 + i * 30, gdY + 12); ctx.stroke();
      }
      ctx.fillStyle = '#4caf50'; ctx.font = '8px monospace';
      ctx.fillText('接地排', boxX + boxW / 2, gdY + 22);

      ctx.strokeStyle = surge ? 'rgba(255,82,82,.6)' : 'rgba(255,230,100,.35)';
      ctx.lineWidth = surge ? 3 : 2;
      ctx.beginPath(); ctx.moveTo(spdX, spdY + 28); ctx.lineTo(spdX, gdY); ctx.stroke();

      if (surge) {
        const age = (t - strikeT) % 2.5;
        if (age < 0.35) {
          drawBolt(200, 40, spdX, spdY - 28, 2, 0.85 - age);
          if (age < 0.08) {
            ctx.fillStyle = 'rgba(220,180,255,0.12)';
            ctx.fillRect(0, 0, W, H);
          }
          for (let i = 0; i < 5; i++) {
            const py = spdY + 35 + ((t * 0.2 + i * 0.15) % 1) * (gdY - spdY - 20);
            ctx.fillStyle = '#ff5252';
            ctx.beginPath(); ctx.arc(spdX + (Math.random() - 0.5) * 8, py, 2.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      ctx.fillStyle = surge ? 'rgba(100,60,150,.4)' : 'rgba(80,90,120,.3)';
      ctx.beginPath(); ctx.ellipse(360, 55, 45, 18, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = `rgba(124,77,255,${0.6 + 0.3 * Math.sin(t * 3)})`;
      ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(surge ? '雷电/操作过电压 → SPD 泄放 → 保护后端设备' : '平静电网 · SPD 高阻待机', W / 2, H - 12);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stateRef]);

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

export default function PanelSpdSim() {
  const [state, setState] = useState('calm');
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  const btn = (id, col, label) => (
    <button type="button" onClick={() => setState(id)} style={{
      padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${state === id ? col : 'rgba(255,255,255,.12)'}`,
      background: state === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: state === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <div id="panel-spd-sim" className="sec">
      <div className="sh">
        <span className="sh-icon">🌩️</span>
        <div>
          <div className="sh-tag">Panel · 浪涌保护</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}55` }}>SPD 浪涌保护</h2>
          <p className="sh-sub">对比平静电网与雷击浪涌：MOV 过压导通、将能量泄入接地，保护后端芯片与家电。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 14 }}>
          <SpdCanvas stateRef={stateRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {btn('calm', '#00e676', '○ 平静')}
            {btn('surge', '#ff5252', '⚡ 浪涌')}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: `${ACC}33` }}>
            <div className="formula" style={{ color: ACC }}>U &gt; Uc → MOV 低阻</div>
            <div className="fdesc">压敏电阻 · 分级安装 · 接地泄流</div>
          </div>
          <ICard color={ACC} title="🌩️ 感应雷">
            附近雷击可在入户线感应 kV 级过电压，弱电设备也需 SPD 保护。
          </ICard>
          <ICard color={PANEL_ACC} title="🔧 维护">
            失效窗口变红或报警时应更换模块；接地不良则无法泄流。
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_SPD} accentColor={ACC} title="浪涌保护测验" />
      <RelatedSections sectionId="panel-spd-sim" />
    </div>
  );
}
