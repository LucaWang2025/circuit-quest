import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '#ff6b35';
const STEPS = [
  { n: 1, t: '断电验电', d: '拔插头/关断路器，验电笔确认无电', ok: true },
  { n: 2, t: '拍照记录', d: '拆前拍接线、螺丝位置，便于装回', ok: true },
  { n: 3, t: '防静电', d: '触摸金属接地，戴防静电手环（修板必做）', ok: true },
  { n: 4, t: '分类收纳', d: '螺丝分格盒、小件贴标签，忌混放', ok: true },
  { n: 5, t: '放高压电', d: '开关电源大电容断电 5 分钟再测', ok: false },
  { n: 6, t: '专用工具', d: '塑料撬棒、三角批头，忌暴力撬壳', ok: true },
  { n: 7, t: '先外后内', d: '外壳→主板→模块，逐层排查', ok: true },
  { n: 8, t: '不强行通电', d: '外壳未装回禁止试机，防触电短路', ok: false },
  { n: 9, t: '记录测试点', d: '万用表测关键电压，对照电路图', ok: true },
  { n: 10, t: '装回复检', d: '螺丝拧紧、无多余线，通电观察', ok: true },
];

function TeardownCanvas({ stepRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 280;
    const ctx = setupHiDpi(cv, W, H);
    let raf;

    function draw() {
      const step = stepRef.current;
      const s = STEPS[step] || STEPS[0];
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255,107,53,.4)';
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`第 ${s.n} 步 · ${s.t}`, W / 2, 27);

      const cx = W / 2, cy = 150;
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = s.ok ? 'rgba(0,230,118,.15)' : 'rgba(255,23,68,.15)';
      ctx.fill();

      ctx.font = '48px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.ok ? '✓' : '⚠', cx, cy + 16);

      ctx.fillStyle = '#dde8ee'; ctx.font = '12px monospace';
      const words = s.d.split('');
      let line = '', ly = cy + 95;
      words.forEach(ch => {
        if ((line + ch).length > 22) { ctx.fillText(line, cx, ly); line = ch; ly += 18; }
        else line += ch;
      });
      if (line) ctx.fillText(line, cx, ly);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [stepRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

export default function Teardown() {
  const [step, setStep] = useState(0);
  const stepRef = useRef(step);
  useEffect(() => { stepRef.current = step; });

  return (
    <section id="teardown" className="sec">
      <SecHead icon="🔧" title="拆机十诫" tag="TEARDOWN · 安全拆修" sub="防静电、放高压、拍照记录——避免拆坏修不好" color={ACC} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,.2)', flexDirection: 'column', gap: 12 }}>
          <TeardownCanvas stepRef={stepRef} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button disabled={step <= 0} onClick={() => setStep(s => s - 1)} style={navBtn()}>← 上一步</button>
            <button disabled={step >= STEPS.length - 1} onClick={() => setStep(s => s + 1)} style={navBtn(true)}>下一步 →</button>
          </div>
        </div>
        <div className="info-stack reveal" style={{ maxHeight: 400, overflowY: 'auto' }}>
          {STEPS.map((s, i) => (
            <button key={s.n} onClick={() => setStep(i)} style={{
              display: 'block', width: '100%', textAlign: 'left', marginBottom: 8, padding: '10px 12px',
              borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${step === i ? ACC : 'rgba(255,255,255,.08)'}`,
              background: step === i ? ACC + '18' : 'rgba(255,255,255,.02)',
            }}>
              <span style={{ color: ACC, fontWeight: 700 }}>{s.n}. </span>
              <span style={{ color: step === i ? '#fff' : '#889' }}>{s.t}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function navBtn(primary) {
  const c = '#ff6b35';
  return {
    padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
    border: `1px solid ${primary ? c : 'rgba(255,255,255,.12)'}`,
    background: primary ? c + '22' : 'rgba(255,255,255,.04)',
    color: primary ? c : 'var(--dim)', fontWeight: 600,
  };
}

function SecHead({ icon, title, tag, sub, color }) {
  return (
    <>
      <div className="sh">
        <span className="sh-icon">{icon}</span>
        <div>
          <div className="sh-tag">{tag}</div>
          <h2 className="sh-title" style={{ color, textShadow: `0 0 35px ${color}55` }}>{title}</h2>
          <p className="sh-sub">{sub}</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
    </>
  );
}
