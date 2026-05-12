import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ff6b35';

function KettleCanvas({ temp, heating }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = setupHiDpi(cv, 320, 300);
    const W = 320, H = 300;
    let t = 0, raf;
    const bubbles = Array.from({ length: 18 }, () => ({
      x: Math.random() * 70 + 115, y: Math.random() * 80 + 140,
      r: Math.random() * 3 + 1, vy: Math.random() * 0.8 + 0.3,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.035;

      const boiling = temp >= 100;
      const waterLevel = 0.55; // fill ratio

      // Kettle body outline
      const KX = W / 2, KY = H / 2 + 10;
      const KW = 100, KH = 120;

      // Water fill
      const waterColor = temp < 60 ? `rgba(100,180,255,0.55)` : temp < 90 ? `rgba(120,190,230,0.65)` : `rgba(160,210,230,0.75)`;
      const wTop = KY - KH * 0.5 + KH * (1 - waterLevel);
      ctx.save();
      ctx.beginPath(); ctx.ellipse(KX, KY - KH * 0.5 + KH, KW * 0.5, KH * 0.15, 0, 0, Math.PI * 2);
      ctx.rect(KX - KW * 0.5, wTop, KW, KY - KH * 0.5 + KH - wTop); ctx.clip();

      // Wave on water surface
      if (heating) {
        ctx.beginPath();
        ctx.moveTo(KX - KW * 0.5, wTop);
        for (let x = KX - KW * 0.5; x < KX + KW * 0.5; x++) {
          const wave = Math.sin((x + t * 40) * 0.12) * (temp / 100) * 3;
          ctx.lineTo(x, wTop + wave);
        }
        ctx.lineTo(KX + KW * 0.5, KY + KH * 0.5);
        ctx.lineTo(KX - KW * 0.5, KY + KH * 0.5);
        ctx.closePath();
        ctx.fillStyle = waterColor; ctx.fill();
      } else {
        ctx.fillStyle = waterColor;
        ctx.fillRect(KX - KW * 0.5, wTop, KW, KY + KH * 0.5);
      }
      ctx.restore();

      // Bubbles
      if (heating && temp > 50) {
        const density = Math.max(0, (temp - 50) / 50);
        bubbles.forEach(b => {
          if (Math.random() < density * 0.03) b.y = KY + KH * 0.4;
          b.y -= b.vy * density * 1.5;
          if (b.y < wTop - 5) b.y = KY + KH * 0.4;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200,240,255,${density * 0.7})`; ctx.lineWidth = 0.8; ctx.stroke();
        });
      }

      // Kettle body (outline over water)
      ctx.strokeStyle = '#777'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(KX - KW * 0.5, KY - KH * 0.45);
      ctx.bezierCurveTo(KX - KW * 0.55, KY, KX - KW * 0.55, KY + KH * 0.3, KX - KW * 0.48, KY + KH * 0.5);
      ctx.lineTo(KX + KW * 0.48, KY + KH * 0.5);
      ctx.bezierCurveTo(KX + KW * 0.55, KY + KH * 0.3, KX + KW * 0.55, KY, KX + KW * 0.5, KY - KH * 0.45);
      ctx.stroke();
      // Lid
      ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(KX, KY - KH * 0.47, KW * 0.45, 10, 0, 0, Math.PI * 2); ctx.stroke();
      // Handle (right)
      ctx.strokeStyle = '#666'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(KX + KW * 0.5, KY - KH * 0.2); ctx.bezierCurveTo(KX + KW * 0.85, KY - KH * 0.3, KX + KW * 0.85, KY + KH * 0.3, KX + KW * 0.5, KY + KH * 0.2); ctx.stroke();
      // Spout (left)
      ctx.strokeStyle = '#666'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(KX - KW * 0.5, KY - KH * 0.1); ctx.bezierCurveTo(KX - KW * 0.75, KY - KH * 0.15, KX - KW * 0.85, KY - KH * 0.4, KX - KW * 0.8, KY - KH * 0.5); ctx.stroke();

      // Heating element indicator (bottom)
      if (heating) {
        const intensity = 0.5 + 0.5 * Math.sin(t * 6);
        ctx.strokeStyle = `rgba(255,107,53,${intensity})`;
        ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(KX - 28, KY + KH * 0.42); ctx.lineTo(KX + 28, KY + KH * 0.42); ctx.stroke();
        ctx.shadowColor = ACC; ctx.shadowBlur = 12 * intensity;
        ctx.beginPath(); ctx.moveTo(KX - 18, KY + KH * 0.42); ctx.lineTo(KX + 18, KY + KH * 0.42); ctx.stroke();
        ctx.shadowBlur = 0;
        // Steam
        if (temp > 80) {
          for (let i = 0; i < 3; i++) {
            const sx = KX - 20 + i * 20;
            const sy = KY - KH * 0.5 - 10;
            const steamAlpha = ((temp - 80) / 20) * 0.4 * (0.5 + 0.5 * Math.sin(t * 2 + i));
            ctx.strokeStyle = `rgba(200,220,230,${steamAlpha})`;
            ctx.lineWidth = 2; ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.bezierCurveTo(sx + 8, sy - 15, sx - 8, sy - 28, sx + 4, sy - 40);
            ctx.stroke();
          }
        }
      }

      // Temperature bar
      const barX = 22, barY = H * 0.15, barH = H * 0.7;
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.beginPath(); ctx.roundRect(barX, barY, 12, barH, 6); ctx.fill();
      const fillH = (temp / 100) * barH;
      const barColor = temp < 60 ? '#00bcd4' : temp < 90 ? '#ffab00' : '#ff1744';
      ctx.fillStyle = barColor + 'cc'; ctx.shadowColor = barColor; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.roundRect(barX, barY + barH - fillH, 12, fillH, 6); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = barColor; ctx.font = 'bold 13px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${temp}°`, barX + 6, barY + barH - fillH - 6);
      // Scale marks
      [0, 40, 60, 80, 100].forEach(v => {
        const y = barY + barH - (v / 100) * barH;
        ctx.fillStyle = 'rgba(200,220,232,.3)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'right';
        ctx.fillText(`${v}°`, barX - 2, y + 3);
        ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(barX + 12, y, 5, 1);
      });

      // Boiling label
      if (boiling) {
        ctx.fillStyle = `rgba(255,107,53,${0.7 + 0.3 * Math.sin(t * 4)})`;
        ctx.font = 'bold 12px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.shadowColor = ACC; ctx.shadowBlur = 10;
        ctx.fillText('沸腾！', W / 2, H - 12);
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [temp, heating]);
  return <canvas ref={ref} width={320} height={300} style={{ maxWidth: '100%' }} />;
}

export default function Kettle() {
  const [temp, setTemp] = useState(25);
  const [heating, setHeating] = useState(false);

  // Auto heat / cool simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTemp(t => {
        if (heating && t < 100) return Math.min(100, t + 1.2);
        if (!heating && t > 20) return Math.max(20, t - 0.4);
        return t;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [heating]);

  return (
    <section id="kettle" className="sec">
      <div className="sh">
        <span className="sh-icon">☕</span>
        <div className="sh-tag">Stage 3 · Small Appliance · Electric Kettle</div>
        <h2 className="sh-title" style={{ color: ACC }}>热水壶电路设计</h2>
        <p className="sh-sub">发热管工作原理、双金属片温控开关、防干烧保护、220V 安全规范——掌握热水壶的完整电路逻辑。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,.2)', flexDirection: 'column', gap: 16 }}>
          <KettleCanvas temp={Math.round(temp)} heating={heating} />
          <button onClick={() => setHeating(h => !h)} style={{
            padding: '10px 32px', borderRadius: 12, cursor: 'pointer',
            border: `1px solid ${heating ? '#ff1744' : 'rgba(255,107,53,.4)'}`,
            background: heating ? 'rgba(255,23,68,.15)' : 'rgba(255,107,53,.1)',
            color: heating ? '#ff1744' : ACC, font: '14px/1 inherit', fontWeight: 600, transition: 'all .22s',
          }}>🔥 {heating ? '断电停止加热' : '通电开始加热'}</button>
          <div style={{ font: '12px "Courier New",monospace', color: 'var(--dim)', textAlign: 'center' }}>
            {temp >= 100 ? '✅ 沸腾，温控开关自动断开' : heating ? `⚡ 加热中… ${Math.round(temp)}°C` : `温度自然冷却中 ${Math.round(temp)}°C`}
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass" style={{ borderColor: 'rgba(255,107,53,.2)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10, fontSize: 15 }}>⚙️ 核心电路结构</div>
            {[
              { name: '发热管（加热元件）', color: '#ff6b35', d: '镍铬合金电阻丝密封在不锈钢管内（绝缘填充氧化镁），额定功率 1500~2200W，通电后电阻发热，PTC 材料可自限温' },
              { name: '双金属片温控器', color: '#ffab00', d: '两种热膨胀系数不同的金属片粘合，水沸腾产生蒸汽使其弯曲，推动微动开关断开电路，是最经典的机械式热保护' },
              { name: '防干烧保护', color: '#ff1744', d: '位于底部的热熔断器（温度保险丝），当壶内无水时发热管温度超过 135°C 自动断路，一次性保护，断路后需换新' },
              { name: 'NTC 温度传感器', color: '#9c7dff', d: '智能热水壶增配 NTC 热敏电阻，MCU 实时读取温度，实现精准控温、保温和预约功能' },
            ].map(item => (
              <div key={item.name} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ fontWeight: 700, color: item.color, fontSize: 13, marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Power calculation */}
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,107,53,.18)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 8 }}>⚡ 功率与电流</div>
          <div className="fbox"><div className="fbox-f">P = 2000 W</div><div className="fbox-desc">额定功率（典型）</div></div>
          <div className="fbox"><div className="fbox-f">I = P/V = 9.1A</div><div className="fbox-desc">220V 电路工作电流</div></div>
          <div className="fbox"><div className="fbox-f">t ≈ 3~5 min</div><div className="fbox-desc">1L 水从 20°→100° 用时</div></div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 8 }}>→ 烧一壶水约 0.11 度电（2kW × 3.5min）</div>
        </div>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,171,0,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ffab00', marginBottom: 10 }}>🌡️ 温控开关工作原理</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.75 }}>
            1. 水加热 → 产生大量蒸汽<br/>
            2. 蒸汽沿导汽管进入温控腔<br/>
            3. 蒸汽加热双金属片（约 95~100°C）<br/>
            4. 双金属片弯曲 → 推动微动开关<br/>
            5. 主回路断开 → 停止加热<br/>
            6. 手动按下复位钮可再次加热
          </div>
        </div>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,23,68,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ff1744', marginBottom: 10 }}>⚠️ 安全注意事项</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.75 }}>
            ▸ 加水不要超过 MAX 刻度线<br/>
            ▸ 不可空烧（防干烧保护只是最后防线）<br/>
            ▸ 底座和壶体接触面保持干燥<br/>
            ▸ 电源线破损立即停用<br/>
            ▸ 不使用时断电，避免水垢在加热管积累<br/>
            ▸ 每月用白醋除水垢（降低能耗 15~30%）
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, background: 'rgba(255,107,53,.06)', border: '1px solid rgba(255,107,53,.18)', borderRadius: 12, padding: '14px 20px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 8 }}>🔧 热水壶常见故障排查</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 8 }}>
          {['通电不加热 → 检查温控开关是否卡死，或热熔断器是否断路（用万用表测通断）',
            '水烧开不自动断电 → 导汽管堵塞或双金属片变形，清洗导汽孔',
            '漏电感应 → 发热管绝缘层受损，建议直接更换，禁止带电操作',
            '加热效率下降 → 水垢覆盖发热管，用柠檬酸或白醋溶液浸泡 30min 再冲洗',
          ].map(t => (
            <div key={t} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>
              <span style={{ color: ACC, flexShrink: 0 }}>▸</span>{t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
