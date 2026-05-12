import { useEffect, useRef, useState } from 'react';

const ACC = '#ff1744';

// ── Current Path / Ground Canvas ──────────────────────────
function SafetyCanvas({ mode }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, rafId;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.03;

      if (mode === 'shock') {
        // Person touching live wire without grounding
        const px = W * 0.5, py = 80;
        // Body outline (simplified stick figure)
        ctx.strokeStyle = 'rgba(200,220,232,0.6)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        // Head
        ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.stroke();
        // Torso
        ctx.beginPath(); ctx.moveTo(px, py + 18); ctx.lineTo(px, py + 80); ctx.stroke();
        // Arms
        ctx.beginPath(); ctx.moveTo(px, py + 30); ctx.lineTo(px - 38, py + 58); ctx.stroke(); // left to socket
        ctx.beginPath(); ctx.moveTo(px, py + 30); ctx.lineTo(px + 38, py + 55); ctx.stroke(); // right
        // Legs
        ctx.beginPath(); ctx.moveTo(px, py + 80); ctx.lineTo(px - 20, py + 130); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py + 80); ctx.lineTo(px + 20, py + 130); ctx.stroke();

        // Danger: current path (hand → body → feet → ground)
        const pulse = 0.5 + 0.5 * Math.sin(t * 8);
        ctx.strokeStyle = `rgba(255,23,68,${pulse})`; ctx.lineWidth = 4;
        ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 12 * pulse;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(px - 38, py + 58); // left hand
        ctx.lineTo(px - 20, py + 130); // left foot → ground
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Lightning bolts on the arm
        [0.25, 0.55, 0.8].forEach(frac => {
          const bx = px - 38 + (px - 20 - (px - 38)) * frac;
          const by = (py + 58) + (py + 130 - (py + 58)) * frac;
          const sz = 8 + 4 * Math.sin(t * 6 + frac * 10);
          ctx.fillStyle = `rgba(255,171,0,${pulse})`;
          ctx.font = `${sz}px serif`; ctx.textAlign = 'center';
          ctx.fillText('⚡', bx, by);
        });

        // Socket on left
        ctx.strokeStyle = 'rgba(255,82,82,.6)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(px - 82, py + 38, 40, 40, 4); ctx.stroke();
        ctx.fillStyle = 'rgba(255,82,82,.3)'; ctx.fill();
        ctx.fillStyle = '#ff5252'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('220V', px - 62, py + 68);

        // Ground (no protection)
        ctx.fillStyle = 'rgba(255,23,68,.4)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('⚠️ 无地线保护', px, py + 155);
        ctx.fillText(`通过人体入地电流: ${(0.05 + 0.18 * pulse).toFixed(2)} A`, px, py + 170);

      } else if (mode === 'gnd') {
        // Grounded appliance
        const px = W * 0.5, py = 60;
        // Appliance box
        ctx.strokeStyle = 'rgba(0,230,118,.4)'; ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0,230,118,.08)';
        ctx.beginPath(); ctx.roundRect(px - 50, py, 100, 80, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(0,230,118,.7)'; ctx.font = '12px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('家用电器', px, py + 44);
        ctx.font = '10px "Courier New",monospace'; ctx.fillStyle = 'rgba(0,230,118,.5)';
        ctx.fillText('外壳接地', px, py + 62);

        // Ground wire down
        ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 3;
        ctx.shadowColor = '#4caf50'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(px, py + 80); ctx.lineTo(px, H - 38); ctx.stroke();
        ctx.shadowBlur = 0;

        // Ground symbol
        for (let i = 0; i < 3; i++) {
          const lineW = 30 - i * 8;
          ctx.strokeStyle = `rgba(76,175,80,${0.8 - i * 0.2})`; ctx.lineWidth = 2 - i * 0.3;
          ctx.beginPath(); ctx.moveTo(px - lineW, H - 34 + i * 8); ctx.lineTo(px + lineW, H - 34 + i * 8); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(76,175,80,.6)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('大地', px, H - 12);

        // Leakage scenario: current goes to ground, not human
        const leakPhase = (t * 80) % (H - 38 - py - 80);
        ctx.fillStyle = '#4caf50'; ctx.shadowColor = '#4caf50'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(px, py + 80 + leakPhase, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Person nearby (safe)
        const spx = px + 90;
        ctx.strokeStyle = 'rgba(200,220,232,0.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(spx, py + 30, 13, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(spx, py + 43); ctx.lineTo(spx, py + 90); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(spx, py + 55); ctx.lineTo(spx - 20, py + 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(spx, py + 55); ctx.lineTo(spx + 20, py + 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(spx, py + 90); ctx.lineTo(spx - 12, py + 130); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(spx, py + 90); ctx.lineTo(spx + 12, py + 130); ctx.stroke();
        ctx.fillStyle = '#00e676'; ctx.font = '11px serif'; ctx.textAlign = 'center';
        ctx.fillText('✅ 安全', spx, py + 148);

      } else {
        // RCD / GFCI animation
        const rcdX = W * 0.5, rcdY = 70;
        // RCD box
        ctx.strokeStyle = 'rgba(156,125,255,.6)'; ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(156,125,255,.08)';
        ctx.beginPath(); ctx.roundRect(rcdX - 45, rcdY, 90, 60, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(156,125,255,.8)'; ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('漏电保护器', rcdX, rcdY + 22);
        ctx.font = '10px "Courier New",monospace'; ctx.fillStyle = 'rgba(156,125,255,.5)';
        ctx.fillText('RCD / GFCI', rcdX, rcdY + 40);
        ctx.fillText('30 mA · 0.1s', rcdX, rcdY + 55);

        // Fire wire (L)
        const liveAlpha = 0.7 + 0.3 * Math.sin(t * 2);
        ctx.strokeStyle = `rgba(255,82,82,${liveAlpha})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(rcdX - 20, rcdY - 40); ctx.lineTo(rcdX - 20, rcdY); ctx.stroke();
        // Neutral wire (N)
        ctx.strokeStyle = `rgba(100,181,246,${liveAlpha})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(rcdX + 20, rcdY - 40); ctx.lineTo(rcdX + 20, rcdY); ctx.stroke();

        // Labels
        ctx.fillStyle = '#ff5252'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('L', rcdX - 20, rcdY - 44);
        ctx.fillStyle = '#64b5f6'; ctx.fillText('N', rcdX + 20, rcdY - 44);

        // Current comparison arrows
        const diff = 0.03 * Math.abs(Math.sin(t * 1.5));
        ctx.fillStyle = 'rgba(156,125,255,.8)'; ctx.font = '11px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText(`IL = ${(0.5).toFixed(2)} A`, rcdX - 20, rcdY + 85);
        ctx.fillText(`IN = ${(0.5 - diff).toFixed(2)} A`, rcdX + 20, rcdY + 85);
        ctx.fillText(`差值: ${(diff * 1000).toFixed(0)} mA`, rcdX, rcdY + 103);

        if (diff * 1000 > 20) {
          // Trip!
          ctx.fillStyle = '#ff1744'; ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 20;
          ctx.font = 'bold 13px "Courier New",monospace'; ctx.textAlign = 'center';
          ctx.fillText('⚡ 漏电检测！自动断开！', rcdX, rcdY + 125);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#00e676'; ctx.font = '11px "Courier New",monospace';
          ctx.fillText('✓ 电流平衡，正常工作', rcdX, rcdY + 125);
        }

        // Down wire (output to load)
        ctx.strokeStyle = diff * 1000 > 20 ? 'rgba(255,23,68,.3)' : 'rgba(0,230,118,.5)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(rcdX - 20, rcdY + 60); ctx.lineTo(rcdX - 20, rcdY + 145); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rcdX + 20, rcdY + 60); ctx.lineTo(rcdX + 20, rcdY + 145); ctx.stroke();
        ctx.fillStyle = 'rgba(200,220,232,.5)'; ctx.font = '10px "Courier New",monospace';
        ctx.fillText('→ 负载', rcdX + 50, rcdY + 108);
      }

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [mode]);
  return <canvas ref={ref} width={300} height={270} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const FIRST_AID = [
  { n: 1, color: '#ff1744', t: '切断电源', d: '立即关断配电箱总闸，或用绝缘工具（干木棒、塑料管）挑开电线，切勿用手直接接触触电者！' },
  { n: 2, color: '#ffab00', t: '评估意识', d: '呼唤触电者姓名，轻拍肩膀，观察是否有反应、是否呼吸正常，30 秒内完成判断。' },
  { n: 3, color: '#ff6b35', t: '拨打急救', d: '立即拨打 120 急救电话，说明位置、伤者状态。让旁人去开路等候救护车。' },
  { n: 4, color: '#00e676', t: '心肺复苏', d: '若无意识无呼吸：双手交叠置于胸骨中下部，以每分钟 100~120 次节奏持续按压，深度 5~6cm，按压 30 次后人工呼吸 2 次，循环进行直至医疗人员到达。' },
  { n: 5, color: '#00bcd4', t: '不乱处理', d: '不可用湿布擦拭伤口，不可给触电者喝水，不可涂抹任何药物，静待专业急救处理。' },
];

const RULES = [
  { icon: '🔍', t: '操作前必须验电', d: '任何接线操作前，用验电笔确认线路无电，这是所有规范的第一条。' },
  { icon: '🤲', t: '单手操作原则', d: '可能接触带电体时，将一只手放在背后，避免电流通过双手形成心脏路径。' },
  { icon: '🧤', t: '使用绝缘工具', d: '用有绝缘手柄的工具，穿绝缘鞋，在干燥环境操作，湿手严禁触碰电气设备。' },
  { icon: '🏷️', t: '挂牌警告', d: '操作断路器时挂"有人工作，禁止合闸"警告牌，防止他人误送电。' },
  { icon: '🌧️', t: '雨天停工', d: '潮湿或雨天不进行室外电气操作，湿气大幅降低绝缘性能，危险系数倍增。' },
  { icon: '👥', t: '不单独作业', d: '涉及高压或主配电盘时，必须两人以上配合，一人监护一人操作。' },
];

export default function Safety() {
  const [mode, setMode] = useState('shock');

  return (
    <section id="safety" className="sec">
      <div className="sh">
        <span className="sh-icon">🛡️</span>
        <div className="sh-tag">Stage 3 · Electrical Safety</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,23,68,.4)` }}>
          安全用电
        </h2>
        <p className="sh-sub">掌握接地保护原理、漏电开关工作机制和触电急救流程——安全意识是成为合格电工的必修课。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Danger level banner */}
      <div style={{ marginBottom: 36, background: 'rgba(255,23,68,.09)', border: '1px solid rgba(255,23,68,.3)', borderRadius: 14, padding: '16px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 28 }}>⚡</span>
        <div>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 6, fontSize: 16 }}>触电危险临界值</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {[['1 mA', '感知阈值，感觉到麻'],['10 mA', '肌肉痉挛，无法松手'],['30 mA', '漏电保护器动作值'],['50+ mA', '心室颤动，致命危险'],['220 V', '中国标准市电电压'],].map(([v, d]) => (
              <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ font: 'bold 13px "Courier New",monospace', color: ACC, minWidth: 52 }}>{v}</span>
                <span style={{ fontSize: 12.5, color: '#8aacb8' }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas + mode selector */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,23,68,.2)', flexDirection: 'column', gap: 14 }}>
          <SafetyCanvas mode={mode} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['shock', '⚡ 触电危险'], ['gnd', '🟢 接地保护'], ['rcd', '🛡️ 漏电保护器']].map(([id, label]) => (
              <button key={id} onClick={() => setMode(id)} style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5,
                border: `1px solid ${mode === id ? ACC : 'rgba(255,23,68,.22)'}`,
                background: mode === id ? 'rgba(255,23,68,.18)' : 'transparent',
                color: mode === id ? ACC : 'var(--dim)', transition: 'all .18s', font: 'inherit',
              }}>{label}</button>
            ))}
          </div>
          <div className="icard" style={{ width: '88%', borderColor: 'rgba(255,23,68,.18)', textAlign: 'left', padding: '12px 16px' }}>
            <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.7 }}>
              {{
                shock: '无保护接地时，人体触碰漏电外壳会成为电流泄漏路径，电流经过心脏区域极其危险。',
                gnd: '接地线将电器外壳与大地连接，漏电时电流优先沿低阻抗接地线泄放，而非通过人体，有效保护生命安全。',
                rcd: '漏电保护器持续比较火线和零线电流，当差值超过 30mA（电流经人体泄漏）时，在 0.1 秒内断电，这个时间内不足以致命。',
              }[mode]}
            </div>
          </div>
        </div>

        {/* Safety rules */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center', marginBottom: 4 }}>
            📋 操作安全六条准则
          </div>
          {RULES.map(r => (
            <div key={r.t} className="glass" style={{ borderColor: 'rgba(255,23,68,.13)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--white)', fontSize: 13.5, marginBottom: 5 }}>{r.t}</div>
                <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>{r.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* First aid */}
      <div style={{ marginTop: 52 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          🚨 触电急救步骤
        </h3>
        <div style={{ width: 40, height: 2, background: `linear-gradient(90deg,${ACC},transparent)`, marginBottom: 28, borderRadius: 2 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {FIRST_AID.map(s => (
            <div key={s.n} className="glass reveal" style={{ borderColor: `${s.color}28`, borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: `${s.color}22`, border: `1.5px solid ${s.color}`,
                  color: s.color, font: 'bold 13px monospace',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{s.n}</div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: 14 }}>{s.t}</div>
              </div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.7 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Protection hierarchy */}
      <div style={{ marginTop: 36, background: 'rgba(156,125,255,.07)', border: '1px solid rgba(156,125,255,.22)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, color: '#9c7dff', marginBottom: 16, fontSize: 15 }}>🏗️ 家用电气安全防护体系（从外到内）</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: '第一层', name: '总漏电保护断路器（入户）', desc: '整栋用电的总保护，检测总泄漏电流，动作值 100mA', color: '#ff1744' },
            { label: '第二层', name: '分支漏电保护断路器', desc: '各回路独立保护，卫生间/厨房漏电保护器 30mA', color: '#ff6b35' },
            { label: '第三层', name: '电气设备保护接地（PE）', desc: '电器外壳接地，漏电时优先泄流而不通过人体', color: '#ffab00' },
            { label: '第四层', name: '绝缘防护', desc: '导线绝缘皮、插座防护门、开关绝缘外壳阻断触电路径', color: '#00e676' },
            { label: '第五层', name: '个人防护', desc: '绝缘手套、绝缘鞋、验电笔确认、规范操作习惯', color: '#00bcd4' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0',
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
            }}>
              <div style={{
                flexShrink: 0, width: 52, font: '11px "Courier New",monospace',
                color: row.color, textAlign: 'right', lineHeight: 1.5,
              }}>{row.label}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: row.color, marginBottom: 4, fontSize: 14 }}>{row.name}</div>
                <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.6 }}>{row.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
