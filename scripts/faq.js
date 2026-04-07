(() => {
  const items = document.querySelectorAll(".faq__item");
  if (!items.length) return;

  function open(item) {
    item.setAttribute("open", "");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        item.classList.add("faq__item--open");
      });
    });

    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function close(item) {
    item.classList.remove("faq__item--open");
    const answer = item.querySelector(".faq__answer");

    function onEnd() {
      answer.removeEventListener("transitionend", onEnd);
      clearTimeout(fallback);
      item.removeAttribute("open");
    }

    const fallback = setTimeout(onEnd, 400);
    answer.addEventListener("transitionend", onEnd);
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
