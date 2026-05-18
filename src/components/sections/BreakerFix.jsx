import DecisionTree from '../widgets/DecisionTree';
import breakerTree from '../../data/decisions/breaker';

const ACC = '#ff6b35';

export default function BreakerFix() {
  return (
    <section id="breaker-fix" className="sec">
      <SecHead icon="⚡" title="跳闸复位不上" tag="BREAKER TRIP · 决策树" sub="区分漏电、过载、短路——找到原因再合闸" color={ACC} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(255,107,53,.2)', minHeight: 320 }}>
          <DecisionTree tree={breakerTree} />
        </div>
        <div className="info-stack reveal">
          <TipCard color={ACC} title="⚠️ 禁止行为" items={['用铜丝代替保险丝', '跳闸后强行反复合闸', '未找原因就换更大断路器']} />
          <TipCard color="#00e676" title="✅ 正确流程" items={['先拔负载再复位', '仍跳→查短路', '合闸后逐插设备找漏电源']} />
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
        <div><div className="sh-tag">{tag}</div>
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
