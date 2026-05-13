import { useState } from 'react';
import styles from './Voltage.module.css';
import Quiz from '../Quiz';

const QUIZ_DATA = [
  { question: '家用插座的电压是多少伏？', options: ['12V', '110V', '220V', '380V'], answer: 2, explain: '中国家用标准电压为交流 220V/50Hz' },
  { question: '电压的单位是什么？', options: ['安培(A)', '欧姆(Ω)', '伏特(V)', '瓦特(W)'], answer: 2, explain: '电压单位为伏特(V)，以物理学家 Volta 命名' },
  { question: '两点之间没有电压差，电流会如何？', options: ['正常流动', '不会流动', '反向流动', '加速流动'], answer: 1, explain: '电压差是驱动电流流动的"动力"，没有电压差就没有电流' },
  { question: '一节干电池的电压约为？', options: ['0.7V', '1.5V', '3.7V', '5V'], answer: 1, explain: '普通碱性干电池标称电压为 1.5V' },
];

export default function Voltage() {
  const [volt, setVolt] = useState(9);

  const h1 = Math.max(6, Math.min(94, 15 + (volt / 24) * 80));
  const h2 = Math.max(4, Math.min(30, 95 - (volt / 24) * 90));
  const diff = Math.max(0, volt - 1);

  return (
    <section id="voltage" className="sec">
      <div className="sh">
        <span className="sh-icon">⚡</span>
        <div className="sh-tag">Basic Electronics · Chapter 01</div>
        <h2 className="sh-title" style={{ color: 'var(--gold)', textShadow: '0 0 35px rgba(255,171,0,.38)' }}>
          电压 · Voltage
        </h2>
        <p className="sh-sub">电压是电路的"推动力"——没有电压差，就像没有水位差，水无法在管道中自然流动。</p>
        <div className="divider" style={{ background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
      </div>

      <div className="grid2">
        {/* Animation */}
        <div className={`anim-box reveal ${styles.animBox}`}>
          <div className={styles.hint}>💧 水压类比 — 水位差 = 电位差（电压）</div>
          <div className={styles.tankRow}>
            <div className={styles.twrap}>
              <div className={styles.vtag}>{volt}V</div>
              <div className={styles.tank} style={{ height: 150 }}>
                <div className={styles.tinner} style={{ height: `${h1}%` }} />
              </div>
              <div className={styles.tlabel}>高电位</div>
            </div>

            <div className={styles.pipeWrap}>
              <div className={styles.pipeLabel}>电位差</div>
              <div className={styles.pipeH}><div className={styles.pipeFlow} /></div>
              <div className={styles.diffVal}>{diff}V</div>
              <div className={styles.pipeLabel}>= 电压</div>
            </div>

            <div className={styles.twrap}>
              <div className={styles.vtag} style={{ opacity: 0.45 }}>1V</div>
              <div className={styles.tank} style={{ height: 150 }}>
                <div className={styles.tinner} style={{ height: `${h2}%`, background: 'linear-gradient(180deg,rgba(255,171,0,.3),rgba(255,140,0,.6))' }} />
              </div>
              <div className={styles.tlabel}>低电位</div>
            </div>
          </div>

          <div className={styles.sliderWrap}>
            <div className={styles.sliderHint}>▸ 拖动滑块改变电压</div>
            <input
              type="range" min={1} max={24} value={volt}
              onChange={e => setVolt(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
            <div className={styles.voltDisp}>{volt} V</div>
          </div>
        </div>

        {/* Info */}
        <div className="info-stack reveal">
          <div className="glass" style={{ borderColor: 'rgba(255,171,0,.14)' }}>
            <div className="formula" style={{ color: 'var(--gold)', textShadow: '0 0 22px rgba(255,171,0,.5)' }}>U = I × R</div>
            <div className="fdesc">欧姆定律 · 电压（V） = 电流（A） × 电阻（Ω）</div>
          </div>
          <ICard color="var(--gold)" title="什么是电压？">
            电压（Voltage）是两点之间的<strong style={{ color: 'var(--gold)' }}>电位差</strong>，是推动电荷定向移动的"动力"。
            单位是<strong style={{ color: 'var(--gold)' }}>伏特（V）</strong>，符号 U 或 V。
          </ICard>
          <ICard color="var(--gold)" title="🏊 水压类比">
            想象水塔给水管供水：<br />
            &nbsp;🔵 高水位 → 高电位<br />
            &nbsp;💧 两水位之差 → 电压（V）<br />
            &nbsp;🌊 水流速度 → 电流（A）<br />
            &nbsp;🚿 管道阻力 → 电阻（Ω）
          </ICard>
          <ICard color="var(--gold)" title="生活中的电压值">
            <div className="chips">
              {['1号/5号电池 1.5V','锂电池 3.7V','USB供电 5V','汽车电瓶 12V','家用插座 220V','高压线 10kV+'].map(t => (
                <span key={t} className="chip" style={{ color: 'var(--gold)' }}>{t}</span>
              ))}
            </div>
          </ICard>
          <ICard color="var(--gold)" title="⚡ 直流 vs 交流">
            <strong style={{ color: 'var(--white)' }}>DC（直流）</strong> 方向不变，如电池、充电宝<br />
            <strong style={{ color: 'var(--white)' }}>AC（交流）</strong> 方向交替变化，如家用插座，中国标准 220V / 50Hz
          </ICard>
        </div>
      </div>

      <Quiz questions={QUIZ_DATA} accentColor="var(--gold)" title="电压小测验" />
    </section>
  );
}

function ICard({ color, title, children }) {
  return (
    <div className="icard" style={{ borderLeftColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}
