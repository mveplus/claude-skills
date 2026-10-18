# claude-skills

Claude Code skills by [mveplus](https://github.com/mveplus), packaged as a
plugin marketplace.

## Install

In Claude Code:

```
/plugin marketplace add mveplus/claude-skills
```

```
/plugin install how-it-works-site@mveplus-skills
```

Or from a shell:

```bash
claude plugin marketplace add mveplus/claude-skills
claude plugin install how-it-works-site@mveplus-skills
```

Update later with `/plugin marketplace update mveplus-skills`.

## Skills

### how-it-works-site

Builds an interactive, multi-slide "how it works" website for the repo
you're in. It covers the idea behind the project, the architecture and each
component, with live simulations that reuse the project's real logic. It
publishes the result with GitHub Pages or GitLab Pages.

**Example:** <https://mveplus.github.io/onair-led-sign-firmware/>, an ESP32
LED-sign firmware explained in 19 slides with simulations of its output
modes, BOOT-button resets, power-up state machine and LAN/cloud control
paths.

**Use it:** ask for a "how it works page for this repo", or run
`/how-it-works-site`. Claude will:

1. Ask about hosting (GitHub/GitLab), audience, and which demos to build.
2. Read the code and take facts from the code, not the README. It reports
   any places where the docs and the code disagree.
3. Build `site/` from dependency-free templates: keyboard/swipe navigation,
   overview grid, one URL per slide, phone-friendly layout.
4. Add the Pages workflow (`.github/workflows/pages.yml` or a `pages` job in
   `.gitlab-ci.yml`) and a README link.
5. Test it in the browser if a browser tool is available, and ask before
   committing.

Works best with a browser automation tool (e.g. Claude in Chrome) for
testing and ImageMagick for preparing images; neither is required.

## Layout

```text
.claude-plugin/marketplace.json        marketplace catalog
how-it-works-site/
  .claude-plugin/plugin.json           plugin manifest
  skills/how-it-works-site/SKILL.md    the skill
  skills/how-it-works-site/templates/  deck engine, theme, page skeleton, CI files
```

## Releasing (maintainers)

```bash
scripts/release.sh how-it-works-site 1.1.0
```

This bumps the version in `plugin.json` and `marketplace.json`, commits,
and pushes a `how-it-works-site--v1.1.0` tag. CI (`.github/workflows/ci.yml`)
validates the manifests, checks that the tag matches them, and publishes a
GitHub Release with the skill zipped for claude.ai. Every push and PR runs
the same validation.

## License

[MIT](LICENSE)
