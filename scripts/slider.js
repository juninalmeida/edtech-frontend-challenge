(() => {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;

  const track = slider.querySelector("[data-slider-track]");
  const dots = slider.querySelectorAll("[data-slider-dot]");
  const prevBtn = slider.querySelector("[data-slider-prev]");
  const nextBtn = slider.querySelector("[data-slider-next]");
  const total = track.children.length;
  let current = 0;

  function updateButtons() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  function goTo(index) {
    if (index < 0 || index >= total) return;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle("slider__dot--active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    updateButtons();
  }

  slider.setAttribute("aria-roledescription", "carrossel");
  track.setAttribute("aria-live", "polite");

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));
  dots.forEach((dot) => {
    dot.addEventListener("click", () => goTo(Number(dot.dataset.sliderDot)));
  });

  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      goTo(current - 1);
    } else if (e.key === "ArrowRight") {
      goTo(current + 1);
    }
  });

  updateButtons();
})();
