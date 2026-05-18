import Simulator from '../widgets/Simulator';
import scenarios from '../../data/faults/scenarios.json';

const ACC = '#7c4dff';

export default function FaultSim() {
  return (
    <section id="fault-sim" className="sec">
      <Head icon="🔍" title="故障诊断模拟器" tag="FAULT SIMULATOR" sub="根据现象选择原因，即时反馈——训练维修判断力" color={ACC} />
      <div className="grid2">
        <div className="anim-box reveal" style={{ borderColor: 'rgba(124,77,255,.25)', minHeight: 320 }}>
          <Simulator scenarios={scenarios} accent={ACC} />
        </div>
        <div className="info-stack reveal">
          <Card color={ACC} title="训练方法" body="先读症状标签，排除明显错误选项，再选最可能原因。" />
          <Card color="#00e676" title="进度保存" body="正确题数保存在本机 LocalStorage。" />
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
          <h2 className="sh-title" style={{ color }}>{title}</h2>
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
