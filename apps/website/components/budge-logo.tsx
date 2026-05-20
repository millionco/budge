"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ARROW_D =
  "M13.415 2.5C12.634 1.719 11.367 1.719 10.586 2.5L3.427 9.659C2.01 11.076 3.014 13.5 5.018 13.5H7V20C7 21.104 7.895 22 9 22H15C16.105 22 17 21.104 17 20V13.5H18.983C20.987 13.5 21.991 11.076 20.574 9.659L13.415 2.5Z";

type Direction = "push-down" | "push-up";

const ARROW_SIZE = 11;

const directionConfig: Record<
  Direction,
  {
    rotation: number;
    textTranslate: string;
    arrowPosition: React.CSSProperties;
    arrowBounceY: number;
  }
> = {
  "push-down": {
    rotation: 180,
    textTranslate: "translateY(1.5px)",
    arrowPosition: { bottom: "100%", left: "50%", marginLeft: -ARROW_SIZE / 2, marginBottom: 1 },
    arrowBounceY: -2,
  },
  "push-up": {
    rotation: 0,
    textTranslate: "translateY(-1.5px)",
    arrowPosition: { top: "100%", left: "50%", marginLeft: -ARROW_SIZE / 2, marginTop: 1 },
    arrowBounceY: -2,
  },
};

type Phase = "idle" | "arrow-in" | "nudge" | "settle" | "arrow-out";

export function BudgeLogo({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [direction, setDirection] = useState<Direction>("push-down");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const mountedRef = useRef(true);

  const scheduleNext = useCallback(() => {
    const delay = 5000 + Math.random() * 9000;
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      const dirs: Direction[] = ["push-down", "push-up"];
      setDirection(dirs[Math.floor(Math.random() * dirs.length)]);
      setPhase("arrow-in");
    }, delay);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    scheduleNext();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scheduleNext]);

  useEffect(() => {
    if (phase === "idle") return;

    let t: ReturnType<typeof setTimeout>;
    switch (phase) {
      case "arrow-in":
        t = setTimeout(() => mountedRef.current && setPhase("nudge"), 180);
        break;
      case "nudge":
        t = setTimeout(() => mountedRef.current && setPhase("settle"), 100);
        break;
      case "settle":
        t = setTimeout(() => mountedRef.current && setPhase("arrow-out"), 400);
        break;
      case "arrow-out":
        t = setTimeout(() => {
          if (!mountedRef.current) return;
          setPhase("idle");
          scheduleNext();
        }, 350);
        break;
    }
    return () => clearTimeout(t);
  }, [phase, scheduleNext]);

  const cfg = directionConfig[direction];
  const isNudging = phase === "nudge";
  const arrowVisible = phase === "arrow-in" || phase === "nudge" || phase === "settle";
  const arrowBouncing = phase === "nudge";

  const textTransform = isNudging ? cfg.textTranslate : "translateY(0)";

  const textTransition = isNudging
    ? "transform 0.08s cubic-bezier(0, 0, 0.2, 1)"
    : "transform 0.45s cubic-bezier(0.34, 1.8, 0.64, 1)";

  const arrowTransform = `rotate(${cfg.rotation}deg) translateY(${arrowBouncing ? cfg.arrowBounceY : 0}px) scale(${arrowBouncing ? 1.1 : 1})`;

  const arrowTransition = arrowBouncing
    ? "transform 0.06s cubic-bezier(0, 0, 0.2, 1), opacity 0.15s ease"
    : "transform 0.45s cubic-bezier(0.34, 1.8, 0.64, 1), opacity 0.25s ease";

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          display: "inline-block",
          transform: textTransform,
          transition: textTransition,
        }}
      >
        {children}
      </span>
      <svg
        width={ARROW_SIZE}
        height={ARROW_SIZE}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{
          position: "absolute",
          ...cfg.arrowPosition,
          opacity: arrowVisible ? 0.38 : 0,
          pointerEvents: "none",
          transform: arrowTransform,
          transition: arrowTransition,
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={ARROW_D}
          fill="#A7A7A7"
        />
      </svg>
    </span>
  );
}
