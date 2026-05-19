/** 完整充电链路专题 */

export const EV_ACC = '#00e676';

export const EV_LEARNING_PATH = [
  { id: 'power', label: '功率', icon: '💡' },
  { id: 'evchain-ac', label: '交流慢充', icon: '🔌' },
  { id: 'evchain-dc', label: '直流快充', icon: '⚡' },
  { id: 'evchain-bms', label: 'BMS', icon: '🔋' },
  { id: 'battery-tech', label: '锂电池', icon: '📦' },
];

export const HUB_LINKS = [
  { id: 'evchain-ac', icon: '🔌', title: '交流慢充', en: 'AC', color: '#00e676', desc: '电网→桩→车载 OBC→电池' },
  { id: 'evchain-dc', icon: '⚡', title: '直流快充', en: 'DC', color: '#00e676', desc: '桩内 AC/DC→BMS 握手→电芯' },
  { id: 'evchain-bms', icon: '🔋', title: 'BMS 状态', en: 'BMS', color: '#00c853', desc: '预充、恒流、恒压、满充截止' },
  { id: 'evchain-cable', icon: '🔗', title: '线缆与协议', en: 'CABLE', color: '#69f0ae', desc: 'CP/PP、CC、PD 与枪线规格' },
];

export const BMS_STAGES = [
  { id: 'idle', label: '待机', color: '#889' },
  { id: 'handshake', label: '握手', color: '#00bcd4' },
  { id: 'precharge', label: '预充', color: '#ffab00' },
  { id: 'cc', label: '恒流 CC', color: '#00e676' },
  { id: 'cv', label: '恒压 CV', color: '#00e676' },
  { id: 'full', label: '满充', color: '#4caf50' },
];

export const RELATED_BY_SECTION = {
  evchain: [{ id: 'evchain-ac', label: '交流慢充' }, { id: 'ev-charger', label: '充电桩' }],
  'evchain-ac': [{ id: 'evchain-bms', label: 'BMS' }, { id: 'home-ckt', label: '家用电路' }],
  'evchain-dc': [{ id: 'fast-charge', label: '快充协议' }, { id: 'evchain-bms', label: 'BMS' }],
  'evchain-bms': [{ id: 'battery-tech', label: '锂电池' }, { id: 'ev-power', label: '汽车三电' }],
  'evchain-cable': [{ id: 'fast-charge', label: '快充协议' }, { id: 'safety', label: '安全用电' }],
};

const mk = (items) => items;

export const QUIZ_HUB = mk([
  { question: '家用交流慢充最终给电池充电的模块在？', options: ['充电桩内', '车载 OBC', '轮胎', '雨刷'], answer: 1, explain: '交流桩输出 AC，车载充电机 OBC 整流降压。' },
  { question: '直流快充电流主要在哪段路径？', options: ['仅车内 12V', '桩→车直流母线→电池', '仅天线', '仅空调'], answer: 1, explain: 'DC 桩直接对接高压电池系统（经 BMS）。' },
  { question: 'BMS 全称？', options: ['电池管理系统', '车身管理系统', '制动系统', '蓝牙模块'], answer: 0, explain: 'Battery Management System。' },
  { question: '充电枪 CP 信号用于？', options: ['配色', '通信与控制导引', '加热', 'GPS'], answer: 1, explain: 'Control Pilot 表示连接与允许充电状态。' },
  { question: '恒压阶段电流趋势？', options: ['越来越大', '逐渐减小', '恒定不变', '为零'], answer: 1, explain: 'CV 阶段接近满充，电流 taper 下降。' },
]);

export const QUIZ_AC = mk([
  { question: '7kW 交流桩约等于？', options: ['32A×220V 单相', '12V 充电', '仅直流', '1A'], answer: 0, explain: '7kW≈32A×220V（简化）。' },
  { question: '漏电保护在充电链路中？', options: ['不需要', '桩/配电侧必要', '仅装饰', '仅电池内'], answer: 1, explain: '户外潮湿环境必须漏电保护。' },
  { question: 'OBC 主要功能？', options: ['转向', 'AC 转 DC 并调压', '制冷剂', '雨刮'], answer: 1, explain: 'On-Board Charger 车载充电机。' },
  { question: '充电功率 P 估算？', options: ['P=U×I', 'P=仅电压', 'P=电阻色环', 'P=频率'], answer: 0, explain: '单相近似 P=U×I×cosφ。' },
  { question: '延长线乱接可能导致？', options: ['更快', '过热起火', '更冷', '无影响'], answer: 1, explain: '线径不足会过温。' },
]);

export const QUIZ_DC = mk([
  { question: '直流快充电压常见范围？', options: ['1.5V', '200–1000V 级', '仅 12V', '0V'], answer: 1, explain: '高压平台提升充电功率。' },
  { question: '快充功率 P 与电流关系？', options: ['P=U×I', 'P=仅 I', 'P=仅颜色', '无关'], answer: 0, explain: '功率=电压×电流（简化）。' },
  { question: '热管理在快充中？', options: ['不重要', '关键（液冷枪/电池冷却）', '仅外观', '仅声音'], answer: 1, explain: '大电流产生大量热。' },
  { question: 'SOC 80% 后常降功率因为？', options: ['电池保护 taper', '桩坏了', '无电', '仅显示'], answer: 0, explain: 'CV 阶段 BMS 限制电流保护电芯。' },
  { question: '非国标枪头混用？', options: ['安全', '可能损坏设备', '更快', '推荐'], answer: 1, explain: '须匹配标准与 BMS 协议。' },
]);

export const QUIZ_BMS = mk([
  { question: '预充电阻作用？', options: ['装饰', '限制浪涌电流', '加热', '发光'], answer: 1, explain: '防止上电瞬间大电流冲击。' },
  { question: '过充保护由谁执行？', options: ['BMS', '雨刷', '喇叭', '大灯'], answer: 0, explain: 'BMS 监测单体电压与温度。' },
  { question: '电芯温差过大应？', options: ['继续大电流充', '降功率或停止', '忽略', '加水'], answer: 1, explain: '热失控风险需降流。' },
  { question: '绝缘监测意义？', options: ['美观', '检测高压漏电', '仅速度', '仅 GPS'], answer: 1, explain: '高压系统对地绝缘。' },
  { question: '均衡充电用于？', options: ['统一单体电压', '喷漆', '轮胎', '空调'], answer: 0, explain: '被动/主动均衡消除不一致。' },
]);

export const QUIZ_CABLE = mk([
  { question: 'Type2/CCS 属于？', options: ['充电接口标准', '电阻型号', '焊锡', '地砖'], answer: 0, explain: '不同地区接口标准不同。' },
  { question: '枪线过细会导致？', options: ['更凉', '发热', '更安全', '无电流'], answer: 1, explain: 'I²R 发热。' },
  { question: 'PD 协议常见于？', options: ['手机 USB-C', '仅路灯', '仅地线', '仅避雷'], answer: 0, explain: 'Power Delivery USB 快充。' },
  { question: '充电中拔枪应先？', options: ['直接拔', '桩/车端停止充电', '浇水', '加速'], answer: 1, explain: '带载拔枪可能拉弧。' },
  { question: 'CP 电压变化表示？', options: ['状态机切换', '颜色', '风速', '温度显示'], answer: 0, explain: '不同占空比/电压对应允许电流。' },
]);
