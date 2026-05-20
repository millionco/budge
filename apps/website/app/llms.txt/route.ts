import { NextResponse } from "next/server";

const content = `# budge

> the tiny design companion for your agent

## What is budge?

budge is a floating control bar that appears when your coding agent makes a visual change to your UI. It lets you fine-tune CSS values — padding, margin, color, font-size — then copy the result back to your agent to persist the change.

"add space above X" or "make Y less subtle" gets you 90% of the way there. budge is for the last 10%.

## How it works

1. Your agent makes a single-property CSS or Tailwind change
2. The always-on runtime detects the resulting HMR DOM change
3. budge appears as a floating bar on the page
4. Use ↑↓ to nudge the value, ←→ to switch between related properties
5. Press Enter to copy a prompt to your clipboard, then paste it back to your agent
6. Press Escape to dismiss and revert

## Installation

Install the skill, then type \`/budge\` to invoke it. Ask your agent to make a visual change and budge will appear.

\`\`\`
/skill install https://budge.design/budge
\`\`\`

## Scope

**In scope:** Raw CSS property values, inline styles, Tailwind utility class changes, SVG presentation attributes (\`fill\`, \`stroke\`, etc.).

**Out of scope:** Sass/Less variables, CSS custom property definitions (\`--spacing\`), CSS-in-JS theme tokens.

## Runtime

budge is a self-contained IIFE loaded from \`https://budge.design/budge.iife.js\` via \`next/script\`. On local/dev hosts, it watches HMR-driven \`class\` and \`style\` mutations, infers the latest numeric visual property change, and mounts automatically. It also uses React Grab primitives for manual selection: press \`Cmd+E\`, select an element, and budge opens. It also supports a \`data-budge\` config element as a fallback. It handles live preview on \`[data-budge-target]\` elements, arrow key stepping, slide navigation, audio feedback, submit, and cancel entirely client-side.

## Slide configuration

For manual fallback, the agent builds a \`slides\` array and injects it as a JSON config element in the DOM. Each slide has this shape:

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display name shown above bar |
| property | string | CSS property to apply to \`[data-budge-target]\` |
| min | number | Minimum numeric value |
| max | number | Maximum numeric value |
| value | number | Current value (the one the agent set) |
| original | number | Value before the change |
| unit | string | \`"px"\`, \`"%"\`, \`"em"\`, etc. |
| type | \`"color"?\` | Only set for color properties |

## Tailwind resolution

Tailwind classes are resolved to CSS properties and pixel values (spacing scale × 4):

| Tailwind class | CSS property | Value |
|----------------|-------------|-------|
| \`p-4\` | padding | 16px |
| \`px-4\` | padding-left / padding-right | 16px |
| \`py-4\` | padding-top / padding-bottom | 16px |
| \`mt-4\` | margin-top | 16px |
| \`gap-4\` | gap | 16px |
| \`text-[14px]\` | font-size | 14px |
| \`rounded-lg\` | border-radius | 8px |

## Links

- Website: https://budge.design
- Next.js App Router only
`;

export const GET = () =>
  new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
