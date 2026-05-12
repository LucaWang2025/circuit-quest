import { useEffect, useRef, useState } from 'react';

const TABS = [
  { id: 'volts', label: '⚡ 测电压' },
  { id: 'amps',  label: '〜 测电流' },
  { id: 'ohms',  label: 'Ω 测电阻' },
];

const STEPS = {
  volts: {
    title: '⚡ 测量直流电压 (DCV)',
    steps: [
      '旋钮拨到 <b>DCV 区域</b>，选择大于被测电压的量程（如测 5V 选 20V 档）',
      '<b>红表笔</b> 插入 VΩmA 插孔，<b>黑表笔</b> 插入 COM 插孔',
      '红笔接被测点<b>正极（高电位）</b>，黑笔接<b>负极（地）</b>',
      '读取液晶屏数值，单位 <b>V</b>；若显示负值则表笔接反了',
    ],
    tip: '💡 测量<b>交流电压 (ACV)</b> 步骤相同，旋钮拨至 ACV 区域，表笔无需分正负',
  },
  amps: {
    title: '〜 测量直流电流 (DCA)',
    steps: [
      '旋钮拨到 <b>DCA 区域</b>，选合适量程',
      '测小电流（&lt;200mA）红笔插 mA 孔；测大电流（&lt;10A）红笔插 <b>10A 孔</b>',
      '将万用表<b>串联</b>入电路（需先断开电路，再把万用表接入）',
      '电源正极 → 红表笔 → 黑表笔 → 负极，读取 <b>A 或 mA</b> 值',
    ],
    warn: '⚠ <b>严重警告！</b> 测电流时，绝对不能将表笔并联在电路两端！万用表内阻极低，并联等于短路，会立刻烧毁仪表，甚至引起燃烧！',
  },
  ohms: {
    title: 'Ω 测量电阻',
    steps: [
      '旋钮拨到 <b>Ω 区域</b>，估计阻值选择合适量程',
      '<b>确认电路完全断电</b>，将被测电阻从电路中取出或断开一端',
      '两表笔分别碰触电阻两端引脚（不分正负极）',
      '读取数值，单位 <b>Ω / kΩ / MΩ</b>；若显示 OL 则量程太小，换大档',
    ],
    warn: '⚠ <b>注意！</b> 在带电电路中测量电阻，会得到错误数值，并可能损坏万用表。务必断电后再测！',
  },
};

