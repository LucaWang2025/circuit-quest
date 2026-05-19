/** 示波器实验室专题 */

export const SCOPE_ACC = '#00e5ff';

export const SCOPE_LEARNING_PATH = [
  { id: 'ac-dc', label: '交直流', icon: '〰️' },
  { id: 'scope-lab-wave', label: '波形', icon: '📈' },
  { id: 'scope-lab-measure', label: '测量', icon: '📏' },
  { id: 'scope-lab-rc', label: 'RC/RL', icon: '⚙️' },
  { id: 'oscilloscope', label: '示波器章', icon: '📊' },
];

export const HUB_LINKS = [
  { id: 'scope-lab-wave', icon: '📈', title: '波形基础', en: 'WAVE', color: '#00e5ff', desc: '正弦/方波/三角、时基' },
  { id: 'scope-lab-measure', icon: '📏', title: '周期与幅值', en: 'MEASURE', color: '#00e676', desc: 'Vpp、周期 T、频率 f' },
  { id: 'scope-lab-rc', icon: '⚙️', title: 'RC/RL 响应', en: 'RC/RL', color: '#ffab00', desc: '充电曲线、时间常数 τ' },
  { id: 'scope-lab-trigger', icon: '🎯', title: '触发稳定', en: 'TRIGGER', color: '#9c7dff', desc: '边沿触发、波形冻结' },
];

export const WAVE_TYPES = [
  { id: 'sine', label: '正弦', f: 50 },
  { id: 'square', label: '方波', f: 1e3 },
  { id: 'triangle', label: '三角', f: 500 },
];

export const RELATED_BY_SECTION = {
  'scope-lab': [{ id: 'scope-lab-wave', label: '波形' }, { id: 'oscilloscope', label: '示波器使用' }],
  'scope-lab-wave': [{ id: 'ac-dc', label: '交直流' }, { id: 'scope-lab-measure', label: '测量' }],
  'scope-lab-measure': [{ id: 'scope-lab-rc', label: 'RC/RL' }, { id: 'power', label: '功率' }],
  'scope-lab-rc': [{ id: 'capacitor', label: '电容' }, { id: 'inductor', label: '电感' }],
  'scope-lab-trigger': [{ id: 'oscilloscope', label: '示波器章' }, { id: 'scope-lab-wave', label: '波形' }],
};

const mk = (items) => items;

export const QUIZ_HUB = mk([
  { question: '示波器 X 轴通常表示？', options: ['时间', '电阻', '功率', '温度'], answer: 0, explain: '时基 ms/div。' },
  { question: 'V/div 调节？', options: ['垂直灵敏度', '仅颜色', '仅触发', '仅地线'], answer: 0, explain: '每格电压。' },
  { question: '50Hz 周期 T？', options: ['20ms', '1s', '0', '50ms'], answer: 0, explain: 'T=1/f=1/50=20ms。' },
  { question: '触发作用？', options: ['稳定显示波形', '加热', '仅接地', '仅充电'], answer: 0, explain: '同步扫描起点。' },
  { question: '探头 10× 意义？', options: ['衰减10倍扩大量程', '放大10倍', '仅颜色', '仅直流'], answer: 0, explain: '高阻抗测量。' },
]);

export const QUIZ_WAVE = QUIZ_HUB;
export const QUIZ_MEASURE = mk([
  { question: '频率 f=1/T，T=10ms 则 f？', options: ['100Hz', '10Hz', '1kHz', '0'], answer: 0, explain: 'f=1/0.01=100Hz。' },
  { question: 'Vpp 指？', options: ['峰峰值', '平均功率', '电阻', '相位'], answer: 0, explain: '最大值减最小值。' },
  { question: '220Vrms 正弦 Vpp 约？', options: ['622V', '220V', '110V', '0'], answer: 0, explain: 'Vpp=2√2×Vrms≈622V。' },
  { question: '占空比用于？', options: ['方波/PWM', '仅直流', '仅电阻', '仅接地'], answer: 0, explain: '高电平时间比例。' },
  { question: '纹波测量常用？', options: ['AC 耦合+适当时基', '仅目视', '仅万用表电阻档', '仅通断'], answer: 0, explain: '电源质量分析。' },
]);

export const QUIZ_RC = mk([
  { question: 'RC 时间常数 τ？', options: ['R×C', 'R/C', 'R+C', '仅 R'], answer: 0, explain: 'τ=RC。' },
  { question: '充电至 63% 需时间？', options: ['1τ', '0τ', '10τ', '瞬间'], answer: 0, explain: '指数曲线特征。' },
  { question: '电容滤波作用？', options: ['平滑脉动', '放大', '仅发热', '仅防雷'], answer: 0, explain: '储能平滑。' },
  { question: '电感阻碍？', options: ['电流变化', '电压不变', '仅直流', '仅颜色'], answer: 0, explain: '感抗与频率相关。' },
  { question: '示波器看充电曲线？', options: ['DC 耦合+ms 时基', '仅电阻档', '仅通断', '仅听声音'], answer: 0, explain: '观察指数上升。' },
]);

export const QUIZ_TRIGGER = mk([
  { question: '上升沿触发适合？', options: ['方波同步', '仅直流', '仅电阻', '仅温度'], answer: 0, explain: '在上升沿开始扫描。' },
  { question: '波形滚动不稳因？', options: ['未触发或触发不当', '必然正常', '仅探头', '仅地线'], answer: 0, explain: '调整触发电平。' },
  { question: '单次触发用于？', options: ['捕获瞬态', '仅加热', '仅充电', '仅防雷'], answer: 0, explain: '抓取毛刺。' },
  { question: '触发电平设太高？', options: ['可能抓不到波形', '更好', '无影响', '仅更亮'], answer: 0, explain: '需在信号范围内。' },
  { question: '双通道示波器可？', options: ['比较两路信号', '仅一路', '仅接地', '仅颜色'], answer: 0, explain: '相位/时序分析。' },
]);
