"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calligraph } from "calligraph";
import { defineSound, ensureReady } from "@web-kits/audio";
import { useIsMobile } from "@/hooks/use-is-mobile";

const FONT = "'Open Runde', system-ui, sans-serif";
const SHAKE_KEYFRAMES = `@keyframes __budge-shake{0%,100%{translate:0}25%{translate:-2px}50%{translate:2px}75%{translate:-1px}}@keyframes budge-copied-in{0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}`;
let shakeInjected = false;
const ARROW_D =
  "M13.415 2.5C12.634 1.719 11.367 1.719 10.586 2.5L3.427 9.659C2.01 11.076 3.014 13.5 5.018 13.5H7V20C7 21.104 7.895 22 9 22H15C16.105 22 17 21.104 17 20V13.5H18.983C20.987 13.5 21.991 11.076 20.574 9.659L13.415 2.5Z";
const ORIGINAL = 61;

type Token = { name: string; value: number };

const SLIDES: {
  label: string;
  min: number;
  max: number;
  original: number;
  unit: string;
  demo: number;
  tokens?: Token[];
}[] = [
  {
    label: "font size",
    min: 32,
    max: 86,
    original: 61,
    unit: "px",
    demo: 48,
    tokens: [
      { name: "sm", value: 36 },
      { name: "md", value: 48 },
      { name: "lg", value: 61 },
      { name: "xl", value: 72 },
      { name: "2xl", value: 86 },
    ],
  },
  { label: "opacity", min: 0, max: 100, original: 100, unit: "%", demo: 20 },
  {
    label: "padding",
    min: 6,
    max: 48,
    original: 16,
    unit: "px",
    demo: 6,
    tokens: [
      { name: "xs", value: 6 },
      { name: "sm", value: 10 },
      { name: "md", value: 16 },
      { name: "lg", value: 24 },
      { name: "xl", value: 32 },
      { name: "2xl", value: 48 },
    ],
  },
  { label: "color", min: 0, max: 360, original: 220, unit: "°", demo: 160 },
];

function matchToken(tokens: Token[] | undefined, value: number): Token | null {
  if (!tokens) return null;
  return tokens.find((t) => Math.abs(t.value - value) < 0.5) ?? null;
}

function nextTokenValue(tokens: Token[], current: number, direction: 1 | -1): number | null {
  const sorted = [...tokens].sort((a, b) => a.value - b.value);
  if (direction > 0) {
    const t = sorted.find((t) => t.value > current + 0.5);
    return t ? t.value : null;
  } else {
    const t = [...sorted].reverse().find((t) => t.value < current - 0.5);
    return t ? t.value : null;
  }
}

// Wrap v into [min, max] so overshoots loop around. Assumes unit step — the
// period is (max - min + 1) so max+1 → min and min-1 → max.
function wrapValue(v: number, min: number, max: number): number {
  const period = max - min + 1;
  const offset = ((v - min) % period + period) % period;
  return min + offset;
}

// ---------------------------------------------------------------------------
// Audio — "hover" from the mechanical patch in @web-kits/audio
// (https://audio.raphaelsalaja.com/library/mechanical).
// ---------------------------------------------------------------------------

// HRTF-panned tick. Centered between the ears with a subtle vertical offset:
// up-ticks image slightly above the listener, down-ticks slightly below.
const hover = defineSound({
  source: { type: "noise", color: "white" },
  filter: { type: "highpass", frequency: 6000 },
  envelope: { attack: 0, decay: 0.008, sustain: 0, release: 0.003 },
  gain: 0.05,
  panner: {
    positionX: 0,
    positionY: 0.04,
    positionZ: 0,
    panningModel: "HRTF",
  },
});

// Slightly quieter variant for the down-arrow tick, panned slightly below ear.
const hoverDown = defineSound({
  source: { type: "noise", color: "white" },
  filter: { type: "highpass", frequency: 6000 },
  envelope: { attack: 0, decay: 0.008, sustain: 0, release: 0.003 },
  gain: 0.035,
  panner: {
    positionX: 0,
    positionY: -0.04,
    positionZ: 0,
    panningModel: "HRTF",
  },
});

// "tab-switch" from the minimal patch at audio.raphaelsalaja.com/library/minimal.
const tabSwitch = defineSound({
  source: { type: "sine", frequency: 1050 },
  envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
  gain: 0.07,
});

// "success" from the minimal patch at audio.raphaelsalaja.com/library/minimal.
const success = defineSound({
  layers: [
    {
      source: { type: "sine", frequency: 523 },
      envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.015 },
      gain: 0.1,
    },
    {
      source: { type: "sine", frequency: 784 },
      envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.015 },
      delay: 0.06,
      gain: 0.08,
    },
  ],
});

// "undo" from the minimal patch at audio.raphaelsalaja.com/library/minimal.
const undo = defineSound({
  source: { type: "sine", frequency: { start: 800, end: 600 } },
  envelope: { attack: 0, decay: 0.035, sustain: 0, release: 0.01 },
  gain: 0.07,
});

// "toggle-on" from the minimal patch at audio.raphaelsalaja.com/library/minimal.
const toggleOn = defineSound({
  layers: [
    {
      source: { type: "sine", frequency: 880 },
      envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
      gain: 0.08,
    },
    {
      source: { type: "sine", frequency: 1320 },
      envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
      delay: 0.03,
      gain: 0.07,
    },
  ],
});

// "toggle-off" from the minimal patch at audio.raphaelsalaja.com/library/minimal.
const toggleOff = defineSound({
  layers: [
    {
      source: { type: "sine", frequency: 1320 },
      envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
      gain: 0.08,
    },
    {
      source: { type: "sine", frequency: 880 },
      envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
      delay: 0.03,
      gain: 0.07,
    },
  ],
});

