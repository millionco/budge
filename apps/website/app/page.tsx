/**
 * from Paper
 * https://app.paper.design/file/01KN3QGZ2REZDFZ3FZCNWXEANN?node=F18-0
 * on Apr 4, 2026
 */
import { BudgeMePaperPreview } from "@/components/budge-me-paper-preview";
import { BudgeLogo } from "@/components/budge-logo";
import { CodeBlock } from "@/components/code-block";

export default function HomePage() {
  return (
    <div className="[font-synthesis:none] overflow-x-clip antialiased min-h-screen bg-[oklch(98.6%_0.002_67.8)] flex flex-col items-center justify-center">
      <div className="page-content w-full flex flex-col items-center py-12">
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="mb-0 mt-8 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[15px]/[22px]">
            <BudgeLogo>budge</BudgeLogo>
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] mt-[17px] mb-6 font-medium text-[15px]/[22px] text-[#696969]">
            An agent skill to tweak UI without going back-and-forth with AI
          </div>
          <ul className="[letter-spacing:0em] font-medium text-[15px]/[22px] text-[#707070] list-none p-0 m-0 space-y-1">
            <li>↑↓ to fine-tune the value</li>
            <li>←→ to switch between properties</li>
            <li>T to snap to design tokens</li>
            <li>Enter to copy the prompt to clipboard</li>
          </ul>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-4">
            Works in Claude Code, Codex, Cursor.
          </div>
          <div className="relative [font-synthesis:none] mt-5 w-full rounded-[12px] border border-solid border-[color(display-p3_0_0_0/0.1)] bg-[color(display-p3_0.991_0.991_0.991)] px-3.5 py-2.75 text-[13px]/[20px] font-medium text-[#707070] [box-shadow:#0000001A_0px_0px_0px_1px,#00000014_0px_1px_2px_-1px,#0000000F_0px_3px_8px_-3px] antialiased">
            <span className="font-semibold text-[#3F3F3F]">New:</span> budge now auto-detects local style changes and opens itself when your agent nudges spacing, type, radius, or size.
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0 pb-6">
          <div className="[font-synthesis:none] flex w-full min-w-0 h-fit flex-col gap-4.25 antialiased mt-8">
            <BudgeMePaperPreview autoFocus />
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="mb-0 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[15px]/[22px]">
            usage
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-4">
            Install the skill and leave the script on the page. Ask your agent to make a visual change; on local dev, budge can detect the update and appear automatically.
          </div>
          <CodeBlock />
          <div className="mb-0 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[15px]/[22px] mt-8">
            tokens
          </div>
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mt-4">
            If your project defines design tokens as CSS custom properties (<code className="font-mono-override text-[#3F3F3F]">--spacing-md</code>, <code className="font-mono-override text-[#3F3F3F]">--radius-lg</code>, etc.), ↑↓ snaps through the scale and the copied prompt reads <code className="font-mono-override text-[#3F3F3F]">var(--spacing-md)</code> instead of raw pixels. Works with Tailwind v4&rsquo;s <code className="font-mono-override text-[#3F3F3F]">@theme</code>, Shadcn, or any <code className="font-mono-override text-[#3F3F3F]">:root</code> variables. Press <code className="font-mono-override text-[#3F3F3F]">T</code> to toggle.
          </div>
          <div className="overflow-x-auto rounded-[14px] mt-6 border border-solid border-[color(display-p3_1_1_1)] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] bg-[color(display-p3_0.991_0.991_0.991)]">
            <table className="w-full text-[13px]/[20px] font-mono">
              <thead>
                <tr className="border-b border-[color(display-p3_0_0_0/0.06)] text-left text-[#707070]">
                  <th className="px-3 py-2 font-medium">Property</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-[#3F3F3F]">
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">label</td><td className="px-3 py-2 text-[#999]">string</td><td className="px-3 py-2">Display name shown above bar</td></tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">property</td><td className="px-3 py-2 text-[#999]">string</td><td className="px-3 py-2">CSS property to apply</td></tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">min</td><td className="px-3 py-2 text-[#999]">number</td><td className="px-3 py-2">Minimum numeric value</td></tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">max</td><td className="px-3 py-2 text-[#999]">number</td><td className="px-3 py-2">Maximum numeric value</td></tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">value</td><td className="px-3 py-2 text-[#999]">number</td><td className="px-3 py-2">Current value</td></tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">original</td><td className="px-3 py-2 text-[#999]">number</td><td className="px-3 py-2">Value before the change</td></tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">unit</td><td className="px-3 py-2 text-[#999]">string</td><td className="px-3 py-2">{'"px"'}, {'"%"'}, {'"em"'}, etc.</td></tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">type</td><td className="px-3 py-2 text-[#999]">{'"color"?'}</td><td className="px-3 py-2">Only set for color properties</td></tr>
                <tr className="border-b border-[color(display-p3_0_0_0/0.04)]"><td className="px-3 py-2">scale</td><td className="px-3 py-2 text-[#999]">{'"spacing" | "radius" | "text" | "color" | null?'}</td><td className="px-3 py-2">Override auto-detected token scale</td></tr>
                <tr><td className="px-3 py-2">tokens</td><td className="px-3 py-2 text-[#999]">BudgeToken[]?</td><td className="px-3 py-2">Explicit tokens (overrides CSS-var discovery)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0 mt-8">
          <a
            href="https://benmac.com"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-[color(display-p3_0.1632_0.5398_0.9268)] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium underline decoration-[color(display-p3_0.669_0.821_1)] decoration-2 underline-offset-[5px] text-[15px]/[22px] transition-[text-decoration-color] duration-200 ease-out hover:decoration-[color(display-p3_0.48_0.66_0.92)]"
          >
            ben maclaurin
          </a>
        </div>
      </div>
    </div>
  );
}
