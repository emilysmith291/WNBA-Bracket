import { TeamBadge } from "@/components/site/team-badge";
import type { Team } from "@/lib/data/teams";
import { cn } from "@/lib/utils";

export function StandingsTable({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((a, b) => b.wins - a.wins - (a.losses - b.losses));

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <div className="grid grid-cols-[2.5rem_1fr_auto] gap-x-3 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[2.5rem_1fr_5rem_auto]">
        <span>#</span>
        <span>Team</span>
        <span className="hidden text-right sm:block">Record</span>
        <span className="text-right">Status</span>
      </div>
      <div className="divide-y divide-border/60">
        {sorted.map((team, i) => (
          <div
            key={team.id}
            className={cn(
              "grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 px-4 py-2.5 sm:grid-cols-[2.5rem_1fr_5rem_auto]",
              team.madePlayoffs && "bg-primary/[0.04]"
            )}
          >
            <span className="text-sm font-semibold text-muted-foreground">{i + 1}</span>
            <div className="flex min-w-0 items-center gap-2.5">
              <TeamBadge team={team} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-tight">
                  {team.city} {team.name}
                </p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {team.wins}-{team.losses}
                </p>
              </div>
            </div>
            <span className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">
              {team.wins}-{team.losses}
            </span>
            <span className="text-right text-xs font-medium">
              {team.madePlayoffs ? (
                <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">
                  #{team.overallSeed} seed
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
