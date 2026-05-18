import { ALL_SECS } from '../secs';

const DONE = ALL_SECS.filter(s => s.id !== 'home').map(s => ({
  id: s.id,
  icon: s.icon,
  label: s.label,
}));

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      textAlign: 'center', padding: '64px 24px 80px',
      color: 'var(--dim)', fontSize: 13,
      borderTop: '1px solid rgba(0,229,255,.07)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ font: '11px "Courier New",monospace', color: 'rgba(96,122,144,.55)', letterSpacing: 3, marginBottom: 18 }}>
          ✅ 已完成章节 ({DONE.length})
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
          {DONE.map(d => (
            <button key={d.id} onClick={() => onNavigate && onNavigate(d.id)} style={{
              padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
              border: '1px solid rgba(0,229,255,.22)',
              background: 'rgba(0,229,255,.06)',
              font: '12px "Courier New",monospace', color: '#607a90',
              transition: 'all .22s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,.5)'; e.currentTarget.style.color = 'var(--blue)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,.22)'; e.currentTarget.style.color = '#607a90'; }}
            >{d.icon} {d.label}</button>
          ))}
        </div>

        <p style={{ color: 'rgba(96,122,144,.35)', font: '11px "Courier New",monospace', letterSpacing: 2 }}>
          ⚡ ElecEngineer · 电力工程师培养门户 v4.0 · 六阶段 · {DONE.length} 章节
        </p>
      </div>
    </footer>
  );
}
