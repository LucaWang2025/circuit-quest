import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ffa726';

function MeterCanvas({ loadRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const load = loadRef.current; // 0-100
      ctx.clearRect(0, 0, W, H);
      t += 0.025;
      const A = load * 0.22;  // ~0-22A
      const P = load * 4.84;  // ~0-4840W
      const kwhRate = P / 3600000 * 0.1; // 每帧 kWh，仅动画用

      ctx.fillStyle = 'rgba(255,167,38,.44)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`入户电表 · ${A.toFixed(1)}A · ${Math.round(P)}W · 220V`, W / 2, 27);

      // ── 电线杆/变压器（最左）──
      ctx.strokeStyle = '#556'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(30, 55); ctx.lineTo(30, 290); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14, 80); ctx.lineTo(46, 80); ctx.stroke();
      ctx.fillStyle = '#3a4050'; ctx.strokeStyle = '#556';
      ctx.beginPath(); ctx.roundRect(16, 82, 28, 40, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('变压器', 30, 106); ctx.fillText('10kV→220V', 30, 118);

      // ── 入户线（L + N + PE）──
      const wires = [
        { y: 155, col: '#f44336', label: 'L 火线' },
        { y: 175, col: '#bdbdbd', label: 'N 零线' },
        { y: 195, col: '#4caf50', label: 'PE 地线' },
      ];
      wires.forEach(w => {
        ctx.strokeStyle = w.col; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(44, w.y); ctx.lineTo(420, w.y); ctx.stroke();
        ctx.fillStyle = w.col; ctx.font = '8px monospace'; ctx.textAlign = 'left';
        ctx.fillText(w.label, 46, w.y - 4);
      });
      // 电流粒子
      if (load > 0) {
        const nPart = Math.max(1, Math.round(load / 20));
        for (let p = 0; p < nPart; p++) {
          const frac = ((t * 0.5 * (load / 50) + p / nPart) % 1);
          const px = 44 + frac * 376;
          ctx.fillStyle = '#f44336'; ctx.shadowColor = '#f44336'; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(px, 155, 4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ── 电能表 ──
      const mX = 160, mY = 175;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(mX - 38, mY - 55, 76, 110, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#334'; ctx.beginPath(); ctx.roundRect(mX - 28, mY - 45, 56, 30, 4); ctx.fill();
      ctx.fillStyle = ACC; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      const disp = ((t * kwhRate * 1e5) % 999999).toFixed(2).padStart(8, '0');
      ctx.fillText(load > 0 ? `${(t * 0.0008 * load).toFixed(3)}` : '000.000', mX, mY - 26);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace'; ctx.fillText('kWh', mX, mY - 14);
      ctx.fillStyle = ACC; ctx.font = 'bold 9px monospace';
      ctx.fillText('电能表', mX, mY + 4);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText('单相双线', mX, mY + 16);
      ctx.fillText('5(60)A', mX, mY + 28);
      // 表盘转速指示
      if (load > 0) {
        const rotA = t * load * 0.06;
        ctx.strokeStyle = `rgba(255,167,38,${0.6 + 0.3 * Math.sin(t * 5)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(mX, mY + 38); ctx.lineTo(mX + Math.cos(rotA) * 14, mY + 38 + Math.sin(rotA) * 6); ctx.stroke();
      }

      // ── 总断路器 ──
      const brX = 270, brY = 175;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(brX - 18, brY - 50, 36, 100, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#00e676'; ctx.beginPath(); ctx.roundRect(brX - 10, brY - 40, 20, 22, 4); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('ON', brX, brY - 25);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText('总空开', brX, brY + 10); ctx.fillText('40A', brX, brY + 22);

      // ── 配电箱（右侧）──
      const pdX = 390, pdY = 175;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = '#556'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(pdX - 50, pdY - 70, 100, 140, 6); ctx.fill(); ctx.stroke();
      const circuits = ['照明 10A', '插座 16A', '厨房 20A', '空调 25A', '卫生间 16A'];
      circuits.forEach((c, i) => {
        const cy = pdY - 50 + i * 26;
        const col = load > 0 ? '#00e676' : '#445';
        ctx.fillStyle = '#2a3040'; ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(pdX - 42, cy, 84, 20, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = load > 0 ? '#ccc' : '#556'; ctx.font = '8px monospace';
        ctx.textAlign = 'left'; ctx.fillText(c, pdX - 38, cy + 13);
      });
      ctx.fillStyle = '#889'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('配电箱', pdX, pdY + 80);

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = `rgba(255,167,38,${0.7 + 0.3 * Math.sin(t * 3)})`;
      ctx.fillText(load > 0
        ? `当前用电 ${Math.round(P)}W · 按 1.0 元/kWh → ${(P / 1000).toFixed(2)} 元/小时`
        : '○ 无负载 · 电流为零 · 电表不转',
        W / 2, H - 10);

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

export default function MeterEntry() {
  const [load, setLoad] = useState(30);
  const loadRef = useRef(load);
  loadRef.current = load;

  return (
    <section id="meter-entry" className="sec">
      <div className="sh">
        <span className="sh-icon">🏠</span>
        <div>
          <div className="sh-tag">METER · 入户线 · 电能表 · 配电箱</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>入户线与电表</h2>
          <p className="sh-sub">从变压器到配电箱——家庭供电链路全解析</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,167,38,.2)', flexDirection: 'column', gap: 14 }}>
          <MeterCanvas loadRef={loadRef} />
          <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>
              模拟负荷 {load}%（≈{Math.round(load * 4.84)}W / {(load * 0.22).toFixed(1)}A）
            </div>
            <input type="range" min={0} max={100} value={load} onChange={e => setLoad(+e.target.value)}
              style={{ width: '100%', accentColor: ACC }} />
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,167,38,.18)' }}>
            <div className="formula" style={{ color: ACC }}>P = U × I = 220V × I(A)</div>
            <div className="fdesc">全家额定电流 = Σ各回路功率 / 220</div>
          </div>
          <ICard color={ACC} title="📊 入户线规格">
            居民户通常 <strong>10kV 高压</strong> 经台区变压器降为 220V，通过两芯或三芯
            （L + N + PE）电缆入户，主线截面积 10~16mm²，可承载 60~80A。
          </ICard>
          <ICard color={ACC} title="⚡ 电能表工作">
            智能单相电表通过<strong>电流互感器</strong>和<strong>电压采样</strong>计算瞬时功率并积分得到 kWh。
            显示格式：5 位整数 + 1 位小数，单位 kWh（度）。
          </ICard>
          <ICard color={ACC} title="🗂️ 配电箱分路">
            总漏电保护开关（40A）→ 各支路空开：照明（10A）、普通插座（16A）、
            厨房（20A）、空调（独立 25A）、卫生间（漏电+16A）。
          </ICard>
          <ICard color="#ff5252" title="⚠️ 安全常识">
            更换电能表或操作计量箱须由电力公司操作，私自绕表属违法。
            总空开跳闸→检查是否过载，勿用铜丝代替保险。
          </ICard>
        </div>
      </div>
    </section>
  );
}
