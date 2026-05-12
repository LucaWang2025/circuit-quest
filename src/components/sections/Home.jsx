import styles from './Home.module.css';

const CARD_GROUPS = [
  {
    label: '第一阶段 · 基础概念',
    cards: [
      { id: 'voltage',    icon: '⚡', title: '电压', en: 'VOLTAGE',    color: '#ffab00', desc: '电路的"推动力"——让电荷流动的根本原因' },
      { id: 'current',    icon: '〜', title: '电流', en: 'CURRENT',    color: '#00bcd4', desc: '电荷的有序流动，决定设备工作能力的量' },
      { id: 'resistance', icon: 'Ω',  title: '电阻', en: 'RESISTANCE', color: '#ff6b35', desc: '阻碍电流流动，控制电路行为的核心参数' },
      { id: 'multimeter', icon: '📟', title: '万用表', en: 'MULTIMETER', color: '#9c7dff', desc: '电工必备仪器，一表测量电压电流电阻' },
    ],
  },
  {
    label: '第二阶段 · 进阶理解',
    cards: [
      { id: 'power',       icon: '💡', title: '功率与电能', en: 'POWER & ENERGY',   color: '#ff6b35', desc: '理解瓦特、度数与电费，掌握能耗计算' },
      { id: 'home-ckt',    icon: '🏠', title: '家用电路',   en: 'HOME CIRCUIT',     color: '#ffab00', desc: '火零地线、断路器、插座回路，看懂家庭配电' },
      { id: 'capacitor',   icon: '⚡', title: '电容基础',   en: 'CAPACITOR',        color: '#00bcd4', desc: '充放电原理、四大类型、滤波与维修应用' },
      { id: 'transformer', icon: '🔄', title: '变压器',     en: 'TRANSFORMER',      color: '#9c7dff', desc: '电磁感应、匝数比、开关电源工作流程' },
    ],
  },
  {
    label: '第三阶段 · 动手实操',
    cards: [
      { id: 'wiring', icon: '🔌', title: '导线与接线', en: 'WIRING',          color: '#00e676', desc: '线色规范、线径选择、安全接线方法全攻略' },
      { id: 'outlet', icon: '🔧', title: '开关插座安装', en: 'SWITCH & OUTLET', color: '#00bcd4', desc: '从拆旧到接线完整步骤，自己动手换插座' },
      { id: 'safety',       icon: '🛡️', title: '安全用电',   en: 'ELECTRICAL SAFETY', color: '#ff1744', desc: '接地保护、漏电开关、触电急救，生命第一' },
      { id: 'troubleshoot', icon: '🔍', title: '故障排查',   en: 'TROUBLESHOOT',      color: '#ff6b35', desc: '断路器/插座/灯具/家电四大故障交互决策树' },
    ],
  },
];

const goTo = id =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Home() {
  return (
    <section id="home" className={`sec ${styles.home}`}>
      <div className={styles.badge}>⚡ 电力工程 · 零基础到家装维修完整学习路径</div>

      <div className={styles.titleWrap}>
        <div className={styles.t1}>成为你家的</div>
        <div className={styles.t2}>电力工程师</div>
      </div>

      <p className={styles.desc}>
        从基础概念到动手实操，三个阶段系统培养你的电工思维，让你能安全、自信地处理家庭日常电力问题。
      </p>

      {CARD_GROUPS.map(group => (
        <div key={group.label} style={{ width: '100%', maxWidth: 960 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'rgba(96,122,144,.6)', letterSpacing: 3, marginBottom: 14, textAlign: 'center' }}>
            ─ {group.label} ─
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
