const DONE = [
  { id: 'voltage',    icon: '⚡', label: '电压 Voltage' },
  { id: 'current',    icon: '〜', label: '电流 Current' },
  { id: 'resistance', icon: 'Ω',  label: '电阻 Resistance' },
  { id: 'multimeter', icon: '📟', label: '万用表 Multimeter' },
  { id: 'power',      icon: '💡', label: '功率与电能 Power' },
  { id: 'home-ckt',   icon: '🏠', label: '家用电路 Home Circuit' },
  { id: 'capacitor',    icon: '⚡', label: '电容 Capacitor' },
  { id: 'transformer',  icon: '🔄', label: '变压器 Transformer' },
  { id: 'wiring',       icon: '🔌', label: '导线接线 Wiring' },
  { id: 'outlet',       icon: '🔧', label: '开关插座 Switch & Outlet' },
  { id: 'safety',       icon: '🛡️', label: '安全用电 Safety' },
  { id: 'troubleshoot', icon: '🔍', label: '故障排查 Troubleshoot' },
  { id: 'bldc-fan',   icon: '🌀', label: '无刷电机风扇 BLDC Fan' },
  { id: 'flashlight', icon: '🔦', label: '手电筒电路 Flashlight' },
  { id: 'desk-lamp',  icon: '🪔', label: '台灯电路 Desk Lamp' },
  { id: 'kettle',     icon: '☕', label: '热水壶电路 Kettle' },
  { id: 'hair-dryer', icon: '💨', label: '电吹风电路 Hair Dryer' },
  { id: 'power-bank', icon: '🔋', label: '充电宝电路 Power Bank' },
  { id: 'router',     icon: '📡', label: 'WiFi路由器 Router' },
];

const COMING = [
  // 基础知识
  '电感 Inductor', '二极管 Diode', '三极管 Transistor', '逻辑门 Logic Gates',
  // 家用电路
  '弱电布线 Structured Cabling', '光伏发电 Solar PV', '智能家居布线',
  // 小电器电路
  'LED 灯具驱动电路', 'USB 充电器电路拆解', '继电器控制电路',
  '步进电机驱动', '温控电路设计', 'Arduino 入门实战',
  '示波器 Oscilloscope', '焊接技术 Soldering',
];

const goTo = id =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center', padding: '64px 24px 80px',
      color: 'var(--dim)', fontSize: 13,
      borderTop: '1px solid rgba(0,229,255,.07)',
      position: 'relative', zIndex: 1,
    }}>
      {/* Completed modules */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ font: '11px "Courier New",monospace', color: 'rgba(96,122,144,.55)', letterSpacing: 3, marginBottom: 18 }}>
          ✅ 已完成章节
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
          {DONE.map(d => (
            <button key={d.id} onClick={() => goTo(d.id)} style={{
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

        {/* Coming soon */}
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔭</div>
        <h3 style={{ fontSize: 20, color: 'var(--white)', margin: '0 0 8px' }}>更多知识模块，持续上线中</h3>
        <p style={{ maxWidth: 420, margin: '8px auto 22px', fontSize: 13.5, lineHeight: 1.7 }}>
          本门户目标是系统培养家庭电力维修工程师所需的全部知识，从基础概念到实操技能，逐步完善。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, maxWidth: 720, margin: '0 auto 36px' }}>
          {COMING.map(t => (
            <span key={t} style={{
              padding: '5px 14px', borderRadius: 20,
              border: '1px solid rgba(255,255,255,.07)',
              font: '11.5px "Courier New",monospace', color: '#3d5060',
              cursor: 'default',
            }}>{t}</span>
          ))}
        </div>

        <p style={{ color: 'rgba(96,122,144,.35)', font: '11px "Courier New",monospace', letterSpacing: 2 }}>
          ⚡ ElecEngineer · 电力工程师培养门户 v2.0
        </p>
      </div>
    </footer>
  );
}
