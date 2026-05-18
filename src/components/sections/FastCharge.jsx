import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ff6d00';

function FastChargeCanvas({ protoRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const proto = protoRef.current; // pd / qc / vooc
      const specs = {
        pd:   { label: 'USB PD 3.1', v: 28, a: 5, color: '#2196f3', max: 140 },
        qc:   { label: 'QC 5.0', v: 20, a: 4.5, color: '#ff9800', max: 100 },
        vooc: { label: 'VOOC 5.0', v: 11, a: 10, color: '#00e676', max: 120 },
        pe:   { label: 'PE 3.0', v: 20, a: 4, color: '#e91e63', max: 80 },
      };
      const sp = specs[proto] || specs.pd;
      const P = sp.v * sp.a;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = `rgba(${sp.color.slice(1).match(/../g).map(h => parseInt(h, 16)).join(',')}, .45)`;
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${sp.label} · ${sp.v}V × ${sp.a}A = ${P}W 快充`, W / 2, 27);

      // ── 握手协议序列（顶部时序）──
      const seqY = 75;
      const steps = [
        { label: 'VBUS 5V', col: '#607d8b' },
        { label: `握手 ${sp.label}`, col: sp.color },
        { label: `升压 ${sp.v}V`, col: '#ff9800' },
        { label: 'CC 恒流', col: '#00bcd4' },
        { label: 'CV 恒压', col: '#00e676' },
      ];
      steps.forEach((s, i) => {
        const bx = 28 + i * 86;
        const highlight = Math.floor(t * 0.7) % steps.length === i;
        ctx.fillStyle = highlight ? s.col + '44' : 'rgba(30,40,55,.5)';
        ctx.strokeStyle = highlight ? s.col : '#445'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(bx, seqY - 14, 78, 28, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = highlight ? '#fff' : '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillText(s.label, bx + 39, seqY + 4);
        if (i < steps.length - 1) {
          ctx.strokeStyle = '#445'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(bx + 78, seqY); ctx.lineTo(bx + 86, seqY); ctx.stroke();
          ctx.fillStyle = '#556'; ctx.font = '8px monospace';
          ctx.fillText('→', bx + 80, seqY + 3);
        }
      });

      // ── 充电器（左）──
      const adpX = 85, adpY = 200;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = sp.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(adpX - 38, adpY - 50, 76, 100, 10); ctx.fill(); ctx.stroke();
      // 内部 GaN 芯片标注
      ctx.fillStyle = '#334'; ctx.beginPath(); ctx.roundRect(adpX - 26, adpY - 38, 52, 30, 4); ctx.fill();
      ctx.fillStyle = sp.color; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('GaN', adpX, adpY - 20);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText('氮化镓', adpX, adpY - 9);
      // USB-C 口
      ctx.fillStyle = '#445'; ctx.beginPath(); ctx.roundRect(adpX - 12, adpY + 30, 24, 12, 3); ctx.fill();
      ctx.fillStyle = '#889'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('USB-C', adpX, adpY + 42);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('充电器', adpX, adpY + 58);

      // ── CC 线（传输 USB PD 信令）──
      const wireY = adpY;
      // 功率导线
      ctx.strokeStyle = `rgba(${sp.color.slice(1).match(/../g).map(h => parseInt(h, 16)).join(',')}, ${0.5 + 0.2 * Math.sin(t * 4)})`;
      ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(adpX + 38, wireY - 15); ctx.lineTo(270, wireY - 15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(adpX + 38, wireY + 15); ctx.lineTo(270, wireY + 15); ctx.stroke();
      ctx.setLineDash([]);
      // CC 信号线（细）
      ctx.strokeStyle = 'rgba(255,193,7,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(adpX + 38, wireY); ctx.lineTo(270, wireY); ctx.stroke();
      ctx.fillStyle = '#ffb300'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('CC 协商线', 178, wireY - 4);
      // 电流粒子
      const nP = Math.round(sp.a / 2);
      for (let p = 0; p < nP; p++) {
        const frac = ((t * 0.8 + p / nP) % 1);
        const px = adpX + 38 + frac * 232;
        ctx.fillStyle = sp.color; ctx.shadowColor = sp.color; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(px, wireY - 15, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 手机/设备（右）──
      const phX = 340, phY = 200;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(phX - 30, phY - 62, 60, 120, 8); ctx.fill(); ctx.stroke();
      // 屏幕
      ctx.fillStyle = '#0d1520'; ctx.beginPath(); ctx.roundRect(phX - 22, phY - 54, 44, 70, 4); ctx.fill();
      // 电池显示
      const soc = 0.3 + (t * 0.01) % 0.6;
      const barH = Math.round(soc * 55);
      ctx.fillStyle = soc > 0.8 ? '#00e676' : soc > 0.5 ? '#ff9800' : '#f44336';
      ctx.beginPath(); ctx.roundRect(phX - 16, phY - 48 + (55 - barH), 32, barH, 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(soc * 100)}%`, phX, phY - 20);
      // 充电闪电
      ctx.fillStyle = sp.color; ctx.font = '14px monospace';
      ctx.fillText('⚡', phX, phY + 10);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText('手机', phX, phY + 68);

      // ── CC/CV 曲线 ──
      const gX = 28, gY = 270, gW = 200, gH = 38;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#334'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(gX, gY - 6, gW, gH + 12, 5); ctx.fill(); ctx.stroke();
      // 电流曲线（恒流段→截止）
      ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < gW - 10; x++) {
        const soc = x / (gW - 10);
        const curI = soc < 0.8 ? 1 : 1 - (soc - 0.8) * 4;
        const py = gY + gH - curI * (gH - 4);
        x === 0 ? ctx.moveTo(gX + 5 + x, py) : ctx.lineTo(gX + 5 + x, py);
      }
      ctx.stroke();
      // 电压曲线
      ctx.strokeStyle = sp.color; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < gW - 10; x++) {
        const soc = x / (gW - 10);
        const v = soc < 0.8 ? 0.4 + soc * 0.5 : 0.8 + (soc - 0.8) * 1;
        const py = gY + gH - Math.min(1, v) * (gH - 4);
        x === 0 ? ctx.moveTo(gX + 5 + x, py) : ctx.lineTo(gX + 5 + x, py);
      }
      ctx.stroke();
      ctx.fillStyle = '#00bcd4'; ctx.font = '7px monospace'; ctx.textAlign = 'left';
      ctx.fillText('I (CC)', gX + 8, gY + 8);
      ctx.fillStyle = sp.color; ctx.fillText('V (CV)', gX + 50, gY + 8);
      // 分界线
      ctx.strokeStyle = '#445'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(gX + 5 + 0.8 * (gW - 10), gY); ctx.lineTo(gX + 5 + 0.8 * (gW - 10), gY + gH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#667'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('80%', gX + 5 + 0.8 * (gW - 10), gY - 2);

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = `rgba(${sp.color.slice(1).match(/../g).map(h => parseInt(h, 16)).join(',')}, ${0.7 + 0.3 * Math.sin(t * 3)})`;
      ctx.fillText(`CC 恒流充至 80% → CV 恒压减流至截止 | ${sp.label} 最高 ${P}W`, W / 2, H - 10);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

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

export default function FastCharge() {
  const [proto, setProto] = useState('pd');
  const protoRef = useRef(proto);
  protoRef.current = proto;

  const protocols = [
    { id: 'pd', label: 'USB PD', col: '#2196f3' },
    { id: 'qc', label: 'QC 5.0', col: '#ff9800' },
    { id: 'vooc', label: 'VOOC', col: '#00e676' },
    { id: 'pe', label: 'PE 3.0', col: '#e91e63' },
  ];

  return (
    <section id="fast-charge" className="sec">
      <div className="sh">
        <span className="sh-icon">⚡</span>
        <div>
          <div className="sh-tag">FAST CHARGE · USB PD · QC · VOOC · GaN</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>快充协议</h2>
          <p className="sh-sub">协议握手→升压→CC 恒流→CV 恒压——手机快充全流程解析</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,109,0,.2)', flexDirection: 'column', gap: 14 }}>
          <FastChargeCanvas protoRef={protoRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {protocols.map(p => (
              <button key={p.id} onClick={() => { setProto(p.id); protoRef.current = p.id; }} style={{
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
                border: `1px solid ${proto === p.id ? p.col : 'rgba(255,255,255,.12)'}`,
                background: proto === p.id ? p.col + '22' : 'rgba(255,255,255,.04)',
                color: proto === p.id ? p.col : 'rgba(255,255,255,.5)',
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,109,0,.18)' }}>
            <div className="formula" style={{ color: ACC }}>P = V × I  协商 → 升压 → 恒流/恒压</div>
            <div className="fdesc">高功率 = 高电压（降低损耗）或 大电流（低压方案）</div>
          </div>
          <ICard color="#2196f3" title="🔵 USB PD（Power Delivery）">
            开放标准，支持 5/9/12/15/20/28V，最高 240W（PD 3.1）。
            通过 <strong>CC 引脚</strong>上的 BMC 编码协商电压档位，充电器与设备双向通信。
          </ICard>
          <ICard color="#ff9800" title="🟠 高通 QC（Quick Charge）">
            QC 1.0→5.0，最新 QC 5.0 最高 100W（20V×5A）。
            通过 D+/D- 或 USB PD 协商，兼容性好，大量安卓设备使用。
          </ICard>
          <ICard color="#00e676" title="🟢 VOOC / SuperVOOC">
            OPPO 低压大电流方案（5V/10A = 50W），升级到 SuperVOOC 支持 100W+。
            充电管理芯片分布在线缆和设备内，降低线缆热损耗，安全性高。
          </ICard>
          <ICard color={ACC} title="⚙️ GaN 氮化镓充电器">
            相比硅 MOSFET，GaN 开关频率高（MHz 级）→变压器更小→体积缩减 50%，
            效率提升至 95%+，65W 充电器可做到烟盒大小。
          </ICard>
        </div>
      </div>
    </section>
  );
}
