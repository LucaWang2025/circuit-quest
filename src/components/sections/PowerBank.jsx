import { useEffect, useRef, useState } from 'react';

const ACC = '#00bcd4';

function PowerBankCanvas({ charging, outputting, soc }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, raf;

    function drawArrow(x1, y1, x2, y2, color, speed, flowing) {
      if (!flowing) return;
      ctx.strokeStyle = color + '55'; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      // Moving dot
      const progress = (t * speed) % 1;
      const px = x1 + (x2 - x1) * progress;
      const py = y1 + (y2 - y1) * progress;
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      const CX = W / 2, CY = H / 2 - 10;

      // ── Central power bank body ──
      const pbW = 80, pbH = 140;
      const pbGrad = ctx.createLinearGradient(CX - pbW/2, CY - pbH/2, CX + pbW/2, CY + pbH/2);
      pbGrad.addColorStop(0, '#2a2a3a'); pbGrad.addColorStop(1, '#1a1a28');
      ctx.fillStyle = pbGrad;
      ctx.beginPath(); ctx.roundRect(CX - pbW/2, CY - pbH/2, pbW, pbH, 10); ctx.fill();
      ctx.strokeStyle = ACC + '44'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(CX - pbW/2, CY - pbH/2, pbW, pbH, 10); ctx.stroke();

      // Battery cells inside (3 cells stacked)
      const cellH = 30, gap = 6;
      const totalH = 3 * cellH + 2 * gap;
      const startY = CY - totalH / 2;
      [0, 1, 2].forEach(i => {
        const cy = startY + i * (cellH + gap);
        const cellFill = soc / 100;
        const fH = cellFill * (cellH - 4);
        const fc = soc > 50 ? '#00e676' : soc > 20 ? '#ffab00' : '#ff1744';
        ctx.fillStyle = 'rgba(255,255,255,.06)';
        ctx.beginPath(); ctx.roundRect(CX - 28, cy, 56, cellH, 4); ctx.fill();
        if (fH > 0) {
          ctx.fillStyle = fc + 'cc';
          ctx.beginPath(); ctx.roundRect(CX - 26, cy + (cellH - 4) - fH + 2, 52, fH, 3); ctx.fill();
        }
        // Terminal
        ctx.fillStyle = 'rgba(255,255,255,.15)';
        ctx.beginPath(); ctx.roundRect(CX - 10, cy - 4, 20, 4, 2); ctx.fill();
      });

      // USB-C port (top)
      ctx.fillStyle = charging ? 'rgba(0,230,118,.6)' : 'rgba(255,255,255,.15)';
      ctx.beginPath(); ctx.roundRect(CX - 8, CY - pbH/2 - 6, 16, 7, 2); ctx.fill();
      ctx.fillStyle = 'rgba(30,30,50,1)'; ctx.beginPath(); ctx.roundRect(CX - 6, CY - pbH/2 - 5, 12, 5, 1); ctx.fill();

      // USB-A port (bottom)
      ctx.fillStyle = outputting ? 'rgba(0,188,212,.6)' : 'rgba(255,255,255,.15)';
      ctx.beginPath(); ctx.roundRect(CX - 12, CY + pbH/2 - 1, 24, 8, 2); ctx.fill();
      ctx.fillStyle = 'rgba(30,30,50,1)'; ctx.beginPath(); ctx.roundRect(CX - 10, CY + pbH/2, 20, 6, 1); ctx.fill();

      // SOC indicator LEDs (right side)
      [0,1,2,3].forEach(i => {
        const lit = soc >= (i + 1) * 25;
        const ledY = CY - 24 + i * 16;
        ctx.fillStyle = lit ? (soc < 25 && i===0 ? '#ff1744cc' : '#00e676cc') : 'rgba(255,255,255,.1)';
        if (lit) { ctx.shadowColor = '#00e676'; ctx.shadowBlur = 6; }
        ctx.beginPath(); ctx.arc(CX + pbW/2 - 8, ledY, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── Input: USB-C charger (left) ──
      const chargerX = CX - 130, chargerY = CY - 40;
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.roundRect(chargerX - 20, chargerY - 20, 40, 40, 6); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(chargerX - 20, chargerY - 20, 40, 40, 6); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '8px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('USB-C', chargerX, chargerY - 5); ctx.fillText('充电器', chargerX, chargerY + 5);
      // Labels
      ctx.fillStyle = charging ? '#00e676' : 'var(--dim)'; ctx.font = '10px "Courier New",monospace';
      ctx.fillText('5V / 2A', chargerX, chargerY + 26);

      // ── Output: Phone (right) ──
      const phoneX = CX + 130, phoneY = CY + 30;
      ctx.fillStyle = '#2a2a3a'; ctx.beginPath(); ctx.roundRect(phoneX - 16, phoneY - 35, 32, 55, 5); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(phoneX - 16, phoneY - 35, 32, 55, 5); ctx.stroke();
      // Screen
      ctx.fillStyle = outputting ? 'rgba(0,188,212,.25)' : 'rgba(255,255,255,.08)';
      ctx.beginPath(); ctx.roundRect(phoneX - 12, phoneY - 30, 24, 40, 3); ctx.fill();
      if (outputting) {
        ctx.fillStyle = '#00bcd4'; ctx.font = '11px serif'; ctx.textAlign = 'center';
        ctx.fillText('⚡', phoneX, phoneY - 8);
      }
      ctx.fillStyle = outputting ? ACC : 'var(--dim)'; ctx.font = '10px "Courier New",monospace';
      ctx.fillText('5V / 2.4A', phoneX, phoneY + 28);

      // ── Flow arrows ──
      drawArrow(chargerX + 22, chargerY, CX - pbW/2, CY - pbH/2 + 20, '#00e676', 0.6, charging);
      drawArrow(CX + pbW/2, CY + pbH/2 - 20, phoneX - 18, phoneY, ACC, 0.7, outputting);

      // ── Boost converter label ──
      if (outputting) {
        ctx.fillStyle = ACC + 'bb'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('升压 3.7V→5V', CX + 60, CY + pbH/2 + 20);
      }
      if (charging) {
        ctx.fillStyle = '#00e676bb'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('CC/CV 充电', CX - 65, CY - pbH/2 - 14);
      }

      // SOC text
      const fc2 = soc > 50 ? '#00e676' : soc > 20 ? '#ffab00' : '#ff1744';
      ctx.fillStyle = fc2; ctx.font = 'bold 14px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${soc}%`, CX, CY + pbH/2 + 22);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [charging, outputting, soc]);
  return <canvas ref={ref} width={360} height={280} style={{ maxWidth: '100%' }} />;
}

export default function PowerBank() {
  const [charging, setCharging] = useState(false);
  const [outputting, setOutputting] = useState(true);
  const [soc, setSoc] = useState(65);

  useEffect(() => {
    const timer = setInterval(() => setSoc(s => {
      if (charging && !outputting) return Math.min(100, s + 0.8);
      if (outputting && !charging) return Math.max(0, s - 0.5);
      return s;
    }), 300);
    return () => clearInterval(timer);
  }, [charging, outputting]);

  return (
    <section id="power-bank" className="sec">
      <div className="sh">
        <span className="sh-icon">🔋</span>
        <div className="sh-tag">Stage 3 · Small Appliance · Power Bank</div>
        <h2 className="sh-title" style={{ color: ACC }}>充电宝电路设计</h2>
        <p className="sh-sub">锂电池组管理、升压 Boost 变换器、CC/CV 充电控制与 USB PD 快充协议——充电宝的完整电路链路。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 14 }}>
          <PowerBankCanvas charging={charging} outputting={outputting} soc={soc} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 38 }}>电量:</span>
            <input type="range" min={0} max={100} value={soc} onChange={e => setSoc(+e.target.value)} style={{ flex: 1, accentColor: ACC }} />
            <span style={{ font: '12px "Courier New",monospace', color: ACC, width: 36 }}>{soc}%</span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => setCharging(c => !c)} style={{
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${charging ? '#00e676' : 'rgba(0,230,118,.25)'}`,
              background: charging ? 'rgba(0,230,118,.12)' : 'transparent',
              color: charging ? '#00e676' : 'var(--dim)', font: '13px/1 inherit', transition: 'all .2s',
            }}>🔌 {charging ? '断开充电' : '接入充电'}</button>
            <button onClick={() => setOutputting(o => !o)} style={{
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${outputting ? ACC : 'rgba(0,188,212,.25)'}`,
              background: outputting ? 'rgba(0,188,212,.12)' : 'transparent',
              color: outputting ? ACC : 'var(--dim)', font: '13px/1 inherit', transition: 'all .2s',
            }}>📱 {outputting ? '断开输出' : '接入手机'}</button>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: '电芯组', color: ACC, d: '通常为 1~4 节 18650 锂电芯串联或并联。3.7V 标称，需要升压才能给 USB 5V 输出。常见 10000mAh 充电宝含 2~3 节 18650' },
            { name: 'BMS 保护电路', color: '#00e676', d: '电池管理系统：过充（4.25V）/过放（2.5V）/过流/短路四重保护，平衡多节电芯电量，防止最弱电芯先耗尽' },
            { name: 'Boost 升压电路', color: '#ffab00', d: '将电芯 3.7V 升压到 USB 5V 输出。常用 IC：IP5328、MT3608、SY7208，升压效率约 88~93%。大功率型支持 9V/12V 快充输出' },
            { name: '充电管理 IC', color: '#9c7dff', d: '负责 CC/CV 充电曲线，通过 Type-C 接口的 CC 引脚识别 QC/PD 协议，与充电器协商快充电压（5V/9V/12V/20V）' },
            { name: 'MCU 控制器', color: '#e040fb', d: '智能充电宝的大脑：管理电量指示 LED、入出功率计算（显示屏）、双向快充调度、低电量自动关闭等逻辑' },
          ].map(s => (
            <div key={s.name} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(6,12,28,.7)', borderRadius: 10, border: `1px solid ${s.color}22` }}>
              <div style={{ width: 4, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: s.color, fontSize: 13, marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        {[
          { title: '⚡ 快充协议对比', color: ACC, items: [['普通 5W','5V/1A','所有设备均支持'],['QC 3.0','5/9/12V','安卓旗舰主流'],['PD 3.0','5~20V','iPhone 15+ / 笔记本'],['SCP 华为','5/10V','华为专属 40W+'],['AFC 三星','5/9V','三星 Galaxy 系列']] },
          { title: '🔢 容量与实际输出', color: '#ffab00', items: [['标称 10000mAh','实际约 6000mAh','升压损耗约 40%'],['标称 20000mAh','实际约 13000mAh','转换效率 ~90%时'],['虚标判断','铭牌 Wh 可靠','10000mAh×3.7V=37Wh']] },
        ].map(card => (
          <div key={card.title} className="glass reveal" style={{ borderColor: card.color + '22' }}>
            <div style={{ fontWeight: 700, color: card.color, marginBottom: 10 }}>{card.title}</div>
            {card.items.map(row => (
              <div key={row[0]} style={{ display: 'flex', gap: 6, fontSize: 12, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,.05)', flexWrap: 'wrap' }}>
                <span style={{ color: card.color, font: '11px "Courier New",monospace', minWidth: 80 }}>{row[0]}</span>
                <span style={{ color: '#8aacb8' }}>{row[1]}</span>
                {row[2] && <span style={{ color: 'var(--dim)', fontSize: 11 }}>{row[2]}</span>}
              </div>
            ))}
          </div>
        ))}
        <div className="glass reveal" style={{ borderColor: 'rgba(255,23,68,.18)' }}>
          <div style={{ fontWeight: 700, color: '#ff1744', marginBottom: 8 }}>⚠️ 安全与寿命</div>
          <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.75 }}>
            ▸ 不要放在高温环境充电（车内曝晒 ≥ 60°C）<br/>
            ▸ 膨胀鼓包立即停用，有爆炸风险<br/>
            ▸ 坐飞机：&gt;100Wh 需申报，&gt;160Wh 禁止携带<br/>
            ▸ 建议 20~80% 区间使用，延长寿命<br/>
            ▸ 3~6 个月不用时，保持 50% 电量存放
          </div>
        </div>
      </div>
    </section>
  );
}
