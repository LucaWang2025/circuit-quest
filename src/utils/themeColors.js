/** 读取 CSS 变量，供 Canvas 等与主题同步 */
export function readCssVar(name, fallback = '') {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function themeCanvasColors() {
  return {
    label: readCssVar('--canvas-label', '#c8dce6'),
    muted: readCssVar('--text-muted', '#aabfc8'),
    white: readCssVar('--white', '#e8f4f8'),
  };
}
