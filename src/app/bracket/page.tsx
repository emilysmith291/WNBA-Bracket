import type { Metadata } from "next";

import { getChampionVoteCounts, getTeams } from "@/lib/data/fetch";

import { BracketClient } from "./bracket-client";

export const metadata: Metadata = {
  title: "Championship Bracket — Final Say",
  description: "Predict the 2026 WNBA playoff bracket, game by game, and crown your champion.",
};

export default async function BracketPage() {
  const [teams, votes] = await Promise.all([getTeams(), getChampionVoteCounts()]);
  const playoffTeams = teams
    .filter((t) => t.madePlayoffs && t.overallSeed !== null)
    .sort((a, b) => (a.overallSeed ?? 0) - (b.overallSeed ?? 0));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Build your <span className="text-gradient-brand">championship bracket</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick a winner in every matchup to advance them to the next round. Playoffs are a
          single-elimination, best-of series format — tip-off is September 27.
        </p>
      </div>
      <BracketClient playoffTeams={playoffTeams} initialVotes={votes} />
    </div>
  );
}
