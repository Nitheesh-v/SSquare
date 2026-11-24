/** Native-document scroll position shared by the photo planes and WebGL camera. */
export function heroScrollProgress(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-hero-stage]");
  const header = document.querySelector<HTMLElement>(".site-header");
  const top = header?.offsetHeight || 113;
  const stageHeight = Math.min(
    stage?.offsetHeight || window.innerHeight,
    window.innerHeight - top,
  );
  const travel = Math.max(
    root.offsetHeight - stageHeight,
    window.innerHeight * 0.55,
  );
  return Math.max(
    0,
    Math.min(1, (top - root.getBoundingClientRect().top) / travel),
  );
}