// "toggle-on" / "toggle-off" from the mechanical patch at
// audio.raphaelsalaja.com/library/mechanical — used for token-snap toggle.
const tokenSnapOn = defineSound({
  layers: [
    {
      source: { type: "noise", color: "white" },
      filter: { type: "bandpass", frequency: 2000, resonance: 3 },
      envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
      gain: 0.12,
    },
    {
      source: { type: "noise", color: "white" },
      filter: { type: "bandpass", frequency: 4500, resonance: 3 },
      envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
      delay: 0.025,
      gain: 0.1,
    },
  ],
});

const tokenSnapOff = defineSound({
  layers: [
    {
      source: { type: "noise", color: "white" },
      filter: { type: "bandpass", frequency: 4500, resonance: 3 },
      envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
      gain: 0.12,
    },
    {
      source: { type: "noise", color: "white" },
      filter: { type: "bandpass", frequency: 2000, resonance: 3 },
      envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
      delay: 0.025,
      gain: 0.1,
    },
  ],
});

const swoosh = defineSound({
  source: { type: "sine", frequency: { start: 600, end: 1400 } },
  envelope: { attack: 0.005, decay: 0.04, sustain: 0, release: 0.015 },
  gain: 0.05,
});

let lastTickTime = 0;

function playHover(up = true) {
  ensureReady();
  (up ? hover : hoverDown)();
}

function playConfirm() {
  ensureReady();
  success();
}

function playTick(held = false, up = true) {
  const now = performance.now();
  if (held && now - lastTickTime < 50) return;
  lastTickTime = now;
  playHover(up);
}

function playTabSwitch() {
  ensureReady();
  tabSwitch();
}

function playUndo() {
  ensureReady();
  undo();
}

function playToggleOn() {
  ensureReady();
  toggleOn();
}

function playToggleOff() {
  ensureReady();
  toggleOff();
}

function playTokenSnap(on: boolean) {
  ensureReady();
  (on ? tokenSnapOn : tokenSnapOff)();
}

function playSwoosh() {
  ensureReady();
  swoosh();
}

