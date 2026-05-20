"use client";

import {
  BudgeMePaperPreview,
  type PreviewFeatures,
} from "@/components/budge-me-paper-preview";

const BLOG = { showLabel: false, showButtons: false, showText: false } as const;

const STAGE_1: PreviewFeatures = { ...BLOG };

const STAGE_2: PreviewFeatures = { ...BLOG, keyboard: true };

const STAGE_3: PreviewFeatures = { ...BLOG, keyboard: true, expandValue: true };

const STAGE_3B: PreviewFeatures = { ...BLOG, keyboard: true, expandValue: true, animatedDigits: true };

const STAGE_4: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
};

const STAGE_5: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
};

const STAGE_6: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
  sound: true,
};

const STAGE_7: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
  numberInput: true,
};

const STAGE_8: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
  buttonFeedback: true,
  shiftStep: true,
  numberInput: true,
};

const STAGE_SLIDES: PreviewFeatures = {
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
  buttonFeedback: true,
  shiftStep: true,
  numberInput: true,
  sound: true,
  showLabel: true,
  showButtons: true,
  showText: true,
};

export default function BuildingThePreviewPage() {
  return (
    <div className="[font-synthesis:none] overflow-x-clip antialiased min-h-screen bg-white flex flex-col items-center">
      <div className="page-content w-full flex flex-col items-center pt-3 sm:pt-6 pb-24">
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <a
            href="/"
            className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#999] hover:text-[#555] transition-colors"
          >
            &larr; back
          </a>

          <div className="flex flex-col gap-24 mt-10">
            <Section title="The value readout">
              <P>
                The readout slides in fast and collapses gently — responsiveness on engagement, patience on disengagement. Clicking the arrows doesn&apos;t expand it, because the expanding readout would push the buttons sideways. Per{" "}
                <a href="https://lawsofux.com/fittss-law/" className="text-[#555] underline underline-offset-2 hover:text-[#333] transition-colors">Fitts&apos;s Law</a>
                , your target just moved out from under your cursor.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_3} />
              </Demo>
            </Section>

            <Section title="Animated digits">
              <P>
                Swapping numbers instantly felt disconnected — no causality between the arrow and the value. Rolling each digit in its slot fixed it: press up, the digit rolls up. Direct manipulation, not a label update.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_3B} />
              </Demo>
            </Section>

            <Section title="Physics">
              <P>
                What makes a physical button satisfying is asymmetry: fast snap on press, slow springy recovery on release. If both halves were the same speed it would feel mushy. The bar&apos;s background subtly stretches in the direction of the budge — barely perceptible, but it registers subconsciously. At idle, the bar recedes; the moment you interact, it snaps to full presence.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_4} />
              </Demo>
            </Section>

            <Section title="Boundaries">
              <P>
                The bar shakes — borrowed from macOS password fields, an instantly recognizable &ldquo;no.&rdquo; The sound plays once on impact, not on every repeat, because alarm fatigue is real. Spam the boundary 20 times and a &ldquo;Min&rdquo; or &ldquo;Max&rdquo; label floats up:{" "}
                <a href="https://lawsofux.com/hicks-law/" className="text-[#555] underline underline-offset-2 hover:text-[#333] transition-colors">progressive disclosure</a>
                .
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_5} />
              </Demo>
            </Section>

            <Section title="Sound">
              <P>
                Without sound, even polished animation feels like a puppet show. Synthesized clicks sounded thin, so I switched to real keyboard samples (the Oreo switch from{" "}
                <a href="https://tryklack.com" className="text-[#555] underline underline-offset-2 hover:text-[#333] transition-colors">Klack</a>
                ). Three samples alternate with slight volume variation — identical repetition sounds robotic. Different actions get different keys from the same switch family, creating an audio hierarchy that mirrors the visual one.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_6} />
              </Demo>
            </Section>

            <Section title="Number input">
              <P>
                Three tiers for three intents: arrows for fine adjustment, Shift+Arrow for 10× jumps, direct typing for exact values. Typing follows{" "}
                <a href="https://lawsofux.com/postels-law/" className="text-[#555] underline underline-offset-2 hover:text-[#333] transition-colors">Postel&apos;s Law</a>
                : show what you typed honestly, turn it gray if it&apos;s out of bounds, then gently clamp. Honest input, graceful correction.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_7} />
              </Demo>
            </Section>

            <Section title="Input equivalence">
              <P>
                Holding a mouse button on the arrows repeats identically to holding a key — same delay, same rate, same sound. The same action should feel the same regardless of how you trigger it.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_8} />
              </Demo>
            </Section>

            <Section title="Slides">
              <P>
                Four focused slides instead of everything at once ({" "}
                <a href="https://lawsofux.com/hicks-law/" className="text-[#555] underline underline-offset-2 hover:text-[#333] transition-colors">Hick&apos;s Law</a>
                ). Each preserves its state — losing someone&apos;s work because they navigated away erodes trust. Color skips the numeric readout and tints the arrows directly, because &ldquo;220°&rdquo; tells you nothing.
              </P>
              <div className="mt-6">
                <BudgeMePaperPreview features={STAGE_SLIDES} />
              </div>
            </Section>

            <Section title="The prompt">
              <P>
                Enter copies a prompt like <Code>Set font-size to 48px</Code> to the clipboard, shown below with live-rolling digits. The &ldquo;Copied&rdquo; confirmation springs in with the same bouncy scale as everything else — consistency in motion is what makes a control feel like one coherent object.
              </P>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[18px]/5.75">
        {title}
      </div>
      {children}
    </div>
  );
}

function Demo({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-center">{children}</div>;
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mb-4">
      {children}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[13.5px] text-[#555] bg-[#F5F5F5] rounded px-1 py-0.5">
      {children}
    </code>
  );
}
