import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { SCOPE_ACC, WAVE_TYPES, QUIZ_WAVE } from '../../data/scopeLabData';

const ACC = '#00e5ff';

function WaveCanvas({ waveRef, freqRef, timebaseRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 280;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    const x0 = 36, x1 = W - 24, midY = H / 2 + 8;

    function sample(phase, type) {
      const tau = phase % 1;
      if (type === 'square') return tau < 0.5 ? 1 : -1;
      if (type === 'triangle') return tau < 0.5 ? 4 * tau - 1 : 3 - 4 * tau;
      return Math.sin(phase * Math.PI * 2);
    }

    function draw() {
      const wave = waveRef.current;
      const freq = freqRef.current;
      const tb = timebaseRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.03;

      ctx.fillStyle = 'rgba(0,229,255,.3)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      const label = WAVE_TYPES.find(w => w.id === wave)?.label || wave;
      ctx.fillText(`${label} · ${freq} Hz · 时基 ${tb} ms/div（示意）`, W / 2, 24);

      for (let i = 0; i <= 10; i++) {
        const px = x0 + (i / 10) * (x1 - x0);
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(0,229,255,.35)' : 'rgba(0,229,255,.1)';
        ctx.beginPath(); ctx.moveTo(px, 40); ctx.lineTo(px, H - 28); ctx.stroke();
      }
      for (let j = 0; j <= 6; j++) {
        const py = 40 + (j / 6) * (H - 68);
        ctx.strokeStyle = j === 3 ? 'rgba(0,229,255,.4)' : 'rgba(0,229,255,.08)';
        ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x1, py); ctx.stroke();
      }

      const cycles = Math.max(1, freq / 50) * (5 / tb);
      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= x1 - x0; x++) {
        const phase = (x / (x1 - x0)) * cycles + t * 0.2;
        const y = midY - sample(phase, wave) * 55;
        x === 0 ? ctx.moveTo(x0 + x, y) : ctx.lineTo(x0 + x, y);
      }
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [waveRef, freqRef, timebaseRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, display: 'block' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function ScopeLabWave() {
  const navigate = useNav();
  const [wave, setWave] = useState('sine');
  const [freq, setFreq] = useState(50);
  const [timebase, setTimebase] = useState(2);
  const waveRef = useRef(wave);
  const freqRef = useRef(freq);
  const timebaseRef = useRef(timebase);
  useEffect(() => { waveRef.current = wave; });
  useEffect(() => { freqRef.current = freq; });
  useEffect(() => { timebaseRef.current = timebase; });

  const current = WAVE_TYPES.find(w => w.id === wave) || WAVE_TYPES[0];

  return (
    <section id="scope-lab-wave" className="sec">
      <div className="sh">
        <span className="sh-icon">📈</span>
        <div>
          <div className="sh-tag">Scope Lab · 波形基础</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(0,229,255,.35)' }}>波形与时基</h2>
          <p className="sh-sub">正弦、方波、三角波在示波器上的典型形态。调节时基让屏幕上显示 1–3 个完整周期——这是读频率的第一步。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,229,255,.25)', flexDirection: 'column', gap: 12 }}>
          <WaveCanvas waveRef={waveRef} freqRef={freqRef} timebaseRef={timebaseRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {WAVE_TYPES.map(w => (
              <button key={w.id} type="button" onClick={() => { setWave(w.id); setFreq(w.f); }} style={{
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                border: `1px solid ${wave === w.id ? ACC : 'rgba(255,255,255,.12)'}`,
                background: wave === w.id ? `${ACC}22` : 'rgba(255,255,255,.04)',
                color: wave === w.id ? ACC : 'rgba(255,255,255,.5)',
              }}>{w.label}</button>
            ))}
          </div>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            频率 f (Hz)
            <input type="range" min={1} max={2000} step={wave === 'sine' ? 1 : 10} value={freq}
              onChange={e => setFreq(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
            <span style={{ color: ACC }}> {freq} Hz · T ≈ {(1000 / freq).toFixed(2)} ms</span>
          </label>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            时基 ms/div
            <input type="range" min={0.5} max={10} step={0.5} value={timebase}
              onChange={e => setTimebase(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
          </label>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,229,255,.25)' }}>
            <div className="formula" style={{ color: ACC }}>T = 1/f</div>
            <div className="fdesc">周期 · 时基决定每格时间</div>
          </div>
          <div className="glass" style={{ borderColor: `${ACC}44` }}>
            <h4 style={{ color: ACC, marginBottom: 8 }}>{current.label} · 默认 {current.f} Hz</h4>
            <p style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.75 }}>
              {wave === 'sine' && '市电 50 Hz 正弦、音频与传感器交流信号最常见。'}
              {wave === 'square' && '数字逻辑、PWM、开关电源驱动——注意上升沿与振铃。'}
              {wave === 'triangle' && '积分器输出、部分扫描波形；斜率恒定。'}
            </p>
          </div>
          <ICard color={ACC} title="📐 时基选择">
            屏幕上约 <strong style={{ color: ACC }}>2 个周期</strong> 最易读数：数水平格数 × ms/div = T。
          </ICard>
          <ICard color="#00e676" title="〰️ AC / DC 耦合">
            AC 耦合隔直看交流分量；DC 耦合保留直流偏置（如 3.3 V 上的纹波）。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('ac-dc')}>→ 交直流</button>
            <button type="button" className="chip" onClick={() => navigate('scope-lab-measure')}>→ 周期与幅值</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_WAVE} accentColor={ACC} title="波形基础测验" />
      <RelatedSections sectionId="scope-lab-wave" />
    </section>
  );
}
