"use client";

import { useEffect, useRef } from "react";

declare global {
  // eslint-disable-next-line no-var
  var Budge: {
    widget: {
      mount: (target: HTMLElement, props?: Record<string, unknown>) => void;
      update: (props: Record<string, unknown>) => void;
      unmount: () => void;
    };
  };
}

export interface BudgeSlide {
  label: string;
  property: string;
  min: number;
  max: number;
  value: number;
  original: number;
  unit: string;
  type?: "numeric" | "color";
}

export function Budge({ slides }: { slides?: BudgeSlide[] } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const slidesKey = JSON.stringify(slides);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    function tryMount() {
      if (typeof globalThis.Budge === "undefined") {
        setTimeout(tryMount, 100);
        return;
      }
      globalThis.Budge.widget.mount(ref.current!, { slides, autoFocus: true });
    }
    tryMount();
    return () => {
      if (typeof globalThis.Budge !== "undefined") {
        globalThis.Budge.widget.unmount();
      }
    };
  }, [slidesKey]);

  return <div ref={ref} />;
}
