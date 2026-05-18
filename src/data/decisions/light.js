export default {
  title: '灯不亮 · 逐步排查',
  icon: '💡',
  color: '#ffab00',
  root: 'l1',
  nodes: {
    l1: { q: '灯具完全不亮？（非闪烁）', yes: 'l2', no: 'l_flicker' },
    l2: { q: '更换新灯泡 / 灯管后是否亮？', yes: 'l_bulb', no: 'l3' },
    l3: { q: '用验电笔检测灯座 L 端有电？', yes: 'l4', no: 'l_switch' },
    l4: { done: true, type: 'warn', t: '灯具电路故障', d: '供电正常但灯不亮，可能是 LED 驱动板或镇流器故障。更换驱动模块或整体换灯。' },
    l_bulb: { done: true, type: 'ok', t: '灯泡寿命到期', d: '更换同规格新灯泡，建议换 LED 灯节能耐用。' },
    l_switch: { q: '开关合上时验电笔在开关出线端有电？', yes: 'l_wire2', no: 'l_sw_fault' },
    l_sw_fault: { done: true, type: 'tip', t: '开关故障', d: '关断回路后更换同型号开关。' },
    l_wire2: { done: true, type: 'warn', t: '开关到灯具线路断路', d: '逐段万用表通断检测，断点多在接线盒接头处。' },
    l_flicker: { q: '是 LED 灯闪烁？', yes: 'l_led', no: 'l_ac_flicker' },
    l_led: { done: true, type: 'tip', t: 'LED 驱动或兼容性问题', d: '检查调光开关兼容性、驱动功率匹配、驱动板老化。' },
    l_ac_flicker: { done: true, type: 'warn', t: '电压波动 / 接触不良', d: '检查灯座接线松动；整楼闪烁联系电力公司。' },
  },
};
