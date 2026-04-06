(() => {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const delay = el.dataset.reveal;

      if (delay) el.style.transitionDelay = `${delay}ms`;

      el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  elements.forEach((el) => observer.observe(el));
})();
