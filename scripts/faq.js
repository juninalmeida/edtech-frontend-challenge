(() => {
  const items = document.querySelectorAll(".faq__item");
  if (!items.length) return;

  let animating = false;

  function open(item) {
    if (animating) return;
    animating = true;

    item.setAttribute("open", "");
    const answer = item.querySelector(".faq__answer");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        item.classList.add("faq__item--open");

        answer.addEventListener("transitionend", function handler() {
          answer.removeEventListener("transitionend", handler);
          animating = false;
        });
      });
    });

    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function close(item) {
    if (animating) return;
    animating = true;

    item.classList.remove("faq__item--open");
    const answer = item.querySelector(".faq__answer");

    answer.addEventListener("transitionend", function handler() {
      answer.removeEventListener("transitionend", handler);
      item.removeAttribute("open");
      animating = false;
    });
  }

  items.forEach((item) => {
    if (item.hasAttribute("open")) {
      item.classList.add("faq__item--open");
    }

    item.querySelector(".faq__summary").addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = item.classList.contains("faq__item--open");

      items.forEach((other) => {
        if (other !== item && other.classList.contains("faq__item--open")) {
          close(other);
        }
      });

      if (isOpen) {
        close(item);
      } else {
        open(item);
      }
    });
  });
})();
