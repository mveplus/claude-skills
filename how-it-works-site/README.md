# how-it-works-site

Builds an interactive, multi-slide "how it works" website for the repo
you're in. It covers the idea behind the project, the architecture and each
component, with live simulations that reuse the project's real logic. It
publishes the result with GitHub Pages or GitLab Pages.

**Examples:**
- <https://mveplus.github.io/onair-led-sign-firmware/>: an ESP32 LED-sign
  firmware in 19 slides, with simulations of its output modes, button
  resets, power-up state machine and control paths.
- <https://mveplus.github.io/claude-skills/>: this skill explaining itself.

## Use it

Ask for a "how it works page for this repo", or run `/how-it-works-site`.
Claude will:

1. Ask about hosting (GitHub/GitLab), audience, and which demos to build.
2. Read the code and take facts from the code, not the README. It reports
   any places where the docs and the code disagree.
3. Build `site/` from dependency-free templates: keyboard/swipe navigation,
   overview grid, one URL per slide, phone-friendly layout, no CDNs.
4. Add the Pages workflow (`.github/workflows/pages.yml` or a `pages` job
   merged into `.gitlab-ci.yml`) and a README link.
5. Test it in the browser if a browser tool is available, and ask before
   committing or pushing.

## Requirements

None required. Works best in Claude Code with a browser automation tool
(e.g. Claude in Chrome) for testing, ImageMagick for preparing images, and
`gh` or `glab` for enabling Pages. Without a browser tool, Claude tells you
which pages and demos to check by hand instead of reporting the site as
tested.

## What's inside

```text
skills/how-it-works-site/SKILL.md    the process Claude follows
skills/how-it-works-site/templates/  deck engine, theme, page skeleton,
                                     starter app.js, Pages CI files
```

## License

[MIT](https://github.com/mveplus/claude-skills/blob/main/LICENSE)
