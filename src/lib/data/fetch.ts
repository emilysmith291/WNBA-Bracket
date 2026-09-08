import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  ChampionVoteCountRow,
  MvpVoteCountRow,
  PlayerRow,
  TeamRow,
} from "@/lib/supabase/types";
import { MVP_CANDIDATES, type Player } from "@/lib/data/players";
import { TEAMS, type Team } from "@/lib/data/teams";

function teamRowToTeam(r: TeamRow): Team {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    abbr: r.abbr,
    conference: r.conference,
    wins: r.wins,
    losses: r.losses,
    overallSeed: r.overall_seed,
    madePlayoffs: r.made_playoffs,
    primary: r.primary_color,
    secondary: r.secondary_color,
    blurb: r.blurb ?? "",
  };
}

function playerRowToPlayer(r: PlayerRow): Player {
  return {
    id: r.id,
    name: r.name,
    teamId: r.team_id,
    position: r.position,
    ppg: Number(r.ppg),
    rpg: Number(r.rpg),
    apg: Number(r.apg),
    accolade: r.accolade ?? "",
    blurb: r.blurb ?? "",
  };
}

/** Reads live from Supabase; falls back to the bundled seed data if the
 * database isn't configured yet or the request fails. */
export async function getTeams(): Promise<Team[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return TEAMS;

  const { data, error } = await supabase.from("teams").select("*");
  if (error || !data || data.length === 0) return TEAMS;
  return (data as TeamRow[]).map(teamRowToTeam);
}

export async function getPlayers(): Promise<Player[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return MVP_CANDIDATES;

  const { data, error } = await supabase.from("players").select("*");
  if (error || !data || data.length === 0) return MVP_CANDIDATES;
  return (data as PlayerRow[]).map(playerRowToPlayer);
}

export async function getChampionVoteCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();
  if (!supabase) return {};

  const { data, error } = await supabase.from("champion_vote_counts").select("*");
  if (error || !data) return {};
  return Object.fromEntries(
    (data as ChampionVoteCountRow[]).map((r) => [r.team_id, r.votes])
  );
}

export async function getMvpVoteCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();
  if (!supabase) return {};

  const { data, error } = await supabase.from("mvp_vote_counts").select("*");
  if (error || !data) return {};
  return Object.fromEntries(
    (data as MvpVoteCountRow[]).map((r) => [r.player_id, r.votes])
  );
}
