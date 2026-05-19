/** 宇宙专题共享数据 — 与电路章节同等深度的教学素材 */

export const COSMOS_ACC = '#9c7dff';
export const AU_KM = 149_597_870.7;
export const LY_KM = 9.461e12;
export const C_KM_S = 299_792.458;
export const SOLAR_CONSTANT = 1361; // W/m² 大气层外

export const PLANET_DETAILS = [
  {
    id: 'mercury', name: '水星', en: 'Mercury', type: '类地行星', color: '#9ca3af',
    au: 0.39, radiusKm: 2439, massEarth: 0.055, day: '59 地球日', year: '88 天',
    temp: '−173 ~ 427 °C', moons: 0, density: '5.4 g/cm³',
    fact: '没有大气层，昼夜温差可达 600°C 以上。',
    engineer: '无大气保护，光伏板需耐受极端温差；通信天线需指向地球。',
    circuit: '近太阳辐照强但散热难，电子设备热设计是首要挑战。',
  },
  {
    id: 'venus', name: '金星', en: 'Venus', type: '类地行星', color: '#e8cda0',
    au: 0.72, radiusKm: 6052, massEarth: 0.815, day: '243 地球日（逆向）', year: '225 天',
    temp: '约 465 °C（地表）', moons: 0, density: '5.2 g/cm³',
    fact: '厚厚 CO₂ 大气产生极强温室效应，是太阳系最热行星。',
    engineer: '表面探测器寿命以小时计；轨道器可长期观测但无法着陆采样。',
    circuit: '失控温室的警示：热管理失败时，任何「负载」都会过热停机。',
  },
  {
    id: 'earth', name: '地球', en: 'Earth', type: '类地行星', color: '#4a9eff',
    au: 1, radiusKm: 6371, massEarth: 1, day: '24 小时', year: '365.25 天',
    temp: '平均 15 °C', moons: 1, density: '5.5 g/cm³',
    fact: '已知唯一有稳定液态水与生命的行星，磁场保护大气。',
    engineer: '1 AU 处太阳常数约 1361 W/m²，家用光伏与电网设计以此为基准。',
    circuit: '完整能源链：太阳 → 光伏/风电 → 储能 → 逆变 → 220 V 家庭负载。',
  },
  {
    id: 'mars', name: '火星', en: 'Mars', type: '类地行星', color: '#c1440e',
    au: 1.52, radiusKm: 3390, massEarth: 0.107, day: '24.6 小时', year: '687 天',
    temp: '−153 ~ 20 °C', moons: 2, density: '3.9 g/cm³',
    fact: '奥林帕斯山是太阳系最高火山，高度约 22 km。',
    engineer: '光照约地球的 43%，沙尘可遮挡电池；毅力号等用 RTG+光伏混合。',
    circuit: '地火通信延迟 4–24 分钟，遥控属于「慢回路」控制系统。',
  },
  {
    id: 'jupiter', name: '木星', en: 'Jupiter', type: '气态巨行星', color: '#d4a574',
    au: 5.2, radiusKm: 69911, massEarth: 318, day: '9.9 小时', year: '11.9 年',
    temp: '云顶 −145 °C', moons: 95, density: '1.3 g/cm³',
    fact: '大红斑是持续数百年的巨型风暴，直径可容下地球。',
    engineer: '强辐射带会损坏未屏蔽的电子元件；伽利略、朱诺号需加固设计。',
    circuit: '引力井极深，进入轨道需大 Δv；常用放射性同位素电源（RTG）。',
  },
  {
    id: 'saturn', name: '土星', en: 'Saturn', type: '气态巨行星', color: '#f4d59e',
    au: 9.5, radiusKm: 58232, massEarth: 95, day: '10.7 小时', year: '29.5 年',
    temp: '云顶 −178 °C', moons: 146, density: '0.7 g/cm³',
    fact: '密度比水略小，理论上可「漂浮」在巨型水池中。',
    engineer: '卡西尼号用 RTG 供电；土卫六有浓厚大气，未来任务电源需求大。',
    circuit: '弱光区太阳能效率低，深空任务更依赖携带电源或核能。',
  },
  {
    id: 'uranus', name: '天王星', en: 'Uranus', type: '冰巨星', color: '#7de3f4',
    au: 19.2, radiusKm: 25362, massEarth: 14.5, day: '17.2 小时', year: '84 年',
    temp: '云顶 −224 °C', moons: 28, density: '1.3 g/cm³',
    fact: '自转轴倾角约 98°，像「躺着」绕太阳公转。',
    engineer: '低温削弱电池活性，探测器需保温与加热电路。',
    circuit: '弱光+低温：电源系统要同时解决「发电少」和「电池效率降」。',
  },
  {
    id: 'neptune', name: '海王星', en: 'Neptune', type: '冰巨星', color: '#3b5bdb',
    au: 30.1, radiusKm: 24622, massEarth: 17.1, day: '16.1 小时', year: '165 年',
    temp: '云顶 −214 °C', moons: 16, density: '1.6 g/cm³',
    fact: '风速可达 2,100 km/h，是太阳系风速最快的行星。',
    engineer: '旅行者 2 号是唯一近距离飞掠的探测器，1989 年数据仍珍贵。',
    circuit: '最弱光照区，几乎完全依赖 RTG 或携带储能。',
  },
];

