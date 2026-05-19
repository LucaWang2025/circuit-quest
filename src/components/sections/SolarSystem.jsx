import { useEffect, useRef, useState } from 'react';
import { PLANETS } from '../../data/planets.js';
import { createSolarSystem } from '../../lib/solarSystemEngine.js';
import { useNav } from '../../NavContext';
import styles from './SolarSystem.module.css';

function colorHex(n) {
  return '#' + (n >>> 0).toString(16).padStart(6, '0');
}

export default function SolarSystem() {
  const navigate = useNav();
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadText, setLoadText] = useState('正在进入太阳系 · 加载行星贴图');
  const [error, setError] = useState(null);
  const [planet, setPlanet] = useState(PLANETS[0]);
  const [orbitAnim, setOrbitAnim] = useState(true);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    document.body.dataset.immersive = 'solar';
    return () => { delete document.body.dataset.immersive; };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const engine = await createSolarSystem(container, {
          onLoadProgress: (done, total) => {
            setLoadText(`正在加载行星贴图… ${done}/${total}`);
          },
          onPlanetChange: (p) => {
            if (!cancelled) setPlanet(p);
          },
        });
        if (cancelled) {
          engine?.dispose();
          return;
        }
        engineRef.current = engine;
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || '3D 初始化失败');
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const focus = (id) => engineRef.current?.focusPlanet(id);

  return (
    <div className={styles.root}>
      <div className={`${styles.loader} ${!loading ? styles.loaderHide : ''}`}>
        <div className={styles.loaderOrbit} />
        <div className={styles.loaderTitle}>SOLARIS</div>
        <div className={styles.loaderSub}>{loadText}</div>
      </div>

      <div ref={containerRef} className={styles.canvasWrap} />

      <div className={styles.vignette} aria-hidden="true" />

      {error && (
        <div className={styles.error} role="alert">
          <p>3D 场景加载失败</p>
          <p style={{ marginTop: 10, fontSize: '0.85rem', color: '#a8c8e8' }}>{error}</p>
        </div>
      )}

      <header className={styles.topBar}>
        <div>
          <div className={styles.brand}>
            SOLARIS
            <span className={styles.brandSub}>电路探索 · 宇宙专题 · 3D 太阳系</span>
          </div>
          <button type="button" className={styles.backBtn} onClick={() => navigate('cosmos')} style={{ marginTop: 10 }}>
            ← 返回宇宙知识
          </button>
        </div>
        <div className={styles.hint}>
          <div>🖱 拖拽旋转 · 滚轮缩放</div>
          <div><kbd>点击</kbd> 行星聚焦 · <kbd>右侧</kbd> 快速跳转</div>
        </div>
      </header>

      <aside className={styles.panel}>
        <h2>{planet.name}</h2>
        <div className={styles.panelEn}>{planet.en}</div>
        <p className={styles.panelDesc}>{planet.desc}</p>
        <div className={styles.stats}>
          <div>半径<strong>{planet.radius}</strong></div>
          <div>
            距太阳<strong>{planet.dist ? `约 ${(planet.dist * 0.4).toFixed(1)} AU（示意）` : '—'}</strong>
          </div>
          <div>公转周期<strong>{planet.orbit}</strong></div>
          <div>卫星<strong>{planet.moons}</strong></div>
        </div>
      </aside>

      <nav className={styles.planetNav} aria-label="行星导航">
        {PLANETS.map(p => (
          <button
            key={p.id}
            type="button"
            className={`${styles.planetBtn} ${planet.id === p.id ? styles.planetBtnActive : ''}`}
            onClick={() => focus(p.id)}
          >
            <span className={styles.planetDot} style={{ background: colorHex(p.color) }} />
            {p.name}
          </button>
        ))}
      </nav>

      <div className={styles.tools}>
        <button
          type="button"
          className={`${styles.toolBtn} ${orbitAnim ? styles.toolBtnActive : ''}`}
          onClick={() => {
            const next = !orbitAnim;
            setOrbitAnim(next);
            engineRef.current?.setOrbitAnim(next);
          }}
        >
          公转动画
        </button>
        <button
          type="button"
          className={`${styles.toolBtn} ${showLabels ? styles.toolBtnActive : ''}`}
          onClick={() => {
            const next = !showLabels;
            setShowLabels(next);
            engineRef.current?.setShowLabels(next);
          }}
        >
          轨道标签
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => engineRef.current?.resetView()}
        >
          俯瞰全景
        </button>
      </div>
    </div>
  );
}