export default function Multimeter() {
  const canvasRef = useRef(null);
  const [tab, setTab] = useState('volts');

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    const W = 300, H = 400;
    let fr = 0, dispVal = 0, targVal = 12.58, dialPhase = 0, rafId;

    function draw() {
      cx.clearRect(0, 0, W, H);
      fr++; dialPhase += 0.018;
      dispVal += (targVal - dispVal) * 0.04;
      if (Math.abs(dispVal - targVal) < 0.01) targVal = 5 + Math.random() * 20;

      // Body
      cx.shadowColor = 'rgba(140,109,255,.35)'; cx.shadowBlur = 22;
      cx.fillStyle = '#141428';
      cx.beginPath(); cx.roundRect ? cx.roundRect(30, 18, 240, 340, 20) : cx.rect(30, 18, 240, 340);
      cx.fill(); cx.shadowBlur = 0;
      cx.strokeStyle = 'rgba(156,125,255,.42)'; cx.lineWidth = 1.5;
      cx.beginPath(); cx.roundRect ? cx.roundRect(30, 18, 240, 340, 20) : cx.rect(30, 18, 240, 340); cx.stroke();

      // Top stripe
      cx.fillStyle = '#1a1a38';
      cx.fillRect(30, 18, 240, 22);

      // LCD
      const [scx, scy, scw, sch] = [48, 44, 204, 78];
      cx.fillStyle = '#060e06'; cx.beginPath(); cx.roundRect ? cx.roundRect(scx, scy, scw, sch, 8) : cx.rect(scx, scy, scw, sch); cx.fill();
      cx.strokeStyle = 'rgba(0,200,60,.2)'; cx.lineWidth = 1; cx.stroke();
      cx.fillStyle = 'rgba(0,180,50,.1)'; cx.font = 'bold 36px "Courier New"'; cx.textAlign = 'right';
      cx.fillText('88.88', scx + scw - 10, scy + 55);
      cx.fillStyle = '#00ff55'; cx.shadowColor = '#00ff44'; cx.shadowBlur = 9;
      cx.fillText(dispVal.toFixed(2), scx + scw - 10, scy + 55); cx.shadowBlur = 0;
      cx.fillStyle = '#00cc44'; cx.font = 'bold 13px monospace'; cx.textAlign = 'left';
      cx.fillText('DCV', scx + 10, scy + 30);
      cx.fillStyle = 'rgba(0,200,60,.6)'; cx.font = '10px monospace';
      cx.fillText('AUTO', scx + 10, scy + 55);

      // Brand
      cx.fillStyle = 'rgba(156,125,255,.6)'; cx.font = 'bold 11px monospace'; cx.textAlign = 'center';
      cx.fillText('CIRCUIT·QUEST  DT-830', W / 2, scy + sch + 20);

      // Dial
      const [dcx, dcy, dr] = [W / 2, scy + sch + 70, 52];
      cx.fillStyle = '#0e0e20'; cx.beginPath(); cx.arc(dcx, dcy, dr + 6, 0, Math.PI * 2); cx.fill();
      cx.strokeStyle = 'rgba(156,125,255,.3)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(dcx, dcy, dr + 6, 0, Math.PI * 2); cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = .8;
      for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        cx.beginPath(); cx.moveTo(dcx + Math.cos(a) * (dr - 2), dcy + Math.sin(a) * (dr - 2));
        cx.lineTo(dcx + Math.cos(a) * (dr + 4), dcy + Math.sin(a) * (dr + 4)); cx.stroke();
      }
      [[-2.3,'#888','OFF'],[-1.6,'#ffab00','DCV'],[-.65,'#ff6b35','ACV'],[.3,'#00bcd4','mA'],[1.2,'#ff6b35','Ω'],[1.95,'#9c7dff','CAP']].forEach(([a, c, t]) => {
        cx.fillStyle = c; cx.font = 'bold 8px monospace'; cx.textAlign = 'center';
        cx.fillText(t, dcx + Math.cos(a) * (dr - 14), dcy + Math.sin(a) * (dr - 14) + 3);
      });

      // Pointer
      const pA = -Math.PI / 2 - 1.6 + Math.sin(dialPhase) * 0.22;
      cx.strokeStyle = '#ff2244'; cx.lineWidth = 2.5; cx.lineCap = 'round';
      cx.shadowColor = '#ff2244'; cx.shadowBlur = 5;
      cx.beginPath(); cx.moveTo(dcx - Math.cos(pA) * dr * 0.18, dcy - Math.sin(pA) * dr * 0.18);
      cx.lineTo(dcx + Math.cos(pA) * dr * 0.75, dcy + Math.sin(pA) * dr * 0.75); cx.stroke(); cx.shadowBlur = 0;
      cx.fillStyle = '#22224a'; cx.beginPath(); cx.arc(dcx, dcy, 11, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#ff2244'; cx.beginPath(); cx.arc(dcx, dcy, 5, 0, Math.PI * 2); cx.fill();

      // Sockets
      const sockY = scy + sch + 150;
      [[dcx - 52, '#ff2244', '10A'], [dcx, '#555', 'COM'], [dcx + 52, '#ff2244', 'VΩmA']].forEach(([sx, c, lb]) => {
        cx.fillStyle = '#0d0d1a'; cx.beginPath(); cx.arc(sx, sockY, 10, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = c; cx.lineWidth = 2; cx.beginPath(); cx.arc(sx, sockY, 10, 0, Math.PI * 2); cx.stroke();
        cx.fillStyle = c + 'cc'; cx.beginPath(); cx.arc(sx, sockY, 5, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = 'rgba(160,185,200,.55)'; cx.font = '8px monospace'; cx.textAlign = 'center';
        cx.fillText(lb, sx, sockY + 22);
      });

      // Probes
      cx.strokeStyle = '#cc1133'; cx.lineWidth = 2.5;
      cx.beginPath(); cx.moveTo(dcx + 52, sockY + 12); cx.lineTo(W * .78, H - 24); cx.stroke();
      cx.fillStyle = '#ff2244'; cx.beginPath(); cx.arc(W * .78, H - 22, 5, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.moveTo(W * .78 - 2, H - 22); cx.lineTo(W * .78 + 2, H - 22); cx.lineTo(W * .78, H - 10); cx.closePath(); cx.fill();
      cx.strokeStyle = '#4a4a5a'; cx.lineWidth = 2.5;
      cx.beginPath(); cx.moveTo(dcx, sockY + 12); cx.lineTo(W * .28, H - 24); cx.stroke();
      cx.fillStyle = '#666'; cx.beginPath(); cx.arc(W * .28, H - 22, 5, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#888'; cx.beginPath(); cx.moveTo(W * .28 - 2, H - 22); cx.lineTo(W * .28 + 2, H - 22); cx.lineTo(W * .28, H - 10); cx.closePath(); cx.fill();

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const info = STEPS[tab];
  const PU = 'var(--purple)';

  return (
    <section id="multimeter" className="sec">
      <div className="sh">
        <span className="sh-icon">📟</span>
        <div className="sh-tag">Basic Electronics · Chapter 04</div>
        <h2 className="sh-title" style={{ color: PU, textShadow: '0 0 35px rgba(156,125,255,.38)' }}>万用表 · Multimeter</h2>
        <p className="sh-sub">万用表是电工的"瑞士军刀"——一台仪器测电压、电流、电阻，排查故障必不可少。</p>
        <div className="divider" style={{ background: 'linear-gradient(90deg,transparent,var(--purple),transparent)' }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.18)', minHeight: 440 }}>
          <canvas ref={canvasRef} width={300} height={400} />
        </div>

        <div className="reveal">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '7px 20px', borderRadius: 9,
                  border: `1px solid ${tab === t.id ? PU : 'rgba(156,125,255,.22)'}`,
                  background: tab === t.id ? 'rgba(156,125,255,.14)' : 'transparent',
                  color: tab === t.id ? PU : 'var(--dim)',
                  cursor: 'pointer', font: '13px/1 inherit', transition: 'all .24s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="glass" style={{ borderColor: 'rgba(156,125,255,.15)' }}>
            <div style={{ font: 'bold 13px "Courier New",monospace', color: PU, marginBottom: 16 }}>{info.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {info.steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: 27, height: 27, borderRadius: '50%', background: 'rgba(156,125,255,.18)', border: '1px solid rgba(156,125,255,.45)', color: PU, font: 'bold 11px/1 monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                  <div style={{ fontSize: 13.5, color: '#aabac8', paddingTop: 4 }} dangerouslySetInnerHTML={{ __html: s.replace(/<b>/g,"<strong style='color:var(--white)'>").replace(/<\/b>/g,'</strong>') }} />
                </div>
              ))}
            </div>
            {info.tip && (
              <div style={{ marginTop: 14, padding: '11px 15px', background: 'rgba(156,125,255,.08)', borderRadius: 8, fontSize: 12.5, color: '#8899aa' }}
                dangerouslySetInnerHTML={{ __html: info.tip.replace(/<b>/g,"<strong style='color:var(--white)'>").replace(/<\/b>/g,'</strong>') }} />
            )}
            {info.warn && (
              <div style={{ background: 'rgba(255,23,68,.07)', border: '1px solid rgba(255,23,68,.28)', borderRadius: 10, padding: '14px 18px', marginTop: 14, fontSize: 13, color: '#ff6680' }}
                dangerouslySetInnerHTML={{ __html: info.warn.replace(/<b>/g,"<strong style='color:var(--red)'>").replace(/<\/b>/g,'</strong>') }} />
            )}
          </div>

          <div className="icard" style={{ borderLeftColor: PU, marginTop: 14 }}>
            <h4 style={{ color: PU }}>万用表各部件说明</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 2 }}>
              📺 <strong style={{ color: 'var(--white)' }}>LCD 液晶屏</strong> — 显示测量数值及单位<br />
              🔘 <strong style={{ color: 'var(--white)' }}>旋转选择开关</strong> — 切换测量类型及量程<br />
              🔴 <strong style={{ color: 'var(--white)' }}>红表笔（VΩmA / 10A）</strong> — 接正极或被测点<br />
              ⚫ <strong style={{ color: 'var(--white)' }}>黑表笔（COM）</strong> — 接负极或参考地
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