export const STRUCTURE_LAYERS = [
  { id: 'sun', label: '太阳', range: '0 AU', color: '#ffc850', desc: 'G 型主序星，占太阳系质量 99.86%，能源来自核心氢聚变。', bullets: ['核心温度约 1500 万 °C', '光球层可见光辐射', '日冕温度反常高达百万度', '太阳风与磁活动影响空间天气'] },
  { id: 'inner', label: '类地行星区', range: '< 2 AU', color: '#4a9eff', desc: '水星、金星、地球、火星——岩石金属内核，固态表面。', bullets: ['适合着陆与采样', '光伏可利用（火星需更大阵列）', '地球是唯一已知生命家园'] },
  { id: 'belt', label: '小行星带', range: '2.2–3.2 AU', color: '#887766', desc: '数百万碎屑，总质量不及月球，可能是未形成行星的残余。', bullets: ['谷神星是最大天体（矮行星）', '探测器穿越需防微陨石', '资源开采是未来设想'] },
  { id: 'giant', label: '巨行星', range: '5–30 AU', color: '#d4a574', desc: '木星、土星（气态）与天王星、海王星（冰巨星），拥有复杂环与卫星系统。', bullets: ['木星护盾：引力偏转部分小天体', '辐射带威胁未屏蔽电子元件', '土星光环、木星伽利略卫星'] },
  { id: 'kuiper', label: '柯伊伯带', range: '30–50 AU', color: '#6eb5ff', desc: '冥王星等矮行星家园，短周期彗星重要来源。', bullets: ['新视野号 2015 年飞掠冥王星', '冰冷原始物质保存太阳系早期信息', '冥王星为矮行星非行星'] },
  { id: 'oort', label: '奥尔特云', range: '≈2,000–100,000 AU', color: '#9c7dff', desc: '长周期彗星源头，球形壳层，太阳系最外缘结构。', bullets: ['尚未有直接探测', '彗星轨道可深入内太阳系', '尺度上接近星际空间'] },
];

export const SCALE_REFERENCES = [
  { label: '地球直径', km: 12742, au: 0.000085 },
  { label: '地月距离', km: 384400, au: 0.00257 },
  { label: '1 AU', km: AU_KM, au: 1 },
  { label: '冥王星轨道', km: AU_KM * 39.5, au: 39.5 },
  { label: '比邻星', km: LY_KM * 4.24, au: null, ly: 4.24 },
];

