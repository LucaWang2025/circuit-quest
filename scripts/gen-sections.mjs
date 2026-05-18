import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '../src/components/sections');

const SPECS = [
  { file: 'Microwave', id: 'microwave', icon: '📻', title: '微波炉', tag: 'MICROWAVE · 2kV', sub: '磁控管、高压变压器与门开关联锁', color: '#ff6b35', mode: '微波加热 · 磁控管 2.45GHz' },
  { file: 'Induction', id: 'induction', icon: '🍳', title: '电磁炉', tag: 'INDUCTION COOKER', sub: 'IH 涡流加热、锅具检测与过温保护', color: '#ff9800', mode: 'IH 涡流 · 锅体自身发热' },
  { file: 'Fridge', id: 'fridge', icon: '🧊', title: '冰箱压缩机', tag: 'REFRIGERATOR', sub: '制冷循环、启动电容、PTC 与温控', color: '#00bcd4', mode: '压缩机运转 · 制冷剂循环' },
  { file: 'EScooter', id: 'escooter', icon: '🛴', title: '电动滑板车', tag: 'E-SCOOTER', sub: 'BLDC 轮毂电机、控制器与 BMS', color: '#e040fb', mode: '三电系统 · 电池/电机/电控' },
  { file: 'MeterEntry', id: 'meter-entry', icon: '⚡', title: '入户线与电表', tag: 'SERVICE ENTRY', sub: '家庭电力入口、电表、总开关与接地', color: '#ffab00', mode: '入户 · 电表 · 总开' },
  { file: 'EvCharger', id: 'ev-charger', icon: '🔌', title: '充电桩', tag: 'EV CHARGER 7kW', sub: '7kW/11kW 交流桩接线与漏电保护', color: '#00e676', mode: '专用回路 · 漏电保护' },
  { file: 'Solar', id: 'solar', icon: '☀️', title: '家用光伏', tag: 'SOLAR PV', sub: '组件、逆变器、并网与储能接口', color: '#ffeb3b', mode: '光伏 DC → 逆变 AC' },
  { file: 'Lightning', id: 'lightning', icon: '🌩️', title: '防雷接地', tag: 'LIGHTNING PROTECTION', sub: '避雷针、等电位连接与接地电阻', color: '#64b5f6', mode: '等电位 · 接地网' },
  { file: 'SmartSwitch', id: 'smart-switch', icon: '📱', title: '智能开关', tag: 'SMART SWITCH', sub: '零火线/单火接线、Wi-Fi 与继电器', color: '#9c7dff', mode: '智能控制 · 继电器' },
  { file: 'BatteryTech', id: 'battery-tech', icon: '🔋', title: '锂电池详解', tag: 'LI-ION BATTERY', sub: '三元锂 vs 磷酸铁锂、BMS 保护', color: '#00c853', mode: 'BMS · 充放电保护' },
  { file: 'FastCharge', id: 'fast-charge', icon: '⚡', title: '快充协议', tag: 'PD / QC / UFCS', sub: '握手时序、电压档位与安全', color: '#00c853', mode: 'USB PD 协商' },
  { file: 'EvPower', id: 'ev-power', icon: '🚗', title: '电动汽车三电', tag: 'EV POWERTRAIN', sub: '电池包、驱动电机、电控 VCU/MCU', color: '#00c853', mode: '三电系统架构' },
  { file: 'EnergyStorage', id: 'energy-storage', icon: '🏠', title: '储能与智能电网', tag: 'ENERGY STORAGE', sub: '削峰填谷、户储与 V2G 概念', color: '#00c853', mode: '储能 · 并网调度' },
  { file: 'WireTable', id: 'wire-table', icon: '📋', title: '线径载流量', tag: 'WIRE TABLE', sub: '国标铜线载流量与安全选型', color: '#607d8b', mode: '载流量查表' },
  { file: 'SymbolRef', id: 'symbol-ref', icon: '📐', title: '电气符号', tag: 'SYMBOL REF', sub: '常用符号与实物对照速查', color: '#607d8b', mode: '符号对照' },
  { file: 'PartsRef', id: 'parts-ref', icon: '🧰', title: '元件库速查', tag: 'PARTS REF', sub: '色环电阻、电容标识、接线端子', color: '#607d8b', mode: '元件识别' },
];

const tpl = (s) => `import { useEffect, useRef } from 'react';
import { setupHiDpi } from '../../utils/canvas';

const ACC = '${s.color}';

function AnimCanvas({ modeRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = 480, H = 320;
    const ctx = setupHiDpi(cv, W, H);
    let t = 0, raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.025;
      const label = modeRef?.current || '${s.mode}';
      ctx.fillStyle = ACC + '66'.replace('#',''); 
      ctx.fillStyle = ACC.replace(')', ',0.4)').includes('rgba') ? ACC : (ACC.startsWith('#') ? ACC + '66' : 'rgba(0,200,100,.4)');
      try {
        const hex = ACC;
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        ctx.fillStyle = \`rgba(\${r},\${g},\${b},0.42)\`;
      } catch { ctx.fillStyle = 'rgba(0,200,100,.4)'; }
      ctx.beginPath(); ctx.roundRect(10, 8, W - 20, 28, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, W / 2, 27);
      const cx = W/2, cy = H/2;
      ctx.strokeStyle = ACC; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = (i/6)*Math.PI*2 + t;
        const x = cx + Math.cos(a)*80, y = cy + Math.sin(a)*50;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(200,215,230,.6)'; ctx.font = '11px monospace';
      ctx.fillText('${s.sub}', W/2, H - 12);
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: '100%', maxWidth: 480, flexShrink: 0, display: 'block' }} />;
}

export default function ${s.file}() {
  const modeRef = useRef('${s.mode}');
  return (
    <section id="${s.id}" className="sec">
      <motionDiv className="sh">
        <span className="sh-icon">${s.icon}</span>
        <div>
          <div className="sh-tag">${s.tag}</div>
          <h2 className="sh-title" style={{ color: ACC, textShadow: \`0 0 35px \${ACC}44\` }}>${s.title}</h2>
          <p className="sh-sub">${s.sub}</p>
        </div>
      </div>
      <div className="divider" style={{ background: \`linear-gradient(90deg,transparent,\${ACC},transparent)\` }} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: ACC + '33' }}>
          <AnimCanvas modeRef={modeRef} />
        </div>
        <div className="info-stack reveal">
          <div className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>核心要点</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>${s.sub}</motionDiv>
          </div>
          <motionDiv className="icard" style={{ borderLeftColor: ACC }}>
            <h4 style={{ color: ACC }}>安全提示</h4>
            <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>操作前断电验电，高压部分（如微波炉 2kV）需放电后测量。</motionDiv>
          </motionDiv>
        </motionDiv>
      </motionDiv>
    </section>
  );
}
`;

for (const s of SPECS) {
  let code = tpl(s);
  code = code.replace(/motionDiv/g, 'motionDiv');
  writeFileSync(join(dir, `${s.file}.jsx`), code.replace(/motionDiv/g, 'div'));
  console.log('wrote', s.file);
}
