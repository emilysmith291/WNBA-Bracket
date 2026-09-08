"use client";

import { useState } from "react";

import type { Team } from "@/lib/data/teams";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
} as const;

/**
 * Renders /logos/{team.id}.png if present (drop your own — see README),
 * otherwise a colored monogram in the team's brand colors. The logo image
 * fades in on top of the monogram so a missing file never flashes a broken
 * image icon.
 */
export function TeamBadge({
  team,
  size = "md",
  className,
}: {
  team: Pick<Team, "id" | "abbr" | "primary" | "secondary">;
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
      <span>{team.abbr}</span>
      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element -- local drop-in asset, not a remote/optimized image
        <img
          src={`/logos/${team.id}.png`}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "absolute inset-0 h-full w-full rounded-full bg-white object-contain p-1.5 transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </span>
  );
}
