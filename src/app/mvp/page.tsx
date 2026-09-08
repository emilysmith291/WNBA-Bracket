import type { Metadata } from "next";

import { getMvpVoteCounts, getPlayers, getTeams } from "@/lib/data/fetch";

import { MvpClient } from "./mvp-client";

export const metadata: Metadata = {
  title: "MVP Race — Final Say",
  description: "Vote for who you think takes home the 2026 WNBA Kia MVP award.",
};

export default async function MvpPage() {
  const [players, teams, votes] = await Promise.all([
    getPlayers(),
    getTeams(),
    getMvpVoteCounts(),
  ]);
  const teamsById = Object.fromEntries(teams.map((t) => [t.id, t]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Who&apos;s taking home <span className="text-gradient-brand">MVP</span>?
        </h1>
        <p className="mt-2 text-muted-foreground">
          A&apos;ja Wilson is chasing a record 5th award, but the race is stacked. Pick your MVP
          from this year&apos;s top candidates.
        </p>
      </div>
      <MvpClient players={players} teamsById={teamsById} initialVotes={votes} />
    </div>
  );
}
