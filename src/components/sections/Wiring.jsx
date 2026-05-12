import { useEffect, useRef, useState } from 'react';

const ACC = '#00e676';

// ── Wire Cross-Section Canvas ──────────────────────────────
function WireCanvas({ wire }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, rafId;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const CX = W * 0.38, CY = H / 2;
      const outerR = 60, insulR = outerR - 10, condR = insulR - 14;
      const strandN = wire.strands;

      // Outer insulation
      const ig = ctx.createRadialGradient(CX - 8, CY - 8, 0, CX, CY, outerR);
      ig.addColorStop(0, wire.insColor + 'dd'); ig.addColorStop(1, wire.insColor + '66');
      ctx.fillStyle = ig;
      ctx.shadowColor = wire.insColor; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(CX, CY, outerR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Insulation ring label
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = insulR - condR - 2;
      ctx.beginPath(); ctx.arc(CX, CY, (insulR + condR) / 2 + 2, 0, Math.PI * 2); ctx.stroke();

      // Conductor strands
      if (strandN === 1) {
        const cg = ctx.createRadialGradient(CX - 5, CY - 5, 0, CX, CY, condR);
        cg.addColorStop(0, '#ffd740'); cg.addColorStop(1, '#c8a000');
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(CX, CY, condR, 0, Math.PI * 2); ctx.fill();
      } else {
        const strandR = condR * 0.35;
        const positions = [];
        if (strandN <= 8) {
          positions.push([CX, CY]);
          for (let i = 0; i < strandN - 1; i++) {
            const a = (i / (strandN - 1)) * Math.PI * 2 + t * 0.1;
            positions.push([CX + Math.cos(a) * (condR - strandR), CY + Math.sin(a) * (condR - strandR)]);
          }
        } else {
          const ring1 = 6, ring2 = strandN - ring1 - 1;
          positions.push([CX, CY]);
          for (let i = 0; i < ring1; i++) {
            const a = (i / ring1) * Math.PI * 2 + t * 0.05;
            positions.push([CX + Math.cos(a) * (condR * 0.45), CY + Math.sin(a) * (condR * 0.45)]);
          }
          for (let i = 0; i < ring2; i++) {
            const a = (i / ring2) * Math.PI * 2 - t * 0.05;
            positions.push([CX + Math.cos(a) * (condR * 0.85), CY + Math.sin(a) * (condR * 0.85)]);
          }
        }
        positions.forEach(([sx, sy]) => {
          const cg = ctx.createRadialGradient(sx - 2, sy - 2, 0, sx, sy, strandR);
          cg.addColorStop(0, '#ffd740'); cg.addColorStop(1, '#b8920a');
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(sx, sy, strandR, 0, Math.PI * 2); ctx.fill();
        });
      }

      // Current flow glow
      const flowAlpha = 0.4 + 0.3 * Math.sin(t * 3);
      ctx.fillStyle = `rgba(255,215,64,${flowAlpha})`;
      ctx.shadowColor = '#ffd740'; ctx.shadowBlur = 20 + 10 * Math.sin(t * 2);
      ctx.beginPath(); ctx.arc(CX, CY, condR * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // ── Right side info ──
      const IX = W * 0.68, IY = 30;
      ctx.fillStyle = wire.insColor; ctx.font = `bold 16px inherit`; ctx.textAlign = 'left';
      ctx.fillText(wire.label, IX, IY + 16);

      ctx.fillStyle = 'rgba(200,220,232,0.7)'; ctx.font = '12px "Courier New",monospace';
      const lines = [
        `截面积: ${wire.mm2} mm²`,
        `股数:   ${wire.strands} 股`,
        `额定:   ${wire.rated}A`,
        `功率:   ≤ ${wire.rated * 220}W`,
        `用途:   ${wire.use}`,
      ];
      lines.forEach((line, i) => ctx.fillText(line, IX, IY + 44 + i * 22));

      // Max current bar
      const barY = H - 60;
      ctx.fillStyle = 'rgba(255,255,255,.07)';
      ctx.beginPath(); ctx.roundRect(IX, barY, 120, 8, 4); ctx.fill();
      ctx.fillStyle = ACC;
      ctx.shadowColor = ACC; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(IX, barY, 120 * Math.min(wire.rated / 60, 1), 8, 4); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(200,220,232,.5)'; ctx.font = '10px "Courier New",monospace';
      ctx.fillText(`额定电流 ${wire.rated}A / 最大 60A`, IX, barY + 22);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [wire]);
  return <canvas ref={ref} width={340} height={280} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const WIRES = [
  { id: '1.5', label: '1.5 mm² 照明线', mm2: '1.5', strands: 1,  rated: 16, use: '灯具、开关', insColor: '#ff5252' },
  { id: '2.5', label: '2.5 mm² 插座线', mm2: '2.5', strands: 7,  rated: 25, use: '普通插座', insColor: '#2196f3' },
  { id: '4',   label: '4 mm²  空调线',  mm2: '4',   strands: 7,  rated: 32, use: '空调专线', insColor: '#4caf50' },
  { id: '6',   label: '6 mm²  进户线',  mm2: '6',   strands: 19, rated: 40, use: '总进线',   insColor: '#ffab00' },
  { id: '10',  label: '10 mm² 主干线', mm2: '10',  strands: 19, rated: 60, use: '主干线路', insColor: '#9c7dff' },
];

const COLORS = [
  { c: '#ff5252', name: '红色 / 棕色',   role: '火线 L',   note: '带电导体，必须接断路器' },
  { c: '#2196f3', name: '蓝色',          role: '零线 N',   note: '回路中性线，接零排' },
  { c: '#8bc34a', name: '黄绿双色',      role: '地线 PE',  note: '保护接地，严禁接入负载' },
  { c: '#ffeb3b', name: '黄色',          role: '火线备用', note: '三相系统中 B 相' },
  { c: '#000',    name: '黑色',          role: '单芯电缆护套', note: '多股芯线外层护套色' },
  { c: '#9c7dff', name: '紫色（淡）',    role: '控制线',   note: '弱电控制或信号线' },
];

const JOIN_METHODS = [
  { icon: '🔩', t: '接线端子排', level: '推荐', d: '螺丝压紧铜片，可靠性高，拆装方便，适合导线截面 1.5~10mm²。' },
  { icon: '🟡', t: 'Wago 按压接线器', level: '推荐', d: '免工具插入即连，弹片固定，适合快速接线盒内连接，2~8 接口可选。' },
  { icon: '🔄', t: '绝缘帽（扭接）', level: '常用', d: '将多股线绞合后旋上绝缘帽，施工快，适合照明回路细线接头。' },
  { icon: '📦', t: '接线盒内接头', level: '规范', d: '所有接线头必须置于标准 86 型接线盒内，严禁裸露在墙体或管道中。' },
  { icon: '⚠️', t: '直接缠绕绝缘胶带', level: '临时', d: '仅限临时应急，正式工程不允许，胶带老化后绝缘失效有安全风险。' },
];

export default function Wiring() {
  const [selWire, setSelWire] = useState('2.5');
  const wire = WIRES.find(w => w.id === selWire);

  return (
    <section id="wiring" className="sec">
      <div className="sh">
        <span className="sh-icon">🔌</span>
        <div className="sh-tag">Stage 3 · Wiring Practice</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(0,230,118,.4)` }}>
          导线与接线
        </h2>
        <p className="sh-sub">选对线径、认清颜色、掌握安全接线方法，是家庭电气施工最基础的动手技能。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Wire selector + cross-section */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.2)', flexDirection: 'column', gap: 14 }}>
          <WireCanvas wire={wire} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {WIRES.map(w => (
              <button key={w.id} onClick={() => setSelWire(w.id)} style={{
                padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${selWire === w.id ? ACC : 'rgba(0,230,118,.2)'}`,
                background: selWire === w.id ? 'rgba(0,230,118,.15)' : 'transparent',
                color: selWire === w.id ? ACC : 'var(--dim)',
                font: '12px/1 inherit', transition: 'all .18s',
              }}>{w.mm2} mm²</button>
            ))}
          </div>
        </div>

        {/* Wire selection guide */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            📐 线径选择对照表
          </div>
          <div style={{ background: 'rgba(6,12,28,.7)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,230,118,.14)' }}>
            <div style={{ display: 'flex', padding: '10px 16px', background: 'rgba(0,230,118,.1)', font: 'bold 12px "Courier New",monospace', color: ACC, gap: 0 }}>
              <span style={{ flex: '0 0 60px' }}>截面</span>
              <span style={{ flex: '0 0 55px' }}>额定A</span>
              <span style={{ flex: 1 }}>适用场景</span>
            </div>
            {WIRES.map((w, i) => (
              <div key={w.id} onClick={() => setSelWire(w.id)} style={{
                display: 'flex', padding: '10px 16px', cursor: 'pointer',
                borderTop: '1px solid rgba(255,255,255,.05)',
                background: selWire === w.id ? 'rgba(0,230,118,.08)' : i % 2 === 0 ? 'rgba(0,230,118,.02)' : 'transparent',
                transition: 'background .18s',
              }}>
                <span style={{ flex: '0 0 60px', color: w.insColor, font: 'bold 13px "Courier New",monospace' }}>{w.mm2}</span>
                <span style={{ flex: '0 0 55px', color: ACC, font: '13px "Courier New",monospace' }}>{w.rated}A</span>
                <span style={{ flex: 1, fontSize: 13, color: '#8aacb8' }}>{w.use}</span>
              </div>
            ))}
          </div>
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.15)', marginTop: 8 }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10 }}>⚙️ 选线原则</div>
            {['按用途选线，不允许超额定电流使用','实际负载功率 ÷ 220V = 电流，乘以 1.25 安全裕量后选型','同一管内穿多根线时，载流量需降额使用','铜线与铝线严禁直接连接，需使用铜铝过渡接头'].map(t => (
              <div key={t} style={{ fontSize: 13, color: '#8aacb8', display: 'flex', gap: 8, marginBottom: 7, lineHeight: 1.5 }}>
                <span style={{ color: ACC, flexShrink: 0 }}>▸</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wire color coding */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          🎨 导线颜色规范（GB/T 6995）
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {COLORS.map(c => (
            <div key={c.name} className="glass reveal" style={{ borderColor: `${c.c}33`, flexDirection: 'row', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 16, minWidth: 16, height: 70, borderRadius: 8, background: c.c, border: '2px solid rgba(255,255,255,.15)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#c8dce8', fontSize: 13, marginBottom: 4 }}>{c.name}</div>
                <div style={{ color: c.c, font: 'bold 12px "Courier New",monospace', marginBottom: 5 }}>{c.role}</div>
                <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.55 }}>{c.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection methods */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          🔗 接线方式对比
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {JOIN_METHODS.map(m => (
            <div key={m.t} className="glass reveal" style={{
              borderColor: m.level === '推荐' ? 'rgba(0,230,118,.22)' : m.level === '临时' ? 'rgba(255,23,68,.22)' : 'rgba(255,255,255,.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <span style={{
                  fontSize: 11, padding: '2px 10px', borderRadius: 20,
                  background: m.level === '推荐' ? 'rgba(0,230,118,.18)' : m.level === '临时' ? 'rgba(255,23,68,.18)' : 'rgba(255,171,0,.18)',
                  color: m.level === '推荐' ? ACC : m.level === '临时' ? '#ff1744' : '#ffab00',
                  border: `1px solid ${m.level === '推荐' ? 'rgba(0,230,118,.35)' : m.level === '临时' ? 'rgba(255,23,68,.35)' : 'rgba(255,171,0,.35)'}`,
                }}>{m.level}</span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 7, fontSize: 14 }}>{m.t}</div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.65 }}>{m.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step guide */}
      <div style={{ marginTop: 40, background: 'rgba(0,230,118,.06)', border: '1px solid rgba(0,230,118,.2)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 16, fontSize: 15 }}>🛠️ 标准接线步骤（以接线端子为例）</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            ['1', '断电确认', '先关断对应断路器，用验电笔确认线路无电后再操作'],
            ['2', '剥线', '用剥线钳剥去 8~12mm 绝缘层，剥口整齐，不伤导体'],
            ['3', '处理线头', '多股线先将铜丝拧紧顺向，避免散股短路；单股无需处理'],
            ['4', '插入端子', '将线头完全插入端子孔，确认绝缘皮没有进入夹口内'],
            ['5', '紧固螺丝', '用螺丝刀拧紧固定螺丝，力道适中，过紧会损伤导线'],
            ['6', '拉力测试', '轻拉导线检查是否松动，稳固后合上接线盒盖'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(0,230,118,.18)', border: '1px solid rgba(0,230,118,.5)',
                color: ACC, font: 'bold 12px monospace',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{n}</div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: 4, fontSize: 13 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
