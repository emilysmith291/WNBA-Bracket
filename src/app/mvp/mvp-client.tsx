"use client";

import { Check, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PlayerHeadshot } from "@/components/site/player-headshot";
import { TeamBadge } from "@/components/site/team-badge";
import { VoteResults } from "@/components/site/vote-results";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fireConfetti } from "@/lib/confetti";
import type { Player } from "@/lib/data/players";
import type { Team } from "@/lib/data/teams";
import { getSavedDisplayName, getSessionId, saveDisplayName } from "@/lib/session";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function MvpClient({
  players,
  teamsById,
  initialVotes,
}: {
  players: Player[];
  teamsById: Record<string, Team>;
  initialVotes: Record<string, number>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [votes, setVotes] = useState(initialVotes);

  // Defer to after mount so server/client markup match (localStorage is client-only).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setName(getSavedDisplayName()), []);

  const selectedPlayer = players.find((p) => p.id === selected) ?? null;

  function choose(id: string) {
    setSelected(id);
    setSubmitted(false);
    const team = players.find((p) => p.id === id) && teamsById[players.find((p) => p.id === id)!.teamId];
    fireConfetti(team ? [team.primary, team.secondary] : undefined);
  }

  async function submit() {
    if (!selectedPlayer) return;
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
      .from("mvp_predictions")
      .upsert(
        { session_id, display_name: name || null, player_id: selectedPlayer.id },
        { onConflict: "session_id" }
      );

    if (error) {
      toast.error("Couldn't save your pick — try again.");
    } else {
      toast.success(`Locked in: ${selectedPlayer.name} for MVP!`);
      setSubmitted(true);
      const { data } = await supabase.from("mvp_vote_counts").select("*");
      if (data) {
        setVotes(
          Object.fromEntries((data as { player_id: string; votes: number }[]).map((r) => [r.player_id, r.votes]))
        );
      }
    }
    setSubmitting(false);
  }

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-14">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {players.map((player) => {
          const team = teamsById[player.teamId];
          const isSelected = selected === player.id;
          return (
            <Card
              key={player.id}
              role="button"
              tabIndex={0}
              onClick={() => choose(player.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && choose(player.id)}
              className={cn(
                "cursor-pointer border p-4 transition-all hover:-translate-y-0.5",
                isSelected
                  ? "border-primary ring-1 ring-primary bg-primary/[0.06]"
                  : "border-border/60 hover:border-primary/40"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="relative">
                  <PlayerHeadshot player={player} team={team} size="lg" />
                  <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-card">
                    <TeamBadge team={team} size="sm" />
                  </span>
                </div>
                {isSelected && (
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="font-semibold leading-tight">{player.name}</p>
                <p className="text-xs text-muted-foreground">
                  {team.city} {team.name} · {player.position}
                </p>
              </div>
              <Badge variant="secondary" className="mt-2 text-[10px]">
                {player.accolade}
              </Badge>
              <div className="mt-3 grid grid-cols-3 gap-1 border-t border-border/60 pt-3 text-center">
                <div>
                  <p className="text-sm font-bold tabular-nums">{player.ppg}</p>
                  <p className="text-[10px] text-muted-foreground">PPG</p>
                </div>
                <div>
                  <p className="text-sm font-bold tabular-nums">{player.rpg}</p>
                  <p className="text-[10px] text-muted-foreground">RPG</p>
                </div>
                <div>
                  <p className="text-sm font-bold tabular-nums">{player.apg}</p>
                  <p className="text-[10px] text-muted-foreground">APG</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedPlayer && (
        <Card className="border border-border/60 p-6">
          <h3 className="text-lg font-semibold">Save your prediction</h3>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Add your name (optional) and lock in {selectedPlayer.name} for MVP.
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
              {submitted ? "Saved — update pick" : "Lock In My MVP"}
            </Button>
          </div>
        </Card>
      )}

      <div>
        <h3 className="mb-1 text-lg font-semibold">What everyone else is picking</h3>
        <p className="mb-5 text-sm text-muted-foreground">
          {totalVotes} MVP prediction{totalVotes === 1 ? "" : "s"} submitted so far.
        </p>
        <VoteResults
          total={totalVotes}
          items={players.map((p) => ({
            id: p.id,
            label: p.name,
            sublabel: teamsById[p.teamId]?.abbr,
            votes: votes[p.id] ?? 0,
            badge: <PlayerHeadshot player={p} team={teamsById[p.teamId]} size="sm" />,
            highlighted: selected === p.id,
          }))}
        />
      </div>
    </div>
  );
}
