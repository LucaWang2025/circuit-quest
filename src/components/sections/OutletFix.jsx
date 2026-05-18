import DecisionTree from '../widgets/DecisionTree';
import outletTree from '../../data/decisions/outlet';

const ACC = '#00bcd4';

export default function OutletFix() {
  return (
    <section id="outlet-fix" className="sec">
      <SecHead icon="🔌" title="插座没电排查" tag="OUTLET FIX · 决策树" sub="单孔/区域/零线断——按步骤缩小故障范围" color={ACC} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(0,188,212,.2)', minHeight: 320 }}>
          <DecisionTree tree={outletTree} />
        </div>
        <div className="info-stack reveal">
          <TipCard color={ACC} title="📟 测量步骤" items={['验电笔测 L 孔应有亮', '万用表 AC 档 L-N 约 220V', '通断档查零线是否断路']} />
          <TipCard color={ACC} title="🔧 常见修复" items={['紧固蓝色零线端子', '更换烧蚀插座面板', '复位跳闸的回路断路器']} />
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
