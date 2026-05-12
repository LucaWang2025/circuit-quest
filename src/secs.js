export const CATEGORIES = [
  {
    id: 'basics',
    label: '基础知识',
    color: '#ffab00',
    sections: [
      { id: 'home',        label: '首页',   icon: '🏠' },
      { id: 'voltage',     label: '电压',   icon: '⚡' },
      { id: 'current',     label: '电流',   icon: '〜' },
      { id: 'resistance',  label: '电阻',   icon: 'Ω'  },
      { id: 'multimeter',  label: '万用表', icon: '📟' },
      { id: 'power',       label: '功率',   icon: '💡' },
      { id: 'capacitor',   label: '电容',   icon: '⚙️' },
      { id: 'transformer', label: '变压器', icon: '🔄' },
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
      { id: 'safety',      label: '安全用电', icon: '🛡️' },
      { id: 'troubleshoot',label: '故障排查', icon: '🔍' },
    ],
  },
  {
    id: 'appliance',
    label: '小电器',
    color: '#e040fb',
    sections: [
      { id: 'bldc-fan',   label: '无刷电机', icon: '🌀' },
      { id: 'flashlight', label: '手电筒',   icon: '🔦' },
      { id: 'desk-lamp',  label: '台灯',     icon: '🪔' },
      { id: 'kettle',     label: '热水壶',   icon: '☕' },
      { id: 'hair-dryer', label: '电吹风',   icon: '💨' },
      { id: 'power-bank', label: '充电宝',   icon: '🔋' },
      { id: 'router',     label: 'WiFi路由', icon: '📡' },
    ],
  },
];

export const ALL_SECS = CATEGORIES.flatMap(c => c.sections);

export const SEC_LABEL    = Object.fromEntries(ALL_SECS.map(s => [s.id, s.label]));
export const SEC_CATEGORY = {};
CATEGORIES.forEach(c => c.sections.forEach(s => { SEC_CATEGORY[s.id] = c; }));
