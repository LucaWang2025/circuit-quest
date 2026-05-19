import { useEffect, useRef, useMemo, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { COSMOS_ACC, POWER_PRESETS, QUIZ_POWER } from '../../data/cosmosData';

const ACC = '#00e676';

function PowerBudgetCanvas({ socRef, chargingRef, powerRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const soc = socRef.current;
      const charging = chargingRef.current;
      const powerW = powerRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = 'rgba(0,230,118,.35)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 26, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(charging ? `充电中 · 光伏 → 电池 · 负载 ${powerW} W` : `放电中 · 电池 → 负载 ${powerW} W`, W / 2, 25);

      const sunX = 70, sunY = 90;
      ctx.fillStyle = '#ffc850'; ctx.shadowColor = '#ffd600'; ctx.shadowBlur = charging ? 16 : 6;
      ctx.beginPath(); ctx.arc(sunX, sunY, 20, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (charging) {
        for (let i = 0; i < 4; i++) {
          const frac = ((t * 0.6 + i * 0.2) % 1);
          ctx.fillStyle = `rgba(255,214,0,${0.8 - frac * 0.5})`;
          ctx.beginPath(); ctx.arc(sunX + 25 + frac * 80, sunY + 5, 3, 0, Math.PI * 2); ctx.fill();
        }
      }

      const pvX = 175, pvY = 100;
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
        ctx.fillStyle = charging ? 'rgba(25,35,80,.95)' : 'rgba(25,35,80,.5)';
        ctx.strokeStyle = charging ? '#4a9eff' : '#334';
        ctx.beginPath(); ctx.roundRect(pvX + c * 22, pvY + r * 20, 20, 18, 2); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('太阳能阵列', pvX + 22, pvY + 52);

      const batX = 280, batY = 130;
      const nBars = 10;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(batX - 40, batY - 70, 80, 140, 10); ctx.fill(); ctx.stroke();
      const filled = Math.round(soc * nBars);
      for (let i = 0; i < nBars; i++) {
        const col = i < filled ? (soc > 0.6 ? '#00e676' : soc > 0.3 ? '#ff9800' : '#f44336') : '#334';
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.roundRect(batX - 30, batY - 60 + i * 12, 60, 9, 2); ctx.fill();
      }
      ctx.fillStyle = ACC; ctx.font = '9px monospace';
      ctx.fillText(`${Math.round(soc * 100)}% SOC`, batX, batY + 82);

      const loadX = 400, loadY = 140;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = charging ? '#445' : ACC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(loadX - 35, loadY - 40, 70, 80, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = charging ? '#889' : ACC;
      ctx.fillText('负载', loadX, loadY);
      ctx.font = '8px monospace'; ctx.fillText(`${powerW}W`, loadX, loadY + 14);

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = charging ? `rgba(255,214,0,${0.4 + 0.2 * Math.sin(t * 4)})` : `rgba(0,230,118,${0.4 + 0.2 * Math.sin(t * 3)})`;
      ctx.lineWidth = 2;
      if (charging) {
        ctx.beginPath(); ctx.moveTo(pvX + 44, pvY + 20); ctx.lineTo(batX - 40, batY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(batX + 40, batY); ctx.lineTo(loadX - 35, loadY); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(batX + 40, batY); ctx.lineTo(loadX - 35, loadY); ctx.stroke();
      }
      ctx.setLineDash([]);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [socRef, chargingRef, powerRef]);

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

export default function CosmosPowerBudget() {
  const navigate = useNav();
  const [powerW, setPowerW] = useState(45);
  const [batteryWh, setBatteryWh] = useState(1200);
  const [sunH, setSunH] = useState(5);
  const [eff, setEff] = useState(85);
  const [mode, setMode] = useState('charge');

  const result = useMemo(() => {
    const dailyGen = powerW * sunH * (eff / 100);
    const netDaily = dailyGen - powerW * 24;
    const daysToFull = dailyGen > 0 ? batteryWh / dailyGen : Infinity;
    const hours = batteryWh / powerW;
    const soc = Math.max(0.05, Math.min(0.95, 0.3 + (dailyGen / batteryWh) * 0.5));
    return {
      dailyGen: dailyGen.toFixed(0),
      netDaily: netDaily.toFixed(0),
      days: daysToFull === Infinity ? '—' : daysToFull.toFixed(1),
      hours: hours.toFixed(1),
      soc,
      surplus: netDaily > 0,
    };
  }, [powerW, batteryWh, sunH, eff]);

  const socRef = useRef(result.soc);
  const chargingRef = useRef(mode === 'charge');
  const powerRef = useRef(powerW);
  useEffect(() => { socRef.current = result.soc; chargingRef.current = mode === 'charge'; powerRef.current = powerW; });

  const applyPreset = (id) => {
    const p = POWER_PRESETS.find(x => x.id === id);
    if (!p) return;
    setPowerW(p.powerW);
    setBatteryWh(p.batteryWh);
    setSunH(p.sunH);
    setEff(p.eff);
  };

  return (
    <section id="cosmos-power-budget" className="sec">
      <div className="sh">
        <span className="sh-icon">🔋</span>
        <div>
          <div className="sh-tag">Cosmos × Circuit · 深空供电预算</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(0,230,118,.35)' }}>深空供电预算</h2>
          <p className="sh-sub">像设计家用储能一样估算探测器续航：平均功耗、电池 Wh、有效日照与系统效率。理解火星车为何需要 RTG、月夜为何要省电休眠。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.2)', flexDirection: 'column', gap: 14 }}>
          <PowerBudgetCanvas socRef={socRef} chargingRef={chargingRef} powerRef={powerRef} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button type="button" onClick={() => setMode('charge')} style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${mode === 'charge' ? ACC : 'rgba(255,255,255,.12)'}`, background: mode === 'charge' ? ACC + '22' : 'transparent', color: mode === 'charge' ? ACC : '#888', cursor: 'pointer' }}>☀️ 日照充电</button>
            <button type="button" onClick={() => setMode('discharge')} style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${mode === 'discharge' ? '#ff6b35' : 'rgba(255,255,255,.12)'}`, background: mode === 'discharge' ? '#ff6b3522' : 'transparent', color: mode === 'discharge' ? '#ff6b35' : '#888', cursor: 'pointer' }}>🌙 仅电池供电</button>
          </div>
          {[
            { label: '平均功耗 (W)', val: powerW, set: setPowerW, min: 5, max: 300, step: 5 },
            { label: '电池容量 (Wh)', val: batteryWh, set: setBatteryWh, min: 200, max: 8000, step: 100 },
            { label: '有效日照 (h/天)', val: sunH, set: setSunH, min: 0, max: 12, step: 0.5 },
            { label: '系统效率 (%)', val: eff, set: setEff, min: 40, max: 95, step: 5 },
          ].map(s => (
            <div key={s.label} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--dim)', marginBottom: 4 }}>
                <span>{s.label}</span><span style={{ color: ACC }}>{s.val}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
            </div>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POWER_PRESETS.map(p => (
              <button key={p.id} type="button" className="chip" onClick={() => applyPreset(p.id)} title={p.note}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.25)' }}>
            <div className="formula" style={{ color: ACC }}>E = P × t · Wh = W × h</div>
            <div className="fdesc">日发电 = P×日照×η · 续航 = Wh÷P</div>
          </div>
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.2)' }}>
            <h4 style={{ color: ACC, marginBottom: 12 }}>预算结果</h4>
            <p style={{ fontSize: 14, color: '#aabfc8', lineHeight: 2 }}>
              日发电约 <strong style={{ color: '#fff' }}>{result.dailyGen} Wh</strong><br />
              日净能量 <strong style={{ color: result.surplus ? ACC : '#ff6b35' }}>{result.netDaily} Wh</strong>（发电−全天负载）<br />
              纯电池续航 <strong>{result.hours} h</strong><br />
              充满电池约 <strong style={{ color: COSMOS_ACC }}>{result.days} 天</strong>（简化）
            </p>
          </div>
          <ICard color={ACC} title="🔋 锂电池与 SOC">
            荷电状态 SOC 影响放电电压与可用容量。低温火星夜晚电池效率下降，需加热或保温电路——这也是「功耗预算」的一部分。
          </ICard>
          <ICard color="#ffc850" title="☢️ RTG 放射性电源">
            钚-238 衰变发热，热电偶发电。无日照时仍工作，旅行者、好奇号、毅力号均使用。代价：质量大、成本高、核安全审批。
          </ICard>
          <ICard color="#ff6b35" title="🌙 月夜与沙尘">
            月球一夜约 14 地球日；火星沙尘可遮挡太阳翼。工程上须规划「休眠模式」关闭非关键负载。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('battery-tech')}>→ 锂电池技术</button>
            <button type="button" className="chip" onClick={() => navigate('energy-storage')}>→ 储能系统</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_POWER} accentColor={ACC} title="深空供电测验" />
      <RelatedSections sectionId="cosmos-power-budget" />
    </section>
  );
}
