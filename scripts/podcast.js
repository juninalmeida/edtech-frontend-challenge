(() => {
  const el = document.querySelector("[data-podcast]");
  if (!el) return;

  const audio = el.querySelector("audio");
  const toggleBtn = el.querySelector("[data-podcast-toggle]");
  const toggleIcon = el.querySelector("[data-podcast-toggle-icon]");
  const progressBar = el.querySelector("[data-podcast-progress]");
  const progressFill = el.querySelector("[data-podcast-progress-fill]");
  const timeDisplay = el.querySelector("[data-podcast-time]");
  const muteBtn = el.querySelector("[data-podcast-mute]");
  const volumeBar = el.querySelector("[data-podcast-volume]");
  const volumeFill = el.querySelector("[data-podcast-volume-fill]");

  function setSlider(bar, fill, pct) {
    fill.style.width = `${pct}%`;
    const thumb = bar.querySelector(".podcast__thumb");
    if (thumb) {
      const isLarge = thumb.classList.contains("podcast__thumb--lg");
      if (isLarge) {
        const barW = bar.offsetWidth;
        const thumbW = thumb.offsetWidth;
        const scale = barW > 0 ? (barW - thumbW) / barW : 1;
        thumb.style.left = `${(pct / 100) * scale * 100}%`;
      } else {
        thumb.style.left = `${pct}%`;
      }
    }
    bar.setAttribute("aria-valuenow", Math.round(pct));
  }

  function updateProgress() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    setSlider(progressBar, progressFill, pct);
    timeDisplay.textContent = formatTime(audio.currentTime);
  }

  toggleBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    toggleIcon.src = "assets/icons/pause.svg";
    toggleBtn.setAttribute("aria-label", "Pausar áudio");
  });

  audio.addEventListener("pause", () => {
    toggleIcon.src = "assets/icons/play.svg";
    toggleBtn.setAttribute("aria-label", "Reproduzir áudio");
  });

  audio.addEventListener("timeupdate", updateProgress);

  audio.addEventListener("ended", () => {
    setSlider(progressBar, progressFill, 0);
    timeDisplay.textContent = formatTime(0);
  });

  makeDraggable(progressBar, progressFill, setSlider, (pct) => {
    if (audio.duration) {
      audio.currentTime = (pct / 100) * audio.duration;
    }
  });

  makeDraggable(volumeBar, volumeFill, setSlider, (pct) => {
    audio.volume = pct / 100;
    audio.muted = pct === 0;
    updateMuteLabel();
  });

  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    if (audio.muted) {
      setSlider(volumeBar, volumeFill, 0);
    } else {
      setSlider(volumeBar, volumeFill, audio.volume * 100);
    }
    updateMuteLabel();
  });

  function updateMuteLabel() {
    muteBtn.setAttribute(
      "aria-label",
      audio.muted ? "Ativar som" : "Silenciar"
    );
  }

  const speedWrap = el.querySelector("[data-podcast-speed]");
  const speedToggle = el.querySelector("[data-podcast-speed-toggle]");
  const speedMenu = speedWrap.querySelector(".podcast__speed-menu");

  speedToggle.addEventListener("click", () => {
    const isOpen = !speedMenu.hidden;
    speedMenu.hidden = isOpen;
    speedToggle.setAttribute("aria-expanded", !isOpen);
  });

  speedMenu.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-speed]");
    if (!opt) return;

    audio.playbackRate = parseFloat(opt.dataset.speed);

    speedMenu.querySelectorAll(".podcast__speed-opt").forEach((btn) => {
      btn.classList.toggle("podcast__speed-opt--active", btn === opt);
    });

    speedMenu.hidden = true;
    speedToggle.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("click", (e) => {
    if (!speedWrap.contains(e.target) && !speedMenu.hidden) {
      speedMenu.hidden = true;
      speedToggle.setAttribute("aria-expanded", "false");
    }
  });

  progressBar.addEventListener("keydown", (e) => {
    if (!audio.duration) return;
    const step = 5;
    let pct = (audio.currentTime / audio.duration) * 100;

    if (e.key === "ArrowRight") pct = Math.min(100, pct + step);
    else if (e.key === "ArrowLeft") pct = Math.max(0, pct - step);
    else return;

    e.preventDefault();
    audio.currentTime = (pct / 100) * audio.duration;
    updateProgress();
  });

  volumeBar.addEventListener("keydown", (e) => {
    const step = 5;
    let vol = audio.volume * 100;

    if (e.key === "ArrowRight" || e.key === "ArrowUp") vol = Math.min(100, vol + step);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") vol = Math.max(0, vol - step);
    else return;

    e.preventDefault();
    audio.volume = vol / 100;
    audio.muted = vol === 0;
    setSlider(volumeBar, volumeFill, vol);
    updateMuteLabel();
  });
})();
