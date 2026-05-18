import styles from './Home.module.css';
import { useNav } from '../../NavContext';

const CARD_GROUPS = [
  {
    label: '第一阶段 · 基础知识',
    tag: 'FUNDAMENTALS',
    color: '#ffab00',
    cards: [
      { id: 'voltage',     icon: '⚡', title: '电压',       en: 'VOLTAGE',       color: '#ffab00', desc: '电路推动力，了解伏特、电位差与欧姆定律' },
      { id: 'ac-dc',       icon: '〰️', title: '交直流',     en: 'AC / DC',       color: '#00bcd4', desc: '正弦波与直流对比、有效值、频率、220Vrms 解读' },
      { id: 'series-parallel', icon: '🔗', title: '串并联', en: 'SERIES/PARALLEL', color: '#9c7dff', desc: '灯泡亮度对比、电流电压分配、串并联公式' },
      { id: 'ohms-law',    icon: '📐', title: '欧姆定律',   en: "OHM'S LAW",     color: '#ffab00', desc: '交互计算器：输入两量算第三量，功率三角形' },
      { id: 'kirchhoff',   icon: '🔁', title: '基尔霍夫',   en: 'KIRCHHOFF',     color: '#00e676', desc: 'KCL 节点电流守恒、KVL 回路电压守恒动画演示' },
      { id: 'ground-neutral', icon: '🛡️', title: '接地零线', en: 'L/N/PE',       color: '#ff1744', desc: '火零地线角色、漏电与零线断路的危险场景' },
      { id: 'current',     icon: '〜', title: '电流',       en: 'CURRENT',       color: '#00bcd4', desc: '电荷有序流动，安培、串并联与电流分配' },
      { id: 'resistance',  icon: 'Ω',  title: '电阻',       en: 'RESISTANCE',    color: '#ff6b35', desc: '阻碍电流，色环识别、串并联计算' },
      { id: 'multimeter',  icon: '📟', title: '万用表',     en: 'MULTIMETER',    color: '#9c7dff', desc: '一表测三量，表笔使用与安全操作全流程' },
      { id: 'power',       icon: '💡', title: '功率与电能', en: 'POWER',         color: '#ff6b35', desc: '瓦特、度数、电费计算器，能耗一目了然' },
      { id: 'capacitor',   icon: '⚙️', title: '电容',       en: 'CAPACITOR',     color: '#00bcd4', desc: '充放电特性、四大类型、滤波与维修应用' },
      { id: 'inductor',    icon: '🌀', title: '电感',       en: 'INDUCTOR',      color: '#00bcd4', desc: 'L=N²μA/l，磁场储能、阻抗特性与开关电源应用' },
      { id: 'diode',       icon: '▷',  title: '二极管',     en: 'DIODE',         color: '#ff6b35', desc: 'PN结单向导通、整流电路、稳压管与LED原理' },
      { id: 'transistor',  icon: '🔺', title: '三极管/MOSFET', en: 'TRANSISTOR', color: '#9c7dff', desc: 'BJT放大、MOSFET开关，驱动家电的核心元器件' },
      { id: 'transformer', icon: '🔄', title: '变压器',     en: 'TRANSFORMER',   color: '#9c7dff', desc: '电磁感应、匝数比、开关电源工作流程' },
      { id: 'schematic',   icon: '📐', title: '如何读电路图', en: 'SCHEMATICS',  color: '#ffab00', desc: '元件符号大全、导线规则、阅读步骤与实战练习' },
    ],
  },
  {
    label: '维修工坊 · 实战排修',
    tag: 'REPAIR WORKSHOP',
    color: '#ff6b35',
    cards: [
      { id: 'mm-measure',  icon: '📟', title: '万用表 5 式',   en: '5 MEASURES',    color: '#ff6b35', desc: '电压/电流/电阻/通断/二极管——接线动画与档位要点' },
      { id: 'light-fix',   icon: '💡', title: '灯不亮排查',   en: 'LIGHT FIX',     color: '#ffab00', desc: '交互决策树：灯泡→开关→线路逐步定位' },
      { id: 'outlet-fix',  icon: '🔌', title: '插座没电',     en: 'OUTLET FIX',    color: '#00bcd4', desc: '单孔/区域/零线断——万用表步进诊断模拟' },
      { id: 'breaker-fix', icon: '⚡', title: '跳闸排查',     en: 'BREAKER FIX',   color: '#ff6b35', desc: '漏电/过载/短路三路分支决策' },
      { id: 'teardown',    icon: '🔧', title: '拆机十诫',     en: 'TEARDOWN',      color: '#ff9800', desc: '断电验电、防静电、放高压——安全拆修流程' },
    ],
  },
  {
    label: '第二阶段 · 家用电路',
    tag: 'HOME ELECTRICAL',
    color: '#00e676',
    cards: [
      { id: 'home-ckt',    icon: '🏠', title: '家用电路基础', en: 'HOME CIRCUIT',    color: '#ffab00', desc: '火零地线、断路器、回路划分，配电箱全解析' },
      { id: 'wiring',      icon: '🔌', title: '导线与接线',   en: 'WIRING',          color: '#00e676', desc: '线径选择、颜色规范、Wago/端子接线实操' },
      { id: 'outlet',      icon: '🔧', title: '开关插座安装', en: 'SWITCH & OUTLET', color: '#00bcd4', desc: '7步完整流程，断电验电到通电测试一步不漏' },
      { id: 'break-panel', icon: '🗂️', title: '配电箱详解',  en: 'PANEL BOARD',     color: '#00e676', desc: '回路规划、断路器选型、上下级保护配合要点' },
      { id: 'relay',       icon: '⚙️', title: '继电器',      en: 'RELAY',           color: '#00e676', desc: '电磁继电器原理、触点类型、续流二极管与驱动电路' },
      { id: 'aircon',      icon: '❄️', title: '空调线路',    en: 'AIR CON',         color: '#00bcd4', desc: '专用回路、室内外机接线、变频故障码解读' },
      { id: 'low-voltage', icon: '📶', title: '弱电系统',    en: 'LOW VOLTAGE',     color: '#9c7dff', desc: '网络/监控/门禁/智能家居，布线规范与弱电箱' },
      { id: 'floor-heat',  icon: '🌡️', title: '地暖浴霸',   en: 'FLOOR HEAT',      color: '#ff9800', desc: '电地暖回路、温控器接线、浴霸多路开关配线' },
      { id: 'safety',      icon: '🛡️', title: '安全用电',   en: 'SAFETY',          color: '#ff1744', desc: '接地原理、漏电保护器、触电急救五步法' },
      { id: 'troubleshoot',icon: '🔍', title: '故障排查',   en: 'TROUBLESHOOT',    color: '#ff6b35', desc: '交互决策树：断路器/插座/灯具/家电四大场景' },
      { id: 'meter-entry', icon: '⚡', title: '入户线与电表', en: 'METER ENTRY',   color: '#ffab00', desc: '家庭电力入口、电表、总开关与接地' },
      { id: 'ev-charger',  icon: '🔌', title: '充电桩',     en: 'EV CHARGER',      color: '#00e676', desc: '7kW/11kW 交流桩接线与漏电保护' },
      { id: 'solar',       icon: '☀️', title: '家用光伏',   en: 'SOLAR PV',        color: '#ffeb3b', desc: '组件、逆变器、并网与储能' },
      { id: 'lightning',   icon: '🌩️', title: '防雷接地',   en: 'LIGHTNING',       color: '#64b5f6', desc: '避雷、等电位连接与接地电阻' },
      { id: 'smart-switch',icon: '📱', title: '智能开关',   en: 'SMART SWITCH',    color: '#9c7dff', desc: '零火/单火接线、Wi-Fi 与继电器' },
    ],
  },
  {
    label: '互动练习 · 测练闯关',
    tag: 'PRACTICE',
    color: '#7c4dff',
    cards: [
      { id: 'calc-hub',     icon: '🧮', title: '电学计算器', en: 'CALCULATOR',  color: '#7c4dff', desc: '欧姆/功率/电费/并联电阻 五合一' },
      { id: 'fault-sim',    icon: '🔍', title: '故障模拟',   en: 'SIMULATOR',   color: '#7c4dff', desc: '根据现象选原因，训练诊断判断力' },
      { id: 'quiz-hub',     icon: '📝', title: '知识测验',   en: 'QUIZ',        color: '#7c4dff', desc: '综合选择题，错题解析' },
      { id: 'line-game',    icon: '🎮', title: '连线游戏',   en: 'LINE GAME',   color: '#7c4dff', desc: '连接电池电阻 LED 构成闭合回路' },
      { id: 'repair-quest', icon: '🏆', title: '维修闯关',   en: 'QUEST',       color: '#7c4dff', desc: '真实场景步骤打卡，进度本地保存' },
    ],
  },
  {
    label: '第三阶段 · 小电器电路',
    tag: 'APPLIANCE CIRCUITS',
    color: '#e040fb',
    cards: [
      { id: 'bldc-fan',        icon: '🌀', title: '无刷电机风扇', en: 'BLDC FAN',        color: '#e040fb', desc: '三相绕组、六步换相、MOSFET全桥、PWM调速全解析' },
      { id: 'flashlight',      icon: '🔦', title: '手电筒电路',   en: 'FLASHLIGHT',      color: '#ffd740', desc: '18650/21700电池、Type-C充电IC、恒流LED驱动设计' },
      { id: 'desk-lamp',       icon: '🪔', title: '台灯电路',     en: 'DESK LAMP',       color: '#ffe066', desc: 'AC-DC驱动、恒流LED、PWM调光与色温调节全流程' },
      { id: 'kettle',          icon: '☕', title: '热水壶电路',   en: 'KETTLE',          color: '#ff6b35', desc: '发热管、双金属片温控、防干烧保护，220V家电拆解' },
      { id: 'hair-dryer',      icon: '💨', title: '电吹风电路',   en: 'HAIR DRYER',      color: '#ff9800', desc: '串励电机调速、Ni-Cr发热丝、档位切换与过热保护' },
      { id: 'power-bank',      icon: '🔋', title: '充电宝电路',   en: 'POWER BANK',      color: '#00bcd4', desc: '锂电BMS、Boost升压、快充协议PD/QC实现原理' },
      { id: 'router',          icon: '📡', title: 'WiFi路由器',   en: 'WIFI ROUTER',     color: '#00e676', desc: 'SMPS供电链路、SoC架构、RF前端与散热设计' },
      { id: 'rice-cooker',     icon: '🍚', title: '电饭锅电路',   en: 'RICE COOKER',     color: '#ff9800', desc: '磁钢温控原理、保温半波整流、IH电磁加热升级' },
      { id: 'washing-machine', icon: '🫧', title: '洗衣机电路',   en: 'WASHING MACHINE', color: '#00bcd4', desc: '电容运转电机、正反转切换、变频BLDC与故障码' },
      { id: 'bt-speaker',      icon: '🔊', title: '蓝牙音箱',     en: 'BT SPEAKER',      color: '#e040fb', desc: 'Class D功放PWM原理、BT5.0编解码、锂电BMS' },
      { id: 'wireless-charge', icon: '📳', title: '无线充电',     en: 'WIRELESS CHARGE', color: '#00e676', desc: 'Qi标准、电磁感应谐振、异物检测FOD与MagSafe' },
      { id: 'e-toothbrush',    icon: '🪥', title: '电动牙刷',     en: 'E-TOOTHBRUSH',    color: '#00bcd4', desc: '感应隔离充电、声波马达振动、IPX7防水电路设计' },
      { id: 'robot-vacuum',    icon: '🤖', title: '扫地机器人',   en: 'ROBOT VACUUM',    color: '#ffab00', desc: 'LiDAR测距建图、多电机PWM驱动、传感器融合架构' },
      { id: 'microwave',       icon: '📻', title: '微波炉',       en: 'MICROWAVE',       color: '#ff6b35', desc: '磁控管、高压变压器 2kV 安全要点' },
      { id: 'induction',       icon: '🍳', title: '电磁炉',       en: 'INDUCTION',       color: '#ff9800', desc: 'IH 涡流加热、锅具检测' },
      { id: 'fridge',          icon: '🧊', title: '冰箱',         en: 'FRIDGE',          color: '#00bcd4', desc: '压缩机、启动电容、制冷循环' },
      { id: 'escooter',        icon: '🛴', title: '电动滑板车',   en: 'E-SCOOTER',       color: '#e040fb', desc: 'BLDC、控制器、BMS 三电' },
    ],
  },
  {
    label: '新能源专题',
    tag: 'NEW ENERGY',
    color: '#00c853',
    cards: [
      { id: 'battery-tech',   icon: '🔋', title: '锂电池',     en: 'BATTERY',    color: '#00c853', desc: '三元 vs 磷酸铁锂、BMS 保护' },
      { id: 'fast-charge',    icon: '⚡', title: '快充协议',   en: 'FAST CHARGE', color: '#00c853', desc: 'PD/QC/UFCS 握手与安全' },
      { id: 'ev-power',       icon: '🚗', title: '汽车三电',   en: 'EV POWER',   color: '#00c853', desc: '电池包、驱动电机、电控' },
      { id: 'energy-storage', icon: '🏠', title: '储能电网',   en: 'STORAGE',    color: '#00c853', desc: '户储、削峰填谷、V2G' },
    ],
  },
  {
    label: '第五阶段 · 进阶动手',
    tag: 'HANDS-ON ADVANCED',
    color: '#00e5ff',
    cards: [
      { id: 'soldering',    icon: '🔩', title: '焊接技术',    en: 'SOLDERING',    color: '#ff6b35', desc: '无铅焊接步骤、焊点缺陷识别、SMD贴片与拆焊技巧' },
      { id: 'oscilloscope', icon: '📊', title: '示波器使用',  en: 'OSCILLOSCOPE', color: '#00e676', desc: '时基/V档设置、触发稳波、PWM测量与纹波分析实战' },
      { id: 'breadboard',   icon: '🧩', title: '面包板实验',  en: 'BREADBOARD',   color: '#9c7dff', desc: '内部连接规律、LED限流电路搭建、从原型到洞洞板' },
      { id: 'pcb',          icon: '🖥️', title: 'PCB设计基础', en: 'PCB DESIGN',  color: '#00e5ff', desc: 'FR4材料、层结构、线宽计算、KiCad免费设计与嘉立创打样' },
      { id: 'arduino',      icon: '⚡', title: 'Arduino入门', en: 'ARDUINO',      color: '#ffab00', desc: 'ATmega328P引脚、PWM调光、ADC采集、继电器控220V实战' },
    ],
  },
  {
    label: '速查手册',
    tag: 'REFERENCE',
    color: '#607d8b',
    cards: [
      { id: 'wire-table', icon: '📋', title: '线径载流量', en: 'WIRE TABLE', color: '#607d8b', desc: '国标铜线载流量与安全选型' },
      { id: 'symbol-ref', icon: '📐', title: '电气符号',   en: 'SYMBOLS',    color: '#607d8b', desc: '常用符号与实物对照' },
      { id: 'parts-ref',  icon: '🧰', title: '元件库',     en: 'PARTS',      color: '#607d8b', desc: '色环电阻、电容标识、接线端子' },
    ],
  },
];

export default function Home() {
  const navigate = useNav();
  return (
    <section id="home" className={`sec ${styles.home}`}>
      <div className={styles.badge}>⚡ 电力工程师培养门户 · v4.0 六阶段学习路径</div>

      <div className={styles.titleWrap}>
        <div className={styles.t1}>成为你家的</div>
        <div className={styles.t2}>电力工程师</div>
      </div>

      <p className={styles.desc}>
        基础理论、维修工坊、互动练习、家用电路、小电器拆解、新能源与速查手册——六阶段 70 章循序渐进，
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
              <div key={c.id} className={styles.card} style={{ '--cc': c.color }} onClick={() => navigate(c.id)}>
                <span className={styles.cardIcon}>{c.icon}</span>
                <div className={styles.cardTitle}>{c.title}</div>
                <div className={styles.cardEn}>{c.en}</div>
                <div className={styles.cardDesc}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.scrollHint}>选择章节开始探索 →</div>
    </section>
  );
}