export const MARS_DELAY_FACTS = [
  { dist: '最近', au: 0.52, min: 3, note: '冲日附近，适合发射窗口' },
  { dist: '平均', au: 1.52, min: 12.7, note: '日常任务规划常用值' },
  { dist: '最远', au: 2.66, min: 22.3, note: '合日附近，通信最困难' },
];

export const STAR_TYPES = [
  { id: 'm', label: 'M 型红矮星', color: '#ff6b6b', lum: 0.08, hzInner: 0.08, hzOuter: 0.16, life: '数千亿年', example: '比邻星' },
  { id: 'k', label: 'K 型橙矮星', color: '#ffa94d', lum: 0.4, hzInner: 0.4, hzOuter: 0.8, life: '数百亿年', example: '南门二 B' },
  { id: 'g', label: 'G 型黄矮星（类太阳）', color: '#ffd43b', lum: 1, hzInner: 0.95, hzOuter: 1.37, life: '约 100 亿年', example: '太阳' },
  { id: 'f', label: 'F 型黄白星', color: '#e7f5ff', lum: 2.5, hzInner: 1.5, hzOuter: 2.2, life: '数十亿年', example: '织女一' },
  { id: 'a', label: 'A 型白星', color: '#74c0fc', lum: 8, hzInner: 2.7, hzOuter: 3.8, life: '数亿–十亿年', example: '天狼星' },
];

export const HABITABLE_CASES = [
  { id: 'venus', name: '金星', dist: 0.72, verdict: '过热', reason: '温室效应失控，地表约 465°C，无液态水。' },
  { id: 'earth', name: '地球', dist: 1, verdict: '宜居', reason: '适宜距离 + 大气 + 磁场 + 液态水，生命已知唯一家园。' },
  { id: 'mars', name: '火星', dist: 1.52, verdict: '偏冷', reason: '轨道略远且大气稀薄，历史上或曾有液态水。' },
];

export const GRAVITY_BODIES = [
  { id: 'moon', label: '月球', depth: 25, escape: '2.4 km/s', mass: '0.012 M⊕', note: '阿波罗登月，低逃逸利于返回' },
  { id: 'earth', label: '地球', depth: 80, escape: '11.2 km/s', mass: '1 M⊕', note: 'LEO 约 7.9 km/s 即可维持轨道' },
  { id: 'mars', label: '火星', depth: 45, escape: '5.0 km/s', mass: '0.107 M⊕', note: '着陆器需减速，采样返回需二级加速' },
  { id: 'jupiter', label: '木星', depth: 140, escape: '59.5 km/s', mass: '318 M⊕', note: '引力弹弓可加速探测器，但难以着陆' },
];

export const MISSION_TARGETS = [
  { id: 'leo', name: '近地轨道 (LEO)', au: 0.00006, deltaV: '≈ 9.4 km/s（入轨）', delaySec: 0.01, batteryKWh: '0.1–1', powerW: '50–500', note: '国际空间站、星链卫星。通信几乎实时，太阳能充足。' },
  { id: 'moon', name: '月球', au: 0.00257, deltaV: '≈ 6 km/s（地表↔轨道）', delaySec: 1.3, batteryKWh: '5–15', powerW: '100–300', note: '嫦娥、阿波罗。月夜需储能或核电源。' },
  { id: 'mars', name: '火星', au: 1.52, deltaV: '≈ 6–9 km/s', delayMin: 4, delayMax: 24, batteryKWh: '40–80', powerW: '150–300', note: '毅力号、好奇号。沙尘、弱光、长延迟三重挑战。' },
  { id: 'jupiter', name: '木星轨道', au: 5.2, deltaV: '≈ 9+ km/s', delayMin: 33, delayMax: 53, batteryKWh: '100+', powerW: 'RTG 为主', note: '伽利略、朱诺。强辐射，太阳能仅作辅助。' },
];

