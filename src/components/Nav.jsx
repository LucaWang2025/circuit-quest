import { useMemo } from 'react';
import styles from './Nav.module.css';
import {
  NAV_GROUPS,
  CATEGORY_BY_ID,
  SEC_CATEGORY,
  navGroupForSection,
} from '../secs';

export default function Nav({ theme, onToggleTheme, activeSection, onNavigate, children }) {
  const activeCat = SEC_CATEGORY[activeSection] ?? CATEGORY_BY_ID.basics;
  const activeGroup = navGroupForSection(activeSection);

  const groupCategories = useMemo(
    () => activeGroup.categoryIds.map(id => CATEGORY_BY_ID[id]).filter(Boolean),
    [activeGroup],
  );

  const goGroup = (group) => {
    const firstCat = CATEGORY_BY_ID[group.categoryIds[0]];
    if (firstCat?.sections[0]) onNavigate(firstCat.sections[0].id);
  };

  const goCategory = (cat) => {
    if (cat?.sections[0]) onNavigate(cat.sections[0].id);
  };

  return (
    <nav className={styles.nav}>
      {/* 一级：大类 */}
      <div className={styles.row1}>
        <button type="button" className={styles.logo} onClick={() => onNavigate('home')} title="返回首页">
          📚 知识<em>探索</em>
        </button>

        <div className={styles.groupRow}>
          {NAV_GROUPS.map(group => (
            <button
              key={group.id}
              type="button"
              className={`${styles.groupTab} ${activeGroup.id === group.id ? styles.groupOn : ''}`}
              style={{ '--cat-color': group.color }}
              onClick={() => goGroup(group)}
              title={group.label}
            >
              <span className={styles.groupIcon}>{group.icon}</span>
              <span className={styles.groupLabel}>{group.shortLabel}</span>
            </button>
          ))}
        </div>

        {children}

        <button type="button" className={styles.themeBtn} onClick={onToggleTheme} title="切换主题">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* 二级 + 三级：子分类 + 章节 */}
      <div className={styles.row2}>
        {groupCategories.length > 1 && (
          <div className={styles.catSubRow}>
            {groupCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.catSub} ${activeCat.id === cat.id ? styles.catSubOn : ''}`}
                style={{ '--cat-color': cat.color }}
                onClick={() => goCategory(cat)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.pillWrap}>
          <div className={styles.pillRow}>
            {activeCat.sections.map(sec => (
              <button
                key={sec.id}
                type="button"
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
      </div>
    </nav>
  );
}
