(() => {
  const STORAGE_KEY = "activity-discursive";

  const section = document.querySelector('[data-activity="discursive"]');
  if (!section) return;

  const input = section.querySelector("[data-activity-input]");
  const submitBtn = section.querySelector("[data-activity-submit]");
  const editBtn = section.querySelector("[data-activity-edit]");
  const feedback = section.querySelector("[data-activity-feedback]");
  const feedbackClose = section.querySelector("[data-activity-feedback-close]");

  function save() {
    const state = {
      text: input.value,
      submitted: submitBtn.disabled && !editBtn.disabled,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function restore() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const state = JSON.parse(raw);
      input.value = state.text || "";

      if (state.submitted) {
        setSubmittedState();
      } else if (input.value.trim()) {
        submitBtn.disabled = false;
      }
    } catch { /* ignore */ }
  }

  function setSubmittedState() {
    submitBtn.disabled = true;
    editBtn.disabled = false;
    input.readOnly = true;
    feedback.hidden = false;
    save();
  }

  function setEditingState() {
    submitBtn.disabled = !input.value.trim();
    editBtn.disabled = true;
    input.readOnly = false;
    feedback.hidden = true;
    input.focus();
    save();
  }

  input.addEventListener("input", () => {
    submitBtn.disabled = !input.value.trim();
    save();
  });

  submitBtn.addEventListener("click", () => {
    if (!input.value.trim()) return;
    setSubmittedState();
  });

  editBtn.addEventListener("click", setEditingState);

  feedbackClose.addEventListener("click", () => {
    feedback.hidden = true;
  });

  restore();
})();
