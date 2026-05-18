import { useEffect, useMemo, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ffab00';

function TriangleCanvas({ highlightRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 200;
    const ctx = setupHiDpi(cv, W, H);
    let raf;

    function draw() {
      const h = highlightRef.current;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, top = 35, bot = 155, left = cx - 110, right = cx + 110;

      ctx.fillStyle = 'rgba(255,171,0,.12)';
      ctx.beginPath();
      ctx.moveTo(cx, top); ctx.lineTo(left, bot); ctx.lineTo(right, bot); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2;
      ctx.stroke();

      const labels = [
        { key: 'V', text: 'V 电压', x: cx, y: top + 28, col: '#ffab00' },
        { key: 'I', text: 'I 电流', x: left + 35, y: bot - 18, col: '#00bcd4' },
        { key: 'R', text: 'R 电阻', x: right - 35, y: bot - 18, col: '#ff6b35' },
      ];
      labels.forEach(({ key, text, x, y, col }) => {
        const on = h === key || h === 'all';
        ctx.fillStyle = on ? col : 'rgba(255,255,255,.35)';
        ctx.font = `bold ${on ? 16 : 13}px monospace`;
        ctx.textAlign = 'center';
        if (on) { ctx.shadowColor = col; ctx.shadowBlur = 12; }
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;
      });

      if (h === 'V') {
        ctx.strokeStyle = 'rgba(255,171,0,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, top + 5); ctx.lineTo(cx, bot - 5); ctx.stroke();
      }
      if (h === 'I') {
        ctx.strokeStyle = 'rgba(0,188,212,.5)';
        ctx.beginPath(); ctx.moveTo(left + 20, bot - 25); ctx.lineTo(right - 20, bot - 25); ctx.stroke();
      }
      if (h === 'R') {
        ctx.strokeStyle = 'rgba(255,107,53,.5)';
        ctx.beginPath(); ctx.moveTo(cx, bot - 5); ctx.lineTo(right - 15, top + 40); ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [highlightRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

export default function OhmsLaw() {
  const [v, setV] = useState('');
  const [i, setI] = useState('0.1');
  const [r, setR] = useState('');
  const [highlight, setHighlight] = useState('all');
  const highlightRef = useRef(highlight);
  useEffect(() => { highlightRef.current = highlight; });

  const vNum = v === '' ? null : parseFloat(v);
  const iNum = i === '' ? null : parseFloat(i);
  const rNum = r === '' ? null : parseFloat(r);
  const filled = [vNum, iNum, rNum].filter(x => x !== null && !isNaN(x)).length;

  const result = useMemo(() => {
    if (filled !== 2) return null;
    if (vNum == null && iNum != null && rNum != null)
      return { target: 'V', value: iNum * rNum, formula: 'V = I × R', display: (iNum * rNum).toFixed(3) };
    if (iNum == null && vNum != null && rNum != null && rNum !== 0)
      return { target: 'I', value: vNum / rNum, formula: 'I = V / R', display: (vNum / rNum).toFixed(4) };
    if (rNum == null && vNum != null && iNum != null && iNum !== 0)
      return { target: 'R', value: vNum / iNum, formula: 'R = V / I', display: (vNum / iNum).toFixed(2) };
    return null;
  }, [vNum, iNum, rNum, filled]);

  const inp = (label, val, set, unit, key) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 4 }}>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="number" value={val} placeholder="留空自动计算" step="any"
          onChange={e => { set(e.target.value); setHighlight(key); }}
          onFocus={() => setHighlight(key)}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)',
            background: 'rgba(0,0,0,.3)', color: '#fff', font: '14px monospace' }} />
        <span style={{ color: ACC, font: '12px monospace', minWidth: 24 }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <section id="ohms-law" className="sec">
      <div className="sh">
        <span className="sh-icon">📐</span>
        <div>
          <div className="sh-tag">OHM'S LAW · 欧姆定律计算器</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(255,171,0,.38)' }}>欧姆定律计算器</h2>
          <p className="sh-sub">输入任意两个量，自动计算第三个——维修现场最常用公式</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,171,0,.2)', flexDirection: 'column', gap: 14 }}>
          <TriangleCanvas highlightRef={highlightRef} />
          <div style={{ width: '100%', maxWidth: 360, padding: '0 8px' }}>
            {inp('电压 V', v, setV, 'V', 'V')}
            {inp('电流 I', i, setI, 'A', 'I')}
            {inp('电阻 R', r, setR, 'Ω', 'R')}
            <button onClick={() => { setV(''); setI(''); setR(''); setHighlight('all'); }}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,.12)',
                background: 'rgba(255,255,255,.04)', color: 'var(--dim)', cursor: 'pointer', marginTop: 4 }}>
              清空重算
            </button>
          </div>
          {result && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,171,0,.12)',
              border: '1px solid rgba(255,171,0,.35)', textAlign: 'center' }}>
              <div style={{ font: 'bold 18px monospace', color: ACC }}>
                {result.target} = {result.display}
                {result.target === 'V' ? ' V' : result.target === 'I' ? ' A' : ' Ω'}
              </div>
              <div style={{ fontSize: 12, color: '#8aacb8', marginTop: 4 }}>{result.formula}</div>
            </div>
          )}
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,171,0,.14)' }}>
            <div className="formula" style={{ color: ACC }}>V = I × R</div>
            <div className="fdesc">P = V × I = I²R = V²/R</div>
          </div>
          <div className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>使用技巧</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>
              ① 只填两个空，第三个自动算出<br />
              ② mA 换算：100mA = 0.1A<br />
              ③ kΩ 换算：2.2kΩ = 2200Ω
            </div>
          </div>
          <div className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>维修实例</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>
              LED 限流：V=3.3V，I=20mA → R=165Ω，选 220Ω 标准值。<br />
              插座负载：P=2200W → I=10A，需 16A 断路器。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
