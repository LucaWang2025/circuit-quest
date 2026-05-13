const DONE = [
  { id: 'voltage',         icon: '⚡', label: '电压 Voltage' },
  { id: 'current',         icon: '〜', label: '电流 Current' },
  { id: 'resistance',      icon: 'Ω',  label: '电阻 Resistance' },
  { id: 'multimeter',      icon: '📟', label: '万用表 Multimeter' },
  { id: 'power',           icon: '💡', label: '功率与电能 Power' },
  { id: 'capacitor',       icon: '⚙️', label: '电容 Capacitor' },
  { id: 'inductor',        icon: '🌀', label: '电感 Inductor' },
  { id: 'diode',           icon: '▷',  label: '二极管 Diode' },
  { id: 'transistor',      icon: '🔺', label: '三极管 Transistor' },
  { id: 'transformer',     icon: '🔄', label: '变压器 Transformer' },
  { id: 'schematic',       icon: '📐', label: '如何读电路图 Schematics' },
  { id: 'home-ckt',        icon: '🏠', label: '家用电路 Home Circuit' },
  { id: 'wiring',          icon: '🔌', label: '导线接线 Wiring' },
  { id: 'outlet',          icon: '🔧', label: '开关插座 Switch & Outlet' },
  { id: 'break-panel',     icon: '🗂️', label: '配电箱 Panel Board' },
  { id: 'aircon',          icon: '❄️', label: '空调线路 Air Con' },
  { id: 'low-voltage',     icon: '📶', label: '弱电系统 Low Voltage' },
  { id: 'floor-heat',      icon: '🌡️', label: '地暖浴霸 Floor Heat' },
  { id: 'safety',          icon: '🛡️', label: '安全用电 Safety' },
  { id: 'troubleshoot',    icon: '🔍', label: '故障排查 Troubleshoot' },
  { id: 'bldc-fan',        icon: '🌀', label: '无刷电机 BLDC Fan' },
  { id: 'flashlight',      icon: '🔦', label: '手电筒 Flashlight' },
  { id: 'desk-lamp',       icon: '🪔', label: '台灯 Desk Lamp' },
  { id: 'kettle',          icon: '☕', label: '热水壶 Kettle' },
  { id: 'hair-dryer',      icon: '💨', label: '电吹风 Hair Dryer' },
  { id: 'power-bank',      icon: '🔋', label: '充电宝 Power Bank' },
  { id: 'router',          icon: '📡', label: 'WiFi路由器 Router' },
  { id: 'rice-cooker',     icon: '🍚', label: '电饭锅 Rice Cooker' },
  { id: 'washing-machine', icon: '🫧', label: '洗衣机 Washing Machine' },
  { id: 'bt-speaker',      icon: '🔊', label: '蓝牙音箱 BT Speaker' },
  { id: 'wireless-charge', icon: '📳', label: '无线充电 Wireless Charge' },
  { id: 'e-toothbrush',    icon: '🪥', label: '电动牙刷 E-Toothbrush' },
  { id: 'robot-vacuum',    icon: '🤖', label: '扫地机器人 Robot Vacuum' },
  { id: 'soldering',       icon: '🔩', label: '焊接技术 Soldering' },
  { id: 'oscilloscope',    icon: '📊', label: '示波器 Oscilloscope' },
  { id: 'breadboard',      icon: '🧩', label: '面包板 Breadboard' },
  { id: 'pcb',             icon: '🖥️', label: 'PCB设计 PCB Design' },
  { id: 'arduino',         icon: '⚡', label: 'Arduino入门 Arduino' },
];

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      textAlign: 'center', padding: '64px 24px 80px',
      color: 'var(--dim)', fontSize: 13,
      borderTop: '1px solid rgba(0,229,255,.07)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ font: '11px "Courier New",monospace', color: 'rgba(96,122,144,.55)', letterSpacing: 3, marginBottom: 18 }}>
          ✅ 已完成章节 ({DONE.length})
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
          {DONE.map(d => (
            <button key={d.id} onClick={() => onNavigate && onNavigate(d.id)} style={{
              padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
              border: '1px solid rgba(0,229,255,.22)',
              background: 'rgba(0,229,255,.06)',
              font: '12px "Courier New",monospace', color: '#607a90',
              transition: 'all .22s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,.5)'; e.currentTarget.style.color = 'var(--blue)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,.22)'; e.currentTarget.style.color = '#607a90'; }}
            >{d.icon} {d.label}</button>
          ))}
        </div>

        <p style={{ color: 'rgba(96,122,144,.35)', font: '11px "Courier New",monospace', letterSpacing: 2 }}>
          ⚡ ElecEngineer · 电力工程师培养门户 v3.0 · 四阶段 · {DONE.length} 章节
        </p>
      </div>
    </footer>
  );
}
