import { useEffect, useRef, useState } from 'react';
import { setupHiDpi } from '../../utils/canvas';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { BACKUP_ACC, QUIZ_OUTAGE } from '../../data/backupData';

const ACC = '#ff7043';

const LOADS = [
  { id: 'light', label: '应急照明', tier: 1, w: 20 },
  { id: 'router', label: '路由/通信', tier: 1, w: 15 },
  { id: 'fridge', label: '冰箱', tier: 2, w: 150 },
  { id: 'ac', label: '空调', tier: 3, w: 1500 },
];

function OutageCanvas({ gridRef, bessRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const W = 480, H = 280;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;

    function draw() {
      const grid = gridRef.current;
      const soc = bessRef.current;
      ctx.clearRect(0, 0, W, H);
      t += 0.02;

      ctx.fillStyle = 'rgba(255,112,67,.3)';
      ctx.beginPath(); ctx.roundRect(8, 8, W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = '#c8dce6'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(grid ? '电网正常 · 全额供电' : `电网失电 · 户储 SOC ${soc}% · 负载分级`, W / 2, 24);

      ctx.fillStyle = grid ? '#00e676' : '#ef5350';
      ctx.beginPath(); ctx.roundRect(30, 55, 100, 55, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 11px monospace'; ctx.fillText('电网', 80, 88);

      ctx.fillStyle = '#69f0ae';
      ctx.beginPath(); ctx.roundRect(160, 50, 90, 65, 8); ctx.fill();
      ctx.fillStyle = '#111'; ctx.fillText('户储', 205, 82);
      ctx.fillStyle = '#0a2a1a'; ctx.fillRect(170, 95, 70 * (soc / 100), 8);

      LOADS.forEach((ld, i) => {
        const x = 280 + (i % 2) * 95;
        const y = 55 + Math.floor(i / 2) * 75;
        const allowed = grid || (soc > 15 && ld.tier <= 2) || (soc > 40 && ld.tier === 1);
        ctx.fillStyle = allowed ? (ld.tier === 1 ? '#ffab00' : ld.tier === 2 ? '#ffd600' : '#666') : '#333';
        ctx.beginPath(); ctx.roundRect(x, y, 85, 50, 6); ctx.fill();
        ctx.fillStyle = allowed ? '#111' : '#666';
        ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(ld.label, x + 42, y + 22);
        ctx.fillText(`${ld.w}W`, x + 42, y + 38);
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, [gridRef, bessRef]);

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

export default function BackupOutage() {
  const navigate = useNav();
  const [gridOn, setGridOn] = useState(true);
  const [soc, setSoc] = useState(80);
  const gridRef = useRef(gridOn);
  const bessRef = useRef(soc);
  useEffect(() => { gridRef.current = gridOn; });
  useEffect(() => { bessRef.current = soc; });

  const totalW = LOADS.filter(ld => gridOn || (soc > 15 && ld.tier <= 2) || (soc > 40 && ld.tier === 1))
    .reduce((s, ld) => s + ld.w, 0);

  return (
    <section id="backup-outage" className="sec">
      <div className="sh">
        <span className="sh-icon">🔌</span>
        <div>
          <div className="sh-tag">Backup · 停电场景</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(255,112,67,.35)' }}>电网失电与负载分级</h2>
          <p className="sh-sub">区域停电时确认电表与邻居；户储按 SOC 与优先级供电。一级：照明与通信；二级：冰箱；三级：空调等大负载需充足电量。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,112,67,.25)', flexDirection: 'column', gap: 12 }}>
          <OutageCanvas gridRef={gridRef} bessRef={bessRef} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button type="button" className="chip" style={{ borderColor: gridOn ? '#00e676' : '#ef5350' }} onClick={() => setGridOn(g => !g)}>
              {gridOn ? '模拟停电' : '恢复电网'}
            </button>
          </div>
          <label style={{ width: '100%', fontSize: 12, color: 'var(--dim)' }}>
            户储 SOC (%)
            <input type="range" min={5} max={100} value={soc} onChange={e => setSoc(+e.target.value)} style={{ width: '100%', accentColor: ACC }} disabled={gridOn} />
          </label>
        </div>

        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,112,67,.25)' }}>
            <div className="formula" style={{ color: ACC }}>P = U × I · 续航 ∝ 电池 Wh / 负载 W</div>
            <div className="fdesc">当前允许负载合计约 <strong style={{ color: ACC }}>{totalW} W</strong></div>
          </div>
          <ICard color={ACC} title="🔌 孤岛模式">
            并网逆变器检测到电网断电应<strong>停机脱网</strong>，防止向停电线路倒送电（防孤岛）。
          </ICard>
          <ICard color="#69f0ae" title="📉 SOC 过低">
            SOC &lt; 20% 宜限制非必要负载，保护电池循环寿命。
          </ICard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('backup-ats')}>→ 自动切换</button>
            <button type="button" className="chip" onClick={() => navigate('solar')}>→ 家用光伏</button>
          </div>
        </div>
      </div>

      <Quiz questions={QUIZ_OUTAGE} accentColor={ACC} title="停电场景测验" />
      <RelatedSections sectionId="backup-outage" />
    </section>
  );
}
