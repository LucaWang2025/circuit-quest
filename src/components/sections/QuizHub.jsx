import Quiz from '../Quiz';
import questions from '../../data/quiz/general.json';

const ACC = '#7c4dff';

export default function QuizHub() {
  return (
    <section id="quiz-hub" className="sec">
      <Head icon="📝" title="知识小测验" tag="QUIZ HUB" sub="综合测验巩固基础，错题查看解析" color={ACC} />
      <div className="anim-box reveal" style={{ borderColor: 'rgba(124,77,255,.2)', maxWidth: 720, margin: '0 auto' }}>
        <Quiz questions={questions} accentColor={ACC} title="电力基础综合测验" />
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
