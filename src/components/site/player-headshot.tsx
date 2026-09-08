"use client";

import { useState } from "react";

import type { Player } from "@/lib/data/players";
import type { Team } from "@/lib/data/teams";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-9 text-xs",
  md: "size-14 text-base",
  lg: "size-20 text-xl",
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Renders /players/{player.id}.jpg if present (drop your own — see README),
 * otherwise an initials avatar in the player's team colors. Same fade-in
 * pattern as TeamBadge so a missing file never shows a broken image icon.
 */
export function PlayerHeadshot({
  player,
  team,
  size = "md",
  className,
}: {
  player: Pick<Player, "id" | "name">;
  team: Pick<Team, "primary" | "secondary">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-sm ring-2 ring-white/20",
        SIZES[size],
        className
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${team.primary}, ${team.secondary})`,
      }}
    >
      <span>{initials(player.name)}</span>
      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element -- local drop-in asset, not a remote/optimized image
        <img
          src={`/players/${player.id}.jpg`}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </span>
  );
}
