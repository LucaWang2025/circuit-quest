import { useState } from 'react';

const ACC = '#ff6b35';

// ── Decision Tree Data ────────────────────────────────────
// Each node: { id, q, yes?, no?, tip?, done? }
const TREES = {
  breaker: {
    title: '断路器跳闸 / 总闸断电',
    icon: '⚡',
    color: '#ffab00',
    root: 'b1',
    nodes: {
      b1: { q: '是否只有某一个回路断路器跳闸？', yes: 'b2', no: 'b6' },
      b2: { q: '复位断路器后是否立即再次跳闸？', yes: 'b3', no: 'b5' },
      b3: { q: '拔掉该回路所有设备插头后是否还跳？', yes: 'b4', no: 'b_overload' },
      b4: { done: true, type: 'warn', t: '线路短路', d: '线路本身存在短路（导线破损、接线盒内导线接触）。需关闭总闸，用万用表通断档排查线路绝缘故障，严重时需重新布线。' },
      b5: { done: true, type: 'ok', t: '偶发过载', d: '可能是设备启动瞬间电流过大（如压缩机、电机）。检查该回路设备总功率是否超标，考虑更换大一档断路器（如 16A→20A）或减少同时使用设备。' },
      b6: { q: '总漏电断路器跳闸，按复位键是否能合上？', yes: 'b7', no: 'b8' },
      b7: { done: true, type: 'ok', t: '偶发漏电触发', d: '某设备或线路产生了短暂漏电电流。逐一拔出各回路设备，合上后再一一插回，找到触发漏电的设备进行检修或更换。' },
      b8: { done: true, type: 'warn', t: '持续漏电故障', d: '存在持续性漏电。逐一关闭各分支断路器，每关一路后尝试合上总闸，找到故障回路后进一步用兆欧表检测绝缘电阻。' },
      b_overload: { done: true, type: 'tip', t: '设备过载', d: '该回路用电设备总功率超过断路器额定值。计算总功率（各设备 W 相加 ÷ 220V = 电流），若超过断路器额定电流 80%，需减少设备或更换大额定断路器。' },
    },
  },
  outlet: {
    title: '插座没电 / 部分插座不通电',
    icon: '🔌',
    color: '#00bcd4',
    root: 'o1',
    nodes: {
      o1: { q: '是单个插座没电还是多个插座都没电？', yes: 'o2', no: 'o5' },
      o2: { q: '用验电笔检测：插座完全无电？', yes: 'o3', no: 'o_partial' },
      o3: { q: '对应回路断路器是否跳闸？', yes: 'o4', no: 'o_wire' },
      o4: { done: true, type: 'tip', t: '回路断路器跳闸', d: '复位断路器即可恢复。若反复跳，参照"断路器跳闸"诊断流程排查根本原因。' },
      o5: { q: '是否为某一区域（如同一房间）所有插座同时没电？', yes: 'o6', no: 'o7' },
      o6: { done: true, type: 'warn', t: '区域回路断电', d: '查看配电箱，该区域对应回路断路器是否跳闸。如未跳闸则线路可能有断点，用万用表检测线路导通性。' },
      o7: { done: true, type: 'warn', t: '多点分散断电', d: '可能是总线问题或多处接头松动。关闭总闸后，检查配电箱内各接线端子是否有松动、烧痕，逐一排查。' },
      o_partial: { q: '验电笔在 L 孔亮但插入设备无反应？', yes: 'o_n', no: 'o_face' },
      o_n: { done: true, type: 'warn', t: '零线断路', d: '零线接触不良。关断该回路，取下插座检查零线（蓝色）接线端子是否松动或氧化，重新紧固。' },
      o_face: { done: true, type: 'tip', t: '插座面板故障', d: '插座内部弹片磨损或烧坏。关断回路后更换新插座（参考"开关插座安装"章节），同型号替换即可。' },
      o_wire: { done: true, type: 'warn', t: '接线断路', d: '断路器正常但线路断路。关断总闸，用万用表通断档从插座到接线盒逐段排查断点，通常发生在接头处。' },
    },
  },
  light: {
    title: '灯具问题（不亮 / 闪烁 / 频繁烧灯）',
    icon: '💡',
    color: '#ffab00',
    root: 'l1',
    nodes: {
      l1: { q: '灯具完全不亮？（非闪烁）', yes: 'l2', no: 'l_flicker' },
      l2: { q: '更换新灯泡 / 灯管后是否亮？', yes: 'l_bulb', no: 'l3' },
      l3: { q: '用验电笔检测灯座 L 端有电？', yes: 'l4', no: 'l_switch' },
      l4: { done: true, type: 'warn', t: '灯具电路故障', d: '供电正常但灯不亮，可能是灯具驱动板损坏（LED 灯）或镇流器故障（荧光灯）。更换对应驱动模块或整体更换灯具。' },
      l_bulb: { done: true, type: 'ok', t: '灯泡寿命到期', d: '正常损耗，更换同规格新灯泡即可。建议换成 LED 灯，寿命是白炽灯的 15 倍，节能 80%。' },
      l_switch: { q: '开关合上时验电笔在开关出线端有电？', yes: 'l_wire2', no: 'l_sw_fault' },
      l_sw_fault: { done: true, type: 'tip', t: '开关故障', d: '开关内部触点不通。关断回路后更换同型号开关，操作参考"开关插座安装"章节。' },
      l_wire2: { done: true, type: 'warn', t: '开关到灯具线路断路', d: '开关到灯头之间有断点。逐段用万用表检测，断点通常在接线盒内的接头处，重新接线即可。' },
      l_flicker: { q: '是 LED 灯闪烁？', yes: 'l_led', no: 'l_ac_flicker' },
      l_led: { done: true, type: 'tip', t: 'LED 驱动或兼容性问题', d: '① 检查是否使用了调光开关（普通 LED 不兼容调光器）；② 灯的额定功率与驱动不匹配；③ 驱动板老化，更换同功率 LED 驱动模块即可。' },
      l_ac_flicker: { done: true, type: 'warn', t: '电压波动 / 接触不良', d: '检查灯座和接线端子是否松动氧化（常见于老式螺口灯座）；若整栋楼都闪烁则是供电质量问题，联系电力公司。' },
    },
  },
  appliance: {
    title: '家电突然不工作',
    icon: '🔧',
    color: '#00e676',
    root: 'a1',
    nodes: {
      a1: { q: '设备插入其他已确认有电的插座是否工作？', yes: 'a_outlet', no: 'a2' },
      a2: { q: '设备自身是否有独立保险丝（如洗衣机、微波炉）？', yes: 'a_fuse', no: 'a3' },
      a3: { q: '设备通电后是否有任何反应（指示灯、声音）？', yes: 'a4', no: 'a_pwr' },
      a4: { q: '是否出现报错代码或异常声音？', yes: 'a_code', no: 'a5' },
      a5: { done: true, type: 'tip', t: '功能性故障', d: '供电和基本电路正常，但某功能模块失效（如压缩机、电机、控制板）。查阅设备说明书故障代码，或联系品牌售后检修。' },
      a_outlet: { done: true, type: 'ok', t: '原插座故障', d: '原插座问题，更换插座即可（参考"开关插座安装"章节）。同时确认该回路断路器状态。' },
      a_fuse: { done: true, type: 'tip', t: '检查设备内部保险丝', d: '关机断电，找到设备背面或底部的保险丝盒，用万用表通断档检测，断路则更换同规格保险丝（注意电流值和尺寸）。' },
      a_pwr: { done: true, type: 'warn', t: '电源板故障', d: '设备内部开关电源损坏。常见于电容鼓包、整流桥断路。有电子基础可自行更换元件，否则送修。操作前务必放掉滤波电容存储的高压！' },
      a_code: { done: true, type: 'tip', t: '参照错误代码排查', d: '扫描设备铭牌二维码或搜索"品牌+型号+错误代码"，厂家通常有对应排查步骤。常见如空调 E1=传感器故障，可自行更换。' },
    },
  },
};

