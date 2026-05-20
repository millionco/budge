export interface ViewerStepEvent {
  readonly stepId: string;
  readonly title: string;
  readonly status: "pending" | "active" | "passed" | "failed" | "skipped";
  readonly summary: string | undefined;
  readonly startedAtMs: number | undefined;
  readonly endedAtMs: number | undefined;
}

export interface ViewerRunState {
  readonly title: string;
  readonly status: "running" | "passed" | "failed";
  readonly summary: string | undefined;
  readonly steps: readonly ViewerStepEvent[];
  readonly done?: boolean;
}
