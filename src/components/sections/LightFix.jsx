import DecisionTree from '../widgets/DecisionTree';
import lightTree from '../../data/decisions/light';

const ACC = '#ffab00';

export default function LightFix() {
  return (
    <section id="light-fix" className="sec">
      <SecHead icon="💡" title="灯不亮排查" tag="LIGHT TROUBLESHOOT · 决策树" sub="从灯泡到开关到线路——交互式逐步定位故障点" color={ACC} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,171,0,.2)', minHeight: 320 }}>
          <DecisionTree tree={lightTree} />
        </div>
        <div className="info-stack reveal">
          <TipCard color={ACC} title="⚡ 操作前必做" items={['关闭对应回路断路器', '验电笔确认无电', 'LED 灯先断电 5 分钟等电容放电']} />
          <TipCard color={ACC} title="🔧 常用工具" items={['验电笔', '万用表（电压/通断档）', '螺丝刀', '备用灯泡/驱动']} />
          <TipCard color="#00e676" title="✅ 安全提示" items={['禁止带电操作接线', '金属梯架注意绝缘', '不确定时联系持证电工']} />
        </div>
      </div>
    </section>
  );
}

function SecHead({ icon, title, tag, sub, color }) {
  return (
    <>
      <div className="sh">
        <span className="sh-icon">{icon}</span>
        <div>
          <div className="sh-tag">{tag}</div>
          <h2 className="sh-title" style={{ color, textShadow: `0 0 35px ${color}55` }}>{title}</h2>
          <p className="sh-sub">{sub}</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
    </>
  );
}

function TipCard({ color, title, items }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      {items.map(s => (
        <div key={s} style={{ fontSize: 13, color: '#aabfc8', marginBottom: 6, display: 'flex', gap: 8 }}>
          <span style={{ color }}>▸</span>{s}
        </div>
      ))}
    </div>
  );
}
