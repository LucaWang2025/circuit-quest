import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';

const ACC = '#00e676';

function RelayCanvas({ energized }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = setupHiDpi(cv, 380, 300);
    const W = 380, H = 300;
    let t = 0, raf;
    let armAngle = energized ? 0 : 0.35;
    const targetAngle = energized ? 0 : 0.35;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.03;
      armAngle += (targetAngle - armAngle) * 0.08;

      // Background labels
      ctx.fillStyle = 'rgba(200,220,232,.3)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillText('控制回路 (低压 DC)', 16, 20);
      ctx.fillText('负载回路 (高压 AC)', 210, 20);

      // ── Control circuit (left side) ──
      const coilX = 80, coilY = 150;

      // Battery
      ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, 230); ctx.lineTo(20, 180); ctx.stroke();
      ctx.fillStyle = '#ffab00'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('+', 14, 175);
      ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(14, 182); ctx.lineTo(26, 182); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(16, 186); ctx.lineTo(24, 186); ctx.stroke();

      // Wire from battery to coil
      ctx.strokeStyle = energized ? '#ffab00' : '#555'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, 178); ctx.lineTo(20, 100); ctx.lineTo(coilX - 20, 100); ctx.lineTo(coilX - 20, coilY - 30); ctx.stroke();
      // Wire from coil bottom back to battery
      ctx.beginPath(); ctx.moveTo(coilX - 20, coilY + 30); ctx.lineTo(coilX - 20, 230); ctx.lineTo(20, 230); ctx.stroke();

      // Switch on control circuit
      ctx.fillStyle = energized ? '#00e676' : '#ff5252';
      ctx.beginPath(); ctx.arc(20, 205, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(200,220,232,.5)'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(energized ? 'ON' : 'OFF', 20, 218);

      // Coil (electromagnet)
      const coilW = 40, coilH = 60;
      ctx.strokeStyle = energized ? '#ffab00' : '#666'; ctx.lineWidth = 1.5;
      ctx.fillStyle = energized ? 'rgba(255,171,0,.08)' : 'rgba(100,100,100,.05)';
      ctx.beginPath(); ctx.roundRect(coilX - coilW / 2, coilY - coilH / 2, coilW, coilH, 4); ctx.fill(); ctx.stroke();

      // Coil windings
      for (let i = 0; i < 8; i++) {
        const y = coilY - coilH / 2 + 6 + i * 7;
        ctx.strokeStyle = energized ? `rgba(255,171,0,${0.5 + 0.3 * Math.sin(t * 4 + i)})` : 'rgba(136,136,136,.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(coilX - 12, y); ctx.bezierCurveTo(coilX - 12, y - 3, coilX + 12, y - 3, coilX + 12, y); ctx.stroke();
      }

      // Magnetic field lines when energized
      if (energized) {
        for (let i = 0; i < 4; i++) {
          const r = 35 + i * 10;
          const alpha = 0.15 - i * 0.03 + 0.05 * Math.sin(t * 2 + i);
          ctx.strokeStyle = `rgba(255,171,0,${alpha})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.ellipse(coilX, coilY, r, r * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Iron core
      ctx.fillStyle = '#667';
      ctx.beginPath(); ctx.roundRect(coilX - 5, coilY - coilH / 2 - 8, 10, coilH + 16, 2); ctx.fill();

      // ── Armature (moving contact) ──
      const pivotX = 140, pivotY = 100;
      const armLen = 70;
      const armEndX = pivotX + Math.cos(armAngle) * armLen;
      const armEndY = pivotY + Math.sin(armAngle) * armLen;

      // Pivot point
      ctx.fillStyle = '#aaa'; ctx.beginPath(); ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2); ctx.fill();

      // Spring
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const sx = pivotX + 15 + i * 5;
        const sy = pivotY - 20 + (i % 2 === 0 ? -3 : 3);
        if (i === 0) ctx.moveTo(pivotX + 10, pivotY - 15);
        ctx.lineTo(sx, sy);
      }
      ctx.lineTo(pivotX + 50, pivotY - 15);
      ctx.stroke();

      // Arm
      ctx.strokeStyle = energized ? '#00e676' : '#aaa'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(armEndX, armEndY); ctx.stroke();

      // Contact point on arm
      ctx.fillStyle = energized ? '#00e676' : '#ffab00';
      ctx.beginPath(); ctx.arc(armEndX, armEndY, 5, 0, Math.PI * 2); ctx.fill();

      // ── Load circuit (right side) ──
      const ncX = 210, ncY = 135; // Normally closed contact
      const noX = 210, noY = 165; // Normally open contact

      // NC contact (top)
      ctx.fillStyle = !energized ? '#ff5252' : '#555';
      ctx.beginPath(); ctx.arc(ncX, ncY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(200,220,232,.4)'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
      ctx.fillText('NC (常闭)', ncX + 10, ncY + 3);

      // NO contact (bottom)
      ctx.fillStyle = energized ? '#00e676' : '#555';
      ctx.beginPath(); ctx.arc(noX, noY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillText('NO (常开)', noX + 10, noY + 3);

      // COM terminal
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(noX, noY - 15, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillText('COM', noX + 10, noY - 12);

      // Load wiring
      const loadActive = energized;
      ctx.strokeStyle = loadActive ? '#00e676' : '#555'; ctx.lineWidth = 2;

      // From AC source to COM
      ctx.beginPath(); ctx.moveTo(210, 250); ctx.lineTo(210, noY + 20); ctx.lineTo(noX, noY); ctx.stroke();

      // From NO contact to load (lightbulb)
      ctx.beginPath(); ctx.moveTo(noX, noY); ctx.lineTo(320, noY); ctx.lineTo(320, 200); ctx.stroke();

      // Load to AC return
      ctx.strokeStyle = loadActive ? 'rgba(0,230,118,.6)' : '#555';
      ctx.beginPath(); ctx.moveTo(320, 230); ctx.lineTo(320, 250); ctx.lineTo(210, 250); ctx.stroke();

      // AC source symbol
      ctx.strokeStyle = '#64b5f6'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(210, 255, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(205, 255); ctx.bezierCurveTo(207, 252, 210, 252, 210, 255);
      ctx.bezierCurveTo(210, 258, 213, 258, 215, 255); ctx.stroke();
      ctx.fillStyle = '#64b5f6'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('220V AC', 210, 272);

      // Lightbulb
      const lbY = 215;
      ctx.strokeStyle = loadActive ? '#ffe082' : '#555'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(320, lbY, 14, 0, Math.PI * 2); ctx.stroke();
      if (loadActive) {
        ctx.fillStyle = `rgba(255,240,150,${0.3 + 0.15 * Math.sin(t * 3)})`;
        ctx.shadowColor = '#ffe082'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(320, lbY, 14, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // Filament
        ctx.strokeStyle = '#ffe082'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(316, lbY + 5); ctx.lineTo(316, lbY - 3); ctx.lineTo(320, lbY - 8);
        ctx.lineTo(324, lbY - 3); ctx.lineTo(324, lbY + 5); ctx.stroke();
      } else {
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(316, lbY + 5); ctx.lineTo(316, lbY - 3); ctx.lineTo(320, lbY - 8);
        ctx.lineTo(324, lbY - 3); ctx.lineTo(324, lbY + 5); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(200,220,232,.4)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('负载', 320, lbY + 30);

      // Current flow particles when energized
      if (energized) {
        for (let i = 0; i < 6; i++) {
          const p = (t * 0.8 + i * 0.17) % 1;
          let px, py;
          if (p < 0.3) { px = 210; py = 250 - p / 0.3 * 85; }
          else if (p < 0.5) { px = 210 + (p - 0.3) / 0.2 * 110; py = noY; }
          else if (p < 0.75) { px = 320; py = noY + (p - 0.5) / 0.25 * 85; }
          else { px = 320 - (p - 0.75) / 0.25 * 110; py = 250; }
          ctx.fillStyle = `rgba(0,230,118,${0.7 + 0.3 * Math.sin(t * 5 + i)})`;
          ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Status label
      ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = energized ? '#00e676' : '#ff8a80';
      ctx.fillText(energized ? '线圈通电 → 衔铁吸合 → NO闭合 → 负载工作' : '线圈断电 → 弹簧复位 → NO断开 → 负载停止', W / 2, H - 8);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [energized]);
  return <canvas ref={ref} width={380} height={300} style={{ maxWidth: '100%' }} />;
}

const RELAY_TYPES = [
  { name: '电磁继电器', volt: '5/12/24V DC', feature: '通用、低成本、有机械声', use: '家电控制、汽车电路' },
  { name: '固态继电器 SSR', volt: '3~32V DC 控', feature: '无触点、无噪音、高速', use: '工业加热、LED调光' },
  { name: '时间继电器', volt: '220V AC', feature: '内置延时电路', use: '楼道灯、电机启停' },
  { name: '磁保持继电器', volt: '5/12V DC', feature: '脉冲驱动、断电保持状态', use: '智能电表、远程控制' },
];

const QUIZ_DATA = [
  { question: '继电器的核心工作原理是什么？', options: ['电磁感应', '电生磁→机械动作→切换触点', '热胀冷缩', '压电效应'], answer: 1, explain: '继电器利用电流产生磁场吸引衔铁，带动触点切换，实现小电流控制大电流' },
  { question: '继电器的 NO 触点是什么意思？', options: ['永远断开', '常开（通电时闭合）', '常闭（通电时断开）', '接地端'], answer: 1, explain: 'NO = Normally Open，正常状态断开，线圈通电后才闭合' },
  { question: '继电器线圈两端并联一个二极管的作用？', options: ['降压', '稳压', '吸收反向EMF防止烧毁驱动电路', '整流'], answer: 2, explain: '线圈断电瞬间产生反向电动势(back-EMF)，续流二极管提供泄放回路保护驱动元件' },
];

export default function Relay() {
  const [energized, setEnergized] = useState(false);

  return (
    <section id="relay" className="sec">
      <div className="sh">
        <span className="sh-icon">🔌</span>
        <div className="sh-tag">Home Circuit · Relay</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(0,230,118,.38)' }}>
          继电器 · Relay
        </h2>
        <p className="sh-sub">继电器是"电控开关"——用微弱的控制信号，安全地切换高压大电流负载。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.18)', flexDirection: 'column', gap: 12 }}>
          <RelayCanvas energized={energized} />
          <button
            onClick={() => setEnergized(e => !e)}
            style={{
              padding: '10px 28px', borderRadius: 22, cursor: 'pointer',
              border: `1px solid ${energized ? '#00e676' : 'rgba(255,255,255,.15)'}`,
              background: energized ? 'rgba(0,230,118,.15)' : 'rgba(255,255,255,.04)',
              color: energized ? '#a5d6a7' : '#8aacb8', font: '13px/1 inherit', transition: 'all .25s',
            }}
          >
            {energized ? '⚡ 断开线圈' : '🔌 给线圈通电'}
          </button>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.14)' }}>
            <div className="formula" style={{ color: ACC, textShadow: '0 0 22px rgba(0,230,118,.55)' }}>小电流 → 电磁力 → 切换大电流</div>
            <div className="fdesc">电气隔离 · 一个线圈可控制多组触点（SPDT/DPDT）</div>
          </div>

          {[
            ['工作原理', <>线圈通电→铁芯产生磁场→吸引衔铁（armature）→衔铁带动触点切换<br />断电→弹簧复位→触点恢复原位</>],
            ['触点类型', <><strong style={{ color: '#fff' }}>COM</strong>（公共端）<br /><strong style={{ color: ACC }}>NO</strong>（常开）：通电后 COM↔NO 闭合<br /><strong style={{ color: '#ff8a80' }}>NC</strong>（常闭）：通电后 COM↔NC 断开</>],
            ['续流二极管', <>线圈断电瞬间产生<strong style={{ color: '#ffe082' }}>反向EMF</strong>（数百伏）<br />并联续流二极管（1N4148/1N4007）泄放感应电流，保护驱动端（三极管/MCU引脚）</>],
            ['选型要点', <><strong style={{ color: '#fff' }}>线圈电压：</strong>匹配控制电源（5V/12V/24V）<br /><strong style={{ color: '#fff' }}>触点容量：</strong>≥ 负载电流（如 10A 250VAC）<br /><strong style={{ color: '#fff' }}>寿命：</strong>机械 10万次，电气 5~10万次</>],
          ].map(([title, body]) => (
            <div key={title} className="icard" style={{ borderLeftColor: ACC }}>
              <h4 style={{ color: ACC }}>{title}</h4>
              <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Relay types comparison */}
      <div style={{ marginTop: 30 }}>
        <h3 className="reveal" style={{ fontSize: 16, fontWeight: 700, color: ACC, marginBottom: 14 }}>📋 继电器类型对比</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          {RELAY_TYPES.map(r => (
            <div key={r.name} className="glass reveal" style={{ borderColor: 'rgba(0,230,118,.12)' }}>
              <div style={{ fontWeight: 700, color: ACC, marginBottom: 6, fontSize: 13 }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: '#8aacb8', lineHeight: 1.7 }}>
                <div>控制电压：{r.volt}</div>
                <div>特点：{r.feature}</div>
                <div>应用：{r.use}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practical wiring guide */}
      <div style={{ marginTop: 28 }} className="reveal">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: ACC, marginBottom: 14 }}>🔧 实际接线指南</h3>
        <div className="glass" style={{ borderColor: 'rgba(0,230,118,.12)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#ffe082', marginBottom: 8, fontSize: 13 }}>Arduino 驱动继电器</div>
              <div style={{ fontFamily: '"Courier New",monospace', fontSize: 11.5, color: '#a5d6a7', lineHeight: 1.8, background: 'rgba(0,0,0,.3)', padding: '10px 14px', borderRadius: 8 }}>
                GPIO → 1kΩ电阻 → NPN三极管(B)<br />
                三极管(C) → 继电器线圈 → Vcc<br />
                三极管(E) → GND<br />
                线圈并联 1N4148 续流二极管<br />
                <span style={{ color: '#607a90' }}>// 注意：MCU引脚不能直驱线圈！</span>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#ffe082', marginBottom: 8, fontSize: 13 }}>常见故障排查</div>
              <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.8 }}>
                ▸ 线圈有声无动作 → 检查触点氧化/烧蚀<br />
                ▸ 完全无响应 → 测线圈电阻（正常几十~几百Ω）<br />
                ▸ 触点粘连 → 超载使用，需更换<br />
                ▸ 驱动管烧毁 → 缺少续流二极管
              </div>
            </div>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_DATA} accentColor={ACC} title="继电器小测验" />
    </section>
  );
}
