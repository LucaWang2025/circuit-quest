import { useState } from 'react';
import Quiz from '../Quiz';
import RelatedSections from '../RelatedSections';
import { useNav } from '../../NavContext';
import { BACKUP_ACC, QUIZ_EMERGENCY } from '../../data/backupData';

const ACC = '#ef5350';

const CHECKLIST = [
  { id: 'confirm', icon: '🔍', title: '确认停电范围', desc: '看电表、邻居、物业/电网 App，区分户内故障与区域停电。', done: false },
  { id: 'safe', icon: '🛡️', title: '检查异味与发热', desc: '焦味、异响、插座发烫 → 断开相关回路，勿盲目合闸。', done: false },
  { id: 'light', icon: '🔦', title: '启用应急照明', desc: '固定位置手电/应急灯；避免明火，注意楼梯安全。', done: false },
  { id: 'fridge', icon: '🧊', title: '冰箱少开门', desc: '满电冰箱约保温 4h；停电期间尽量减少开门。', done: false },
  { id: 'gen', icon: '⛽', title: '柴发/户外机', desc: '室外通风，排气管远离门窗；严禁室内使用。', done: false },
  { id: 'comm', icon: '📱', title: '保持通信', desc: '手机省电模式；路由若有 UPS 可短时联网报平安。', done: false },
  { id: 'restore', icon: '✅', title: '复电后检查', desc: '先小负载再逐步投入；观察跳闸与逆变器状态。', done: false },
];

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function BackupEmergency() {
  const navigate = useNav();
  const [checked, setChecked] = useState(() => Object.fromEntries(CHECKLIST.map(c => [c.id, false])));

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <section id="backup-emergency" className="sec">
      <div className="sh">
        <span className="sh-icon">📋</span>
        <div>
          <div className="sh-tag">Backup · 应急清单</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: '0 0 35px rgba(239,83,80,.35)' }}>家庭停电处置步骤</h2>
          <p className="sh-sub">按顺序勾选完成项，建立停电时的肌肉记忆。与「安全用电」「跳闸排查」章节配合使用。</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />

      <div className="glass reveal" style={{ maxWidth: 900, margin: '0 auto 24px', padding: 16, borderColor: `${ACC}44` }}>
        <p style={{ fontSize: 14, color: '#aabfc8', textAlign: 'center' }}>
          进度：<strong style={{ color: ACC }}>{doneCount} / {CHECKLIST.length}</strong>
          {doneCount === CHECKLIST.length && <span style={{ color: '#00e676' }}> · 清单完成 ✓</span>}
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16, maxWidth: 1100, margin: '0 auto 28px',
      }}>
        {CHECKLIST.map(item => (
          <div key={item.id} role="button" tabIndex={0} onClick={() => toggle(item.id)}
            onKeyDown={e => { if (e.key === 'Enter') toggle(item.id); }}
            className="glass reveal icard" style={{
              cursor: 'pointer',
              borderColor: checked[item.id] ? 'rgba(0,230,118,.5)' : `${ACC}33`,
              opacity: checked[item.id] ? 0.85 : 1,
            }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, textDecoration: checked[item.id] ? 'line-through' : 'none' }}>
                  {item.title}
                </div>
                <p style={{ fontSize: 13, color: '#aabfc8', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
              <span style={{ fontSize: 18, color: checked[item.id] ? '#00e676' : 'var(--dim)' }}>
                {checked[item.id] ? '✓' : '○'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid2" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <ICard color={ACC} title="⚡ 触电急救">
          先<strong>切断电源</strong>，再用绝缘物移开带电体；必要时 CPR，同时拨打 120。
        </ICard>
        <ICard color={BACKUP_ACC} title="🔗 延伸阅读">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" className="chip" onClick={() => navigate('safety')}>→ 安全用电</button>
            <button type="button" className="chip" onClick={() => navigate('breaker-fix')}>→ 跳闸排查</button>
          </div>
        </ICard>
      </div>

      <Quiz questions={QUIZ_EMERGENCY} accentColor={ACC} title="应急清单测验" />
      <RelatedSections sectionId="backup-emergency" />
    </section>
  );
}
