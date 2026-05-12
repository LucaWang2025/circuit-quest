import { useEffect, useRef, useState } from 'react';

const ACC = '#9c7dff';

// ── Transformer Canvas ────────────────────────────────────
function TransformerCanvas({ n1, n2 }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, rafId;

    const ratio = n2 / n1;
    const v1 = 220, v2 = +(v1 * ratio).toFixed(1);

    function drawCoil(cx, cy, turns, color, glowAlpha) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.shadowColor = color; ctx.shadowBlur = glowAlpha * 10;
      for (let i = 0; i < turns; i++) {
        const x = cx + (i - turns / 2) * 10;
        ctx.beginPath(); ctx.arc(x, cy, 7, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 5, cy, 7, 0, Math.PI); ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const CX = W / 2, CY = H / 2;

      // Iron core (center rectangle)
      const coreW = 30, coreH = 80;
      ctx.fillStyle = 'rgba(156,125,255,.15)';
      ctx.strokeStyle = 'rgba(156,125,255,.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(CX - coreW / 2, CY - coreH / 2, coreW, coreH, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(156,125,255,.5)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText('铁芯', CX, CY + 4);

      // Primary coils (left)
      const pTurns = Math.max(3, Math.round(n1 / 100));
      const pX = CX - coreW / 2 - pTurns * 10;
      const sinV1 = Math.sin(t * 2);
      const pGlow = 0.5 + 0.4 * Math.abs(sinV1);
      drawCoil(pX + pTurns * 5, CY, pTurns, `rgba(255,107,53,${pGlow})`, pGlow);

      // Primary wires
      ctx.strokeStyle = 'rgba(255,82,82,.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(40, CY - 24); ctx.lineTo(pX - pTurns * 5 + 5, CY - 24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, CY + 24); ctx.lineTo(pX - pTurns * 5 + 5, CY + 24); ctx.stroke();
      // AC source symbol
      ctx.strokeStyle = 'rgba(255,82,82,.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(28, CY, 18, 0, Math.PI * 2); ctx.stroke();
      // Sine wave inside
      ctx.beginPath();
      for (let x = -12; x <= 12; x++) {
        const y = -8 * Math.sin((x / 12) * Math.PI + t * 2);
        x === -12 ? ctx.moveTo(28 + x, CY + y) : ctx.lineTo(28 + x, CY + y);
      }
      ctx.strokeStyle = 'rgba(255,82,82,.8)'; ctx.stroke();
      ctx.fillStyle = 'rgba(255,82,82,.7)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${v1}V`, 28, CY + 30);
      ctx.fillText('AC', 28, CY + 42);

      // Secondary coils (right)
      const sTurns = Math.max(3, Math.round(n2 / 100));
      const sX = CX + coreW / 2;
      const sinV2 = Math.sin(t * 2 + 0.05);
      const sGlow = 0.5 + 0.4 * Math.abs(sinV2);
      drawCoil(sX + sTurns * 5, CY, sTurns, `rgba(0,188,212,${sGlow})`, sGlow);

      // Secondary wires
      ctx.strokeStyle = 'rgba(0,188,212,.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sX + sTurns * 10 + 5, CY - 24); ctx.lineTo(W - 40, CY - 24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sX + sTurns * 10 + 5, CY + 24); ctx.lineTo(W - 40, CY + 24); ctx.stroke();
      // Load symbol (resistor)
      ctx.strokeStyle = 'rgba(0,188,212,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(W - 36, CY - 18, 18, 36, 3); ctx.stroke();
      ctx.fillStyle = 'rgba(0,188,212,.6)'; ctx.font = '9px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${v2}V`, W - 27, CY + 30);
      ctx.fillText('负载', W - 27, CY + 42);

      // Magnetic flux arrows in core
      const fluxAlpha = 0.4 + 0.3 * Math.abs(Math.sin(t * 2));
      ctx.strokeStyle = `rgba(156,125,255,${fluxAlpha})`; ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        const fy = CY + i * 14;
        const dir = Math.sin(t * 2) > 0 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(CX - 8, fy); ctx.lineTo(CX + 8, fy); ctx.stroke();
        // arrowhead
        ctx.beginPath(); ctx.moveTo(CX + 8 * dir, fy); ctx.lineTo(CX + (8 - 5) * dir, fy - 3); ctx.moveTo(CX + 8 * dir, fy); ctx.lineTo(CX + (8 - 5) * dir, fy + 3); ctx.stroke();
      }

      // Turns ratio label
      ctx.fillStyle = 'rgba(200,220,232,.6)'; ctx.font = '11px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`N₁ = ${n1}匝`, pX + pTurns * 5, CY - 45);
      ctx.fillStyle = 'rgba(0,188,212,.6)';
      ctx.fillText(`N₂ = ${n2}匝`, sX + sTurns * 5, CY - 45);

      // Ratio formula display
      ctx.fillStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 12;
      ctx.font = 'bold 13px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${n1} : ${n2} = ${v1}V : ${v2}V`, CX, H - 18);
      ctx.shadowBlur = 0;

      rafId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [n1, n2]);
  return <canvas ref={ref} width={360} height={260} style={{ maxWidth: '100%' }} />;
}

