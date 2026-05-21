import { createIsolet } from "isolet-js";
import { react } from "isolet-js/react";
import { freeze, getElementContext, isFreezeActive, unfreeze } from "react-grab/primitives";
import { Budge, setAssetBase } from "./widget";
import type { BudgeElementContext, BudgeSlide } from "./widget";

const budgeScript =
  typeof document !== "undefined" ? (document.currentScript as HTMLScriptElement | null) : null;

const scriptBase = (() => {
  if (typeof document === "undefined") return "";
  const src = budgeScript?.getAttribute("src");
  if (!src) return "";
  try {
    return new URL(src, location.href).href.replace(/\/[^/]+$/, "");
  } catch {
    return "";
  }
})();

if (scriptBase) setAssetBase(scriptBase);

export const widget = createIsolet({
  name: "budge-widget",
  mount: react(Budge),
  isolation: "none",
});

type BudgeRuntimeConfig = { slides?: BudgeSlide[]; autoFocus?: boolean };
type ReactGrabElementContext = Awaited<ReturnType<typeof getElementContext>>;
type AutoConfigSource = "detect" | "selection";

const AUTO_DETECT_ATTR = "data-budge-autodetect";
const BUDGE_TARGET_ATTR = "data-budge-target";
const BUDGE_UI_SELECTOR = "[data-budge-ui]";
const BUDGE_CONFIG_SELECTOR = "[data-budge]";
const REACT_GRAB_UI_SELECTOR = [
  "[data-react-grab]",
  "[data-react-grab-input]",
  "[data-react-grab-ignore]",
  "[data-react-grab-ignore-events]",
].join(",");
const REACT_GRAB_FREEZE_STYLE_SELECTOR = "style[data-react-grab-frozen-pseudo]";
const BUDGE_HIGHLIGHT_BORDER = "#F59E0B";
const BUDGE_HIGHLIGHT_FILL = "rgba(245, 158, 11, 0.14)";
const USER_INTERACTION_SUPPRESSION_MS = 1200;
const MAX_SELECTION_SLIDES = 40;

let activeConfigFingerprint = "";
let autoConfig: BudgeRuntimeConfig | null = null;
let autoConfigFingerprint = "";
let autoConfigSource: AutoConfigSource | null = null;
let autoTarget: HTMLElement | null = null;
let autoTargetHadMarker = false;
let primitiveSelectionStarted = false;
let primitiveSelectionActive = false;
let primitiveSelectionFreezeActive = false;
let primitiveSelectionTarget: HTMLElement | null = null;
let primitiveSelectionPath: HTMLElement[] = [];
let primitiveSelectionPathIndex = 0;
let primitiveSelectionPointer: { x: number; y: number } | null = null;
let primitiveHighlightEl: HTMLDivElement | null = null;
let suppressPrimitiveClick = false;
let suppressPrimitiveClickTimer: number | null = null;
let lastPageInteractionAt = -Infinity;

function readConfig(): BudgeRuntimeConfig | null {
  const el = document.querySelector("[data-budge]");
  if (!el) return null;
  try {
    return JSON.parse(el.getAttribute("data-budge") || "{}") as BudgeRuntimeConfig;
  } catch {
    return null;
  }
}

function hasSlides(
  config: BudgeRuntimeConfig | null,
): config is Required<Pick<BudgeRuntimeConfig, "slides">> & BudgeRuntimeConfig {
  return !!config?.slides && Array.isArray(config.slides) && config.slides.length > 0;
}

function configFingerprint(config: BudgeRuntimeConfig | null) {
  if (!config) return "";
  try {
    return JSON.stringify(config);
  } catch {
    return "";
  }
}

function sync() {
  const explicitConfig = readConfig();
  const explicitFingerprint = configFingerprint(explicitConfig);
  const useAutoConfig = !!autoConfig && (!explicitConfig || autoConfigSource === "selection");
  const config = useAutoConfig ? autoConfig : explicitConfig;
  const fingerprint = useAutoConfig ? autoConfigFingerprint : explicitFingerprint;

  if (hasSlides(config) && !widget.mounted) {
    widget.mount(document.body, { slides: config.slides, autoFocus: config.autoFocus ?? true });
  } else if (hasSlides(config) && widget.mounted && fingerprint !== activeConfigFingerprint) {
    widget.update({ slides: config.slides, autoFocus: config.autoFocus ?? true });
  } else if (!hasSlides(config) && widget.mounted) {
    widget.unmount();
  }

  activeConfigFingerprint = fingerprint;
}

