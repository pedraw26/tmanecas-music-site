# TMANECAS Project Guardrails

## Canonical project

- The only editable project for the TMANECAS website is:
  `/Users/pedrogomes/Documents/tmanecas-music-site`
- Treat this directory as the repository root for every TMANECAS task.
- Before editing, confirm the working directory and Git root both resolve to this exact path.

## Protected projects

- Never edit, copy changes into, serve, or publish from:
  `/Users/pedrogomes/Documents/AURA HAIR STUDIO`
- Never modify any other website under `/Users/pedrogomes/Documents` while working on TMANECAS.
- A protected project may only be touched if the user explicitly names that exact project and asks for a change there.

## Page identification

- The official TMANECAS homepage is `index.html` in the canonical project root.
- Follow the actual navigation links from that homepage to identify secondary pages; do not guess routes from browser history, cached tabs, or old template names.
- The current releases/works page is `releases/index.html`.
- The current music page is `music/index.html`.

## Preview and publishing

- Local preview on port 3000 must serve the canonical TMANECAS repository root, never the AURA template directory.
- Make and verify changes locally first.
- Do not commit, push, deploy, or update GitHub Pages unless the user explicitly asks to send the changes live.
- Always give the user a direct local preview link after an edit.

## Safety check before every edit

1. Run `pwd`.
2. Run `git rev-parse --show-toplevel`.
3. Continue only when both point to `/Users/pedrogomes/Documents/tmanecas-music-site`.
4. If either check points elsewhere, stop and switch to the canonical project before editing.
