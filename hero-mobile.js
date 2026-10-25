/* The supplied mobile clip is scrubbed by normal page scrolling. */
(() => {
  'use strict';
  const hero = document.getElementById('home');
  const stage = document.querySelector('.felt-video-stage');
  if (!hero || !stage) return;
  const mobile = matchMedia('(max-width: 760px)');
  const video = document.createElement('video');
  video.id = 'hero-mobile-video'; video.className = 'hero-mobile-video';
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true'); video.disablePictureInPicture = true;
  stage.append(video);
  let enabled = document.body.classList.contains('is-motion-active');
  let visible = true, primed = false, priming = false, frame = 0, controller = null, objectURL = null, generation = 0;
  let progress = Math.max(0, Math.min(1, (Number(hero.dataset.mobilePitch ?? -1) + 1) / 2));
  function queue() { if (!frame && enabled && mobile.matches && visible) frame = requestAnimationFrame(seek); }
  function seek() {
    frame = 0;
    if (!enabled || !mobile.matches || !visible || !primed || priming || video.seeking || video.readyState < 2 || !Number.isFinite(video.duration)) return;
    const end = Math.max(0, video.duration - 1 / 24);
    const target = Math.min(end, Math.round(progress * end * 24) / 24);
    video.dataset.scrubProgress = progress.toFixed(3);
    if (Math.abs(video.currentTime - target) >= 1 / 48) video.currentTime = target;
  }
  function prime() {
    if (!enabled || !mobile.matches || !visible || !video.getAttribute('src') || primed || priming) return;
    priming = true;
    const play = video.play();
    if (!play?.then) { video.pause(); priming = false; primed = true; video.classList.add('is-ready'); queue(); return; }
    play.then(() => {
      const painted = () => {
        video.pause(); priming = false;
        if (!enabled || !mobile.matches) return;
        primed = true; video.classList.add('is-ready'); queue();
      };
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(painted);
      else requestAnimationFrame(painted);
    }).catch(() => { priming = false; });
  }
  async function load() {
    if (!enabled || !mobile.matches || objectURL || controller) return;
    const id = ++generation; controller = new AbortController();
    try {
      const response = await fetch('assets/hero/director-mobile-nod.mp4', { signal: controller.signal });
      if (!response.ok) throw Error('mobile clip unavailable');
      const blob = await response.blob();
      if (id !== generation || !enabled || !mobile.matches) return;
      objectURL = URL.createObjectURL(blob); video.src = objectURL; video.load(); prime();
    } catch (error) {
      if (error.name !== 'AbortError') video.dataset.mediaState = 'poster';
    } finally { if (id === generation) controller = null; }
  }
  function stop() {
    generation++; controller?.abort(); controller = null;
    cancelAnimationFrame(frame); frame = 0; priming = primed = false;
    video.pause(); video.classList.remove('is-ready'); video.removeAttribute('src'); video.load();
    if (objectURL) { URL.revokeObjectURL(objectURL); objectURL = null; }
  }
  video.addEventListener('loadeddata', () => { prime(); queue(); });
  video.addEventListener('seeked', () => { video.dataset.frameTime = video.currentTime.toFixed(3); queue(); });
  video.addEventListener('error', () => { video.classList.remove('is-ready'); video.dataset.mediaState = 'poster'; });
  document.addEventListener('portfolio-hero-look', event => {
    progress = Math.max(0, Math.min(1, (Number(event.detail?.pitch) + 1) / 2)); queue();
  });
  document.addEventListener('portfolio-motion-state', event => {
    enabled = Boolean(event.detail?.enabled);
    if (enabled && mobile.matches) load(); else stop();
  });
  mobile.addEventListener('change', () => { if (mobile.matches && enabled) load(); else stop(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { load(); prime(); queue(); } else { video.pause(); cancelAnimationFrame(frame); frame = 0; }
  }, { threshold: 0 }).observe(hero);
  // iOS may need a muted play/pause during the first gesture before paused seeks paint.
  addEventListener('touchstart', prime, { passive: true });
  addEventListener('pointerdown', prime, { passive: true });
  addEventListener('pagehide', stop);
  addEventListener('pageshow', event => { if (event.persisted) load(); });
  load();
})();