function isLocalDevHost() {
  const host = location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local") ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function readAutoDetectSetting() {
  const attr =
    budgeScript?.getAttribute(AUTO_DETECT_ATTR) ??
    budgeScript?.getAttribute("data-budge-auto") ??
    document.documentElement.getAttribute(AUTO_DETECT_ATTR);

  if (attr === "false" || attr === "off" || attr === "0") return false;
  if (attr === "true" || attr === "on" || attr === "1") return true;
  return isLocalDevHost();
}

const TRACKED_PROPERTIES = [
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "gap",
  "row-gap",
  "column-gap",
  "font-size",
  "line-height",
  "letter-spacing",
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "border-width",
  "color",
  "background-color",
  "border-color",
  "opacity",
  "width",
  "height",
  "max-width",
  "max-height",
] as const;

type TrackedProperty = (typeof TRACKED_PROPERTIES)[number];
type StyleSnapshot = Record<TrackedProperty, string>;

interface NumericValue {
  value: number;
  unit: string;
}

interface PropertyChange {
  property: TrackedProperty;
  before: NumericValue;
  after: NumericValue;
}

const snapshots = new WeakMap<Element, StyleSnapshot>();

function shouldIgnoreElement(el: Element) {
  return (
    el === document.documentElement ||
    el === document.body ||
    el.closest(BUDGE_UI_SELECTOR) ||
    el.closest(BUDGE_CONFIG_SELECTOR) ||
    el.closest(REACT_GRAB_UI_SELECTOR)
  );
}

function isFromBudgeUi(target: EventTarget | null) {
  return target instanceof Element && !!target.closest(BUDGE_UI_SELECTOR);
}

function notePageInteraction(event: Event) {
  if (isFromBudgeUi(event.target)) return;
  lastPageInteractionAt = performance.now();
}

function isRecentPageInteraction() {
  return performance.now() - lastPageInteractionAt < USER_INTERACTION_SUPPRESSION_MS;
}

function removePrimitiveHighlight() {
  primitiveHighlightEl?.remove();
  primitiveHighlightEl = null;
}

function getPrimitiveHighlight() {
  if (primitiveHighlightEl?.isConnected) return primitiveHighlightEl;

  const el = document.createElement("div");
  el.setAttribute("data-budge-ui", "");
  el.setAttribute("data-budge-primitive-highlight", "");
  document.body.appendChild(el);
  primitiveHighlightEl = el;
  return el;
}

function updatePrimitiveHighlight(element: Element | null) {
  if (!element || shouldIgnoreElement(element)) {
    removePrimitiveHighlight();
    return;
  }

  const bounds = element.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    removePrimitiveHighlight();
    return;
  }

  const computed = getComputedStyle(element);
  const el = getPrimitiveHighlight();
  el.style.cssText = [
    "position:fixed",
    "pointer-events:none",
    "box-sizing:border-box",
    "z-index:50",
    "border:2px solid " + BUDGE_HIGHLIGHT_BORDER,
    "background:" + BUDGE_HIGHLIGHT_FILL,
    "box-shadow:none",
    "transition:left 80ms ease,top 80ms ease,width 80ms ease,height 80ms ease,opacity 80ms ease",
    `left:${bounds.left}px`,
    `top:${bounds.top}px`,
    `width:${bounds.width}px`,
    `height:${bounds.height}px`,
    `border-radius:${computed.borderRadius || "6px"}`,
    "transform:none",
    "opacity:1",
  ].join(";");
}

function isRecentBudgePreview() {
  const lastPreviewAt = window.__BUDGE_LAST_PREVIEW_AT__;
  return typeof lastPreviewAt === "number" && performance.now() - lastPreviewAt < 250;
}

function snapshotElement(el: Element): StyleSnapshot {
  const cs = getComputedStyle(el);
  const out = {} as StyleSnapshot;
  for (const prop of TRACKED_PROPERTIES) {
    out[prop] = cs.getPropertyValue(prop);
  }
  return out;
}

