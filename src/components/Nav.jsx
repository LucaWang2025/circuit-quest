import styles from './Nav.module.css';
import { CATEGORIES, SEC_CATEGORY } from '../secs';

export default function Nav({ theme, onToggleTheme, activeSection, onNavigate }) {
  const activeCat = SEC_CATEGORY[activeSection] ?? CATEGORIES[0];

  return (
    <nav className={styles.nav}>
      {/* ── Row 1: Logo + Category tabs + Theme ── */}
      <div className={styles.row1}>
        <div className={styles.logo}>⚡ 电路<em>探索</em></div>

        <div className={styles.catRow}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`${styles.catTab} ${activeCat.id === cat.id ? styles.catOn : ''}`}
              style={{ '--cat-color': cat.color }}
              onClick={() => onNavigate(cat.sections[0].id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button className={styles.themeBtn} onClick={onToggleTheme} title="切换主题">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* ── Row 2: Section pills for active category ── */}
      <div className={styles.row2}>
        <div className={styles.pillRow}>
          {activeCat.sections.map(sec => (
            <button
              key={sec.id}
              className={`${styles.pill} ${activeSection === sec.id ? styles.on : ''}`}
              style={{ '--cat-color': activeCat.color }}
              onClick={() => onNavigate(sec.id)}
            >
              <span className={styles.pillIcon}>{sec.icon}</span>
              {sec.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