export const POWER_PRESETS = [
  { id: 'rover', label: '火星漫游车', powerW: 120, batteryWh: 2400, sunH: 4, eff: 75, note: '弱光+沙尘，实际需更大阵列或 RTG' },
  { id: 'station', label: '空间站舱段', powerW: 2000, batteryWh: 8000, sunH: 8, eff: 88, note: '近地轨道日照充足，锂电+太阳能' },
  { id: 'probe', label: '外行星探测器', powerW: 300, batteryWh: 500, sunH: 1.5, eff: 70, note: '主要靠 RTG，太阳能仅补充' },
];

export const SPACE_WEATHER_MODES = {
  calm: { label: '平静', kp: 2, risk: '低', grid: '电网正常运行' },
  storm: { label: '地磁暴', kp: 8, risk: '高', grid: '长导线感应电流 ↑，变压器有过热风险' },
};

export const ENERGY_CHAIN_STEPS = [
  { id: 'fusion', label: '核心聚变', icon: '☉', color: '#ffc850', title: '太阳核心', text: '氢核聚变为氦，E=mc² 释放能量。光子需数万年才能穿出光球层。' },
  { id: 'radiation', label: '电磁辐射', icon: '📡', color: '#ffab00', title: '太阳辐射', text: `抵达地球大气层外约 ${SOLAR_CONSTANT} W/m²（太阳常数）。峰值在可见光波段。` },
  { id: 'pv', label: '光伏效应', icon: '🔆', color: '#4a9eff', title: '光伏组件', text: '光子激发电子-空穴对，PN 结形成直流。单晶硅效率约 20–24%。' },
  { id: 'inv', label: '逆变并网', icon: '〰️', color: '#ffab00', title: '逆变器', text: 'MPPT 追踪最大功率点，逆变输出 220 V / 50 Hz 与电网同相。' },
  { id: 'grid', label: '配电网络', icon: '⚡', color: '#00e676', title: '电网', text: '升压输电、降压配电。变压器、断路器、继电保护构成电力系统。' },
  { id: 'load', label: '家庭负载', icon: '🏠', color: '#e040fb', title: '用电终端', text: '照明、空调、充电等将电能转化为光、热、机械能。P=UI，W=Pt。' },
];

export const COSMOS_LEARNING_PATH = [
  { id: 'voltage', label: '电压', icon: '⚡', desc: '电位差驱动电流' },
  { id: 'power', label: '功率', icon: '💡', desc: 'P=UI 与能量' },
  { id: 'solar', label: '光伏', icon: '☀️', desc: '家用并网系统' },
  { id: 'cosmos-scale', label: '天文尺度', icon: '📏', desc: 'AU / 光年 / 光分' },
  { id: 'cosmos-planets', label: '行星图鉴', icon: '🪐', desc: '八大行星参数' },
  { id: 'cosmos-energy', label: '能源链', icon: '🔗', desc: '太阳到插座' },
  { id: 'solar-system', label: '3D 深空', icon: '🛸', desc: 'SOLARIS 场景' },
];

export const RELATED_BY_SECTION = {
  cosmos: [{ id: 'cosmos-scale', label: '天文尺度' }, { id: 'voltage', label: '电压基础' }],
  'cosmos-scale': [{ id: 'cosmos-mission', label: '任务控制台' }, { id: 'solar', label: '家用光伏' }],
  'cosmos-planets': [{ id: 'solar-system', label: '3D 深空' }, { id: 'cosmos-habitable', label: '宜居带' }],
  'cosmos-structure': [{ id: 'cosmos-space-weather', label: '空间天气' }, { id: 'lightning', label: '防雷接地' }],
  'cosmos-energy': [{ id: 'solar', label: '家用光伏' }, { id: 'home-ckt', label: '家用电路' }],
  'cosmos-power-budget': [{ id: 'battery-tech', label: '锂电池' }, { id: 'energy-storage', label: '储能系统' }],
  'cosmos-habitable': [{ id: 'cosmos-planets', label: '行星图鉴' }, { id: 'aircon', label: '空调与热环境' }],
  'cosmos-gravity': [{ id: 'cosmos-mission', label: '任务控制台' }, { id: 'escooter', label: '电机与驱动' }],
  'cosmos-mission': [{ id: 'cosmos-power-budget', label: '深空供电' }, { id: 'router', label: '弱电通信' }],
  'cosmos-space-weather': [{ id: 'lightning', label: '防雷接地' }, { id: 'safety', label: '安全用电' }],
  'solar-system': [{ id: 'cosmos-planets', label: '行星图鉴' }, { id: 'cosmos-scale', label: '天文尺度' }],
};