function parseNumeric(value: string): NumericValue | null {
  const raw = value.trim();
  if (!raw || raw === "auto" || raw === "normal" || raw === "none") return null;

  const numeric = Number.parseFloat(raw);
  if (!Number.isFinite(numeric)) return null;

  if (raw.endsWith("%")) return { value: numeric, unit: "%" };
  if (raw.endsWith("rem")) return { value: numeric * 16, unit: "px" };
  if (raw.endsWith("em")) return { value: numeric * 16, unit: "px" };
  if (raw.endsWith("px")) return { value: numeric, unit: "px" };
  return { value: numeric, unit: "" };
}

function parseColorHue(value: string): NumericValue | null {
  const raw = value.trim();
  if (!raw || raw === "transparent") return null;

  const match = raw.match(/^rgba?\((.*)\)$/i);
  if (!match) return null;

  const parts = match[1].match(/-?\d*\.?\d+%?/g);
  if (!parts || parts.length < 3) return null;
  if (parts.length >= 4) {
    const alpha = Number.parseFloat(parts[3]);
    if (alpha === 0) return null;
  }

  const toRgbChannel = (part: string) => {
    const value = Number.parseFloat(part);
    return part.endsWith("%") ? value * 2.55 : value;
  };

  const r = toRgbChannel(parts[0]) / 255;
  const g = toRgbChannel(parts[1]) / 255;
  const b = toRgbChannel(parts[2]) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return { value: 0, unit: "°" };

  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  return { value: Math.round((hue * 60 + 360) % 360), unit: "°" };
}

function valuesChanged(before: NumericValue, after: NumericValue) {
  const epsilon = before.unit === "%" || after.unit === "%" ? 0.05 : 0.5;
  return Math.abs(before.value - after.value) >= epsilon;
}

function diffSnapshots(before: StyleSnapshot, after: StyleSnapshot): PropertyChange[] {
  const changes: PropertyChange[] = [];
  for (const property of TRACKED_PROPERTIES) {
    if (before[property] === after[property]) continue;
    const beforeValue = parseNumeric(before[property]);
    const afterValue = parseNumeric(after[property]);
    if (!beforeValue || !afterValue) continue;
    if (!valuesChanged(beforeValue, afterValue)) continue;
    changes.push({ property, before: beforeValue, after: afterValue });
  }
  return changes;
}

function relatedProperties(property: string) {
  if (property.startsWith("padding"))
    return ["padding-top", "padding-bottom", "padding-left", "padding-right"];
  if (property.startsWith("margin"))
    return ["margin-top", "margin-bottom", "margin-left", "margin-right"];
  if (property.includes("gap")) return ["gap", "row-gap", "column-gap"];
  if (property === "font-size") return ["line-height", "letter-spacing"];
  if (property.startsWith("border-radius")) {
    return [
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
    ];
  }
  if (property === "width" || property === "max-width") return ["height", "max-width"];
  if (property === "height" || property === "max-height") return ["width", "max-height"];
  return [];
}

function slideBounds(property: string, value: number, unit: string) {
  if (property === "opacity") return { min: 0, max: 100 };
  if (property === "letter-spacing") return { min: -10, max: 20 };
  if (property === "font-size") return { min: 8, max: 96 };
  if (property === "line-height") return { min: 0, max: 120 };
  if (property.includes("radius")) return { min: 0, max: 96 };
  if (property === "width" || property === "height" || property.startsWith("max-")) {
    return { min: 0, max: Math.max(512, Math.ceil(value * 2)) };
  }
  if (unit === "%") return { min: 0, max: 100 };
  return { min: property.startsWith("margin") ? -128 : 0, max: 128 };
}

function normalizeSlideValue(property: string, value: NumericValue): NumericValue {
  if (property === "opacity") return { value: Math.round(value.value * 100), unit: "%" };
  return { value: Math.round(value.value * 100) / 100, unit: value.unit || "px" };
}

function valuesAreAligned(changes: PropertyChange[]) {
  if (changes.length === 0) return false;
  const first = changes[0];
  return changes.every((change) => {
    const sameValue = Math.abs(change.after.value - first.after.value) < 0.5;
    const sameDelta =
      Math.abs(
        change.after.value - change.before.value - (first.after.value - first.before.value),
      ) < 0.5;
    return sameValue || sameDelta;
  });
}

