/** 三相与工业用电专题 */

export const IND_ACC = '#ff9800';

export const IND_LEARNING_PATH = [
  { id: 'ac-dc', label: '交直流', icon: '〰️' },
  { id: 'industrial-phase', label: '三相基础', icon: '🔺' },
  { id: 'industrial-wiring', label: '星三角', icon: '△' },
  { id: 'industrial-motor', label: '电机启动', icon: '🌀' },
  { id: 'transformer', label: '变压器', icon: '🔄' },
];

export const HUB_LINKS = [
  { id: 'industrial-phase', icon: '🔺', title: '三相基础', en: '3-PHASE', color: '#ff9800', desc: '三相向量、120° 相位、线电压/相电压' },
  { id: 'industrial-wiring', icon: '△', title: '星形与三角', en: 'Y/Δ', color: '#ffc107', desc: 'Y 接、Δ 接、工业配电常见接法' },
  { id: 'industrial-motor', icon: '🌀', title: '电机启动', en: 'MOTOR', color: '#ff6b35', desc: '直接启动、星三角降压、软启动示意' },
  { id: 'industrial-compare', icon: '⚖️', title: '家用 vs 工业', en: 'COMPARE', color: '#00bcd4', desc: '220V 单相与 380V 三相对比' },
];

export const RELATED_BY_SECTION = {
  industrial: [{ id: 'industrial-phase', label: '三相基础' }, { id: 'ac-dc', label: '交直流' }],
  'industrial-phase': [{ id: 'industrial-wiring', label: '星三角' }, { id: 'power', label: '功率' }],
  'industrial-wiring': [{ id: 'industrial-motor', label: '电机启动' }, { id: 'transformer', label: '变压器' }],
  'industrial-motor': [{ id: 'bldc-fan', label: '无刷电机' }, { id: 'escooter', label: '滑板车三电' }],
  'industrial-compare': [{ id: 'home-ckt', label: '家用电路' }, { id: 'meter-entry', label: '入户电表' }],
};

const mk = (items) => items;

export const QUIZ_HUB = mk([
  { question: '中国低压工业配电常见线电压是？', options: ['110V', '220V', '380V', '1000V'], answer: 2, explain: '三相四线制线电压约 380V，相电压约 220V。' },
  { question: '三相系统相邻相位差为？', options: ['60°', '90°', '120°', '180°'], answer: 2, explain: '对称三相彼此相差 120°。' },
  { question: '家用插座通常属于？', options: ['三相三线', '单相', '直流高压', '仅相线'], answer: 1, explain: '家庭为单相 220V（火+零）。' },
  { question: '星形接法线电压 U_L 与相电压 U_P 关系？', options: ['U_L=U_P', 'U_L=√3·U_P', 'U_L=3U_P', '无关'], answer: 1, explain: 'U_L = √3 × U_P。' },
  { question: '大功率电机常用降压启动是为？', options: ['提高转速', '减小启动电流冲击', '增加功率因数', '防雷'], answer: 1, explain: '降低启动瞬间电流与机械冲击。' },
]);

export const QUIZ_PHASE = mk([
  { question: '三相平衡时中性线电流？', options: ['很大', '理论上为零', '等于相电流3倍', '不定'], answer: 1, explain: '对称负载下三相电流矢量和为零。' },
  { question: '旋转磁场由什么产生？', options: ['单相交流', '对称三相交流', '直流', '电阻'], answer: 1, explain: '三相绕组空间差 120° 产生旋转磁场。' },
  { question: '线电压 380V 时相电压约？', options: ['110V', '220V', '380V', '660V'], answer: 1, explain: '380/√3 ≈ 220V。' },
  { question: '工业用电功率 P（三相）常用公式？', options: ['P=UI', 'P=√3·U_L·I_L·cosφ', 'P=I²R only', 'P=U/R'], answer: 1, explain: '三相功率需乘 √3 与功率因数。' },
  { question: '缺相运行对电机的影响？', options: ['更安全', '可能过热烧毁', '无影响', '仅发光'], answer: 1, explain: '缺相会导致转矩异常、电流过大。' },
]);

export const QUIZ_WIRING = mk([
  { question: '电机额定 380V 三角形接法用于？', options: ['超低电压', '额定线电压运行', '仅加热', '直流'], answer: 1, explain: 'Δ 接每相承受线电压。' },
  { question: '星形接法启动时常用于？', options: ['提高线电压', '降压启动（星三角）', '增大功率', '接地'], answer: 1, explain: '启动 Y 接降低相电压，运行切 Δ。' },
  { question: '三相四线可提供的电压有？', options: ['仅380V', '380V 与 220V', '仅12V', '仅直流'], answer: 1, explain: '线间 380V，相与零线 220V。' },
  { question: 'Δ 接无中性线时？', options: ['不能接负载', '仅三相负载', '必须接零', '电压为零'], answer: 1, explain: '三角形接法用于三相平衡负载。' },
  { question: '接错相序可能导致？', options: ['电机反转', '电压升高', '仅更亮', '无影响'], answer: 0, explain: '相序反了旋转磁场反向。' },
]);

export const QUIZ_MOTOR = mk([
  { question: '直接启动适用？', options: ['超大电机', '小功率电机', '仅直流', '仅加热管'], answer: 1, explain: '大功率直接启动电流过大。' },
  { question: '软启动器主要调节？', options: ['电压上升率', '颜色', '频率固定为0', '仅接地'], answer: 0, explain: '通过控制导通角平滑升压。' },
  { question: '热继电器保护？', options: ['短路瞬间', '过载长时间', '仅防雷', '仅漏电'], answer: 1, explain: '过载发热弯曲触发断开。' },
  { question: '变频器改变？', options: ['仅颜色', '供电频率与电压', '仅电阻', '地线'], answer: 1, explain: '变频调速改变定子磁场转速。' },
  { question: '接触器主触点断开？', options: ['控制小信号', '主电路通断', '仅显示', '测温'], answer: 1, explain: '接触器用于主回路频繁通断。' },
]);

export const QUIZ_COMPARE = mk([
  { question: '家庭进户多为？', options: ['10kV', '单相 220V', '380V 三相专用', '仅直流'], answer: 1, explain: '居民一般为单相 220V。' },
  { question: '工厂车间动力多为？', options: ['12V', '三相 380V', '仅电池', '110V 单相'], answer: 1, explain: '动力设备常用三相交流。' },
  { question: '触电危险与什么关系最大？', options: ['颜色', '通过人体的电流', '包装', '品牌'], answer: 1, explain: '电流才是伤害关键。' },
  { question: '工业配电需额外关注？', options: ['功率因数与保护配合', '仅外观', '仅WiFi', '仅亮度'], answer: 0, explain: '大负载涉及无功、谐波与选择性。' },
  { question: '380V 线电压高于 220V 意味着？', options: ['一定更安全', '触电风险更高需规范操作', '无电', '直流'], answer: 1, explain: '更高电压需更严安全规程。' },
]);
