export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
        <p>
          Final Say · a fan-made 2026 WNBA predictor built with Next.js, shadcn/ui &amp; Supabase.
        </p>
        <p className="text-xs">
          Not affiliated with the WNBA. Team names, logos &amp; player photos used for
          identification only, for an educational class project.
        </p>
      </div>
    </footer>
  );
}