export function auToKm(au) { return au * AU_KM; }
export function formatSci(n) {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}×10¹² km`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}×10⁹ km`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}×10⁶ km`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}×10³ km`;
  return `${Math.round(n)} km`;
}
export function lightTravelMinutes(au) { return (au * AU_KM) / C_KM_S / 60; }
export function lightTravelSeconds(au) { return (au * AU_KM) / C_KM_S; }

const mkQuiz = (items) => items;

export const QUIZ_COSMOS = mkQuiz([
  { question: '1 AU（天文单位）大约等于多少？', options: ['地球到月球距离', '地球到太阳平均距离', '太阳直径', '光速 1 秒行程'], answer: 1, explain: '1 AU ≈ 1.496×10⁸ km，定义为地球与太阳的平均距离。' },
  { question: '「光年」是什么物理量？', options: ['时间', '距离', '速度', '亮度'], answer: 1, explain: '光年是光在真空中一年走的距离，约 9.46×10¹² km。' },
  { question: '太阳系中质量最大的天体是？', options: ['木星', '土星', '太阳', '地球'], answer: 2, explain: '太阳占太阳系总质量约 99.86%。' },
  { question: '宇宙专题与电路章节的衔接点是？', options: ['仅 3D 观赏', '太阳能源 → 光伏 → 电网用电', '只学行星名称', '与电工无关'], answer: 1, explain: '从太阳辐射理解家用光伏、储能与深空供电预算。' },
  { question: '比邻星距离我们大约？', options: ['1 AU', '4.24 光年', '1 光分', '100 AU'], answer: 1, explain: '比邻星是最近的恒星，约 4.24 ly，用 AU 表示极不方便。' },
]);

export const QUIZ_SCALE = mkQuiz([
  { question: '海王星距离太阳大约多少 AU？', options: ['1.5', '5.2', '19', '30'], answer: 3, explain: '海王星轨道约 30 AU。' },
  { question: '光从太阳到地球大约需要多久？', options: ['8.3 分钟', '1 秒', '1 小时', '1 天'], answer: 0, explain: '1 AU 上光速传播约 499 秒 ≈ 8 分 20 秒。' },
  { question: '用 AU 描述恒星际距离是否合适？', options: ['非常合适', '太小不便，常用光年', '只能用 km', '与电路无关'], answer: 1, explain: '恒星距我们数以光年计。' },
  { question: '对数距离尺主要用于？', options: ['精确测绘', '同屏展示跨度极大的轨道', '计算电阻', '测量电流'], answer: 1, explain: '外行星轨道间距差异巨大，线性尺难以同屏展示。' },
  { question: '地月距离大约是多少 AU？', options: ['0.0026', '1', '0.5', '30'], answer: 0, explain: '约 38.4 万 km ≈ 0.00257 AU。' },
]);

export const QUIZ_PLANETS = mkQuiz([
  { question: '哪颗行星自转轴「躺着」公转？', options: ['火星', '天王星', '金星', '水星'], answer: 1, explain: '天王星自转轴倾角约 98°。' },
  { question: '太阳系中最大的行星是？', options: ['土星', '木星', '海王星', '地球'], answer: 1, explain: '木星质量约为其他七大行星总和的 2.5 倍。' },
  { question: '哪颗类地行星有浓厚温室效应？', options: ['火星', '水星', '金星', '地球'], answer: 2, explain: '金星 CO₂ 大气导致失控温室效应。' },
  { question: '火星表面光照强度大约比地球？', options: ['更强', '更弱约 40–50%', '相同', '为零'], answer: 1, explain: '更远距离 + 大气尘埃削弱辐照。' },
  { question: '气态巨行星主要包括？', options: ['水星、金星', '木星、土星', '天王星、水星', '地球、火星'], answer: 1, explain: '木星与土星为气态巨行星；天王星、海王星常称冰巨星。' },
]);

