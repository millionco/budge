import type { eventWithTime } from "@posthog/rrweb";

export type { eventWithTime };

const loadRrweb = () => import("@posthog/rrweb");

let events: eventWithTime[] = [];
let stopFn: (() => void) | undefined;

export const startRecording = async () => {
  const { record } = await loadRrweb();
  events = [];
  stopFn = record({
    emit: (event) => {
      events.push(event);
    },
    blockSelector: "[data-rrweb-block]",
  }) as (() => void) | undefined;
};

export const stopRecording = () => {
  stopFn?.();
  stopFn = undefined;
  return events;
};

export const getEvents = () => [...events];
