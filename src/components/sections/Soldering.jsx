import { useEffect, useRef, useState } from 'react';

const ACC = '#ff6b35';

const DEFECT_TYPES = [
  { id: 'good',   label: '✓ 良好焊点', color: '#c8c8c8' },
  { id: 'cold',   label: '✗ 冷焊',     color: '#888' },
  { id: 'bridge', label: '✗ 短路拉丝', color: '#aaa' },
  { id: 'burnt',  label: '✗ 过烧发黑', color: '#333' },
];

const TOOLS = [
  { icon: '🔌', name: '温控烙铁', spec: '60W 可调温，350°C' },
  { icon: '🧵', name: '无铅焊锡丝', spec: '0.8mm 含芯锡膏 Sn96.5' },
  { icon: '🔧', name: '吸锡器', spec: '弹簧式，拆焊必备' },
  { icon: '💧', name: '助焊剂', spec: '松香基，改善润湿性' },
  { icon: '🧽', name: '清洁海绵', spec: '湿润后擦拭烙铁头' },
  { icon: '🔩', name: '尖嘴钳', spec: '固定元件引脚' },
];

const STEPS = [
  { n: '01', title: '清洁焊盘', desc: '用酒精棉球擦拭焊盘，去除氧化层和污垢，确保焊锡良好润湿。' },
  { n: '02', title: '预热焊盘', desc: '烙铁头同时接触元件引脚与焊盘，预热 1~2 秒，温度均匀传导。' },
  { n: '03', title: '送入焊锡', desc: '焊锡丝从烙铁对侧送入（非烙铁上），锡量以刚好覆盖焊盘为准。' },
  { n: '04', title: '撤锡丝', desc: '达到足量后先撤走焊锡丝，不要拖拉，避免产生毛刺。' },
  { n: '05', title: '撤烙铁', desc: '沿引脚方向平稳撤走烙铁，总加热时间控制在 2~3 秒内。' },
  { n: '06', title: '自然冷却', desc: '禁止吹气或扇风！让焊点自然冷却，避免形成冷焊点（哑光）。' },
];

const DEFECTS = [
  { name: '虚焊', shape: 'dull',   desc: '表面哑光、球状，引脚未充分润湿，接触电阻大，时好时坏。' },
  { name: '冷焊', shape: 'crack',  desc: '表面有裂纹，冷却时受到振动，机械强度差，须重新加热。' },
  { name: '短路', shape: 'bridge', desc: '相邻焊盘间有锡桥拉丝，造成短路，用烙铁+助焊剂消除。' },
  { name: '过烧', shape: 'dark',   desc: '焊点发黑碳化，助焊剂烧尽，温度过高或时间过长。' },
];

