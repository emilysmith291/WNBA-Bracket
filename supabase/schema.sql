-- WNBA Champion & MVP Predictor — Supabase schema
-- Run this whole file once in the Supabase SQL Editor (or `supabase db push`
-- against a linked project) to create the schema, security policies, and
-- seed the 2026-season reference data.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Reference data: teams & MVP-candidate players
-- ---------------------------------------------------------------------------

create table if not exists teams (
  id text primary key,
  name text not null,
  city text not null,
  abbr text not null,
  conference text not null check (conference in ('Eastern', 'Western')),
  wins int not null default 0,
  losses int not null default 0,
  overall_seed int, -- 1-8 for playoff teams, null otherwise
  made_playoffs boolean not null default false,
  primary_color text not null,
  secondary_color text not null,
  blurb text
);

create table if not exists players (
  id text primary key,
  name text not null,
  team_id text not null references teams (id) on delete cascade,
  position text not null,
  ppg numeric(4, 1) not null,
  rpg numeric(4, 1) not null,
  apg numeric(4, 1) not null,
  accolade text,
  blurb text
);

-- ---------------------------------------------------------------------------
-- User predictions (anonymous — identified by a client-generated session id
-- stored in localStorage, no login required)
-- ---------------------------------------------------------------------------

create table if not exists champion_predictions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  display_name text,
  team_id text not null references teams (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mvp_predictions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  display_name text,
  player_id text not null references players (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vote-count views the UI reads to show live community results.
create or replace view champion_vote_counts as
  select team_id, count(*)::int as votes
  from champion_predictions
  group by team_id;

create or replace view mvp_vote_counts as
  select player_id, count(*)::int as votes
  from mvp_predictions
  group by player_id;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table teams enable row level security;
alter table players enable row level security;
alter table champion_predictions enable row level security;
alter table mvp_predictions enable row level security;

-- Reference data is public read-only (writes happen only via this seed
-- script / the Supabase dashboard using the service role, never the app).
create policy "teams are publicly readable" on teams
  for select using (true);

create policy "players are publicly readable" on players
  for select using (true);

-- Predictions: this is a no-login, just-for-fun class project, so anyone
-- holding the anon key can read/insert/update prediction rows. There is no
-- server-side identity to scope an "own row" policy to, so uniqueness on
-- session_id (client-generated, kept in localStorage) is what keeps one
-- browser's pick to a single upsert-able row instead of real authorization.
create policy "predictions are publicly readable" on champion_predictions
  for select using (true);
create policy "anyone can submit a champion prediction" on champion_predictions
  for insert with check (true);
create policy "anyone can update a champion prediction" on champion_predictions
  for update using (true) with check (true);

create policy "mvp predictions are publicly readable" on mvp_predictions
  for select using (true);
create policy "anyone can submit an mvp prediction" on mvp_predictions
  for insert with check (true);
create policy "anyone can update an mvp prediction" on mvp_predictions
  for update using (true) with check (true);

-- Views inherit the querying role's privileges on their base tables, but
-- being explicit doesn't hurt on projects with revoked default grants.
grant select on champion_vote_counts to anon, authenticated;
grant select on mvp_vote_counts to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed data — 2026 WNBA season (standings as of early September 2026;
-- regular season closes 9/24/2026, playoffs begin 9/27/2026)
-- ---------------------------------------------------------------------------

insert into teams (id, name, city, abbr, conference, wins, losses, overall_seed, made_playoffs, primary_color, secondary_color, blurb) values
  ('min', 'Lynx',      'Minnesota',    'MIN', 'Western', 31, 9,  1,    true,  '#0C2340', '#236192', 'League-best record behind Napheesa Collier and rookie phenom Olivia Miles.'),
  ('gsv', 'Valkyries', 'Golden State', 'GSV', 'Western', 29, 11, 2,    true,  '#AD96DC', '#B9975B', 'Second-year expansion squad already a title contender.'),
  ('lva', 'Aces',      'Las Vegas',    'LVA', 'Western', 27, 13, 3,    true,  '#BA0C2F', '#000000', 'Reigning back-to-back champions chasing a three-peat with A''ja Wilson.'),
  ('atl', 'Dream',     'Atlanta',      'ATL', 'Eastern', 26, 14, 4,    true,  '#C8102E', '#373A36', 'Top seed in the East, quietly one of the deepest rosters in the league.'),
  ('ind', 'Fever',     'Indiana',      'IND', 'Eastern', 26, 14, 5,    true,  '#C8102E', '#041E42', 'Caitlin Clark and Kelsey Mitchell healthy again down the stretch.'),
  ('ny',  'Liberty',   'New York',     'NY',  'Eastern', 24, 16, 6,    true,  '#6ECEB2', '#000000', 'Defending finalist experience with Breanna Stewart and Sabrina Ionescu.'),
  ('was', 'Mystics',   'Washington',   'WAS', 'Eastern', 24, 16, 7,    true,  '#0C2340', '#C8102E', 'Snuck into the eight-seed picture with a strong second half.'),
  ('dal', 'Wings',     'Dallas',       'DAL', 'Western', 24, 16, 8,    true,  '#0C2340', '#C4D600', 'No. 1 pick Azzi Fudd and Paige Bueckers sneak in as the 8-seed.'),
  ('por', 'Fire',      'Portland',     'POR', 'Western', 16, 24, null, false, '#C8102E', '#2C2A29', 'Expansion franchise, surprisingly competitive in year one.'),
  ('chi', 'Sky',       'Chicago',      'CHI', 'Eastern', 15, 25, null, false, '#418FDE', '#FFCD00', 'Rebuilding year, dealt a tough blow by Angel Reese''s season-ending injury.'),
  ('las', 'Sparks',    'Los Angeles',  'LAS', 'Western', 15, 25, null, false, '#FFC72C', '#702F8A', 'Missing the playoffs for a sixth straight season.'),
  ('phx', 'Mercury',   'Phoenix',      'PHX', 'Western', 14, 26, null, false, '#702F8A', '#FFC72C', 'A step back after last year''s Finals run.'),
  ('tor', 'Tempo',     'Toronto',      'TOR', 'Eastern', 11, 29, null, false, '#7B1E3A', '#0B1F3A', 'The WNBA''s first Canadian franchise, building for the future.'),
  ('con', 'Sun',       'Connecticut',  'CON', 'Eastern', 10, 30, null, false, '#A6192E', '#041E42', 'Playing out the franchise''s final season in Uncasville before relocating to Houston.'),
  ('sea', 'Storm',     'Seattle',      'SEA', 'Western', 8,  32, null, false, '#FBE122', '#2C5234', 'A season to forget in Seattle.')
on conflict (id) do update set
  name = excluded.name, city = excluded.city, abbr = excluded.abbr,
  conference = excluded.conference, wins = excluded.wins, losses = excluded.losses,
  overall_seed = excluded.overall_seed, made_playoffs = excluded.made_playoffs,
  primary_color = excluded.primary_color, secondary_color = excluded.secondary_color,
  blurb = excluded.blurb;

insert into players (id, name, team_id, position, ppg, rpg, apg, accolade, blurb) values
  ('aja-wilson',       'A''ja Wilson',       'lva', 'F/C', 26.3, 11.6, 2.6, '4x MVP',                     'The clear front-runner, chasing a record 5th MVP award.'),
  ('napheesa-collier',  'Napheesa Collier',   'min', 'F',   22.4, 9.1,  3.6, '2025 runner-up',             'Engine of the league''s best record, elite on both ends.'),
  ('caitlin-clark',     'Caitlin Clark',      'ind', 'G',   19.2, 5.1,  8.4, 'All-Star starter',           'Back to full health and running Indiana''s offense at an MVP level.'),
  ('kelsey-mitchell',   'Kelsey Mitchell',    'ind', 'G',   20.5, 3.4,  3.9, 'All-Star Game MVP',          'Dropped 28 in the All-Star Game; a two-way threat all season.'),
  ('paige-bueckers',    'Paige Bueckers',     'dal', 'G',   18.6, 4.8,  5.3, '2025 Rookie of the Year',    'Leading a young Wings squad into the playoffs as the 8-seed.'),
  ('olivia-miles',      'Olivia Miles',       'min', 'G',   14.7, 4.3,  6.9, 'Rookie of the Year favorite', 'Floor general for the league''s top seed as a rookie.'),
  ('breanna-stewart',   'Breanna Stewart',    'ny',  'F',   21.1, 8.0,  3.7, '2x MVP',                     'Still one of the most complete scorers in the world.'),
  ('sabrina-ionescu',   'Sabrina Ionescu',    'ny',  'G',   19.3, 4.4,  6.2, '3x 3-Point Contest champ',   'Elite shot-making pairs with New York''s veteran playoff experience.')
on conflict (id) do update set
  name = excluded.name, team_id = excluded.team_id, position = excluded.position,
  ppg = excluded.ppg, rpg = excluded.rpg, apg = excluded.apg,
  accolade = excluded.accolade, blurb = excluded.blurb;
