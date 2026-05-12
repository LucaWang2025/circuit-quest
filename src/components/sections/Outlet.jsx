import { useEffect, useRef, useState } from 'react';

const ACC = '#00bcd4';

// ── Outlet wiring diagram canvas ──────────────────────────
function OutletCanvas({ step }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, rafId;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.03;

      // Background panel
      ctx.fillStyle = 'rgba(6,12,28,.6)'; ctx.strokeStyle = 'rgba(0,188,212,.2)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(20, 20, W - 40, H - 40, 12); ctx.fill(); ctx.stroke();

      const cx = W / 2, cy = H / 2;

      if (step < 5) {
        // Step 1-4: Show wall box + wires coming in
        // Wall box outline
        ctx.strokeStyle = 'rgba(0,188,212,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(cx - 55, cy - 55, 110, 110, 6); ctx.stroke();
        ctx.fillStyle = 'rgba(0,188,212,.06)'; ctx.fill();

        ctx.fillStyle = 'rgba(0,188,212,.4)'; ctx.font = '11px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('接线盒', cx, cy - 62);

        // Three wires from top
        const wireData = [
          { x: cx - 24, c: '#ff5252', label: 'L 火线', show: step >= 2 },
          { x: cx,      c: '#64b5f6', label: 'N 零线', show: step >= 2 },
          { x: cx + 24, c: '#4caf50', label: 'PE 地线', show: step >= 3 },
        ];
        wireData.forEach(w => {
          if (!w.show) return;
          ctx.strokeStyle = w.c; ctx.lineWidth = 3;
          ctx.shadowColor = w.c; ctx.shadowBlur = 5;
          ctx.beginPath(); ctx.moveTo(w.x, cy - 90); ctx.lineTo(w.x, cy - 55); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = w.c; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
          ctx.fillText(w.label, w.x, cy - 94);
        });

        // Outlet face (simplified)
        if (step >= 4) {
          // Screw terminals inside
          const termColors = [
            { ox: -24, rgb: '255,82,82' },
            { ox: 0,   rgb: '100,181,246' },
            { ox: 24,  rgb: '76,175,80' },
          ];
          termColors.forEach(({ ox, rgb }) => {
            ctx.fillStyle = 'rgba(200,200,200,.15)';
            ctx.beginPath(); ctx.roundRect(cx + ox - 10, cy - 20, 20, 40, 3); ctx.fill();
            const pulse = 0.6 + 0.35 * Math.sin(t * 3 + ox);
            ctx.fillStyle = `rgba(${rgb},${pulse})`;
            ctx.shadowColor = `rgba(${rgb},1)`; ctx.shadowBlur = 8 * pulse;
            ctx.beginPath(); ctx.arc(cx + ox, cy, 6, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          });
          ctx.fillStyle = 'rgba(0,188,212,.6)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
          ctx.fillText('接线端子', cx, cy + 36);
        }
      } else {
        // Step 5-7: Show completed outlet face
        const face = { x: cx - 45, y: cy - 55, w: 90, h: 110 };
        // Faceplate
        const fg = ctx.createLinearGradient(face.x, face.y, face.x + face.w, face.y + face.h);
        fg.addColorStop(0, '#e0e0e0'); fg.addColorStop(1, '#bdbdbd');
        ctx.fillStyle = fg; ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.roundRect(face.x, face.y, face.w, face.h, 8); ctx.fill();
        ctx.shadowBlur = 0;

        // Two flat holes
        [[-16, 0], [16, 0]].forEach(([ox]) => {
          ctx.fillStyle = '#222';
          ctx.beginPath(); ctx.roundRect(cx + ox - 5, cy - 18, 10, 26, 2); ctx.fill();
        });

        // Round ground hole
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.arc(cx, cy + 28, 8, 0, Math.PI * 2); ctx.fill();

        // Screws
        [[-38, -40], [38, -40], [-38, 40], [38, 40]].forEach(([ox, oy]) => {
          ctx.fillStyle = '#9e9e9e'; ctx.strokeStyle = '#616161'; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.arc(cx + ox, cy + oy, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        });

        // Label
        const pulse = 0.5 + 0.35 * Math.sin(t * 2);
        ctx.fillStyle = `rgba(0,188,212,${pulse})`; ctx.font = 'bold 13px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText(step >= 6 ? '✓ 安装完成' : '固定面板中...', cx, cy + 72);

        if (step >= 7) {
          // Powered indicator
          ctx.shadowColor = '#00e676'; ctx.shadowBlur = 16;
          ctx.fillStyle = '#00e676';
          ctx.beginPath(); ctx.arc(cx + 42, cy - 48, 5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(0,230,118,.7)'; ctx.font = '10px "Courier New",monospace';
          ctx.fillText('有电', cx + 42, cy - 36);
        }
      }

      // Step badge
      ctx.fillStyle = ACC; ctx.font = `bold 12px "Courier New",monospace`; ctx.textAlign = 'left';
      ctx.fillText(`STEP ${step} / 7`, 34, 40);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [step]);
  return <canvas ref={ref} width={300} height={300} style={{ maxWidth: '100%' }} />;
}

// ── Steps data ────────────────────────────────────────────
const OUTLET_STEPS = [
  {
    step: 1, phase: '准备阶段', title: '断电 & 验电',
    detail: '打开配电箱，关闭对应回路断路器。用验电笔探入旧插座孔，确认两孔均不亮后方可动手。切勿跳过此步骤！',
    tools: ['验电笔', '绝缘手套'],
    warn: '必须先关断路器，验电笔亮即有电，不得操作！',
  },
  {
    step: 2, phase: '准备阶段', title: '拆下旧插座',
    detail: '用十字螺丝刀卸下面板螺丝（通常 4 颗），轻轻向外拔出插座模块，注意不要强拉导线。记录或拍照原有接线位置。',
    tools: ['十字螺丝刀', '手机（拍照）'],
  },
  {
    step: 3, phase: '检查阶段', title: '检查导线',
    detail: '确认到位导线：火线（红/棕）、零线（蓝）、地线（黄绿）三根齐全。检查线头绝缘层是否破损，剥线长度是否合适（8~10mm）。',
    tools: ['剥线钳', '斜口钳'],
  },
  {
    step: 4, phase: '接线阶段', title: '接线到新插座',
    detail: `按照颜色标识接入新插座对应端子：
· 火线 L（红/棕）→ 插座 L 孔（右孔）
· 零线 N（蓝）→ 插座 N 孔（左孔）
· 地线 PE（黄绿）→ 插座接地孔（中下）
拧紧每颗接线螺丝，轻拉确认无松动。`,
    tools: ['一字螺丝刀', '剥线钳'],
    warn: '火线零线不可接反，接地线严禁不接或接错！',
  },
  {
    step: 5, phase: '固定阶段', title: '折叠导线入盒',
    detail: '将多余线头整理折叠，顺势推入接线盒内，注意不要硬折损坏导线绝缘层。导线弯折半径不应小于线径的 6 倍。',
    tools: ['尖嘴钳'],
  },
  {
    step: 6, phase: '固定阶段', title: '安装固定面板',
    detail: '将插座模块推入接线盒卡口，对准螺孔后拧紧两颗固定螺丝（勿过紧导致面板变形），安装外壳面板，拧紧装饰螺丝。',
    tools: ['十字螺丝刀'],
  },
  {
    step: 7, phase: '测试阶段', title: '通电测试',
    detail: '回到配电箱合上断路器，用验电笔插入插座右孔（L 孔）验电应亮，左孔（N 孔）不亮。再用万用表 AC250V 档测量，应读数约 220V。',
    tools: ['验电笔', '万用表'],
  },
];

const SWITCH_STEPS = [
  { step: 1, title: '断电验电', detail: '关断路器，验电笔确认无电。单联开关通常只有两根线（单控）或三根线（双控）。' },
  { step: 2, title: '拆旧开关', detail: '卸下面板，拔出模块，记录接线。单控开关：L1、L2；双控开关：L1、L（公共端）、L2。' },
  { step: 3, title: '识别接线', detail: '单控：从断路器来的火线接 L1，去灯具的线接 L2。双控：两个开关各有公共端 L，通过 L1/L2 联动控制灯。' },
  { step: 4, title: '接线固定', detail: '对号接入对应端子，拧紧螺丝。注意开关只断火线，零线不经过开关，直接送往灯具。' },
  { step: 5, title: '安装测试', detail: '推入模块，固定面板，合上断路器，拨动开关验证灯具是否正常亮灭。' },
];

export default function Outlet() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('outlet');
  const current = OUTLET_STEPS[step - 1];
  const sectionRef = useRef(null);

  // Re-observe reveal elements whenever tab switches
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const timer = setTimeout(() => {
      const io = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }),
        { threshold: 0.08 }
      );
      section.querySelectorAll('.reveal:not(.vis)').forEach(el => io.observe(el));
      return () => io.disconnect();
    }, 60);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <section id="outlet" className="sec" ref={sectionRef}>
      <div className="sh">
        <span className="sh-icon">🔧</span>
        <div className="sh-tag">Stage 3 · Installation Practice</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(0,188,212,.4)` }}>
          开关与插座安装
        </h2>
        <p className="sh-sub">掌握换插座、换开关的完整流程，从断电、接线到测试，安全自信地动手操作。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {[['outlet', '🔌 插座更换'], ['switch', '💡 开关更换']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '8px 22px', borderRadius: 10,
            border: `1px solid ${activeTab === id ? ACC : 'rgba(0,188,212,.22)'}`,
            background: activeTab === id ? 'rgba(0,188,212,.16)' : 'transparent',
            color: activeTab === id ? ACC : 'var(--dim)',
            font: '13px/1 inherit', cursor: 'pointer', transition: 'all .22s',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'outlet' ? (
        <div className="grid2">
          {/* Canvas + step nav */}
          <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 16 }}>
            <OutletCanvas step={step} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} style={{
                padding: '6px 16px', borderRadius: 8, cursor: step === 1 ? 'default' : 'pointer',
                border: '1px solid rgba(0,188,212,.3)', background: 'transparent',
                color: step === 1 ? 'var(--dim)' : ACC, font: '13px inherit', transition: 'all .18s',
              }}>← 上一步</button>
              <div style={{ flex: 1, display: 'flex', gap: 4, justifyContent: 'center' }}>
                {OUTLET_STEPS.map(s => (
                  <div key={s.step} onClick={() => setStep(s.step)} style={{
                    width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
                    background: step === s.step ? ACC : 'rgba(0,188,212,.25)',
                    transition: 'background .18s',
                  }} />
                ))}
              </div>
              <button onClick={() => setStep(s => Math.min(7, s + 1))} disabled={step === 7} style={{
                padding: '6px 16px', borderRadius: 8, cursor: step === 7 ? 'default' : 'pointer',
                border: '1px solid rgba(0,188,212,.3)', background: step < 7 ? 'rgba(0,188,212,.12)' : 'transparent',
                color: step === 7 ? 'var(--dim)' : ACC, font: '13px inherit', transition: 'all .18s',
              }}>下一步 →</button>
            </div>
          </div>

          {/* Step detail */}
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(0,188,212,.18)', border: `2px solid rgba(0,188,212,.6)`,
                color: ACC, font: 'bold 16px monospace',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{current.step}</div>
              <div>
                <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)' }}>{current.phase}</div>
                <div style={{ fontWeight: 700, color: ACC, fontSize: 18 }}>{current.title}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(6,12,28,.65)', border: '1px solid rgba(0,188,212,.15)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 14, color: '#c8dce8', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{current.detail}</div>
            </div>

            {current.tools && (
              <div>
                <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', marginBottom: 8 }}>🛠 所需工具</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {current.tools.map(tool => (
                    <div key={tool} style={{
                      padding: '4px 12px', borderRadius: 20,
                      border: '1px solid rgba(0,188,212,.3)', background: 'rgba(0,188,212,.08)',
                      color: ACC, fontSize: 13,
                    }}>{tool}</div>
                  ))}
                </div>
              </div>
            )}

            {current.warn && (
              <div style={{ background: 'rgba(255,23,68,.08)', border: '1px solid rgba(255,23,68,.3)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ color: '#ff1744', fontSize: 13, fontWeight: 600 }}>⚠️ {current.warn}</div>
              </div>
            )}

            {/* Step list overview */}
            <div style={{ marginTop: 8 }}>
              {OUTLET_STEPS.map(s => (
                <div key={s.step} onClick={() => setStep(s.step)} style={{
                  display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px',
                  borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                  background: step === s.step ? 'rgba(0,188,212,.1)' : 'transparent',
                  transition: 'background .18s',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: step === s.step ? 'rgba(0,188,212,.3)' : step > s.step ? 'rgba(0,230,118,.2)' : 'rgba(255,255,255,.06)',
                    border: `1px solid ${step === s.step ? ACC : step > s.step ? '#00e676' : 'rgba(255,255,255,.12)'}`,
                    color: step === s.step ? ACC : step > s.step ? '#00e676' : 'var(--dim)',
                    font: '10px monospace', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{step > s.step ? '✓' : s.step}</div>
                  <span style={{ fontSize: 13, color: step === s.step ? ACC : step > s.step ? '#00e676' : 'var(--dim)' }}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Switch steps */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {SWITCH_STEPS.map(s => (
            <div key={s.step} className="glass reveal" style={{ borderColor: 'rgba(0,188,212,.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(0,188,212,.18)', border: '1px solid rgba(0,188,212,.5)',
                  color: ACC, font: 'bold 13px monospace',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{s.step}</div>
                <div style={{ fontWeight: 700, color: ACC, fontSize: 15 }}>{s.title}</div>
              </div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.7 }}>{s.detail}</div>
            </div>
          ))}
          {/* Double-switch wiring diagram text */}
          <div className="glass reveal" style={{ borderColor: 'rgba(255,171,0,.2)' }}>
            <div style={{ fontWeight: 700, color: '#ffab00', marginBottom: 10 }}>🔁 双控开关接线原理</div>
            <div style={{ font: '12px "Courier New",monospace', color: '#8aacb8', lineHeight: 2 }}>
              <div>配电箱 → [火线] → 开关 A (L 公共端)</div>
              <div style={{ paddingLeft: 16, borderLeft: '2px solid rgba(255,171,0,.3)', margin: '4px 0 4px 8px' }}>
                <div>开关 A (L1) ←→ 开关 B (L1)</div>
                <div>开关 A (L2) ←→ 开关 B (L2)</div>
              </div>
              <div>开关 B (L 公共端) → [火线] → 灯具 (L)</div>
              <div>配电箱 → [零线] → 直接到灯具 (N)</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,171,0,.6)' }}>
              任意拨动其中一个开关均可开/关灯
            </div>
          </div>
        </div>
      )}

      {/* Common tools */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: ACC, marginBottom: 16 }}>🧰 电工常用工具一览</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { icon: '⚡', t: '验电笔', d: '接触试电，氖管亮即带电，电工必备安全工具' },
            { icon: '🔩', t: '螺丝刀组', d: '一字 / 十字各规格，配套绝缘柄，用于紧固端子和面板' },
            { icon: '✂️', t: '剥线钳', d: '精准剥去绝缘层而不伤导体，比美工刀安全' },
            { icon: '🔧', t: '尖嘴钳', d: '折弯导线头、夹持小零件、剪断细线' },
            { icon: '📏', t: '万用表', d: '测量电压/电流/电阻，安装完成后必须测量验证' },
            { icon: '💡', t: '手电筒', d: '配电箱区域光线暗，操作时确保视野清晰' },
          ].map(tool => (
            <div key={tool.t} className="icard reveal" style={{ borderColor: 'rgba(0,188,212,.14)', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 7 }}>{tool.icon}</div>
              <div style={{ fontWeight: 700, color: ACC, marginBottom: 5, fontSize: 13 }}>{tool.t}</div>
              <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.55 }}>{tool.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
