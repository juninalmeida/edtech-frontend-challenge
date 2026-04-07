(() => {
  const player = document.querySelector('[data-video-player]');
  if (!player) return;

  const youtubeId = player.dataset.youtubeId;

  if (youtubeId) {
    const video = player.querySelector('.video__media');
    const playBtn = player.querySelector('[data-video-play]');
    const overlay = player.querySelector('[data-video-overlay]');
    const controls = player.querySelector('[data-video-controls]');

    if (controls) controls.remove();

    const poster = video ? video.getAttribute('poster') : '';
    if (video) video.remove();

    const posterImg = document.createElement('img');
    posterImg.src = poster;
    posterImg.alt = '';
    posterImg.className = 'video__poster';
    player.insertBefore(posterImg, player.firstChild);

    playBtn.addEventListener('click', function () {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + youtubeId + '?rel=0&modestbranding=1&autoplay=1';
      iframe.className = 'video__iframe';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('title', 'Player de vídeo YouTube');

      posterImg.remove();
      playBtn.remove();
      if (overlay) overlay.remove();

      player.appendChild(iframe);
    });

    return;
  }

  const video = player.querySelector('.video__media');
  const playBtn = player.querySelector('[data-video-play]');
  const toggleBtn = player.querySelector('[data-video-toggle]');
  const toggleIcon = player.querySelector('[data-video-toggle-icon]');
  const progressTrack = player.querySelector('[data-video-progress]');
  const progressFill = player.querySelector('[data-video-progress-fill]');
  const timeDisplay = player.querySelector('[data-video-time]');
  const muteBtn = player.querySelector('[data-video-mute]');
  const volumeTrack = player.querySelector('[data-video-volume]');
  const volumeFill = player.querySelector('[data-video-volume-fill]');
  const fullscreenBtn = player.querySelector('[data-video-fullscreen]');

  if (!video || !progressTrack || !volumeTrack) return;

  const progressThumb = progressTrack.querySelector('.video__slider-thumb');
  const volumeThumb = volumeTrack.querySelector('.video__slider-thumb');

  function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    const mm = String(m).padStart(2, '0');
    const ss = String(sec).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  function setSlider(track, fill, thumb, pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    fill.style.width = `${clamped}%`;
    thumb.style.left = `${clamped}%`;
    track.setAttribute('aria-valuenow', Math.round(clamped));
  }


  function makeDraggable(track, onChange) {
    function getPercent(e) {
      const rect = track.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * 100;
    }

    function onMove(e) {
      e.preventDefault();
      onChange(getPercent(e));
    }

    function onUp() {
      track.classList.remove('is-dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    track.addEventListener('mousedown', (e) => {
      track.classList.add('is-dragging');
      onChange(getPercent(e));
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    function getTouchPercent(e) {
      const rect = track.getBoundingClientRect();
      return ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    }

    function onTouchMove(e) {
      e.preventDefault();
      onChange(getTouchPercent(e));
    }

    function onTouchEnd() {
      track.classList.remove('is-dragging');
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    }

    track.addEventListener('touchstart', (e) => {
      track.classList.add('is-dragging');
      onChange(getTouchPercent(e));
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    });
  }

  function play() {
    video.play().then(() => {
      player.classList.add('is-playing');
      toggleIcon.src = 'assets/icons/pause.svg';
      toggleBtn.setAttribute('aria-label', 'Pausar');
    }).catch((err) => {
      /* AbortError é esperado (play interrompido por pause) */
      if (err.name !== 'AbortError') console.warn('video play failed:', err);
    });
  }

  function pause() {
    video.pause();
    player.classList.remove('is-playing', 'is-controls-visible');
    toggleIcon.src = 'assets/icons/play.svg';
    toggleBtn.setAttribute('aria-label', 'Reproduzir');
  }

  function togglePlay() {
    video.paused ? play() : pause();
  }

  playBtn.addEventListener('click', play);
  toggleBtn.addEventListener('click', togglePlay);

  /* Detecção touch per-interaction, não per-device.
     Em híbridos (Surface), um flag permanente quebraria a alternância
     entre touch e mouse. touchstart sempre dispara antes de click —
     se o intervalo é < 500ms, o click veio de toque. */
  let lastTouchTime = 0;
  let hideTimer = null;
  const controls = player.querySelector('[data-video-controls]');

  player.addEventListener('touchstart', () => { lastTouchTime = Date.now(); }, { passive: true });

  function showControls() {
    player.classList.add('is-controls-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideControls, 3000);
  }

  function hideControls() {
    player.classList.remove('is-controls-visible');
    clearTimeout(hideTimer);
  }

  video.addEventListener('click', () => {
    const isTouch = Date.now() - lastTouchTime < 500;
    if (isTouch && !video.paused) {
      player.classList.contains('is-controls-visible') ? hideControls() : showControls();
    } else {
      togglePlay();
    }
  });

  controls.addEventListener('click', () => {
    if (Date.now() - lastTouchTime < 500) showControls();
  });
  controls.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setSlider(progressTrack, progressFill, progressThumb, pct);
    timeDisplay.textContent = formatTime(video.currentTime);
  });

  makeDraggable(progressTrack, (pct) => {
    if (!video.duration) return;
    const clamped = Math.max(0, Math.min(100, pct));
    video.currentTime = (clamped / 100) * video.duration;
    setSlider(progressTrack, progressFill, progressThumb, clamped);
  });


  makeDraggable(volumeTrack, (pct) => {
    const clamped = Math.max(0, Math.min(100, pct));
    video.volume = clamped / 100;
    video.muted = false;
    setSlider(volumeTrack, volumeFill, volumeThumb, clamped);
  });

  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.setAttribute('aria-label', video.muted ? 'Restaurar som' : 'Silenciar');
    const vol = video.muted ? 0 : video.volume * 100;
    setSlider(volumeTrack, volumeFill, volumeThumb, vol);
  });


  fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      (player.requestFullscreen || player.webkitRequestFullscreen).call(player);
    }
  });

  function onFullscreenExit() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      player.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  }

  document.addEventListener('fullscreenchange', onFullscreenExit);
  document.addEventListener('webkitfullscreenchange', onFullscreenExit);


  video.addEventListener('ended', () => {
    player.classList.remove('is-playing', 'is-controls-visible');
    clearTimeout(hideTimer);
    toggleIcon.src = 'assets/icons/play.svg';
    toggleBtn.setAttribute('aria-label', 'Reproduzir');
    setSlider(progressTrack, progressFill, progressThumb, 0);
    timeDisplay.textContent = '00:00';
    /* load() reseta o <video> e mostra o poster original */
    video.load();
  });


  player.setAttribute('tabindex', '0');
  player.addEventListener('keydown', (e) => {
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
        break;
      case 'ArrowLeft':
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        setSlider(volumeTrack, volumeFill, volumeThumb, video.volume * 100);
        break;
      case 'ArrowDown':
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        setSlider(volumeTrack, volumeFill, volumeThumb, video.volume * 100);
        break;
      case 'f':
        fullscreenBtn.click();
        break;
      case 'm':
        muteBtn.click();
        break;
    }
  });
})();
