export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-glass-border bg-ink-900/40 backdrop-blur-glass">
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-saffron/80">
              Ward · 54 · INC
            </div>
            <div className="font-display text-2xl text-cream-100">
              Indian National Congress
            </div>
            <p className="max-w-md text-[13px] leading-relaxed text-cream-300">
              163-Entally Assembly Constituency · Kolkata Municipal Corporation ·
              Electoral Roll 2026 (Draft Roll Revision 1)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[12px] text-cream-300 sm:text-right">
            <div>
              <div className="text-cream-400">Total Electors</div>
              <div className="font-mono text-[15px] tabular-nums text-cream-100">26,849</div>
            </div>
            <div>
              <div className="text-cream-400">Polling Booths</div>
              <div className="font-mono text-[15px] tabular-nums text-cream-100">38</div>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-glass-border/60 pt-5 text-[11px] text-cream-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} INC Ward 54 unit · Internal campaign tool</span>
          <span className="font-mono">v2.0 · Next.js + Supabase</span>
        </div>
      </div>
    </footer>
  );
}
