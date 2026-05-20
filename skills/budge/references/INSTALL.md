# Budge Installation

One step for any framework. The widget is inert when no config is present — safe to leave permanently.

## Next.js (App Router)

In `app/layout.tsx`:

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

## Remix / React Router

In `app/root.tsx`:

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

## Astro

In your base layout (e.g. `src/layouts/Layout.astro`):

```astro
<html lang="en">
  <body>
    <slot />
    <script src="https://www.budge.design/budge.iife.js" is:inline></script>
  </body>
</html>
```

## SvelteKit

In `src/app.html`:

```html
<body data-sveltekit-preload-data="hover">
  %sveltekit.body%
  <script src="https://www.budge.design/budge.iife.js"></script>
</body>
```

## Nuxt

In `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  app: {
    head: {
      script: [{ src: "https://www.budge.design/budge.iife.js", defer: true }],
    },
  },
});
```

## Vite (vanilla / any SPA)

In `index.html`:

```html
<body>
  <div id="app"></div>
  <script src="https://www.budge.design/budge.iife.js"></script>
</body>
```

## Plain HTML

```html
<body>
  <script src="https://www.budge.design/budge.iife.js"></script>
</body>
```

## How Activation Works

The IIFE loads from the CDN and stays inert until it can attach to a visual edit or a user-selected element. No wrapper component, no files to copy. Audio assets are resolved relative to the script's origin.

On local/dev hosts, Budge auto-detects HMR-driven `class` and `style` mutations. When it sees a focused numeric visual property change, it marks the changed element, generates slides, and mounts the bar automatically. Add `data-budge-autodetect="true"` to force this outside local/dev, or `data-budge-autodetect="false"` to disable it.

Budge also uses React Grab primitives for manual element selection. Press `Cmd+E`, select an element, and Budge appears with editable slides for that element.

The explicit config element remains available as a fallback:

When the agent activates budge, it adds a config element anywhere in the body:

```html
<div data-budge='{"slides":[...]}' hidden></div>
```

In JSX frameworks this looks like:

```tsx
<div data-budge={JSON.stringify({ slides: [...] })} hidden />
```

The IIFE watches for this element via MutationObserver and mounts/unmounts automatically. HMR updates are detected in real time — no page reload needed.
