'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, GlassPanel, sectionReveal } from '@ward54/ui';
import { createBrowserSupabase } from '@ward54/db/client';
import { isAllowedAdminEmail } from '@/lib/admin-allowlist';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const errorFromQuery = search.get('error');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!isAllowedAdminEmail(cleaned)) {
      toast.error('This email is not on the admin allowlist.');
      return;
    }
    setSending(true);
    try {
      const sb = createBrowserSupabase();
      const next = search.get('next') ?? '/';
      const { error } = await sb.auth.signInWithOtp({
        email: cleaned,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          shouldCreateUser: false,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success('Magic link sent. Check your inbox.');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink-base px-5">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-[-20%] h-[640px] w-[640px] rounded-pill bg-brand-saffron/12 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-[-30%] h-[720px] w-[720px] rounded-pill bg-brand-inc/10 blur-[160px]"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionReveal}
        className="w-full max-w-[460px]"
      >
        <GlassPanel
          tone="raised"
          glow="amber"
          className="relative overflow-hidden p-8 sm:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md border border-glass-border-strong bg-glass-raised text-brand-saffron">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-saffron">
                Admin · Ward 54
              </div>
              <div className="font-display text-xl text-cream-100">Secure Sign-in</div>
            </div>
          </div>

          <p className="mt-5 text-[13px] leading-relaxed text-cream-300">
            Enter your admin email. We'll send a single-use magic link that signs you in
            for one hour.
          </p>

          {errorFromQuery === 'not_allowed' && (
            <div className="mt-4 flex items-start gap-2 rounded-sm border border-[#5C2A2A] bg-[#3A1F1F]/60 px-3 py-2.5 text-[12px] text-[#E89696]">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                That account is signed in to Supabase but is not on the admin allowlist.
                You've been signed out.
              </span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-400">
                Email
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                disabled={sent || sending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ward54.in"
                className="block h-12 w-full rounded-md border border-glass-border bg-ink-900/60 px-4 text-[15px] text-cream-100 placeholder:text-cream-400 focus:border-glass-border-strong focus:outline-none focus:ring-1 focus:ring-cream-100/20"
              />
            </label>

            <Button
              type="submit"
              variant="amber"
              size="lg"
              full
              loading={sending}
              disabled={sent}
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              {sent ? 'Magic link sent' : 'Send magic link'}
            </Button>
          </form>

          <div className="mt-7 border-t border-glass-border/60 pt-5 text-[11px] leading-relaxed text-cream-400">
            <p>
              Access is restricted to a hard email allowlist enforced at the edge,
              backed by Supabase Row-Level Security. Unauthorised attempts are logged.
            </p>
          </div>
        </GlassPanel>

        <div className="mt-6 text-center text-[11px] text-cream-400">
          <button
            type="button"
            onClick={() => router.push('https://ward54.in')}
            className="hover:text-cream-200"
          >
            ← Back to the public site
          </button>
        </div>
      </motion.div>
    </main>
  );
}
