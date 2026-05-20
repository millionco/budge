# budge

[![version](https://img.shields.io/npm/v/budge?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/budge)
[![downloads](https://img.shields.io/npm/dt/budge.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/budge)

A self-contained IIFE that puts a floating control bar on the page so you can fine-tune a single CSS property or Tailwind class change with the arrow keys.

> See the top-level [`SKILL.md`](../../SKILL.md) for how budge fits into the visual editing workflow, and [`references/INSTALL.md`](../../references/INSTALL.md) for framework-specific install snippets.

## Install (CDN)

```html
<script src="https://www.budge.design/budge.iife.js"></script>
```

Or in Next.js:

```tsx
import Script from "next/script";

<Script src="https://www.budge.design/budge.iife.js" strategy="afterInteractive" />
```

## Develop

From the repo root:

```bash
pnpm install
pnpm --filter budge dev      # isolet --watch, rebuilds dist/budge.iife.js on change
pnpm --filter budge build    # one-shot minified isolet build
```

The package is built with [isolet-js](https://github.com/aidenybai/isolet) — see `isolet.config.mjs`. The published artifact lives at `packages/budge/dist/budge.iife.js`.
