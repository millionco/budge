import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReplayPageClient } from "./replay-page-client";

export const metadata: Metadata = {
  title: "Replay | budge",
  description: "Watch live and demo browser replays for budge.",
};

interface ReplayPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ReplayPage({ searchParams }: ReplayPageProps) {
  const resolvedSearchParams = await searchParams;
  const isLive = resolvedSearchParams?.live === "true";
  const isDemo = resolvedSearchParams?.demo === "true";

  if (!isLive && !isDemo) {
    redirect("/replay?live=true");
  }

  return <ReplayPageClient mode={isDemo ? "demo" : "live"} />;
}
