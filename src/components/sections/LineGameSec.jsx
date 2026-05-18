import LineGame from '../widgets/LineGame';

const ACC = '#7c4dff';

export default function LineGameSec() {
  return (
    <section id="line-game" className="sec">
      <Head icon="🎮" title="电路连线小游戏" tag="LINE GAME" sub="连接电池、电阻、LED 构成闭合回路" color={ACC} />
      <div className="anim-box reveal" style={{ borderColor: 'rgba(124,77,255,.2)', flexDirection: 'column' }}>
        <LineGame accent={ACC} />
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
          <h2 className="sh-title" style={{ color }}>{title}</h2>
          <p className="sh-sub">{sub}</p>
        </div>
      </div>
      <div className="divider" style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
    </>
  );
}
