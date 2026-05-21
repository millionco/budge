"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import type { eventWithTime } from "@posthog/rrweb";
import { useEffect, useRef } from "react";
import { ReplayViewer } from "@/components/replay/replay-viewer";
import type { ViewerRunState } from "@/lib/replay-types";
import { DEMO_EVENTS } from "@/lib/demo-events";
import { DEMO_TRACE } from "@/lib/demo-trace";

const POLL_INTERVAL_MS = 500;
const EMPTY_EVENTS: eventWithTime[] = [];

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

const fetchLatestEvents = async (): Promise<eventWithTime[]> => {
  const response = await fetch("/latest.json");
  if (!response.ok) return [];
  return response.json();
};

const fetchSteps = async (): Promise<ViewerRunState> => {
  const response = await fetch("/steps");
  if (!response.ok) return { title: "", status: "running", summary: undefined, steps: [] };
  return response.json();
};

const LiveMode = () => {
  const addEventsRef = useRef<((newEvents: eventWithTime[]) => void) | undefined>(undefined);
  const previousEventCountRef = useRef(0);

  const eventsQuery = useQuery({
    queryKey: ["replay-events"],
    queryFn: fetchLatestEvents,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const stepsQuery = useQuery({
    queryKey: ["replay-steps"],
    queryFn: fetchSteps,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const events = eventsQuery.data ?? EMPTY_EVENTS;
  const steps = stepsQuery.data;
  const isRunning = !steps || (steps.status === "running" && !steps.done);

  useEffect(() => {
    if (events.length <= previousEventCountRef.current) return;
    const newEvents = events.slice(previousEventCountRef.current);
    previousEventCountRef.current = events.length;
    addEventsRef.current?.(newEvents);
  }, [events]);

  const handleAddEventsRef = (handler: (newEvents: eventWithTime[]) => void) => {
    addEventsRef.current = handler;
  };

  return (
    <ReplayViewer
      events={events}
      steps={steps}
      live={isRunning}
      autoPlay
      onAddEventsRef={handleAddEventsRef}
    />
  );
};

const DemoMode = () => {
  return <ReplayViewer events={DEMO_EVENTS} steps={DEMO_TRACE} autoPlay />;
};

export function ReplayPageClient({ mode }: { mode: "live" | "demo" }) {
  return (
    <QueryClientProvider client={queryClient}>
      {mode === "demo" ? <DemoMode /> : <LiveMode />}
    </QueryClientProvider>
  );
}
