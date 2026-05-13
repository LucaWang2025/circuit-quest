import { useEffect, useRef, useState } from 'react';

const ACC = '#ff9800';

function RiceCookerCanvas({ phaseRef, tempRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 340, H = 260;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    let t = 0, raf;
    const bubbles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 80 + 130, y: Math.random() * 50 + 140,
      r: Math.random() * 3 + 1, vy: Math.random() * 0.6 + 0.3,
    }));
    const steamPuffs = Array.from({ length: 5 }, (_, i) => ({
      x: 150 + i * 9, y: 78, alpha: Math.random() * 0.8,
      vy: Math.random() * 0.4 + 0.2,
    }));

    function draw() {
      const phase = phaseRef.current;
      const temp  = tempRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.03;

      const heating = phase === 'cooking';
      const keepWarm = phase === 'warm';
      const boiling = temp >= 100;

      // ── 发热盘 ──
      const heatY = 218;
      if (heating) {
        const glow = ctx.createRadialGradient(170, heatY, 0, 170, heatY, 65);
        const intensity = 0.4 + 0.3 * Math.sin(t * 5);
        glow.addColorStop(0, `rgba(255,80,0,${intensity})`);
        glow.addColorStop(0.5, `rgba(255,150,0,${intensity * 0.4})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.fillRect(105, heatY - 35, 130, 70);
      }
      ctx.fillStyle = heating ? '#c0392b' : '#555';
      ctx.beginPath(); ctx.ellipse(170, heatY, 55, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.ellipse(170, heatY, 42, 7, 0, 0, Math.PI * 2); ctx.fill();
      if (heating) {
        ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        for (let i = -2; i <= 2; i++) {
          ctx.strokeStyle = `rgba(255,${90 + Math.floor(90 * Math.abs(Math.sin(t * 6)))},0,0.9)`;
          ctx.beginPath();
          ctx.arc(170, heatY, 10 + i * 7, 0.1, Math.PI - 0.1, i % 2 === 0);
          ctx.stroke();
        }
      }

      // ── 内胆（clip 区域） ──
      const potX = 170, potTop = 80, potBot = 215, potW = 65;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(potX - potW, potTop + 10);
      ctx.bezierCurveTo(potX - potW - 8, potTop + 60, potX - potW - 8, potBot - 20, potX - potW + 8, potBot);
      ctx.ellipse(potX, potBot, potW - 8, 12, 0, 0, Math.PI);
      ctx.bezierCurveTo(potX + potW + 8, potBot - 20, potX + potW + 8, potTop + 60, potX + potW, potTop + 10);
      ctx.closePath(); ctx.clip();

      // 米层
      const riceY = 158;
      ctx.fillStyle = boiling ? '#c8b890' : '#d4c5a9';
      ctx.fillRect(potX - potW, riceY, potW * 2, potBot - riceY + 10);
      if (!boiling) {
        for (let rx = potX - potW + 5; rx < potX + potW - 5; rx += 6) {
          for (let ry = riceY + 3; ry < potBot - 5; ry += 5) {
            ctx.fillStyle = 'rgba(200,185,160,0.55)';
            ctx.beginPath();
            ctx.ellipse(rx + Math.sin(ry) * 1.5, ry, 2, 1.2, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 水层
      const waterY = riceY - 22;
      if (temp < 100) {
        ctx.fillStyle = `rgba(100,170,230,${0.28 + 0.1 * Math.sin(t * 2)})`;
        ctx.fillRect(potX - potW, waterY, potW * 2, riceY - waterY);
        if (heating) {
          ctx.beginPath(); ctx.moveTo(potX - potW, waterY);
          for (let x = potX - potW; x <= potX + potW; x++) {
            ctx.lineTo(x, waterY + Math.sin((x + t * 50) * 0.15) * (temp / 30) * 1.5);
          }
          ctx.lineTo(potX + potW, waterY); ctx.closePath();
          ctx.fillStyle = 'rgba(130,195,245,0.18)'; ctx.fill();
        }
      }

      // 气泡
      if (heating && temp > 60) {
        const d = (temp - 60) / 40;
        bubbles.forEach(b => {
          b.y -= b.vy * d * 1.8;
          if (b.y < waterY - 5) { b.y = potBot - 10; b.x = potX - 40 + Math.random() * 80; }
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180,220,255,${d * 0.7})`; ctx.lineWidth = 0.8; ctx.stroke();
        });
      }
      ctx.restore();

      // ── 内胆轮廓 ──
      ctx.strokeStyle = '#7a7a7a'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(potX - potW, potTop + 10);
      ctx.bezierCurveTo(potX - potW - 8, potTop + 60, potX - potW - 8, potBot - 20, potX - potW + 8, potBot);
      ctx.ellipse(potX, potBot, potW - 8, 12, 0, 0, Math.PI);
      ctx.bezierCurveTo(potX + potW + 8, potBot - 20, potX + potW + 8, potTop + 60, potX + potW, potTop + 10);
      ctx.stroke();
      ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(potX, potTop + 10, potW, 12, 0, 0, Math.PI * 2); ctx.stroke();

      // ── 锅盖 ──
      ctx.fillStyle = '#4a4a55';
      ctx.beginPath(); ctx.ellipse(potX, potTop + 8, potW + 4, 14, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#666'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.roundRect(potX - 12, potTop - 14, 24, 14, 6); ctx.fill();

      // 蒸汽
      if (heating && temp > 80) {
        const steamA = Math.min(1, (temp - 80) / 20);
        steamPuffs.forEach(p => {
          p.y -= p.vy;
          if (p.y < potTop - 55) { p.y = potTop - 2; p.alpha = 0.7; }
          p.alpha = Math.max(0, p.alpha - 0.005);
          ctx.strokeStyle = `rgba(200,210,220,${p.alpha * steamA})`;
          ctx.lineWidth = 2; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.bezierCurveTo(p.x + 8, p.y - 12, p.x - 8, p.y - 24, p.x + 5, p.y - 36);
          ctx.stroke();
        });
      }

      // ── 磁钢温控开关（右侧） ──
      const swX = 275, swY = 180;
      ctx.fillStyle = '#1a1a2e';
      ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(swX - 20, swY - 28, 40, 52, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '8px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('磁钢温控', swX, swY - 14);
      const magActive = temp < 103;
      ctx.fillStyle = magActive ? '#ff9800' : '#444';
      ctx.beginPath(); ctx.roundRect(swX - 10, swY - 4, 20, 10, 3); ctx.fill();
      // 双金属片
      const bend = boiling ? 7 : 0;
      ctx.strokeStyle = boiling ? '#ff5722' : '#00bcd4';
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(swX - 14, swY + 14);
      ctx.quadraticCurveTo(swX, swY + 14 - bend, swX + 14, swY + 14 + bend);
      ctx.stroke();
      ctx.fillStyle = boiling ? '#ff572299' : '#00bcd499';
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(boiling ? '弯曲↑断路' : '正常导通', swX, swY + 28);

      // 连接虚线
      ctx.strokeStyle = 'rgba(255,152,0,0.25)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(225, heatY); ctx.lineTo(swX - 20, swY + 8); ctx.stroke();
      ctx.setLineDash([]);

      // ── 温度计 ──
      const tmX = 42, tmY = 52, tmH = 125;
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      ctx.beginPath(); ctx.roundRect(tmX - 6, tmY, 12, tmH, 6); ctx.fill();
      const fillH = Math.min(tmH, (temp / 110) * tmH);
      const col = temp < 60 ? '#00bcd4' : temp < 90 ? '#ff9800' : '#ff1744';
      ctx.fillStyle = col + 'cc';
      ctx.beginPath(); ctx.roundRect(tmX - 5, tmY + tmH - fillH, 10, fillH, 5); ctx.fill();
      ctx.fillStyle = col; ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(temp)}°C`, tmX, tmY + tmH - fillH - 6);
      [0, 50, 100, 103].forEach(v => {
        const y = tmY + tmH - (v / 110) * tmH;
        ctx.fillStyle = v === 103 ? '#ff9800aa' : 'rgba(255,255,255,.2)';
        ctx.fillRect(tmX + 6, y, 5, 1);
        ctx.fillStyle = v === 103 ? '#ff9800' : 'rgba(200,210,220,.4)';
        ctx.font = '8px monospace'; ctx.textAlign = 'left';
        ctx.fillText(v === 103 ? '103° ✦' : `${v}°`, tmX + 13, y + 3);
      });

      // ── 状态提示 ──
      if (keepWarm) {
        ctx.fillStyle = `rgba(255,152,0,${0.5 + 0.3 * Math.sin(t * 2)})`;
        ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText('♨ 保温中', W / 2, H - 10);
      }
      if (boiling && phase === 'cooking') {
        ctx.fillStyle = `rgba(255,87,34,${0.7 + 0.3 * Math.sin(t * 5)})`;
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText('✓ 磁钢断电', W / 2, H - 10);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

export default function RiceCooker() {
  const [phase, setPhase] = useState('idle');
  const [temp, setTemp]   = useState(25);

  // 用 ref 把最新值传入 RAF 循环，避免重建 canvas
  const phaseRef = useRef(phase);
  const tempRef  = useRef(temp);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { tempRef.current  = temp;  }, [temp]);

  useEffect(() => {
    const id = setInterval(() => {
      setTemp(prev => {
        const p = phaseRef.current;
        if (p === 'cooking') {
          if (prev >= 103) { setPhase('warm'); return 74; }
          return Math.min(103, prev + 1.5);
        }
        if (p === 'warm') return 72 + 3 * Math.sin(Date.now() / 8000);
        return Math.max(25, prev - 0.5);
      });
    }, 160);
    return () => clearInterval(id);
  }, []);

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
              onClick={() => setPhase('warm')}>♨ 切换保温</button>
            <button style={btnStyle(phase === 'idle', '#78909c')}
              onClick={() => { setPhase('idle'); setTemp(25); }}>⏹ 断电</button>
          </div>
          <div style={{ font: '12px "Courier New",monospace', color: 'var(--dim)', textAlign: 'center', lineHeight: 1.6, minHeight: 18 }}>
            {phase === 'cooking' && temp < 103 && `⚡ 加热中… ${Math.round(temp)}°C | 发热盘全功率开启`}
            {phase === 'cooking' && temp >= 103 && '✅ 103°C → 磁钢失磁 → 弹起断路 → 自动保温'}
            {phase === 'warm'    && `♨ 保温中 ~${Math.round(temp)}°C | 二极管半波整流约 40W`}
            {phase === 'idle'    && '○ 断电待机，温度自然冷却'}
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
          <div className="fbox"><div className="fbox-f">有效值 ≈ 110V</div><div className="fbox-desc">等效降压约一半</div></div>
          <div className="fbox"><div className="fbox-f">P = V²/R ≈ 40W</div><div className="fbox-desc">功率降至原来的 1/4</div></div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 8 }}>
            半波整流使电压有效值降为原来约70%，功率∝V²，故保温功率约为加热功率的 1/4。
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
