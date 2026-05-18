export default {
  title: '跳闸复位不上 · 逐步排查',
  icon: '⚡',
  color: '#ff6b35',
  root: 'b1',
  nodes: {
    b1: { q: '是否只有某一个回路断路器跳闸？', yes: 'b2', no: 'b6' },
    b2: { q: '复位断路器后是否立即再次跳闸？', yes: 'b3', no: 'b5' },
    b3: { q: '拔掉该回路所有设备插头后是否还跳？', yes: 'b4', no: 'b_overload' },
    b4: { done: true, type: 'warn', t: '线路短路', d: '关总闸，万用表排查绝缘故障，严重时重新布线。' },
    b5: { done: true, type: 'ok', t: '偶发过载', d: '检查回路总功率，减少同时用电或更换大额定断路器。' },
    b6: { q: '总漏电断路器跳闸，按复位键是否能合上？', yes: 'b7', no: 'b8' },
    b7: { done: true, type: 'ok', t: '偶发漏电触发', d: '逐一拔插头找到漏电设备检修。' },
    b8: { done: true, type: 'warn', t: '持续漏电故障', d: '逐路关分支断路器定位故障回路，用兆欧表测绝缘。' },
    b_overload: { done: true, type: 'tip', t: '设备过载', d: '总功率÷220V 超断路器额定 80% 需减载或换大断路器。' },
  },
};
