import type { ReactNode } from "react";

export type VoteResultItem = {
  id: string;
  label: string;
  sublabel?: string;
  votes: number;
  badge: ReactNode;
  highlighted?: boolean;
};

/**
 * Ranked horizontal-bar results. One series (vote share), so identity comes
 * from the badge + label riding each bar rather than per-bar color — every
 * bar uses the single brand hue, sorted by vote count descending.
 */
export function VoteResults({ items, total }: { items: VoteResultItem[]; total: number }) {
  const sorted = [...items].sort((a, b) => b.votes - a.votes);
  const max = Math.max(1, ...sorted.map((i) => i.votes));

  return (
    <div className="space-y-3" role="table" aria-label="Community prediction results">
      {sorted.map((item) => {
        const pct = total > 0 ? Math.round((item.votes / total) * 100) : 0;
        const widthPct = Math.max(4, (item.votes / max) * 100);
        return (
          <div key={item.id} role="row" className="flex items-center gap-3">
            <div className="w-32 shrink-0 sm:w-40" role="cell">
              <div className="flex items-center gap-2">
                {item.badge}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium leading-tight">{item.label}</p>
                  {item.sublabel && (
                    <p className="truncate text-xs text-muted-foreground">{item.sublabel}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="relative h-5 flex-1 rounded-full bg-muted" role="cell">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: item.highlighted ? "var(--primary)" : "var(--chart-1)",
                  opacity: item.highlighted ? 1 : 0.75,
                }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
              {pct}%
            </span>
          </div>
        );
      })}
      {total === 0 && (
        <p className="pt-1 text-sm text-muted-foreground">
          No predictions yet — be the first to make your pick.
        </p>
      )}
    </div>
  );
}
