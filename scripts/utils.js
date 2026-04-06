const EdTech = {
  formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  },

  makeDraggable(bar, fill, setSlider, onUpdate) {
    function handlePointer(e) {
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      setSlider(bar, fill, pct);
      onUpdate(pct);
    }

    bar.addEventListener("pointerdown", (e) => {
      handlePointer(e);
      const onMove = (ev) => handlePointer(ev);
      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
  },
};
