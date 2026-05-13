import { useEffect, useRef, useState } from 'react';

const ACC = '#00bcd4';

const CYCLES = ['idle', 'fill', 'wash', 'drain', 'spin'];
const CYCLE_LABELS = { idle: '待机', fill: '进水', wash: '洗涤', drain: '排水', spin: '甩干' };
const CYCLE_COLORS = { idle: '#78909c', fill: '#00bcd4', wash: '#26c6da', drain: '#ff7043', spin: '#ab47bc' };

function WashingCanvas({ cycleIdx, speed }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 360, H = 280;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, raf;
    const cycle = CYCLES[cycleIdx];

    // 水滴粒子（进水时）
    const drops = Array.from({ length: 12 }, () => ({
      x: 178 + (Math.random() - 0.5) * 20, y: 30 + Math.random() * 20,
      vy: 1 + Math.random() * 1.5, alpha: 1,
    }));
    // 泡沫粒子
    const foams = Array.from({ length: 30 }, () => ({
      x: 100 + Math.random() * 160, y: 100 + Math.random() * 100,
      r: 2 + Math.random() * 5, vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3, alpha: 0.4 + Math.random() * 0.4,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.03;

      const cx = 178, cy = 155, R = 95;
      const isWash = cycle === 'wash';
      const isSpin = cycle === 'spin';
      const isFill = cycle === 'fill';
      const isDrain = cycle === 'drain';
      const drumAngle = isWash ? t * (speed / 30) * (Math.sin(t * 0.5) > 0 ? 1 : -1) :
        isSpin ? t * (speed / 8) : 0;

      // ── 机身外壳 ──
      ctx.fillStyle = '#1e2030';
      ctx.beginPath(); ctx.roundRect(cx - 130, 20, 260, 240, 16); ctx.fill();
      ctx.strokeStyle = '#2a2d40'; ctx.lineWidth = 2; ctx.stroke();

      // 控制面板（顶部）
      ctx.fillStyle = '#161824';
      ctx.beginPath(); ctx.roundRect(cx - 130, 20, 260, 32, [16, 16, 0, 0]); ctx.fill();
      // 程控器旋钮
      ctx.fillStyle = '#2a2d40';
      ctx.beginPath(); ctx.arc(cx - 80, 36, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#00bcd4'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('程控', cx - 80, 39);
      // 指示灯
      ['fill', 'wash', 'drain', 'spin'].forEach((c, i) => {
        const lx = cx - 20 + i * 22, ly = 36;
        const active = cycle === c;
        ctx.fillStyle = active ? CYCLE_COLORS[c] : '#333';
        if (active) { ctx.shadowColor = CYCLE_COLORS[c]; ctx.shadowBlur = 8; }
        ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── 滚筒玻璃门圆形 ──
      // 外圈
      ctx.strokeStyle = '#2a2d40'; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(cx, cy, R + 7, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#383a50'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R + 7, 0, Math.PI * 2); ctx.stroke();

      // 水（进水中/洗涤）
      const waterLevel = isFill ? Math.min(0.5, (t % 5) / 5 * 0.5) :
        (isWash || isDrain) ? (isDrain ? Math.max(0, 0.5 - (t % 4) / 4 * 0.5) : 0.45) : 0;
      if (waterLevel > 0) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
        const wY = cy + R - waterLevel * R * 2;
        ctx.fillStyle = isWash ? 'rgba(0,188,212,0.25)' : 'rgba(100,160,220,0.3)';
        ctx.fillRect(cx - R, wY, R * 2, cy + R - wY + 5);
        // 泡沫
        if (isWash) {
          foams.forEach(f => {
            f.x += f.vx; f.y += f.vy;
            if (f.x < cx - R + 10) f.x = cx + R - 10;
            if (f.x > cx + R - 10) f.x = cx - R + 10;
            if (f.y < wY + 5) f.y = cy + R - 5;
            if (f.y > cy + R - 5) f.y = wY + 5;
            ctx.fillStyle = `rgba(200,240,255,${f.alpha * 0.6})`;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
          });
        }
        ctx.restore();
      }

      // ── 滚筒内壁（旋转） ──
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.translate(cx, cy); ctx.rotate(drumAngle);
      // 内壁
      ctx.strokeStyle = 'rgba(80,90,110,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, R - 5, 0, Math.PI * 2); ctx.stroke();
      // 3个提升筋
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        ctx.save(); ctx.rotate(a);
        ctx.fillStyle = '#2a2d42';
        ctx.beginPath(); ctx.roundRect(-5, -(R - 6), 10, 28, 4); ctx.fill();
        ctx.strokeStyle = '#444'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      }
      // 中心轴
      ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
      // 衣物示意（旋转颜色块）
      if (isWash || isSpin) {
        const cols = ['#ff7043', '#42a5f5', '#66bb6a', '#ffca28'];
        cols.forEach((c, i) => {
          const a = (i / cols.length) * Math.PI * 2 + t * 0.2;
          const r2 = 40 + (i * 7.3 % 10);
          ctx.fillStyle = c + '88';
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * r2, Math.sin(a) * r2, 10 + (i * 3.7 % 5), 6, a, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();

      // 玻璃门高光
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx - 15, cy - 15, R - 10, -Math.PI * 0.7, -Math.PI * 0.2); ctx.stroke();

      // ── 进水水流动画 ──
      if (isFill) {
        drops.forEach(d => {
          d.y += d.vy * 2;
          if (d.y > cy - R + waterLevel * R * 2) { d.y = 35; d.alpha = 1; }
          ctx.fillStyle = `rgba(100,200,255,${d.alpha * 0.8})`;
          ctx.beginPath(); ctx.ellipse(d.x, d.y, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
        });
        // 进水管
        ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - 5, 20); ctx.lineTo(cx - 5, 52); ctx.stroke();
        // 电磁阀图标
        ctx.fillStyle = '#00bcd4'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('电磁阀', cx, 18);
      }

      // ── 排水动画 ──
      if (isDrain) {
        ctx.strokeStyle = '#ff7043'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx + 100, cy + 20); ctx.lineTo(cx + 100, cy + 80); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 80, cy + 80); ctx.lineTo(cx + 130, cy + 80); ctx.stroke();
        ctx.fillStyle = '#ff7043'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('排水泵', cx + 100, cy + 95);
        // 排水流
        for (let i = 0; i < 3; i++) {
          const fy = cy + 40 + (t * 80 + i * 20) % 40;
          ctx.fillStyle = 'rgba(0,150,220,0.5)';
          ctx.beginPath(); ctx.ellipse(cx + 100, fy, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
        }
      }

      // ── 电机/关键部件标注 ──
      const parts = [
        { x: 50, y: 100, label: '电机', color: isSpin ? '#ab47bc' : '#78909c' },
        { x: 310, y: 100, label: '电容', color: '#ffca28' },
        { x: 50, y: 200, label: '门锁', color: '#66bb6a' },
        { x: 310, y: 200, label: 'MCU', color: '#42a5f5' },
      ];
      parts.forEach(p => {
        ctx.fillStyle = p.color + '22';
        ctx.beginPath(); ctx.roundRect(p.x - 22, p.y - 14, 44, 28, 6); ctx.fill();
        ctx.strokeStyle = p.color + '55'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = p.color; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(p.label, p.x, p.y + 4);
        // 连线到滚筒
        ctx.strokeStyle = p.color + '30'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
        ctx.beginPath();
        const edge = p.x < cx ? cx - R - 7 : cx + R + 7;
        ctx.moveTo(p.x < cx ? p.x + 22 : p.x - 22, p.y);
        ctx.lineTo(edge, cy);
        ctx.stroke(); ctx.setLineDash([]);
      });

      // 转速/状态文字
      if (isSpin) {
        ctx.fillStyle = `rgba(171,71,188,${0.7 + 0.3 * Math.sin(t * 4)})`;
        ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.shadowColor = '#ab47bc'; ctx.shadowBlur = 10;
        ctx.fillText(`⚡ 甩干 ~1200 rpm`, cx, H - 10);
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [cycleIdx, speed]);
  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

export default function WashingMachine() {
  const [cycleIdx, setCycleIdx] = useState(0);
  const [speed, setSpeed] = useState(60);

  useEffect(() => {
    if (cycleIdx === 0) return;
    const durations = [0, 4000, 8000, 4000, 6000];
    const id = setTimeout(() => {
      setCycleIdx(i => i < CYCLES.length - 1 ? i + 1 : 0);
    }, durations[cycleIdx] || 5000);
    return () => clearTimeout(id);
  }, [cycleIdx]);

  const btnStyle = (active) => ({
    padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
    border: `1px solid ${active ? ACC : 'rgba(255,255,255,.12)'}`,
    background: active ? ACC + '20' : 'rgba(255,255,255,.04)',
    color: active ? ACC : 'rgba(255,255,255,.5)',
    font: '13px/1 inherit', fontWeight: 600, transition: 'all .2s',
  });

  return (
    <section id="washing-machine" className="sec">
      <div className="sh">
        <span className="sh-icon">🫧</span>
        <div className="sh-tag">Stage 5 · 小家电 · 全自动洗衣机</div>
        <h2 className="sh-title" style={{ color: ACC }}>洗衣机电路系统</h2>
        <p className="sh-sub">电容运转电机、进水电磁阀、PTC门锁、程控MCU——解析洗衣机从进水到甩干的完整电路控制逻辑。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 14 }}>
          <WashingCanvas cycleIdx={cycleIdx} speed={speed} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {CYCLES.map((c, i) => (
              <button key={c} style={btnStyle(cycleIdx === i)} onClick={() => setCycleIdx(i)}>
                {CYCLE_LABELS[c]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>转速</span>
            <input type="range" min="20" max="120" value={speed} onChange={e => setSpeed(+e.target.value)}
              style={{ width: 100, accentColor: ACC }} />
            <span style={{ fontSize: 12, color: ACC, fontFamily: 'monospace' }}>{speed}</span>
          </div>
          <div style={{ font: '12px monospace', color: 'var(--dim)', textAlign: 'center' }}>
            当前阶段：<span style={{ color: CYCLE_COLORS[CYCLES[cycleIdx]] }}>{CYCLE_LABELS[CYCLES[cycleIdx]]}</span>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass" style={{ borderColor: 'rgba(0,188,212,.2)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10, fontSize: 15 }}>⚙️ 核心部件详解</div>
            {[
              { name: '电容运转电机', color: '#00bcd4', d: '单相异步电机，启动/运行电容8~12μF移相产生旋转磁场。正反转切换：改变电容串联绕组方向，MCU控制继电器实现。' },
              { name: '进水电磁阀', color: '#42a5f5', d: '线圈通电产生磁力吸合阀芯，允许进水。220V驱动，水位传感器（气压传感器）反馈控制，水满自动断电关阀。' },
              { name: 'PTC门锁延时开关', color: '#66bb6a', d: 'PTC热敏电阻通电加热后阻值骤增→加热双金属片→延时2~3分钟才机械解锁。防止甩干时误开门，安全设计核心。' },
              { name: 'MCU程控电脑板', color: '#ffca28', d: '8位/32位MCU控制继电器阵列（5~8个），驱动各执行器。按键矩阵扫描、EEPROM存储程序、蜂鸣器报警、故障码显示。' },
            ].map(item => (
              <div key={item.name} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ fontWeight: 700, color: item.color, fontSize: 13, marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
        <div className="glass reveal" style={{ borderColor: 'rgba(0,188,212,.18)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 10 }}>🔄 双桶 vs 全自动 vs 滚筒</div>
          <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.8 }}>
            <b style={{ color: '#78909c' }}>双桶：</b>两个独立电机，手动控制，电路最简单<br/>
            <b style={{ color: '#00bcd4' }}>全自动波轮：</b>单电机正反转，水位/时间程控<br/>
            <b style={{ color: '#ab47bc' }}>滚筒：</b>变频BLDC+逆变器，RPM精确调速，1200rpm脱水
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(171,71,188,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ab47bc', marginBottom: 10 }}>📡 变频洗衣机电路</div>
          <div className="fbox"><div className="fbox-f">BLDC电机</div><div className="fbox-desc">永磁无刷直流电机</div></div>
          <div className="fbox"><div className="fbox-f">逆变器 IPM</div><div className="fbox-desc">6管全桥PWM驱动</div></div>
          <div className="fbox"><div className="fbox-f">霍尔传感器</div><div className="fbox-desc">转子位置反馈</div></div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>
            → 调速范围大，振动小，能效A+++，但电路复杂故障率较高。
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(255,112,67,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ff7043', marginBottom: 10 }}>🚨 故障代码速查</div>
          {[
            { code: 'E1', d: '进水超时 → 检查电磁阀/水压' },
            { code: 'E2', d: '排水超时 → 排水泵堵塞/皮带断裂' },
            { code: 'E3', d: '电机过流 → 电容失效/轴承卡死' },
            { code: 'E4', d: '门锁故障 → PTC损坏/锁舌卡住' },
          ].map(f => (
            <div key={f.code} style={{ display: 'flex', gap: 10, fontSize: 12.5, color: '#8aacb8', marginBottom: 6, lineHeight: 1.5 }}>
              <span style={{ color: '#ff7043', fontWeight: 700, minWidth: 24, fontFamily: 'monospace' }}>{f.code}</span>
              <span>{f.d}</span>
            </div>
          ))}
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(102,187,106,.18)' }}>
          <div style={{ fontWeight: 700, color: '#66bb6a', marginBottom: 10 }}>🔧 电容失效诊断</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.8 }}>
            症状：电机嗡嗡响不转动，用手拨一下转<br/>
            原因：运行电容容量衰减 &lt;50% 额定值<br/>
            检测：LCR表测量实际容量（8~12μF）<br/>
            更换：CBB61型电容，规格必须完全匹配<br/>
            费用：电容约5~15元，是最常见廉价维修
          </div>
        </div>
      </div>
    </section>
  );
}