function choosePrimaryChange(changes: PropertyChange[]): PropertyChange | null {
  const byProperty = new Map(changes.map((change) => [change.property, change]));
  const grouped: Array<{
    properties: TrackedProperty[];
    change: PropertyChange;
    label: string;
    property: string;
  }> = [
    {
      properties: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
      change: byProperty.get("padding-top")!,
      label: "padding",
      property: "padding",
    },
    {
      properties: ["padding-top", "padding-bottom"],
      change: byProperty.get("padding-top")!,
      label: "padding-y",
      property: "padding-top,padding-bottom",
    },
    {
      properties: ["padding-left", "padding-right"],
      change: byProperty.get("padding-left")!,
      label: "padding-x",
      property: "padding-left,padding-right",
    },
    {
      properties: ["margin-top", "margin-right", "margin-bottom", "margin-left"],
      change: byProperty.get("margin-top")!,
      label: "margin",
      property: "margin",
    },
    {
      properties: ["margin-top", "margin-bottom"],
      change: byProperty.get("margin-top")!,
      label: "margin-y",
      property: "margin-top,margin-bottom",
    },
    {
      properties: ["margin-left", "margin-right"],
      change: byProperty.get("margin-left")!,
      label: "margin-x",
      property: "margin-left,margin-right",
    },
    {
      properties: [
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius",
      ],
      change: byProperty.get("border-top-left-radius")!,
      label: "border-radius",
      property: "border-radius",
    },
  ];

  for (const group of grouped) {
    if (!group.change) continue;
    const groupChanges = group.properties.flatMap((property) => {
      const change = byProperty.get(property);
      return change ? [change] : [];
    });
    if (groupChanges.length !== group.properties.length || !valuesAreAligned(groupChanges))
      continue;
    return { ...group.change, property: group.property as TrackedProperty };
  }

  const priority = [
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "gap",
    "row-gap",
    "column-gap",
    "font-size",
    "line-height",
    "letter-spacing",
    "border-radius",
    "border-width",
    "opacity",
    "width",
    "height",
    "max-width",
    "max-height",
  ];

  for (const property of priority) {
    const change = byProperty.get(property as TrackedProperty);
    if (change) return change;
  }
  return null;
}

function buildSlide(
  property: string,
  label: string,
  before: NumericValue,
  after: NumericValue,
): BudgeSlide {
  const normalizedBefore = normalizeSlideValue(property, before);
  const normalizedAfter = normalizeSlideValue(property, after);
  const bounds = slideBounds(property, normalizedAfter.value, normalizedAfter.unit);
  return {
    label,
    property,
    min: bounds.min,
    max: bounds.max,
    value: normalizedAfter.value,
    original: normalizedBefore.value,
    unit: normalizedAfter.unit,
  };
}

function buildSlides(primary: PropertyChange, after: StyleSnapshot): BudgeSlide[] {
  const property = primary.property;
  const slides = [
    buildSlide(property, property.replace(/,/g, " + "), primary.before, primary.after),
  ];
  const seen = new Set<string>([property]);

  for (const related of relatedProperties(property)) {
    if (seen.has(related)) continue;
    const value = parseNumeric(after[related as TrackedProperty]);
    if (!value) continue;
    const normalized = normalizeSlideValue(related, value);
    const bounds = slideBounds(related, normalized.value, normalized.unit);
    slides.push({
      label: related,
      property: related,
      min: bounds.min,
      max: bounds.max,
      value: normalized.value,
      original: normalized.value,
      unit: normalized.unit,
    });
    seen.add(related);
    if (slides.length >= 4) break;
  }

  return slides;
}

function sameNumericValue(a: NumericValue, b: NumericValue) {
  if (a.unit !== b.unit) return false;
  return Math.abs(a.value - b.value) < 0.5;
}

function alignedValue(snapshot: StyleSnapshot, properties: TrackedProperty[]) {
  const values = properties.map((property) => parseNumeric(snapshot[property]));
  if (values.some((value) => !value)) return null;
  const first = values[0]!;
  return values.every((value) => value && sameNumericValue(first, value)) ? first : null;
}