// ── Data ──────────────────────────────────────────────────
const TRANSFORMER_TYPES = [
  { icon: '🏗️', t: '电力变压器', color: '#ffab00', d: '电网升降压，220kV→10kV→220V，保障电能长距离输送后降至家用安全电压' },
  { icon: '🔌', t: '工频变压器', color: '#ff6b35', d: '50Hz 铁芯变压器，用于早期家电电源，体积重量大但可靠，如老式收音机电源' },
  { icon: '⚡', t: '开关电源', color: '#00e676', d: '高频（50kHz+）开关变换，体积小效率高（>85%），手机充电器、电脑电源均采用' },
  { icon: '🔊', t: '音频变压器', color: '#9c7dff', d: '用于功放与扬声器阻抗匹配，隔离信号中的直流成分，保护扬声器' },
  { icon: '🛡️', t: '隔离变压器', color: '#00bcd4', d: '1:1 变比，不改变电压但将输出与电网隔离，用于医疗设备和维修调试安全保护' },
];

const SMPS_STEPS = [
  { n: 1, t: '整流', d: '交流 220V 经桥式整流变为脉动直流 ~310V' },
  { n: 2, t: '高频开关', d: 'MOSFET 以 50~500kHz 高频通断，将直流切成高频方波' },
  { n: 3, t: '高频变压器', d: '小尺寸高频变压器降压，N1:N2 决定输出电压' },
  { n: 4, t: '整流滤波', d: '次级整流 + 电容滤波，输出稳定的低压直流' },
  { n: 5, t: '反馈控制', d: '输出电压与基准比较，PWM 占空比自动调节，保持电压稳定' },
];

