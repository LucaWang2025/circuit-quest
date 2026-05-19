export const CATEGORIES = [
  {
    id: 'basics',
    label: '基础知识',
    color: '#ffab00',
    sections: [
      { id: 'home',        label: '首页',   icon: '🏠' },
      { id: 'voltage',     label: '电压',   icon: '⚡' },
      { id: 'ac-dc',       label: '交直流', icon: '〰️' },
      { id: 'series-parallel', label: '串并联', icon: '🔗' },
      { id: 'ohms-law',    label: '欧姆定律', icon: '📐' },
      { id: 'kirchhoff',   label: '基尔霍夫', icon: '🔁' },
      { id: 'ground-neutral', label: '接地零线', icon: '🛡️' },
      { id: 'current',     label: '电流',   icon: '〜' },
      { id: 'resistance',  label: '电阻',   icon: 'Ω'  },
      { id: 'multimeter',  label: '万用表', icon: '📟' },
      { id: 'power',       label: '功率',   icon: '💡' },
      { id: 'capacitor',   label: '电容',   icon: '⚙️' },
      { id: 'inductor',    label: '电感',   icon: '🌀' },
      { id: 'diode',       label: '二极管', icon: '▷'  },
      { id: 'transistor',  label: '三极管', icon: '🔺' },
      { id: 'transformer', label: '变压器', icon: '🔄' },
      { id: 'schematic',   label: '读电路图', icon: '📐' },
    ],
  },
  {
    id: 'repair',
    label: '维修工坊',
    color: '#ff6b35',
    sections: [
      { id: 'mm-measure',  label: '万用表5式', icon: '📟' },
      { id: 'light-fix',   label: '灯不亮',   icon: '💡' },
      { id: 'outlet-fix',  label: '插座没电', icon: '🔌' },
      { id: 'breaker-fix', label: '跳闸排查', icon: '⚡' },
      { id: 'teardown',    label: '拆机十诫', icon: '🔧' },
    ],
  },
  {
    id: 'practice',
    label: '互动练习',
    color: '#7c4dff',
    sections: [
      { id: 'calc-hub',     label: '计算器',   icon: '🧮' },
      { id: 'fault-sim',    label: '故障模拟', icon: '🔍' },
      { id: 'quiz-hub',     label: '小测验',   icon: '📝' },
      { id: 'line-game',    label: '连线游戏', icon: '🎮' },
      { id: 'repair-quest', label: '维修闯关', icon: '🏆' },
    ],
  },
  {
    id: 'home-elec',
    label: '家用电路',
    color: '#00e676',
    sections: [
      { id: 'home-ckt',    label: '家用电路', icon: '🏠' },
      { id: 'wiring',      label: '导线接线', icon: '🔌' },
      { id: 'outlet',      label: '开关插座', icon: '🔧' },
      { id: 'break-panel', label: '配电箱',   icon: '🗂️' },
      { id: 'relay',       label: '继电器',   icon: '⚙️' },
      { id: 'aircon',      label: '空调线路', icon: '❄️' },
      { id: 'low-voltage', label: '弱电系统', icon: '📶' },
      { id: 'floor-heat',  label: '地暖浴霸', icon: '🌡️' },
      { id: 'safety',      label: '安全用电', icon: '🛡️' },
      { id: 'troubleshoot',label: '故障排查', icon: '🔍' },
      { id: 'meter-entry', label: '入户电表', icon: '⚡' },
      { id: 'ev-charger',  label: '充电桩',   icon: '🔌' },
      { id: 'solar',       label: '光伏',     icon: '☀️' },
      { id: 'lightning',   label: '防雷',     icon: '🌩️' },
      { id: 'smart-switch',label: '智能开关', icon: '📱' },
    ],
  },
  {
    id: 'appliance',
    label: '小电器',
    color: '#e040fb',
    sections: [
      { id: 'bldc-fan',        label: '无刷电机', icon: '🌀' },
      { id: 'flashlight',      label: '手电筒',   icon: '🔦' },
      { id: 'desk-lamp',       label: '台灯',     icon: '🪔' },
      { id: 'kettle',          label: '热水壶',   icon: '☕' },
      { id: 'hair-dryer',      label: '电吹风',   icon: '💨' },
      { id: 'power-bank',      label: '充电宝',   icon: '🔋' },
      { id: 'router',          label: 'WiFi路由', icon: '📡' },
      { id: 'rice-cooker',     label: '电饭锅',   icon: '🍚' },
      { id: 'washing-machine', label: '洗衣机',   icon: '🫧' },
      { id: 'bt-speaker',      label: '蓝牙音箱', icon: '🔊' },
      { id: 'wireless-charge', label: '无线充电', icon: '📳' },
      { id: 'e-toothbrush',    label: '电动牙刷', icon: '🪥' },
      { id: 'robot-vacuum',    label: '扫地机器人', icon: '🤖' },
      { id: 'microwave',       label: '微波炉',     icon: '📻' },
      { id: 'induction',       label: '电磁炉',     icon: '🍳' },
      { id: 'fridge',          label: '冰箱',       icon: '🧊' },
      { id: 'escooter',        label: '滑板车',     icon: '🛴' },
    ],
  },
  {
    id: 'energy',
    label: '新能源',
    color: '#00c853',
    sections: [
      { id: 'battery-tech',    label: '锂电池',   icon: '🔋' },
      { id: 'fast-charge',     label: '快充协议', icon: '⚡' },
      { id: 'ev-power',        label: '汽车三电', icon: '🚗' },
      { id: 'energy-storage',  label: '储能',     icon: '🏠' },
    ],
  },
  {
    id: 'advanced',
    label: '进阶动手',
    color: '#00e5ff',
    sections: [
      { id: 'soldering',    label: '焊接技术', icon: '🔩' },
      { id: 'oscilloscope', label: '示波器',   icon: '📊' },
      { id: 'breadboard',   label: '面包板',   icon: '🧩' },
      { id: 'pcb',          label: 'PCB设计',  icon: '🖥️' },
      { id: 'arduino',      label: 'Arduino',  icon: '⚡' },
    ],
  },
  {
    id: 'reference',
    label: '速查手册',
    color: '#607d8b',
    sections: [
      { id: 'wire-table',  label: '线径表',   icon: '📋' },
      { id: 'symbol-ref',  label: '符号',     icon: '📐' },
      { id: 'parts-ref',   label: '元件库',   icon: '🧰' },
    ],
  },
  {
    id: 'industrial',
    label: '工业用电',
    color: '#ff9800',
    sections: [
      { id: 'industrial',           label: '工业概览', icon: '🏭' },
      { id: 'industrial-phase',     label: '三相基础', icon: '🔺' },
      { id: 'industrial-wiring',    label: '星三角',   icon: '△' },
      { id: 'industrial-motor',     label: '电机启动', icon: '🌀' },
      { id: 'industrial-compare',   label: '家用对比', icon: '⚖️' },
    ],
  },
  {
    id: 'evchain',
    label: '充电链路',
    color: '#00e676',
    sections: [
      { id: 'evchain',         label: '充电概览', icon: '🔌' },
      { id: 'evchain-ac',      label: '交流慢充', icon: '〰️' },
      { id: 'evchain-dc',      label: '直流快充', icon: '⚡' },
      { id: 'evchain-bms',     label: 'BMS',     icon: '🔋' },
      { id: 'evchain-cable',   label: '线缆协议', icon: '🔗' },
    ],
  },
  {
    id: 'panel',
    label: '配电箱全景',
    color: '#26a69a',
    sections: [
      { id: 'panel-hub',          label: '配电概览', icon: '🗂️' },
      { id: 'panel-anatomy',      label: '箱内结构', icon: '📦' },
      { id: 'panel-breaker-sim',  label: '空开跳闸', icon: '⚡' },
      { id: 'panel-rcd-sim',      label: '漏电保护', icon: '🛡️' },
      { id: 'panel-spd-sim',      label: '浪涌保护', icon: '🌩️' },
    ],
  },
  {
    id: 'scope-lab',
    label: '示波器实验',
    color: '#00e5ff',
    sections: [
      { id: 'scope-lab',           label: '实验概览', icon: '📊' },
      { id: 'scope-lab-wave',      label: '波形基础', icon: '📈' },
      { id: 'scope-lab-measure',   label: '周期幅值', icon: '📏' },
      { id: 'scope-lab-rc',        label: 'RC/RL',   icon: '⚙️' },
      { id: 'scope-lab-trigger',   label: '触发稳定', icon: '🎯' },
    ],
  },
  {
    id: 'backup',
    label: '应急户储',
    color: '#ff7043',
    sections: [
      { id: 'backup',            label: '应急概览', icon: '🔋' },
      { id: 'backup-outage',     label: '停电场景', icon: '🔌' },
      { id: 'backup-ats',        label: '自动切换', icon: '🔀' },
      { id: 'backup-priority',   label: '供电优先级', icon: '☀️' },
      { id: 'backup-emergency',  label: '应急清单', icon: '📋' },
    ],
  },
  {
    id: 'cosmos',
    label: '宇宙',
    color: '#9c7dff',
    sections: [
      { id: 'cosmos',              label: '宇宙概览', icon: '🌌' },
      { id: 'cosmos-scale',        label: '天文尺度', icon: '📏' },
      { id: 'cosmos-planets',      label: '行星图鉴', icon: '🪐' },
      { id: 'cosmos-structure',    label: '太阳系结构', icon: '💫' },
      { id: 'cosmos-energy',       label: '能源链', icon: '🔗' },
      { id: 'cosmos-power-budget', label: '深空供电', icon: '🔋' },
      { id: 'cosmos-habitable',    label: '宜居带', icon: '🌍' },
      { id: 'cosmos-gravity',      label: '引力井', icon: '🕳️' },
      { id: 'cosmos-mission',      label: '任务台', icon: '🛰️' },
      { id: 'cosmos-space-weather', label: '空间天气', icon: '🌩️' },
      { id: 'solar-system',        label: '3D深空', icon: '🛸' },
    ],
  },
];

