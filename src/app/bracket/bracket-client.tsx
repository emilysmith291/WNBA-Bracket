"use client";

import { ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { TeamBadge } from "@/components/site/team-badge";
import { VoteResults } from "@/components/site/vote-results";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fireConfetti } from "@/lib/confetti";
import type { Team } from "@/lib/data/teams";
import { getSavedDisplayName, getSessionId, saveDisplayName } from "@/lib/session";
import { getSupabaseClient } from "@/lib/supabase/client";

type MatchId = "q0" | "q1" | "q2" | "q3" | "s0" | "s1" | "f0";

const DEPENDENTS: Partial<Record<MatchId, MatchId[]>> = {
  q0: ["s0"],
  q1: ["s0"],
  q2: ["s1"],
  q3: ["s1"],
  s0: ["f0"],
  s1: ["f0"],
};

function clearDependents(picks: Record<MatchId, string | null>, changed: MatchId) {
  const next = { ...picks };
  const queue = [...(DEPENDENTS[changed] ?? [])];
  while (queue.length) {
    const m = queue.shift()!;
    if (next[m] !== null) next[m] = null;
    if (DEPENDENTS[m]) queue.push(...DEPENDENTS[m]!);
  }
  return next;
}

function TeamSlot({
  team,
  placeholder,
  selected,
  size = "md",
  onClick,
}: {
  team: Team | null;
  placeholder: string;
  selected: boolean;
  size?: "md" | "lg";
  onClick: () => void;
}) {
  if (!team) {
    return (
      <div
        className={
          "flex items-center gap-2.5 rounded-xl border border-dashed border-border/70 px-3 py-2.5 text-muted-foreground " +
          (size === "lg" ? "py-3.5" : "")
        }
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border/70 text-[10px]">
          ?
        </span>
        <span className="text-xs">{placeholder}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all " +
        (size === "lg" ? "py-3.5 " : "") +
        (selected
          ? "border-primary bg-primary/10 ring-1 ring-primary"
          : "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/60")
      }
    >
      <TeamBadge team={team} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-tight">
          {team.city} {team.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {team.wins}-{team.losses} · #{team.overallSeed} seed
        </span>
      </span>
      {selected && <span className="text-xs font-semibold text-primary">Advances</span>}
    </button>
  );
}

function Matchup({
  label,
  teamA,
  teamB,
  winnerId,
  onPick,
  size = "md",
}: {
  label: string;
  teamA: Team | null;
  teamB: Team | null;
  winnerId: string | null;
  onPick: (id: string) => void;
  size?: "md" | "lg";
}) {
  return (
    <Card className="gap-2 border border-border/60 p-3">
      <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="space-y-1.5">
        <TeamSlot
          team={teamA}
          placeholder="TBD"
          selected={winnerId === teamA?.id}
          size={size}
          onClick={() => teamA && onPick(teamA.id)}
        />
        <TeamSlot
          team={teamB}
          placeholder="TBD"
          selected={winnerId === teamB?.id}
          size={size}
          onClick={() => teamB && onPick(teamB.id)}
        />
      </div>
    </Card>
  );
}

export function BracketClient({
  playoffTeams,
  initialVotes,
}: {
  playoffTeams: Team[];
  initialVotes: Record<string, number>;
}) {
  const byId = useMemo(() => new Map(playoffTeams.map((t) => [t.id, t])), [playoffTeams]);
  const seed = (n: number) => playoffTeams.find((t) => t.overallSeed === n) ?? null;

  const [picks, setPicks] = useState<Record<MatchId, string | null>>({
    q0: null,
    q1: null,
    q2: null,
    q3: null,
    s0: null,
    s1: null,
    f0: null,
  });
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [votes, setVotes] = useState(initialVotes);

  // Defer to after mount so server/client markup match (localStorage is client-only).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setName(getSavedDisplayName()), []);

  const round0: [MatchId, Team | null, Team | null][] = [
    ["q0", seed(1), seed(8)],
    ["q1", seed(4), seed(5)],
    ["q2", seed(2), seed(7)],
    ["q3", seed(3), seed(6)],
  ];

  const teamFor = (id: string | null) => (id ? byId.get(id) ?? null : null);

  const round1: [MatchId, Team | null, Team | null][] = [
    ["s0", teamFor(picks.q0), teamFor(picks.q1)],
    ["s1", teamFor(picks.q2), teamFor(picks.q3)],
  ];

  const round2: [MatchId, Team | null, Team | null][] = [
    ["f0", teamFor(picks.s0), teamFor(picks.s1)],
  ];

  const champion = teamFor(picks.f0);

  function pick(matchId: MatchId, teamId: string) {
    setPicks((prev) => {
      const cleared = clearDependents(prev, matchId);
      return { ...cleared, [matchId]: teamId };
    });
    setSubmitted(false);
  }

  useEffect(() => {
    if (champion) fireConfetti([champion.primary, champion.secondary]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [champion?.id]);

  function reset() {
    setPicks({ q0: null, q1: null, q2: null, q3: null, s0: null, s1: null, f0: null });
    setSubmitted(false);
  }

  async function submit() {
    if (!champion) return;
    setSubmitting(true);
    saveDisplayName(name);

    const supabase = getSupabaseClient();
    if (!supabase) {
      toast.error("Supabase isn't connected yet — set NEXT_PUBLIC_SUPABASE_URL to save picks.");
      setSubmitting(false);
      return;
    }

    const session_id = getSessionId();
    const { error } = await supabase
      .from("champion_predictions")
      .upsert(
        { session_id, display_name: name || null, team_id: champion.id },
        { onConflict: "session_id" }
      );

    if (error) {
      toast.error("Couldn't save your pick — try again.");
    } else {
      toast.success(`Locked in: ${champion.city} ${champion.name} to win it all!`);
      setSubmitted(true);
      const { data } = await supabase.from("champion_vote_counts").select("*");
      if (data) {
        setVotes(
          Object.fromEntries((data as { team_id: string; votes: number }[]).map((r) => [r.team_id, r.votes]))
        );
      }
    }
    setSubmitting(false);
  }

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Quarterfinals
          </h3>
          <div className="space-y-4">
            {round0.map(([id, a, b]) => (
              <Matchup key={id} label={`Game ${id.slice(1)}`} teamA={a} teamB={b} winnerId={picks[id]} onPick={(t) => pick(id, t)} />
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <ChevronRight className="size-6 text-muted-foreground/40" />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Semifinals
          </h3>
          <div className="flex h-full flex-col justify-around gap-4">
            {round1.map(([id, a, b]) => (
              <Matchup key={id} label={id === "s0" ? "Top Half" : "Bottom Half"} teamA={a} teamB={b} winnerId={picks[id]} onPick={(t) => pick(id, t)} />
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <ChevronRight className="size-6 text-muted-foreground/40" />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Championship
          </h3>
          <div className="flex h-full flex-col justify-around gap-4">
            <Matchup label="Finals" teamA={round2[0][1]} teamB={round2[0][2]} winnerId={picks.f0} onPick={(t) => pick("f0", t)} size="lg" />

            {champion ? (
              <Card className="items-center gap-3 border border-primary/40 bg-primary/[0.06] p-6 text-center">
                <Trophy className="size-8 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Your 2026 Champion
                  </p>
                  <p className="text-lg font-bold">
                    {champion.city} {champion.name}
                  </p>
                </div>
                <TeamBadge team={champion} size="xl" />
              </Card>
            ) : (
              <Card className="items-center gap-2 border border-dashed border-border/70 p-6 text-center text-muted-foreground">
                <Trophy className="size-7 opacity-40" />
                <p className="text-sm">Complete your bracket to crown a champion</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
          <RotateCcw className="size-3.5" /> Reset bracket
        </Button>
      </div>

      {champion && (
        <Card className="border border-border/60 p-6">
          <h3 className="text-lg font-semibold">Save your prediction</h3>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Add your name (optional) and lock it in — see how your pick compares below.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="sm:max-w-xs"
            />
            <Button onClick={submit} disabled={submitting} className="gap-1.5">
              <Trophy className="size-4" />
              {submitted ? "Saved — update pick" : "Lock In My Champion"}
            </Button>
          </div>
        </Card>
      )}

      <div>
        <h3 className="mb-1 text-lg font-semibold">What everyone else is picking</h3>
        <p className="mb-5 text-sm text-muted-foreground">
          {totalVotes} champion prediction{totalVotes === 1 ? "" : "s"} submitted so far.
        </p>
        <VoteResults
          total={totalVotes}
          items={playoffTeams.map((t) => ({
            id: t.id,
            label: `${t.city} ${t.name}`,
            sublabel: `#${t.overallSeed} seed`,
            votes: votes[t.id] ?? 0,
            badge: <TeamBadge team={t} size="sm" />,
            highlighted: champion?.id === t.id,
          }))}
        />
      </div>
    </div>
  );
}
