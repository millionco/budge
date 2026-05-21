"use client";

import Script from "next/script";
import { useState } from "react";

interface TestSlide {
  label: string;
  property: string;
  min: number;
  max: number;
  value: number;
  original: number;
  unit: string;
  type?: "numeric" | "color";
  file?: string;
  line?: number;
}

interface TestCase {
  id: "padding" | "color" | "weight";
  title: string;
  description: string;
  slide: TestSlide;
}

const TEST_CASES: TestCase[] = [
  {
    id: "padding",
    title: "Padding",
    description: "Use ↑ / ↓ to adjust the card padding.",
    slide: {
      label: "padding",
      property: "padding",
      min: 8,
      max: 64,
      value: 24,
      original: 24,
      unit: "px",
      file: "apps/website/app/test-budge/test-budge-client.tsx",
      line: 120,
    },
  },
  {
    id: "color",
    title: "Text color",
    description: "Use ↑ / ↓ to cycle the heading hue.",
    slide: {
      label: "text color",
      property: "color",
      min: 0,
      max: 360,
      value: 220,
      original: 220,
      unit: "°",
      type: "color",
      file: "apps/website/app/test-budge/test-budge-client.tsx",
      line: 131,
    },
  },
  {
    id: "weight",
    title: "Font weight",
    description: "Use ↑ / ↓ to nudge the font weight number.",
    slide: {
      label: "font weight",
      property: "font-weight",
      min: 400,
      max: 800,
      value: 500,
      original: 500,
      unit: "",
      file: "apps/website/app/test-budge/test-budge-client.tsx",
      line: 144,
    },
  },
];

export function TestBudgeClient() {
  const [activeTestId, setActiveTestId] = useState<TestCase["id"]>("padding");
  const [budgeKey, setBudgeKey] = useState(0);
  const activeTest = TEST_CASES.find((testCase) => testCase.id === activeTestId) ?? TEST_CASES[0];
  const budgeConfig = JSON.stringify({
    slides: [activeTest.slide],
    autoFocus: true,
    testRun: budgeKey,
  });

  const selectTest = (testId: TestCase["id"]) => {
    setActiveTestId(testId);
    setBudgeKey((currentKey) => currentKey + 1);
  };

  const reopenBudge = () => {
    setBudgeKey((currentKey) => currentKey + 1);
  };

  return (
    <main className="page-content min-h-screen bg-[oklch(98.6%_0.002_67.8)] px-4 py-12 text-[#3f3f3f] antialiased">
      <Script src="/budge.iife.js" strategy="afterInteractive" />
      <div key={`${activeTest.id}-${budgeKey}`} data-budge={budgeConfig} hidden />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div>
          <div className="text-sm font-medium text-[#888]">built IIFE test</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Test Budge IIFE</h1>
          <p className="mt-3 max-w-xl text-[15px]/6 font-medium text-[#707070]">
            This page loads <code className="text-[#333]">/budge.iife.js</code>, not the website
            preview component. Pick an explicit target below, or press Cmd+E, hover an element, and
            click to test React Grab selection.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TEST_CASES.map((testCase) => (
            <button
              key={testCase.id}
              type="button"
              onClick={() => selectTest(testCase.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTestId === testCase.id
                  ? "bg-[#161616] text-white"
                  : "bg-white text-[#555] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:bg-[#f6f6f6]"
              }`}
            >
              {testCase.title}
            </button>
          ))}
          <button
            type="button"
            onClick={reopenBudge}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#555] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f6f6f6]"
          >
            Reopen Budge
          </button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div
            data-budge-target={activeTestId === "padding" ? "" : undefined}
            className="rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] transition-[background-color]"
            style={{ padding: 24 }}
          >
            <div className="rounded-xl bg-[#f5f5f5] p-4 text-sm font-medium text-[#666]">
              Padding target
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]">
            <h2
              data-budge-target={activeTestId === "color" ? "" : undefined}
              className="text-2xl font-semibold tracking-[-0.03em]"
              style={{ color: "#2563eb" }}
            >
              Color target
            </h2>
            <p className="mt-2 text-sm font-medium text-[#777]">
              This heading is the color target.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]">
            <p
              data-budge-target={activeTestId === "weight" ? "" : undefined}
              className="text-lg tracking-[-0.02em] text-[#333]"
              style={{ fontWeight: 500 }}
            >
              Font weight target
            </p>
            <p className="mt-2 text-sm font-medium text-[#777]">This text cycles options.</p>
          </div>
        </section>

        <div className="rounded-2xl bg-white p-5 text-sm/6 font-medium text-[#707070] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]">
          Active explicit config: <code className="text-[#333]">{activeTest.slide.property}</code>{" "}
          starts at <code className="text-[#333]">{activeTest.slide.value}</code>
          {activeTest.slide.unit}. Press Enter to copy the prompt, or press Cmd+E to ignore this
          explicit target and select any element manually.
        </div>
      </div>
    </main>
  );
}
