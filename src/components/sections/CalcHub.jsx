import Calculator from '../widgets/Calculator';

const ACC = '#7c4dff';

export default function CalcHub() {
  return (
    <section id="calc-hub" className="sec">
      <Head icon="🧮" title="电学计算器集" tag="CALCULATOR HUB" sub="欧姆定律、功率、电费、并联电阻——实用工具集" color={ACC} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(124,77,255,.25)', minHeight: 280 }}>
          <Calculator accent={ACC} />
        </div>
        <div className="info-stack reveal">
          <Card color={ACC} title="适用场景" body="现场估算负载电流、选断路器、算电费、并联等效电阻。" />
          <Card color={ACC} title="使用提示" body="欧姆定律填两空算第三；电费默认 0.56 元/度。" />
        </div>
      </div>
    </section>
  );
}

function Head({ icon, title, tag, sub, color }) {
  return (
    <>
      <div className="sh">
        <span className="sh-icon">{icon}</span>
        <div>
          <div className="sh-tag">{tag}</div>
          <h2 className="sh-title" style={{ color, textShadow: `0 0 35px ${color}44` }}>{title}</h2>
          <p className="sh-sub">{sub}</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
    </>
  );
}

function Card({ color, title, body }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{body}</div>
    </div>
  );
}
