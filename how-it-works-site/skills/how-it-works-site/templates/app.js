// app.js — project-specific demos. Port the project's real logic here and
// name the source function on the slide; keep deck.js generic.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);

  // Stepper: highlight the active node/edge for each step.
  const FLOW = [
    { node: 'n-a', edge: null },
    { node: 'n-b', edge: 'e-a-b' }
  ];
  Deck.stepper($('#flow-steps'), {
    prev: $('#flow-prev'),
    next: $('#flow-next'),
    onStep(i) {
      document.querySelectorAll('#flow .node, #flow .edge').forEach(el => el.classList.remove('hot'));
      const s = FLOW[i];
      if (s.node) $('#' + s.node).classList.add('hot');
      if (s.edge) $('#' + s.edge).classList.add('hot');
    }
  });

  // Animation example: runs only while the slide is visible.
  // Deck.onFrame('title', now => Deck.setLevel($('#hero-glow'), (Math.sin(now / 500) + 1) / 2));
})();
