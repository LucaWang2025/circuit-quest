import { useEffect, useRef } from 'react';

const COLOR_BANDS = [
  ['#111','黑',0,'×1 Ω','—'],['#7B3F00','棕',1,'×10','±1%'],['#cc0000','红',2,'×100','±2%'],
  ['#ff8c00','橙',3,'×1 kΩ','—'],['#ffd700','黄',4,'×10 kΩ','—'],['#007a00','绿',5,'×100 kΩ','±0.5%'],
  ['#0000bb','蓝',6,'×1 MΩ','±0.25%'],['#888','灰',8,'×100 MΩ','—'],['#ddd','白',9,'×1 GΩ','—'],
  ['#ffd700','金','—','×0.1','±5%'],
];

export default function Resistance() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    const W = 340, H = 190;
    const WY = H / 2 - 8;
    const R1 = 82, R2 = 255;

    const elecs = Array.from({ length: 10 }, (_, i) => ({ t: i / 10, baseSpd: 0.0065 }));
    const heats = Array.from({ length: 6 }, (_, i) => ({ x: R1 + 20 + i * 28, y: WY, life: Math.random() }));
    let fr = 0, rafId;

    function draw() {
      cx.clearRect(0, 0, W, H);
      fr++;
      const rx = (R1 + R2) / 2;

      cx.strokeStyle = 'rgba(0,188,212,.35)'; cx.lineWidth = 3.5; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(14, WY); cx.lineTo(R1, WY); cx.stroke();
      cx.beginPath(); cx.moveTo(R2, WY); cx.lineTo(W - 14, WY); cx.stroke();

      // Arrow hints
      cx.strokeStyle = 'rgba(0,188,212,.2)'; cx.lineWidth = 1;
      [60, 300].forEach(x => {
        cx.beginPath(); cx.moveTo(x, WY + 18); cx.lineTo(x + 14, WY + 18); cx.stroke();
        cx.beginPath(); cx.moveTo(x + 14, WY + 18); cx.lineTo(x + 10, WY + 14); cx.stroke();
        cx.beginPath(); cx.moveTo(x + 14, WY + 18); cx.lineTo(x + 10, WY + 22); cx.stroke();
      });
      cx.fillStyle = 'rgba(0,188,212,.3)'; cx.font = '10px monospace'; cx.textAlign = 'center';
      cx.fillText('→ 电流方向', W / 2, WY + 36);

      // Glow
      const glow = 0.06 + Math.sin(fr * 0.05) * 0.03;
      const rg = cx.createLinearGradient(R1, WY - 30, R1, WY + 30);
      rg.addColorStop(0, `rgba(255,107,53,${glow})`); rg.addColorStop(.5, `rgba(255,107,53,${glow * 2})`); rg.addColorStop(1, `rgba(255,107,53,${glow})`);
      cx.fillStyle = rg; cx.fillRect(R1 - 4, WY - 28, R2 - R1 + 8, 56);

      // Body
      cx.fillStyle = '#8B5A2B'; cx.beginPath(); cx.rect(R1, WY - 15, R2 - R1, 30); cx.fill();
      cx.strokeStyle = 'rgba(255,107,53,.45)'; cx.lineWidth = 1.5; cx.stroke();
      [{ c: '#ffd700', x: R1 + 18 }, { c: '#7B00B4', x: R1 + 38 }, { c: '#7B3F00', x: R1 + 58 }, { c: '#ffd700', x: R2 - 26 }].forEach(b => {
        cx.fillStyle = b.c; cx.fillRect(b.x, WY - 15, 13, 30);
        cx.strokeStyle = 'rgba(0,0,0,.3)'; cx.lineWidth = .5; cx.strokeRect(b.x, WY - 15, 13, 30);
      });
      cx.fillStyle = 'rgba(255,107,53,.85)'; cx.font = 'bold 13px monospace'; cx.textAlign = 'center';
      cx.fillText('470 Ω', rx, WY + 28);

      // Heat
      heats.forEach(h => {
        h.life += 0.018; h.y -= 0.4;
        if (h.life > 1 || h.y < WY - 40) { h.life = 0; h.y = WY; h.x = R1 + 15 + Math.random() * (R2 - R1 - 30); }
        cx.fillStyle = `rgba(255,120,40,${(1 - h.life) * 0.5})`;
        cx.font = `${10 + h.life * 4}px monospace`; cx.textAlign = 'center';
        cx.fillText('∿', h.x, h.y);
      });

      // Electrons
      elecs.forEach(e => {
        e.t += e.baseSpd; if (e.t > 1) e.t = 0;
        const rS = R1 / W, rE = R2 / W;
        let ex, inR;
        if (e.t < rS) { ex = e.t / rS * R1; inR = false; }
        else if (e.t < rE) { ex = R1 + (e.t - rS) / (rE - rS) * (R2 - R1); inR = true; }
        else { ex = R2 + (e.t - rE) / (1 - rE) * (W - 14 - R2); inR = false; }
        const col = inR ? 'rgba(255,107,53,0.9)' : 'rgba(0,188,212,0.9)';
        const sz = inR ? 3 : 5.5;
        const eg = cx.createRadialGradient(ex, WY, 0, ex, WY, sz * 1.5);
        eg.addColorStop(0, col); eg.addColorStop(1, 'rgba(0,188,212,0)');
        cx.fillStyle = eg; cx.beginPath(); cx.arc(ex, WY, sz * 1.5, 0, Math.PI * 2); cx.fill();
      });

      cx.fillStyle = 'rgba(0,188,212,.55)'; cx.font = '10px monospace'; cx.textAlign = 'center';
      cx.fillText('自由流动', 38, WY - 25);
      cx.fillStyle = 'rgba(255,107,53,.65)';
      cx.fillText('碰撞阻碍 → 热量', rx, WY - 25);
      cx.fillStyle = 'rgba(0,188,212,.55)';
      cx.fillText('继续流动', W - 38, WY - 25);

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const OG = 'var(--orange)';

  return (
    <section id="resistance" className="sec">
      <div className="sh">
        <span className="sh-icon">Ω</span>
        <div className="sh-tag">Basic Electronics · Chapter 03</div>
        <h2 className="sh-title" style={{ color: OG, textShadow: '0 0 35px rgba(255,107,53,.38)' }}>电阻 · Resistance</h2>
        <p className="sh-sub">电阻是导体对电流的阻碍程度——阻力越大，相同电压下流过的电流越小，损耗的电能越多。</p>
        <div className="divider" style={{ background: 'linear-gradient(90deg,transparent,var(--orange),transparent)' }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,.18)', flexDirection: 'column', gap: 18, padding: 26 }}>
          <canvas ref={canvasRef} width={340} height={190} />
          <div style={{ width: '100%' }}>
            <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', textAlign: 'center', marginBottom: 10 }}>📌 四色环电阻读值速查</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>{['色环颜色','数值','乘数','误差'].map(h => (
                  <th key={h} style={{ background: 'rgba(255,107,53,.1)', color: OG, padding: '8px 12px', textAlign: 'left', font: 'bold 10.5px "Courier New",monospace', letterSpacing: '1.5px' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {COLOR_BANDS.map(([bg, name, val, mult, err]) => (
                  <tr key={name}>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#aabbc8' }}>
                      <span style={{ display: 'inline-block', width: 18, height: 13, borderRadius: 2, verticalAlign: 'middle', marginRight: 7, background: bg, border: bg === '#ddd' ? '1px solid #aaa' : undefined }} />
                      {name}
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#aabbc8' }}>{val}</td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#aabbc8' }}>{mult}</td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#aabbc8' }}>{err}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="info-stack reveal">
          {/* Ohm Triangle */}
          <div className="glass" style={{ borderColor: 'rgba(255,107,53,.14)', textAlign: 'center' }}>
            <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', marginBottom: 12 }}>欧姆定律三角 — 盖住待求量即得公式</div>
            <svg viewBox="0 0 220 150" width="200" style={{ display: 'block', margin: '0 auto' }}>
              <defs><filter id="glo"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
              <polygon points="110,12 202,138 18,138" fill="rgba(255,107,53,.07)" stroke="rgba(255,107,53,.3)" strokeWidth="1.5"/>
              <line x1="110" y1="12" x2="110" y2="138" stroke="rgba(255,107,53,.22)" strokeWidth="1" strokeDasharray="5,3"/>
              <text x="110" y="62" textAnchor="middle" fill="#ffab00" fontSize="26" fontWeight="900" fontFamily="monospace" filter="url(#glo)">U</text>
              <text x="55"  y="128" textAnchor="middle" fill="#00bcd4" fontSize="26" fontWeight="900" fontFamily="monospace" filter="url(#glo)">I</text>
              <text x="165" y="128" textAnchor="middle" fill="#ff6b35" fontSize="26" fontWeight="900" fontFamily="monospace" filter="url(#glo)">R</text>
            </svg>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
              {['U = I·R','I = U/R','R = U/I'].map(f => (
                <code key={f} style={{ fontSize: 13, color: '#b0c8d8', background: 'rgba(255,107,53,.08)', padding: '5px 14px', borderRadius: 7 }}>{f}</code>
              ))}
            </div>
          </div>
          {[
            ['什么是电阻？', <>电阻（Resistance）是导体阻碍电流流动的能力。单位是<strong style={{color:OG}}>欧姆（Ω）</strong>，符号 R。<br/>常用：kΩ（千欧）、MΩ（兆欧）</>],
            ['影响电阻大小的因素', <>📏 <strong style={{color:'var(--white)'}}>导体越长</strong> → 电阻越大<br/>🔷 <strong style={{color:'var(--white)'}}>截面积越大</strong> → 电阻越小<br/>🧱 <strong style={{color:'var(--white)'}}>材料电阻率</strong>：银 &lt; 铜 &lt; 铝 &lt; 铁 &lt; 碳<br/>🌡 <strong style={{color:'var(--white)'}}>温度越高</strong> → 多数导体电阻增大</>],
            ['常用电阻值参考', <div className="chips">{['220Ω LED限流','1kΩ 通用分压','10kΩ 上拉/下拉','100kΩ 高阻抗','1MΩ 输入保护'].map(t=><span key={t} className="chip" style={{color:OG}}>{t}</span>)}</div>],
          ].map(([title, body]) => (
            <div key={title} className="icard" style={{ borderLeftColor: OG }}>
              <h4 style={{ color: OG }}>{title}</h4>
              <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