export default function Soldering() {
  const canvasRef = useRef(null);
  const [defectIdx, setDefectIdx] = useState(0);
  const defectIdxRef = useRef(0);

  useEffect(() => {
    defectIdxRef.current = defectIdx;
  }, [defectIdx]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 340, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    // Particles for heat/smoke
    const particles = Array.from({ length: 20 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2,
    }));

    let frame = 0;
    let phase = 0; // 0=approach, 1=heat, 2=tin, 3=done
    let phaseProg = 0;
    let ironX = 240, ironY = 60;
    const padX = 170, padY = 155;
    let tinFlowAmt = 0;
    let rafId;

    function spawnSmoke(x, y) {
      const p = particles.find(p => p.life <= 0);
      if (!p) return;
      p.x = x + (Math.random() - 0.5) * 6;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 0.4;
      p.vy = -(0.5 + Math.random() * 0.8);
      p.life = 1; p.maxLife = 1;
      p.size = 1.5 + Math.random() * 2;
    }

    function drawBackground() {
      // Dark workbench
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0d1117');
      bg.addColorStop(1, '#1a1f2e');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // PCB board
      const pcbGrad = ctx.createLinearGradient(60, 100, 60, 200);
      pcbGrad.addColorStop(0, '#1a3a1a');
      pcbGrad.addColorStop(1, '#0d2010');
      ctx.fillStyle = pcbGrad;
      ctx.beginPath();
      ctx.roundRect(60, 100, 220, 100, 6);
      ctx.fill();
      ctx.strokeStyle = '#2a5a2a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // PCB grid dots
      ctx.fillStyle = 'rgba(100,200,100,0.15)';
      for (let gx = 80; gx < 280; gx += 20) {
        for (let gy = 115; gy < 195; gy += 20) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Copper traces
      ctx.strokeStyle = 'rgba(205,165,50,0.4)';
      ctx.lineWidth = 2;
      [[100, 135, 240, 135], [100, 165, 240, 165]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      });

      // Solder pads
      [padX - 30, padX, padX + 30].forEach((px, i) => {
        // Pad ring
        ctx.fillStyle = i === 1 ? '#c87820' : '#9a6010';
        ctx.beginPath(); ctx.arc(px, padY, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0d2010';
        ctx.beginPath(); ctx.arc(px, padY, 3.5, 0, Math.PI * 2); ctx.fill();
      });
    }

    function drawIron(x, y, heat) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);

      // Handle
      const hGrad = ctx.createLinearGradient(-4, -80, 4, -80);
      hGrad.addColorStop(0, '#444'); hGrad.addColorStop(1, '#222');
      ctx.fillStyle = hGrad;
      ctx.beginPath(); ctx.roundRect(-5, -90, 10, 60, 3); ctx.fill();

      // Barrel
      ctx.fillStyle = '#666';
      ctx.beginPath(); ctx.roundRect(-4, -30, 8, 35, 2); ctx.fill();

      // Tip glow
      const heatColor = heat > 0.5
        ? `rgba(255,${Math.floor(150 - heat * 100)},0,${heat})`
        : 'rgba(200,200,200,0.3)';
      ctx.shadowColor = ACC;
      ctx.shadowBlur = heat * 15;
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(-3, 5); ctx.lineTo(3, 5); ctx.lineTo(0, 18); ctx.closePath();
      ctx.fill();
      if (heat > 0.3) {
        ctx.fillStyle = heatColor;
        ctx.beginPath();
        ctx.moveTo(-2, 6); ctx.lineTo(2, 6); ctx.lineTo(0, 17); ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawTinDrop(x, y, amt) {
      if (amt <= 0) return;
      const r = amt * 10;
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#d0d0d0');
      grad.addColorStop(1, '#888888');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawDefectPanel() {
      const types = DEFECT_TYPES;
      const startX = 20, startY = 10;
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('焊点质量对比', startX, startY + 10);

      types.forEach((t, i) => {
        const bx = startX + i * 76;
        const by = startY + 20;
        const isActive = defectIdxRef.current === i;

        ctx.fillStyle = isActive ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.roundRect(bx, by, 68, 70, 6); ctx.fill();
        if (isActive) {
          ctx.strokeStyle = ACC; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.roundRect(bx, by, 68, 70, 6); ctx.stroke();
        }

        // Draw solder joint shape
        const cx2 = bx + 34, cy2 = by + 42;
        const idx = defectIdxRef.current;
        drawMiniJoint(ctx, cx2, cy2, i, i === idx);

        ctx.font = '9px monospace';
        ctx.fillStyle = isActive ? ACC : 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText(t.label.split(' ').slice(1).join(' '), cx2, by + 65);
        ctx.textAlign = 'left';
      });
    }

    function drawMiniJoint(c, x, y, type, active) {
      c.save();
      const pulse = active ? 1 + Math.sin(frame * 0.08) * 0.06 : 1;
      switch (type) {
        case 0: { // Good
          const g = c.createRadialGradient(x - 3, y - 3, 0, x, y, 12 * pulse);
          g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#d4d4d4'); g.addColorStop(1, '#888');
          c.fillStyle = g;
          c.beginPath(); c.arc(x, y, 12 * pulse, 0, Math.PI * 2); c.fill();
          // Highlight
          c.fillStyle = 'rgba(255,255,255,0.7)';
          c.beginPath(); c.arc(x - 4, y - 4, 4, 0, Math.PI * 2); c.fill();
          break;
        }
        case 1: { // Cold solder
          c.fillStyle = active ? '#aaaaaa' : '#777';
          c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); c.fill();
          c.strokeStyle = '#666'; c.lineWidth = 1;
          for (let a = 0; a < 5; a++) {
            const angle = a * 1.2 + 0.3;
            const r = 5 + ((Math.sin(a * 127.1) * 0.5 + 0.5) * 4);
            c.beginPath();
            c.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
            c.lineTo(x + Math.cos(angle + 0.4) * (r + 2), y + Math.sin(angle + 0.4) * (r + 2));
            c.stroke();
          }
          break;
        }
        case 2: { // Bridge
          c.fillStyle = '#aaa';
          c.beginPath(); c.arc(x - 8, y, 7, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(x + 8, y, 7, 0, Math.PI * 2); c.fill();
          c.fillStyle = active ? '#cc8800' : '#996600';
          c.beginPath();
          c.moveTo(x - 4, y - 2); c.lineTo(x + 4, y - 2);
          c.lineTo(x + 3, y + 2); c.lineTo(x - 3, y + 2);
          c.closePath(); c.fill();
          break;
        }
        case 3: { // Burnt
          c.fillStyle = '#222';
          c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#333';
          c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill();
          c.strokeStyle = '#444'; c.lineWidth = 0.5;
          for (let r = 4; r < 11; r += 3) {
            c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
          }
          break;
        }
      }
      c.restore();
    }

    function draw() {
      rafId = requestAnimationFrame(draw);
      frame++;
      ctx.clearRect(0, 0, W, H);
      drawBackground();

      // Phase progression
      phaseProg += 0.008;
      if (phaseProg > 1) { phaseProg = 0; phase = (phase + 1) % 4; }
      const t = phaseProg;

      // Iron movement
      let targetX, targetY;
      if (phase === 0) { // Approach
        targetX = padX + 20 + (1 - t) * 60;
        targetY = padY - 30 - (1 - t) * 40;
        ironX += (targetX - ironX) * 0.15;
        ironY += (targetY - ironY) * 0.15;
        tinFlowAmt *= 0.95;
      } else if (phase === 1) { // Heat
        targetX = padX + 18;
        targetY = padY - 28;
        ironX += (targetX - ironX) * 0.1;
        ironY += (targetY - ironY) * 0.1;
        if (frame % 3 === 0) spawnSmoke(ironX - 5, ironY - 15);
      } else if (phase === 2) { // Tin
        targetX = padX + 18;
        targetY = padY - 28;
        ironX += (targetX - ironX) * 0.1;
        ironY += (targetY - ironY) * 0.1;
        tinFlowAmt = Math.min(1, tinFlowAmt + 0.025);
        if (frame % 2 === 0) spawnSmoke(padX, padY - 8);
      } else { // Done - retract
        targetX = padX + 40 + t * 60;
        targetY = padY - 30 - t * 40;
        ironX += (targetX - ironX) * 0.1;
        ironY += (targetY - ironY) * 0.1;
      }

      const heatLevel = (phase === 1 || phase === 2) ? 0.8 + Math.sin(frame * 0.1) * 0.2 : 0.3;

      // Draw tin joint forming
      if (tinFlowAmt > 0) {
        drawTinDrop(padX, padY, tinFlowAmt * 0.9);
      }

      drawIron(ironX, ironY, heatLevel);

      // Update & draw smoke particles
      particles.forEach(p => {
        if (p.life <= 0) return;
        p.life -= 0.015;
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.98;
        const alpha = p.life * 0.4;
        ctx.fillStyle = `rgba(200,180,160,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });

      // Phase label
      const phaseLabels = ['接近焊盘…', '预热中…', '送入焊锡…', '冷却完成'];
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = ACC;
      ctx.fillText(phaseLabels[phase], 20, H - 15);

      // Progress bar
      ctx.fillStyle = 'rgba(255,107,53,0.2)';
      ctx.fillRect(20, H - 8, 200, 3);
      ctx.fillStyle = ACC;
      ctx.fillRect(20, H - 8, 200 * phaseProg, 3);

      // Defect panel (top)
      drawDefectPanel();
    }

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section id="soldering" className="sec">
      {/* Header */}
      <div className="sh">
        <span className="sh-icon" style={{ color: ACC }}>🔥</span>
        <div>
          <div className="sh-title">焊接工艺实操</div>
          <div className="sh-tag" style={{ color: ACC }}>进阶动手 · 手工焊接</div>
        </div>
      </div>

      <div className="divider" />

      {/* Canvas + Defect selector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid rgba(255,107,53,0.2)' }} />

        {/* Defect type buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {DEFECT_TYPES.map((d, i) => (
            <button key={d.id} onClick={() => setDefectIdx(i)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: defectIdx === i ? ACC : 'rgba(255,107,53,0.1)',
              color: defectIdx === i ? '#000' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${defectIdx === i ? ACC : 'rgba(255,107,53,0.3)'}`,
              fontWeight: defectIdx === i ? 'bold' : 'normal', transition: 'all 0.2s',
            }}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Active defect desc */}
        <div style={{
          background: 'rgba(255,107,53,0.08)', border: `1px solid rgba(255,107,53,0.25)`,
          borderRadius: '10px', padding: '10px 16px', fontSize: '13px',
          color: 'rgba(255,255,255,0.8)', maxWidth: '340px', width: '100%',
        }}>
          <b style={{ color: ACC }}>{DEFECTS[defectIdx].name}：</b>
          {DEFECTS[defectIdx].desc}
        </div>
      </div>

      <div className="divider" />

      {/* Tools */}
      <div className="sh-sub">🛠 工具清单</div>
      <div className="grid2">
        {TOOLS.map(t => (
          <div key={t.name} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}>
            <span style={{ fontSize: '24px' }}>{t.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{t.name}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{t.spec}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Temperature info */}
      <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,0.3)', marginBottom: '16px' }}>
        <div className="sh-sub" style={{ marginBottom: '8px' }}>🌡 焊接温度参考</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: '无铅锡熔点', val: '217°C', note: 'Sn96.5Ag3Cu0.5' },
            { label: '烙铁设定', val: '320~350°C', note: '留有超温余量' },
            { label: '加热时间', val: '2~3秒', note: '超时易损焊盘' },
          ].map(item => (
            <div key={item.label} style={{ flex: '1', minWidth: '90px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: ACC, fontFamily: 'monospace' }}>{item.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{item.label}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="sh-sub">📋 标准焊接步骤</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {STEPS.map((s, i) => (
          <div key={i} className="fbox reveal" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="fbox-f" style={{ color: ACC }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>{s.title}</div>
              <div className="fbox-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Desoldering */}
      <div className="divider" />
      <div className="sh-sub">🔁 拆焊技巧</div>
      <div className="grid2">
        {[
          { t: '吸锡器', d: '加热焊点→迅速扣下活塞，一次吸除大量锡。适合 THT 插件拆除。' },
          { t: '热风枪', d: '均匀加热整个元件周边，配合镊子提起。适合 SMD 多引脚 IC。' },
          { t: '铜编织带', d: '将编织带置于焊点上，烙铁加热，毛细吸锡。适合精细清锡。' },
          { t: '拖焊法', d: 'SMD 排阻/排脚：沿引脚方向拖动烙铁，加助焊剂防连锡。' },
        ].map(item => (
          <div key={item.t} className="glass reveal">
            <div style={{ fontWeight: 'bold', color: ACC, fontSize: '13px', marginBottom: '4px' }}>{item.t}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{item.d}</div>
          </div>
        ))}
      </div>

      {/* SMD */}
      <div className="divider" />
      <div className="sh-sub">🔬 SMD 贴片焊接</div>
      <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,0.25)' }}>
        {[
          ['锡膏印刷', '使用钢网将锡膏精确印刷到焊盘，锡膏量均匀是关键。'],
          ['元件贴放', '镊子夹取元件，对准焊盘轻放，确认对位后再进行回流。'],
          ['热风回流', '热风枪 300~320°C，螺旋移动加热，观察锡膏由灰变亮即回流。'],
          ['清洁检查', '无水酒精清除助焊剂残留，显微镜检查虚焊和连锡。'],
        ].map(([title, desc], i) => (
          <div key={i} style={{
            display: 'flex', gap: '10px', marginBottom: '8px',
            paddingBottom: '8px', borderBottom: i < 3 ? '1px solid rgba(255,107,53,0.1)' : 'none',
          }}>
            <div style={{
              minWidth: '22px', height: '22px', borderRadius: '50%',
              background: ACC, color: '#000', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0,
            }}>{i + 1}</div>
            <div>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{title}：</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Safety */}
      <div className="divider" />
      <div className="fbox-note reveal" style={{ borderLeft: `3px solid ${ACC}` }}>
        <div style={{ fontWeight: 'bold', color: ACC, marginBottom: '6px' }}>⚠ 安全注意事项</div>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8' }}>
          <li>保持通风，含铅焊烟有毒，推荐使用排烟风扇或口罩</li>
          <li>烙铁不使用时置于烙铁架，避免灼伤或引发火灾</li>
          <li>焊接后立即洗手，避免铅污染摄入</li>
          <li>长时间不用烙铁，降低温度至 150°C 以延长烙铁头寿命</li>
        </ul>
      </div>
    </section>
  );
}
