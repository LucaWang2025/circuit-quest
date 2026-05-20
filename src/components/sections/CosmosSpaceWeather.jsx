import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { COSMOS_ACC, SPACE_WEATHER_MODES, QUIZ_SPACE_WEATHER } from '../../data/cosmosData';

const ACC = '#ff6b35';

function SpaceWeatherCanvas({ modeRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const storm = modeRef.current === 'storm';
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = storm ? 'rgba(255,100,80,.4)' : 'rgba(60,30,100,.4)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(storm ? '日冕物质抛射 · Kp≈8 · 地磁暴' : '平静太阳风 · Kp≈2 · 电网正常', W / 2, 27);

      const sunX = 65, sunY = 120;
      ctx.fillStyle = '#ffc850';
      ctx.shadowColor = storm ? '#ff6b35' : '#ffc850';
      ctx.shadowBlur = storm ? 28 : 14;
      ctx.beginPath(); ctx.arc(sunX, sunY, 26, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      if (storm) {
        for (let i = 0; i < 6; i++) {
          const ang = t * 1.5 + i * 1.05;
          ctx.strokeStyle = `rgba(255,120,80,${0.35 + 0.15 * Math.sin(t * 3 + i)})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(sunX + 20, sunY);
          ctx.quadraticCurveTo(140 + i * 25, 60 + i * 25, 200 + i * 40, 120 + Math.sin(ang) * 35);
          ctx.stroke();
        }
      }

      const earthX = 280, earthY = 160;
      ctx.fillStyle = '#4a9eff';
      ctx.beginPath(); ctx.arc(earthX, earthY, 18, 0, Math.PI * 2); ctx.fill();
      if (storm) {
        ctx.strokeStyle = `rgba(124,77,255,${0.4 + 0.2 * Math.sin(t * 4)})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(earthX, earthY, 32 + i * 12, 20 + i * 8, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      const satX = 400, satY = 100;
      ctx.fillStyle = '#889';
      ctx.fillRect(satX - 15, satY - 8, 30, 16);
      ctx.fillStyle = storm ? '#ff5252' : '#00e676';
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(storm ? '卫星告警' : '卫星正常', satX, satY + 24);

      const gridY = 250;
      ctx.strokeStyle = storm ? '#ff6b35' : '#556';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(180, gridY); ctx.lineTo(420, gridY); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(200 + i * 55, gridY); ctx.lineTo(200 + i * 55, gridY + 15); ctx.stroke();
      }
      ctx.fillStyle = storm ? '#ff6b35' : '#00e676';
      ctx.fillText(storm ? '感应地电流 ↑ · 变压器风险' : '输电稳定', 300, gridY - 8);

      const houseX = 420, houseY = 210;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = storm ? '#ff5252' : '#445';
      ctx.beginPath();
      ctx.moveTo(houseX, houseY - 30); ctx.lineTo(houseX - 25, houseY); ctx.lineTo(houseX + 25, houseY); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(houseX, houseY); ctx.lineTo(houseX, gridY); ctx.stroke();
      ctx.fillStyle = '#4caf50'; ctx.font = '7px monospace';
      ctx.fillText('接地', houseX + 12, (houseY + gridY) / 2);

      if (storm) {
        ctx.strokeStyle = `rgba(200,160,255,${0.5 + 0.3 * Math.sin(t * 8)})`;
        ctx.beginPath(); ctx.moveTo(350, 80); ctx.lineTo(houseX, houseY - 20); ctx.stroke();
      }

      ctx.fillStyle = `rgba(255,107,53,${0.6 + 0.3 * Math.sin(t * 3)})`;
      ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(storm ? '太阳风暴 → 磁层扰动 → 感应电流 → 需防雷/接地/SPD' : '了解空间天气 → 理解家用防雷必要性', W / 2, H - 12);

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
      <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function CosmosSpaceWeather() {
  const navigate = useNav();
  const [mode, setMode] = useState('calm');
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; });
  const info = SPACE_WEATHER_MODES[mode];

  const btn = (id, col, label) => (
    <button type="button" onClick={() => setMode(id)} style={{
      padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${mode === id ? col : 'rgba(255,255,255,.12)'}`,
      background: mode === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: mode === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="cosmos-space-weather" className="sec">
      <div className="sh">
        <span className="sh-icon">🌩️</span>
        <div>
          <div className="sh-tag">Cosmos × Circuit · 空间天气</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(255,107,53,.35)' }}>空间天气与电网</h2>
          <p className="sh-sub">太阳风暴扰动地磁层，可在长输电线路中感应异常电流。从宇宙尺度理解家用防雷、接地与 SPD——与「防雷接地」「安全用电」章节直接呼应。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,100,80,.25)', flexDirection: 'column', gap: 14 }}>
          <SpaceWeatherCanvas modeRef={modeRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {btn('calm', '#00e676', '○ 平静')}
            {btn('storm', '#ff5252', '⚡ 地磁暴')}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,107,53,.2)' }}>
            <div className="formula" style={{ color: ACC }}>感应 EMF ∝ dB/dt</div>
            <div className="fdesc">磁通变化 → 长导线感应电压/电流</div>
          </div>
          <div className="glass">
            <h4 style={{ color: ACC, marginBottom: 8 }}>当前：{info.label} · Kp≈{info.kp}</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75 }}>
              风险等级：<strong style={{ color: info.risk === '高' ? '#ff5252' : '#00e676' }}>{info.risk}</strong><br />
              {info.grid}
            </p>
          </div>
          <ICard color={ACC} title="📅 1859 卡林顿事件">
            史上最强地磁暴之一，电报线路产生火花、部分设备可无需电池工作。现代电网更脆弱，需监测预警。
          </ICard>
          <ICard color="#7c4dff" title="🛡️ 防雷三要素">
            接闪器（避雷针）· 引下线 · 接地体。将雷电流导入大地，保护建筑与人员。
          </ICard>
          <ICard color="#00e676" title="⚡ SPD 浪涌保护">
            MOV/GDT 在过电压时导通泄流，安装在总配电箱与弱电箱，保护后端设备。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('lightning')}>→ 防雷接地（完整动画）</button>
            <button type="button" className="chip" onClick={() => navigate('safety')}>→ 安全用电</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_SPACE_WEATHER} accentColor={ACC} title="空间天气测验" />
      <RelatedSections sectionId="cosmos-space-weather" />
    </section>
  );
}
