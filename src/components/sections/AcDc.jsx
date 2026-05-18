import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#00bcd4';

function WaveCanvas({ modeRef, freqRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const isAC = modeRef.current === 'ac';
      const freq = freqRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.025;

      const modeLabel = isAC ? `交流 AC · ${freq} Hz` : '直流 DC · 方向不变';
      ctx.fillStyle = isAC ? 'rgba(0,188,212,.45)' : 'rgba(255,171,0,.40)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px "Courier New",monospace'; ctx.textAlign = 'center';
      ctx.fillText(modeLabel, W / 2, 27);

      const gx = 50, gy = 55, gw = W - 100, gh = 130;
      ctx.fillStyle = 'rgba(255,255,255,.03)';
      ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 8); ctx.fill(); ctx.stroke();

      const midY = gy + gh / 2;
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(gx, midY); ctx.lineTo(gx + gw, midY); ctx.stroke();
      ctx.setLineDash([]);

      ctx.lineWidth = 2.5; ctx.beginPath();
      if (isAC) {
        const cycles = Math.max(1, Math.min(6, freq / 10));
        for (let x = 0; x <= gw; x += 2) {
          const phase = (x / gw) * Math.PI * 2 * cycles + t * freq * 0.08;
          const y = midY - Math.sin(phase) * (gh * 0.38);
          x === 0 ? ctx.moveTo(gx + x, y) : ctx.lineTo(gx + x, y);
        }
        ctx.strokeStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 8;
        ctx.stroke(); ctx.shadowBlur = 0;
        const peak = gh * 0.38;
        ctx.strokeStyle = 'rgba(255,171,0,.8)'; ctx.setLineDash([3, 3]);
        const rmsY = midY - peak * 0.707;
        ctx.beginPath(); ctx.moveTo(gx, rmsY); ctx.lineTo(gx + gw, rmsY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffab00'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
        ctx.fillText('Vrms ≈ 0.707×Vp', gx + 8, rmsY - 6);
      } else {
        const dcY = midY - gh * 0.25;
        ctx.moveTo(gx, dcY); ctx.lineTo(gx + gw, dcY);
        ctx.strokeStyle = '#ffab00'; ctx.shadowColor = '#ffab00'; ctx.shadowBlur = 6;
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      ctx.textAlign = 'center'; ctx.font = 'bold 11px monospace';
      ctx.fillStyle = isAC ? `rgba(0,188,212,${0.75})` : 'rgba(255,171,0,.65)';
      ctx.fillText(
        isAC ? '↔ 电流周期性反转 · 220Vrms / 50Hz' : '→ 电流单向 · 电池/USB/充电宝',
        W / 2, H - 12
      );

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [modeRef, freqRef]);

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

export default function AcDc() {
  const [mode, setMode] = useState('ac');
  const [freq, setFreq] = useState(50);
  const modeRef = useRef(mode);
  const freqRef = useRef(freq);
  useEffect(() => { modeRef.current = mode; freqRef.current = freq; });

  const btn = (active, col) => ({
    padding: '9px 20px', borderRadius: 10, cursor: 'pointer',
    border: `1px solid ${active ? col : 'rgba(255,255,255,.12)'}`,
    background: active ? col + '22' : 'rgba(255,255,255,.04)',
    color: active ? col : 'rgba(255,255,255,.5)', font: '13px/1 inherit', fontWeight: 600,
  });

  return (
    <section id="ac-dc" className="sec">
      <div className="sh">
        <span className="sh-icon">〰️</span>
        <div>
          <div className="sh-tag">AC / DC · 波形 · 有效值 · 频率</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(0,188,212,.38)' }}>交流 vs 直流</h2>
          <p className="sh-sub">理解家用 220V 交流电与电池直流电的本质区别</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', flexDirection: 'column', gap: 14 }}>
          <WaveCanvas modeRef={modeRef} freqRef={freqRef} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={btn(mode === 'ac', ACC)} onClick={() => setMode('ac')}>〰️ 交流 AC</button>
            <button style={btn(mode === 'dc', '#ffab00')} onClick={() => setMode('dc')}>━ 直流 DC</button>
          </div>
          {mode === 'ac' && (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 6 }}>频率 {freq} Hz</div>
              <input type="range" min={10} max={100} value={freq} onChange={e => setFreq(+e.target.value)}
                style={{ width: '100%', accentColor: ACC, cursor: 'pointer' }} />
            </div>
          )}
        </div>

        <div className="info-stack reveal">
          <ICard color={ACC} title="什么是交流电 AC？">
            电流方向和大小周期性变化。家用 220V 是有效值，峰值约 311V。中国频率 50Hz。
          </ICard>
          <ICard color={ACC} title="什么是直流电 DC？">
            电流方向始终不变。电池、USB、充电宝、电动车电池包均为直流。
          </ICard>
          <ICard color={ACC} title="有效值 vs 峰值">
            Vrms = Vp / √2 ≈ 0.707 × Vp。万用表交流档测的是有效值。
          </ICard>
          <ICard color={ACC} title="生活中的对应">
            <div className="chips">
              {['家用插座 220V AC', '汽车电瓶 12V DC', '手机 3.7V DC', 'USB 5V DC'].map(t => (
                <span key={t} className="chip" style={{ color: ACC }}>{t}</span>
              ))}
            </div>
          </ICard>
        </div>
      </div>
    </section>
  );
}
