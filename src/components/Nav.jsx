import { useEffect, useState } from 'react';
import styles from './Nav.module.css';

const SECS   = ['home','voltage','current','resistance','multimeter','power','capacitor','transformer','home-ckt','wiring','outlet','safety','troubleshoot','bldc-fan','flashlight'];
const LABELS = ['首页','电压','电流','电阻','万用表','功率','电容','变压器','家用电路','接线','开关插座','安全用电','故障排查','无刷电机','手电筒'];

export default function Nav({ theme, onToggleTheme }) {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.38 }
    );
    SECS.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const goTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>⚡ 电路<em>探索</em></div>

      {SECS.map((id, i) => (
        <button
          key={id}
          className={`${styles.pill} ${active === id ? styles.on : ''}`}
          onClick={() => goTo(id)}
        >
          {LABELS[i]}
        </button>
      ))}

      <button
        className={styles.themeBtn}
        onClick={onToggleTheme}
        title="切换主题"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </nav>
  );
}
