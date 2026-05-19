/** 配电箱全景专题 */

export const PANEL_ACC = '#26a69a';

export const PANEL_LEARNING_PATH = [
  { id: 'home-ckt', label: '家用电路', icon: '🏠' },
  { id: 'panel-anatomy', label: '箱内结构', icon: '🗂️' },
  { id: 'panel-breaker-sim', label: '空开跳闸', icon: '⚡' },
  { id: 'panel-rcd-sim', label: '漏电保护', icon: '🛡️' },
  { id: 'lightning', label: '防雷接地', icon: '🌩️' },
];

export const HUB_LINKS = [
  { id: 'panel-anatomy', icon: '🗂️', title: '箱内结构', en: 'ANATOMY', color: '#26a69a', desc: '总开、分路、零排、地排剖面' },
  { id: 'panel-breaker-sim', icon: '⚡', title: '空开跳闸', en: 'BREAKER', color: '#ff6b35', desc: '过载/短路/漏电分支模拟' },
  { id: 'panel-rcd-sim', icon: '🛡️', title: '漏电保护', en: 'RCD', color: '#00e676', desc: '30mA 人体保护原理' },
  { id: 'panel-spd-sim', icon: '🌩️', title: '浪涌保护', en: 'SPD', color: '#7c4dff', desc: 'MOV 泄流与分级安装' },
];

export const PANEL_LAYERS = [
  { id: 'main', label: '总断路器', color: '#ff6b35', desc: '进户总开关，过载与短路保护整宅。' },
  { id: 'rcd', label: '漏电保护器', color: '#00e676', desc: '检测火零电流差，≥30mA 跳闸。' },
  { id: 'branch', label: '分路空开', color: '#ffab00', desc: '照明、插座、空调、厨房等大回路独立保护。' },
  { id: 'neutral', label: '零线排', color: '#00bcd4', desc: '零线汇流，勿与地线混接。' },
  { id: 'ground', label: '地线排', color: '#4caf50', desc: '保护接地汇流，接建筑接地体。' },
  { id: 'spd', label: 'SPD 浪涌', color: '#7c4dff', desc: '雷电/操作过电压泄放入地。' },
];

export const RELATED_BY_SECTION = {
  'panel-hub': [{ id: 'panel-anatomy', label: '箱内结构' }, { id: 'break-panel', label: '配电箱详解' }],
  'panel-anatomy': [{ id: 'panel-breaker-sim', label: '空开模拟' }, { id: 'wiring', label: '导线接线' }],
  'panel-breaker-sim': [{ id: 'breaker-fix', label: '跳闸排查' }, { id: 'panel-rcd-sim', label: '漏电保护' }],
  'panel-rcd-sim': [{ id: 'safety', label: '安全用电' }, { id: 'ground-neutral', label: '接地零线' }],
  'panel-spd-sim': [{ id: 'lightning', label: '防雷接地' }, { id: 'cosmos-space-weather', label: '空间天气' }],
};

const mk = (items) => items;

export const QUIZ_HUB = mk([
  { question: '家用配电箱首要保护？', options: ['仅美观', '过载/短路/漏电', '仅颜色', '仅网速'], answer: 1, explain: '断路器+漏电保护器组合。' },
  { question: '地线与零线？', options: ['可随意互接', '功能不同不可混接', '相同', '仅直流用'], answer: 1, explain: '零线工作回路，地线保护。' },
  { question: '30mA 漏电保护针对？', options: ['人体触电风险', '灯泡亮度', '仅三相', '仅12V'], answer: 0, explain: '剩余电流动作保护。' },
  { question: 'SPD 安装位置常在？', options: ['总配电箱', '仅灯泡内', '仅手机', '仅天线'], answer: 0, explain: '入户端泄放浪涌。' },
  { question: '空调回路应？', options: ['与插座混用一线', '独立回路与合适空开', '无保护', '仅地线'], answer: 1, explain: '大电流负载需独立保护。' },
]);

export const QUIZ_ANATOMY = mk(QUIZ_HUB);
export const QUIZ_BREAKER = mk([
  { question: '短路跳闸特征？', options: ['瞬间大电流', '缓慢发热', '无电流', '仅发光'], answer: 0, explain: '磁脱扣或快速动作。' },
  { question: '过载跳闸？', options: ['瞬间', '持续过流发热后', '永不', '仅夜间'], answer: 1, explain: '热脱扣需要一定时间。' },
  { question: '空开额定电流应？', options: ['越大越好', '匹配导线与负载', '越小越好', '随意'], answer: 1, explain: '选择性保护配合。' },
  { question: '1.5² 铜线常见载流约？', options: ['100A', '约 15A', '0A', '1000A'], answer: 1, explain: '需查表，照明回路常用。' },
  { question: '跳闸后应？', options: ['立即合闸不管', '查明原因再合闸', '短接', '拆地线'], answer: 1, explain: '短路未排除合闸危险。' },
]);

export const QUIZ_RCD = mk([
  { question: '漏电保护检测？', options: ['电压大小', '进出电流差', '颜色', '重量'], answer: 1, explain: '剩余电流。' },
  { question: '湿手触电更危险因为？', options: ['电阻降低', '更安全', '无影响', '仅直流'], answer: 0, explain: '人体电阻下降电流更大。' },
  { question: '插座回路建议？', options: ['带漏电保护', '无保护', '仅保险丝', '仅地线'], answer: 0, explain: '潮湿场所尤其需要。' },
  { question: '零线断开会？', options: ['部分设备外壳带电', '更安全', '无影响', '仅更亮'], answer: 0, explain: '危险故障模式。' },
  { question: '测试漏电保护器？', options: ['按 Test 按钮', '短接火线地线', '湿手摸', '不用测'], answer: 0, explain: '定期测试功能。' },
]);

export const QUIZ_SPD = mk([
  { question: 'MOV 在 SPD 中？', options: ['过压导通泄流', '仅发光', '仅测温度', '仅滤波'], answer: 0, explain: '压敏电阻。' },
  { question: 'SPD 失效指示？', options: ['窗口变红/报警', '更快', '无', '仅声音'], answer: 0, explain: '需更换模块。' },
  { question: '感应雷过电压？', options: ['可损坏芯片', '仅植物', '无关', '仅直流'], answer: 0, explain: '弱电也需保护。' },
  { question: '分级 SPD 目的？', options: ['逐级泄放能量', '装饰', '仅颜色', '仅三相'], answer: 0, explain: '总箱+分配箱+末端。' },
  { question: '接地不良 SPD？', options: ['无法正常泄流', '更好', '无影响', '仅更亮'], answer: 0, explain: '接地是泄流路径。' },
]);