export const QUIZ_STRUCTURE = mkQuiz([
  { question: '小行星带位于哪两颗行星之间？', options: ['地球与火星', '火星与木星', '木星与土星', '土星与天王星'], answer: 1, explain: '约 2.2–3.2 AU。' },
  { question: '长周期彗星主要来自？', options: ['小行星带', '柯伊伯带', '奥尔特云', '月球'], answer: 2, explain: '奥尔特云在太阳系远端。' },
  { question: '冥王星现被归类为？', options: ['行星', '矮行星', '卫星', '小行星'], answer: 1, explain: '2006 年 IAU 新定义。' },
  { question: '木星对地球的意义之一是？', options: ['提供光照', '引力偏转部分小天体', '产生电网', '无意义'], answer: 1, explain: '「木星护盾」假说认为其引力可偏转威胁天体。' },
  { question: '柯伊伯带大约从多少 AU 开始？', options: ['1', '30', '100', '1000'], answer: 1, explain: '约 30 AU 以远，至 50 AU 左右。' },
]);

export const QUIZ_ENERGY = mkQuiz([
  { question: '家用并网光伏的核心器件之一？', options: ['变压器', '逆变器', '继电器', '示波器'], answer: 1, explain: '逆变器将直流变为与电网同步的交流。' },
  { question: '太阳光子首先被光伏组件转化为什么？', options: ['热能', '直流电能', '交流电能', '磁场'], answer: 1, explain: '光伏效应在 PN 结产生直流。' },
  { question: '阴雨天发电下降主要是因为？', options: ['电压升高', '辐照度降低', '电阻变小', '频率变化'], answer: 1, explain: '光照减弱导致光生电流下降。' },
  { question: '太阳常数约指？', options: ['太阳质量', '地球大气层外辐照度', '插座电压', '电池容量'], answer: 1, explain: `约 ${SOLAR_CONSTANT} W/m²。` },
  { question: 'MPPT 的作用是？', options: ['测量温度', '追踪最大功率点', '接地保护', '防雷'], answer: 1, explain: '使光伏阵列工作在最大功率点附近。' },
]);

export const QUIZ_POWER = mkQuiz([
  { question: '深空探测器常用 RTG 主要利用？', options: ['风力', '放射性衰变热', '化学燃烧', '水力'], answer: 1, explain: '热电转换供电，适合弱光环境。' },
  { question: '增大电池容量（Wh）对续航的影响？', options: ['缩短', '延长', '无影响', '只影响电压'], answer: 1, explain: '续航 ≈ Wh ÷ 平均 W（简化）。' },
  { question: '火星光照比地球？', options: ['更强', '更弱', '相同', '为零'], answer: 1, explain: '更远 + 尘埃削弱。' },
  { question: '功率预算公式 P 与 W 的关系？', options: ['W=P/t', 'W=P×t', 'W=P²', '无关'], answer: 1, explain: '能量 Wh = 功率 W × 时间 h。' },
  { question: '月夜月球车需要？', options: ['更大逆变器', '储能或核电源', '避雷针', '升压至 10kV'], answer: 1, explain: '无日照时段需电池或 RTG 维持。' },
]);

