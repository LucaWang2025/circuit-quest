import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ff9800';

function InductionCanvas({ stateRef, powerRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const on = stateRef.current;
      const pct = powerRef.current / 100;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = on ? 'rgba(255,152,0,.48)' : 'rgba(60,70,90,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(on ? `IH 加热中 · ${Math.round(pct * 2200)}W · IGBT 高频开关` : '待机 · 锅具检测 · 等待放置', W / 2, 27);

      const cx = W / 2, cy = 170;

      // ── 底部线圈 ──
      for (let i = 0; i < 8; i++) {
        const r = 40 + i * 8;
        const alpha = on ? (0.35 + 0.25 * Math.sin(t * 12 + i * 0.4)) * pct : 0.08;
        ctx.strokeStyle = `rgba(255,152,0,${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy + 50, r, Math.PI, 0, false); ctx.stroke();
      }
      // 线圈主体标记
      ctx.fillStyle = '#2a3040'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(cx, cy + 50, 80, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('感应线圈（铜）', cx, cy + 54);

      // ── 磁力线 ──
      if (on) {
        for (let i = -3; i <= 3; i++) {
          const fx = cx + i * 22;
          const alpha = Math.max(0, 0.5 - Math.abs(i) * 0.08) * pct;
          ctx.strokeStyle = `rgba(0,188,212,${alpha})`;
          ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]);
          const h = 45 + 10 * Math.abs(Math.sin(t * 3 + i));
          ctx.beginPath(); ctx.moveTo(fx, cy + 38); ctx.lineTo(fx, cy + 38 - h); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(0,188,212,.5)'; ctx.font = '9px monospace';
        ctx.fillText('↑ 交变磁场', cx, cy - 10);
      }

      // ── 锅底（涡流） ──
      const potY = cy + 22;
      ctx.fillStyle = '#2e2e3e'; ctx.strokeStyle = on ? '#ffab00' : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, potY, 88, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 涡流示意
      if (on) {
        for (let j = 0; j < 5; j++) {
          const rx = cx - 70 + j * 34, ry = potY;
          const a = t * 4 + j;
          ctx.strokeStyle = `rgba(255,82,82,${0.3 + 0.2 * Math.sin(a)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(rx, ry, 10, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = `rgba(255,82,82,${0.15 + 0.1 * Math.sin(a + 1)})`;
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,82,82,.7)'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('涡流 → 锅底发热', cx, potY + 1);
      }

      // ── 锅体轮廓 ──
      ctx.fillStyle = '#3a3a4a'; ctx.strokeStyle = '#667'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 88, potY);
      ctx.bezierCurveTo(cx - 95, potY - 40, cx - 85, potY - 90, cx - 60, potY - 100);
      ctx.bezierCurveTo(cx - 30, potY - 115, cx + 30, potY - 115, cx + 60, potY - 100);
      ctx.bezierCurveTo(cx + 85, potY - 90, cx + 95, potY - 40, cx + 88, potY);
      ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(on ? '锅体升温中' : '铁磁锅具', cx, potY - 60);

      // ── IGBT 电路（右侧小图）──
      const bx = 380, by = 90;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(bx - 40, by - 30, 80, 60, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on ? '#00e676' : '#446'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('IGBT', bx, by - 8);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText(on ? `${Math.round(pct * 20 + 20)}kHz` : '20~40kHz', bx, by + 6);
      ctx.fillText('高频开关', bx, by + 18);

      // 底部
      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = on ? `rgba(255,152,0,${0.7 + 0.3 * Math.sin(t * 3)})` : 'rgba(100,120,145,.6)';
      ctx.fillText(
        on ? `交变磁场 → 锅底涡流 → 电阻热效应  ∴ 只有锅本身发热，面板不烫` : '○ 锅具检测：线圈发出低功率信号检测谐振频率变化',
        W / 2, H - 10
      );

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function Induction() {
  const [on, setOn] = useState(false);
  const [power, setPower] = useState(70);
  const stateRef = useRef(on);
  const powerRef = useRef(power);
  stateRef.current = on;
  powerRef.current = power;

  const btn = (active, col) => ({
    padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${active ? col : 'rgba(255,255,255,.12)'}`,
    background: active ? col + '22' : 'rgba(255,255,255,.04)',
    color: active ? col : 'rgba(255,255,255,.5)', font: '13px/1 inherit',
  });

  return (
    <section id="induction" className="sec">
      <div className="sh">
        <span className="sh-icon">🍳</span>
        <div>
          <div className="sh-tag">INDUCTION · IH 电磁感应 · IGBT 高频</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>电磁炉</h2>
          <p className="sh-sub">IGBT 高频开关 + 感应线圈 → 交变磁场 → 涡流生热——只有锅发热</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,152,0,.2)', flexDirection: 'column', gap: 14 }}>
          <InductionCanvas stateRef={stateRef} powerRef={powerRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={btn(on, ACC)} onClick={() => setOn(true)}>🔥 开火</button>
            <button style={btn(!on, '#607d8b')} onClick={() => setOn(false)}>⏹ 关闭</button>
          </div>
          {on && (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>功率档位 {power}%（≈{Math.round(power * 22)}W）</div>
              <input type="range" min={10} max={100} value={power} onChange={e => setPower(+e.target.value)}
                style={{ width: '100%', accentColor: ACC }} />
            </div>
          )}
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,152,0,.18)' }}>
            <div className="formula" style={{ color: ACC }}>220V → IGBT → 20kHz → 涡流热</div>
            <div className="fdesc">电磁感应加热链路，面板表面温度&lt;50°C</div>
          </div>
          <ICard color={ACC} title="⚙️ IGBT 高频开关">
            绝缘栅双极型晶体管（IGBT）以 <strong style={{ color: ACC }}>20~40kHz</strong> 频率开关，
            通过谐振电路驱动感应线圈产生高频交变电流，进而形成交变磁场。
          </ICard>
          <ICard color={ACC} title="🔁 涡流发热原理">
            交变磁场在铁磁性锅底感应出<strong>涡流</strong>，涡流在锅具电阻中转化为热量。
            铜/铝锅（低电阻）效率低；铁/不锈钢磁性底效率高。
          </ICard>
          <ICard color={ACC} title="🔍 锅具检测">
            线圈先发送低功率探测信号，监测谐振回路频率变化：有铁磁锅→频率偏移大→允许加热；无锅→频率不变→提示无锅。
          </ICard>
          <ICard color="#ff5252" title="⚠️ 维修注意">
            IGBT 工作时电压可达 600V 以上；功率模块散热铝板与板载隔离——拆机前电容放电。
          </ICard>
        </div>
      </div>
    </section>
  );
}
