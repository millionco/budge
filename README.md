# budge

[![version](https://img.shields.io/npm/v/budge?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/budge)
[![downloads](https://img.shields.io/npm/dt/budge.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/budge)

A floating control bar for single-property visual changes. Drop the IIFE on any page, change a CSS value or Tailwind class once, and budge appears so the human (or agent) can fine-tune the result with the arrow keys before committing.

The agent-side workflow lives in [`skills/budge/SKILL.md`](./skills/budge/SKILL.md). Framework-specific install snippets live in [`skills/budge/references/INSTALL.md`](./skills/budge/references/INSTALL.md).

## Quick start

```html
<script src="https://www.budge.design/budge.iife.js"></script>
```

Next.js (App Router):

```tsx
import Script from "next/script";

<Script src="https://www.budge.design/budge.iife.js" strategy="afterInteractive" />
```

## Repo layout

```
.
├── packages/
│   └── budge/            # the IIFE runtime (isolet-js build → dist/budge.iife.js)
├── apps/
│   └── website/          # budge.design — Next.js site that hosts the IIFE + docs
└── skills/
    └── budge/            # agent skill (SKILL.md) + references/ used by the skill

```

## Develop

Requires Node >= 22 and pnpm >= 8.

```bash
pnpm install

pnpm --filter budge dev          # watch-build the IIFE
pnpm --filter @budge/website dev # run the marketing/docs site
```

Top-level commands (Turbo fans these out across the workspace):

```bash
pnpm build       # build all packages + the website
pnpm dev         # dev mode for everything (persistent)
pnpm typecheck   # tsc across the workspace
pnpm lint        # vp lint (oxlint)
pnpm format      # vp fmt (oxfmt)
pnpm check       # vp check
```

## Release

```bash
pnpm changeset   # describe the change
pnpm version     # bump versions + write CHANGELOG
pnpm release     # build + publish
```

## License

MIT — see [`LICENSE`](./LICENSE).
