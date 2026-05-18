import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#69f0ae';

function GridCanvas({ stateRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const st = stateRef.current; // store / release / grid
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      ctx.fillStyle = 'rgba(105,240,174,.38)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(
        st === 'store' ? '储能中 · 光伏/风电 → 电池储能系统 (BESS)' :
        st === 'release' ? '放电中 · BESS → 逆变器 → 家庭/电网' :
        '智能电网 · V2G · 峰谷套利 · 频率调节',
        W / 2, 27
      );

      // ── 光伏（左上）──
      const pvX = 65, pvY = 100;
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
        ctx.fillStyle = `rgba(25,35,80,${0.7 + (st === 'store' ? 0.1 * Math.sin(t * 3) : 0)})`;
        ctx.strokeStyle = st === 'store' ? '#ffd60044' : '#334'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(pvX - 22 + c * 24, pvY - 20 + r * 22, 22, 20, 2); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('光伏/风电', pvX, pvY + 36);

      // ── 储能电池（中）──
      const batX = 180, batY = 165;
      const nBars = 8;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(batX - 36, batY - 65, 72, 130, 10); ctx.fill(); ctx.stroke();
      const charge = 0.4 + (st === 'store' ? (t * 0.006) % 0.55 : st === 'release' ? -((t * 0.005) % 0.35) : 0);
      const soc = Math.max(0.05, Math.min(0.95, charge));
      const filled = Math.round(soc * nBars);
      for (let i = 0; i < nBars; i++) {
        ctx.fillStyle = i < filled ? (soc > 0.6 ? '#00e676' : soc > 0.35 ? '#ff9800' : '#f44336') : '#334';
        ctx.beginPath(); ctx.roundRect(batX - 26, batY - 56 + i * 14, 52, 10, 2); ctx.fill();
      }
      ctx.fillStyle = ACC; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('BESS', batX, batY + 74);
      ctx.fillStyle = '#889'; ctx.font = '8px monospace';
      ctx.fillText(`${Math.round(soc * 100)}%SOC`, batX, batY + 86);

      // ── PCS（功率调制系统）──
      const pcsX = 290, pcsY = 165;
      ctx.fillStyle = '#1e2635'; ctx.strokeStyle = ACC; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(pcsX - 34, pcsY - 38, 68, 76, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ACC; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('PCS', pcsX, pcsY - 10);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText('双向逆变器', pcsX, pcsY + 3);
      ctx.fillText('AC/DC', pcsX, pcsY + 15);
      if (st !== 'idle') {
        const phase = t * 3;
        ctx.strokeStyle = `rgba(105,240,174,.5)`; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < 52; x++) {
          const px = pcsX - 22 + x, py = pcsY + 28 + Math.sin(x / 52 * Math.PI * 2 + phase) * 6;
          x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // ── 电网（右）──
      const gridX = 410, gridY = 130;
      ctx.strokeStyle = '#556'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(gridX, 60); ctx.lineTo(gridX, 250); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gridX - 20, 80); ctx.lineTo(gridX + 20, 80); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gridX - 16, 100); ctx.lineTo(gridX + 16, 100); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gridX - 10, 120); ctx.lineTo(gridX + 10, 120); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('电网', gridX, 140);

      // ── 家庭负载 ──
      const homeX = 410, homeY = 220;
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(homeX, homeY - 35); ctx.lineTo(homeX - 28, homeY - 10);
      ctx.lineTo(homeX - 28, homeY + 20); ctx.lineTo(homeX + 28, homeY + 20);
      ctx.lineTo(homeX + 28, homeY - 10); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#889'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('家庭', homeX, homeY + 38);

      // ── 导线流向 ──
      ctx.setLineDash([4, 4]);
      // 光伏→储能
      if (st === 'store') {
        ctx.strokeStyle = `rgba(255,214,0,${0.4 + 0.2 * Math.sin(t * 4)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pvX + 24, pvY); ctx.lineTo(batX - 36, batY - 30); ctx.stroke();
      }
      // 储能↔PCS
      ctx.strokeStyle = `rgba(105,240,174,${0.4 + 0.2 * Math.sin(t * 3)})`; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(batX + 36, batY - 10); ctx.lineTo(pcsX - 34, batY - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(batX + 36, batY + 10); ctx.lineTo(pcsX - 34, batY + 10); ctx.stroke();
      // PCS→电网/家庭
      ctx.strokeStyle = st === 'release'
        ? `rgba(105,240,174,${0.4 + 0.2 * Math.sin(t * 3)})`
        : 'rgba(80,90,110,.25)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pcsX + 34, pcsY - 15); ctx.lineTo(gridX - 20, gridY - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pcsX + 34, pcsY + 15); ctx.lineTo(homeX - 28, homeY + 5); ctx.stroke();
      ctx.setLineDash([]);

      // V2G 标注
      if (st === 'grid') {
        ctx.fillStyle = ACC; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('V2G', (pcsX + gridX) / 2, 95);
        ctx.strokeStyle = `rgba(105,240,174,${0.5 + 0.2 * Math.sin(t * 5)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(340, 105); ctx.lineTo(395, 105); ctx.stroke();
        ctx.fillStyle = ACC; ctx.font = '8px monospace';
        ctx.fillText('↔ 双向', 368, 100);
      }

      // EMS 标注
      ctx.fillStyle = '#1a2030'; ctx.strokeStyle = '#445'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(28, 240, 100, 32, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ACC; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('EMS 能量管理', 78, 255);
      ctx.fillStyle = '#889'; ctx.font = '7px monospace';
      ctx.fillText('峰谷套利 · 频率调节', 78, 267);

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = `rgba(105,240,174,${0.7 + 0.3 * Math.sin(t * 3)})`;
      ctx.fillText(
        st === 'store' ? '白天光伏/低谷电 → 储入BESS · EMS 自动调度最优充电时间' :
        st === 'release' ? 'BESS → PCS 双向逆变 → 家庭用电/卖电 · 峰时放电套利' :
        'V2G: 电动车反向向电网供电 · 参与频率调节获得收益',
        W / 2, H - 10
      );

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stateRef]);

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

export default function EnergyStorage() {
  const [state, setState] = useState('store');
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  const btn = (id, col, label) => (
    <button onClick={() => setState(id)} style={{
      padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 12,
      border: `1px solid ${state === id ? col : 'rgba(255,255,255,.12)'}`,
      background: state === id ? col + '22' : 'rgba(255,255,255,.04)',
      color: state === id ? col : 'rgba(255,255,255,.5)',
    }}>{label}</button>
  );

  return (
    <section id="energy-storage" className="sec">
      <div className="sh">
        <span className="sh-icon">🌐</span>
        <div>
          <div className="sh-tag">ENERGY STORAGE · BESS · V2G · 智能电网</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px ${ACC}44` }}>储能与智能电网</h2>
          <p className="sh-sub">电池储能 + 双向 PCS + V2G + EMS 调度——能源互联网全景</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(105,240,174,.2)', flexDirection: 'column', gap: 14 }}>
          <GridCanvas stateRef={stateRef} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {btn('store', '#ffd600', '☀️ 储能（充电）')}
            {btn('release', ACC, '⚡ 放电（用电）')}
            {btn('grid', '#7c4dff', '🌐 V2G 并网')}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(105,240,174,.18)' }}>
            <div className="formula" style={{ color: ACC }}>光伏/风电 → BESS → PCS → 电网/负载</div>
            <div className="fdesc">EMS 统筹调度，峰谷套利，频率调节</div>
          </div>
          <ICard color={ACC} title="🏠 家庭储能系统">
            白天光伏发电 → 储入 BESS；晚上放电自用；余电上网。
            典型家庭储能：10kWh LFP，配 5kW 双向逆变器，2 年回本（部分地区有补贴）。
          </ICard>
          <ICard color={ACC} title="⚡ PCS 双向逆变器">
            充电时：AC→DC（整流）储入电池；放电时：DC→AC（逆变）输出；
            同时实现 MPPT 追踪、并网同步、孤岛保护等功能。
          </ICard>
          <ICard color="#7c4dff" title="🌐 V2G（车辆到电网）">
            电动汽车作为移动储能，低谷时充电，用电高峰时反向放电到电网，
            车主获得电费收益，同时帮助电网调峰。
          </ICard>
          <ICard color={ACC} title="🧠 EMS 能量管理">
            基于天气预报（光伏发电预测）、电价时段（峰谷价差）、
            用电习惯自动调度充放电时机，实现最优经济效益。
          </ICard>
        </div>
      </div>
    </section>
  );
}
