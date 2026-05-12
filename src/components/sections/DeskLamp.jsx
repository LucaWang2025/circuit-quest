import { useEffect, useRef, useState } from 'react';

const ACC = '#ffe066';

function LampCanvas({ brightness, mode }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    let t = 0, raf;

    const pwmFreq = 0.18;  // visual PWM cycle speed

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.04;

      // PWM duty visual (top waveform)
      const wY = 38, wH = 24, wW = W - 80;
      ctx.strokeStyle = 'rgba(255,224,102,.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, wY - wH / 2, wW, wH);

      // Draw PWM waveform
      const duty = brightness / 100;
      const period = 60;
      ctx.strokeStyle = ACC; ctx.lineWidth = 1.8; ctx.shadowColor = ACC; ctx.shadowBlur = 4;
      ctx.beginPath();
      let px = 40;
      while (px < 40 + wW) {
        const pos = (px - 40) % period;
        const high = pos < period * duty;
        const y = wY + (high ? -wH / 2 + 2 : wH / 2 - 2);
        if (px === 40) { ctx.moveTo(px, y); } else { ctx.lineTo(px, y); }
        px++;
      }
      ctx.stroke(); ctx.shadowBlur = 0;

      // PWM label
      ctx.fillStyle = 'rgba(255,224,102,.55)'; ctx.font = '10px "Courier New",monospace'; ctx.textAlign = 'left';
      ctx.fillText(`PWM  占空比 ${Math.round(duty * 100)}%`, 42, wY - wH / 2 - 5);

      // Lamp base / arm
      const LX = W / 2, LY = H - 40;
      // Base
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.ellipse(LX, LY + 8, 38, 7, 0, 0, Math.PI * 2); ctx.fill();
      // Arm
      ctx.strokeStyle = '#666'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(LX, LY + 4); ctx.lineTo(LX - 18, LY - 70); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(LX - 18, LY - 70); ctx.lineTo(LX + 10, LY - 140); ctx.stroke();

      // Lamp head
      const hx = LX + 10, hy = LY - 145;
      const headGrad = ctx.createLinearGradient(hx - 30, hy, hx + 30, hy + 20);
      headGrad.addColorStop(0, '#555'); headGrad.addColorStop(1, '#333');
      ctx.fillStyle = headGrad;
      ctx.beginPath(); ctx.ellipse(hx, hy + 12, 32, 12, -0.2, 0, Math.PI * 2); ctx.fill();

      // LED glow inside head
      if (brightness > 0) {
        const glowR = brightness * 0.5;
        const gGrad = ctx.createRadialGradient(hx, hy + 14, 0, hx, hy + 14, 28 + glowR);
        gGrad.addColorStop(0, `rgba(255,245,180,${0.95 * brightness / 100})`);
        gGrad.addColorStop(0.4, `rgba(255,224,102,${0.6 * brightness / 100})`);
        gGrad.addColorStop(1, 'rgba(255,200,50,0)');
        ctx.shadowColor = ACC; ctx.shadowBlur = brightness * 0.4;
        ctx.fillStyle = gGrad;
        ctx.beginPath(); ctx.ellipse(hx, hy + 14, 28 + glowR * 0.3, 10 + glowR * 0.15, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Cone beam
        const bLen = brightness * 1.5;
        const bGrad = ctx.createRadialGradient(hx, hy + 20, 5, hx + 20, hy + 60 + bLen, bLen);
        bGrad.addColorStop(0, `rgba(255,240,150,${brightness / 100 * 0.3})`);
        bGrad.addColorStop(1, 'rgba(255,220,80,0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.moveTo(hx - 26, hy + 20); ctx.lineTo(hx + 50 + bLen * 0.4, hy + 30 + bLen);
        ctx.lineTo(hx - 30 + bLen * 0.4, hy + 30 + bLen); ctx.closePath(); ctx.fill();
      }

      // Mode flicker for strobe
      if (mode === 'strobe') {
        const on = Math.sin(t * 25) > 0;
        ctx.fillStyle = on ? `rgba(255,240,150,0.18)` : 'transparent';
        ctx.fillRect(0, 0, W, H);
      }

      // Brightness label
      ctx.fillStyle = brightness > 0 ? `rgba(255,224,102,${0.6 + 0.2 * Math.sin(t)})` : 'rgba(200,220,232,.3)';
      ctx.font = '11px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(`亮度 ${brightness}%`, W / 2, H - 14);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [brightness, mode]);
  return <canvas ref={ref} width={320} height={300} style={{ maxWidth: '100%' }} />;
}

const DRIVER_STAGES = [
  { name: 'AC 输入', color: '#ff6b35', icon: '〜', desc: '220V 市电输入，经 EMI 滤波器滤除高频干扰' },
  { name: '整流桥', color: '#ffab00', icon: '⬦', desc: '四个整流二极管，将交流全波整流为脉动直流' },
  { name: '功率因数校正 PFC', color: '#00bcd4', icon: '📈', desc: '使电流波形贴近正弦，减少谐波污染，提升效率至 >90%' },
  { name: 'LLC/反激转换器', color: '#9c7dff', icon: '🔄', desc: 'DC-DC 隔离变换，输出稳定 24~48V 直流' },
  { name: '恒流驱动 IC', color: ACC, icon: '🔷', desc: '将电压转为恒定电流（如 350mA/700mA），确保 LED 亮度稳定' },
  { name: 'LED 阵列', color: '#fff8d0', icon: '💡', desc: '高功率 LED 串联，受恒流驱动，通过 PWM 调光' },
];

const LED_TYPES = [
  { name: 'SMD 2835', w: '0.2W', lm: '22lm', temp: '3000~6500K', use: '薄型台灯面板灯' },
  { name: 'SMD 5630', w: '0.5W', lm: '55lm', temp: '3000~6500K', use: '标准台灯、筒灯' },
  { name: 'COB 集成', w: '5~50W', lm: '100lm/W', temp: '2700~5000K', use: '高亮台灯、射灯' },
  { name: 'Filament', w: '2~8W', lm: '80lm/W', temp: '2200~2700K', use: '复古灯泡、装饰' },
];

export default function DeskLamp() {
  const [brightness, setBrightness] = useState(75);
  const [mode, setMode] = useState('normal');
  const [colorTemp, setColorTemp] = useState(4000);

  return (
    <section id="desk-lamp" className="sec">
      <div className="sh">
        <span className="sh-icon">🪔</span>
        <div className="sh-tag">Stage 3 · Small Appliance · Desk Lamp</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,224,102,.4)` }}>
          台灯电路设计
        </h2>
        <p className="sh-sub">从 AC-DC 驱动电源到恒流 LED 驱动、PWM 调光与色温调节，拆解现代 LED 台灯的完整电路链路。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,224,102,.2)', flexDirection: 'column', gap: 14 }}>
          <LampCanvas brightness={brightness} mode={mode} />
          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 40 }}>亮度:</span>
              <input type="range" min={0} max={100} value={brightness} onChange={e => setBrightness(+e.target.value)} style={{ flex: 1, accentColor: ACC }} />
              <span style={{ font: '12px "Courier New",monospace', color: ACC, width: 36 }}>{brightness}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', width: 40 }}>色温:</span>
              <input type="range" min={2700} max={6500} value={colorTemp} onChange={e => setColorTemp(+e.target.value)} style={{ flex: 1, accentColor: `hsl(${40 - (colorTemp - 2700) / 3800 * 30},100%,70%)` }} />
              <span style={{ font: '12px "Courier New",monospace', color: `hsl(${40 - (colorTemp - 2700) / 3800 * 30},100%,70%)`, width: 46 }}>{colorTemp}K</span>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
              {['normal','night','reading','strobe'].map(m => (
                <button key={m} onClick={() => { setMode(m); if (m === 'night') setBrightness(15); else if (m === 'reading') { setBrightness(80); setColorTemp(4000); } else if (m === 'strobe') setBrightness(100); else setBrightness(75); }} style={{
                  padding: '5px 12px', borderRadius: 18, cursor: 'pointer',
                  border: `1px solid ${mode === m ? ACC : 'rgba(255,224,102,.2)'}`,
                  background: mode === m ? 'rgba(255,224,102,.15)' : 'transparent',
                  color: mode === m ? ACC : 'var(--dim)', font: '11px/1 inherit', transition: 'all .18s',
                }}>{{ normal: '标准', night: '夜灯', reading: '阅读', strobe: '应急' }[m]}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Driver stages */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, marginBottom: 4 }}>
            🔗 LED 台灯电路链路
          </div>
          {DRIVER_STAGES.map((s, i) => (
            <div key={s.name} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'rgba(6,12,28,.7)', borderRadius: 10, border: `1px solid ${s.color}22`, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${s.color}18`, border: `1px solid ${s.color}55`, color: s.color, font: '14px serif', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: s.color, fontSize: 13 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#8aacb8', lineHeight: 1.5, marginTop: 2 }}>{s.desc}</div>
              </div>
              {i < DRIVER_STAGES.length - 1 && <div style={{ width: 1, height: 10, background: `${DRIVER_STAGES[i + 1].color}44`, position: 'absolute', marginLeft: 15, marginTop: 42 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* LED types */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: ACC, marginBottom: 16 }}>💡 常见 LED 灯珠规格对比</h3>
        <div style={{ background: 'rgba(6,12,28,.7)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,224,102,.12)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 60px 80px 100px 1fr', padding: '9px 16px', background: 'rgba(255,224,102,.08)', font: 'bold 11px "Courier New",monospace', color: ACC }}>
            <span>型号</span><span>功率</span><span>光效</span><span>色温</span><span>适用场景</span>
          </div>
          {LED_TYPES.map((l, i) => (
            <div key={l.name} style={{ display: 'grid', gridTemplateColumns: '100px 60px 80px 100px 1fr', padding: '9px 16px', fontSize: 12.5, borderTop: '1px solid rgba(255,255,255,.05)', background: i % 2 === 0 ? 'rgba(255,224,102,.02)' : 'transparent' }}>
              <span style={{ color: ACC, font: '12px "Courier New",monospace' }}>{l.name}</span>
              <span style={{ color: '#8aacb8' }}>{l.w}</span>
              <span style={{ color: '#00e676' }}>{l.lm}</span>
              <span style={{ color: '#8aacb8' }}>{l.temp}</span>
              <span style={{ color: '#8aacb8' }}>{l.use}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dimming methods */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
        {[
          { name: 'PWM 脉冲调光', color: ACC, desc: '通过高频开关（1kHz~20kHz）控制占空比实现调光，LED 颜色温度不随亮度变化，是主流方案', pro: '色温稳定，效率高', con: '低频 PWM 可能引起频闪不适' },
          { name: '恒流调光 CCR', color: '#00bcd4', desc: '直接改变流过 LED 的电流大小来调节亮度，无频闪，但低电流时 LED 色温会偏移', pro: '无频闪，驱动简单', con: '低亮度时色偏，不适合高要求场合' },
          { name: '双色温混合', color: '#9c7dff', desc: '搭载暖白（2700K）和冷白（6500K）两组 LED，通过调节各组电流比例实现色温连续变化', pro: '色温可调，氛围感强', con: '成本较高，驱动更复杂' },
        ].map(d => (
          <div key={d.name} className="glass reveal" style={{ borderColor: d.color + '25' }}>
            <div style={{ fontWeight: 700, color: d.color, fontSize: 14, marginBottom: 8 }}>{d.name}</div>
            <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.65, marginBottom: 8 }}>{d.desc}</div>
            <div style={{ fontSize: 12, color: '#00e676' }}>✓ {d.pro}</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 3 }}>✗ {d.con}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, background: 'rgba(255,224,102,.06)', border: '1px solid rgba(255,224,102,.18)', borderRadius: 12, padding: '14px 20px' }}>
        <div style={{ fontWeight: 700, color: ACC, marginBottom: 8 }}>⚠️ 台灯维修常见问题</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
          {['灯不亮 → 先测驱动电源输出电压，再测 LED 是否断路', '灯一直全亮无法调光 → 驱动 IC 的 PWM 引脚电路故障', '灯频繁闪烁 → 驱动电源输出电容老化，需更换', '灯变暗且色温偏移 → LED 高温热衰减，无法修复需更换灯珠'].map(t => (
            <div key={t} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>
              <span style={{ color: ACC, flexShrink: 0 }}>▸</span>{t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
