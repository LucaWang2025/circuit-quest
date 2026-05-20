import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import { themeCanvasColors } from '../../utils/themeColors';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { COSMOS_ACC, GRAVITY_BODIES, QUIZ_GRAVITY } from '../../data/cosmosData';

const ACC = '#00e676';

function GravityCanvas({ bodyRef, launchRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    let ball = { x: 70, y: 50, vx: 0, vy: 0, flying: false, trail: [] };

    function reset() {
      ball = { x: 70, y: 50, vx: launchRef.current * 0.4, vy: -3, flying: true, trail: [] };
    }

    const onClick = (e) => {
      const rect = cv.getBoundingClientRect();
      if ((e.clientX - rect.left) * (W / rect.width) < 180) reset();
    };
    cv.addEventListener('click', onClick);

    function draw() {
      const body = bodyRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      const wellX = 220, baseY = 210;
      ctx.fillStyle = 'rgba(156,125,255,.1)';
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= W; x++) {
        const d = Math.abs(x - wellX);
        const y = baseY + body.depth * Math.exp(-d * d / 7000);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, baseY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(156,125,255,.25)';
      ctx.setLineDash([4, 6]);
      for (let h = 40; h < 120; h += 25) {
        ctx.beginPath();
        ctx.moveTo(wellX - 80 - h * 0.3, baseY - h);
        ctx.lineTo(wellX + 80 + h * 0.3, baseY - h);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffc850';
      ctx.beginPath();
      ctx.arc(wellX, baseY + body.depth - 10, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = themeCanvasColors().label;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(body.label, wellX, baseY + body.depth + 24);
      ctx.fillText(`v_esc ≈ ${body.escape}`, wellX, baseY + body.depth + 38);

      if (ball.flying) {
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 40) ball.trail.shift();
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.12 * (body.depth / 80);
        const ground = baseY + body.depth * Math.exp(-((ball.x - wellX) ** 2) / 7000) - 8;
        if (ball.y > ground) {
          ball.y = ground;
          ball.vy *= -0.32;
          ball.vx *= 0.94;
          if (Math.abs(ball.vy) < 0.4 && ball.x > W - 60) ball.flying = false;
        }
        if (ball.x > W + 30 || ball.y > H) ball.flying = false;
      }

      ball.trail.forEach((p, i) => {
        ctx.fillStyle = `rgba(156,125,255,${i / ball.trail.length * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = COSMOS_ACC;
      ctx.shadowColor = COSMOS_ACC;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(156,125,255,.2)';
      ctx.beginPath();
      ctx.roundRect(8, 8, W - 16, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('点击左侧发射探测器 · 引力井越深越难逃离', W / 2, 24);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('click', onClick);
    };
  }, [bodyRef, launchRef]);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, display: 'block', cursor: 'pointer' }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function CosmosGravity() {
  const [bodyId, setBodyId] = useState('earth');
  const [launch, setLaunch] = useState(12);
  const body = GRAVITY_BODIES.find(b => b.id === bodyId) || GRAVITY_BODIES[1];
  const bodyRef = useRef(body);
  const launchRef = useRef(launch);
  useEffect(() => { bodyRef.current = body; });
  useEffect(() => { launchRef.current = launch; });

  const canEscape = launch >= parseFloat(body.escape);

  return (
    <section id="cosmos-gravity" className="sec">
      <div className="sh">
        <span className="sh-icon">🕳️</span>
        <div>
          <div className="sh-tag">Cosmos · 引力井</div>
          <h2 className="sh-title" style={{ color: COSMOS_ACC, textShadow: '0 0 35px rgba(156,125,255,.35)' }}>引力井与逃逸速度</h2>
          <p className="sh-sub">引力势阱像「深坑」：越深需要越大速度才能逃出。调节发射速度，理解多级火箭、轨道加速与 Δv 预算——深空任务的「能耗」本质。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${COSMOS_ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(156,125,255,.25)', flexDirection: 'column', gap: 12 }}>
          <GravityCanvas bodyRef={bodyRef} launchRef={launchRef} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {GRAVITY_BODIES.map(b => (
              <button key={b.id} type="button" className="chip" style={{ borderColor: bodyId === b.id ? COSMOS_ACC : undefined }} onClick={() => setBodyId(b.id)}>{b.label}</button>
            ))}
          </div>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            发射速度 {launch} km/s（示意）
            <input type="range" min={2} max={65} value={launch} onChange={e => setLaunch(+e.target.value)} style={{ width: '100%', accentColor: COSMOS_ACC }} />
          </label>
          <p style={{ fontSize: 12, textAlign: 'center', color: canEscape ? ACC : '#ff6b35' }}>
            {canEscape ? '✓ 速度达到逃逸量级（示意）' : '✗ 不足以逃离，将落回势阱'}
          </p>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(156,125,255,.2)' }}>
            <div className="formula" style={{ color: COSMOS_ACC }}>v_esc = √(2GM/r)</div>
            <div className="fdesc">逃逸速度 · 与质量 M、半径 r 相关</div>
          </div>
          <div className="glass">
            <h4 style={{ color: COSMOS_ACC, marginBottom: 8 }}>{body.label}</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75 }}>
              质量 {body.mass} · 逃逸速度 <strong style={{ color: COSMOS_ACC }}>{body.escape}</strong><br />
              {body.note}
            </p>
          </div>
          <ICard color={COSMOS_ACC} title="🚀 多级火箭">
            每级燃料耗尽后抛弃结构，减轻后续加速负担。总 Δv 可叠加，是克服深引力井的常规手段。
          </ICard>
          <ICard color="var(--cyan)" title="🛰️ 轨道 vs 逃逸">
            第一宇宙速度（圆轨道）约为逃逸速度的 1/√2。LEO 约 7.9 km/s 即可维持轨道，不必达到 11.2 km/s。
          </ICard>
          <ICard color="#ff6b35" title="♻️ 引力弹弓">
            借行星引力加速/变轨，可节省燃料。但需要精确轨道计算与通信配合。
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_GRAVITY} accentColor={COSMOS_ACC} title="引力测验" />
      <RelatedSections sectionId="cosmos-gravity" />
    </section>
  );
}