/** 顶栏一级分组（避免 14 个分类标签挤满一行） */
export const NAV_GROUPS = [
  {
    id: 'core',
    label: '基础学习',
    shortLabel: '基础',
    icon: '📚',
    color: '#ffab00',
    categoryIds: ['basics', 'practice', 'reference'],
  },
  {
    id: 'home',
    label: '家用实战',
    shortLabel: '家用',
    icon: '🏠',
    color: '#00e676',
    categoryIds: ['home-elec', 'repair', 'appliance'],
  },
  {
    id: 'energy',
    label: '能源电动',
    shortLabel: '能源',
    icon: '🔋',
    color: '#00c853',
    categoryIds: ['energy', 'evchain', 'backup'],
  },
  {
    id: 'topics',
    label: '拓展专题',
    shortLabel: '拓展',
    icon: '✨',
    color: '#26a69a',
    categoryIds: ['industrial', 'panel', 'scope-lab'],
  },
  {
    id: 'advanced',
    label: '进阶动手',
    shortLabel: '进阶',
    icon: '🔧',
    color: '#00e5ff',
    categoryIds: ['advanced'],
  },
  {
    id: 'cosmos',
    label: '宇宙专题',
    shortLabel: '宇宙',
    icon: '🌌',
    color: '#9c7dff',
    categoryIds: ['cosmos'],
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export function navGroupForCategory(categoryId) {
  return NAV_GROUPS.find(g => g.categoryIds.includes(categoryId)) ?? NAV_GROUPS[0];
}

export function navGroupForSection(sectionId) {
  const cat = SEC_CATEGORY[sectionId];
  return cat ? navGroupForCategory(cat.id) : NAV_GROUPS[0];
}

export const ALL_SECS = CATEGORIES.flatMap(c => c.sections);
export const SEC_LABEL    = Object.fromEntries(ALL_SECS.map(s => [s.id, s.label]));
export const SEC_CATEGORY = {};
CATEGORIES.forEach(c => c.sections.forEach(s => { SEC_CATEGORY[s.id] = c; }));
