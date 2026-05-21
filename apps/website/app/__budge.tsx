"use client";

import { useCallback, useEffect, useReducer, useRef, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Calligraph } from "calligraph";
import { defineSound, ensureReady } from "@web-kits/audio";

export interface BudgeConfig {
  property: string;
  value: string;
  original: string;
  type: "numeric" | "color" | "options";
  step?: number;
  min?: number;
  max?: number;
  options?: (string | number)[];
  file?: string;
  line?: string;
}

const BUDGE_KEYFRAMES = `@keyframes __budge-shake{0%,100%{translate:0}25%{translate:-2px}50%{translate:2px}75%{translate:-1px}}@keyframes budge-copied-in{0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}`;
let budgeStyleInjected = false;

// ---------------------------------------------------------------------------
// Audio — "hover" from the mechanical patch in @web-kits/audio
// (https://audio.raphaelsalaja.com/library/mechanical).
// ---------------------------------------------------------------------------

export function setAudioBasePath(_path: string) {}

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

// "swoosh" from the minimal patch at audio.raphaelsalaja.com/library/minimal.
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

function playUndo() {
  ensureReady();
  undo();
}

function playSwoosh() {
  ensureReady();
  swoosh();
}

// ---------------------------------------------------------------------------
// Color helpers — format-preserving lightness stepping
// ---------------------------------------------------------------------------

function rgbToHSL(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function pad(n: number) {
  const s = n.toString(16);
  return s.length < 2 ? "0" + s : s;
}

function hslToRGB(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;
  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  if (s === 0) return { r: l, g: l, b: l };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3),
    g: hue2rgb(p, q, h),
    b: hue2rgb(p, q, h - 1 / 3),
  };
}

/**
 * Detects the CSS color format of `css`, adjusts lightness by `direction * 2%`,
 * and returns the result in the **same format**. Handles hex, rgb(), hsl(),
 * color(display-p3 ...), and oklch(). Falls back to browser resolution for
 * named colors or unknown formats, outputting hex.
 */
