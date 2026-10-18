---
name: how-it-works-site
description: Build an interactive, multi-slide "how it works" website for the current project — the idea behind it, the architecture, each component, with live simulations of its real logic — and publish it with GitHub Pages or GitLab Pages. Trigger on "how it works page/site", "explain this project as a slideshow", "interactive docs for this repo", "make a GitHub/GitLab Pages explainer", "/how-it-works-site".
---

# How-it-works site

Produce a dependency-free slideshow in `site/` that explains a codebase from
the *why* down to the code, with interactive demos that mirror the project's
real logic, plus a CI job that publishes it. Reference implementation:
<https://mveplus.github.io/onair-led-sign-firmware/> (19 slides, 4
simulations; source in
<https://github.com/mveplus/onair-led-sign-firmware/tree/main/site>).

Templates in this skill's `templates/` directory:

| File | Copy to | Purpose |
|---|---|---|
| `index.html` | `site/index.html` | Page chrome + slide patterns to clone |
| `deck.css` | `site/deck.css` | Theme tokens, layout, components |
| `deck.js` | `site/deck.js` | Navigation, overview, hash routing, frame loop, stepper helper |
| `app.js` | `site/app.js` | Starter for the project's demos (stepper wiring, frame hook) |
| `github-pages.yml` | `.github/workflows/pages.yml` | GitHub Pages deploy |
| `gitlab-ci.yml` | merge into `.gitlab-ci.yml` | GitLab Pages deploy |

Project-specific demo code goes in `site/app.js` (and styles in an optional
`site/app.css`); keep `deck.js` and `deck.css` generic.

## Process

### 1. Ask before building (one AskUserQuestion call)

First check `git remote -v` so the hosting question reflects reality. If the
remote is GitHub and the user says GitLab (or the reverse), ask about it.
Ask at most four questions:
- **Hosting:** GitHub Pages, GitLab Pages, or both.
- **Audience/depth:** mixed (idea first, then a deep dive; the default),
  developers, or non-developers.
- **Interactive demos:** offer 3–4 candidates *specific to this project*,
  found by a quick skim (state machines, timing/threshold logic, request
  flows, maths or formulas, config builders). multiSelect.
- Optionally: a language or branding constraint, if the repo suggests one.

### 2. Read the code properly

Read the entry points, the main modules, the README/docs and the CI files.
For every claim the slides will make (timeouts, thresholds, defaults,
topics, endpoints, what a reset clears), get it **from the code**, not the
README. Keep a list of **doc-vs-code discrepancies** and dead ends (e.g. a
CI job whose consumer doesn't exist). Show the code's real behaviour on the
slides and report the list to the user at the end. Never quietly "fix" the
slides to match the docs.

### 3. Outline (~12–20 slides), grouped into chapters

Typical arc: title (with a playful interactive element) → the idea / problem
→ big picture (clickable architecture) → request/data flow (animated
stepper) → one slide per major component → resilience / failure handling →
security / secrets → build, CI, delivery → design principles recap with
links. Every slide needs a `data-chapter` and a `data-title`.

### 4. Build

- Copy the templates and clone the slide patterns in `index.html` (hero,
  two columns with a card, stepper, info grid).
- Simulations **reuse the project's actual algorithm**: port the function
  (integer maths, thresholds, ordering) and cite its name on the slide. A
  simulation that only looks right is a bug.
- Use `Deck.onFrame(slideId, fn)` for animation, so only the visible slide
  animates. Use `Deck.stepper(...)` for click-through sequences.
- Diagrams: inline SVG using the CSS tokens; nothing external. No CDNs and
  no fonts to fetch, so the site works offline and on locked-down Pages.
- Images: copy them into `site/img/`, resized with metadata removed (with
  ImageMagick: `magick in -auto-orient -strip -resize 1200x -quality 80
  out.jpg`). **Check the repo's original images for GPS EXIF** (e.g.
  `identify -format '%[EXIF:GPSLatitude]'` or `exiftool -gps:all`) and warn
  the user if any are found. Phone photos usually carry the location of
  where they were taken. Once pushed they're in git history, so removing
  them needs a history rewrite, which is the user's call.

### 5. Publish wiring

- GitHub: copy `github-pages.yml`. Pages must be enabled once with source =
  Actions (Settings → Pages), or with the command below. Give commands the
  user will copy in a fenced code block with nothing after them. A sentence's
  closing period copied along with it ends up in the argument
  (`build_type=workflow.`), and the API rejects it:
  ```
  gh api -X POST repos/OWNER/REPO/pages -f build_type=workflow
  ```
  It only deploys from the default branch.
- GitLab: merge the `pages` job into any existing `.gitlab-ci.yml`; don't
  overwrite it. Pages turns on automatically; the URL is shown under
  Deploy → Pages.
- Add a short link paragraph to the README's overview/"How it works"
  section.

### 6. Verify before reporting

- `node --check site/*.js`
- Serve with `python3 -m http.server 8765 --bind 127.0.0.1 --directory site`
  (in the background). If a browser automation tool is available (e.g.
  Claude in Chrome), open the site, screenshot each chapter, and drive each
  demo **by running JavaScript in the page** (`.click()`, dispatched
  PointerEvents) rather than clicking coordinates: screenshots are often
  scaled relative to CSS pixels, so coordinate clicks miss. If the window
  can't be resized, check phone width by loading the site in a 380 px
  iframe and looking for elements with `getBoundingClientRect().right > 381`.
- Without a browser tool, tell the user which pages and demos to check by
  hand. Don't report the site as tested.
- Close any tabs you opened and stop the server afterwards.

### 7. Hand off

Ask before committing or pushing. Then, on a branch: one commit for the
site, separate commits for any code fixes the user asks for. Report: what
was built, how to enable Pages, the discrepancy list, and anything not
tested (e.g. hardware).

## Style rules

- Dark theme by default (tokens in `deck.css`), with a red accent you can
  re-tint per project via `--accent`.
- Plain, concrete copy. Explain *why* a design choice exists, not only
  what it does.
- Code excerpts are short and real (trimmed from the source, with a comment
  naming the file).
- Keyboard: ←/→/Space/PageUp/PageDown/Home/End, `O` for the overview, `Esc`
  to close. Swipe on touch. Every slide has its own URL (`#/slide-id`).
