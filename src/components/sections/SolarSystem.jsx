import { useEffect, useRef, useState, useMemo } from 'react';
import { PLANETS } from '../../data/planets.js';
import { createSolarSystem } from '../../lib/solarSystemEngine.js';
import { useNav } from '../../NavContext';
import { PLANET_DETAILS, lightTravelMinutes } from '../../data/cosmosData';
import styles from './SolarSystem.module.css';

function colorHex(n) {
  return '#' + (n >>> 0).toString(16).padStart(6, '0');
}

const ENGINEER_TIPS = {
  sun: '核心聚变能源站：一切光伏与生命的终极来源。',
  mercury: '昼夜温差极大，储能系统需宽温域设计。',
  venus: '失控温室效应案例：隔热与热管理极端重要。',
  earth: '光伏利用主战场：约 1361 W/m² 大气层外辐照；磁场保护电网与通信。',
  mars: '弱光照+沙尘：深空供电常需更大阵列或 RTG 核电。',
  jupiter: '强辐射带：航天器电子需加固屏蔽；卫星储能需求大。',
  saturn: '远日点弱光：太阳能效率低，常依赖放射性同位素电源。',
  uranus: '弱光低温：电池活性下降，需保温与核能补充。',
  neptune: '最弱光照区：几乎完全依赖携带电源或核能。',
};

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
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState('earth');
  const [compareB, setCompareB] = useState('jupiter');
  const [radarPing, setRadarPing] = useState(null);

  const detailA = PLANET_DETAILS.find(p => p.id === compareA);
  const detailB = PLANET_DETAILS.find(p => p.id === compareB);

  const lightInfo = useMemo(() => {
    if (!planet.dist) return null;
    const au = planet.dist * 0.4;
    const oneWay = lightTravelMinutes(au);
    return { oneWay: oneWay.toFixed(1), round: (oneWay * 2).toFixed(1) };
  }, [planet]);

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
          onLoadProgress: (done, total) => setLoadText(`正在加载行星贴图… ${done}/${total}`),
          onPlanetChange: (p) => { if (!cancelled) setPlanet(p); },
        });
        if (cancelled) { engine?.dispose(); return; }
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

  const pingRadar = () => {
    if (!planet.dist) return;
    const au = planet.dist * 0.4;
    setRadarPing({
      oneWay: lightTravelMinutes(au).toFixed(1),
      round: (lightTravelMinutes(au) * 2).toFixed(1),
      at: Date.now(),
    });
  };

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
            ← 返回宇宙概览
          </button>
        </div>
        <div className={styles.hint}>
          <div>🖱 拖拽旋转 · 滚轮缩放</div>
          <div><kbd>对比</kbd> / <kbd>光速雷达</kbd> 见底部工具栏</div>
        </div>
      </header>

      <aside className={styles.panel}>
        {compareMode && detailA && detailB ? (
          <>
            <h2>行星对比</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.75rem' }}>
              <div>
                <strong style={{ color: detailA.color }}>{detailA.name}</strong>
                <p style={{ marginTop: 6, color: '#a8c8e8' }}>半径 {detailA.radiusKm.toLocaleString()} km</p>
                <p style={{ color: '#a8c8e8' }}>{detailA.au} AU · {detailA.year}</p>
              </div>
              <div>
                <strong style={{ color: detailB.color }}>{detailB.name}</strong>
                <p style={{ marginTop: 6, color: '#a8c8e8' }}>半径 {detailB.radiusKm.toLocaleString()} km</p>
                <p style={{ color: '#a8c8e8' }}>{detailB.au} AU · {detailB.year}</p>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <select value={compareA} onChange={e => setCompareA(e.target.value)} style={{ flex: 1, fontSize: 11, background: '#0a1220', color: '#fff', border: '1px solid #445', borderRadius: 6, padding: 4 }}>
                {PLANET_DETAILS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={compareB} onChange={e => setCompareB(e.target.value)} style={{ flex: 1, fontSize: 11, background: '#0a1220', color: '#fff', border: '1px solid #445', borderRadius: 6, padding: 4 }}>
                {PLANET_DETAILS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </>
        ) : (
          <>
            <h2>{planet.name}</h2>
            <div className={styles.panelEn}>{planet.en}</div>
            <p className={styles.panelDesc}>{planet.desc}</p>
            <div className={styles.stats}>
              <div>半径<strong>{planet.radius}</strong></div>
              <div>距太阳<strong>{planet.dist ? `约 ${(planet.dist * 0.4).toFixed(1)} AU（示意）` : '—'}</strong></div>
              <div>公转周期<strong>{planet.orbit}</strong></div>
              <div>卫星<strong>{planet.moons}</strong></div>
            </div>
            {lightInfo && (
              <p style={{ marginTop: 10, fontSize: '0.75rem', color: '#6eb5ff' }}>
                光速雷达：单程 {lightInfo.oneWay} 分 · 往返 {lightInfo.round} 分
              </p>
            )}
            {ENGINEER_TIPS[planet.id] && (
              <p style={{ marginTop: 8, fontSize: '0.72rem', color: '#ffc850', lineHeight: 1.5 }}>
                ⚡ {ENGINEER_TIPS[planet.id]}
              </p>
            )}
            {radarPing && (
              <p style={{ marginTop: 8, fontSize: '0.72rem', color: '#00e676' }}>
                脉冲回波：单程 {radarPing.oneWay} 分（示意）
              </p>
            )}
          </>
        )}
      </aside>

      {!compareMode && (
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
      )}

      <div className={styles.tools}>
        <button type="button" className={`${styles.toolBtn} ${orbitAnim ? styles.toolBtnActive : ''}`} onClick={() => { const n = !orbitAnim; setOrbitAnim(n); engineRef.current?.setOrbitAnim(n); }}>
          公转动画
        </button>
        <button type="button" className={`${styles.toolBtn} ${showLabels ? styles.toolBtnActive : ''}`} onClick={() => { const n = !showLabels; setShowLabels(n); engineRef.current?.setShowLabels(n); }}>
          轨道标签
        </button>
        <button type="button" className={`${styles.toolBtn} ${compareMode ? styles.toolBtnActive : ''}`} onClick={() => setCompareMode(c => !c)}>
          对比模式
        </button>
        <button type="button" className={styles.toolBtn} onClick={pingRadar}>
          光速雷达
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => engineRef.current?.resetView()}>
          俯瞰全景
        </button>
      </div>
    </div>
  );
}
