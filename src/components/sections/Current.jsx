import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';

export default function Current() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = setupHiDpi(cv, 360, 360);
    const W = 360, H = 360;
    const MX = W / 2, MY = H / 2 - 10;
    const RW = 128, RH = 100;

    const lsegs = [
      { x1: MX - RW, y1: MY - RH, x2: MX + RW, y2: MY - RH },
      { x1: MX + RW, y1: MY - RH, x2: MX + RW, y2: MY + RH },
      { x1: MX + RW, y1: MY + RH, x2: MX - RW, y2: MY + RH },
      { x1: MX - RW, y1: MY + RH, x2: MX - RW, y2: MY - RH },
    ];
    const totalLen = (RW + RH) * 4;

    function loopPt(t) {
      t = ((t % 1) + 1) % 1;
      const lens = [RW * 2, RH * 2, RW * 2, RH * 2];
      let d = t * totalLen, acc = 0;
      for (let i = 0; i < lsegs.length; i++) {
        if (d <= acc + lens[i]) {
          const r = (d - acc) / lens[i];
          return { x: lsegs[i].x1 + (lsegs[i].x2 - lsegs[i].x1) * r, y: lsegs[i].y1 + (lsegs[i].y2 - lsegs[i].y1) * r };
        }
        acc += lens[i];
      }
      return { x: lsegs[0].x1, y: lsegs[0].y1 };
    }

    const N = 18;
    const elecs = Array.from({ length: N }, (_, i) => ({ t: i / N, sp: 0.0038 + Math.random() * 0.0008 }));
    let fr = 0, rafId;

    function draw() {
      cx.clearRect(0, 0, W, H);
      fr++;

      // Wires
      cx.strokeStyle = 'rgba(0,188,212,0.3)'; cx.lineWidth = 3; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(MX - RW, MY - RH); cx.lineTo(MX - 22, MY - RH); cx.stroke();
      cx.beginPath(); cx.moveTo(MX + 22, MY - RH); cx.lineTo(MX + RW, MY - RH); cx.stroke();
      cx.beginPath();
      cx.moveTo(MX + RW, MY - RH); cx.lineTo(MX + RW, MY - RH + 30);
      cx.moveTo(MX + RW, MY + RH - 30); cx.lineTo(MX + RW, MY + RH);
      cx.lineTo(MX - RW, MY + RH); cx.lineTo(MX - RW, MY - RH);
      cx.stroke();

      // Battery
      const bx = MX, by = MY - RH;
      [{ y: -10, w: 16 }, { y: -6, w: 10 }, { y: 6, w: 16 }, { y: 10, w: 10 }].forEach(b => {
        cx.strokeStyle = 'rgba(255,171,0,.75)'; cx.lineWidth = 2.5; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(bx - b.w / 2, by + b.y); cx.lineTo(bx + b.w / 2, by + b.y); cx.stroke();
      });
      cx.fillStyle = 'rgba(255,171,0,.75)'; cx.font = 'bold 12px monospace'; cx.textAlign = 'center';
      cx.fillText('+', bx + 24, by + 5);
      cx.fillStyle = 'rgba(100,200,230,.7)'; cx.fillText('−', bx - 24, by + 5);

      // Resistor
      const rx = MX + RW, ry = MY;
      cx.fillStyle = 'rgba(180,100,40,.65)'; cx.strokeStyle = 'rgba(255,107,53,.5)'; cx.lineWidth = 1.5;
      cx.beginPath(); cx.rect(rx - 12, ry - 22, 24, 44); cx.fill(); cx.stroke();
      ['#ffd700', '#7B3F00', '#8B0000', '#ffd700'].forEach((c, i) => {
        cx.fillStyle = c; cx.fillRect(rx - 12, ry - 14 + i * 8, 24, 6);
      });
      cx.fillStyle = 'rgba(255,107,53,.7)'; cx.font = 'bold 11px monospace'; cx.textAlign = 'center';
      cx.fillText('R', rx, ry + 6);

      // LED
      const lx = MX, ly = MY + RH;
      const lgA = 0.28 + Math.sin(fr * 0.07) * 0.18;
      const lg = cx.createRadialGradient(lx, ly, 0, lx, ly, 26);
      lg.addColorStop(0, `rgba(0,230,120,${lgA})`); lg.addColorStop(1, 'transparent');
      cx.fillStyle = lg; cx.beginPath(); cx.arc(lx, ly, 26, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = 'rgba(0,230,118,.6)';
      cx.beginPath(); cx.moveTo(lx - 11, ly - 9); cx.lineTo(lx + 11, ly - 9); cx.lineTo(lx, ly + 9); cx.closePath(); cx.fill();
      cx.strokeStyle = 'rgba(0,230,118,.8)'; cx.lineWidth = 1.5; cx.stroke();
      cx.fillStyle = 'rgba(0,230,118,.7)'; cx.font = 'bold 10px monospace';
      cx.fillText('LED', lx, ly + 24);

      // Electrons
      elecs.forEach(e => {
        e.t += e.sp; if (e.t > 1) e.t = 0;
        const p = loopPt(e.t);
        const eg = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5.5);
        eg.addColorStop(0, 'rgba(0,229,255,1)'); eg.addColorStop(.5, 'rgba(0,200,255,.55)'); eg.addColorStop(1, 'rgba(0,188,212,0)');
        cx.fillStyle = eg; cx.beginPath(); cx.arc(p.x, p.y, 5.5, 0, Math.PI * 2); cx.fill();
      });

      cx.fillStyle = 'rgba(160,200,220,.55)'; cx.font = '11px monospace'; cx.textAlign = 'center';
      cx.fillText('电子流向（顺时针）', MX, H - 12);
      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const CYAN = 'var(--cyan)';

  return (
    <section id="current" className="sec">
      <div className="sh">
        <span className="sh-icon">〜</span>
        <div className="sh-tag">Basic Electronics · Chapter 02</div>
        <h2 className="sh-title" style={{ color: CYAN, textShadow: '0 0 35px rgba(0,188,212,.38)' }}>电流 · Current</h2>
        <p className="sh-sub">电流是电荷的定向流动——电压越大、阻力越小，单位时间流过的电荷量就越多。</p>
        <div className="divider" style={{ background: 'linear-gradient(90deg,transparent,var(--cyan),transparent)' }} />
      </div>

      <div className="grid2 rev">
        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,188,212,.14)' }}>
            <div className="formula" style={{ color: CYAN, textShadow: '0 0 22px rgba(0,188,212,.55)' }}>I = U ÷ R</div>
            <div className="fdesc">欧姆定律 · 电流（A） = 电压（V） ÷ 电阻（Ω）</div>
          </div>
          {[
            ['什么是电流？', <>电流（Current）是单位时间内通过导体横截面的电荷量。单位是<strong style={{color:CYAN}}>安培（A）</strong>，符号 I。<br/>常用单位：毫安 <strong style={{color:CYAN}}>mA</strong>（1A = 1000mA）</>],
            ['↔ 电流方向', <><strong style={{color:'var(--white)'}}>传统电流方向：</strong>正极 → 负极（＋→－）<br/><strong style={{color:'var(--white)'}}>电子实际运动：</strong>负极 → 正极（－→＋）<br/>物理规定：<em>正电荷移动方向</em>为电流正方向</>],
            ['生活中的电流值', <div className="chips">{['LED灯 20mA','蓝牙耳机 50mA','手机快充 3–5A','电吹风 5–10A','电动车 20–50A'].map(t=><span key={t} className="chip" style={{color:CYAN}}>{t}</span>)}</div>],
            ['串联 vs 并联', <><strong style={{color:'var(--white)'}}>串联：</strong>电流相同，电压分配<br/><strong style={{color:'var(--white)'}}>并联：</strong>电压相同，电流分配<br/>口诀：<em>串分压、并分流</em></>],
          ].map(([title, body]) => (
            <div key={title} className="icard" style={{ borderLeftColor: CYAN }}>
              <h4 style={{ color: CYAN }}>{title}</h4>
              <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>

        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.18)', minHeight: 400 }}>
          <canvas ref={canvasRef} width={360} height={360} />
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', marginTop: 10, textAlign: 'center' }}>
            蓝色粒子 = 电子（顺时针）· 传统电流方向相反（逆时针）
          </div>
        </div>
      </div>
    </section>
  );
}