function numericValue(snapshot: StyleSnapshot, property: TrackedProperty) {
  return parseNumeric(snapshot[property]);
}

function selectionNumericValue(snapshot: StyleSnapshot, property: TrackedProperty) {
  const value = numericValue(snapshot, property);
  if (value) return value;

  if (property === "line-height") {
    const fontSize = numericValue(snapshot, "font-size");
    return fontSize
      ? { value: Math.round(fontSize.value * 1.2 * 100) / 100, unit: fontSize.unit || "px" }
      : null;
  }

  if (
    property === "letter-spacing" ||
    property === "gap" ||
    property === "row-gap" ||
    property === "column-gap"
  ) {
    return { value: 0, unit: "px" };
  }

  return null;
}

function buildSelectionSlides(el: HTMLElement): BudgeSlide[] {
  const snapshot = snapshotElement(el);
  const slides: BudgeSlide[] = [];
  const seen = new Set<string>();

  const pushSlide = (property: string, label: string, value: NumericValue | null) => {
    if (!value || seen.has(property) || slides.length >= MAX_SELECTION_SLIDES) return;
    slides.push(buildSlide(property, label, value, value));
    seen.add(property);
  };

  const pushColorSlide = (property: TrackedProperty, label: string) => {
    if (seen.has(property) || slides.length >= MAX_SELECTION_SLIDES) return;
    const value = parseColorHue(snapshot[property]);
    if (!value) return;
    slides.push({
      label,
      property,
      min: 0,
      max: 360,
      value: value.value,
      original: value.value,
      unit: value.unit,
      type: "color",
    });
    seen.add(property);
  };

  const pushBoxGroup = (
    label: string,
    property: string,
    allProperties: TrackedProperty[],
    blockProperties: TrackedProperty[],
    inlineProperties: TrackedProperty[],
  ) => {
    const all = alignedValue(snapshot, allProperties);
    if (all) {
      pushSlide(property, label, all);
    }

    const block = alignedValue(snapshot, blockProperties);
    const inline = alignedValue(snapshot, inlineProperties);
    pushSlide(`${property}-top,${property}-bottom`, `${label}-y`, block);
    pushSlide(`${property}-left,${property}-right`, `${label}-x`, inline);

    pushSlide(`${property}-top`, `${label} top`, numericValue(snapshot, blockProperties[0]));
    pushSlide(`${property}-bottom`, `${label} bottom`, numericValue(snapshot, blockProperties[1]));
    pushSlide(`${property}-left`, `${label} left`, numericValue(snapshot, inlineProperties[0]));
    pushSlide(`${property}-right`, `${label} right`, numericValue(snapshot, inlineProperties[1]));
  };

  pushBoxGroup(
    "padding",
    "padding",
    ["padding-top", "padding-right", "padding-bottom", "padding-left"],
    ["padding-top", "padding-bottom"],
    ["padding-left", "padding-right"],
  );

  pushBoxGroup(
    "margin",
    "margin",
    ["margin-top", "margin-right", "margin-bottom", "margin-left"],
    ["margin-top", "margin-bottom"],
    ["margin-left", "margin-right"],
  );

  pushSlide("gap", "gap", selectionNumericValue(snapshot, "gap"));
  const rowGap = selectionNumericValue(snapshot, "row-gap");
  const columnGap = selectionNumericValue(snapshot, "column-gap");
  pushSlide("row-gap", "row gap", rowGap);
  pushSlide("column-gap", "column gap", columnGap);

  pushSlide("font-size", "font size", numericValue(snapshot, "font-size"));
  pushSlide("line-height", "line height", selectionNumericValue(snapshot, "line-height"));
  pushSlide("letter-spacing", "letter spacing", selectionNumericValue(snapshot, "letter-spacing"));
  pushColorSlide("color", "text color");
  pushColorSlide("background-color", "background color");
  pushColorSlide("border-color", "border color");

  const radius = alignedValue(snapshot, [
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
  ]);
  pushSlide("border-radius", "border radius", radius);
  pushSlide(
    "border-top-left-radius",
    "top left radius",
    numericValue(snapshot, "border-top-left-radius"),
  );
  pushSlide(
    "border-top-right-radius",
    "top right radius",
    numericValue(snapshot, "border-top-right-radius"),
  );
  pushSlide(
    "border-bottom-right-radius",
    "bottom right radius",
    numericValue(snapshot, "border-bottom-right-radius"),
  );
  pushSlide(
    "border-bottom-left-radius",
    "bottom left radius",
    numericValue(snapshot, "border-bottom-left-radius"),
  );
  pushSlide("border-width", "border width", numericValue(snapshot, "border-width"));

  pushSlide("width", "width", numericValue(snapshot, "width"));
  pushSlide("height", "height", numericValue(snapshot, "height"));
  pushSlide("max-width", "max width", numericValue(snapshot, "max-width"));
  pushSlide("max-height", "max height", numericValue(snapshot, "max-height"));
  pushSlide("opacity", "opacity", numericValue(snapshot, "opacity"));

  return slides;
}

