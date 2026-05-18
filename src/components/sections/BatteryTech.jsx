import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00e676';

function BatteryCanvas({ typeRef, stateRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const tp = typeRef.current;   // nca / lfp
      const st = stateRef.current;  // charge / discharge / idle
      const isNCA = tp === 'nca';
      const color = isNCA ? '#e91e63' : '#00e676';
      const charging = st === 'charge';
      const discharging = st === 'discharge';
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = charging ? `rgba(${isNCA ? '233,30,99' : '0,230,118'},.45)` : 'rgba(60,70,90,.42)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      const chem = isNCA ? '三元锂 NCA/NCM · 高能量密度 · 200~250Wh/kg' : '磷酸铁锂 LFP · 安全稳定 · 120~160Wh/kg';
      ctx.fillText(st === 'idle' ? chem : (charging ? '充电中 ' : '放电中 ') + chem, W / 2, 27);

      // ── 单体电芯剖面 ──
      const cx = 140, cy = 168;
      const cellH = 120, cellW = 60;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH, 8); ctx.fill(); ctx.stroke();
      // 正负极标注
      ctx.fillStyle = isNCA ? '#ef9a9a' : '#a5d6a7'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      ctx.fillText('+', cx, cy - cellH / 2 + 14);
      ctx.fillStyle = '#90caf9'; ctx.fillText('−', cx, cy + cellH / 2 - 6);
      // 内部层（卷绕）
      for (let r = 0; r < 8; r++) {
        const w = 38 - r * 4, h = cellH - 24 - r * 5;
        if (w < 4 || h < 4) break;
        const layerAlpha = 0.08 + r * 0.02;
        ctx.strokeStyle = r % 2 === 0
          ? `rgba(${isNCA ? '233,30,99' : '0,230,118'},${layerAlpha})`
          : `rgba(100,140,255,${layerAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 3); ctx.stroke();
      }
      // 电解液粒子
      if (charging || discharging) {
        for (let p = 0; p < 6; p++) {
          const frac = ((t * 0.8 + p * 0.17) % 1);
          const direction = charging ? 1 : -1;
          const py = cy - 40 + frac * 80 * direction;
          const px = cx + (p % 3 - 1) * 10;
          ctx.fillStyle = charging ? '#90caf9' : isNCA ? '#ef9a9a' : '#a5d6a7';
          ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 4;
          ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.fillStyle = color; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(isNCA ? '正极:NCA/NCM' : '正极:LFP', cx, cy + cellH / 2 + 14);
      ctx.fillText('负极:石墨', cx, cy + cellH / 2 + 26);

      // ── 电压/容量对比图 ──
      const gX = 255, gY = 90, gW = 200, gH = 80;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#334'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(gX, gY - 10, gW, gH + 20, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
      ctx.fillText('充放电曲线（V vs SOC）', gX + 8, gY + 5);
      // 轴
      ctx.strokeStyle = '#445'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gX + 15, gY + 15); ctx.lineTo(gX + 15, gY + gH + 5); ctx.lineTo(gX + gW - 8, gY + gH + 5); ctx.stroke();
      // NCA 曲线
      ctx.strokeStyle = '#e91e63'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < 180; x++) {
        const soc = x / 180;
        const v = 3.0 + 1.2 * soc - 0.3 * soc * soc;
        const px = gX + 18 + soc * 165, py = gY + gH + 3 - (v - 2.8) / 1.6 * (gH - 5);
        x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      // LFP 曲线（平台）
      ctx.strokeStyle = '#00e676'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < 180; x++) {
        const soc = x / 180;
        const v = soc < 0.1 ? 3.0 + soc * 2 : soc > 0.9 ? 3.2 + (soc - 0.9) * 3 : 3.2 + (soc - 0.5) * 0.3;
        const px = gX + 18 + soc * 165, py = gY + gH + 3 - (v - 2.8) / 1.6 * (gH - 5);
        x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = '#e91e63'; ctx.font = '8px monospace';
      ctx.fillText('NCA 4.2V', gX + 140, gY + 20);
      ctx.fillStyle = '#00e676';
      ctx.fillText('LFP 3.65V', gX + 60, gY + 25);

      // ── 特性对比表 ──
      const tX = 255, tY = 200;
      const rows = [
        ['指标', isNCA ? 'NCA/NCM' : 'LFP', ''],
        ['标称电压', isNCA ? '3.6V' : '3.2V', ''],
        ['能量密度', isNCA ? '200~250Wh/kg' : '120~160Wh/kg', ''],
        ['循环寿命', isNCA ? '500~1000次' : '2000~5000次', ''],
        ['安全性', isNCA ? '过热风险↑' : '热稳定好', ''],
      ];
      rows.forEach((row, i) => {
        const ry = tY + i * 18;
        ctx.fillStyle = i === 0 ? '#445' : 'rgba(30,40,55,.6)';
        ctx.beginPath(); ctx.roundRect(tX, ry, 200, 16, 2); ctx.fill();
        ctx.fillStyle = i === 0 ? '#aaa' : (i % 2 === 0 ? '#ccc' : '#aaa');
        ctx.font = (i === 0 ? 'bold ' : '') + '8px monospace'; ctx.textAlign = 'left';
        ctx.fillText(row[0], tX + 5, ry + 11);
        ctx.fillStyle = i === 0 ? '#aaa' : color;
        ctx.textAlign = 'right'; ctx.fillText(row[1], tX + 195, ry + 11);
      });

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = `rgba(${isNCA ? '233,30,99' : '0,230,118'},${0.7 + 0.3 * Math.sin(t * 3)})`;
      ctx.fillText(
        charging ? 'Li⁺ 从正极 → 电解液 → 嵌入石墨负极（充电）' :
        discharging ? 'Li⁺ 从负极 → 电解液 → 回到正极（放电做功）' :
        '锂离子在正负极间穿梭实现能量储存与释放',
        W / 2, H - 10
      );

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

export default function BatteryTech() {
  const [type, setType] = useState('lfp');
  const [state, setState] = useState('idle');
  const typeRef = useRef(type);
  const stateRef = useRef(state);
  typeRef.current = type;
  stateRef.current = state;

  const btn = (id, val, setter, ref, col, label) => (
    <button onClick={() => { setter(id); ref.current = id; }} style={{
      padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${val === id ? col : 'rgba(255,255,255,.12)'}`,
      background: val === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: val === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="battery-tech" className="sec">
      <div className="sh">
        <span className="sh-icon">🔋</span>
        <div>
          <div className="sh-tag">BATTERY · 锂离子 · NCA/NCM · LFP</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>锂电池详解</h2>
          <p className="sh-sub">三元锂 vs 磷酸铁锂——充放电原理、特性对比与 BMS 保护</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.2)', flexDirection: 'column', gap: 12 }}>
          <BatteryCanvas typeRef={typeRef} stateRef={stateRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {btn('nca', type, setType, typeRef, '#e91e63', '三元锂 NCA')}
              {btn('lfp', type, setType, typeRef, ACC, '磷酸铁锂 LFP')}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {btn('charge', state, setState, stateRef, '#00bcd4', '⚡ 充电')}
              {btn('discharge', state, setState, stateRef, '#ff9800', '🔋 放电')}
              {btn('idle', state, setState, stateRef, '#607d8b', '○ 待机')}
            </div>
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.18)' }}>
            <div className="formula" style={{ color: ACC }}>Li⁺ 穿梭 = 充放电</div>
            <div className="fdesc">正极 ↔ 电解液 ↔ 石墨负极——"摇椅电池"原理</div>
          </div>
          <ICard color={ACC} title="⚗️ 充放电化学">
            充电：锂离子从<strong>正极</strong>脱嵌 → 穿过电解液 → 嵌入<strong>石墨负极</strong>（形成 LiC₆）；
            放电反向，同时电子经外电路做功。
          </ICard>
          <ICard color="#e91e63" title="🔴 三元锂 NCA/NCM">
            正极材料：Ni-Co-Al / Ni-Co-Mn。能量密度高（200~250 Wh/kg），
            适合追求续航的 EV（如 Tesla）。热稳定性较差，需精细 BMS 保护。
          </ICard>
          <ICard color={ACC} title="🟢 磷酸铁锂 LFP">
            正极：LiFePO₄。热稳定极好（分解温度 &gt;270°C），循环寿命 2000~5000 次，
            安全性高。近年比亚迪刀片电池大量采用，已成主流。
          </ICard>
          <ICard color="#ff9800" title="🛡️ BMS 核心保护">
            过充（&gt;4.2V / &gt;3.65V LFP）→ 断路；过放（&lt;2.5V）→ 断路；
            过温（&gt;60°C）→ 限流；短路 → μs 级断路保护。
          </ICard>
        </div>
      </div>
    </section>
  );
}
