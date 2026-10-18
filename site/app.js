// app.js — demos for the claude-skills deck. The version check and tag
// parser port scripts/check-versions.py and the shell in ci.yml; keep
// deck.js generic.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  // ---------- title: terminal showing what the skill writes
  const TERM = [
    ['p', '> /how-it-works-site'],
    ['dim', '  asked: hosting, audience, demos'],
    ['dim', '  read the code: 3 doc/code mismatches'],
    ['ok', '  + site/index.html'],
    ['ok', '  + site/deck.css'],
    ['ok', '  + site/deck.js'],
    ['ok', '  + site/app.js'],
    ['ok', '  + .github/workflows/pages.yml'],
    ['ok', '  ~ README.md'],
    ['dim', '  verified in browser · commit? (y/n)']
  ];
  const term = $('#term');
  const termAt = n => {
    term.innerHTML = TERM.slice(0, n).map(([c, t]) => `<span class="${c}">${esc(t)}</span>`).join('\n') +
      (n < TERM.length ? '\n' : ' ') + '<span class="cursor"></span>';
  };
  if (Deck.reducedMotion) termAt(TERM.length);
  else {
    let start = null, shown = -1;
    Deck.onEnter('title', () => { start = null; });
    Deck.onFrame('title', now => {
      if (start === null) start = now;
      // one line every 450 ms, hold the full screen for 4 s, then repeat
      const n = Math.min(TERM.length, Math.floor((now - start) / 450));
      if (now - start > TERM.length * 450 + 4000) start = now;
      if (n !== shown) { shown = n; termAt(n); }
    });
  }

  // ---------- clickable diagrams
  function picker(slide, attr, data, nameEl, infoEl, codeEl) {
    $$(`#${slide} .node.pick`).forEach(g => g.addEventListener('click', () => {
      $$(`#${slide} .node.pick`).forEach(n => n.classList.toggle('sel', n === g));
      const d = data[g.dataset[attr]];
      nameEl.textContent = d.name;
      infoEl.innerHTML = d.info;
      infoEl.classList.remove('muted');
      codeEl.innerHTML = d.code || '';
    }));
  }

  picker('output', 'file', {
    index: { name: 'site/index.html', info: 'All slides live in one page as <code>&lt;section class="slide"&gt;</code>, each with an <code>id</code> (its URL), a <code>data-chapter</code> and a <code>data-title</code>. The template gives four patterns to clone: hero, two columns with a card, stepper, and a tile grid.',
      code: '&lt;section class="slide" id="flow"\n  data-chapter="Intro" data-title="Request flow"&gt;' },
    css: { name: 'site/deck.css', info: 'Theme tokens, layout, buttons, code blocks, SVG node/edge styles and the overview grid. Copied unchanged; a project re-tints it with <code>--accent</code>, ideally from its own <code>app.css</code>.',
      code: ':root {\n  --bg: #0d0e11;\n  --accent: #ff3b3b;\n  ...\n}' },
    deck: { name: 'site/deck.js', info: 'The generic engine: navigation, hash routing, overview, keyboard, swipe, the animation loop and the stepper helper. Copied unchanged into every project.',
      code: 'Deck.onFrame(slideId, fn)\nDeck.onEnter(slideId, fn)\nDeck.stepper(list, {prev, next, onStep})\nDeck.setLevel(el, 0..1)' },
    app: { name: 'site/app.js', info: 'Everything specific to the project: ports of its real functions, stepper wiring, diagram clicks. Starts from <code>templates/app.js</code>.',
      code: '<span class="c">// port the real function, name it on the slide</span>\nDeck.stepper($(\'#flow-steps\'), { ... });' },
    img: { name: 'site/img/', info: 'Only when the repo has photos worth showing. Each is resized to 1200 px wide and stripped of metadata; the originals are checked for GPS coordinates.',
      code: 'magick in -auto-orient -strip \\\n  -resize 1200x -quality 80 out.jpg' },
    ci: { name: 'Pages workflow', info: '<code>.github/workflows/pages.yml</code> for GitHub, or a <code>pages</code> job merged into an existing <code>.gitlab-ci.yml</code>. Both publish <code>site/</code> as-is, no build step.',
      code: '- uses: actions/upload-pages-artifact@v3.0.1\n  with: { path: site }' },
    readme: { name: 'README.md', info: 'A short paragraph in the overview or "How it works" section linking to the published deck. Nothing else in the README is touched.' }
  }, $('#file-name'), $('#file-info'), $('#file-code'));

  picker('wiring', 'w', {
    market: { name: '.claude-plugin/marketplace.json', info: 'The catalog. <code>/plugin marketplace add mveplus/claude-skills</code> reads this file from the repo. Each entry points at a plugin folder; the marketplace <code>name</code> is the part after <code>@</code> in <code>/plugin install</code>.',
      code: '{\n  "name": "mveplus-skills",\n  "plugins": [{\n    "name": "how-it-works-site",\n    "source": "./how-it-works-site",\n    "version": "1.0.0"\n  }]\n}' },
    plugin: { name: 'plugin.json', info: 'The plugin manifest: name, version, author, licence. Claude Code finds skills inside the plugin under <code>skills/&lt;name&gt;/SKILL.md</code>. Its <code>version</code> must equal the marketplace entry\'s; CI checks this.',
      code: '{\n  "name": "how-it-works-site",\n  "version": "1.0.0",\n  "license": "MIT"\n}' },
    skill: { name: 'SKILL.md', info: 'YAML frontmatter plus Markdown. The <code>description</code> is what Claude reads when deciding whether a request needs this skill, so it lists the trigger phrases. The body is the process Claude follows once it does.',
      code: '---\nname: how-it-works-site\ndescription: Build an interactive, multi-slide\n  "how it works" website ... Trigger on\n  "how it works page/site", ...\n---\n# How-it-works site\n## Process\n### 1. Ask before building ...' },
    templates: { name: 'templates/', info: 'Files that ship with the skill and get copied into the target repo: <code>index.html</code>, <code>deck.css</code>, <code>deck.js</code>, <code>app.js</code>, <code>github-pages.yml</code>, <code>gitlab-ci.yml</code>. SKILL.md refers to them by name.',
      code: 'templates/\n  index.html  deck.css  deck.js  app.js\n  github-pages.yml  gitlab-ci.yml' }
  }, $('#w-name'), $('#w-info'), $('#w-code'));

  // ---------- the 7-step process (SKILL.md "Process")
  const PROC = [
    { t: '1. Ask before building', why: 'One question round, at most four questions: hosting, audience, which demos, and optionally branding. Claude checks <code>git remote -v</code> first, and the demo options are specific to the repo, found by a quick skim.', out: 'Hosting choice, audience, a list of demos to build.' },
    { t: '2. Read the code properly', why: 'Entry points, main modules, docs and CI files. Every timeout, default and endpoint that will appear on a slide is taken from the code.', out: 'Facts with their source locations, and a list of doc-vs-code mismatches and dead ends.' },
    { t: '3. Outline', why: 'About 12–20 slides in chapters: title, the idea, big picture, a flow, one slide per component, failure handling, security, delivery, principles.', out: 'Slide list with a <code>data-chapter</code> and <code>data-title</code> for each.' },
    { t: '4. Build', why: 'Copy the templates, clone the slide patterns, port the project\'s functions for the demos, draw diagrams as inline SVG. Images are resized and stripped; originals are checked for GPS.', out: '<code>site/index.html</code>, <code>deck.css</code>, <code>deck.js</code>, <code>app.js</code>, maybe <code>img/</code>.' },
    { t: '5. Publish wiring', why: 'Add the Pages workflow, or merge a <code>pages</code> job into the existing GitLab CI file. Give the one-time enable command in a block the user can copy cleanly.', out: 'Workflow file and a README link paragraph.' },
    { t: '6. Verify', why: '<code>node --check</code>, then serve locally and drive every demo through JavaScript in a real browser, including a 380 px phone-width check. Without a browser tool the site is not reported as tested.', out: 'Screenshots per chapter, a list of what was and wasn\'t tested.' },
    { t: '7. Hand off', why: 'Ask before committing or pushing. Site on a branch in one commit; any code fixes the user wants go in separate commits.', out: 'What was built, how to enable Pages, the mismatch list, what wasn\'t tested.' }
  ];
  Deck.stepper($('#proc-steps'), {
    prev: $('#proc-prev'), next: $('#proc-next'),
    onStep(i) {
      $('#proc-title').textContent = PROC[i].t;
      $('#proc-why').innerHTML = PROC[i].why;
      $('#proc-out').innerHTML = PROC[i].out;
    }
  });

  // ---------- release pipeline (scripts/release.sh + .github/workflows/ci.yml)
  const REL = [
    { n: ['r-dev'] }, { n: ['r-dev'] }, { n: ['r-dev'] },
    { n: ['r-dev', 'r-git'], e: ['r-e1'] },
    { n: ['r-cli', 'r-git'], e: ['r-e2'] },
    { n: ['r-git', 'r-val'], e: ['r-e3'] },
    { n: ['r-val', 'r-rel'], e: ['r-e4'] },
    { n: ['r-rel', 'r-out', 'r-user'], e: ['r-e5', 'r-e6'] }
  ];
  Deck.stepper($('#rel-steps'), {
    prev: $('#rel-prev'), next: $('#rel-next'),
    onStep(i) {
      $$('#release .node, #release .edge').forEach(el => el.classList.remove('hot'));
      [...REL[i].n, ...(REL[i].e || [])].forEach(id => $('#' + id).classList.add('hot'));
    }
  });

  // ---------- engine: frame counter that only runs while visible
  let frames = 0;
  Deck.onFrame('engine', () => { $('#frame-count').textContent = ++frames; });
  Deck.onEnter('engine', () => { $('#cur-hash').textContent = location.hash || '#/engine'; });

  // ---------- theme re-tint
  const rgba = (hex, a) => `rgba(${[1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16)).join(', ')}, ${a})`;
  function tint(hex) {
    const r = document.documentElement.style;
    r.setProperty('--accent', hex);
    r.setProperty('--accent-soft', rgba(hex, .15));
    r.setProperty('--accent-glow', rgba(hex, .55));
    $$('#tints .chip').forEach(c => c.classList.toggle('active', c.dataset.c === hex));
    $('#tint-code').innerHTML = `<span class="c">/* site/app.css */</span>\n:root {\n  --accent: ${hex};\n  --accent-soft: ${rgba(hex, .15)};\n  --accent-glow: ${rgba(hex, .55)};\n}`;
  }
  $$('#tints .chip').forEach(c => c.addEventListener('click', () => tint(c.dataset.c)));
  tint('#ff7a45');

  // ---------- port of scripts/check-versions.py
  // Python repr() of a str or None, as the f-strings' !r prints it.
  function pyRepr(v) {
    if (v === undefined || v === null) return 'None';
    const s = v.replace(/\\/g, '\\\\');
    return s.includes("'") && !s.includes('"') ? `"${s}"` : `'${s.replace(/'/g, "\\'")}'`;
  }
  const str = v => (v === undefined || v === null ? 'None' : v);

  // market: {plugins: [entry]}; manifests: source -> plugin.json; argv: args after the script name
  function checkVersions(market, manifests, argv) {
    const errors = [], versions = {};
    for (const entry of market.plugins) {
      if (!('name' in entry)) return { lines: ['Traceback (most recent call last):', "KeyError: 'name'"], code: 1 };
      const name = entry.name;
      const manifest = manifests[entry.source];
      versions[name] = manifest.version;
      if (manifest.name !== name)
        errors.push(`${name}: plugin.json name is ${pyRepr(manifest.name)}`);
      if (entry.version !== manifest.version)
        errors.push(`${name}: marketplace.json has ${pyRepr(entry.version)}, plugin.json has ${pyRepr(manifest.version)}`);
    }
    if (argv.length === 2) {
      const [plugin, want] = argv;
      if (!(plugin in versions))
        errors.push(`tag names unknown plugin ${pyRepr(plugin)} (known: ${Object.keys(versions).join(', ')})`);
      else if (versions[plugin] !== want)
        errors.push(`${plugin}: tag says ${want}, manifests say ${str(versions[plugin])}`);
    }
    const lines = errors.map(e => `::error::${e}`);
    if (errors.length) return { lines, code: 1 };
    return { lines: ['versions ok: ' + Object.entries(versions).map(([n, v]) => `${n} ${str(v)}`).join(', ')], code: 0 };
  }

  // the manifests as edited on the "versions" slide; empty field = key missing
  function manifestsFromForm() {
    const opt = (o, k, id) => { const v = $(id).value.trim(); if (v !== '') o[k] = v; return o; };
    const entry = opt(opt({ source: './how-it-works-site' }, 'name', '#v-mname'), 'version', '#v-mver');
    const manifest = opt(opt({}, 'name', '#v-pname'), 'version', '#v-pver');
    return [{ plugins: [entry] }, { './how-it-works-site': manifest }];
  }
  const showLog = (el, res) => {
    el.innerHTML = res.lines.map(l => `<span class="${res.code ? 'err' : 'good'}">${esc(l)}</span>`).join('\n');
  };

  function renderVersions() {
    const [market, manifests] = manifestsFromForm();
    const argv = $('#v-args').value.trim().split(/\s+/).filter(Boolean);
    const res = checkVersions(market, manifests, argv);
    showLog($('#v-out'), res);
    const ignored = argv.length && argv.length !== 2 ? ' Tag check skipped: the script only reads tag arguments when given exactly two.' : '';
    $('#v-exit').innerHTML = (res.code ? '<span class="no">exit 1</span>: the CI step fails and nothing is released.' : '<span class="yes">exit 0</span>: the step passes.') + ignored;
    renderTag();
  }
  $$('#versions input').forEach(i => i.addEventListener('input', renderVersions));

  // ---------- tag parser (ci.yml: on.push.tags ["*--v*"], ${TAG%--v*}, ${TAG##*--v})
  function renderTag() {
    const tag = $('#tag-in').value.trim();
    // GitHub filter: '*' matches any characters except '/'
    const triggers = /^[^/]*--v[^/]*$/.test(tag);
    $('#t-trig').innerHTML = triggers ? '<span class="yes">yes</span>' : '<span class="no">no</span> (needs <code>--v</code>, no <code>/</code>)';
    if (!triggers) {
      ['#t-plugin', '#t-ver', '#t-zip'].forEach(id => { $(id).textContent = '—'; });
      $('#t-check').innerHTML = '<span class="c">workflow not started for this tag</span>';
      return;
    }
    const k = tag.lastIndexOf('--v');
    const plugin = tag.slice(0, k), version = tag.slice(k + 3);
    $('#t-plugin').textContent = plugin || '(empty)';
    $('#t-ver').textContent = version || '(empty)';
    const [market, manifests] = manifestsFromForm();
    // "Check versions" runs before "Check tag matches manifests" in the same job
    const plain = checkVersions(market, manifests, []);
    const res = plain.code ? { lines: [...plain.lines, '(tag check not reached)'], code: 1 } : checkVersions(market, manifests, [plugin, version]);
    showLog($('#t-check'), res);
    $('#t-zip').innerHTML = res.code ? '<span class="no">none</span> (validate failed)' : esc(`${plugin}-${version}.zip`);
  }
  $('#tag-in').addEventListener('input', renderTag);
  $$('#tag-presets .chip').forEach(c => c.addEventListener('click', () => { $('#tag-in').value = c.dataset.t; renderTag(); }));

  renderVersions();
})();