function updateAutoTarget(el: HTMLElement) {
  if (autoTarget && autoTarget !== el && !autoTargetHadMarker) {
    autoTarget.removeAttribute(BUDGE_TARGET_ATTR);
  }
  autoTarget = el;
  autoTargetHadMarker = el.hasAttribute(BUDGE_TARGET_ATTR);
  if (!autoTargetHadMarker) el.setAttribute(BUDGE_TARGET_ATTR, "");
}

function setAutoConfig(el: HTMLElement, slides: BudgeSlide[], source: AutoConfigSource = "detect") {
  updateAutoTarget(el);
  autoConfigSource = source;
  autoConfig = { slides, autoFocus: true };
  autoConfigFingerprint = configFingerprint(autoConfig);
  sync();
  attachSourceContext(el, autoConfigFingerprint);
}

function getSourceFrame(context: ReactGrabElementContext) {
  return (
    context.stack.find((frame) => frame.fileName && frame.lineNumber) ??
    context.stack.find((frame) => frame.fileName) ??
    null
  );
}

function getPromptElementContext(
  context: ReactGrabElementContext,
): BudgeElementContext | undefined {
  const htmlPreview = context.htmlPreview.trim();
  if (!htmlPreview) return undefined;

  return {
    componentName: context.componentName,
    selector: context.selector,
    htmlPreview,
  };
}

async function attachSourceContext(el: HTMLElement, fingerprint: string) {
  if (!autoConfig?.slides) return;
  if (fingerprint !== autoConfigFingerprint || autoTarget !== el) return;

  try {
    const context = await getElementContext(el);
    const source = getSourceFrame(context);
    const elementContext = getPromptElementContext(context);
    if (fingerprint !== autoConfigFingerprint || autoTarget !== el || !autoConfig?.slides) return;
    autoConfig = {
      ...autoConfig,
      slides: autoConfig.slides.map((slide) => ({
        ...slide,
        file: source?.fileName ?? slide.file,
        line: source?.lineNumber ?? slide.line,
        elementContext: elementContext ?? slide.elementContext,
      })),
    };
    autoConfigFingerprint = configFingerprint(autoConfig);
    sync();
  } catch {
    // Source lookup is opportunistic; Budge still works without React metadata.
  }
}

function isBudgeActivationEvent(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  return (
    (key === "e" || event.code === "KeyE") &&
    event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.shiftKey &&
    !isFromBudgeUi(event.target)
  );
}

function withReactGrabFreezeSuspended<T>(read: () => T): T {
  const style = document.querySelector<HTMLStyleElement>(REACT_GRAB_FREEZE_STYLE_SELECTOR);
  const wasDisabled = style?.disabled ?? false;
  if (style) style.disabled = true;
  try {
    return read();
  } finally {
    if (style) style.disabled = wasDisabled;
  }
}

function getPrimitiveTargetAt(x: number, y: number) {
  const el = withReactGrabFreezeSuspended(() => document.elementFromPoint(x, y));
  if (!(el instanceof HTMLElement)) return null;
  if (shouldIgnoreElement(el)) return null;
  return el;
}

function getPrimitiveElementsAt(x: number, y: number) {
  return withReactGrabFreezeSuspended(() => document.elementsFromPoint(x, y)).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && !shouldIgnoreElement(el),
  );
}

