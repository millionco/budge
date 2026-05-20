import { DEMO_STEP_DEFINITIONS } from "@/lib/demo/constants";
import { DEMO_EVENTS } from "@/lib/demo-events";
import type { ViewerRunState } from "@/lib/replay-types";

const replayStartMs = DEMO_EVENTS[0]?.timestamp ?? 0;

export const DEMO_TRACE: ViewerRunState = {
  title: "test expect.dev",
  status: "passed",
  summary: undefined,
  done: true,
  steps: DEMO_STEP_DEFINITIONS.map((step) => ({
    stepId: step.stepId,
    title: step.title,
    status: "passed",
    summary: undefined,
    startedAtMs: replayStartMs + step.startOffsetMs,
    endedAtMs: replayStartMs + step.endOffsetMs,
  })),
};
