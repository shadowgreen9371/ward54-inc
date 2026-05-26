'use client';

import { useState, useTransition } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, FloatingCard } from '@ward54/ui';
import type { SiteConfig } from '@ward54/db';
import { saveDraft, publishKey } from '@/lib/actions/site-config';

interface Props {
  hero: SiteConfig | null;
  cards: SiteConfig | null;
  meta: SiteConfig | null;
}

export function HomepageCMS({ hero, cards, meta }: Props) {
  return (
    <div className="space-y-6">
      <HeroEditor row={hero} />
      <MetaEditor row={meta} />
      <CardsEditor row={cards} />
    </div>
  );
}

function HeroEditor({ row }: { row: SiteConfig | null }) {
  const initial = (row?.draft_value ?? row?.value ?? {}) as {
    eyebrow?: string;
    title_line_1?: string;
    title_line_2?: string;
    subtitle?: string;
  };
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <FloatingCard interactive={false} className="p-5 sm:p-6">
      <Header label="Hero section" published={!!row?.published_at} />
      <div className="mt-4 grid gap-3">
        <FormField label="Eyebrow">
          <input
            value={form.eyebrow ?? ''}
            onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
            className="cms-input"
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Title line 1">
            <input
              value={form.title_line_1 ?? ''}
              onChange={(e) => setForm({ ...form, title_line_1: e.target.value })}
              className="cms-input font-display text-[18px]"
            />
          </FormField>
          <FormField label="Title line 2 (gradient)">
            <input
              value={form.title_line_2 ?? ''}
              onChange={(e) => setForm({ ...form, title_line_2: e.target.value })}
              className="cms-input font-display text-[18px]"
            />
          </FormField>
        </div>
        <FormField label="Subtitle">
          <textarea
            rows={3}
            value={form.subtitle ?? ''}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="cms-input"
          />
        </FormField>
      </div>
      <SaveBar
        pending={pending}
        onDraft={() =>
          startTransition(async () => {
            const r = await saveDraft('homepage.hero', form);
            if (r.ok) toast.success('Draft saved.');
            else toast.error(r.error);
          })
        }
        onPublish={() =>
          startTransition(async () => {
            const r = await publishKey('homepage.hero');
            if (r.ok) toast.success('Published live.');
            else toast.error(r.error);
          })
        }
      />
      <style jsx>{`
        :global(.cms-input) {
          @apply block h-11 w-full rounded-md border border-glass-border bg-ink-900/60 px-3.5 text-[14px] text-cream-100 placeholder:text-cream-400 focus:border-glass-border-strong focus:outline-none focus:ring-1 focus:ring-cream-100/20;
        }
        :global(textarea.cms-input) {
          @apply h-auto py-2.5 leading-relaxed;
        }
      `}</style>
    </FloatingCard>
  );
}

function MetaEditor({ row }: { row: SiteConfig | null }) {
  const initial = (row?.draft_value ?? row?.value ?? {}) as Record<string, unknown>;
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  return (
    <FloatingCard interactive={false} className="p-5 sm:p-6">
      <Header label="Ward metadata" published={!!row?.published_at} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          ['total_electors', 'Total electors'],
          ['male', 'Male'],
          ['female', 'Female'],
          ['booths', 'Polling booths'],
          ['stations', 'Polling stations'],
          ['pin', 'PIN'],
          ['parliamentary_const', 'Parliamentary const.'],
        ].map(([key, label]) => (
          <FormField key={key} label={label}>
            <input
              value={String(form[key] ?? '')}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="cms-input font-mono"
            />
          </FormField>
        ))}
      </div>
      <SaveBar
        pending={pending}
        onDraft={() =>
          startTransition(async () => {
            const r = await saveDraft('ward.meta', form);
            if (r.ok) toast.success('Draft saved.');
            else toast.error(r.error);
          })
        }
        onPublish={() =>
          startTransition(async () => {
            const r = await publishKey('ward.meta');
            if (r.ok) toast.success('Published live.');
            else toast.error(r.error);
          })
        }
      />
    </FloatingCard>
  );
}

function CardsEditor({ row }: { row: SiteConfig | null }) {
  // For brevity the array editor uses raw JSON. Full drag-and-drop card builder
  // would extend this with @dnd-kit similar to StationsManager.
  const initial = JSON.stringify(row?.draft_value ?? row?.value ?? [], null, 2);
  const [json, setJson] = useState(initial);
  const [pending, startTransition] = useTransition();
  return (
    <FloatingCard interactive={false} className="p-5 sm:p-6">
      <Header label="Homepage cards" published={!!row?.published_at} />
      <p className="mt-2 text-[12px] text-cream-400">
        Three home cards rendered on <code>/</code>. Edit JSON directly for now; a
        drag-and-drop editor will follow.
      </p>
      <textarea
        rows={10}
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="cms-input mt-3 font-mono text-[12px] leading-relaxed"
      />
      <SaveBar
        pending={pending}
        onDraft={() =>
          startTransition(async () => {
            try {
              const parsed = JSON.parse(json);
              const r = await saveDraft('homepage.cards', parsed);
              if (r.ok) toast.success('Draft saved.');
              else toast.error(r.error);
            } catch {
              toast.error('Invalid JSON.');
            }
          })
        }
        onPublish={() =>
          startTransition(async () => {
            const r = await publishKey('homepage.cards');
            if (r.ok) toast.success('Published live.');
            else toast.error(r.error);
          })
        }
      />
    </FloatingCard>
  );
}

function Header({ label, published }: { label: string; published: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-display text-[18px] text-cream-100">{label}</div>
      <Badge tone={published ? 'green' : 'amber'} dot>
        {published ? 'Published' : 'Draft only'}
      </Badge>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function SaveBar({
  pending,
  onDraft,
  onPublish,
}: {
  pending: boolean;
  onDraft: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-glass-border/60 pt-4">
      <Button
        variant="secondary"
        size="sm"
        iconLeft={<Save className="h-3.5 w-3.5" />}
        loading={pending}
        onClick={onDraft}
      >
        Save draft
      </Button>
      <Button
        variant="amber"
        size="sm"
        iconLeft={<Sparkles className="h-3.5 w-3.5" />}
        loading={pending}
        onClick={onPublish}
      >
        Publish live
      </Button>
    </div>
  );
}
