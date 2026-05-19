import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { PANEL_ACC, QUIZ_RCD } from '../../data/panelData';

const ACC = '#00e676';
const TRIP_MA = 30;

function RcdCanvas({ leakRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const leak = leakRef.current;
      const tripped = leak >= TRIP_MA;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = tripped ? 'rgba(255,82,82,.35)' : 'rgba(0,230,118,.2)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(
        tripped ? `漏电 ${leak.toFixed(0)} mA ≥ ${TRIP_MA} mA · RCD 跳闸` : `剩余电流 ${leak.toFixed(1)} mA · ${leak < 1 ? '平衡' : '侦测中'}`,
        W / 2, 25,
      );

      const cx = W / 2, cy = 130;
      ctx.strokeStyle = tripped ? '#f44336' : ACC;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(cx - 70, cy - 50, 140, 100, 10); ctx.fillStyle = '#0d1b2a'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = tripped ? '#f44' : ACC;
      ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillText(tripped ? 'RCD 断开' : 'RCD 闭合', cx, cy + 5);

      const inY = cy - 70, outY = cy + 70;
      ctx.strokeStyle = '#ffd740'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - 120, inY); ctx.lineTo(cx - 40, inY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 40, outY); ctx.lineTo(cx + 120, outY); ctx.stroke();
      ctx.fillStyle = '#ffd740'; ctx.font = '9px monospace';
      ctx.fillText(`I_进 ${(10 + leak * 0.02).toFixed(1)} A`, cx - 130, inY - 8);
      ctx.fillText(`I_出 ${(10 - leak * 0.02).toFixed(2)} A`, cx + 125, outY + 4);

      if (leak > 0.5) {
        const leakX = cx + 90, leakY = cy + 20;
        ctx.strokeStyle = `rgba(255,82,82,${0.4 + 0.3 * Math.sin(t * 5)})`;
        ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(cx + 40, cy + 10); ctx.lineTo(leakX, leakY + 40); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ff5252'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('漏电→地', leakX, leakY + 55);
        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.arc(leakX, leakY + 30 + i * 8, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,82,82,${0.6 - i * 0.15})`; ctx.fill();
        }
      }

      const diff = leak;
      const barW = Math.min(200, diff / TRIP_MA * 200);
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(cx - 100, H - 50, 200, 12);
      ctx.fillStyle = diff >= TRIP_MA ? '#ff5252' : ACC;
      ctx.fillRect(cx - 100, H - 50, barW, 12);
      ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 100 + (TRIP_MA / TRIP_MA) * 200, H - 54); ctx.lineTo(cx - 100 + 200, H - 38); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${TRIP_MA} mA 阈值`, cx + 100, H - 54);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [leakRef]);

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

export default function PanelRcdSim() {
  const [leakMa, setLeakMa] = useState(0);
  const leakRef = useRef(leakMa);
  useEffect(() => { leakRef.current = leakMa; });
  const tripped = leakMa >= TRIP_MA;

  return (
    <div id="panel-rcd-sim" className="sec">
      <div className="sh">
        <span className="sh-icon">🛡️</span>
        <div>
          <div className="sh-tag">Panel · 漏电保护</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}55` }}>漏电保护模拟</h2>
          <p className="sh-sub">拖动漏电电流，观察火零电流差与 30 mA 动作阈值——理解人体触电保护原理。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: `${ACC}44`, flexDirection: 'column', gap: 14 }}>
          <RcdCanvas leakRef={leakRef} />
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            漏电电流：{leakMa.toFixed(1)} mA
            <input type="range" min={0} max={50} step={0.5} value={leakMa}
              onChange={e => setLeakMa(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: tripped ? '#ff5252' : ACC, marginTop: 8 }} />
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[0, 10, 30, 45].map(v => (
              <button key={v} type="button" className="chip" style={{ borderColor: leakMa === v ? ACC : undefined }} onClick={() => setLeakMa(v)}>{v} mA</button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: tripped ? 'rgba(255,82,82,.4)' : `${ACC}44` }}>
            <div className="formula" style={{ color: tripped ? '#ff5252' : ACC }}>I_Δ = I_进 − I_出</div>
            <div className="fdesc">{tripped ? '已跳闸 · 按 Test 定期自检' : '正常时进出电流相等'}</div>
          </div>
          <ICard color={ACC} title="🛡️ 30 mA 含义">
            剩余电流超过约 30 mA 时动作，降低心室颤动风险；潮湿环境人体电阻更低，更需保护。
          </ICard>
          <ICard color={PANEL_ACC} title="🔌 安装建议">
            插座、浴室、厨房等回路宜装漏电保护；定期按 Test 按钮验证。
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_RCD} accentColor={ACC} title="漏电保护测验" />
      <RelatedSections sectionId="panel-rcd-sim" />
    </div>
  );
}
