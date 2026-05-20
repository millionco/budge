import type { eventWithTime } from "@posthog/rrweb";
import { DEMO_TARGET_URL } from "@/lib/demo/constants";
import recordedDemoEvents from "@/lib/recorded-demo-events.json";

const demoEvents: eventWithTime[] = recordedDemoEvents.map((event) => {
  if (event.type !== 4 || typeof event.data.href !== "string") {
    return event;
  }

  const url = new URL(event.data.href);
  if (url.hostname !== "www.expect.dev") {
    return event;
  }

  return {
    ...event,
    data: {
      ...event.data,
      href: `${DEMO_TARGET_URL}${url.pathname}${url.search}${url.hash}`,
    },
  };
});

export const DEMO_EVENTS = demoEvents;
