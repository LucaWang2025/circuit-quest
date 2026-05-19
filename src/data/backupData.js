/** 应急与户储专题 */

export const BACKUP_ACC = '#ff7043';

export const BACKUP_LEARNING_PATH = [
  { id: 'energy-storage', label: '储能系统', icon: '🏠' },
  { id: 'backup-outage', label: '停电场景', icon: '🔌' },
  { id: 'backup-ats', label: '自动切换', icon: '🔀' },
  { id: 'backup-priority', label: '供电优先级', icon: '☀️' },
  { id: 'safety', label: '安全用电', icon: '🛡️' },
];

export const HUB_LINKS = [
  { id: 'backup-outage', icon: '🔌', title: '停电场景', en: 'OUTAGE', color: '#ff7043', desc: '电网失电、孤岛、负载分级' },
  { id: 'backup-ats', icon: '🔀', title: '自动切换', en: 'ATS', color: '#ffab00', desc: '双电源互锁、切换时间' },
  { id: 'backup-priority', icon: '☀️', title: '供电优先级', en: 'PRIORITY', color: '#00e676', desc: '光伏→储能→柴发→电网' },
  { id: 'backup-emergency', icon: '📋', title: '应急清单', en: 'CHECKLIST', color: '#ef5350', desc: '家庭停电处置步骤' },
];

export const POWER_SOURCES = [
  { id: 'grid', label: '电网', color: '#00e676', priority: 1 },
  { id: 'solar', label: '光伏', color: '#ffd600', priority: 2 },
  { id: 'bess', label: '户储', color: '#69f0ae', priority: 3 },
  { id: 'gen', label: '柴发', color: '#ff6b35', priority: 4 },
];

export const RELATED_BY_SECTION = {
  backup: [{ id: 'backup-outage', label: '停电场景' }, { id: 'energy-storage', label: '储能系统' }],
  'backup-outage': [{ id: 'backup-ats', label: '自动切换' }, { id: 'solar', label: '家用光伏' }],
  'backup-ats': [{ id: 'backup-priority', label: '供电优先级' }, { id: 'home-ckt', label: '家用电路' }],
  'backup-priority': [{ id: 'energy-storage', label: '储能' }, { id: 'cosmos-energy', label: '能源链' }],
  'backup-emergency': [{ id: 'safety', label: '安全用电' }, { id: 'breaker-fix', label: '跳闸排查' }],
};

const mk = (items) => items;

export const QUIZ_HUB = mk([
  { question: '停电后首要？', options: ['确认是否区域停电', '立即短接', '拆地线', '开大负载'], answer: 0, explain: '看电表/邻居/物业信息。' },
  { question: '户储并网需？', options: ['防孤岛保护', '仅外观', '仅WiFi', '仅颜色'], answer: 0, explain: '防止向电网倒送电。' },
  { question: '柴发与电网？', options: ['必须互锁防并联', '可并联', '无关', '仅串联'], answer: 0, explain: 'ATS/双电源互锁。' },
  { question: '应急照明优先？', options: ['安全撤离与基本照明', '全屋空调', '仅装饰', '仅充电游戏'], answer: 0, explain: '负载分级。' },
  { question: '光伏夜间？', options: ['无发电需储能或电网', '仍满功率', '仅直流插座', '仅防雷'], answer: 0, explain: '需电池或电网。' },
]);

export const QUIZ_OUTAGE = QUIZ_HUB;
export const QUIZ_ATS = mk([
  { question: 'ATS 作用？', options: ['两路电源自动切换', '仅测电阻', '仅调光', '仅防雷'], answer: 0, explain: 'Automatic Transfer Switch。' },
  { question: '切换时间影响？', options: ['敏感设备可能重启', '无影响', '仅颜色', '仅温度'], answer: 0, explain: '电脑/冰箱压缩机需注意。' },
  { question: '手动旁路用于？', options: ['维护时强制供电', '永久短接', '仅装饰', '仅加热'], answer: 0, explain: '检修安全。' },
  { question: '并网逆变器停电？', options: ['自动停机防孤岛', '继续向网送电', '加速', '仅发光'], answer: 0, explain: '孤岛保护。' },
  { question: '双电源并列危险？', options: ['相序/电压差可能短路', '更安全', '无影响', '仅更亮'], answer: 0, explain: '严禁随意并联。' },
]);

export const QUIZ_PRIORITY = mk([
  { question: '自用自发优先用？', options: ['光伏', '仅柴发', '仅电池卖电', '仅地线'], answer: 0, explain: '减少购电。' },
  { question: '峰时策略？', options: ['储能放电', '仅充电', '仅关机', '仅加热'], answer: 0, explain: '削峰填谷。' },
  { question: 'V2G 指？', options: ['电动车向电网反送', '仅加油', '仅轮胎', '仅雨刷'], answer: 0, explain: 'Vehicle to Grid。' },
  { question: 'EPS 应急电源？', options: ['消防/应急照明专用', '仅空调', '仅装饰', '仅天线'], answer: 0, explain: '法规要求独立回路。' },
  { question: 'SOC 过低应？', options: ['限制负载或充电', '继续全开', '短接', '拆SPD'], answer: 0, explain: '保护电池寿命。' },
]);

export const QUIZ_EMERGENCY = mk([
  { question: '闻到焦味应？', options: ['断电排查', '继续用', '加水', '短接'], answer: 0, explain: '可能过热起火。' },
  { question: '触电急救先？', options: ['切断电源', '直接拉人', '浇水', '继续观察'], answer: 0, explain: '先断电再施救。' },
  { question: '备用手电位置？', options: ['固定易取', '锁柜', '仅手机', '无'], answer: 0, explain: '停电应急。' },
  { question: '冰箱停电？', options: ['少开门保冷', '开门散热', '仅加热', '仅充电'], answer: 0, explain: '保温减少化冻。' },
  { question: '燃气热水器停电？', options: ['注意通风按说明书', '密闭', '仅吹风', '仅照明'], answer: 0, explain: '部分型号需电，注意安全。' },
]);
