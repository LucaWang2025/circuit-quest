import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useTheme } from './hooks/useTheme';
import { useProgress } from './hooks/useProgress';
import { bindScrollReveal } from './hooks/useScrollReveal';
import { NavContext } from './NavContext';
import { ALL_SECS, SEC_CATEGORY } from './secs';
import SECTION_MAP from './sectionComponents';

import CircuitBg from './components/CircuitBg';
import StarfieldBg from './components/StarfieldBg';
import Nav from './components/Nav';
import Footer from './components/Footer';
import CompleteButton from './components/CompleteButton';

// Home 单独保留静态 import，避免首屏白屏
const Home = lazy(() => import('./components/sections/Home'));

/** 全屏沉浸式章节：隐藏顶栏/底栏与电路背景 */
const IMMERSIVE_SECTIONS = new Set(['solar-system']);

function SectionFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 320, color: 'var(--dim)', fontSize: 13, letterSpacing: 1,
    }}>
      加载中…
    </div>
  );
}

function BottomNav({ currentId, onNavigate }) {
  const idx = ALL_SECS.findIndex(s => s.id === currentId);
  const prev = idx > 0 ? ALL_SECS[idx - 1] : null;
  const next = idx < ALL_SECS.length - 1 ? ALL_SECS[idx + 1] : null;
  const cat  = SEC_CATEGORY[currentId];

  const btnStyle = (sec) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 12,
    border: `1px solid ${sec ? 'rgba(255,255,255,.12)' : 'transparent'}`,
    background: sec ? 'rgba(255,255,255,.04)' : 'transparent',
    color: sec ? 'var(--dim)' : 'transparent',
    cursor: sec ? 'pointer' : 'default',
    font: '13px/1 inherit', transition: 'all .2s', flexShrink: 0,
  });

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 48px 44px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

      <button
        onClick={() => prev && onNavigate(prev.id)} disabled={!prev}
        style={btnStyle(prev)}
        onMouseEnter={e => { if (prev) e.currentTarget.style.borderColor = `${SEC_CATEGORY[prev.id]?.color}55`; }}
        onMouseLeave={e => { if (prev) e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; }}
      >
        ←&nbsp;<span style={{ fontSize: 11, opacity: .6 }}>上一节</span>
        &nbsp;<strong>{prev?.label}</strong>
      </button>

      <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
        <div style={{ font: '10px "Courier New",monospace', color: cat?.color ?? 'var(--dim)',
          letterSpacing: 2, marginBottom: 6 }}>{cat?.label?.toUpperCase()}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          {ALL_SECS.map(s => (
            <button key={s.id} onClick={() => onNavigate(s.id)} style={{
              width: s.id === currentId ? 22 : 7, height: 7, borderRadius: 4,
              border: 'none', cursor: 'pointer', padding: 0,
              background: s.id === currentId
                ? (SEC_CATEGORY[s.id]?.color ?? '#00e5ff')
                : SEC_CATEGORY[s.id]?.id === cat?.id
                  ? 'rgba(255,255,255,.2)'
                  : 'rgba(255,255,255,.07)',
              transition: 'all .25s',
            }} />
          ))}
        </div>
      </div>

      <button
        onClick={() => next && onNavigate(next.id)} disabled={!next}
        style={btnStyle(next)}
        onMouseEnter={e => { if (next) e.currentTarget.style.borderColor = `${SEC_CATEGORY[next.id]?.color}55`; }}
        onMouseLeave={e => { if (next) e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; }}
      >
        <strong>{next?.label}</strong>&nbsp;
        <span style={{ fontSize: 11, opacity: .6 }}>下一节</span>&nbsp;→
      </button>
    </div>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();
  const getHashId = () => {
    const h = window.location.hash.slice(1);
    return ALL_SECS.some(s => s.id === h) ? h : 'home';
  };

  const [activeSection, setActiveSection] = useState(getHashId);
  const { markCompleted, isCompleted } = useProgress(ALL_SECS);

  const navigate = useCallback(id => {
    setActiveSection(id);
    window.location.hash = id;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveSection(getHashId());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return undefined;

    const { observe, disconnect } = bindScrollReveal(main);

    observe();
    const t1 = setTimeout(observe, 0);
    const t2 = setTimeout(observe, 150);
    const t3 = setTimeout(observe, 500);

    let debounce;
    const mo = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(observe, 50);
    });
    mo.observe(main, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(debounce);
      mo.disconnect();
      disconnect();
    };
  }, [activeSection]);

  const ActiveComponent = SECTION_MAP[activeSection] ?? Home;
  const immersive = IMMERSIVE_SECTIONS.has(activeSection);
  const isCosmosTheme = SEC_CATEGORY[activeSection]?.id === 'cosmos';

  return (
    <NavContext.Provider value={navigate}>
      {!immersive && (isCosmosTheme ? <StarfieldBg /> : <CircuitBg />)}
      {!immersive && (
        <Nav theme={theme} onToggleTheme={toggle} activeSection={activeSection} onNavigate={navigate} />
      )}
      <main className={immersive ? 'main-immersive' : undefined}>
        <div key={activeSection} className={immersive ? undefined : 'sec-fade'}>
          <Suspense fallback={<SectionFallback />}>
            <ActiveComponent />
          </Suspense>
          {!immersive && activeSection !== 'home' && (
            <CompleteButton sectionId={activeSection} isCompleted={isCompleted} onComplete={markCompleted} />
          )}
        </div>
        {!immersive && <BottomNav currentId={activeSection} onNavigate={navigate} />}
        {!immersive && activeSection === 'home' && <Footer onNavigate={navigate} />}
      </main>
    </NavContext.Provider>
  );
}