function getPrimitiveSelectionPath(target: HTMLElement | null) {
  const path: HTMLElement[] = [];
  let current: HTMLElement | null = target;

  while (current && current !== document.documentElement && current !== document.body) {
    if (!shouldIgnoreElement(current)) path.push(current);
    current = current.parentElement;
  }

  return path;
}

function getFirstSelectableDescendant(target: HTMLElement) {
  for (const el of target.querySelectorAll("*")) {
    if (el instanceof HTMLElement && !shouldIgnoreElement(el)) return el;
  }
  return null;
}

function getPrimitiveDescendantTarget(target: HTMLElement | null) {
  if (!target) return null;

  if (primitiveSelectionPointer) {
    const stack = getPrimitiveElementsAt(primitiveSelectionPointer.x, primitiveSelectionPointer.y);
    const currentIndex = stack.indexOf(target);
    if (currentIndex > 0) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const candidate = stack[i];
        if (target.contains(candidate)) return candidate;
      }
    }
  }

  return getFirstSelectableDescendant(target);
}

function startPrimitiveFreeze() {
  if (primitiveSelectionFreezeActive) return;
  if (!isFreezeActive()) freeze();
  primitiveSelectionFreezeActive = true;
}

function stopPrimitiveFreeze() {
  if (!primitiveSelectionFreezeActive) return;
  primitiveSelectionFreezeActive = false;
  unfreeze();
}

function clearPrimitiveClickSuppression() {
  suppressPrimitiveClick = false;
  if (suppressPrimitiveClickTimer !== null) {
    window.clearTimeout(suppressPrimitiveClickTimer);
    suppressPrimitiveClickTimer = null;
  }
}

function suppressNextPrimitiveClick() {
  suppressPrimitiveClick = true;
  if (suppressPrimitiveClickTimer !== null) {
    window.clearTimeout(suppressPrimitiveClickTimer);
  }
  suppressPrimitiveClickTimer = window.setTimeout(clearPrimitiveClickSuppression, 600);
}