function Arrow({
  active,
  down,
  disabled,
  bounce = true,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  activeColor,
}: {
  active: boolean;
  down?: boolean;
  disabled?: boolean;
  bounce?: boolean;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  activeColor?: string;
}) {
  const fill = disabled ? "#A7A7A7" : active ? (activeColor ?? "#FFFFFF") : "#A7A7A7";
  const doBounce = bounce && active && !disabled;
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onPointerDown={disabled ? undefined : onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      style={{
        width: 19,
        height: "auto",
        flexShrink: 0,
        cursor: disabled ? "default" : "pointer",
        transform: `rotate(${down ? 180 : 0}deg) translateY(${doBounce ? -2.5 : 0}px) scale(${doBounce ? 1.08 : 1})`,
        transition: bounce
          ? (active
            ? "transform 0.03s cubic-bezier(0, 0, 0.2, 1)"
            : "transform 0.45s cubic-bezier(0.34, 1.8, 0.64, 1)")
          : "none",
      }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={ARROW_D}
        fill={fill}
        style={{
          transition: disabled
            ? "fill 0.2s ease"
            : active ? "fill 0.05s ease" : "fill 0.3s ease",
        }}
      />
    </svg>
  );
}

export interface PreviewFeatures {
  keyboard?: boolean;
  expandValue?: boolean;
  animatedDigits?: boolean;
  arrowBounce?: boolean;
  barPhysics?: boolean;
  boundaryShake?: boolean;
  sound?: boolean;
  buttonFeedback?: boolean;
  numberInput?: boolean;
  shiftStep?: boolean;
  idleOpacity?: boolean;
  showLabel?: boolean;
  showButtons?: boolean;
  showText?: boolean;
}

const ALL_FEATURES: PreviewFeatures = {
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  boundaryShake: true,
  sound: true,
  buttonFeedback: true,
  numberInput: true,
  shiftStep: true,
  idleOpacity: true,
  showLabel: true,
  showButtons: true,
  showText: true,
};

export function BudgeMePaperPreview({ features: f = ALL_FEATURES, autoFocus }: { features?: PreviewFeatures; autoFocus?: boolean } = {}) {
  const isMobile = useIsMobile();
  const [value, setValue] = useState(ORIGINAL);
  const [typedRaw, setTypedRaw] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<"up" | "down" | null>(null);
  const [isBudging, setIsBudging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pressedButton, setPressedButton] = useState<"reset" | "copy" | "prev" | "next" | "mute" | null>(null);
  const [muted, setMuted] = useState(false);
  const [resetHovered, setResetHovered] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);
  const [muteHovered, setMuteHovered] = useState(false);
  const muteRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mutePos, setMutePos] = useState<{ top: number; left: number } | null>(null);
  const slideValuesRef = useRef<number[]>(SLIDES.map(s => s.original));
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [slideRangeVisible, setSlideRangeVisible] = useState(false);
  const [slideRangeIdle, setSlideRangeIdle] = useState(true);
  const [barHovered, setBarHovered] = useState(false);
  const slideRangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const budgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const confirmedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const digitBufferRef = useRef("");
  const digitTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const valueRef = useRef(ORIGINAL);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [snapToTokens, setSnapToTokens] = useState(false);
  const snapToTokensRef = useRef(snapToTokens);
  snapToTokensRef.current = snapToTokens;
  const snapMountedRef = useRef(false);
  const [toastLabel, setToastLabel] = useState<string | null>(null);
  const toastLabelTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "t" && e.key !== "T") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      setSnapToTokens((c) => {
        const next = !c;
        if (f.sound && !muted) playTokenSnap(next);
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [f.sound, muted]);

  useEffect(() => {
    if (!snapMountedRef.current) {
      snapMountedRef.current = true;
      return;
    }
    setToastLabel(snapToTokens ? "token snap on" : "token snap off");
    setSlideRangeVisible(true);
    clearTimeout(toastLabelTimeoutRef.current);
    clearTimeout(slideRangeTimeoutRef.current);
    toastLabelTimeoutRef.current = setTimeout(() => {
      setSlideRangeVisible(false);
      setTimeout(() => setToastLabel(null), 300);
    }, 1400);
  }, [snapToTokens]);

  useEffect(() => {
    if (!shakeInjected) {
      const style = document.createElement("style");
      style.textContent = SHAKE_KEYFRAMES;
      document.head.appendChild(style);
      shakeInjected = true;
    }
  }, []);

  useEffect(() => {
    if (autoFocus && !isMobile) containerRef.current?.focus();
  }, [autoFocus, isMobile]);

  useEffect(() => {
    if (f.sound) ensureReady();
  }, [f.sound]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWindowFocus() {
      if (el && el.contains(document.activeElement) || document.activeElement === document.body) {
        el?.focus();
      }
    }
    window.addEventListener("focus", onWindowFocus);
    return () => window.removeEventListener("focus", onWindowFocus);
  }, []);

  const [slide, setSlide] = useState(0);
  const slideRef = useRef(0);
  const s = SLIDES[slide];
  const soundOn = f.sound && !muted;

  const goToSlide = useCallback((direction: number) => {
    const N = SLIDES.length;
    const cur = slideRef.current;
    const next = ((cur + direction) % N + N) % N;
    slideValuesRef.current[cur] = valueRef.current;
    slideRef.current = next;
    setSlide(next);
    const restored = slideValuesRef.current[next];
    valueRef.current = restored;
    setValue(restored);
    setTypedRaw(null);
    setIsBudging(false);
    setConfirmed(false);
    setShowPrompt(false);
    setActiveKey(null);
    digitBufferRef.current = "";
    clearTimeout(digitTimeoutRef.current);
    clearTimeout(budgeTimeoutRef.current);
    clearTimeout(confirmedTimeoutRef.current);

    clearTimeout(slideRangeTimeoutRef.current);
    setSlideRangeVisible(true);
    setSlideRangeIdle(false);
    slideRangeTimeoutRef.current = setTimeout(() => {
      setSlideRangeVisible(false);
      setTimeout(() => setSlideRangeIdle(true), 400);
    }, 800);

    if (soundOn) playTabSwitch();
  }, [soundOn]);


  const applyDigitBufferRef = useRef(() => {});
  applyDigitBufferRef.current = () => {
    const num = parseInt(digitBufferRef.current, 10);
    digitBufferRef.current = "";
    if (isNaN(num)) return;
    const cs = SLIDES[slideRef.current];
    const wrapped = wrapValue(num, cs.min, cs.max);
    if (wrapped !== valueRef.current) {
      valueRef.current = wrapped;
      setValue(wrapped);
      setIsBudging(true);
      clearTimeout(budgeTimeoutRef.current);
      budgeTimeoutRef.current = setTimeout(() => setIsBudging(false), 600);
      playTick();
    }
  };

  const step = useCallback((direction: number, shift = false, held = false) => {
    const cs = SLIDES[slideRef.current];
    const mult = (f.shiftStep && shift) ? 10 : 1;
    const prev = valueRef.current;
    let next: number;
    if (snapToTokensRef.current && cs.tokens && !shift) {
      const tokenNext = nextTokenValue(cs.tokens, valueRef.current, direction > 0 ? 1 : -1);
      // No more bounds — loop: past last token, pick first (and vice versa).
      if (tokenNext !== null) {
        next = tokenNext;
      } else {
        const sorted = [...cs.tokens].sort((a, b) => a.value - b.value);
        next = direction > 0 ? sorted[0].value : sorted[sorted.length - 1].value;
      }
    } else {
      next = wrapValue(valueRef.current + direction * mult, cs.min, cs.max);
    }
    valueRef.current = next;
    setValue(valueRef.current);
    if (soundOn) {
      const cycled = next !== prev && (direction > 0 ? next < prev : next > prev);
      if (cycled) playSwoosh();
      else playTick(held, direction > 0);
    }
  }, [f.shiftStep, soundOn]);

  const triggerBudge = useCallback(
    (dir: "up" | "down") => {
      step(dir === "up" ? 1 : -1);
      setActiveKey(dir);
      setTimeout(() => setActiveKey(null), 100);
    },
    [step],
  );

  const startHold = useCallback((dir: "up" | "down") => {
    const d = dir === "up" ? 1 : -1;
    step(d);
    setActiveKey(dir);
    clearTimeout(budgeTimeoutRef.current);
    if (isBudging) {
      setIsBudging(true);
    }
    clearTimeout(holdTimeoutRef.current);
    clearInterval(holdIntervalRef.current);
    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        step(d, false, true);
      }, 50);
    }, 300);
  }, [step, isBudging]);

  const stopHold = useCallback(() => {
    clearTimeout(holdTimeoutRef.current);
    clearInterval(holdIntervalRef.current);
    setActiveKey(null);
    if (isBudging) {
      clearTimeout(budgeTimeoutRef.current);
      budgeTimeoutRef.current = setTimeout(() => setIsBudging(false), 600);
    }
  }, [isBudging]);

  const reset = useCallback(() => {
    const cs = SLIDES[slideRef.current];
    valueRef.current = cs.original;
    setValue(cs.original);
    setIsBudging(true);
    if (f.buttonFeedback) setPressedButton("reset");
    clearTimeout(budgeTimeoutRef.current);
    budgeTimeoutRef.current = setTimeout(() => setIsBudging(false), 600);
    if (f.buttonFeedback) setTimeout(() => setPressedButton(null), 70);
    if (soundOn) playUndo();
  }, [f.buttonFeedback, soundOn]);

  const copy = useCallback(() => {
    const idx = slideRef.current;
    const cs = SLIDES[idx];
    const props = ["font-size", "opacity", "padding", "color"];
    const prop = props[idx] ?? props[0];
    const val = idx === 3 ? `hsl(${valueRef.current}, 70%, 55%)` : `${valueRef.current}${cs.unit}`;
    const prompt = `Set \`${prop}\` to \`${val}\``;
    navigator.clipboard?.writeText(prompt);
    setShowPrompt(true);
    setConfirmed(true);
    setIsBudging(true);
    if (f.buttonFeedback) setPressedButton("copy");
    clearTimeout(confirmedTimeoutRef.current);
    confirmedTimeoutRef.current = setTimeout(() => {
      setConfirmed(false);
      setIsBudging(false);
    }, 800);
    if (f.buttonFeedback) setTimeout(() => setPressedButton(null), 70);
    if (soundOn) playConfirm();
  }, [f.buttonFeedback, soundOn]);

  const stepRef = useRef(step);
  stepRef.current = step;
  const resetRef = useRef(reset);
  resetRef.current = reset;
  const copyRef = useRef(copy);
  copyRef.current = copy;

  useEffect(() => {
    if (!f.keyboard) return;

    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement | null)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        stepRef.current(1, e.shiftKey, e.repeat);
        setActiveKey("up");
        if (f.expandValue) {
          setIsBudging(true);
          clearTimeout(budgeTimeoutRef.current);
          budgeTimeoutRef.current = setTimeout(() => setIsBudging(false), 600);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        stepRef.current(-1, e.shiftKey, e.repeat);
        setActiveKey("down");
        if (f.expandValue) {
          setIsBudging(true);
          clearTimeout(budgeTimeoutRef.current);
          budgeTimeoutRef.current = setTimeout(() => setIsBudging(false), 600);
        }
      } else if (f.numberInput && e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        if (digitBufferRef.current.length >= 3) return;
        digitBufferRef.current += e.key;
        const num = parseInt(digitBufferRef.current, 10);
        const ds = SLIDES[slideRef.current];
        if (!isNaN(num)) {
          setTypedRaw(digitBufferRef.current);
          setIsBudging(true);
          playTick();
          if (num >= ds.min && num <= ds.max) {
            valueRef.current = num;
            setValue(num);
          }
        }
        clearTimeout(digitTimeoutRef.current);
        clearTimeout(budgeTimeoutRef.current);
        digitTimeoutRef.current = setTimeout(() => {
          const final = parseInt(digitBufferRef.current, 10);
          digitBufferRef.current = "";
          const ds2 = SLIDES[slideRef.current];
          if (!isNaN(final) && (final < ds2.min || final > ds2.max)) {
            const wrapped = wrapValue(final, ds2.min, ds2.max);
            valueRef.current = wrapped;
            setValue(wrapped);
            setTypedRaw(null);
            budgeTimeoutRef.current = setTimeout(() => setIsBudging(false), 600);
          } else {
            setTypedRaw(null);
            setIsBudging(false);
          }
        }, 500);
      } else if ((e.key === "r" || e.key === "R") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        resetRef.current();
      } else if (e.key === "Enter") {
        e.preventDefault();
        copyRef.current();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (f.buttonFeedback) { setPressedButton("prev"); setTimeout(() => setPressedButton(null), 70); }
        goToSlide(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (f.buttonFeedback) { setPressedButton("next"); setTimeout(() => setPressedButton(null), 70); }
        goToSlide(1);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        setActiveKey(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      clearTimeout(budgeTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Mobile auto-demo
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isMobile) return;

    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    async function runDemo() {
      await sleep(1200);

      while (!cancelled) {
        for (let si = 0; si < SLIDES.length; si++) {
          if (cancelled) return;

          const s = SLIDES[si];

          // Switch slide
          slideValuesRef.current[slideRef.current] = s.original;
          slideRef.current = si;
          setSlide(si);
          valueRef.current = s.original;
          setValue(s.original);
          setIsBudging(false);
          setActiveKey(null);

          // Flash slide label
          setSlideRangeVisible(true);
          setSlideRangeIdle(false);
          await sleep(1200);
          if (cancelled) return;
          setSlideRangeVisible(false);
          await sleep(500);
          if (cancelled) return;
          setSlideRangeIdle(true);

          // Animate value toward demo target
          const target = s.demo;
          const delta = Math.abs(target - s.original);
          const dir = target > s.original ? 1 : -1;
          const stepSize = Math.max(1, Math.ceil(delta / 25));
          const stepInterval = 80;

          setIsBudging(true);
          setActiveKey(dir > 0 ? "up" : "down");
          let current = s.original;
          while (current !== target && !cancelled) {
            const remaining = Math.abs(target - current);
            const sz = Math.min(stepSize, remaining);
            current += dir * sz;
            valueRef.current = current;
            setValue(current);
            await sleep(stepInterval);
            if (cancelled) return;
          }
          setActiveKey(null);

          setIsBudging(false);
          await sleep(1800);
          if (cancelled) return;

          // Animate back to original
          const backDir = -dir;
          setIsBudging(true);
          setActiveKey(backDir > 0 ? "up" : "down");
          while (current !== s.original && !cancelled) {
            const remaining = Math.abs(s.original - current);
            const sz = Math.min(stepSize, remaining);
            current += backDir * sz;
            valueRef.current = current;
            setValue(current);
            await sleep(stepInterval);
            if (cancelled) return;
          }
          setActiveKey(null);

          setIsBudging(false);
          await sleep(1400);
          if (cancelled) return;
        }
      }
    }

    runDemo();
    return () => { cancelled = true; };
  }, [isMobile]);

  const displayNum = typedRaw !== null ? typedRaw : `${value}`;
  const displayUnit = s.unit;
  const matchedToken = snapToTokens ? matchToken(s.tokens, value) : null;
  const typedOutOfRange = typedRaw !== null && (() => {
    const n = parseInt(typedRaw, 10);
    return !isNaN(n) && (n < s.min || n > s.max);
  })();
  const isColorSlide = slide === 3;
  const targetColor = `hsl(${value}, 70%, 55%)`;
  const budgeY = 0;
  const baseScale = f.barPhysics && !isMobile ? (confirmed ? 1.02 : (isBudging || !slideRangeIdle || barHovered) ? 1 : 0.8) : 1;

  const expandTransition =
    "max-width 0.5s cubic-bezier(0.32, 0.72, 0, 1), " +
    "margin-right 0.5s cubic-bezier(0.32, 0.72, 0, 1), " +
    "opacity 0.35s ease 0.1s";
  const collapseTransition =
    "max-width 0.45s cubic-bezier(0.32, 0.72, 0, 1), " +
    "margin-right 0.45s cubic-bezier(0.32, 0.72, 0, 1), " +
    "opacity 0.15s ease";

  return (
    <>
    <div ref={wrapperRef} className="relative">
    {f.showLabel !== false && mutePos && !isMobile && (
      <div
        style={{
          position: "absolute",
          bottom: `calc(100% - ${mutePos.top}px)`,
          left: mutePos.left,
          zIndex: 10,
          pointerEvents: "none",
          transform: `translateX(-50%) scale(${muteHovered ? 1 : 0.85})`,
          transformOrigin: "bottom center",
          opacity: muteHovered ? 1 : 0,
          transition: muteHovered
            ? "opacity 0.15s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "opacity 0.1s ease, transform 0.1s ease",
        }}
      >
        <div className="[font-synthesis:none] flex flex-col items-center gap-0 px-2.25 py-0.75 rounded-full justify-center bg-[color(display-p3_0.246_0.246_0.246)] antialiased">
          <div className="[letter-spacing:0px] w-max text-[color(display-p3_1_1_1)] font-sans font-medium text-xs/4.5">
            {muted ? "Unmute" : "Mute"}
          </div>
        </div>
      </div>
    )}
    <div
      ref={containerRef}
      tabIndex={0}
      onPointerDown={() => { if (!isMobile) containerRef.current?.focus(); }}
      className="budge-paper-preview [font-synthesis:none] relative flex w-full sm:w-114.25 h-77.75 flex-col rounded-[14px] overflow-clip bg-[#FDFDFD] [box-shadow:#FFFFFF88_0px_1px_0px_inset,#FFFFFF88_0px_0px_1px_1px_inset,#00000011_0px_0.5px_1px,#00000022_0px_0px_1px,#00000022_0px_0px_4px_-1px] antialiased text-xs/4 outline-none pointer-events-none sm:pointer-events-auto">
      <div className={`flex min-h-0 flex-col items-center grow shrink basis-[0%]${f.showText === false && f.showLabel === false ? " justify-center" : ""}`}>
        {f.showLabel !== false && (
          <div className="flex sm:hidden w-full items-center justify-center pt-3.5 px-4 shrink-0">
            <div className="[letter-spacing:0px] w-fit text-[color(display-p3_0.543_0.543_0.543)] font-sans font-medium text-xs/4.5">
              Best viewed on desktop
            </div>
          </div>
        )}
        {f.showLabel !== false && (
          <div className="hidden sm:flex w-full items-center pt-3.5 px-4 shrink-0">
              <div className="size-9 shrink-0" />
              <div className="flex-1 flex justify-center">
                <div className="[letter-spacing:0px] w-fit text-[color(display-p3_0.543_0.543_0.543)] font-sans font-medium text-xs/4.5">
                  Press T to snap to tokens
                </div>
              </div>
              <div
                ref={muteRef}
                className="group flex items-center justify-center rounded-full bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0 size-9 cursor-pointer outline-none overflow-visible"
                onClick={() => {
                  if (muted) playToggleOn();
                  else playToggleOff();
                  setMuted(m => !m);
                  if (f.buttonFeedback) { setPressedButton("mute"); setTimeout(() => setPressedButton(null), 70); }
                }}
                onPointerEnter={() => {
                  if (muteRef.current && wrapperRef.current) {
                    const btn = muteRef.current.getBoundingClientRect();
                    const wrap = wrapperRef.current.getBoundingClientRect();
                    setMutePos({
                      top: btn.top - wrap.top - 6,
                      left: btn.left - wrap.left + btn.width / 2,
                    });
                  }
                  setMuteHovered(true);
                }}
                onPointerLeave={() => setMuteHovered(false)}
                style={f.buttonFeedback ? {
                  transform: pressedButton === "mute" ? "scale(0.9)" : "scale(1)",
                  transition: pressedButton === "mute"
                    ? "transform 0.03s linear"
                    : "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
                } : undefined}
              >
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-200" style={{ width: 18, height: "auto", flexShrink: 0, overflow: "visible" }}>
                  {muted ? (
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.8 4.4C12.118 3.411 14 4.352 14 6V18C14 19.648 12.118 20.589 10.8 19.6L6.712 16.534L5.398 16.665C3.043 16.901 1 15.052 1 12.685V11.315C1 8.949 3.043 7.1 5.398 7.335L6.712 7.466L10.8 4.4ZM12 6L7.6 9.3C7.4 9.451 7.15 9.52 6.901 9.495L5.199 9.325C4.022 9.207 3 10.132 3 11.315V12.685C3 13.868 4.022 14.793 5.199 14.675L6.901 14.505C7.15 14.48 7.4 14.55 7.6 14.7L12 18V6ZM22.707 8.793C23.098 9.184 23.098 9.817 22.707 10.207L20.914 12L22.707 13.793C23.098 14.184 23.098 14.817 22.707 15.207C22.317 15.598 21.683 15.598 21.293 15.207L19.5 13.414L17.707 15.207C17.317 15.598 16.683 15.598 16.293 15.207C15.902 14.817 15.902 14.184 16.293 13.793L18.086 12L16.293 10.207C15.902 9.817 15.902 9.184 16.293 8.793C16.683 8.403 17.317 8.403 17.707 8.793L19.5 10.586L21.293 8.793C21.683 8.403 22.317 8.403 22.707 8.793Z" className="fill-[#B0B0B0] group-hover:fill-[#777]" />
                  ) : (
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.8 4.4C12.118 3.411 14 4.352 14 6V18C14 19.648 12.118 20.589 10.8 19.6L6.712 16.534L5.398 16.665C3.043 16.901 1 15.052 1 12.685V11.315C1 8.949 3.043 7.1 5.398 7.335L6.712 7.466L10.8 4.4ZM12 6L7.6 9.3C7.4 9.451 7.15 9.52 6.901 9.495L5.199 9.325C4.022 9.207 3 10.132 3 11.315V12.685C3 13.868 4.022 14.793 5.199 14.675L6.901 14.505C7.15 14.48 7.4 14.55 7.6 14.7L12 18V6ZM22.042 8.466C22.676 9.549 23.007 10.783 23 12.037C22.993 13.292 22.649 14.522 22.004 15.598C21.359 16.675 20.437 17.558 19.334 18.155C18.848 18.419 18.241 18.238 17.978 17.752C17.715 17.267 17.895 16.66 18.381 16.397C19.169 15.97 19.828 15.339 20.289 14.57C20.75 13.802 20.995 12.923 21 12.027C21.005 11.131 20.768 10.249 20.316 9.476C19.863 8.702 19.211 8.064 18.428 7.629C17.945 7.361 17.771 6.752 18.039 6.269C18.307 5.787 18.916 5.613 19.399 5.881C20.496 6.49 21.409 7.383 22.042 8.466ZM19 12.016C19.003 11.478 18.861 10.95 18.59 10.486C18.318 10.021 17.927 9.639 17.457 9.378C16.974 9.109 16.365 9.283 16.097 9.766C15.829 10.249 16.003 10.858 16.486 11.126C16.642 11.213 16.773 11.341 16.863 11.495C16.954 11.65 17.001 11.826 17 12.005C16.999 12.185 16.95 12.36 16.858 12.514C16.766 12.668 16.634 12.794 16.476 12.88C15.991 13.143 15.81 13.749 16.073 14.235C16.336 14.721 16.943 14.901 17.429 14.638C17.901 14.382 18.297 14.004 18.573 13.542C18.85 13.081 18.997 12.554 19 12.016Z" className="fill-[#B0B0B0] group-hover:fill-[#777]" />
                  )}
                </svg>
              </div>
          </div>
        )}
        {f.showText !== false && (
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
            <div style={{
              position: "relative",
              padding: slide === 2 ? value : 0,
              background: slide === 2 ? "rgba(59, 130, 246, 0.08)" : "transparent",
              borderRadius: slide === 2 ? 6 : 0,
              transition: "padding 0.1s cubic-bezier(0.32, 0.72, 0, 1), background 0.2s ease, border-radius 0.2s ease",
            }}>
              {slide === 2 && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  border: "1.5px dashed rgba(59, 130, 246, 0.35)",
                  borderRadius: 6,
                  pointerEvents: "none",
                }} />
              )}
              <div
                className="left-0 top-0 [white-space-collapse:preserve] relative text-[#3C3C3C] text-[61px]/18.5"
                style={{
                  fontFamily: '"Ivar Hand TRIAL", ui-serif, serif',
                  fontSize: slide === 0 ? `${value}px` : '61px',
                  opacity: slide === 1 ? value / 100 : 1,
                  color: isColorSlide ? targetColor : undefined,
                  background: slide === 2 ? "#FFFFFF" : "transparent",
                  border: "none",
                  borderRadius: slide === 2 ? 3 : 0,
                  transition: slide === 0
                    ? "font-size 0.1s cubic-bezier(0.32, 0.72, 0, 1)"
                    : slide === 1
                      ? "opacity 0.1s cubic-bezier(0.32, 0.72, 0, 1)"
                      : isColorSlide
                        ? "color 0.1s cubic-bezier(0.32, 0.72, 0, 1)"
                        : "border-color 0.2s ease",
                }}
              >
                budge
              </div>
            </div>
          </div>
        )}

        <div
          ref={barRef}
          className="shrink-0"
          onPointerEnter={() => setBarHovered(true)}
          onPointerLeave={() => setBarHovered(false)}
          style={{
            position: "relative",
            display: "flex",
            height: 37,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            padding: "0 16px",
            marginBottom: 24,
            fontSynthesis: "none",
            WebkitFontSmoothing: "antialiased",
            userSelect: "none",
            transform: `translateY(${budgeY}px) scale(${baseScale})`,
            opacity: f.idleOpacity ? (isBudging || confirmed || !slideRangeIdle || barHovered ? 1 : 0.8) : 1,
            transition: f.barPhysics
              ? (confirmed
                  ? "transform 0.3s cubic-bezier(0.2, 0, 0, 1.2), opacity 0.2s ease"
                  : isBudging || barHovered || !slideRangeIdle
                    ? "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease"
                    : "transform 0.2s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease")
              : "opacity 0.3s ease",
          }}
        >
          <div style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            pointerEvents: "none",
            transform: `scale(${1 / baseScale}) translateX(-50%) translateY(${slideRangeVisible ? 0 : 8}px)`,
            transformOrigin: "top left",
            paddingBottom: 10,
            opacity: slideRangeVisible ? 1 : 0,
            filter: slideRangeVisible ? "blur(0px)" : "blur(4px)",
            transition: slideRangeVisible
              ? "opacity 0.2s ease, filter 0.2s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "opacity 0.25s ease, filter 0.25s ease, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          }}>
            <span style={{
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 500,
              color: "#666",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}>
              {toastLabel ?? SLIDES[slide].label}
            </span>
          </div>
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            background: "#161616",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            transformOrigin: activeKey === "up" ? "center bottom" : activeKey === "down" ? "center top" : "center center",
            transform: `scaleY(${activeKey ? 1.012 : 1})`,
            transition: activeKey
              ? "transform 0.03s cubic-bezier(0, 0, 0.2, 1)"
              : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          {confirmed ? (
            <span
              key="copied"
              style={{
                color: "#fff",
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 14.5,
                lineHeight: "22px",
                whiteSpace: "nowrap",
                animation: "budge-copied-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
              }}
            >
              Copied
            </span>
          ) : (
            <>
              <div
                style={{
                  maxWidth: isBudging && !isColorSlide ? (matchedToken ? 170 : 100) : 0,
                  marginRight: isBudging && !isColorSlide ? (matchedToken ? 9 : 1) : 0,
                  opacity: isBudging && !isColorSlide ? 1 : 0,
                  transition: isBudging
                    ? expandTransition
                    : collapseTransition,
                  display: "flex",
                  alignItems: "center",
                  overflow: "visible",
                }}
              >
{f.animatedDigits ? (
                  <span style={{ display: "inline-flex", alignItems: "baseline", minWidth: 44, textAlign: "left" }}>
                    <Calligraph
                      variant="slots"
                      animation="snappy"
                      stagger={0}
                      style={{
                        color: typedOutOfRange ? "#A7A7A7" : "#fff",
                        fontFamily: FONT,
                        fontWeight: 500,
                        fontSize: 14.5,
                        lineHeight: "22px",
                        whiteSpace: "nowrap",
                        fontVariantNumeric: "tabular-nums",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {displayNum}
                    </Calligraph>
                    <span style={{
                      color: typedOutOfRange ? "#A7A7A7" : "#fff",
                      fontFamily: FONT,
                      fontWeight: 500,
                      fontSize: 11,
                      lineHeight: "22px",
                      transition: "color 0.2s ease",
                      marginLeft: 1,
                    }}>{displayUnit}</span>
                    {matchedToken && (
                      <span style={{
                        color: "#A7A7A7",
                        fontFamily: FONT,
                        fontWeight: 500,
                        fontSize: 11,
                        lineHeight: "22px",
                        marginLeft: 6,
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        minWidth: 32,
                        textAlign: "left",
                      }}>· {matchedToken.name}</span>
                    )}
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "baseline", minWidth: 44, textAlign: "left" }}>
                    <span
                      style={{
                        color: typedOutOfRange ? "#A7A7A7" : "#fff",
                        fontFamily: FONT,
                        fontWeight: 500,
                        fontSize: 14.5,
                        lineHeight: "22px",
                        whiteSpace: "nowrap",
                        fontVariantNumeric: "tabular-nums",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {displayNum}
                    </span>
                    <span style={{
                      color: typedOutOfRange ? "#A7A7A7" : "#fff",
                      fontFamily: FONT,
                      fontWeight: 500,
                      fontSize: 11,
                      lineHeight: "22px",
                      transition: "color 0.2s ease",
                      marginLeft: 1,
                    }}>{displayUnit}</span>
                    {matchedToken && (
                      <span style={{
                        color: "#A7A7A7",
                        fontFamily: FONT,
                        fontWeight: 500,
                        fontSize: 11,
                        lineHeight: "22px",
                        marginLeft: 6,
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        minWidth: 32,
                        textAlign: "left",
                      }}>· {matchedToken.name}</span>
                    )}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Arrow
                  down
                  active={f.arrowBounce ? activeKey === "down" : false}
                  bounce={!isMobile}
                  onPointerDown={isMobile ? undefined : () => startHold("down")}
                  onPointerUp={isMobile ? undefined : stopHold}
                  onPointerLeave={isMobile ? undefined : stopHold}
                  activeColor={isColorSlide ? targetColor : undefined}
                />
                <Arrow
                  active={f.arrowBounce ? activeKey === "up" : false}
                  bounce={!isMobile}
                  onPointerDown={isMobile ? undefined : () => startHold("up")}
                  onPointerUp={isMobile ? undefined : stopHold}
                  onPointerLeave={isMobile ? undefined : stopHold}
                  activeColor={isColorSlide ? targetColor : undefined}
                />
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {f.showButtons !== false && (
        <>
          <div className="hidden sm:block absolute bottom-4 left-4">
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: `translateX(-50%) scale(${resetHovered ? 1 : 0.85})`,
                transformOrigin: "bottom center",
                marginBottom: 6,
                opacity: resetHovered ? 1 : 0,
                pointerEvents: "none",
                transition: resetHovered
                  ? "opacity 0.15s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : "opacity 0.1s ease, transform 0.1s ease",
              }}
            >
              <div className="[font-synthesis:none] flex flex-col items-center gap-0 px-2.25 py-0.75 rounded-full justify-center bg-[color(display-p3_0.246_0.246_0.246)] antialiased">
                <div className="[letter-spacing:0px] w-max text-[color(display-p3_1_1_1)] font-sans font-medium text-xs/4.5">
                  Reset
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              onPointerEnter={() => setResetHovered(true)}
              onPointerLeave={() => setResetHovered(false)}
              className="cursor-pointer flex items-center justify-center rounded-full bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] size-9 outline-none"
              style={f.buttonFeedback ? {
                transform: pressedButton === "reset" ? "scale(0.9)" : "scale(1)",
                transition: pressedButton === "reset"
                  ? "transform 0.03s linear"
                  : "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
              } : undefined}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
                width: 18,
                height: "auto",
                flexShrink: 0,
                transform: resetHovered ? "rotate(-30deg)" : "rotate(0deg)",
                transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
              }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M5 3C5 2.448 4.552 2 4 2C3.447 2 3 2.448 3 3V9C3 9.552 3.447 10 4 10H10C10.552 10 11 9.552 11 9C11 8.448 10.552 8 10 8H5.755C6.656 6.875 7.85 6.006 9.219 5.499C11.046 4.821 13.058 4.834 14.877 5.535C16.696 6.236 18.196 7.577 19.096 9.306C19.996 11.035 20.234 13.033 19.765 14.924C19.296 16.816 18.153 18.472 16.55 19.58C14.947 20.689 12.994 21.174 11.058 20.944C9.123 20.715 7.338 19.787 6.038 18.334C4.738 16.882 4.014 15.005 4 13.056C3.996 12.504 3.545 12.059 2.993 12.063C2.441 12.067 1.996 12.518 2 13.07C2.017 15.506 2.923 17.852 4.548 19.668C6.172 21.484 8.404 22.644 10.823 22.93C13.242 23.217 15.683 22.611 17.687 21.225C19.691 19.84 21.12 17.77 21.706 15.405C22.292 13.041 21.995 10.543 20.87 8.382C19.745 6.221 17.869 4.545 15.596 3.669C13.323 2.793 10.808 2.777 8.524 3.624C7.194 4.116 5.996 4.882 5 5.859V3Z" fill="#B0B0B0" />
              </svg>
            </button>
          </div>
          <div className="hidden sm:block absolute bottom-4 right-4">
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: `translateX(-50%) scale(${copyHovered ? 1 : 0.85})`,
                transformOrigin: "bottom center",
                marginBottom: 6,
                opacity: copyHovered ? 1 : 0,
                pointerEvents: "none",
                transition: copyHovered
                  ? "opacity 0.15s ease, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : "opacity 0.1s ease, transform 0.1s ease",
              }}
            >
              <div className="[font-synthesis:none] flex flex-col items-center gap-0 px-2.25 py-0.75 rounded-full justify-center bg-[color(display-p3_0.246_0.246_0.246)] antialiased">
                <div className="[letter-spacing:0px] w-max text-[color(display-p3_1_1_1)] font-sans font-medium text-xs/4.5">
                  Copy
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={copy}
              onPointerEnter={() => setCopyHovered(true)}
              onPointerLeave={() => setCopyHovered(false)}
              className="cursor-pointer flex items-center justify-center rounded-full bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] size-9 outline-none"
              style={f.buttonFeedback ? {
                transform: pressedButton === "copy" ? "scale(0.9)" : "scale(1)",
                transition: pressedButton === "copy"
                  ? "transform 0.03s linear"
                  : "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
              } : undefined}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: "auto", flexShrink: 0 }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M5 7C3.343 7 2 8.343 2 10V19C2 20.657 3.343 22 5 22H14C15.657 22 17 20.657 17 19V10C17 8.343 15.657 7 14 7H5ZM4 10C4 9.448 4.448 9 5 9H14C14.552 9 15 9.448 15 10V19C15 19.552 14.552 20 14 20H5C4.448 20 4 19.552 4 19V10Z" fill="#B0B0B0" />
                <path fillRule="evenodd" clipRule="evenodd" d="M9.942 2C8.65 2 7.504 2.826 7.096 4.051L7.051 4.184C6.877 4.708 7.16 5.274 7.684 5.449C8.208 5.623 8.774 5.34 8.949 4.816L8.993 4.684C9.129 4.275 9.511 4 9.942 4H19C19.552 4 20 4.448 20 5V14.059C20 14.489 19.725 14.871 19.316 15.007L19.184 15.051C18.66 15.226 18.377 15.792 18.551 16.316C18.726 16.84 19.292 17.123 19.816 16.949L19.949 16.904C21.174 16.496 22 15.35 22 14.059V5C22 3.343 20.657 2 19 2H9.942Z" fill="#B0B0B0"
                  style={{
                    transform: copyHovered ? "translate(-1.5px, -1.5px)" : "translate(0, 0)",
                    transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                  }}
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
    </div>
      <div
        className="hidden sm:flex"
        style={{
          marginTop: 16,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13.5,
          lineHeight: "20px",
          color: "#6B6B6B",
          textAlign: "center",
          alignItems: "baseline",
          justifyContent: "center",
          gap: "0.35em",
          opacity: showPrompt ? 1 : 0,
          filter: showPrompt ? "blur(0px)" : "blur(4px)",
          transition: showPrompt
            ? "opacity 0.25s ease, filter 0.25s ease"
            : "none",
          pointerEvents: showPrompt ? "auto" : "none",
        }}
      >
        <span style={{ color: "#999", fontStyle: "italic", marginRight: "0.15em" }}>Prompt</span>
        <span>Set {["font-size", "opacity", "padding", "color"][slide]} to </span>
        {slide === 3 ? (
          <span>
            hsl(<Calligraph
              variant="slots"
              animation="snappy"
              stagger={0}
              style={{
                fontFamily: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit",
                color: "inherit",
                fontVariantNumeric: "tabular-nums",
                display: "inline-flex",
              }}
            >
              {`${value}`}
            </Calligraph>, 70%, 55%)
          </span>
        ) : (
          <Calligraph
            variant="slots"
            animation="snappy"
            stagger={0}
            style={{
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
              color: "inherit",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {`${value}${s.unit}`}
          </Calligraph>
        )}
      </div>
    </>
  );
}
