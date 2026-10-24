/* Gallery controls only. Existing app.js owns every [data-project] click. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const pad = value => String(value).padStart(2, '0');

  document.querySelectorAll('.pw-work [data-gallery]').forEach(gallery => {
    const track = gallery.querySelector('[data-gallery-track]');
    if (!track) return;
    const items = [...track.querySelectorAll(':scope > [data-gallery-item]')];
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const dots = gallery.querySelector('[data-gallery-dots]');
    const range = gallery.querySelector('[data-gallery-range]');
    const rows = Number(gallery.dataset.galleryRows || 1);
    if (!items.length) return;

    let geometry = { pitch: 1, columns: 1, visible: 1, max: 0, maxColumn: 0, pages: 1 };
    let updateFrame = 0;
    let wheelTimer = 0;
    let wheelDirection = 0;
    let resizeFrame = 0;

    const columnLeft = column => Math.min(geometry.max, Math.max(0, column * geometry.pitch));
    const currentColumn = () => clamp(Math.round(track.scrollLeft / geometry.pitch), 0, geometry.maxColumn);
    const movement = () => reducedMotion.matches || !document.body.classList.contains('is-motion-active') ? 'auto' : 'smooth';

    function measure() {
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap) || 0;
      const width = items[0].getBoundingClientRect().width;
      const pitch = width + gap;
      const columns = Math.ceil(items.length / rows);
      // Count fully visible columns; mobile intentionally peeks into the next card.
      const visible = Math.max(1, Math.floor((track.clientWidth + gap + 1) / pitch));
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const maxColumn = Math.max(0, columns - visible);
      const pages = max > 1 ? Math.ceil(maxColumn / visible) + 1 : 1;
      geometry = { pitch, columns, visible, max, maxColumn, pages };

      if (dots.children.length !== pages) {
        dots.replaceChildren(...Array.from({ length: pages }, (_, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'pw-dot';
          button.dataset.galleryPage = String(index);
          button.setAttribute('aria-label', `转到第 ${index + 1} 组`);
          return button;
        }));
      }
      update();
    }

    function update() {
      updateFrame = 0;
      const col = currentColumn();
      const first = Math.min(items.length, col * rows + 1);
      const last = Math.min(items.length, (col + geometry.visible) * rows);
      const rangeText = `${pad(first)}–${pad(last)}`;
      if (range.textContent !== rangeText) range.textContent = rangeText;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= geometry.max - 1;

      const page = track.scrollLeft >= geometry.max - 2
        ? geometry.pages - 1
        : Math.min(geometry.pages - 1, Math.floor((col + geometry.visible / 2) / geometry.visible));
      [...dots.children].forEach((button, index) => {
        const current = index === page;
        button.classList.toggle('is-current', current);
        button.setAttribute('aria-current', String(current));
      });
      const activeDot = dots.children[page];
      if (activeDot) {
        const desired = activeDot.offsetLeft - dots.offsetLeft - dots.clientWidth / 2 + activeDot.offsetWidth / 2;
        dots.scrollLeft = clamp(desired, 0, Math.max(0, dots.scrollWidth - dots.clientWidth));
      }
    }

    function requestUpdate() {
      if (!updateFrame) updateFrame = requestAnimationFrame(update);
    }

    function stopWheel() {
      clearTimeout(wheelTimer);
      wheelTimer = 0;
      track.classList.remove('pw-is-wheeling');
    }

    function goToColumn(column) {
      stopWheel();
      track.scrollTo({ left: columnLeft(column), behavior: movement() });
    }

    prev.addEventListener('click', () => goToColumn(currentColumn() - geometry.visible));
    next.addEventListener('click', () => goToColumn(currentColumn() + geometry.visible));
    dots.addEventListener('click', event => {
      const button = event.target.closest('[data-gallery-page]');
      if (button && dots.contains(button)) goToColumn(Number(button.dataset.galleryPage) * geometry.visible);
    });

    track.addEventListener('keydown', event => {
      if (event.target !== track || event.ctrlKey || event.metaKey || event.altKey) return;
      const keys = {
        ArrowLeft: currentColumn() - 1,
        ArrowRight: currentColumn() + 1,
        PageUp: currentColumn() - geometry.visible,
        PageDown: currentColumn() + geometry.visible,
        Home: 0,
        End: geometry.maxColumn
      };
      if (!(event.key in keys)) return;
      event.preventDefault();
      goToColumn(keys[event.key]);
    });

    // These four galleries use native horizontal swipes; vertical input scrolls the page.
    if (gallery.dataset.galleryBrowse !== 'horizontal') {
      // Only consume vertical wheel while this actual viewport is nearly fully visible.
      // The first event at either horizontal edge always remains native page scrolling.
      track.addEventListener('wheel', event => {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < .1) return;
        if (document.querySelector('dialog[open]') || geometry.max <= 1) return;
        const rect = track.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const tolerance = Math.min(26, rect.height * .045);
        if (rect.height > viewportHeight * .98 || rect.top < -tolerance || rect.bottom > viewportHeight + tolerance) return;

        const factor = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? track.clientWidth : 1;
        const delta = event.deltaY * factor;
        const before = track.scrollLeft;
        const atStart = before <= 1;
        const atEnd = before >= geometry.max - 1;
        if ((delta < 0 && atStart) || (delta > 0 && atEnd)) {
          stopWheel();
          return;
        }
        const target = clamp(before + delta, 0, geometry.max);
        if (Math.abs(target - before) < .1) return;

        event.preventDefault();
        // Suspend snap during the wheel burst so short trackpad deltas accumulate.
        // Native snapping resumes once the physical wheel/trackpad motion settles.
        track.classList.add('pw-is-wheeling');
        track.scrollLeft = target;
        wheelDirection = Math.sign(delta);
        clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          // Even a single mouse-wheel notch reaches the next native snap point.
          // Long trackpad bursts still travel proportionally through all cards.
          const fraction = track.scrollLeft / geometry.pitch;
          const snapColumn = wheelDirection > 0 ? Math.ceil(fraction - .015) : Math.floor(fraction + .015);
          track.classList.remove('pw-is-wheeling');
          wheelTimer = 0;
          track.scrollTo({ left: columnLeft(snapColumn), behavior: movement() });
          requestUpdate();
        }, 170);
      }, { passive: false });
    }

    track.addEventListener('scroll', requestUpdate, { passive: true });
    // Native swipe, focus scrolling, and scroll snap all share this same viewport.
    track.addEventListener('pointerdown', stopWheel, { passive: true });
    const onResize = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; measure(); });
    };
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(track);
    else window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pagehide', () => {
      stopWheel();
      if (updateFrame) cancelAnimationFrame(updateFrame);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      updateFrame = 0;
      resizeFrame = 0;
    });
    window.addEventListener('pageshow', event => { if (event.persisted) measure(); });
    measure();
  });
})();
