// deck.js — generic slideshow engine for how-it-works sites.
// Slides are <section class="slide" id="…" data-chapter="…" data-title="…">.
// Project demos live in app.js and use the window.Deck API:
//   Deck.onFrame(slideId, fn(now))    rAF callback, runs only while that slide is visible
//   Deck.onEnter(slideId, fn())       called each time the slide becomes active
//   Deck.stepper(listEl, {prev, next, onStep(i)})  click-through over <li> items
//   Deck.setLevel(el, 0..1)           sets the --level CSS var (glows, meters)
//   Deck.go(index) / Deck.current()
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const slides = $$('.slide');
  const frames = {}, enters = {};
  let cur = -1;

  function go(i, push = true) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    cur = i;
    slides.forEach((s, k) => {
      s.classList.toggle('active', k === i);
      s.classList.toggle('before', k < i);
    });
    const s = slides[i];
    $('#counter').textContent = `${i + 1} / ${slides.length}`;
    $('#chapter').textContent = `${s.dataset.chapter} · ${s.dataset.title}`;
    $('#progress-fill').style.width = `${((i + 1) / slides.length) * 100}%`;
    document.title = `${s.dataset.title} · ${document.body.dataset.deckTitle || 'How it works'}`;
    if (push && location.hash !== `#/${s.id}`) history.replaceState(null, '', `#/${s.id}`);
    s.scrollTop = 0;
    $$('#overview-list a').forEach((a, k) => a.classList.toggle('cur', k === i));
    (enters[s.id] || []).forEach(fn => fn());
  }
  const fromHash = () => {
    const id = location.hash.replace(/^#\/?/, '');
    const k = slides.findIndex(s => s.id === id);
    return k < 0 ? 0 : k;
  };
  window.addEventListener('hashchange', () => go(fromHash(), false));
  $('#btn-prev').onclick = () => go(cur - 1);
  $('#btn-next').onclick = () => go(cur + 1);

  // ---- overview grid
  const overview = $('#overview'), ovList = $('#overview-list');
  slides.forEach((s, k) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#/${s.id}"><small>${k + 1} · ${s.dataset.chapter}</small>${s.dataset.title}</a>`;
    li.firstChild.onclick = () => toggleOverview(false);
    ovList.appendChild(li);
  });
  function toggleOverview(show = overview.hidden) {
    overview.hidden = !show;
    if (show) ($('a.cur', ovList) || $('a', ovList)).focus();
  }
  $('#btn-overview').onclick = () => toggleOverview(true);
  $('#btn-close-ov').onclick = () => toggleOverview(false);

  // ---- keyboard (form controls keep their own arrow keys; Space on buttons stays a click)
  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'Escape') return toggleOverview(false);
    if (e.key === 'o' || e.key === 'O') return toggleOverview();
    if (!overview.hidden) return;
    const onButton = tag === 'BUTTON';
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !onButton)) { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
  });

  // ---- swipe (ignored when it starts on an interactive element)
  let touch = null;
  const deck = $('#deck');
  deck.addEventListener('touchstart', e => {
    if (e.target.closest('input, select, button, canvas, [data-no-swipe]')) { touch = null; return; }
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  deck.addEventListener('touchend', e => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1));
    touch = null;
  });

  // ---- stepper: highlights one <li> at a time
  function stepper(list, { prev, next, onStep } = {}) {
    const items = $$('li', list);
    let i = 0;
    const render = () => {
      items.forEach((li, k) => li.classList.toggle('cur', k === i));
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === items.length - 1;
      onStep && onStep(i);
    };
    if (prev) prev.onclick = () => { i = Math.max(0, i - 1); render(); };
    if (next) next.onclick = () => { i = Math.min(items.length - 1, i + 1); render(); };
    render();
    return { set(k) { i = k; render(); }, get: () => i };
  }

  function frame(now) {
    const s = slides[cur];
    if (s) (frames[s.id] || []).forEach(fn => fn(now));
    requestAnimationFrame(frame);
  }

  window.Deck = {
    go, current: () => cur, stepper,
    onFrame: (id, fn) => (frames[id] = frames[id] || []).push(fn),
    onEnter: (id, fn) => (enters[id] = enters[id] || []).push(fn),
    setLevel: (el, v) => el && el.style.setProperty('--level', Math.max(0, Math.min(1, v)).toFixed(3)),
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // Start after app.js (loaded after this file) has registered its hooks.
  window.addEventListener('DOMContentLoaded', () => {
    go(fromHash(), false);
    requestAnimationFrame(frame);
  });
})();
