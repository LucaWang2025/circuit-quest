import CircuitBg from './CircuitBg';
import StarfieldBg from './StarfieldBg';

/** 电路 / 宇宙双背景交叉淡入，避免切换章节时闪屏 */
export default function SceneBackground({ scene, theme }) {
  const cosmos = scene === 'cosmos';
  return (
    <div className="scene-bg" aria-hidden>
      <CircuitBg active={!cosmos} theme={theme} />
      <StarfieldBg active={cosmos} theme={theme} />
    </div>
  );
}
