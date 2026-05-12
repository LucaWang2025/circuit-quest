import styles from './Home.module.css';

const CARD_GROUPS = [
  {
    label: '第一阶段 · 基础知识',
    tag: 'FUNDAMENTALS',
    color: '#ffab00',
    cards: [
      { id: 'voltage',     icon: '⚡', title: '电压',     en: 'VOLTAGE',     color: '#ffab00', desc: '电路推动力，了解伏特、电位差与欧姆定律' },
      { id: 'current',     icon: '〜', title: '电流',     en: 'CURRENT',     color: '#00bcd4', desc: '电荷有序流动，安培、串并联与电流分配' },
      { id: 'resistance',  icon: 'Ω',  title: '电阻',     en: 'RESISTANCE',  color: '#ff6b35', desc: '阻碍电流，色环识别、串并联计算' },
      { id: 'multimeter',  icon: '📟', title: '万用表',   en: 'MULTIMETER',  color: '#9c7dff', desc: '一表测三量，表笔使用与安全操作全流程' },
      { id: 'power',       icon: '💡', title: '功率与电能', en: 'POWER',     color: '#ff6b35', desc: '瓦特、度数、电费计算器，能耗一目了然' },
      { id: 'capacitor',   icon: '⚡', title: '电容',     en: 'CAPACITOR',   color: '#00bcd4', desc: '充放电特性、四大类型、滤波与维修应用' },
      { id: 'transformer', icon: '🔄', title: '变压器',   en: 'TRANSFORMER', color: '#9c7dff', desc: '电磁感应、匝数比、开关电源工作流程' },
    ],
  },
  {
    label: '第二阶段 · 家用电路',
    tag: 'HOME ELECTRICAL',
    color: '#00e676',
    cards: [
      { id: 'home-ckt',    icon: '🏠', title: '家用电路基础', en: 'HOME CIRCUIT', color: '#ffab00', desc: '火零地线、断路器、回路划分，配电箱全解析' },
      { id: 'wiring',      icon: '🔌', title: '导线与接线',   en: 'WIRING',       color: '#00e676', desc: '线径选择、颜色规范、Wago/端子接线实操' },
      { id: 'outlet',      icon: '🔧', title: '开关插座安装', en: 'SWITCH & OUTLET', color: '#00bcd4', desc: '7步完整流程，断电验电到通电测试一步不漏' },
      { id: 'safety',      icon: '🛡️', title: '安全用电',   en: 'SAFETY',       color: '#ff1744', desc: '接地原理、漏电保护器、触电急救五步法' },
      { id: 'troubleshoot',icon: '🔍', title: '故障排查',   en: 'TROUBLESHOOT', color: '#ff6b35', desc: '交互决策树：断路器/插座/灯具/家电四大场景' },
    ],
  },
  {
    label: '第三阶段 · 小电器电路',
    tag: 'APPLIANCE CIRCUITS',
    color: '#e040fb',
    cards: [
      { id: 'bldc-fan', icon: '🌀', title: '无刷电机风扇', en: 'BLDC FAN', color: '#e040fb', desc: '三相绕组、六步换相、MOSFET全桥、PWM调速全解析' },
    ],
  },
];

const goTo = id =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Home() {
  return (
    <section id="home" className={`sec ${styles.home}`}>
      <div className={styles.badge}>⚡ 电力工程师培养门户 · 三阶段系统学习路径</div>

      <div className={styles.titleWrap}>
        <div className={styles.t1}>成为你家的</div>
        <div className={styles.t2}>电力工程师</div>
      </div>

      <p className={styles.desc}>
        从基础概念到家用维修，再到小电器电路拆解——三个阶段循序渐进，
        让你能安全、自信地理解和处理身边的每一个电气问题。
      </p>

      {CARD_GROUPS.map(group => (
        <div key={group.label} style={{ width: '100%', maxWidth: 980, marginBottom: 16 }}>
          {/* Group header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: `${group.color}33` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                padding: '3px 12px', borderRadius: 20,
                border: `1px solid ${group.color}55`,
                background: `${group.color}12`,
                font: '10px "Courier New",monospace', color: group.color, letterSpacing: 2,
              }}>{group.tag}</div>
              <div style={{ font: '12px inherit', color: 'var(--dim)' }}>{group.label}</div>
            </div>
            <div style={{ flex: 1, height: 1, background: `${group.color}33` }} />
          </div>
          <div className={styles.cards}>
            {group.cards.map(c => (
              <div key={c.id} className={styles.card} style={{ '--cc': c.color }} onClick={() => goTo(c.id)}>
                <span className={styles.cardIcon}>{c.icon}</span>
                <div className={styles.cardTitle}>{c.title}</div>
                <div className={styles.cardEn}>{c.en}</div>
                <div className={styles.cardDesc}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.scrollHint}>SCROLL DOWN TO EXPLORE ↓</div>
    </section>
  );
}