function blockPrimitiveEvent(event: Event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function startPrimitiveSelection() {
  if (primitiveSelectionActive) return;
  primitiveSelectionActive = true;
  startPrimitiveFreeze();
}

function stopPrimitiveSelection() {
  primitiveSelectionActive = false;
  primitiveSelectionTarget = null;
  primitiveSelectionPath = [];
  primitiveSelectionPathIndex = 0;
  primitiveSelectionPointer = null;
  removePrimitiveHighlight();
  stopPrimitiveFreeze();
}

function updatePrimitiveSelectionTarget(x: number, y: number) {
  if (!primitiveSelectionActive) return;
  primitiveSelectionPointer = { x, y };
  primitiveSelectionPath = getPrimitiveSelectionPath(getPrimitiveTargetAt(x, y));
  primitiveSelectionPathIndex = 0;
  primitiveSelectionTarget = primitiveSelectionPath[primitiveSelectionPathIndex] ?? null;
  updatePrimitiveHighlight(primitiveSelectionTarget);
}

function refinePrimitiveSelection(direction: number) {
  if (!primitiveSelectionActive || primitiveSelectionPath.length === 0) return;
  const next = Math.max(
    0,
    Math.min(primitiveSelectionPath.length - 1, primitiveSelectionPathIndex + direction),
  );
  if (next === primitiveSelectionPathIndex) {
    if (direction >= 0) return;
    const descendant = getPrimitiveDescendantTarget(primitiveSelectionTarget);
    if (!descendant) return;
    primitiveSelectionPath = getPrimitiveSelectionPath(descendant);
    primitiveSelectionPathIndex = 0;
    primitiveSelectionTarget = primitiveSelectionPath[primitiveSelectionPathIndex] ?? descendant;
    updatePrimitiveHighlight(primitiveSelectionTarget);
    return;
  }
  primitiveSelectionPathIndex = next;
  primitiveSelectionTarget = primitiveSelectionPath[primitiveSelectionPathIndex] ?? null;
  updatePrimitiveHighlight(primitiveSelectionTarget);
}

function selectPrimitiveTarget(target: HTMLElement | null) {
  let slides: BudgeSlide[] = [];

  try {
    if (target) {
      slides = buildSelectionSlides(target);
    }
  } finally {
    stopPrimitiveSelection();
  }

  if (target && slides.length > 0) {
    setAutoConfig(target, slides, "selection");
  }
}

function startPrimitiveSelectionRuntime() {
  if (primitiveSelectionStarted) return;
  primitiveSelectionStarted = true;

  window.addEventListener(
    "keydown",
    (event) => {
      notePageInteraction(event);
      if (primitiveSelectionActive && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        event.preventDefault();
        event.stopPropagation();
        refinePrimitiveSelection(event.key === "ArrowUp" ? 1 : -1);
        return;
      }

      if (!isBudgeActivationEvent(event)) {
        if (primitiveSelectionActive && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          stopPrimitiveSelection();
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      startPrimitiveSelection();
    },
    { capture: true },
  );

  window.addEventListener("blur", stopPrimitiveSelection);

  window.addEventListener("pointerdown", notePageInteraction, { capture: true, passive: true });

  window.addEventListener(
    "pointermove",
    (event) => {
      updatePrimitiveSelectionTarget(event.clientX, event.clientY);
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (!primitiveSelectionActive || event.button !== 0 || !event.isPrimary) return;
      suppressNextPrimitiveClick();
      blockPrimitiveEvent(event);
      selectPrimitiveTarget(
        primitiveSelectionTarget ?? getPrimitiveTargetAt(event.clientX, event.clientY),
      );
    },
    { capture: true },
  );

  window.addEventListener(
    "pointerup",
    (event) => {
      if (!suppressPrimitiveClick) return;
      blockPrimitiveEvent(event);
    },
    { capture: true },
  );

  window.addEventListener(
    "mouseup",
    (event) => {
      if (!suppressPrimitiveClick) return;
      blockPrimitiveEvent(event);
    },
    { capture: true },
  );

  window.addEventListener(
    "click",
    (event) => {
      if (!primitiveSelectionActive && !suppressPrimitiveClick) return;
      blockPrimitiveEvent(event);
      if (primitiveSelectionActive) {
        const target =
          event instanceof MouseEvent
            ? (primitiveSelectionTarget ?? getPrimitiveTargetAt(event.clientX, event.clientY))
            : primitiveSelectionTarget;
        selectPrimitiveTarget(target);
      }
      clearPrimitiveClickSuppression();
    },
    { capture: true },
  );
}

function rememberSubtree(root: Element) {
  if (shouldIgnoreElement(root)) return;
  snapshots.set(root, snapshotElement(root));
  const elements = root.querySelectorAll("[class],[style]");
  for (const el of elements) {
    if (!shouldIgnoreElement(el)) snapshots.set(el, snapshotElement(el));
  }
}

function startAutoDetect() {
  if (!readAutoDetectSetting()) return;
  if (!document.body) return;

  rememberSubtree(document.body);

  let pending: { el: HTMLElement; slides: BudgeSlide[] } | null = null;
  let pendingTimer: ReturnType<typeof setTimeout> | undefined;

  const queue = (el: HTMLElement, slides: BudgeSlide[]) => {
    pending = { el, slides };
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => {
      if (!pending) return;
      setAutoConfig(pending.el, pending.slides);
      pending = null;
    }, 80);
  };

  const observer = new MutationObserver((records) => {
    if (document.querySelector(BUDGE_CONFIG_SELECTOR)) return;

    for (const record of records) {
      if (record.type === "childList") {
        for (const node of record.addedNodes) {
          if (node instanceof Element) rememberSubtree(node);
        }
        continue;
      }

      if (record.type !== "attributes" || !(record.target instanceof HTMLElement)) continue;
      const el = record.target;
      if (shouldIgnoreElement(el) || isRecentBudgePreview() || isRecentPageInteraction()) {
        snapshots.set(el, snapshotElement(el));
        continue;
      }

      const before = snapshots.get(el);
      const after = snapshotElement(el);
      snapshots.set(el, after);
      if (!before) continue;

      const changes = diffSnapshots(before, after);
      if (changes.length === 0 || changes.length > 8) continue;

      const primary = choosePrimaryChange(changes);
      if (!primary) continue;

      queue(el, buildSlides(primary, after));
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style"],
    childList: true,
    subtree: true,
  });
}

if (typeof document !== "undefined") {
  const init = () => {
    sync();
    startAutoDetect();
    startPrimitiveSelectionRuntime();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-budge"],
      characterData: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
