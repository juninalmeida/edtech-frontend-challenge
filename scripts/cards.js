(() => {
  const cards = document.querySelectorAll("[data-card]");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-card-toggle]");
      if (!toggle) return;

      card.classList.toggle("cards__item--open");
      const isOpen = card.classList.contains("cards__item--open");

      card.querySelectorAll("[data-card-toggle]").forEach((btn) => {
        btn.setAttribute("aria-expanded", isOpen);
      });

      const nextBtn = card.querySelector(
        isOpen ? ".cards__btn--close" : ".cards__btn--open"
      );
      if (nextBtn) nextBtn.focus();
    });
  });
})();
