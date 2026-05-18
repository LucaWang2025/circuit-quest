import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00bcd4';

function FridgeCanvas({ stateRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const st = stateRef.current;
      const running = st === 'cooling';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = running ? 'rgba(0,188,212,.45)' : 'rgba(60,70,90,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(running ? '压缩机运转 · 制冷剂循环 · 蒸发 → 冷凝' : '待机 · 温控器断路 · 压缩机停', W / 2, 27);

      // 制冷循环：压缩机(左) → 冷凝器(右上) → 毛细管(右) → 蒸发器(左下)
      const comp = { x: 80, y: 200 };
      const cond = { x: 340, y: 90 };
      const evap = { x: 80, y: 100 };

      // ── 制冷剂流动路径 ──
      const flowColor = running ? `rgba(255,107,53,${0.6 + 0.2 * Math.sin(t * 4)})` : 'rgba(80,90,110,.25)';
      ctx.strokeStyle = flowColor; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(comp.x + 28, comp.y - 15);
      ctx.bezierCurveTo(comp.x + 100, comp.y - 80, cond.x - 80, cond.y - 20, cond.x - 28, cond.y);
      ctx.stroke();
      // 冷凝→蒸发
      ctx.beginPath();
      ctx.moveTo(cond.x, cond.y + 28);
      ctx.bezierCurveTo(cond.x - 20, evap.y + 80, evap.x + 80, evap.y + 20, evap.x + 28, evap.y);
      ctx.stroke();
      // 蒸发→压缩
      ctx.beginPath();
      ctx.moveTo(evap.x, evap.y + 28);
      ctx.lineTo(comp.x, comp.y - 28);
      ctx.stroke();

      // 动态粒子
      if (running) {
        const pts = [
          { x0: comp.x + 28, y0: comp.y - 15, x1: cond.x - 28, y1: cond.y, color: '#ff7043' },
          { x0: cond.x, y0: cond.y + 28, x1: evap.x + 28, y1: evap.y, color: '#00bcd4' },
          { x0: evap.x, y0: evap.y + 28, x1: comp.x, y1: comp.y - 28, color: '#00e5ff' },
        ];
        pts.forEach(({ x0, y0, x1, y1, color }, i) => {
          const frac = (t * 0.6 + i * 0.33) % 1;
          const px = x0 + (x1 - x0) * frac, py = y0 + (y1 - y0) * frac;
          ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // ── 压缩机 ──
      const compOn = running;
      const shake = compOn ? Math.sin(t * 20) * 1.5 : 0;
      ctx.fillStyle = '#2a3545'; ctx.strokeStyle = compOn ? ACC : '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(comp.x + shake * 0.3, comp.y, 28, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = compOn ? ACC : '#556'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('压缩机', comp.x, comp.y - 2);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText(compOn ? '运转' : '停', comp.x, comp.y + 11);
      // 启动电容（标注）
      ctx.fillStyle = '#556'; ctx.font = '8px monospace';
      ctx.fillText('⊣| 启动电容', comp.x + 38, comp.y + 35);

      // ── 冷凝器（散热片）──
      ctx.strokeStyle = running ? 'rgba(255,107,53,.6)' : 'rgba(80,90,110,.3)'; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(cond.x - 30 + i * 12, cond.y - 25); ctx.lineTo(cond.x - 30 + i * 12, cond.y + 25); ctx.stroke();
      }
      ctx.fillStyle = '#2a3040'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(cond.x - 35, cond.y - 28, 70, 56, 6); ctx.stroke();
      ctx.fillStyle = running ? '#ff7043' : '#556'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('冷凝器', cond.x, cond.y - 4);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText('高压散热', cond.x, cond.y + 10);

      // ── 蒸发器（冷却箱）──
      ctx.fillStyle = running ? 'rgba(0,229,255,.06)' : 'transparent';
      ctx.strokeStyle = running ? 'rgba(0,229,255,.5)' : 'rgba(80,90,110,.3)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(evap.x - 35, evap.y - 28, 70, 56, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = running ? '#00e5ff' : '#556'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('蒸发器', evap.x, evap.y - 4);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText('吸热制冷', evap.x, evap.y + 10);

      // ── 毛细管（节流）──
      ctx.strokeStyle = '#667'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(cond.x - 35, cond.y + 28); ctx.lineTo(evap.x + 35, evap.y + 20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#667'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('毛细管（节流降压）', 230, 175);

      // ── 温控器（右下）──
      const tcX = 360, tcY = 220;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = running ? '#00e676' : '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(tcX - 35, tcY - 20, 70, 40, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = running ? '#00e676' : '#ff5252'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('温控器', tcX, tcY - 4);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText(running ? '接通' : '断路', tcX, tcY + 10);

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = running ? `rgba(0,188,212,${0.7 + 0.3 * Math.sin(t * 3)})` : 'rgba(100,120,145,.6)';
      ctx.fillText(running ? '制冷剂：压缩(高压气) → 冷凝(液) → 节流(低压液) → 蒸发(吸热气)' : '箱温达设定值 → 温控器断路 → 压缩机停机', W / 2, H - 10);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stateRef]);

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

export default function Fridge() {
  const [state, setState] = useState('idle');
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  const btn = (active) => ({
    padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${active ? ACC : 'rgba(255,255,255,.12)'}`,
    background: active ? ACC + '22' : 'rgba(255,255,255,.04)',
    color: active ? ACC : 'rgba(255,255,255,.5)', font: '13px/1 inherit',
  });

  return (
    <section id="fridge" className="sec">
      <div className="sh">
        <span className="sh-icon">🧊</span>
        <div>
          <div className="sh-tag">REFRIGERATOR · 制冷循环 · 压缩机电路</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>冰箱压缩机</h2>
          <p className="sh-sub">制冷剂四态循环 + 启动电容 + 温控器——冰箱电路全解析</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 14 }}>
          <FridgeCanvas stateRef={stateRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={btn(state === 'cooling')} onClick={() => setState('cooling')}>❄️ 压缩机运转</button>
            <button style={btn(state === 'idle')} onClick={() => setState('idle')}>⏸ 停机（达温）</button>
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,188,212,.18)' }}>
            <div className="formula" style={{ color: ACC }}>压缩 → 冷凝 → 节流 → 蒸发</div>
            <div className="fdesc">逆卡诺循环：消耗电功 → 搬运热量</div>
          </div>
          <ICard color={ACC} title="💧 制冷剂四态循环">
            ① <strong style={{ color: '#ff7043' }}>压缩机</strong>：气体升温升压 → ② <strong style={{ color: '#ff7043' }}>冷凝器</strong>：散热液化（后板发热正常）→
            ③ <strong style={{ color: ACC }}>毛细管</strong>：节流降压 → ④ <strong style={{ color: '#00e5ff' }}>蒸发器</strong>：液体汽化吸热制冷
          </ICard>
          <ICard color={ACC} title="⚡ 压缩机启动电路">
            单相感应电机需要<strong>启动电容</strong>（15~30μF）在启动绕组产生相位差，
            形成旋转磁场。启动后PTC热敏电阻或继电器切断启动绕组，仅运行绕组工作。
          </ICard>
          <ICard color={ACC} title="🌡️ 温控器工作">
            温控感温管感知箱温，<strong>到达设定低温</strong> → 双金属片弯曲 → 触点断开 → 压缩机停；
            箱温回升 → 触点复位 → 启动。电子控温冰箱用 NTC + MCU 精确控制。
          </ICard>
          <ICard color="#ff5252" title="⚠️ 常见故障">
            不制冷→检测压缩机启动（万用表测启动绕组 6~12Ω）；压缩机频繁启停→温控器故障；
            后壁不烫→制冷剂泄漏需加氟（R600a 环保冷媒，勿接触明火）。
          </ICard>
        </div>
      </div>
    </section>
  );
}
