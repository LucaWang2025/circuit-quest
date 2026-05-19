import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import { useNav } from '../../NavContext';
import RelatedSections from '../RelatedSections';
import {
  BACKUP_ACC, HUB_LINKS, BACKUP_LEARNING_PATH, QUIZ_HUB,
} from '../../data/backupData';

function HubCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 200;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;
      const gridOn = Math.sin(t * 2) > -0.3;

      ctx.fillStyle = 'rgba(255,112,67,.3)';
      ctx.beginPath(); ctx.roundRect(10, 10, W - 20, 22, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(gridOn ? '电网供电 · 户储待机' : '电网失电 · 储能/柴发接管（示意）', W / 2, 24);

      ctx.fillStyle = gridOn ? '#00e676' : '#ef5350';
      ctx.beginPath(); ctx.roundRect(40, 70, 90, 50, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 10px monospace'; ctx.fillText('电网', 85, 100);

      ctx.strokeStyle = gridOn ? '#00e676' : 'rgba(255,255,255,.2)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(130, 95); ctx.lineTo(200, 95); ctx.stroke();

      ctx.fillStyle = '#69f0ae';
      ctx.beginPath(); ctx.roundRect(200, 60, 80, 70, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.fillText('户储', 240, 98);

      ctx.beginPath(); ctx.moveTo(280, 95); ctx.lineTo(340, 95); ctx.stroke();

      const loads = ['照明', '冰箱', '路由'];
      loads.forEach((lb, i) => {
        const on = gridOn || i === 0;
        ctx.fillStyle = on ? '#ffab00' : '#444';
        ctx.beginPath(); ctx.roundRect(340, 55 + i * 42, 70, 32, 6); ctx.fill();
        ctx.fillStyle = on ? '#111' : '#888';
        ctx.font = '9px monospace'; ctx.fillText(lb, 375, 75 + i * 42);
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, display: 'block', marginBottom: 8 }} />;
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function Backup() {
  const navigate = useNav();

  return (
    <section id="backup" className="sec">
      <div className="sh">
        <span className="sh-icon">🔋</span>
        <div>
          <div className="sh-tag">Backup · 应急与户储 · 入口</div>
          <h2 className="sh-title" style={{ color: BACKUP_ACC, textShadow: '0 0 35px rgba(255,112,67,.35)' }}>
            应急与户储
          </h2>
          <p className="sh-sub">
            停电场景、ATS 自动切换、光伏→储能→柴发供电优先级，以及家庭应急清单——把户用备电从概念变成可操作的步骤与安全意识。
          </p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${BACKUP_ACC},transparent)` }} />

      <div className="grid2" style={{ marginBottom: 36 }}>
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,112,67,.25)', flexDirection: 'column' }}>
          <HubCanvas />
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center', lineHeight: 1.6 }}>
            并网需防孤岛；柴发与电网必须互锁，严禁随意并联。
          </p>
        </div>
        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,112,67,.2)' }}>
            <div className="formula" style={{ color: BACKUP_ACC }}>光伏 → 储能 → 柴发 → 电网</div>
            <div className="fdesc">优先级与峰谷策略 · SOC 管理</div>
          </div>
          <ICard color={BACKUP_ACC} title="📚 专题结构">
            <strong style={{ color: 'var(--white)' }}>4 个互动章节</strong>：停电场景、ATS 切换、供电优先级、应急清单。
          </ICard>
          <ICard color="#00e676" title="🛡️ 安全第一">
            闻到焦味先断电；触电先断电源再施救；备用手电固定易取。
          </ICard>
        </div>
      </div>

      <div className="glass reveal" style={{ maxWidth: 1100, margin: '0 auto 28px', padding: '20px 24px', borderColor: 'rgba(255,112,67,.3)' }}>
        <h4 style={{ color: BACKUP_ACC, marginBottom: 14, font: '11px "Courier New",monospace', letterSpacing: 2 }}>推荐学习路径</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          {BACKUP_LEARNING_PATH.map((step, i) => (
            <span key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" className="chip" onClick={() => navigate(step.id)} style={{ borderColor: BACKUP_ACC }}>
                {step.icon} {step.label}
              </button>
              {i < BACKUP_LEARNING_PATH.length - 1 && <span style={{ color: 'var(--dim)' }}>→</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 18, maxWidth: 1100, margin: '0 auto 32px',
      }}>
        {HUB_LINKS.map(link => (
          <div key={link.id} className="glass reveal icard" role="button" tabIndex={0}
            onClick={() => navigate(link.id)} onKeyDown={e => { if (e.key === 'Enter') navigate(link.id); }}
            style={{ cursor: 'pointer', borderColor: `${link.color}44` }}>
            <span style={{ fontSize: 28 }}>{link.icon}</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '8px 0 2px' }}>{link.title}</div>
            <div style={{ font: '10px monospace', color: link.color, letterSpacing: 2, marginBottom: 8 }}>{link.en}</div>
            <p style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.6 }}>{link.desc}</p>
            <div style={{ marginTop: 12, font: '11px monospace', color: 'var(--cyan)' }}>进入章节 →</div>
          </div>
        ))}
      </div>

      <Quiz questions={QUIZ_HUB} accentColor={BACKUP_ACC} title="应急户储测验" />
      <RelatedSections sectionId="backup" />
    </section>
  );
}
