export type TeamRow = {
  id: string;
  name: string;
  city: string;
  abbr: string;
  conference: "Eastern" | "Western";
  wins: number;
  losses: number;
  overall_seed: number | null;
  made_playoffs: boolean;
  primary_color: string;
  secondary_color: string;
  blurb: string | null;
};

export type PlayerRow = {
  id: string;
  name: string;
  team_id: string;
  position: string;
  ppg: number;
  rpg: number;
  apg: number;
  accolade: string | null;
  blurb: string | null;
};

export type ChampionPredictionRow = {
  id: string;
  session_id: string;
  display_name: string | null;
  team_id: string;
  created_at: string;
  updated_at: string;
};

export type MvpPredictionRow = {
  id: string;
  session_id: string;
  display_name: string | null;
  player_id: string;
  created_at: string;
  updated_at: string;
};

export type VoteCount = { votes: number };
export type ChampionVoteCountRow = VoteCount & { team_id: string };
export type MvpVoteCountRow = VoteCount & { player_id: string };