export default function Transformer() {
  const [n1, setN1] = useState(440);
  const [n2, setN2] = useState(44);
  const ratio = (n2 / n1);
  const v2 = (220 * ratio).toFixed(1);

  return (
    <section id="transformer" className="sec">
      <div className="sh">
        <span className="sh-icon">🔄</span>
        <div className="sh-tag">Stage 2 · Components · Transformer</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(156,125,255,.4)` }}>
          变压器与开关电源
        </h2>
        <p className="sh-sub">理解电磁感应如何实现电压转换，掌握家中充电器、适配器的工作原理，是维修现代电器的必备知识。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Animation + principle */}
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.2)', flexDirection: 'column', gap: 16 }}>
          <TransformerCanvas n1={n1} n2={n2} />
          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 44 }}>N₁匝:</span>
              <input type="range" min={100} max={1000} step={10} value={n1} onChange={e => setN1(+e.target.value)} style={{ flex: 1, accentColor: '#ff6b35' }} />
              <span style={{ font: '12px "Courier New",monospace', color: '#ff6b35', width: 44 }}>{n1}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 44 }}>N₂匝:</span>
              <input type="range" min={10} max={500} step={5} value={n2} onChange={e => setN2(+e.target.value)} style={{ flex: 1, accentColor: ACC }} />
              <span style={{ font: '12px "Courier New",monospace', color: ACC, width: 44 }}>{n2}</span>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(156,125,255,.1)', border: '1px solid rgba(156,125,255,.25)', borderRadius: 10, padding: '10px 0' }}>
              <span style={{ font: '13px "Courier New",monospace', color: 'var(--dim)' }}>输入 220V → 输出 </span>
              <span style={{ font: 'bold 18px "Courier New",monospace', color: ACC, textShadow: `0 0 12px rgba(156,125,255,.6)` }}>{v2}V</span>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', display: 'block', marginTop: 4 }}>
                {ratio >= 1 ? '升压变压器 ↑' : '降压变压器 ↓'} &nbsp; 变比 = {ratio.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>⚡ 变压器核心公式</div>
          {[
            { f: 'V₁/V₂ = N₁/N₂',  desc: '电压之比 = 匝数之比',      note: '这是变压器最基本的变换关系' },
            { f: 'I₁/I₂ = N₂/N₁',  desc: '电流之比 = 匝数反比',      note: '升压则降流，功率守恒' },
            { f: 'P₁ ≈ P₂',         desc: '输入功率 ≈ 输出功率',      note: '理想变压器无损耗，实际效率 85~99%' },
            { f: 'Φ = N × I / R',   desc: '磁通量 = 安匝数 / 磁阻',  note: '铁芯导磁率越高，耦合越紧密' },
          ].map(row => (
            <div key={row.f} className="fbox" style={{ borderColor: 'rgba(156,125,255,.22)' }}>
              <div className="fbox-f" style={{ color: ACC }}>{row.f}</div>
              <div className="fbox-desc">{row.desc}</div>
              <div className="fbox-note">{row.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transformer types */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: ACC, marginBottom: 20 }}>📦 变压器的种类</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {TRANSFORMER_TYPES.map(item => (
            <div key={item.t} className="glass reveal" style={{ borderColor: `${item.color}28` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div style={{ fontWeight: 700, color: item.color, fontSize: 14 }}>{item.t}</div>
              </div>
              <div style={{ fontSize: 13, color: '#8aacb8', lineHeight: 1.65 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Switch mode power supply */}
      <div style={{ marginTop: 44 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#00e676', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          ⚡ 开关电源（SMPS）工作流程
        </h3>
        <div style={{ fontSize: 13, color: '#8aacb8', marginBottom: 20 }}>
          手机充电器、电脑电源、路由器适配器——它们都是开关电源，比传统工频变压器体积小 10 倍、效率高 30%。
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, position: 'relative' }}>
          {SMPS_STEPS.map((s, i) => (
            <div key={s.n} className="reveal" style={{ display: 'flex', alignItems: 'stretch', minWidth: 150, flex: 1 }}>
              <div style={{
                flex: 1, background: 'rgba(6,12,28,.7)',
                border: '1px solid rgba(0,230,118,.14)',
                borderRadius: i === 0 ? '12px 0 0 12px' : i === SMPS_STEPS.length - 1 ? '0 12px 12px 0' : '0',
                borderRight: i < SMPS_STEPS.length - 1 ? 'none' : undefined,
                padding: '16px 14px', textAlign: 'center',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,230,118,.18)', border: '1px solid rgba(0,230,118,.5)', color: '#00e676', font: 'bold 12px monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>{s.n}</div>
                <div style={{ fontWeight: 700, color: '#00e676', fontSize: 13, marginBottom: 6 }}>{s.t}</div>
                <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.6 }}>{s.d}</div>
              </div>
              {i < SMPS_STEPS.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(0,230,118,.4)', fontSize: 16, padding: '0 2px' }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* Common adapter specs */}
        <div style={{ marginTop: 24, background: 'rgba(156,125,255,.07)', border: '1px solid rgba(156,125,255,.2)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontWeight: 700, color: ACC, marginBottom: 14 }}>📋 常见适配器输出规格</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {[
              ['手机充电器', '5V / 2A (USB-A)', '10W', '普通充电'],
              ['快充头 PD', '5~20V / 5A',   '100W', 'USB-C PD 协议'],
              ['笔记本适配器', '19~20V / 3.4A', '65W', '圆形 DC 接口'],
              ['路由器',      '12V / 1A',     '12W', '圆形 DC 2.5mm'],
              ['硬盘盒',      '12V+5V',       '30W', 'SATA 供电'],
              ['监控摄像头', '12V / 2A',     '24W', 'DC 5.5mm 接口'],
            ].map(([dev, spec, pwr, note]) => (
              <div key={dev} style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 3, padding: '8px 12px', background: 'rgba(156,125,255,.07)', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, color: '#c8dce8', fontSize: 13 }}>{dev}</div>
                <div style={{ color: ACC, font: '11px "Courier New",monospace' }}>{spec} · {pwr}</div>
                <div style={{ color: 'var(--dim)' }}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety warning */}
      <div style={{ marginTop: 24, background: 'rgba(255,23,68,.07)', border: '1px solid rgba(255,23,68,.25)', borderRadius: 14, padding: '14px 20px' }}>
        <div style={{ fontWeight: 700, color: '#ff1744', marginBottom: 8 }}>⚠️ 维修注意事项</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
          {[
            '开关电源内部有大容值滤波电容，拔电后仍保有 300V+ 高压，需放电后再操作',
            '严禁带电测量开关电源内部，初级侧连接 220V 电网，不可用普通万用表直接测量',
            '适配器发烫、异味、输出电压异常时立即停用，不可继续使用',
          ].map(t => (
            <div key={t} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8aacb8', lineHeight: 1.55 }}>
              <span style={{ color: '#ff1744', flexShrink: 0 }}>▸</span>{t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
