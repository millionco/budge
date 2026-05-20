# budge

[![version](https://img.shields.io/npm/v/budge?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/budge)
[![downloads](https://img.shields.io/npm/dt/budge.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/budge)

Tweak UI without going back-and-forth with AI.

budge is a floating control bar that appears the moment your agent makes a visual change, so you can fine-tune the value with the arrow keys and copy back a clean prompt — no re-explaining "a little less padding".

### [Try out a demo! →](https://budge.design)

## Quick Start

Drop the script on the page and you're done. The IIFE is inert until budge detects a visual change or a manual selection.

```html
<script src="https://www.budge.design/budge.iife.js"></script>
```

## How It Works

budge watches the DOM for a single numeric `class` or `style` mutation, then opens a floating bar pinned to the changed element:

1. Your agent makes a single-property CSS or Tailwind change.
2. budge mounts on the changed element.
3. Press **↑↓** to fine-tune, **←→** to switch related properties, **T** to snap to design tokens.
4. **Enter** copies a clean prompt back to your agent. **Esc** reverts.

The copied prompt is plain edit instructions — paste it and your agent persists the value:

```txt
Set `padding` to `var(--spacing-md)`
```

You can also press **⌘E** to enter manual selection (powered by React Grab) and open budge on any element.

## Manual Installation

#### Next.js (App Router)

Add to `app/layout.tsx`:

```tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://www.budge.design/budge.iife.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
```

#### Remix / React Router

Add to `app/root.tsx`:

```tsx
export default function Root() {
  return (
    <html lang="en">
      <body>
        <Outlet />
        <script src="https://www.budge.design/budge.iife.js" />
      </body>
    </html>
  );
}
```

#### Astro

Add to your base layout (e.g. `src/layouts/Layout.astro`):

```astro
<html lang="en">
  <body>
    <slot />
    <script src="https://www.budge.design/budge.iife.js" is:inline></script>
  </body>
</html>
```

#### SvelteKit

Add to `src/app.html`:

```html
<body data-sveltekit-preload-data="hover">
  %sveltekit.body%
  <script src="https://www.budge.design/budge.iife.js"></script>
</body>
```

#### Nuxt

Add to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  app: {
    head: {
      script: [{ src: "https://www.budge.design/budge.iife.js", defer: true }],
    },
  },
});
```

#### Vite / Plain HTML

```html
<body>
  <div id="app"></div>
  <script src="https://www.budge.design/budge.iife.js"></script>
</body>
```

## Slides (Manual Fallback)

When auto-detect can't infer the change, you can hand budge a `slides` array via a hidden config element. Each slide describes one property:

```tsx
<div
  data-budge={JSON.stringify({
    slides: [
      { label: "padding-top",   property: "padding-top",   min: 0, max: 64, value: 16, original: 8,  unit: "px" },
      { label: "padding-bottom", property: "padding-bottom", min: 0, max: 64, value: 8,  original: 8,  unit: "px" },
    ],
  })}
  hidden
/>
```

| Property | Type | Description |
|---|---|---|
| `label` | string | Display name shown above the bar |
| `property` | string | CSS property applied to `[data-budge-target]` |
| `min` / `max` | number | Numeric range for stepping |
| `value` | number | Current value (your new value) |
| `original` | number | Value before the change |
| `unit` | string | `"px"`, `"%"`, `"em"`, etc. |
| `type?` | `"color"` | Only set for color properties |
| `scale?` | `"spacing" \| "radius" \| "text" \| "color" \| null` | Override auto-detected token scale |
| `tokens?` | `BudgeToken[]` | Explicit tokens (overrides CSS-var discovery) |

## Design Tokens

If your project defines tokens as CSS custom properties (`--spacing-md`, `--radius-lg`, …) on `:root` or via Tailwind v4's `@theme`, budge snaps **↑↓** through the scale and emits `var(--spacing-md)` in the copied prompt instead of raw pixels. Press **T** to toggle. Works with Tailwind v4, Shadcn, or any plain CSS variables.

## Repo Layout

```
.
├── packages/budge/      # the IIFE runtime (isolet-js → dist/budge.iife.js)
├── apps/website/        # budge.design — Next.js site + deployed IIFE
└── skills/budge/        # agent skill (SKILL.md + references)
```

## Resources & Contributing Back

Want to try it out? Check out [the demo](https://budge.design).

Looking to contribute back? Check out the [Contributing Guide](https://github.com/millionco/budge/blob/main/CONTRIBUTING.md).

Find a bug? Head over to our [issue tracker](https://github.com/millionco/budge/issues) and we'll do our best to help. We love pull requests, too!

[**Start contributing on GitHub**](https://github.com/millionco/budge/blob/main/CONTRIBUTING.md)

### License

budge is MIT-licensed open-source software © Million Software, Inc.