const TYPE_COLORS = { ok: '#00e676', warn: '#ffab00', tip: '#00bcd4' };
const TYPE_LABELS = { ok: '✅ 已确认', warn: '⚠️ 需进一步检修', tip: '💡 处理建议' };

function DecisionTree({ treeKey }) {
  const tree = TREES[treeKey];
  const [path, setPath] = useState([tree.root]);
  const [answers, setAnswers] = useState({});

  const currentId = path[path.length - 1];
  const node = tree.nodes[currentId];

  function answer(yes) {
    setAnswers(prev => ({ ...prev, [currentId]: yes }));
    const next = yes ? node.yes : node.no;
    if (next) setPath(prev => [...prev, next]);
  }

  function reset() { setPath([tree.root]); setAnswers({}); }
  function back() { if (path.length > 1) { setPath(prev => prev.slice(0, -1)); setAnswers(prev => { const n = { ...prev }; delete n[path[path.length - 2]]; return n; }); } }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Progress path */}
      {path.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {path.slice(0, -1).map((id, i) => {
            const n = tree.nodes[id];
            const ans = answers[id];
            return (
              <div key={id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--dim)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'rgba(255,255,255,.05)', borderRadius: 6, padding: '3px 8px' }}>
                  {n.q?.slice(0, 20)}…
                </div>
                <div style={{ fontSize: 11, color: ans ? '#00e676' : '#ff5252', font: 'bold 11px monospace' }}>{ans ? '是' : '否'}</div>
                {i < path.length - 2 && <span style={{ color: 'var(--dim)' }}>→</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Current node */}
      {node.done ? (
        <div style={{
          background: `rgba(${TYPE_COLORS[node.type] === '#00e676' ? '0,230,118' : node.type === 'warn' ? '255,171,0' : '0,188,212'},.08)`,
          border: `1px solid ${TYPE_COLORS[node.type]}44`,
          borderLeft: `4px solid ${TYPE_COLORS[node.type]}`,
          borderRadius: 14, padding: '20px 22px',
        }}>
          <div style={{ fontWeight: 700, color: TYPE_COLORS[node.type], marginBottom: 8, fontSize: 15 }}>
            {TYPE_LABELS[node.type]} — {node.t}
          </div>
          <div style={{ fontSize: 14, color: '#c8dce8', lineHeight: 1.8 }}>{node.d}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={back} style={{
              padding: '7px 18px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
              color: 'var(--dim)', font: '13px inherit', transition: 'all .18s',
            }}>← 上一步</button>
            <button onClick={reset} style={{
              padding: '7px 18px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${tree.color}44`, background: `${tree.color}18`,
              color: tree.color, font: '13px inherit', transition: 'all .18s',
            }}>重新开始 ↺</button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(6,12,28,.7)', border: `1px solid ${tree.color}28`, borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', marginBottom: 10 }}>
            第 {path.length} 步诊断
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)', lineHeight: 1.6, marginBottom: 18 }}>
            {node.q}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => answer(true)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
              border: '1px solid rgba(0,230,118,.4)', background: 'rgba(0,230,118,.1)',
              color: '#00e676', font: 'bold 14px inherit', transition: 'all .2s',
            }}>✓ 是</button>
            <button onClick={() => answer(false)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
              border: '1px solid rgba(255,82,82,.4)', background: 'rgba(255,82,82,.1)',
              color: '#ff5252', font: 'bold 14px inherit', transition: 'all .2s',
            }}>✗ 否</button>
          </div>
          {path.length > 1 && (
            <button onClick={back} style={{
              marginTop: 10, padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid rgba(255,255,255,.1)', background: 'transparent',
              color: 'var(--dim)', font: '12px inherit', transition: 'all .18s',
            }}>← 返回上一步</button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Common tools ──────────────────────────────────────────
const TOOLS = [
  { icon: '⚡', t: '验电笔', d: '第一步永远是验电，确认有无电压' },
  { icon: '📟', t: '万用表', d: '测电压、通断、电阻，排查断点必备' },
  { icon: '🔦', t: '手电筒', d: '配电箱区域光线差，确保操作可视' },
  { icon: '🔩', t: '绝缘螺丝刀', d: '拆插座、接线盒，拧紧接线端子' },
  { icon: '📱', t: '手机拍照', d: '拆前先拍接线照片，防止接错线' },
  { icon: '📋', t: '回路图纸', d: '有配电箱标注图则排查效率倍增' },
];

const SAFETY_FIRST = [
  '所有操作前关断对应断路器，用验电笔确认无电',
  '不确定时关总闸，宁可断电全屋也不带电操作',
  '发现导线烧痕、焦味，立即断电，不得继续送电',
  '单独操作时旁边放手机，随时可拨打 120 急救',
];

export default function Troubleshoot() {
  const [activeTree, setActiveTree] = useState('breaker');

  return (
    <section id="troubleshoot" className="sec">
      <div className="sh">
        <span className="sh-icon">🔍</span>
        <div className="sh-tag">Stage 3 · Hands-on · Fault Diagnosis</div>
        <h2 className="sh-title" style={{ color: ACC, textShadow: `0 0 35px rgba(255,107,53,.4)` }}>
          家用故障排查全流程
        </h2>
        <p className="sh-sub">通过交互式决策树，一步步诊断断路器跳闸、插座没电、灯具故障、家电罢工四大家庭电气常见问题。</p>
        <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
      </div>

      {/* Safety banner */}
      <div style={{ marginBottom: 36, background: 'rgba(255,23,68,.08)', border: '1px solid rgba(255,23,68,.28)', borderRadius: 14, padding: '14px 22px' }}>
        <div style={{ fontWeight: 700, color: '#ff1744', marginBottom: 10 }}>🛡️ 操作前：安全第一</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
          {SAFETY_FIRST.map(t => (
            <div key={t} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8aacb8', lineHeight: 1.55 }}>
              <span style={{ color: '#ff1744', flexShrink: 0 }}>▸</span>{t}
            </div>
          ))}
        </div>
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        {Object.entries(TREES).map(([key, tree]) => (
          <button key={key} onClick={() => setActiveTree(key)} style={{
            padding: '14px 10px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
            border: `1px solid ${activeTree === key ? tree.color : `${tree.color}30`}`,
            background: activeTree === key ? `${tree.color}18` : 'rgba(6,12,28,.5)',
            color: activeTree === key ? tree.color : 'var(--dim)',
            font: 'inherit', transition: 'all .22s',
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{tree.icon}</div>
            <div style={{ fontSize: 13, fontWeight: activeTree === key ? 700 : 400, lineHeight: 1.4 }}>{tree.title}</div>
          </button>
        ))}
      </div>

      {/* Decision tree */}
      <div className="grid2">
        <div className="reveal">
          <div style={{ font: '11px "Courier New",monospace', color: TREES[activeTree].color, letterSpacing: 2, marginBottom: 16 }}>
            {TREES[activeTree].icon} {TREES[activeTree].title}
          </div>
          <DecisionTree key={activeTree} treeKey={activeTree} />
        </div>

        {/* Tools + tips */}
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ font: '11px "Courier New",monospace', color: 'var(--dim)', letterSpacing: 2, textAlign: 'center' }}>
            🧰 排查必备工具
          </div>
          {TOOLS.map(tool => (
            <div key={tool.t} className="glass" style={{ borderColor: 'rgba(255,107,53,.12)', display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{tool.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: ACC, fontSize: 13.5 }}>{tool.t}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8' }}>{tool.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* When to call professional */}
      <div style={{ marginTop: 44, background: 'rgba(156,125,255,.07)', border: '1px solid rgba(156,125,255,.22)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, color: '#9c7dff', marginBottom: 14, fontSize: 15 }}>📞 什么情况下必须找专业电工？</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {[
            { icon: '🔥', t: '线路有烧焦痕迹或异味', d: '可能已发生碳化导电，存在火灾隐患，需更换整段导线' },
            { icon: '💧', t: '潮湿或进水的电气设备', d: '绝缘失效风险极高，干燥处理不到位会反复漏电' },
            { icon: '🏗️', t: '需要重新穿线或改线路', d: '涉及墙体开槽，需遵守施工规范，个人操作风险大' },
            { icon: '⚡', t: '涉及三相 380V 或总进线', d: '高压大电流，超出家用维修范畴，需持证电工操作' },
            { icon: '🛡️', t: '兆欧表检测绝缘不合格', d: '绝缘电阻 < 0.5MΩ 属于危险状态，整体排查重布线' },
            { icon: '❓', t: '不确定故障原因', d: '宁可多花钱请专业人员，也不要带着疑问操作带电线路' },
          ].map(item => (
            <div key={item.t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: '#9c7dff', fontSize: 13, marginBottom: 3 }}>{item.t}</div>
                <div style={{ fontSize: 12.5, color: '#8aacb8', lineHeight: 1.55 }}>{item.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
