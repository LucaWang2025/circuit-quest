import { useEffect, useRef, useState } from 'react';

const ACC = '#ff9800';

function RiceCookerCanvas({ phaseRef, tempRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 480, H = 320;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, raf;
    const bubbles = Array.from({ length: 22 }, () => ({
      x: 0, y: 0, r: Math.random() * 3.5 + 1, vy: Math.random() * 0.7 + 0.3, init: false,
    }));
    const steamPuffs = Array.from({ length: 6 }, (_, i) => ({
      x: 188 + i * 11, y: 85, alpha: Math.random() * 0.8, vy: Math.random() * 0.5 + 0.25,
    }));

    // 锅体参数
    const potX = 200, potTop = 85, potBot = 240, potW = 72;

    function draw() {
      const phase = phaseRef.current;
      const temp  = tempRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const heating  = phase === 'cooking';
      const keepWarm = phase === 'warm';
      const boiling  = temp >= 100;
      const heatI    = heating ? (0.45 + 0.35 * Math.abs(Math.sin(t * 5))) : 0;
      const warmI    = keepWarm ? (0.18 + 0.1 * Math.abs(Math.sin(t * 2))) : 0;

      // ── 外壳底座 ──
      const baseY = 248, baseW = 90, baseH = 22;
      const baseGrd = ctx.createLinearGradient(potX - baseW, baseY, potX + baseW, baseY);
      baseGrd.addColorStop(0, '#1c1c2a'); baseGrd.addColorStop(0.5, '#2e2e40'); baseGrd.addColorStop(1, '#1c1c2a');
      ctx.fillStyle = baseGrd;
      ctx.beginPath(); ctx.roundRect(potX - baseW, baseY, baseW * 2, baseH, [0, 0, 10, 10]); ctx.fill();
      ctx.strokeStyle = '#3a3a50'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(potX - baseW, baseY, baseW * 2, baseH, [0, 0, 10, 10]); ctx.stroke();

      // ── 发热盘辉光 ──
      if (heating || keepWarm) {
        const glowI = heating ? heatI : warmI * 0.6;
        const grd = ctx.createRadialGradient(potX, baseY + 5, 0, potX, baseY + 5, 75);
        grd.addColorStop(0, `rgba(255,${heating ? 80 : 140},0,${glowI})`);
        grd.addColorStop(0.5, `rgba(255,${heating ? 60 : 120},0,${glowI * 0.4})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(potX - 80, baseY - 30, 160, 70);
      }

      // ── 发热盘 ──
      const diskColor = heating ? `rgba(${200 + Math.round(55 * heatI)},${50 - Math.round(30 * heatI)},0,1)` : keepWarm ? '#883300' : '#444';
      ctx.fillStyle = diskColor;
      ctx.beginPath(); ctx.ellipse(potX, baseY + 6, 56, 9, 0, 0, Math.PI * 2); ctx.fill();
      // 发热线圈纹
      if (heating || keepWarm) {
        const coilAlpha = heating ? heatI : warmI;
        ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        for (let i = -2; i <= 2; i++) {
          ctx.strokeStyle = `rgba(255,${heating ? 100 + Math.round(80*heatI) : 160},0,${coilAlpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(potX, baseY + 6, 10 + i * 8, 0.15, Math.PI - 0.15, i % 2 === 0);
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#2a2a36';
      ctx.beginPath(); ctx.ellipse(potX, baseY + 6, 40, 6, 0, 0, Math.PI * 2); ctx.fill();

      // ── 内胆（clip） ──
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(potX - potW, potTop + 12);
      ctx.bezierCurveTo(potX - potW - 10, potTop + 70, potX - potW - 10, potBot - 25, potX - potW + 10, potBot);
      ctx.ellipse(potX, potBot, potW - 10, 13, 0, 0, Math.PI);
      ctx.bezierCurveTo(potX + potW + 10, potBot - 25, potX + potW + 10, potTop + 70, potX + potW, potTop + 12);
      ctx.closePath(); ctx.clip();

      // 内胆背景
      const innerGrd = ctx.createLinearGradient(potX - potW, potTop, potX + potW, potTop);
      innerGrd.addColorStop(0, '#1a2030'); innerGrd.addColorStop(0.5, '#232d40'); innerGrd.addColorStop(1, '#1a2030');
      ctx.fillStyle = innerGrd; ctx.fillRect(potX - potW, potTop, potW * 2, potBot - potTop + 15);

      // 米层
      const riceY = potBot - 72;
      ctx.fillStyle = boiling ? '#c0a870' : keepWarm ? '#c8b588' : '#d4c5a9';
      ctx.fillRect(potX - potW, riceY, potW * 2, potBot - riceY + 10);
      if (!boiling) {
        for (let rx = potX - potW + 5; rx < potX + potW - 5; rx += 6) {
          for (let ry = riceY + 3; ry < potBot - 4; ry += 5) {
            ctx.fillStyle = 'rgba(200,185,160,0.5)';
            ctx.beginPath();
            ctx.ellipse(rx + Math.sin(ry) * 1.5, ry, 2.2, 1.3, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 水层
      const waterY = riceY - 24;
      if (temp < 100) {
        const waterAlpha = 0.28 + 0.1 * Math.sin(t * 2);
        ctx.fillStyle = `rgba(100,165,230,${waterAlpha})`;
        ctx.fillRect(potX - potW, waterY, potW * 2, riceY - waterY);
        if (heating && temp > 20) {
          ctx.beginPath(); ctx.moveTo(potX - potW, waterY);
          for (let x = potX - potW; x <= potX + potW; x++) {
            ctx.lineTo(x, waterY + Math.sin((x + t * 55) * 0.14) * Math.min(4, temp / 22));
          }
          ctx.lineTo(potX + potW, waterY); ctx.closePath();
          ctx.fillStyle = 'rgba(130,200,248,0.16)'; ctx.fill();
        }
      }

      // 气泡
      if ((heating || keepWarm) && temp > 55) {
        const d = Math.min(1, (temp - 55) / 45) * (keepWarm ? 0.3 : 1);
        bubbles.forEach(b => {
          if (!b.init || b.y < waterY - 6) {
            b.y = potBot - 8; b.x = potX - 45 + Math.random() * 90; b.init = true;
          }
          b.y -= b.vy * d * 1.8;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180,220,255,${d * 0.65})`; ctx.lineWidth = 0.8; ctx.stroke();
        });
      }
      ctx.restore();

      // ── 外锅轮廓 ──
      ctx.strokeStyle = '#606070'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(potX - potW, potTop + 12);
      ctx.bezierCurveTo(potX - potW - 10, potTop + 70, potX - potW - 10, potBot - 25, potX - potW + 10, potBot);
      ctx.ellipse(potX, potBot, potW - 10, 13, 0, 0, Math.PI);
      ctx.bezierCurveTo(potX + potW + 10, potBot - 25, potX + potW + 10, potTop + 70, potX + potW, potTop + 12);
      ctx.stroke();
      // 锅沿椭圆
      ctx.strokeStyle = '#505060'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(potX, potTop + 12, potW, 13, 0, 0, Math.PI * 2); ctx.stroke();

      // ── 锅盖 ──
      ctx.fillStyle = '#3e3e50';
      ctx.beginPath(); ctx.ellipse(potX, potTop + 10, potW + 5, 15, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5a5a6e'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#2a2a38';
      ctx.beginPath(); ctx.roundRect(potX - 14, potTop - 17, 28, 17, 7); ctx.fill();
      ctx.strokeStyle = '#444456'; ctx.lineWidth = 1; ctx.stroke();
      // 排气孔
      if (heating && temp > 85) {
        const vAlpha = Math.min(1, (temp - 85) / 15) * (0.4 + 0.3 * Math.sin(t * 8));
        ctx.fillStyle = `rgba(255,255,255,${vAlpha})`;
        ctx.beginPath(); ctx.ellipse(potX, potTop + 10, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
      }

      // ── 蒸汽 ──
      if ((heating && temp > 78) || (keepWarm && temp > 70)) {
        const steamA = heating
          ? Math.min(1, (temp - 78) / 22)
          : Math.min(0.5, (temp - 70) / 10) * 0.5;
        steamPuffs.forEach(p => {
          p.y -= p.vy;
          if (p.y < potTop - 60) { p.y = potTop; p.alpha = 0.6 + Math.random() * 0.3; }
          p.alpha = Math.max(0, p.alpha - 0.006);
          ctx.strokeStyle = `rgba(210,215,225,${p.alpha * steamA})`;
          ctx.lineWidth = 2.2; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.bezierCurveTo(p.x + 9, p.y - 14, p.x - 9, p.y - 28, p.x + 6, p.y - 42);
          ctx.stroke();
        });
      }

      // ── 磁钢温控开关（右侧，更大更清晰） ──
      const swX = 385, swY = 165;
      // 背景框
      ctx.fillStyle = '#13131f';
      ctx.strokeStyle = '#333345'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(swX - 36, swY - 45, 70, 95, 8); ctx.fill(); ctx.stroke();
      // 标题
      ctx.fillStyle = '#7788aa'; ctx.font = 'bold 9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('磁钢温控', swX - 1, swY - 30);

      // 磁钢块（吸合/断开）
      const magOn = temp < 103;
      ctx.fillStyle = magOn ? '#ff9800' : '#334';
      ctx.shadowColor = magOn ? '#ff9800' : 'transparent';
      ctx.shadowBlur = magOn ? 10 : 0;
      ctx.beginPath(); ctx.roundRect(swX - 16, swY - 20, 30, 12, 4); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = magOn ? '#ffcc66' : '#556'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(magOn ? '● 磁吸合' : '○ 失磁', swX - 1, swY - 10);

      // 双金属片（弯曲动画）
      const bendAmt = boiling ? 10 : keepWarm ? 2 : 0;
      ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      ctx.strokeStyle = boiling ? '#ff5722' : keepWarm ? '#ff9800' : '#00bcd4';
      ctx.shadowColor = boiling ? '#ff5722' : keepWarm ? '#ff9800cc' : 'transparent';
      ctx.shadowBlur = boiling ? 8 : 0;
      ctx.beginPath();
      ctx.moveTo(swX - 20, swY + 8);
      ctx.quadraticCurveTo(swX - 1, swY + 8 - bendAmt, swX + 20, swY + 8 + bendAmt * 0.8);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = boiling ? '#ff572299' : keepWarm ? '#ff980099' : '#00bcd488';
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(boiling ? '↑ 弯曲断路' : keepWarm ? '微弯保温' : '平直导通', swX - 1, swY + 24);

      // 按键（煮饭键）
      const btnPushed = heating || keepWarm;
      ctx.fillStyle = btnPushed ? '#ff9800' : '#334';
      ctx.strokeStyle = '#556'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(swX - 14, swY + 33, 26, 14, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = btnPushed ? '#fff' : '#88a'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(btnPushed ? '↓按下' : '弹起', swX - 1, swY + 44);

      // 连线：锅底 → 温控开关
      const lineColor = (heating || keepWarm) ? `rgba(255,152,0,${0.3 + 0.2 * Math.sin(t * 3)})` : 'rgba(80,80,100,0.3)';
      ctx.strokeStyle = lineColor; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(potX + potW + 10, potBot - 30);
      ctx.bezierCurveTo(potX + potW + 30, potBot - 30, swX - 36, swY + 10, swX - 36, swY + 8);
      ctx.stroke();
      ctx.setLineDash([]);
      // 箭头
      if (heating || keepWarm) {
        ctx.fillStyle = lineColor;
        ctx.beginPath(); ctx.arc(swX - 36, swY + 8, 3, 0, Math.PI * 2); ctx.fill();
      }

      // ── 温度计（左侧，更宽显示区） ──
      const tmX = 45, tmY = 60, tmH = 155;
      // 外管
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.beginPath(); ctx.roundRect(tmX - 7, tmY, 14, tmH, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(tmX - 7, tmY, 14, tmH, 7); ctx.stroke();
      // 球泡
      ctx.fillStyle = '#c00'; ctx.beginPath(); ctx.arc(tmX, tmY + tmH + 5, 9, 0, Math.PI * 2); ctx.fill();

      // 液柱
      const fillH = Math.min(tmH, (temp / 112) * tmH);
      const col = temp < 55 ? '#00bcd4' : temp < 88 ? '#ff9800' : '#ff1744';
      ctx.fillStyle = col;
      ctx.shadowColor = col; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.roundRect(tmX - 5, tmY + tmH - fillH, 10, fillH + 14, 5); ctx.fill();
      ctx.shadowBlur = 0;

      // 温度数字
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(temp)}°`, tmX, tmY + tmH - fillH - 8);

      // 刻度
      [0, 40, 60, 80, 100, 103].forEach(v => {
        const y = tmY + tmH - (v / 112) * tmH;
        const isMark = v === 103;
        ctx.fillStyle = isMark ? '#ff9800' : 'rgba(255,255,255,.18)';
        ctx.fillRect(tmX + 7, y, isMark ? 8 : 5, 1);
        ctx.fillStyle = isMark ? '#ff9800' : 'rgba(200,215,230,.45)';
        ctx.font = isMark ? 'bold 8px monospace' : '8px monospace'; ctx.textAlign = 'left';
        ctx.fillText(isMark ? '103✦' : `${v}°`, tmX + 17, y + 3);
      });

      // ── 电路状态文字 ──
      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      if (heating && !boiling) {
        ctx.fillStyle = `rgba(255,152,0,${0.75 + 0.25 * Math.sin(t * 4)})`;
        ctx.fillText(`⚡ 主回路通电 · 全功率加热`, W / 2, H - 12);
      } else if (boiling && phase === 'cooking') {
        ctx.fillStyle = `rgba(255,87,34,${0.8 + 0.2 * Math.sin(t * 6)})`;
        ctx.fillText('✓ 103°C 磁钢失磁 → 主路断开', W / 2, H - 12);
      } else if (keepWarm) {
        ctx.fillStyle = `rgba(255,152,0,${0.55 + 0.25 * Math.sin(t * 2)})`;
        ctx.fillText(`♨ 保温回路 · 半波整流 ~40W · ${Math.round(temp)}°C`, W / 2, H - 12);
      } else {
        ctx.fillStyle = 'rgba(100,120,145,0.55)';
        ctx.fillText('○ 断电待机', W / 2, H - 12);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: '480px' }} />;
}

export default function RiceCooker() {
  const [phase, setPhase] = useState('idle');
  const [temp, setTemp]   = useState(25);

  // 用 ref 把最新值传入 RAF 循环，避免重建 canvas
  const phaseRef = useRef(phase);
  const tempRef  = useRef(temp);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { tempRef.current  = temp;  }, [temp]);

  // 温度模拟：仅做纯计算，不在 updater 里调用 setPhase
  useEffect(() => {
    const id = setInterval(() => {
      setTemp(prev => {
        const p = phaseRef.current;
        if (p === 'cooking') return prev >= 103 ? 74 : Math.min(103, prev + 1.5);
        if (p === 'warm')    return 71 + 4 * Math.sin(Date.now() / 9000);
        return Math.max(25, prev - 0.4);
      });
    }, 160);
    return () => clearInterval(id);
  }, []);

  // 单独监听：煮饭到 103°C 后自动切保温
  useEffect(() => {
    if (phase === 'cooking' && temp >= 103) {
      setPhase('warm');
      setTemp(74);
    }
  }, [temp, phase]);

  const btnStyle = (active, col) => ({
    padding: '9px 22px', borderRadius: 10, cursor: 'pointer',
    border: `1px solid ${active ? col : 'rgba(255,255,255,.12)'}`,
    background: active ? col + '22' : 'rgba(255,255,255,.04)',
    color: active ? col : 'rgba(255,255,255,.5)',
    font: '13px/1 inherit', fontWeight: 600, transition: 'all .2s',
  });

  return (
    <section id="rice-cooker" className="sec">
      <div className="sh">
        <span className="sh-icon">🍚</span>
        <div>
          <div className="sh-title">电饭锅电路原理</div>
          <div className="sh-tag">RICE COOKER · 磁钢温控 · 保温半波整流</div>
          <div className="sh-sub">从居里温度到 IH 电磁加热——完整解析电饭锅电路逻辑</div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,152,0,.2)', flexDirection: 'column', gap: 14 }}>
          <RiceCookerCanvas phaseRef={phaseRef} tempRef={tempRef} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={btnStyle(phase === 'cooking', '#ff9800')}
              onClick={() => { setPhase('cooking'); setTemp(25); }}>🔥 开始煮饭</button>
            <button style={btnStyle(phase === 'warm', '#ff5722')}
              onClick={() => { setPhase('warm'); setTemp(74); }}>♨ 切换保温</button>
            <button style={btnStyle(phase === 'idle', '#78909c')}
              onClick={() => { setPhase('idle'); setTemp(25); }}>⏹ 断电</button>
          </div>
          <div style={{ font: '12px "Courier New",monospace', color: 'var(--dim)', textAlign: 'center', lineHeight: 1.6, minHeight: 18 }}>
            {phase === 'cooking' && temp < 103  ? `⚡ 加热中… ${Math.round(temp)}°C | 发热盘全功率开启`
             : phase === 'cooking'              ? '✅ 103°C → 磁钢失磁 → 弹起断路 → 自动保温'
             : phase === 'warm'                 ? `♨ 保温中 ~${Math.round(temp)}°C | 半波整流约 40W`
             :                                   '○ 断电待机，温度自然冷却'}
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass" style={{ borderColor: 'rgba(255,152,0,.2)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10, fontSize: 15 }}>⚙️ 电路结构组成</div>
            {[
              { name: '发热盘', color: '#ff5722', d: '电热合金丝密封于铝合金盘中，额定 500W（3L）/ 800W（5L）。通电后电阻发热传导至内胆底部。' },
              { name: '磁钢温控开关', color: '#ff9800', d: '核心元件：磁钢在居里温度（≈103°C）时失去磁性，弹簧推动开关弹起切断主加热回路。冷却后可再次吸合。' },
              { name: '限温器', color: '#ffcc02', d: '位于底盘侧面的热熔断器，防止干烧超温（约185°C熔断）。一次性保护，熔断后需更换。' },
              { name: '保温加热板', color: '#81c784', d: '小功率元件（约40W），串联二极管半波整流→仅利用正半周→降功率约75%，维持74°C保温。' },
            ].map(item => (
              <div key={item.name} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ fontWeight: 700, color: item.color, fontSize: 13, marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,152,0,.18)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 10 }}>🧲 磁钢温控原理</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.85 }}>
            1. 按下"煮饭"键 → 磁钢吸合固定<br />
            2. 主回路闭合 → 发热盘全功率加热<br />
            3. 温度到达103°C → 磁钢居里点失磁<br />
            4. 弹簧弹起 → 主回路断开<br />
            5. 切换保温回路 → 二极管限功<br />
          </div>
          <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(255,152,0,.1)', borderRadius: 8, fontSize: 12, color: '#c09070' }}>
            💡 居里温度：铁磁体在特定温度以上失去铁磁性。电饭锅利用合金调配使居里点恰好为103°C。
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(129,199,132,.18)' }}>
          <div style={{ fontWeight: 700, color: '#81c784', marginBottom: 10 }}>⚡ 保温半波整流</div>
          <div className="fbox"><div className="fbox-f">220V AC → D1（二极管）</div><div className="fbox-desc">仅通正半周，截断负半周</div></div>
          <div className="fbox"><div className="fbox-f">有效值 ≈ 155V</div><div className="fbox-desc">有效值降为原来的约 70%</div></div>
          <div className="fbox"><div className="fbox-f">P ∝ V² → 约 1/2 原功率</div><div className="fbox-desc">功率降至原来的约 1/2</div></div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 8 }}>
            半波整流使电压有效值降为原来约 70%，功率∝V²，(0.707)²≈0.5，故保温功率约为加热功率的 1/2。
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(100,181,246,.18)' }}>
          <div style={{ fontWeight: 700, color: '#64b5f6', marginBottom: 10 }}>🤖 智能电饭锅升级</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.8 }}>
            ▸ NTC热敏电阻：实时精确测温（±0.5°C）<br />
            ▸ MCU控制器：多段程序（快煮/精煮/粥）<br />
            ▸ IH电磁加热：磁场感应内胆自身发热，均匀高效<br />
            ▸ 压力电饭煲：密封升压至110°C，缩短约30%时间<br />
            ▸ Wi-Fi模块：APP预约，远程控制<br />
          </div>
        </div>

        <div className="glass reveal" style={{ borderColor: 'rgba(255,82,82,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ff5252', marginBottom: 10 }}>⚠️ 故障排查 & 安全</div>
          {[
            '不加热 → 万用表测温控开关通断，清洁磁钢接触面',
            '一直加热不断电 → 限温器失效或磁钢污垢，停止使用',
            '保温不稳 → 保温二极管老化，测正反向阻值',
            '220V高压作业 → 必须断电操作，内胆变形禁止使用',
          ].map(s => (
            <div key={s} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#8aacb8', lineHeight: 1.6, marginBottom: 6 }}>
              <span style={{ color: '#ff5252', flexShrink: 0 }}>▸</span>{s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