export const QUIZ_HABITABLE = mkQuiz([
  { question: '太阳系宜居带大致范围（AU）？', options: ['0–0.5', '约 0.9–1.5', '5–10', '30 以外'], answer: 1, explain: '类太阳恒星宜居带约 0.95–1.37 AU。' },
  { question: '金星过热的主要原因是？', options: ['离太阳太远', '失控温室效应', '没有磁场', '自转太快'], answer: 1, explain: 'CO₂ 大气锁住热量。' },
  { question: '宜居带内行星可能存在？', options: ['只有固态铁', '液态水（条件合适时）', '永远无大气', '恒定 0°C'], answer: 1, explain: '液态水是生命候选关键条件。' },
  { question: '比邻星是哪种类型？', options: ['A 型', 'G 型', 'M 型红矮星', '中子星'], answer: 2, explain: '最近的恒星，M 型矮星。' },
  { question: '火星相对宜居带？', options: ['过热', '偏冷边缘', '在中心', '在恒星内部'], answer: 1, explain: '轨道略远且大气稀薄。' },
]);

export const QUIZ_GRAVITY = mkQuiz([
  { question: '引力井越深代表逃逸所需？', options: ['速度越小', '速度越大', '无关', '只与颜色有关'], answer: 1, explain: '需要更大动能摆脱势阱。' },
  { question: '从低轨道到更高轨道，航天器通常？', options: ['减速', '加速', '关机即可', '只改颜色'], answer: 1, explain: '加速提升轨道能量。' },
  { question: '木星引力井比地球？', options: ['浅', '深得多', '一样', '不存在'], answer: 1, explain: '质量巨大，逃逸速度约 59.5 km/s。' },
  { question: '多级火箭的主要目的是？', options: ['美观', '逐级克服引力井', '增加重量', '降低电压'], answer: 1, explain: '每级燃料耗尽后抛弃，提高有效载荷比。' },
  { question: 'LEO 轨道速度约？', options: ['7.9 km/s', '0.1 km/s', '光速', '11.2 km/s'], answer: 0, explain: '第一宇宙速度，维持近地轨道。' },
]);

export const QUIZ_MISSION = mkQuiz([
  { question: '火星车指令延迟可达约？', options: ['毫秒级', '分钟级', '百年', '零延迟'], answer: 1, explain: '光速有限，地火距离变化导致数分钟延迟。' },
  { question: '设计深空电源首先要估算？', options: ['颜色', '平均功耗与日照/储能', '屏幕分辨率', '键盘布局'], answer: 1, explain: '功率预算 = 负载 W × 时间。' },
  { question: '近地轨道卫星通信延迟通常？', options: ['< 1 秒', '约 1 小时', '约 1 天', '约 1 年'], answer: 0, explain: '距离短，无线电波传播延迟极低。' },
  { question: '霍曼转移轨道用于？', options: ['防雷', '省燃料地火转移', '测量电阻', '并网'], answer: 1, explain: '两圆轨道间能量最优转移方式之一。' },
  { question: '深空「慢回路」指？', options: ['交流变直流', '发出指令后需等待往返光时', '电池充电', '接地'], answer: 1, explain: '无法实时遥控，需预先编程或等待确认。' },
]);

export const QUIZ_SPACE_WEATHER = mkQuiz([
  { question: '太阳风暴可能干扰？', options: ['仅水下', '电网与卫星通信', '只有植物', '无关'], answer: 1, explain: '带电粒子与地磁扰动可感应地电流。' },
  { question: '防雷接地的主要目的？', options: ['增加电费', '导走异常电荷保护设备', '提高网速', '加热'], answer: 1, explain: '将雷电流或感应电流导入大地。' },
  { question: '地磁暴期间宜？', options: ['拆除接地', '关注预警、检查防雷', '湿手拔插头', '关闭所有学习'], answer: 1, explain: '极端空间天气可威胁电网。' },
  { question: '1859 年卡林顿事件说明？', options: ['太阳活动可影响地面电报', '与电磁无关', '仅影响月球', '现代不会发生'], answer: 0, explain: '历史上最强地磁暴之一，电报线产生火花。' },
  { question: 'SPD 安装在配电箱是为？', options: ['装饰', '泄放浪涌保护后端设备', '升压', '测光速'], answer: 1, explain: 'MOV/GDT 在过电压时导通泄流。' },
]);
