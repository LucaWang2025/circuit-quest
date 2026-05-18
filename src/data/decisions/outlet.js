export default {
  title: '插座没电 · 逐步排查',
  icon: '🔌',
  color: '#00bcd4',
  root: 'o1',
  nodes: {
    o1: { q: '是单个插座没电还是多个插座都没电？', yes: 'o2', no: 'o5' },
    o2: { q: '用验电笔检测：插座完全无电？', yes: 'o3', no: 'o_partial' },
    o3: { q: '对应回路断路器是否跳闸？', yes: 'o4', no: 'o_wire' },
    o4: { done: true, type: 'tip', t: '回路断路器跳闸', d: '复位断路器即可。若反复跳，参照跳闸排查流程。' },
    o5: { q: '是否为某一区域所有插座同时没电？', yes: 'o6', no: 'o7' },
    o6: { done: true, type: 'warn', t: '区域回路断电', d: '查配电箱对应回路断路器；未跳闸则查线路断点。' },
    o7: { done: true, type: 'warn', t: '多点分散断电', d: '检查配电箱接线端子松动、烧痕。' },
    o_partial: { q: '验电笔在 L 孔亮但插入设备无反应？', yes: 'o_n', no: 'o_face' },
    o_n: { done: true, type: 'warn', t: '零线断路', d: '关断回路，检查零线（蓝）端子松动氧化。' },
    o_face: { done: true, type: 'tip', t: '插座面板故障', d: '更换新插座，同型号替换。' },
    o_wire: { done: true, type: 'warn', t: '接线断路', d: '万用表通断档从插座到接线盒逐段排查。' },
  },
};
