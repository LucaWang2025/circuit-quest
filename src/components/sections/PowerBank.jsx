import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00bcd4';

/* ── 主电路图 Canvas（自适应宽度）───────────────────────────── */
function CircuitCanvas({ charging, outputting, soc, protocol }) {
  const wrapRef = useRef(null);
  const ref     = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    const cv   = ref.current;
    if (!wrap || !cv) return;

    let raf, ro;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function start() {
      cancelAnimationFrame(raf);
      const W = wrap.offsetWidth || 580;
      const H = Math.round(W * 0.34);
      cv.width  = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);
      run(ctx, W, H);
    }

    ro = new ResizeObserver(start);
    ro.observe(wrap);
    start();

    function run(ctx, W, H) {

    // Particle pools
    const chargeParticles  = Array.from({ length: 12 }, (_, i) => ({ p: i / 12 }));
    const outputParticles  = Array.from({ length: 12 }, (_, i) => ({ p: i / 12 }));

    const PROTO_COLORS = { '5W': '#00bcd4', 'QC3': '#ffab00', 'PD45': '#9c7dff', 'PD100': '#e040fb' };
    const pColor = PROTO_COLORS[protocol] ?? ACC;

    function block(x, y, w, h, label, sublabel, color, lit) {
      // Shadow glow
      if (lit) { ctx.shadowColor = color; ctx.shadowBlur = 14; }
      const bg = ctx.createLinearGradient(x, y, x + w, y + h);
      bg.addColorStop(0, lit ? color + '22' : 'rgba(30,30,48,.9)');
      bg.addColorStop(1, lit ? color + '0a' : 'rgba(20,20,36,.9)');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill();
      ctx.strokeStyle = lit ? color : color + '44'; ctx.lineWidth = lit ? 1.5 : 1;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.fillStyle = lit ? color : color + '99';
      ctx.font = `bold 11px "Courier New",monospace`;
      ctx.fillText(label, x + w / 2, y + h / 2 - (sublabel ? 5 : 0));
      if (sublabel) {
        ctx.fillStyle = lit ? color + 'cc' : 'rgba(130,150,170,.55)';
        ctx.font = '9px "Courier New",monospace';
        ctx.fillText(sublabel, x + w / 2, y + h / 2 + 8);
      }
    }

    function wire(x1, y1, x2, y2, color, active) {
      ctx.strokeStyle = active ? color + 'aa' : 'rgba(80,100,120,.35)';
      ctx.lineWidth = active ? 2 : 1.5;
      ctx.setLineDash(active ? [] : [4, 3]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
    }

    function particle(x1, y1, x2, y2, color, particles, active, speed) {
      if (!active) return;
      particles.forEach(p => {
        p.p = (p.p + speed * 0.015) % 1;
        const px = x1 + (x2 - x1) * p.p;
        const py = y1 + (y2 - y1) * p.p;
        const alpha = Math.sin(p.p * Math.PI) * 0.9 + 0.1;
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 7 * alpha;
        ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    function voltLabel(x, y, v, color, active) {
      if (!active) return;
      ctx.fillStyle = color + 'cc'; ctx.font = 'bold 10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.shadowColor = color; ctx.shadowBlur = 6;
      ctx.fillText(v, x, y);
      ctx.shadowBlur = 0;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // ─── Responsive layout ───
      const Y = H / 2;
      const pad = W * 0.04;
      const usableW = W - pad * 2;
      // Block x-centers: Adapter | ChargeIC | Cells | BoostIC | Phone
      const BLK = [pad + usableW*0.07, pad + usableW*0.25, pad + usableW*0.47, pad + usableW*0.68, pad + usableW*0.87];
      const BW = Math.round(usableW * 0.14), BH = Math.round(H * 0.36);

      // ─── Wires ───
      wire(BLK[0] + BW/2, Y, BLK[1] - BW/2, Y, '#00e676', charging);
      wire(BLK[1] + BW/2, Y, BLK[2] - BW/2, Y, '#00e676', charging);
      wire(BLK[2] + BW/2, Y, BLK[3] - BW/2, Y, ACC,       outputting);
      wire(BLK[3] + BW/2, Y, BLK[4] - 18,   Y, pColor,    outputting);
      // BMS protective ring (above)
      wire(BLK[1] + BW/2, Y - 26, BLK[2] - BW/2, Y - 26, '#ff1744', charging || outputting);

      // ─── Blocks ───
      const adOn = charging;
      block(BLK[0]-BW/2, Y-BH/2, BW, BH, 'USB-C', '充电器', '#00e676', adOn);
      block(BLK[1]-BW/2, Y-BH/2, BW, BH, 'CC/CV', '充电IC', '#00e676', charging);
      // Cell bank (wider)
      const cW = 80;
      const fc = soc > 60 ? '#00e676' : soc > 25 ? '#ffab00' : '#ff1744';
      block(BLK[2]-cW/2, Y-BH/2, cW, BH, `电芯组`, `${soc}%`, fc, true);
      // Fill bar inside cell block
      const barW = (soc / 100) * (cW - 12);
      if (soc > 0) {
        ctx.shadowColor = fc; ctx.shadowBlur = 5;
        ctx.fillStyle = fc + 'cc';
        ctx.beginPath(); ctx.roundRect(BLK[2] - cW/2 + 6, Y + BH/2 - 10, barW, 6, 3); ctx.fill();
        ctx.shadowBlur = 0;
      }
      // SOC voltage
      const v = (2.8 + soc / 100 * 1.4).toFixed(2);
      ctx.fillStyle = fc; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${v}V / 节`, BLK[2], Y + BH/2 + 12);

      block(BLK[3]-BW/2, Y-BH/2, BW, BH, 'Boost', '升压IC', pColor, outputting);
      // Phone
      const phOn = outputting;
      ctx.fillStyle = phOn ? '#1a2040' : '#141420';
      ctx.strokeStyle = phOn ? pColor : pColor + '33'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(BLK[4]-16, Y-30, 32, 50, 5); ctx.fill(); ctx.stroke();
      // Screen
      ctx.fillStyle = phOn ? pColor + '28' : 'rgba(255,255,255,.04)';
      ctx.beginPath(); ctx.roundRect(BLK[4]-12, Y-25, 24, 36, 3); ctx.fill();
      if (phOn) {
        ctx.shadowColor = pColor; ctx.shadowBlur = 8;
        ctx.fillStyle = pColor; ctx.font = '14px serif'; ctx.textAlign = 'center';
        ctx.fillText('⚡', BLK[4], Y - 4);
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = phOn ? pColor : '#607a90'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('手机', BLK[4], Y + 28);

      // ─── Particles ───
      const chSpeed = charging ? (protocol === 'PD100' ? 2.5 : protocol === 'PD45' ? 2 : protocol === 'QC3' ? 1.5 : 1) : 0;
      particle(BLK[0]+BW/2, Y, BLK[1]-BW/2, Y, '#00e676', chargeParticles, charging, chSpeed);
      particle(BLK[1]+BW/2, Y, BLK[2]-BW/2, Y, '#00e676', chargeParticles.slice(0,8), charging, chSpeed);
      particle(BLK[2]+BW/2, Y, BLK[3]-BW/2, Y, ACC, outputParticles, outputting, 1.2);
      particle(BLK[3]+BW/2, Y, BLK[4]-18,   Y, pColor, outputParticles.slice(0,8), outputting, 1.4);

      // ─── Voltage labels ───
      voltLabel((BLK[0]+BW/2+BLK[1]-BW/2)/2, Y-10, '5V', '#00e676', charging);
      voltLabel((BLK[1]+BW/2+BLK[2]-BW/2)/2, Y-10, 'CC/CV', '#00e676', charging);
      voltLabel((BLK[2]+BW/2+BLK[3]-BW/2)/2, Y-10, '3.7V', ACC, outputting);
      voltLabel((BLK[3]+BW/2+BLK[4]-18)/2, Y-10, { '5W':'5V','QC3':'9V','PD45':'20V','PD100':'20V' }[protocol]||'5V', pColor, outputting);

      // ─── Protocol badge ───
      const pLabel = { '5W':'5W 普通','QC3':'QC3 18W','PD45':'PD 45W','PD100':'PD 100W' }[protocol];
      ctx.fillStyle = pColor + 'cc'; ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillText(`协议: ${pLabel}`, 12, H - 12);

      // ─── BMS label ───
      if (charging || outputting) {
        ctx.fillStyle = '#ff174499'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('BMS 保护', (BLK[1]+BLK[2])/2, Y - 32);
      }

      // ─── Adapter plug animation ───
      if (!charging) {
        ctx.fillStyle = 'rgba(200,220,232,.18)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
        ctx.fillText('未连接', BLK[0], Y + BH / 2 + 12);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    } // end run
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [charging, outputting, soc, protocol]);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <canvas ref={ref} style={{ display: 'block' }} />
    </div>
  );
}

/* ── CC/CV 充电曲线 Canvas ─────────────────────────────────── */
function ChargeCurveCanvas({ soc }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = setupHiDpi(cv, 340, 120);
    const W = 340, H = 120;
    const PX = 44, PY = 14, CW = W - PX - 16, CH = H - PY - 28;

    ctx.clearRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = 'rgba(200,220,232,.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(PX, PY + CH); ctx.lineTo(PX + CW, PY + CH); ctx.stroke();

    // Grid
    [0.25, 0.5, 0.75, 1].forEach(v => {
      const y = PY + CH - v * CH;
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(PX, y); ctx.lineTo(PX + CW, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(200,220,232,.35)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(v * 100)}%`, PX - 4, y + 3);
    });

    // Phase regions
    const p1 = 0.08, p2 = 0.68;
    [[0, p1, 'rgba(255,107,53,.07)', '预充'], [p1, p2, 'rgba(0,188,212,.07)', '恒流 CC'], [p2, 1, 'rgba(0,230,118,.07)', '恒压 CV']].forEach(([s, e, c, l]) => {
      const x1 = PX + s * CW, x2 = PX + e * CW;
      ctx.fillStyle = c; ctx.fillRect(x1, PY, x2 - x1, CH);
      ctx.fillStyle = 'rgba(200,220,232,.3)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(l, (x1 + x2) / 2, PY + 10);
    });

    // Voltage curve (rises in CC, flat in CV)
    ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = 2; ctx.shadowColor = '#00bcd4'; ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      let v;
      if (x < p1) v = 0.55 + x / p1 * 0.1;
      else if (x < p2) v = 0.65 + (x - p1) / (p2 - p1) * 0.35;
      else v = 1.0;
      ctx.lineTo(PX + x * CW, PY + CH - v * CH);
    }
    ctx.stroke(); ctx.shadowBlur = 0;

    // Current curve (flat in CC, drops in CV)
    ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 2; ctx.shadowColor = '#ffab00'; ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      let c;
      if (x < p1) c = 0.15 + x / p1 * 0.7;
      else if (x < p2) c = 0.85;
      else c = 0.85 * Math.pow(1 - (x - p2) / (1 - p2), 0.7);
      ctx.lineTo(PX + x * CW, PY + CH - c * CH);
    }
    ctx.stroke(); ctx.shadowBlur = 0;

    // Current position (based on soc)
    const xPos = PX + (soc / 100) * CW;
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(xPos, PY); ctx.lineTo(xPos, PY + CH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${soc}%`, xPos, PY + CH + 14);

    // Legend
    [['电压', '#00bcd4'], ['电流', '#ffab00']].forEach(([l, c], i) => {
      ctx.fillStyle = c; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillRect(PX + CW - 80 + i * 44, PY + 2, 14, 3);
      ctx.fillStyle = c + 'cc'; ctx.fillText(l, PX + CW - 62 + i * 44, PY + 10);
    });
  }, [soc]);
  return <canvas ref={ref} width={340} height={120} style={{ maxWidth: '100%' }} />;
}

/* ── Boost 转换原理图 ─────────────────────────────────────── */
function BoostCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = setupHiDpi(cv, 320, 130);
    const W = 320, H = 130;
    let t = 0, raf;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.035;

      const phase = (Math.sin(t * 1.8) + 1) / 2;  // 0=switch on, 1=switch off
      const switchOn = phase < 0.5;

      // ── Labels ──
      ctx.fillStyle = 'rgba(200,220,232,.45)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(switchOn ? '阶段一：开关闭合，电感储能' : '阶段二：开关断开，电感释能升压', W / 2, 14);

      // Circuit elements positions
      const VIN_X = 38, VOUT_X = W - 38, MID_Y = H / 2 + 8;
      const IND_X = W / 2 - 10;
      const SW_X = W / 2 + 40;
      const CAP_X = VOUT_X - 10;

      // Wires
      ctx.strokeStyle = 'rgba(200,220,232,.25)'; ctx.lineWidth = 1.5;
      // Top wire: Vin → Inductor → Diode → Vout
      ctx.beginPath(); ctx.moveTo(VIN_X, MID_Y - 20); ctx.lineTo(IND_X - 22, MID_Y - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(IND_X + 22, MID_Y - 20); ctx.lineTo(CAP_X, MID_Y - 20); ctx.stroke();
      // Capacitor top/bottom
      ctx.beginPath(); ctx.moveTo(CAP_X, MID_Y - 20); ctx.lineTo(VOUT_X, MID_Y - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CAP_X, MID_Y + 20); ctx.lineTo(VOUT_X, MID_Y + 20); ctx.stroke();
      // Ground wire bottom
      ctx.beginPath(); ctx.moveTo(VIN_X, MID_Y + 20); ctx.lineTo(SW_X, MID_Y + 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(SW_X, MID_Y + 20); ctx.lineTo(VOUT_X, MID_Y + 20); ctx.stroke();
      // Switch vertical
      ctx.beginPath(); ctx.moveTo(SW_X, MID_Y - 20); ctx.lineTo(SW_X, MID_Y + 20); ctx.stroke();

      // ── Inductor ──
      ctx.strokeStyle = switchOn ? '#00bcd4' : '#ffab00'; ctx.lineWidth = 2;
      ctx.shadowColor = switchOn ? '#00bcd4' : '#ffab00'; ctx.shadowBlur = switchOn ? 8 : 4;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.arc(IND_X - 15 + i * 10, MID_Y - 20, 5, Math.PI, 0);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = switchOn ? '#00bcd4aa' : '#ffab00aa'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(switchOn ? '储能' : '释能', IND_X, MID_Y - 36);

      // ── Diode ──
      const DX = IND_X + 50;
      const dColor = switchOn ? 'rgba(200,220,232,.3)' : '#00e676';
      ctx.fillStyle = dColor; ctx.strokeStyle = dColor; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(DX - 6, MID_Y - 27); ctx.lineTo(DX + 6, MID_Y - 20); ctx.lineTo(DX - 6, MID_Y - 13); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(DX + 6, MID_Y - 27); ctx.lineTo(DX + 6, MID_Y - 13); ctx.stroke();

      // ── Switch (MOSFET) ──
      const swColor = switchOn ? '#00e676' : 'rgba(200,220,232,.3)';
      ctx.strokeStyle = swColor; ctx.lineWidth = 2; ctx.shadowColor = switchOn ? '#00e676' : 'transparent'; ctx.shadowBlur = switchOn ? 8 : 0;
      // Switch symbol
      ctx.beginPath(); ctx.moveTo(SW_X - 8, MID_Y - 20); ctx.lineTo(SW_X - 8, MID_Y - 6);
      if (switchOn) { ctx.lineTo(SW_X + 8, MID_Y + 6); ctx.lineTo(SW_X + 8, MID_Y + 20); }
      else { ctx.moveTo(SW_X + 8, MID_Y + 20); }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = swColor; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(switchOn ? 'ON' : 'OFF', SW_X, MID_Y + 34);

      // ── Capacitor ──
      ctx.strokeStyle = '#9c7dff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(CAP_X, MID_Y - 8); ctx.lineTo(CAP_X, MID_Y - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CAP_X, MID_Y + 8); ctx.lineTo(CAP_X, MID_Y + 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CAP_X - 10, MID_Y - 8); ctx.lineTo(CAP_X + 10, MID_Y - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CAP_X - 10, MID_Y + 8); ctx.lineTo(CAP_X + 10, MID_Y + 8); ctx.stroke();

      // ── Voltage labels ──
      ctx.fillStyle = '#00e67699'; ctx.font = 'bold 11px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('3.7V', VIN_X, MID_Y + 34);
      ctx.fillStyle = '#ffab0099';
      ctx.fillText('5V', VOUT_X, MID_Y + 34);

      // ── Current flow arrows ──
      const arrowX = switchOn
        ? [IND_X - 22, IND_X + 22]   // switch on: current into inductor
        : [IND_X + 22, CAP_X - 10];  // switch off: current through diode to cap
      const arrowColor = switchOn ? '#00bcd4' : '#00e676';
      const ap = ((t * 2) % 1);
      const ax = arrowX[0] + (arrowX[1] - arrowX[0]) * ap;
      ctx.fillStyle = arrowColor; ctx.shadowColor = arrowColor; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(ax, MID_Y - 20, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={320} height={130} style={{ maxWidth: '100%' }} />;
}

/* ── 主组件 ─────────────────────────────────────────────── */
const PROTOCOLS = [
  { id: '5W',   label: '5W 普通',  color: '#00bcd4', v: '5V',  i: '1A',  w: 5,   note: '所有设备通用，充电最慢' },
  { id: 'QC3',  label: 'QC 3.0',  color: '#ffab00', v: '5~12V', i: '3A', w: 18,  note: '高通协议，安卓旗舰主流' },
  { id: 'PD45', label: 'PD 45W',  color: '#9c7dff', v: '20V',  i: '2.25A', w: 45, note: '笔记本 / MacBook / iPad' },
  { id: 'PD100',label: 'PD 100W', color: '#e040fb', v: '20V',  i: '5A',  w: 100, note: '高端充电宝，可充游戏本' },
];

export default function PowerBank() {
  const [charging, setCharging] = useState(true);
  const [outputting, setOutputting] = useState(false);
  const [soc, setSoc] = useState(42);
  const [protocol, setProtocol] = useState('QC3');

  useEffect(() => {
    const timer = setInterval(() => setSoc(s => {
      if (charging && !outputting) return Math.min(100, +(s + 0.6).toFixed(1));
      if (outputting && !charging) return Math.max(0, +(s - 0.4).toFixed(1));
      return s;
    }), 250);
    return () => clearInterval(timer);
  }, [charging, outputting]);

  const proto = PROTOCOLS.find(p => p.id === protocol);
  const fc = soc > 60 ? '#00e676' : soc > 25 ? '#ffab00' : '#ff1744';
  const wh5  = (soc / 100 * 37 * 0.9).toFixed(1);

  return (
    <section id="power-bank" className="sec">
      <div className="sh">
        <span className="sh-icon">🔋</span>
        <div className="sh-tag">Stage 3 · Small Appliance · Power Bank</div>
        <h2 className="sh-title" style={{ color: ACC }}>充电宝电路设计</h2>
        <p className="sh-sub">
          锂电芯 → BMS 保护 → Boost 升压 → USB 输出，完整电路链路可视化；CC/CV 充电曲线、Boost 工作原理与快充协议全解析。
        </p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* ══ Row 1: 左侧电路图 + 右侧控制/状态 ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 16, marginBottom: 20, alignItems: 'start' }}>

        {/* 左：协议选择器 + 电路拓扑图 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 快充协议选择器 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {PROTOCOLS.map(p => (
              <button key={p.id} onClick={() => setProtocol(p.id)} style={{
                flex: 1, padding: '8px 6px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${protocol === p.id ? p.color : p.color + '30'}`,
                background: protocol === p.id ? p.color + '16' : 'rgba(6,12,28,.6)',
                transition: 'all .2s',
              }}>
                <div style={{ fontWeight: 700, color: protocol === p.id ? p.color : 'var(--dim)', fontSize: 12 }}>{p.label}</div>
                <div style={{ font: '10px "Courier New",monospace', color: protocol === p.id ? p.color + 'cc' : 'rgba(130,150,170,.5)', marginTop: 2 }}>
                  {p.v} · {p.w}W
                </div>
              </button>
            ))}
          </div>

          {/* 电路拓扑图 */}
          <div className="reveal" style={{ background: 'rgba(6,12,28,.85)', border: `1px solid ${proto.color}22`, borderRadius: 14, padding: '12px 10px 10px' }}>
            <div style={{ font: '10px "Courier New",monospace', color: 'var(--dim)', textAlign: 'center', marginBottom: 6, letterSpacing: 2 }}>
              ⚡ 实时电路拓扑图
            </div>
            <CircuitCanvas charging={charging} outputting={outputting} soc={Math.round(soc)} protocol={protocol} />
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setCharging(c => !c)} style={{
              flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${charging ? '#00e676' : 'rgba(0,230,118,.22)'}`,
              background: charging ? 'rgba(0,230,118,.12)' : 'transparent',
              color: charging ? '#00e676' : 'var(--dim)', font: '13px/1 inherit', transition: 'all .2s',
            }}>🔌 {charging ? '断开充电' : '接入充电器'}</button>
            <button onClick={() => setOutputting(o => !o)} style={{
              flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${outputting ? proto.color : proto.color + '30'}`,
              background: outputting ? proto.color + '14' : 'transparent',
              color: outputting ? proto.color : 'var(--dim)', font: '13px/1 inherit', transition: 'all .2s',
            }}>📱 {outputting ? '断开手机' : '接入手机'}</button>
          </div>
        </div>

        {/* 右：实时状态卡 + 快充列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 2×2 状态卡 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: '当前电量', val: `${Math.round(soc)}%`, sub: `${(2.8+soc/100*1.4).toFixed(2)}V/节`, color: fc },
              { label: '可用能量', val: `${wh5}Wh`, sub: '升压90%效率后', color: ACC },
              { label: '协议功率', val: `${proto.w}W`, sub: `${proto.v}×${proto.i}`, color: proto.color },
              { label: '充满剩余', val: soc>=100?'已满':`${Math.round((100-soc)/100*37/proto.w*60)}分钟`, sub: '按协议速率估算', color: '#ffab00' },
            ].map(c => (
              <div key={c.label} className="glass" style={{ borderColor: c.color+'25', padding: '10px 12px' }}>
                <div style={{ font: '9px "Courier New",monospace', color: 'var(--dim)', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontWeight: 700, color: c.color, fontSize: 17 }}>{c.val}</div>
                <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* 快充协议列表 */}
          <div className="glass" style={{ borderColor: 'rgba(255,171,0,.18)', flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#ffab00', marginBottom: 8, fontSize: 12 }}>⚡ 快充协议</div>
            {PROTOCOLS.map(p => (
              <div key={p.id} onClick={() => setProtocol(p.id)} style={{
                display: 'flex', gap: 8, padding: '5px 4px', borderBottom: '1px solid rgba(255,255,255,.05)',
                cursor: 'pointer', alignItems: 'center', borderRadius: 4,
                background: protocol === p.id ? p.color + '0a' : 'transparent',
              }}>
                <div style={{ width: 3, height: 24, background: p.color, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: p.color, fontSize: 11 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--dim)', lineHeight: 1.3 }}>{p.note}</div>
                </div>
                <div style={{ font: 'bold 12px "Courier New",monospace', color: p.color }}>{p.w}W</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Row 2: CC/CV 曲线 + Boost 原理 + 容量识别 ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 4 }}>

        {/* CC/CV 曲线 */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 700, color: ACC, fontSize: 14 }}>📈 CC/CV 充电曲线</div>
          <div style={{ background: 'rgba(6,12,28,.8)', border: '1px solid rgba(0,188,212,.14)', borderRadius: 12, padding: '10px 6px 4px' }}>
            <ChargeCurveCanvas soc={Math.round(soc)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { p: '预充 < 10%', c: '#ff6b35', d: '小电流激活亏电电芯' },
              { p: '恒流 CC 10~70%', c: '#00bcd4', d: '最大电流，电压线性上升' },
              { p: '恒压 CV 70~100%', c: '#00e676', d: '4.2V 恒压，电流渐降' },
              { p: '截止', c: '#ffab00', d: '电流≤0.05C 自动停充' },
            ].map(item => (
              <div key={item.p} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 6px', background: 'rgba(6,12,28,.5)', borderRadius: 6, borderLeft: `2px solid ${item.c}` }}>
                <div>
                  <div style={{ fontWeight: 700, color: item.c, fontSize: 10.5 }}>{item.p}</div>
                  <div style={{ fontSize: 11, color: '#8aacb8' }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boost 原理 */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 700, color: '#ffab00', fontSize: 14 }}>⚙️ Boost 升压原理</div>
          <div style={{ background: 'rgba(6,12,28,.8)', border: '1px solid rgba(255,171,0,.14)', borderRadius: 12, padding: '10px 6px 4px' }}>
            <BoostCanvas />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { s: '开关闭合', c: '#00bcd4', d: 'MOSFET 导通，电感积累磁能（3.7V 输入）' },
              { s: '开关断开', c: '#ffab00', d: '电感反向释能叠加输入，推高至 5V 输出' },
              { s: '高频切换', c: '#00e676', d: '300kHz~1MHz，Vout = Vin/(1-D)，效率 88~94%' },
            ].map(item => (
              <div key={item.s} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <div style={{ width: 3, minHeight: 32, background: item.c, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: item.c, fontSize: 11 }}>{item.s}</div>
                  <div style={{ fontSize: 11.5, color: '#8aacb8', lineHeight: 1.5 }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 容量识别 + 安全 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="glass reveal" style={{ borderColor: 'rgba(0,188,212,.18)' }}>
            <div style={{ fontWeight: 700, color: ACC, marginBottom: 8, fontSize: 13 }}>🔢 容量虚标识别</div>
            <div className="fbox" style={{ marginBottom: 8 }}><div className="fbox-f">37 Wh</div><div className="fbox-desc">10000mAh × 3.7V（可靠指标）</div></div>
            <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.65 }}>
              商家的 mAh 是 <strong style={{color:'var(--white)'}}>3.7V</strong> 下容量。升压到 5V 后实际约 <strong style={{color:ACC}}>6660mAh</strong>，非标称 10000mAh。
              <br/><span style={{color:'#ffab00', marginTop: 4, display: 'block'}}>看铭牌 Wh 最可靠！</span>
            </div>
          </div>
          <div className="glass reveal" style={{ borderColor: 'rgba(255,23,68,.18)', flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#ff1744', marginBottom: 8, fontSize: 13 }}>⚠️ 安全与寿命</div>
            <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.75 }}>
              ▸ 高温曝晒（≥60°C）引发热失控<br/>
              ▸ 鼓包立即停用<br/>
              ▸ 飞机 &gt;100Wh 需申报<br/>
              ▸ 20~80% 区间使用延寿命<br/>
              ▸ 闲置保存 50% 电量<br/>
              ▸ 边充边用长期损伤电芯
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
