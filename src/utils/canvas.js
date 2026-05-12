/**
 * 高 DPI Canvas 初始化工具
 * 解决 Retina 屏幕下 Canvas 模糊问题
 *
 * @param {HTMLCanvasElement} cv  canvas 元素
 * @param {number} logW           逻辑宽度（CSS 像素）
 * @param {number} logH           逻辑高度（CSS 像素）
 * @returns {CanvasRenderingContext2D} 已缩放的 ctx
 */
export function setupHiDpi(cv, logW, logH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width  = logW * dpr;
  cv.height = logH * dpr;
  cv.style.width  = logW + 'px';
  cv.style.height = logH + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}
