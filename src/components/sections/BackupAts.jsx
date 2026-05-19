import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { BACKUP_ACC, QUIZ_ATS } from '../../data/backupData';

const ACC = '#ffab00';

function AtsCanvas({ sourceRef, progressRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 280;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const src = sourceRef.current;
      const prog = progressRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(255,171,0,.3)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      const status = prog < 1 ? `切换中 ${(prog * 100).toFixed(0)}%` : `当前：${src === 'grid' ? '电网' : '柴发'}`;
      ctx.fillText(`ATS 双电源 · ${status} · 互锁防并联`, W / 2, 24);

      const gridCol = src === 'grid' && prog >= 1 ? '#00e676' : 'rgba(0,230,118,.35)';
      const genCol = src === 'gen' && prog >= 1 ? '#ff6b35' : 'rgba(255,107,53,.35)';
      ctx.fillStyle = gridCol;
      ctx.beginPath(); ctx.roundRect(40, 70, 100, 60, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 11px monospace'; ctx.fillText('电网', 90, 105);

      ctx.fillStyle = genCol;
      ctx.beginPath(); ctx.roundRect(40, 160, 100, 60, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.fillText('柴发', 90, 195);

      const swX = 220 + (prog < 1 ? Math.sin(prog * Math.PI) * 30 : 0);
      const swY = prog < 1 ? 130 + prog * 40 : (src === 'grid' ? 100 : 190);
      ctx.fillStyle = '#ffd600'; ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(swX, swY, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.font = '9px monospace'; ctx.fillText('ATS', swX, swY + 4);

      ctx.strokeStyle = gridCol; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(140, 100); ctx.lineTo(swX - 14, swY); ctx.stroke();
      ctx.strokeStyle = genCol;
      ctx.beginPath(); ctx.moveTo(140, 190); ctx.lineTo(swX - 14, swY); ctx.stroke();

      ctx.strokeStyle = '#aab'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(swX + 14, swY); ctx.lineTo(360, 145); ctx.stroke();
      ctx.fillStyle = '#e040fb';
      ctx.beginPath(); ctx.roundRect(360, 110, 90, 70, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.fillText('负载', 405, 150);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [sourceRef, progressRef]);

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

export default function BackupAts() {
  const navigate = useNav();
  const [source, setSource] = useState('grid');
  const [progress, setProgress] = useState(1);
  const sourceRef = useRef(source);
  const progressRef = useRef(progress);
  useEffect(() => { sourceRef.current = source; });
  useEffect(() => { progressRef.current = progress; });

  const switchTo = (target) => {
    if (progress < 1) return;
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 0.05;
      setProgress(p);
      if (p >= 1) {
        clearInterval(iv);
        setProgress(1);
        setSource(target);
      }
    }, 40);
  };

  return (
    <section id="backup-ats" className="sec">
      <div className="sh">
        <span className="sh-icon">🔀</span>
        <div>
          <div className="sh-tag">Backup · 自动切换</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(255,171,0,.35)' }}>ATS 双电源切换</h2>
          <p className="sh-sub">Automatic Transfer Switch：电网与柴发（或第二路电源）互锁，失电后自动或手动切换。切换时间内敏感设备可能重启。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,171,0,.25)', flexDirection: 'column', gap: 12 }}>
          <AtsCanvas sourceRef={sourceRef} progressRef={progressRef} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="chip" onClick={() => switchTo('grid')} disabled={progress < 1}>切至电网</button>
            <button type="button" className="chip" onClick={() => switchTo('gen')} disabled={progress < 1}>切至柴发</button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--dim)', textAlign: 'center' }}>典型切换 0.1–0.5 s（示意动画）</p>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,171,0,.25)' }}>
            <div className="formula" style={{ color: ACC }}>互锁 · 禁止并列</div>
            <div className="fdesc">相序/电压差并联可能短路</div>
          </div>
          <ICard color={ACC} title="⏱️ 切换时间">
            电脑 UPS、冰箱压缩机对掉电敏感；重要负载宜 UPS 或 EPS 应急电源。
          </ICard>
          <ICard color={BACKUP_ACC} title="🔧 手动旁路">
            检修时可强制某一路供电，须按规程操作并挂牌。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('backup-priority')}>→ 供电优先级</button>
            <button type="button" className="chip" onClick={() => navigate('home-ckt')}>→ 家用电路</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_ATS} accentColor={ACC} title="ATS 测验" />
      <RelatedSections sectionId="backup-ats" />
    </section>
  );
}
