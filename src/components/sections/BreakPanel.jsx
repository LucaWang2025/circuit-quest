import { useEffect, useRef, useState } from 'react';

const ACC = '#00e676';

// ── 配电箱 Canvas ────────────────────────────────────────────
function BreakPanelCanvas({ tripped, onTrip }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 360, H = 300;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, rafId;

    // 各支路定义
    const CIRCUITS = [
      { id: 'lighting', label: '照明', amp: '10A', color: '#ffd740', x: 110 },
      { id: 'outlet',   label: '插座', amp: '16A', color: '#64b5f6', x: 155 },
      { id: 'aircon',   label: '空调', amp: '20A', color: '#4dd0e1', x: 200 },
      { id: 'kitchen',  label: '厨房', amp: '20A', color: '#ff8a65', x: 245 },
      { id: 'heater',   label: '热水', amp: '25A', color: '#ce93d8', x: 290 },
    ];

    // 粒子系统
    const particles = [];
    function spawnParticle(circuit) {
      if (tripped.includes(circuit.id)) return;
      particles.push({
        cid: circuit.id,
        x: 72, y: 72, // 从总开关出发
        tx: circuit.x + 10, // 目标 x（支路中心）
        ty: 240, // 目标 y（底端）
        prog: 0,
        speed: 0.008 + Math.random() * 0.006,
        color: circuit.color,
        alpha: 0.9,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      // 背景面板
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0d1b2a');
      bg.addColorStop(1, '#071020');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(10, 10, W - 20, H - 20, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(0,230,118,.18)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(10, 10, W - 20, H - 20, 12); ctx.stroke();

      // ── 进线 (从顶部) ──
      ctx.strokeStyle = 'rgba(255,230,100,.4)'; ctx.lineWidth = 3;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(72, 20); ctx.lineTo(72, 55); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,230,100,.5)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('进线', 72, 38);

      // ── 总开关 (双极2P) ──
      const mxl = 48, mxr = 96, my = 55, mh = 40;
      const mainTripped = tripped.includes('main');
      const mainGrad = ctx.createLinearGradient(mxl, my, mxr, my + mh);
      mainGrad.addColorStop(0, mainTripped ? '#444' : '#1a6b3a');
      mainGrad.addColorStop(1, mainTripped ? '#222' : '#0d3d21');
      ctx.fillStyle = mainGrad;
      ctx.beginPath(); ctx.roundRect(mxl, my, mxr - mxl, mh, 6); ctx.fill();
      ctx.strokeStyle = mainTripped ? '#555' : ACC;
      ctx.lineWidth = mainTripped ? 1 : 1.5;
      ctx.shadowColor = mainTripped ? 'transparent' : ACC; ctx.shadowBlur = mainTripped ? 0 : 8;
      ctx.stroke(); ctx.shadowBlur = 0;

      ctx.fillStyle = mainTripped ? '#888' : '#e8f5e9'; ctx.font = 'bold 11px inherit'; ctx.textAlign = 'center';
      ctx.fillText('总开关 2P', 72, 72);
      ctx.fillStyle = mainTripped ? '#f44' : ACC; ctx.font = '10px "Courier New",monospace';
      ctx.fillText(mainTripped ? '已断' : '63A', 72, 86);

      // ── 母线 ──
      if (!mainTripped) {
        ctx.strokeStyle = `rgba(0,230,118,${0.45 + 0.15 * Math.sin(t * 2)})`; ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = 'rgba(100,100,100,.3)'; ctx.lineWidth = 1.5;
      }
      ctx.beginPath(); ctx.moveTo(72, 95); ctx.lineTo(72, 118);
      ctx.lineTo(310, 118); ctx.stroke();

      // ── 各支路断路器 ──
      CIRCUITS.forEach(c => {
        const isTripped = tripped.includes(c.id);
        const bx = c.x - 20, by = 128, bw = 38, bh = 52;

        // 导线从母线向下
        if (!mainTripped && !isTripped) {
          ctx.strokeStyle = `rgba(${hexToRgb(c.color)},0.4)`;
        } else {
          ctx.strokeStyle = 'rgba(80,80,80,.25)';
        }
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(c.x + 10, 118); ctx.lineTo(c.x + 10, by); ctx.stroke();

        // 断路器主体
        const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
        if (isTripped || mainTripped) {
          grad.addColorStop(0, '#333'); grad.addColorStop(1, '#1a1a1a');
        } else {
          grad.addColorStop(0, '#1a3a50'); grad.addColorStop(1, '#0d2030');
        }
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.fill();
        ctx.strokeStyle = isTripped ? '#f44336' : (mainTripped ? '#444' : `rgba(${hexToRgb(c.color)},0.5)`);
        ctx.lineWidth = 1; ctx.shadowBlur = isTripped ? 0 : 6;
        ctx.shadowColor = isTripped ? 'transparent' : c.color;
        ctx.stroke(); ctx.shadowBlur = 0;

        // 把手
        const handleY = isTripped ? by + bh * 0.65 : by + bh * 0.35;
        ctx.fillStyle = isTripped ? '#f44336' : (mainTripped ? '#555' : c.color);
        ctx.beginPath(); ctx.roundRect(bx + 10, handleY, bw - 20, 8, 3); ctx.fill();

        // 文字
        ctx.fillStyle = isTripped ? '#f44' : (mainTripped ? '#555' : c.color); ctx.font = 'bold 9px inherit'; ctx.textAlign = 'center';
        ctx.fillText(c.label, c.x + 10, by + bh + 14);
        ctx.fillStyle = isTripped ? '#f44' : (mainTripped ? '#444' : 'rgba(200,220,232,.6)'); ctx.font = '9px "Courier New",monospace';
        ctx.fillText(isTripped ? '跳闸' : c.amp, c.x + 10, by + bh + 26);

        // 出线
        if (!isTripped && !mainTripped) {
          ctx.strokeStyle = `rgba(${hexToRgb(c.color)},0.35)`; ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(c.x + 10, by + bh); ctx.lineTo(c.x + 10, 240); ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // ── 粒子流 ──
      if (Math.random() < 0.18) {
        const active = CIRCUITS.filter(c => !tripped.includes(c.id) && !tripped.includes('main'));
        if (active.length) spawnParticle(active[Math.floor(Math.random() * active.length)]);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.prog += p.speed;
        if (p.prog >= 1) { particles.splice(i, 1); continue; }

        // 路径：总开关→母线分叉→支路向下
        let px, py;
        const midPhase = 0.4;
        if (p.prog < midPhase) {
          const rp = p.prog / midPhase;
          px = 72 + (p.tx - 72) * rp;
          py = 95 + (118 - 95) * Math.min(rp * 2, 1);
        } else {
          const rp = (p.prog - midPhase) / (1 - midPhase);
          px = p.tx;
          py = 118 + (p.ty - 118) * rp;
        }
        p.alpha = 1 - p.prog * p.prog;

        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      // 总开关可点击提示
      ctx.fillStyle = 'rgba(100,200,120,.35)'; ctx.font = '9px inherit'; ctx.textAlign = 'center';
      ctx.fillText('点击断路器可跳闸', W / 2, H - 14);

      rafId = requestAnimationFrame(draw);
    }
    draw();

    // 点击检测
    function onClick(e) {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const my = (e.clientY - rect.top) * (H / rect.height);

      // 总开关
      if (mx >= 48 && mx <= 96 && my >= 55 && my <= 95) { onTrip('main'); return; }
      // 各支路
      CIRCUITS.forEach(c => {
        if (mx >= c.x - 20 && mx <= c.x + 18 && my >= 128 && my <= 180) onTrip(c.id);
      });
    }
    cv.addEventListener('click', onClick);
    return () => { cancelAnimationFrame(rafId); cv.removeEventListener('click', onClick); };
  }, [tripped, onTrip]);

  return <canvas ref={ref} style={{ maxWidth: '100%', cursor: 'pointer', borderRadius: 10 }} />;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── 数据 ──────────────────────────────────────────────────────
const CIRCUIT_DESIGNS = [
  { icon: '💡', name: '照明回路', amp: '10A', wire: '1.5mm²', mcb: '1P 10A', desc: '全屋灯具，建议按楼层或区域分组，方便维修。' },
  { icon: '🔌', name: '普通插座', amp: '16A', wire: '2.5mm²', mcb: '1P 16A', desc: '客厅、卧室普通插座，建议带漏电保护（ELCB）。' },
  { icon: '❄️', name: '空调专线', amp: '20A', wire: '2.5mm²', mcb: '2P 20A', desc: '每台空调独立回路，2P断路器，插座高位安装。' },
  { icon: '🍳', name: '厨房大功率', amp: '20A', wire: '4mm²', mcb: '2P 20A', desc: '微波炉/电烤箱等大功率，建议4mm²加强截面。' },
  { icon: '🚿', name: '热水器专线', amp: '25A', wire: '4mm²', mcb: '2P 25A', desc: '独立回路+漏电保护，浴室内挂防水型断路器。' },
];

const RCD_TYPES = [
  { type: '总RCD', pos: '进户总开关后', size: '63A 30mA', pros: '全屋保护，单点安装', cons: '误动作影响全屋', badge: '常用' },
  { type: '分路RCD', pos: '各支路断路器上', size: '16~25A 30mA', pros: '精准隔离，故障定位快', cons: '成本高，安装多', badge: '推荐' },
];

export default function BreakPanel() {
  const [tripped, setTripped] = useState([]);

  function handleTrip(id) {
    setTripped(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function resetAll() { setTripped([]); }

  return (
    <section id="break-panel" className="sec">
      <div className="sh">
        <span className="sh-icon">🔲</span>
        <div className="sh-tag">Stage 6 · Distribution Panel</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(0,230,118,.4)` }}>
          家用配电箱详解
        </h2>
        <p className="sh-sub">配电箱是家庭电气系统的"心脏"，合理设计回路是用电安全的第一道防线。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Canvas + 结构说明 */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.2)', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <BreakPanelCanvas tripped={tripped} onTrip={handleTrip} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={resetAll} style={{
              padding: '6px 18px', borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${ACC}`, background: 'rgba(0,230,118,.12)',
              color: ACC, font: '12px/1 inherit', transition: 'all .18s',
            }}>↺ 全部复位</button>
            <span style={{ fontSize: 12, color: 'var(--dim)', alignSelf: 'center' }}>点击断路器模拟跳闸/复位</span>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            📦 配电箱结构层级
          </div>
          {[
            { step: '①', label: '进线', desc: '电网→电表→进户总保险→配电箱', color: '#ffd740' },
            { step: '②', label: '总开关（2P）', desc: '双极断路器，同时切断火线和零线，63A规格', color: ACC },
            { step: '③', label: '分路保护', desc: '各支路1P/2P MCB，漏电保护RCD', color: '#64b5f6' },
            { step: '④', label: '出线', desc: '穿管入墙，到各末端插座/灯具', color: '#ff8a65' },
          ].map(s => (
            <div key={s.step} className="glass reveal" style={{ borderColor: `${s.color}22`, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                background: `${s.color}18`, border: `1px solid ${s.color}55`,
                color: s.color, font: 'bold 12px monospace',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: 13, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 各回路设计 */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          ⚡ 典型回路配置
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {CIRCUIT_DESIGNS.map(c => (
            <div key={c.name} className="glass reveal" style={{ borderColor: 'rgba(0,230,118,.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(0,230,118,.12)', color: ACC, border: '1px solid rgba(0,230,118,.3)' }}>{c.mcb}</span>
              </div>
              <div style={{ fontWeight: 700, color: '#c8dce8', fontSize: 14, marginBottom: 6 }}>{c.name}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'rgba(255,215,64,.1)', color: '#ffd740' }}>导线 {c.wire}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'rgba(100,181,246,.1)', color: '#64b5f6' }}>保护 {c.amp}</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 选型公式 */}
      <div style={{ marginTop: 36, background: 'rgba(0,230,118,.05)', border: '1px solid rgba(0,230,118,.2)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 16, fontSize: 15 }}>📐 断路器选型计算公式</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: 8, fontSize: 13 }}>① 额定电流计算</div>
            <div style={{ background: 'rgba(0,0,0,.4)', borderRadius: 10, padding: '12px 16px', fontFamily: '"Courier New",monospace', fontSize: 13, color: '#ffd740', border: '1px solid rgba(255,215,64,.15)' }}>
              I = P ÷ 220 × 1.25<br />
              <span style={{ color: '#8aacb8' }}>I：选定电流(A)</span><br />
              <span style={{ color: '#8aacb8' }}>P：总负载功率(W)</span><br />
              <span style={{ color: '#8aacb8' }}>1.25：安全系数</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: 8, fontSize: 13 }}>② 保护配合要求</div>
            <div style={{ background: 'rgba(0,0,0,.4)', borderRadius: 10, padding: '12px 16px', fontFamily: '"Courier New",monospace', fontSize: 13, color: '#4dd0e1', border: '1px solid rgba(77,208,225,.15)' }}>
              总开关 ≥ Σ分路电流 × 0.7<br />
              总 &gt; 分路（时间级差配合）<br />
              <span style={{ color: '#8aacb8' }}>RCD动作时间：≤ 0.1s</span><br />
              <span style={{ color: '#8aacb8' }}>漏电电流阈值：30mA</span>
            </div>
          </div>
        </div>
      </div>

      {/* 漏电保护器 RCD */}
      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: ACC, marginBottom: 16 }}>🛡️ 漏电保护器（RCD）安装策略</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {RCD_TYPES.map(r => (
            <div key={r.type} className="glass reveal" style={{ borderColor: 'rgba(0,230,118,.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, color: ACC, fontSize: 15 }}>{r.type}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(0,230,118,.12)', color: ACC, border: '1px solid rgba(0,230,118,.3)' }}>{r.badge}</span>
              </div>
              <div style={{ marginBottom: 6, fontSize: 12, color: '#8aacb8' }}>安装位置：{r.pos}</div>
              <div style={{ marginBottom: 10, fontSize: 12, color: '#64b5f6', fontFamily: '"Courier New",monospace' }}>规格：{r.size}</div>
              <div style={{ fontSize: 12, color: '#a8d5a2', marginBottom: 4 }}>✓ {r.pros}</div>
              <div style={{ fontSize: 12, color: '#ffab78' }}>⚠ {r.cons}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 品牌识别 + 维修注意 */}
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="glass reveal" style={{ borderColor: 'rgba(0,230,118,.12)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 12, fontSize: 14 }}>🏭 常见品牌识别</div>
          {[
            { brand: '施耐德 Schneider', origin: '法系', note: 'iC65N 系列，工程首选，铭牌含Ue/Ie/Ics参数' },
            { brand: 'ABB', origin: '瑞士系', note: 'SH200/S200系列，轻工业和家用均有，断开容量强' },
            { brand: '正泰 CHINT', origin: '国产', note: 'NXB系列，性价比高，广泛用于住宅工程' },
            { brand: '德力西 DELIXI', origin: '国产', note: 'CDM3系列，认证齐全，含3C强制认证' },
          ].map(b => (
            <div key={b.brand} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ color: ACC, flexShrink: 0, fontSize: 13 }}>▸</span>
              <div>
                <span style={{ color: '#c8dce8', fontWeight: 600, fontSize: 13 }}>{b.brand}</span>
                <span style={{ color: '#ffd740', fontSize: 11, marginLeft: 6, padding: '1px 6px', borderRadius: 6, background: 'rgba(255,215,64,.1)' }}>{b.origin}</span>
                <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.5, marginTop: 2 }}>{b.note}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,82,82,.15)' }}>
          <div style={{ fontWeight: 700, color: '#ff5252', marginBottom: 12, fontSize: 14 }}>⚠️ 维修操作规范</div>
          {[
            '更换断路器前，必须先断开总开关，再用验电笔确认无电',
            '拆卸断路器时，先松出线端螺丝，再松进线端',
            '同型号断路器替换时，核对额定电压、额定电流和断开容量',
            '更换后合闸，先试验RCD动作按钮，确认漏电保护正常',
            '任何操作均不得带电进行，严禁带电更换断路器',
          ].map(tip => (
            <div key={tip} style={{ fontSize: 12.5, color: '#8aacb8', display: 'flex', gap: 8, marginBottom: 8, lineHeight: 1.55 }}>
              <span style={{ color: '#ff5252', flexShrink: 0 }}>!</span>{tip}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
