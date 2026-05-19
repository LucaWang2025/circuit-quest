/**
 * 绑定 .reveal 滚动显现。兼容懒加载章节：懒加载完成前 DOM 不存在时，
 * 需配合 MutationObserver 或延迟重扫，否则会一直保持 opacity:0。
 */
export function bindScrollReveal(root = document) {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('vis');
    }),
    { threshold: 0.08, rootMargin: '0px 0px 48px 0px' },
  );

  const observed = new WeakSet();

  const revealIfInView = (el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < vh && r.bottom > 0) el.classList.add('vis');
  };

  const observe = () => {
    root.querySelectorAll('.reveal:not(.vis)').forEach(el => {
      if (observed.has(el)) return;
      observed.add(el);
      revealIfInView(el);
      io.observe(el);
    });
  };

  return { observe, disconnect: () => io.disconnect() };
}
