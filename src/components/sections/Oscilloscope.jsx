import { useEffect, useRef, useState } from 'react';

const ACC = '#00e676';

const WAVE_TYPES = [
  { id: 'sine',     label: '正弦波',   icon: '∿' },
  { id: 'square',   label: '方波',     icon: '⊓' },
  { id: 'triangle', label: '三角波',   icon: '△' },
  { id: 'pwm',      label: 'PWM波',    icon: '⎍' },
];

export default function Oscilloscope() {
  const canvasRef = useRef(null);
  const [waveType, setWaveType] = useState('sine');
  const [freq, setFreq] = useState(1.0);  // kHz
  const [vdiv, setVdiv] = useState(1.0);   // V/div

  const waveRef = useRef('sine');
  const freqRef = useRef(1.0);
  const vdivRef = useRef(1.0);

  useEffect(() => { waveRef.current = waveType; }, [waveType]);
  useEffect(() => { freqRef.current = freq; }, [freq]);
  useEffect(() => { vdivRef.current = vdiv; }, [vdiv]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 380, H = 280;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    const SCREEN = { x: 10, y: 10, w: 280, h: 220 };
    const DIVS_X = 10, DIVS_Y = 8;
    const CELL_W = SCREEN.w / DIVS_X;
    const CELL_H = SCREEN.h / DIVS_Y;
    let phase = 0;
    let rafId;

    function getSample(t, type, pwmDuty = 0.3) {
      const tau = t % 1;
      switch (type) {
        case 'sine':     return Math.sin(t * Math.PI * 2);
        case 'square':   return tau < 0.5 ? 1 : -1;
        case 'triangle': return tau < 0.5 ? 4 * tau - 1 : 3 - 4 * tau;
        case 'pwm':      return tau < pwmDuty ? 1 : -1;
        default:         return 0;
      }
    }

    function drawScreen() {
      const { x, y, w, h } = SCREEN;
      // Screen bezel
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath(); ctx.roundRect(x - 4, y - 4, w + 8, h + 8, 8); ctx.fill();
      ctx.strokeStyle = '#1a2a1a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x - 4, y - 4, w + 8, h + 8, 8); ctx.stroke();

      // Screen background
      ctx.fillStyle = '#001a00';
      ctx.fillRect(x, y, w, h);

      // Grid lines
      ctx.lineWidth = 0.4;
      for (let gx = 0; gx <= DIVS_X; gx++) {
        const px = x + gx * CELL_W;
        ctx.strokeStyle = gx % 5 === 0 ? 'rgba(0,230,118,0.3)' : 'rgba(0,230,118,0.12)';
        ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
      }
      for (let gy = 0; gy <= DIVS_Y; gy++) {
        const py = y + gy * CELL_H;
        ctx.strokeStyle = gy % 4 === 0 ? 'rgba(0,230,118,0.3)' : 'rgba(0,230,118,0.12)';
        ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
      }

      // Center crosshair ticks
      ctx.strokeStyle = 'rgba(0,230,118,0.5)';
      ctx.lineWidth = 0.7;
      const midX = x + w / 2, midY = y + h / 2;
      for (let i = 0; i <= DIVS_X; i++) {
        const px = x + i * CELL_W;
        ctx.beginPath(); ctx.moveTo(px, midY - 3); ctx.lineTo(px, midY + 3); ctx.stroke();
      }
      for (let i = 0; i <= DIVS_Y; i++) {
        const py = y + i * CELL_H;
        ctx.beginPath(); ctx.moveTo(midX - 3, py); ctx.lineTo(midX + 3, py); ctx.stroke();
      }
    }

    function drawWave() {
      const { x, y, w, h } = SCREEN;
      const midY = y + h / 2;
      const type = waveRef.current;
      const f = freqRef.current; // kHz → cycles per screen
      const vd = vdivRef.current; // V/div
      const pixPerVolt = CELL_H / vd;
      const cycles = f * 2; // display 2 periods per screen roughly

      // Glow effect - draw multiple passes
      const passes = [
        { alpha: 0.1, width: 6, blur: 0 },
        { alpha: 0.3, width: 3, blur: 0 },
        { alpha: 1.0, width: 1.5, blur: 0 },
      ];

      passes.forEach(({ alpha, width }) => {
        ctx.save();
        ctx.strokeStyle = `rgba(0,230,118,${alpha})`;
        ctx.lineWidth = width;
        ctx.shadowColor = ACC;
        ctx.shadowBlur = alpha > 0.5 ? 8 : 0;
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.beginPath();
        for (let px = 0; px <= w; px++) {
          const t = (px / w) * cycles + phase;
          const sample = getSample(t, type);
          const py = midY - sample * pixPerVolt * (DIVS_Y / 2) * 0.8;
          if (px === 0) ctx.moveTo(x + px, py);
          else ctx.lineTo(x + px, py);
        }
        ctx.stroke();
        ctx.restore();
      });
    }

    function calcMeasurements() {
      const f = freqRef.current * 1000; // Hz
      const vd = vdivRef.current;
      const type = waveRef.current;
      const amp = vd * DIVS_Y / 2 * 0.8; // peak amplitude
      const vpp = amp * 2;
      let vrms;
      switch (type) {
        case 'sine':     vrms = amp / Math.sqrt(2); break;
        case 'square':   vrms = amp; break;
        case 'triangle': vrms = amp / Math.sqrt(3); break;
        case 'pwm':      vrms = amp * Math.sqrt(0.3); break;
        default:         vrms = amp / Math.sqrt(2);
      }
      return {
        freq: f >= 1000 ? `${(f / 1000).toFixed(2)}kHz` : `${f.toFixed(0)}Hz`,
        period: f > 0 ? (1 / f * 1000).toFixed(3) + 'ms' : '—',
        vpp: vpp.toFixed(2) + 'V',
        vrms: vrms.toFixed(2) + 'V',
      };
    }

    function drawMeasurements() {
      const m = calcMeasurements();
      const panelX = SCREEN.x + SCREEN.w + 16;
      const panelY = SCREEN.y;
      const panelW = W - panelX - 8;

      // Panel bg
      ctx.fillStyle = 'rgba(0,20,10,0.9)';
      ctx.beginPath(); ctx.roundRect(panelX, panelY, panelW, SCREEN.h, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(0,230,118,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(panelX, panelY, panelW, SCREEN.h, 8); ctx.stroke();

      const entries = [
        { label: 'FREQ', val: m.freq },
        { label: 'PERIOD', val: m.period },
        { label: 'Vpp', val: m.vpp },
        { label: 'Vrms', val: m.vrms },
        { label: 'T/DIV', val: `${(1 / freqRef.current / 2).toFixed(2)}ms` },
        { label: 'V/DIV', val: `${vdivRef.current.toFixed(1)}V` },
      ];

      ctx.textAlign = 'center';
      entries.forEach((e, i) => {
        const ey = panelY + 26 + i * 33;
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(0,230,118,0.5)';
        ctx.fillText(e.label, panelX + panelW / 2, ey);
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = ACC;
        ctx.fillText(e.val, panelX + panelW / 2, ey + 15);
        if (i < entries.length - 1) {
          ctx.strokeStyle = 'rgba(0,230,118,0.1)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(panelX + 8, ey + 22);
          ctx.lineTo(panelX + panelW - 8, ey + 22);
          ctx.stroke();
        }
      });
      ctx.textAlign = 'left';

      // Trigger symbol
      ctx.strokeStyle = 'rgba(255,200,0,0.7)';
      ctx.lineWidth = 1.5;
      const tx = SCREEN.x + SCREEN.w * 0.5;
      ctx.beginPath(); ctx.moveTo(tx, SCREEN.y + 4); ctx.lineTo(tx, SCREEN.y + SCREEN.h - 4); ctx.stroke();
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255,200,0,0.8)';
      ctx.fillText('T', tx + 3, SCREEN.y + 12);
    }

    function drawStatusBar() {
      const y2 = SCREEN.y + SCREEN.h + 10;
      ctx.fillStyle = 'rgba(0,230,118,0.15)';
      ctx.fillRect(SCREEN.x, y2, SCREEN.w, 22);
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(0,230,118,0.8)';
      const type = waveRef.current;
      const typeLabel = WAVE_TYPES.find(w => w.id === type)?.label || '';
      ctx.fillText(
        `CH1  AC  ${typeLabel}  TRIG:EDGE↑  SINGLE`,
        SCREEN.x + 6, y2 + 15,
      );
    }

    function draw() {
      rafId = requestAnimationFrame(draw);
      phase += freqRef.current * 0.015;

      ctx.clearRect(0, 0, W, H);

      // Outer background
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);

      // Oscilloscope body
      ctx.fillStyle = '#1a1f2e';
      ctx.beginPath(); ctx.roundRect(4, 4, W - 8, H - 8, 10); ctx.fill();
      ctx.strokeStyle = '#2a3040';
      ctx.lineWidth = 1; ctx.stroke();

      drawScreen();
      drawWave();
      drawMeasurements();
      drawStatusBar();
    }

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section id="oscilloscope" className="sec">
      <div className="sh">
        <span className="sh-icon" style={{ color: ACC }}>📡</span>
        <div>
          <div className="sh-title">示波器实操指南</div>
          <div className="sh-tag" style={{ color: ACC }}>进阶动手 · 信号测量</div>
        </div>
      </div>

      <div className="divider" />

      {/* Canvas */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid rgba(0,230,118,0.2)' }} />

        {/* Wave type */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {WAVE_TYPES.map(w => (
            <button key={w.id} onClick={() => setWaveType(w.id)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              background: waveType === w.id ? ACC : 'rgba(0,230,118,0.1)',
              color: waveType === w.id ? '#000' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${waveType === w.id ? ACC : 'rgba(0,230,118,0.3)'}`,
              fontWeight: waveType === w.id ? 'bold' : 'normal', transition: 'all 0.2s',
            }}>
              <span style={{ marginRight: '4px', fontFamily: 'monospace' }}>{w.icon}</span>
              {w.label}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '380px' }}>
          <div style={{ flex: '1', minWidth: '140px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              频率: <span style={{ color: ACC, fontWeight: 'bold' }}>{freq.toFixed(1)} kHz</span>
            </div>
            <input type="range" min="0.1" max="10" step="0.1" value={freq}
              onChange={e => setFreq(Number(e.target.value))}
              style={{ width: '100%', accentColor: ACC }} />
          </div>
          <div style={{ flex: '1', minWidth: '140px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              V/Div: <span style={{ color: ACC, fontWeight: 'bold' }}>{vdiv.toFixed(1)} V</span>
            </div>
            <input type="range" min="0.5" max="5" step="0.5" value={vdiv}
              onChange={e => setVdiv(Number(e.target.value))}
              style={{ width: '100%', accentColor: ACC }} />
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Basic operations */}
      <div className="sh-sub">🎛 基本操作要领</div>
      <div className="grid2">
        {[
          { icon: '⏱', title: 'Time/Div（时基）', desc: '控制水平方向每格代表的时间。调小→波形展宽，调大→波形压缩。选择使屏幕显示 2~3 个周期为宜。' },
          { icon: '⚡', title: 'V/Div（电压档）', desc: '控制垂直方向每格代表的电压。波形幅度占 4~6 格最佳，过大截波，过小精度差。' },
          { icon: '🎯', title: '触发（Trigger）', desc: '边沿触发使重复波形稳定显示。触发电平设在波形中间 50% 处，选上升/下降沿均可。' },
          { icon: '🔌', title: '探头（Probe）', desc: '默认 10X 探头可测量更高电压（量程×10），输入阻抗高，对电路影响小。地夹必须接地。' },
        ].map(item => (
          <div key={item.title} className="glass reveal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{item.title}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Key formulas */}
      <div className="sh-sub">📐 关键测量公式</div>
      <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,0.3)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { formula: 'f = 1 / T', explain: '频率 = 1 ÷ 周期（秒）', example: 'T=1ms → f=1kHz' },
            { formula: 'Vpp = 2 × Vpeak', explain: '峰峰值 = 2 倍峰值电压', example: 'Vpeak=5V → Vpp=10V' },
            { formula: 'Vrms = Vpp / (2√2)', explain: '正弦有效值（RMS）', example: 'Vpp=10V → Vrms≈3.54V' },
            { formula: 'D = ton / T', explain: 'PWM占空比 = 高电平时间 / 周期', example: 'ton=3ms,T=10ms → D=30%' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px', alignItems: 'center',
              borderBottom: i < 3 ? '1px solid rgba(0,230,118,0.1)' : 'none',
              paddingBottom: i < 3 ? '10px' : '0',
            }}>
              <div style={{
                background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.4)',
                borderRadius: '8px', padding: '6px 12px', fontFamily: 'monospace',
                fontSize: '13px', fontWeight: 'bold', color: ACC, minWidth: '140px', textAlign: 'center',
              }}>{item.formula}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{item.explain}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{item.example}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Practical tips */}
      <div className="sh-sub">🔧 实战测量技巧</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {[
          { tag: 'PWM', color: '#ffab00', tip: '测量占空比：开启光标（Cursor）功能，用 X1/X2 光标卡住高电平脉宽与周期，仪器自动计算 D%。' },
          { tag: '纹波', color: '#ff6b6b', tip: '测开关电源纹波：选 AC 耦合（屏蔽直流偏置），调高 V/Div 灵敏度，可观察到 mV 级纹波。' },
          { tag: '延迟', color: ACC, tip: '双通道相位差：CH1接输入，CH2接输出，同时显示，用时间光标量两波形零点之差即为相位延迟。' },
          { tag: '噪声', color: '#9c7dff', tip: '显示不稳定：检查地夹是否接好，探头补偿是否校准（方波肩部应平直无过冲/欠冲）。' },
        ].map((item, i) => (
          <div key={i} className="fbox reveal" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="fbox-f" style={{
              background: `${item.color}22`, border: `1px solid ${item.color}66`,
              color: item.color, borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold',
            }}>{item.tag}</div>
            <div className="fbox-desc">{item.tip}</div>
          </div>
        ))}
      </div>

      {/* Scope recommendations */}
      <div className="divider" />
      <div className="sh-sub">🛒 示波器推荐</div>
      <div className="grid2">
        {[
          { name: 'RIGOL DS1054Z', price: '¥1500~2000', spec: '50MHz 4通道，入门首选，可解锁至100MHz', level: '入门' },
          { name: 'Hantek 6022BE', price: '¥200~300', spec: '20MHz USB示波器，便携低成本，精度一般', level: '便携' },
          { name: 'OWON SDS1104', price: '¥800~1200', spec: '100MHz 4通道，性价比高，波形存储佳', level: '进阶' },
          { name: '鼎阳 SDS1202X', price: '¥1800~2500', spec: '200MHz，超磷光显示，触发强大', level: '专业' },
        ].map(s => (
          <div key={s.name} className="glass reveal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{s.name}</span>
              <span style={{
                background: 'rgba(0,230,118,0.15)', color: ACC, fontSize: '10px',
                padding: '2px 7px', borderRadius: '10px', border: `1px solid rgba(0,230,118,0.3)`,
              }}>{s.level}</span>
            </div>
            <div style={{ color: ACC, fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>{s.price}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{s.spec}</div>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Digital vs Analog */}
      <div className="fbox-note reveal" style={{ borderLeft: `3px solid ${ACC}` }}>
        <div style={{ fontWeight: 'bold', color: ACC, marginBottom: '6px' }}>📊 数字 vs 模拟示波器</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8' }}>
          <b style={{ color: '#fff' }}>采样率：</b>数字示波器要求采样率 ≥ 5 倍信号频率（奈奎斯特定理），100MHz信号需500MSPS以上。
          <br /><b style={{ color: '#fff' }}>存储深度：</b>越深则采集时间越长，适合分析低频缓变信号。
          <br /><b style={{ color: '#fff' }}>模拟示波器：</b>实时显示无延迟，高频微弱信号观察直观，但无法存储和计算。
        </div>
      </div>
    </section>
  );
}
