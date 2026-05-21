import type { Metadata } from "next";
import { TestBudgeClient } from "./test-budge-client";

export const metadata: Metadata = {
  title: "Test Budge | budge",
  description: "Exercise the real Budge widget against live page elements.",
};

export default function TestBudgePage() {
  return <TestBudgeClient />;
}
