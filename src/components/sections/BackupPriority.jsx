import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { BACKUP_ACC, POWER_SOURCES, QUIZ_PRIORITY } from '../../data/backupData';

const ACC = '#00e676';

function PriorityCanvas({ activeRef, hourRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 300;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const active = activeRef.current;
      const hour = hourRef.current;
      const solarOn = hour >= 6 && hour < 18;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(0,230,118,.25)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`供电优先级 · ${hour}:00 · 当前主源：${POWER_SOURCES.find(p => p.id === active)?.label || active}`, W / 2, 24);

      const order = ['solar', 'bess', 'grid', 'gen'];
      order.forEach((id, i) => {
        const src = POWER_SOURCES.find(p => p.id === id);
        const y = 55 + i * 58;
        const isActive = active === id;
        const avail = id !== 'solar' || solarOn;
        ctx.fillStyle = isActive && avail ? `${src.color}55` : 'rgba(255,255,255,.05)';
        ctx.strokeStyle = isActive ? src.color : 'rgba(255,255,255,.15)';
        ctx.lineWidth = isActive ? 2.5 : 1;
        ctx.beginPath(); ctx.roundRect(50, y, W - 100, 48, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = avail ? src.color : '#555';
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
        ctx.fillText(`${i + 1}. ${src.label}`, 65, y + 30);
        if (id === 'solar' && !solarOn) {
          ctx.fillStyle = '#888'; ctx.font = '9px monospace'; ctx.fillText('夜间无发电', 200, y + 30);
        }
        if (isActive && avail) {
          ctx.fillStyle = src.color;
          const pulse = 4 + Math.sin(t * 5) * 2;
          ctx.beginPath(); ctx.arc(W - 70, y + 24, pulse, 0, Math.PI * 2); ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [activeRef, hourRef]);

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

export default function BackupPriority() {
  const navigate = useNav();
  const [hour, setHour] = useState(12);
  const [active, setActive] = useState('solar');
  const activeRef = useRef(active);
  const hourRef = useRef(hour);
  useEffect(() => { activeRef.current = active; });
  useEffect(() => { hourRef.current = hour; });

  useEffect(() => {
    if (hour >= 6 && hour < 18) setActive('solar');
    else setActive('bess');
  }, [hour]);

  return (
    <section id="backup-priority" className="sec">
      <div className="sh">
        <span className="sh-icon">☀️</span>
        <div>
          <div className="sh-tag">Backup · 供电优先级</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(0,230,118,.35)' }}>光伏 → 储能 → 电网 → 柴发</h2>
          <p className="sh-sub">自用自发优先光伏；夜间与阴雨天由户储放电；SOC 不足可购电或启动柴发。峰谷电价下储能削峰填谷。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,230,118,.25)', flexDirection: 'column', gap: 12 }}>
          <PriorityCanvas activeRef={activeRef} hourRef={hourRef} />
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            时刻（模拟昼夜）
            <input type="range" min={0} max={23} value={hour} onChange={e => setHour(+e.target.value)} style={{ width: '100%', accentColor: ACC }} />
            <span style={{ color: ACC }}> {hour}:00</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {POWER_SOURCES.map(s => (
              <button key={s.id} type="button" className="chip" style={{ borderColor: active === s.id ? s.color : undefined }} onClick={() => setActive(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(0,230,118,.25)' }}>
            <div className="formula" style={{ color: ACC }}>自用自发 · 峰放谷充</div>
            <div className="fdesc">V2G / EPS 等特殊场景另论</div>
          </div>
          {POWER_SOURCES.map(s => (
            <ICard key={s.id} color={s.color} title={s.label}>
              优先级 {s.priority} · {s.id === 'solar' && '日间优先消纳，余电可上网或充电池。'}
              {s.id === 'bess' && '平抑波动、夜间供电、峰时放电。'}
              {s.id === 'grid' && '补充或售电回购，需防孤岛与电表计量。'}
              {s.id === 'gen' && '长时停电或离网备用，注意通风与一氧化碳。'}
            </ICard>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('energy-storage')}>→ 储能系统</button>
            <button type="button" className="chip" onClick={() => navigate('cosmos-energy')}>→ 能源链</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_PRIORITY} accentColor={ACC} title="供电优先级测验" />
      <RelatedSections sectionId="backup-priority" />
    </section>
  );
}
