/* Sem JS, o texto permanece verde via .hero__highlight (progressive enhancement) */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-highlight]').forEach((el) => {
    const baseDelay = parseInt(el.dataset.highlight || '0', 10);
    const chars = [...el.textContent];
    const fragment = document.createDocumentFragment();

    chars.forEach((char) => {
      const span = document.createElement('span');
      span.setAttribute('data-char', '');
      span.textContent = char;
      fragment.appendChild(span);
    });

    el.textContent = '';
    el.appendChild(fragment);

    if (reduced) return;

    const spans = el.querySelectorAll('[data-char]');
    const letterDelay = 800;
    const holdTime = 1500;
    const pauseTime = 1000;
    const timers = [];

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers.length = 0;
    }

    function cycle() {
      if (!el.isConnected) { clearTimers(); return; }
      timers.length = 0;

      spans.forEach((span, i) => {
        timers.push(setTimeout(() => span.classList.add('is-active'), i * letterDelay));
      });

      const resetTime = (spans.length - 1) * letterDelay + holdTime;
      timers.push(setTimeout(() => {
        spans.forEach((s) => s.classList.remove('is-active'));
        timers.push(setTimeout(cycle, pauseTime));
      }, resetTime));
    }

    timers.push(setTimeout(cycle, baseDelay));
  });
})();
