import { useEffect, useRef, useState } from 'react';

const ACC = '#ff9800';

function HairDryerCanvas({ speed, heat }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, raf;
    const HEAT_COLORS = { cold: 'rgba(100,180,255,', low: 'rgba(255,200,100,', high: 'rgba(255,80,20,' };
    const particles = Array.from({ length: 30 }, () => ({
      x: W * 0.72 + Math.random() * 30,
      y: H / 2 + (Math.random() - 0.5) * 50,
      vx: Math.random() * 2 + 1, vy: (Math.random() - 0.5) * 0.6,
      life: Math.random(),
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.04;

      const motorOn = speed !== 'off';
      const rpm = speed === 'low' ? 1.5 : speed === 'high' ? 4 : 0;

      // ── Air flow particles ──
      if (motorOn) {
        const hColor = HEAT_COLORS[heat] ?? HEAT_COLORS.cold;
        particles.forEach(p => {
          p.x += p.vx * rpm * 0.6;
          p.y += p.vy + Math.sin(t * 2 + p.life * 10) * 0.3;
          p.life += 0.02;
          if (p.x > W * 0.95 || p.life > 1) {
            p.x = W * 0.72 + Math.random() * 20;
            p.y = H / 2 + (Math.random() - 0.5) * 45;
            p.life = 0; p.vx = Math.random() * 1.5 + 0.8;
          }
          const alpha = (1 - p.life) * 0.45 * (rpm / 4);
          const r = 2 + p.life * 3;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = hColor + alpha + ')'; ctx.fill();
        });
      }

      // ── Dryer body ──
      const BX = W * 0.35, BY = H / 2;
      // Nozzle body (cylinder)
      const bodyGrad = ctx.createLinearGradient(BX - 15, BY - 24, BX + 15, BY + 24);
      bodyGrad.addColorStop(0, '#666'); bodyGrad.addColorStop(0.5, '#aaa'); bodyGrad.addColorStop(1, '#666');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.roundRect(BX - 55, BY - 22, 130, 44, 8); ctx.fill();

      // Nozzle (outlet end, left)
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.moveTo(BX - 55, BY - 22); ctx.lineTo(BX - 75, BY - 18); ctx.lineTo(BX - 75, BY + 18); ctx.lineTo(BX - 55, BY + 22); ctx.closePath(); ctx.fill();

      // Inlet grille (right side, back)
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath(); ctx.moveTo(BX + 73, BY + i * 5); ctx.lineTo(BX + 82, BY + i * 5); ctx.stroke();
      }

      // Handle
      const hGrad = ctx.createLinearGradient(BX + 10, BY + 22, BX + 10, BY + 80);
      hGrad.addColorStop(0, '#555'); hGrad.addColorStop(1, '#333');
      ctx.fillStyle = hGrad;
      ctx.beginPath(); ctx.roundRect(BX, BY + 20, 24, 65, 8); ctx.fill();
      // Power cord
      ctx.strokeStyle = '#333'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(BX + 12, BY + 85);
      ctx.bezierCurveTo(BX + 12, BY + 110, BX + 30, BY + 115, BX + 50, BY + 115); ctx.stroke();

      // Heating coil (inside body, visible glow)
      if (heat !== 'cold' && motorOn) {
        const hIntensity = heat === 'high' ? 1 : 0.5;
        const glow = ctx.createRadialGradient(BX - 10, BY, 0, BX - 10, BY, 35);
        glow.addColorStop(0, `rgba(255,120,20,${0.4 * hIntensity * (0.8 + 0.2 * Math.sin(t * 5))})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.fillRect(BX - 50, BY - 22, 100, 44);
        // Coil wires
        ctx.strokeStyle = `rgba(255,${heat === 'high' ? 60 : 140},20,${0.6 * hIntensity})`;
        ctx.lineWidth = 2; ctx.shadowColor = ACC; ctx.shadowBlur = 5;
        for (let i = 0; i < 5; i++) {
          const cx = BX - 35 + i * 12;
          ctx.beginPath(); ctx.moveTo(cx, BY - 16); ctx.lineTo(cx, BY + 16); ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // Fan blades (inside, visible through semi-transparent body)
      if (motorOn) {
        const bladeCount = 5;
        const fanR = 16;
        for (let i = 0; i < bladeCount; i++) {
          const angle = (i / bladeCount) * Math.PI * 2 + t * rpm;
          const bx = BX + 38 + Math.cos(angle) * fanR;
          const by = BY + Math.sin(angle) * fanR;
          ctx.strokeStyle = 'rgba(180,200,220,.4)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(BX + 38, BY); ctx.lineTo(bx, by); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(180,200,220,.5)';
        ctx.beginPath(); ctx.arc(BX + 38, BY, 4, 0, Math.PI * 2); ctx.fill();
      }

      // Speed / temp labels
      ctx.textAlign = 'center'; ctx.font = '11px "Courier New",monospace';
      ctx.fillStyle = motorOn ? ACC : 'var(--dim)';
      ctx.fillText(`档位: ${speed === 'off' ? '关' : speed === 'low' ? '低速' : '高速'}  热风: ${{ cold: '冷风', low: '温热', high: '高温' }[heat]}`, W / 2, H - 14);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [speed, heat]);
  return <canvas ref={ref} width={340} height={260} style={{ maxWidth: '100%' }} />;
}

export default function HairDryer() {
  const [speed, setSpeed] = useState('high');
  const [heat, setHeat] = useState('high');

  return (
    <section id="hair-dryer" className="sec">
      <div className="sh">
        <span className="sh-icon">💨</span>
        <div className="sh-tag">Stage 3 · Small Appliance · Hair Dryer</div>
        <h2 className="sh-title" style={{ color: ACC }}>电吹风电路设计</h2>
        <p className="sh-sub">串励电机调速、镍铬合金发热丝、档位切换开关、过热保护——2000W 家电背后的电路逻辑。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,152,0,.2)', flexDirection: 'column', gap: 14 }}>
          <HairDryerCanvas speed={speed} heat={heat} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['off','low','high'].map(s => (
                <button key={s} onClick={() => setSpeed(s)} style={{
                  padding: '6px 14px', borderRadius: 18, cursor: 'pointer',
                  border: `1px solid ${speed === s ? ACC : 'rgba(255,152,0,.22)'}`,
                  background: speed === s ? 'rgba(255,152,0,.15)' : 'transparent',
                  color: speed === s ? ACC : 'var(--dim)', font: '12px/1 inherit', transition: 'all .18s',
                }}>{{ off: '⏸ 关', low: '🌬 低速', high: '💨 高速' }[s]}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['cold','low','high'].map(h => (
                <button key={h} onClick={() => setHeat(h)} style={{
                  padding: '6px 14px', borderRadius: 18, cursor: 'pointer',
                  border: `1px solid ${heat === h ? '#ff6b35' : 'rgba(255,107,53,.22)'}`,
                  background: heat === h ? 'rgba(255,107,53,.15)' : 'transparent',
                  color: heat === h ? '#ff6b35' : 'var(--dim)', font: '12px/1 inherit', transition: 'all .18s',
                }}>{{ cold: '❄️ 冷风', low: '🌡 温热', high: '🔥 高温' }[h]}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass" style={{ borderColor: 'rgba(255,152,0,.18)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 10 }}>🔌 电路拓扑结构</div>
            {[
              ['串励电机', '#ff9800', '转子与定子线圈串联，工作在 220V AC，转速随负载变化（无风时转速极高）。速度通过在定子线圈串联电阻（低档）或直连（高档）切换'],
              ['发热电阻丝', '#ff6b35', 'Ni-Cr（镍铬）合金丝，高档约 1600W，低档约 800W（一半丝断开），冷风档完全断开。以 ~1000°C 高温工作，外有云母片绝缘隔热'],
              ['双金属片过热保护', '#ffab00', '位于发热元件旁，机身温度超过 80°C 时自动断开全部电路，冷却后自动复位（部分型号需手动复位）'],
              ['负离子发生器（选配）', '#9c7dff', '高压振荡电路（~5kV）让空气中的氧分子负离子化，输出负离子减少静电，护发功能的来源'],
            ].map(([name, color, d]) => (
              <div key={name} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ fontWeight: 700, color, fontSize: 13, marginBottom: 3 }}>{name}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,152,0,.18)' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 8 }}>⚡ 典型功率对照</div>
          {[['高速高温', '1800~2200W', '9.1~10A'],['高速冷风', '250~400W', '1.4~1.8A'],['低速低温', '600~900W', '3~4A'],['低速冷风', '100~180W', '~0.8A']].map(([m,p,i])=>(
            <div key={m} style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
              <span style={{color:'#8aacb8'}}>{m}</span>
              <span style={{color:ACC, font:'12px "Courier New",monospace'}}>{p}</span>
              <span style={{color:'var(--dim)', font:'11px "Courier New",monospace'}}>{i}</span>
            </div>
          ))}
        </div>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,107,53,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ff6b35', marginBottom: 8 }}>🔧 维修常见问题</div>
          {['不转不热 → 检查开关触点是否烧蚀，或热保护器是否断路','只转不热 → 发热丝断裂，目视检查或万用表测量','只热不转 → 电机炭刷磨损，观察换向器是否发黑','过热自停后不恢复 → 保护器卡死，轻轻敲击壳体或检查复位按钮'].map(t=>(
            <div key={t} style={{display:'flex',gap:8,fontSize:12.5,color:'#8aacb8',lineHeight:1.55,marginBottom:5}}>
              <span style={{color:'#ff6b35',flexShrink:0}}>▸</span>{t}
            </div>
          ))}
        </div>
        <div className="glass reveal" style={{ borderColor: 'rgba(255,23,68,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ff1744', marginBottom: 8 }}>⚠️ 安全规范</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.75 }}>
            ▸ 远离水源，严禁在浴缸边使用<br/>
            ▸ 不要遮挡进风口，防过热起火<br/>
            ▸ 使用后先冷风吹 30 秒再关机<br/>
            ▸ 不要拆解负离子高压电路（5kV！）<br/>
            ▸ 电源线卷绕会加速绝缘老化
          </div>
        </div>
      </div>
    </section>
  );
}