function stepColor(css: string, direction: number): string | null {
  const STEP = direction * 2;

  // --- hex (#rgb, #rrggbb, #rrggbbaa) ---
  if (/^#[0-9a-f]{3,8}$/i.test(css)) {
    let hex = css;
    if (hex.length === 4) hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const hsl = rgbToHSL(r, g, b);
    hsl.l = clamp(hsl.l + STEP, 0, 100);
    const out = hslToRGB(hsl.h, hsl.s, hsl.l);
    return (
      "#" +
      pad(Math.round(out.r * 255)) +
      pad(Math.round(out.g * 255)) +
      pad(Math.round(out.b * 255))
    );
  }

  // --- color(display-p3 r g b) — values 0-1 ---
  const p3 = css.match(/color\(\s*display-p3\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (p3) {
    const hsl = rgbToHSL(+p3[1] * 255, +p3[2] * 255, +p3[3] * 255);
    hsl.l = clamp(hsl.l + STEP, 0, 100);
    const out = hslToRGB(hsl.h, hsl.s, hsl.l);
    return `color(display-p3 ${out.r.toFixed(4)} ${out.g.toFixed(4)} ${out.b.toFixed(4)})`;
  }

  // --- oklch(L C H) — L is 0-1 or 0%-100% ---
  const ok = css.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (ok) {
    const pct = ok[1].endsWith("%");
    let l = parseFloat(ok[1]);
    if (pct) {
      l = clamp(l + STEP, 0, 100);
      return `oklch(${l.toFixed(2)}% ${ok[2]} ${ok[3]})`;
    }
    l = clamp(l + direction * 0.02, 0, 1);
    return `oklch(${l.toFixed(4)} ${ok[2]} ${ok[3]})`;
  }

  // --- rgb(r, g, b) / rgba(r, g, b, a) ---
  const rgb = css.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (rgb) {
    const hsl = rgbToHSL(+rgb[1], +rgb[2], +rgb[3]);
    hsl.l = clamp(hsl.l + STEP, 0, 100);
    const out = hslToRGB(hsl.h, hsl.s, hsl.l);
    return (
      "#" +
      pad(Math.round(out.r * 255)) +
      pad(Math.round(out.g * 255)) +
      pad(Math.round(out.b * 255))
    );
  }

  // --- hsl(h, s%, l%) ---
  const hsl = css.match(/hsla?\(\s*([\d.]+)[,\s]+([\d.]+)%?[,\s]+([\d.]+)%?/);
  if (hsl) {
    const l = clamp(+hsl[3] + STEP, 0, 100);
    return `hsl(${hsl[1]}, ${hsl[2]}%, ${l}%)`;
  }

  // --- Fallback: resolve through browser, output hex ---
  const el = document.createElement("div");
  el.style.color = css;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  el.remove();
  const m = computed.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (!m) return null;
  const fhsl = rgbToHSL(+m[1], +m[2], +m[3]);
  fhsl.l = clamp(fhsl.l + STEP, 0, 100);
  const fout = hslToRGB(fhsl.h, fhsl.s, fhsl.l);
  return (
    "#" +
    pad(Math.round(fout.r * 255)) +
    pad(Math.round(fout.g * 255)) +
    pad(Math.round(fout.b * 255))
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ---------------------------------------------------------------------------
// SVG presentation attributes
// ---------------------------------------------------------------------------

const SVG_ATTRS = new Set([
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-opacity",
  "fill-opacity",
  "opacity",
  "stop-color",
  "stop-opacity",
  "flood-color",
  "flood-opacity",
]);

function isSvgAttr(el: Element, prop: string) {
  return el instanceof SVGElement && SVG_ATTRS.has(prop);
}

// ---------------------------------------------------------------------------
// Clipboard
// ---------------------------------------------------------------------------

function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {}
  ta.remove();
}

// ---------------------------------------------------------------------------
// Config hash for sessionStorage dismiss
// ---------------------------------------------------------------------------

function configHash(c: BudgeConfig) {
  return c.property + ":" + c.original + ":" + c.value;
}

function getProps(property: string) {
  return property.split(",").flatMap((propertyName) => {
    const trimmedPropertyName = propertyName.trim();
    return trimmedPropertyName ? [trimmedPropertyName] : [];
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BUDGE_OVERLAY_Z_INDEX = 50;
const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const subscribeMounted = () => () => {};
const getMountedClientSnapshot = () => true;
const getMountedServerSnapshot = () => false;

interface BudgeRuntimeState {
  targetEl: Element | null;
  currentValue: string;
  dismissed: boolean;
  confirmed: boolean;
  barVisible: boolean;
  barMounted: boolean;
  activeKey: "up" | "down" | null;
  isNudging: boolean;
  barHovered: boolean;
}

const INITIAL_BUDGE_RUNTIME_STATE: BudgeRuntimeState = {
  targetEl: null,
  currentValue: "",
  dismissed: false,
  confirmed: false,
  barVisible: false,
  barMounted: false,
  activeKey: null,
  isNudging: false,
  barHovered: false,
};

const mergeBudgeRuntimeState = (
  state: BudgeRuntimeState,
  patch: Partial<BudgeRuntimeState>,
): BudgeRuntimeState => ({ ...state, ...patch });

export function Budge(props: { config?: BudgeConfig | null }) {
  if (process.env.NODE_ENV === "production") return null;

  return <BudgeRuntime {...props} />;
}

function BudgeRuntime({ config }: { config?: BudgeConfig | null }) {
  useEffect(() => {
    if (!budgeStyleInjected) {
      const style = document.createElement("style");
      style.textContent = BUDGE_KEYFRAMES;
      document.head.appendChild(style);
      budgeStyleInjected = true;
    }
  }, []);

  const mounted = useSyncExternalStore(
    subscribeMounted,
    getMountedClientSnapshot,
    getMountedServerSnapshot,
  );
  const [state, setRuntimeState] = useReducer(mergeBudgeRuntimeState, INITIAL_BUDGE_RUNTIME_STATE);
  const {
    targetEl,
    currentValue,
    dismissed,
    confirmed,
    barVisible,
    barMounted,
    activeKey,
    isNudging,
    barHovered,
  } = state;
  const toastMsg: string | null = null;
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastIsColorRef = useRef(false);

  if (config) lastIsColorRef.current = config.type === "color";
  const holdIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const savedValueRef = useRef("");
  const numericRef = useRef(0);
  const unitRef = useRef("");
  const optionIndexRef = useRef(0);
  const currentValueRef = useRef("");
  const budgeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stepValueRef = useRef<
    ((direction: number, shift: boolean, held?: boolean) => void) | undefined
  >(undefined);

  useEffect(() => {
    ensureReady();
  }, []);

  const startHold = useCallback((dir: "up" | "down") => {
    const d = dir === "up" ? 1 : -1;
    stepValueRef.current?.(d, false);
    setRuntimeState({ activeKey: dir, isNudging: true });
    clearTimeout(budgeTimeoutRef.current);
    clearTimeout(holdTimeoutRef.current);
    clearInterval(holdIntervalRef.current);
    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        stepValueRef.current?.(d, false, true);
      }, 50);
    }, 300);
  }, []);

  const stopHold = useCallback(() => {
    clearTimeout(holdTimeoutRef.current);
    clearInterval(holdIntervalRef.current);
    setRuntimeState({ activeKey: null });
    clearTimeout(budgeTimeoutRef.current);
    budgeTimeoutRef.current = setTimeout(() => setRuntimeState({ isNudging: false }), 600);
  }, []);

  // Reset state when config changes
  useEffect(() => {
    if (!config) {
      setRuntimeState({ targetEl: null, dismissed: false });
      return;
    }

    const hash = configHash(config);
    if (sessionStorage.getItem("__ndg_dismissed") === hash) {
      setRuntimeState({ dismissed: true });
      return;
    }

    setRuntimeState({ dismissed: false, currentValue: config.value });
    currentValueRef.current = config.value;

    const isColor = config.type === "color";
    const isOptions = config.type === "options" && config.options && config.options.length > 0;

    if (isOptions) {
      const idx = config.options!.findIndex((o) => String(o) === String(config.value));
      optionIndexRef.current = idx >= 0 ? idx : 0;
    } else if (!isColor) {
      const match = String(config.value).match(/([\d.]+)\s*(.*)/);
      unitRef.current = match ? match[2] : "";
      numericRef.current = parseFloat(config.value) || 0;
    }
  }, [config]);

  useEffect(() => {
    if (isNudging && targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isNudging, targetEl]);

  const shouldShow = mounted && !!config && !!targetEl && !dismissed;
  useEffect(() => {
    clearTimeout(exitTimeoutRef.current);
    if (shouldShow) {
      setRuntimeState({ barMounted: true });
      exitTimeoutRef.current = setTimeout(() => setRuntimeState({ barVisible: true }), 30);
    } else {
      setRuntimeState({ barVisible: false });
      exitTimeoutRef.current = setTimeout(() => setRuntimeState({ barMounted: false }), 400);
    }
    return () => clearTimeout(exitTimeoutRef.current);
  }, [shouldShow]);

  // Find target element
  useEffect(() => {
    if (!config || dismissed) {
      setRuntimeState({ targetEl: null });
      return;
    }

    const find = () => document.querySelector("[data-budge-target]") as Element | null;
    const firstProp = getProps(config.property)[0];
    const found = find();
    if (found) {
      const useSvg = isSvgAttr(found, firstProp);
      savedValueRef.current = useSvg
        ? found.getAttribute(firstProp) || ""
        : (found as HTMLElement).style.getPropertyValue(firstProp);
      setRuntimeState({ targetEl: found });
      return;
    }

    const observer = new MutationObserver(() => {
      const el = find();
      if (el) {
        observer.disconnect();
        const useSvg = isSvgAttr(el, firstProp);
        savedValueRef.current = useSvg
          ? el.getAttribute(firstProp) || ""
          : (el as HTMLElement).style.getPropertyValue(firstProp);
        setRuntimeState({ targetEl: el });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [config, dismissed]);

  const applyPreview = useCallback(
    (el: Element, val: string) => {
      if (!config) return;
      for (const prop of getProps(config.property)) {
        if (isSvgAttr(el, prop)) {
          el.setAttribute(prop, val);
        } else {
          (el as HTMLElement).style.setProperty(prop, val);
        }
      }
    },
    [config],
  );

  const dismiss = useCallback(() => {
    if (config) {
      sessionStorage.setItem("__ndg_dismissed", configHash(config));
    }
    if (targetEl) {
      targetEl.removeAttribute("data-budge-target");
    }
    setRuntimeState({ dismissed: true, targetEl: null });
  }, [config, targetEl]);

  // Keyboard handler
  useEffect(() => {
    if (!config || !targetEl || dismissed) return;

    const isColor = config.type === "color";
    const isOptions = config.type === "options" && config.options && config.options.length > 0;
    const step = config.step ?? 1;
    const min = config.min ?? -9999;
    const max = config.max ?? 9999;

    function stepValue(direction: number, shift: boolean, held = false) {
      let next: string;
      let cycled = false;

      if (isOptions) {
        const len = config!.options!.length;
        const prevIdx = optionIndexRef.current;
        optionIndexRef.current = (((optionIndexRef.current + direction) % len) + len) % len;
        cycled =
          direction > 0 ? optionIndexRef.current < prevIdx : optionIndexRef.current > prevIdx;
        next = String(config!.options![optionIndexRef.current]);
        if (cycled) playSwoosh();
        else playTick(held, direction > 0);
      } else if (isColor) {
        const stepped = stepColor(currentValueRef.current, direction);
        if (!stepped) return;
        next = stepped;
        playTick(held, direction > 0);
      } else {
        const s = step >= 1 ? 1 : step;
        const mult = shift ? 10 : 1;
        const delta = direction * s * mult;
        const prev = numericRef.current;
        let candidate = Math.round((numericRef.current + delta) * 1000) / 1000;
        const period = max - min + s;
        while (candidate > max + 1e-9) candidate -= period;
        while (candidate < min - 1e-9) candidate += period;
        numericRef.current = Math.round(candidate * 1000) / 1000;
        cycled =
          numericRef.current !== prev &&
          (direction > 0 ? numericRef.current < prev : numericRef.current > prev);
        next = unitRef.current ? numericRef.current + unitRef.current : String(numericRef.current);
        if (cycled) playSwoosh();
        else playTick(held, direction > 0);
      }

      applyPreview(targetEl!, next);
      currentValueRef.current = next;
      setRuntimeState({ currentValue: next });
    }

    stepValueRef.current = stepValue;

    function buildPrompt() {
      const parts = ["Set `" + config!.property + "` to `" + currentValueRef.current + "`"];
      if (config!.file) {
        parts.push("in `" + config!.file + "`");
        if (config!.line) parts.push("at line " + config!.line);
      }
      parts.push(
        "also apply this change to any related or sibling elements/components nearby that share the same style, where it makes logical sense to keep them consistent",
      );
      return parts.join(" ");
    }

    function handleSubmit() {
      copyToClipboard(buildPrompt());
      setRuntimeState({ confirmed: true, isNudging: true });
      playConfirm();
      clearTimeout(budgeTimeoutRef.current);
      budgeTimeoutRef.current = setTimeout(() => {
        setRuntimeState({ confirmed: false });
        dismiss();
      }, 800);
    }

    function handleCancel() {
      for (const prop of getProps(config!.property)) {
        const useSvg = isSvgAttr(targetEl!, prop);
        if (useSvg) {
          if (savedValueRef.current) {
            targetEl!.setAttribute(prop, savedValueRef.current);
          } else {
            targetEl!.removeAttribute(prop);
          }
        } else {
          if (savedValueRef.current) {
            (targetEl! as HTMLElement).style.setProperty(prop, savedValueRef.current);
          } else {
            (targetEl! as HTMLElement).style.removeProperty(prop);
          }
        }
      }
      dismiss();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        const orig = config!.original;
        applyPreview(targetEl!, orig);
        currentValueRef.current = orig;
        setRuntimeState({ currentValue: orig });
        const match = String(orig).match(/([\d.]+)\s*(.*)/);
        if (match) {
          numericRef.current = parseFloat(orig) || 0;
          unitRef.current = match[2];
        }
        playUndo();
        setRuntimeState({ isNudging: true });
        clearTimeout(budgeTimeoutRef.current);
        budgeTimeoutRef.current = setTimeout(() => setRuntimeState({ isNudging: false }), 600);
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        stepValue(1, e.shiftKey);
        setRuntimeState({ activeKey: "up", isNudging: true });
        clearTimeout(budgeTimeoutRef.current);
        budgeTimeoutRef.current = setTimeout(() => setRuntimeState({ isNudging: false }), 600);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        stepValue(-1, e.shiftKey);
        setRuntimeState({ activeKey: "down", isNudging: true });
        clearTimeout(budgeTimeoutRef.current);
        budgeTimeoutRef.current = setTimeout(() => setRuntimeState({ isNudging: false }), 600);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        setRuntimeState({ activeKey: null });
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      clearTimeout(budgeTimeoutRef.current);
    };
  }, [config, targetEl, dismissed, applyPreview, dismiss]);

  if (!barMounted && !(mounted && toastMsg)) return null;

  return createPortal(
    <>
      {barMounted && (
        <Bar
          value={currentValue}
          activeKey={activeKey}
          isColor={lastIsColorRef.current}
          expanded={isNudging}
          startHold={startHold}
          stopHold={stopHold}
          confirmed={confirmed}
          visible={barVisible}
          barHovered={barHovered}
          onBarHover={(nextBarHovered) => setRuntimeState({ barHovered: nextBarHovered })}
          propertyLabel={config?.property}
          unit={unitRef.current}
        />
      )}
      {toastMsg && <Toast message={toastMsg} />}
    </>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Bar UI
// ---------------------------------------------------------------------------

const FONT = "'Open Runde', system-ui, sans-serif";

const BAR_CONTAINER_BASE_STYLE: CSSProperties = {
  position: "fixed",
  left: "50%",
  zIndex: BUDGE_OVERLAY_Z_INDEX,
  display: "flex",
  height: 37,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9999,
  padding: "0 16px",
  fontSynthesis: "none",
  WebkitFontSmoothing: "antialiased",
  pointerEvents: "auto",
  userSelect: "none",
};

const BAR_LABEL_BASE_STYLE: CSSProperties = {
  position: "absolute",
  bottom: "100%",
  left: "50%",
  pointerEvents: "none",
  transformOrigin: "top left",
  paddingBottom: 10,
};

const BAR_LABEL_TEXT_STYLE: CSSProperties = {
  fontFamily: FONT,
  fontSize: 12,
  fontWeight: 500,
  color: "#666",
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
};

const BAR_SURFACE_BASE_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 9999,
  background: "#161616",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const BAR_CONTENT_STYLE: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
};

const COPIED_TEXT_STYLE: CSSProperties = {
  color: "#fff",
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: 14.5,
  lineHeight: "22px",
  whiteSpace: "nowrap",
  animation: `budge-copied-in 0.35s ${EASE_OUT_EXPO} both`,
};

const VALUE_TEXT_STYLE: CSSProperties = {
  color: "#fff",
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: 14.5,
  lineHeight: "22px",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
  transition: "color 0.2s ease",
};

const UNIT_TEXT_STYLE: CSSProperties = {
  color: "#fff",
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: 12,
  lineHeight: "22px",
  transition: "color 0.2s ease",
  marginLeft: 1,
};

const TOAST_STYLE: CSSProperties = {
  position: "fixed",
  bottom: 68,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#161616",
  color: "#fff",
  padding: "6px 14px",
  borderRadius: 9999,
  fontSize: 13,
  fontFamily: FONT,
  fontWeight: 500,
  zIndex: BUDGE_OVERLAY_Z_INDEX,
  pointerEvents: "none",
  WebkitFontSmoothing: "antialiased",
};

const ARROW_D =
  "M13.415 2.5C12.634 1.719 11.367 1.719 10.586 2.5L3.427 9.659C2.01 11.076 3.014 13.5 5.018 13.5H7V20C7 21.104 7.895 22 9 22H15C16.105 22 17 21.104 17 20V13.5H18.983C20.987 13.5 21.991 11.076 20.574 9.659L13.415 2.5Z";

function Arrow({
  active,
  down,
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  activeColor,
}: {
  active: boolean;
  down?: boolean;
  disabled?: boolean;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  activeColor?: string;
}) {
  const fill = disabled ? "#A7A7A7" : active ? (activeColor ?? "#FFFFFF") : "#A7A7A7";
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
        transform: `rotate(${down ? 180 : 0}deg) translateY(${active && !disabled ? -2.5 : 0}px) scale(${active && !disabled ? 1.08 : 1})`,
        transition: active
          ? "transform 0.03s cubic-bezier(0, 0, 0.2, 1)"
          : `transform 0.45s ${EASE_OUT_EXPO}`,
      }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={ARROW_D}
        fill={fill}
        style={{
          transition: disabled ? "fill 0.2s ease" : active ? "fill 0.05s ease" : "fill 0.3s ease",
        }}
      />
    </svg>
  );
}

function Bar({
  value,
  activeKey,
  isColor,
  expanded,
  startHold,
  stopHold,
  confirmed,
  visible,
  barHovered,
  onBarHover,
  propertyLabel,
  unit,
}: {
  value: string;
  activeKey: "up" | "down" | null;
  isColor: boolean;
  expanded: boolean;
  startHold: (dir: "up" | "down") => void;
  stopHold: () => void;
  confirmed: boolean;
  visible: boolean;
  barHovered: boolean;
  onBarHover: (v: boolean) => void;
  propertyLabel?: string;
  unit: string;
}) {
  const expandTransition =
    "max-width 0.5s cubic-bezier(0.32, 0.72, 0, 1), " +
    "margin-right 0.5s cubic-bezier(0.32, 0.72, 0, 1), " +
    "opacity 0.35s ease 0.1s";

  const collapseTransition =
    "max-width 0.45s cubic-bezier(0.32, 0.72, 0, 1), " +
    "margin-right 0.45s cubic-bezier(0.32, 0.72, 0, 1), " +
    "opacity 0.15s ease";

  const baseScale = !visible ? 0.5 : confirmed ? 1.02 : expanded || barHovered ? 1 : 0.8;
  const budgeY = activeKey === "down" ? 1 : activeKey === "up" ? -1 : 0;

  const displayNum = value.replace(/[a-z%°]+$/i, "");
  const displayUnit = unit || "";
  const barStyle: CSSProperties = {
    ...BAR_CONTAINER_BASE_STYLE,
    bottom: expanded ? 20 : 12,
    transform: `translateX(-50%) translateY(${budgeY}px) scale(${baseScale})`,
    opacity: visible ? (expanded || confirmed || barHovered ? 1 : 0.8) : 0,
    transition: confirmed
      ? `transform 0.3s ${EASE_OUT_EXPO}, bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease`
      : expanded || barHovered
        ? `transform 0.25s ${EASE_OUT_EXPO}, bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.15s ease`
        : "transform 0.2s cubic-bezier(0.32, 0.72, 0, 1), bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease",
  };
  const propertyLabelStyle: CSSProperties = {
    ...BAR_LABEL_BASE_STYLE,
    transform: `scale(${1 / baseScale}) translateX(-50%) translateY(${expanded ? 0 : 8}px)`,
    opacity: expanded ? 1 : 0,
    filter: expanded ? "blur(0px)" : "blur(4px)",
    transition: expanded
      ? `opacity 0.2s ease, filter 0.2s ease, transform 0.3s ${EASE_OUT_EXPO}`
      : "opacity 0.25s ease, filter 0.25s ease, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
  };
  const barSurfaceStyle: CSSProperties = {
    ...BAR_SURFACE_BASE_STYLE,
    transformOrigin:
      activeKey === "up" ? "center bottom" : activeKey === "down" ? "center top" : "center center",
    transform: `scaleY(${activeKey ? 1.012 : 1})`,
    transition: activeKey
      ? "transform 0.03s cubic-bezier(0, 0, 0.2, 1)"
      : `transform 0.4s ${EASE_OUT_EXPO}`,
  };

  return (
    <div
      onPointerEnter={() => onBarHover(true)}
      onPointerLeave={() => onBarHover(false)}
      style={barStyle}
    >
      {propertyLabel && expanded && (
        <div style={propertyLabelStyle}>
          <span style={BAR_LABEL_TEXT_STYLE}>{propertyLabel}</span>
        </div>
      )}
      <div style={barSurfaceStyle} />
      <div style={BAR_CONTENT_STYLE}>
        {confirmed ? (
          <span style={COPIED_TEXT_STYLE}>Prompt copied</span>
        ) : (
          <>
            <div
              style={{
                maxWidth: expanded && !isColor ? 100 : 0,
                marginRight: expanded && !isColor ? 1 : 0,
                opacity: expanded && !isColor ? 1 : 0,
                transition: expanded ? expandTransition : collapseTransition,
                display: "flex",
                alignItems: "center",
                overflow: "visible",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  minWidth: 44,
                  textAlign: "left",
                }}
              >
                <Calligraph variant="slots" animation="snappy" stagger={0} style={VALUE_TEXT_STYLE}>
                  {displayNum}
                </Calligraph>
                {displayUnit && <span style={UNIT_TEXT_STYLE}>{displayUnit}</span>}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Arrow
                down
                active={activeKey === "down"}
                onPointerDown={() => startHold("down")}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
              />
              <Arrow
                active={activeKey === "up"}
                onPointerDown={() => startHold("up")}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return <div style={TOAST_STYLE}>{message}</div>;
}
