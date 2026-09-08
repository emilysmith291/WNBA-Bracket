import { ArrowRight, Sparkles, Trophy, Users } from "lucide-react";
import Link from "next/link";

import { PlayerHeadshot } from "@/components/site/player-headshot";
import { StandingsTable } from "@/components/site/standings-table";
import { TeamBadge } from "@/components/site/team-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getChampionVoteCounts, getMvpVoteCounts, getPlayers, getTeams } from "@/lib/data/fetch";

export default async function Home() {
  const [teams, players, championVotes, mvpVotes] = await Promise.all([
    getTeams(),
    getPlayers(),
    getChampionVoteCounts(),
    getMvpVoteCounts(),
  ]);

  const playoffTeams = teams
    .filter((t) => t.madePlayoffs)
    .sort((a, b) => (a.overallSeed ?? 0) - (b.overallSeed ?? 0));

  const totalChampionVotes = Object.values(championVotes).reduce((a, b) => a + b, 0);
  const totalMvpVotes = Object.values(mvpVotes).reduce((a, b) => a + b, 0);
  const teamsById = Object.fromEntries(teams.map((t) => [t.id, t]));

  return (
    <div>
      {/* Hero */}
      <section className="bg-arena relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            2026 WNBA Playoffs tip off September 27
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Who takes home the <span className="text-gradient-brand">trophy</span> this year?
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-balance">
            Build your own playoff bracket, crown your MVP, and see how your picks compare to
            everyone else calling their shot before the postseason starts.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full text-base">
              <Link href="/bracket">
                Build My Bracket <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full text-base">
              <Link href="/mvp">
                Pick My MVP <Trophy className="size-4" />
              </Link>
            </Button>
          </div>

          {(totalChampionVotes > 0 || totalMvpVotes > 0) && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {totalChampionVotes} champion picks &amp; {totalMvpVotes} MVP picks submitted so far
            </p>
          )}
        </div>
      </section>

      {/* Playoff field teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">The Playoff Field</h2>
            <p className="mt-1 text-muted-foreground">
              Eight teams clinched. One will cut down the nets.
            </p>
          </div>
          <Link
            href="/bracket"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            Predict it <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {playoffTeams.map((team) => (
            <Card
              key={team.id}
              className="flex flex-col items-center gap-3 border border-border/60 p-5 text-center transition-transform hover:-translate-y-0.5"
            >
              <TeamBadge team={team} size="lg" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">#{team.overallSeed} seed</p>
                <p className="text-sm font-semibold leading-tight">
                  {team.city} {team.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {team.wins}-{team.losses}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* MVP teaser + standings */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-4 sm:px-6 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Full Standings</h2>
          <p className="mt-1 mb-6 text-muted-foreground">
            Regular season closes September 24.
          </p>
          <StandingsTable teams={teams} />
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">MVP Watch</h2>
          <p className="mt-1 mb-6 text-muted-foreground">Top of the ballot right now.</p>
          <div className="space-y-3">
            {players.slice(0, 4).map((player, i) => (
              <Card key={player.id} className="flex items-center gap-3 border border-border/60 p-3.5">
                <div className="relative shrink-0">
                  <PlayerHeadshot player={player} team={teamsById[player.teamId]} size="sm" />
                  <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold ring-2 ring-card">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.accolade}</p>
                </div>
                <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
                  {player.ppg}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">ppg</span>
                </span>
              </Card>
            ))}
          </div>
          <Button asChild variant="link" className="mt-2 px-0">
            <Link href="/mvp">
              See the full MVP ballot <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
