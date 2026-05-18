import { useState } from 'react';
import { loadPractice, savePractice } from '../../hooks/usePracticeScore';

const ACC = '#7c4dff';
const QUESTS = [
  { id: 1, title: '插座无电', steps: ['验电笔测插座', '查配电箱断路器', '复位或更换插座'], done: false },
  { id: 2, title: '灯不亮', steps: ['换灯泡', '查开关', '测灯座电压'], done: false },
  { id: 3, title: '跳闸', steps: ['拔负载', '复位', '逐插找漏电设备'], done: false },
];

export default function RepairQuest() {
  const [progress, setProgress] = useState(() => loadPractice('repair-quest', { cleared: [] }).cleared);

  const toggle = (id) => {
    const next = progress.includes(id) ? progress.filter(x => x !== id) : [...progress, id];
    setProgress(next);
    savePractice('repair-quest', { cleared: next });
  };

  return (
    <section id="repair-quest" className="sec">
      <Head icon="🏆" title="维修案例闯关" tag="REPAIR QUEST" sub="完成真实场景排查步骤，解锁闯关进度" color={ACC} />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 16, color: ACC, font: 'bold 14px monospace' }}>
          进度 {progress.length}/{QUESTS.length}
        </div>
        {QUESTS.map(q => (
          <div key={q.id} className="glass reveal" style={{ marginBottom: 14, borderColor: progress.includes(q.id) ? 'rgba(0,230,118,.3)' : 'rgba(124,77,255,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, color: '#e0e8ec' }}>关卡 {q.id} · {q.title}</span>
              <button onClick={() => toggle(q.id)} style={{
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${progress.includes(q.id) ? '#00e676' : ACC + '55'}`,
                background: progress.includes(q.id) ? 'rgba(0,230,118,.15)' : ACC + '15',
                color: progress.includes(q.id) ? '#00e676' : ACC, fontSize: 12,
              }}>{progress.includes(q.id) ? '✓ 已完成' : '标记完成'}</button>
            </div>
            {q.steps.map((s, i) => (
              <div key={s} style={{ fontSize: 13, color: '#8aacb8', marginBottom: 4 }}>
                {i + 1}. {s}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Head({ icon, title, tag, sub, color }) {
  return (
    <>
      <div className="sh">
        <span className="sh-icon">{icon}</span>
        <div>
          <div className="sh-tag">{tag}</div>
          <h2 className="sh-title" style={{ color }}>{title}</h2>
          <p className="sh-sub">{sub}</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
    </>
  );
}
