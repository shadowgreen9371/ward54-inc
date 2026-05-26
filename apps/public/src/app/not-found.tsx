import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, GlassPanel, PageShell } from '@ward54/ui';

export default function NotFound() {
  return (
    <PageShell>
      <div className="grid min-h-[60vh] place-items-center">
        <GlassPanel tone="raised" className="max-w-md p-8 text-center sm:p-10">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-saffron">
            Error · 404
          </div>
          <h1 className="mt-3 font-display text-4xl text-cream-100">
            That page isn't on the ward register.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-cream-300">
            The link you followed doesn't match any page on the Ward 54 directory.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/">
              <Button variant="amber" size="md" iconLeft={<ArrowLeft className="h-4 w-4" />}>
                Back to home
              </Button>
            </Link>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
