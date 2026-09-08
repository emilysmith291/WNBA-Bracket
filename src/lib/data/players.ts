export type Player = {
  id: string; // slug
  name: string;
  teamId: string; // matches Team.id
  position: string;
  ppg: number;
  rpg: number;
  apg: number;
  accolade: string;
  blurb: string;
};

// 2026 MVP-caliber season stat lines (per-game averages), reflecting the race
// as of early September 2026.
export const MVP_CANDIDATES: Player[] = [
  {
    id: "aja-wilson",
    name: "A'ja Wilson",
    teamId: "lva",
    position: "F/C",
    ppg: 26.3,
    rpg: 11.6,
    apg: 2.6,
    accolade: "4x MVP",
    blurb: "The clear front-runner, chasing a record 5th MVP award.",
  },
  {
    id: "napheesa-collier",
    name: "Napheesa Collier",
    teamId: "min",
    position: "F",
    ppg: 22.4,
    rpg: 9.1,
    apg: 3.6,
    accolade: "2025 runner-up",
    blurb: "Engine of the league's best record, elite on both ends.",
  },
  {
    id: "caitlin-clark",
    name: "Caitlin Clark",
    teamId: "ind",
    position: "G",
    ppg: 19.2,
    rpg: 5.1,
    apg: 8.4,
    accolade: "All-Star starter",
    blurb: "Back to full health and running Indiana's offense at an MVP level.",
  },
  {
    id: "kelsey-mitchell",
    name: "Kelsey Mitchell",
    teamId: "ind",
    position: "G",
    ppg: 20.5,
    rpg: 3.4,
    apg: 3.9,
    accolade: "All-Star Game MVP",
    blurb: "Dropped 28 in the All-Star Game; a two-way threat all season.",
  },
  {
    id: "paige-bueckers",
    name: "Paige Bueckers",
    teamId: "dal",
    position: "G",
    ppg: 18.6,
    rpg: 4.8,
    apg: 5.3,
    accolade: "2025 Rookie of the Year",
    blurb: "Leading a young Wings squad into the playoffs as the 8-seed.",
  },
  {
    id: "olivia-miles",
    name: "Olivia Miles",
    teamId: "min",
    position: "G",
    ppg: 14.7,
    rpg: 4.3,
    apg: 6.9,
    accolade: "Rookie of the Year favorite",
    blurb: "Floor general for the league's top seed as a rookie.",
  },
  {
    id: "breanna-stewart",
    name: "Breanna Stewart",
    teamId: "ny",
    position: "F",
    ppg: 21.1,
    rpg: 8.0,
    apg: 3.7,
    accolade: "2x MVP",
    blurb: "Still one of the most complete scorers in the world.",
  },
  {
    id: "sabrina-ionescu",
    name: "Sabrina Ionescu",
    teamId: "ny",
    position: "G",
    ppg: 19.3,
    rpg: 4.4,
    apg: 6.2,
    accolade: "3x 3-Point Contest champ",
    blurb: "Elite shot-making pairs with New York's veteran playoff experience.",
  },
];

export function playerById(id: string) {
  return MVP_CANDIDATES.find((p) => p.id === id);
}
