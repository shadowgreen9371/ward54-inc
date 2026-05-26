'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, MapPin, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, FloatingCard, GlassPanel, cn } from '@ward54/ui';
import type { PollingStation } from '@ward54/db';
import {
  reorderStations,
  upsertStation,
  deleteStation,
  togglePublished,
} from '@/lib/actions/stations';

export function StationsManager({ initial }: { initial: PollingStation[] }) {
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<PollingStation | null>(null);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const ids = useMemo(() => rows.map((r) => r.id), [rows]);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = rows.findIndex((r) => r.id === active.id);
    const newIdx = rows.findIndex((r) => r.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(rows, oldIdx, newIdx).map((r, i) => ({
      ...r,
      display_order: i + 1,
    }));
    setRows(next);
    startTransition(async () => {
      const r = await reorderStations(next.map((n) => ({ id: n.id, display_order: n.display_order })));
      if (r.ok) toast.success('Order saved.');
      else toast.error(r.error);
    });
  }

  function blankStation(): PollingStation {
    return {
      id: crypto.randomUUID(),
      slug: '',
      name: '',
      address: '',
      building_photo_url: null,
      lat: null,
      lng: null,
      display_order: rows.length + 1,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] text-cream-300">
          {rows.length} stations ·{' '}
          {rows.filter((r) => r.is_published).length} published
        </div>
        <Button
          variant="amber"
          size="md"
          iconLeft={<Plus className="h-4 w-4" />}
          onClick={() => setEditing(blankStation())}
        >
          Add station
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="space-y-3">
            {rows.map((r) => (
              <SortableRow
                key={r.id}
                row={r}
                disabled={pending}
                onEdit={() => setEditing(r)}
                onTogglePublish={(v) => {
                  setRows((prev) =>
                    prev.map((x) => (x.id === r.id ? { ...x, is_published: v } : x)),
                  );
                  startTransition(async () => {
                    const res = await togglePublished(r.id, v);
                    if (!res.ok) toast.error(res.error);
                  });
                }}
                onDelete={() => {
                  if (!confirm(`Delete ${r.name}? This cannot be undone.`)) return;
                  setRows((prev) => prev.filter((x) => x.id !== r.id));
                  startTransition(async () => {
                    const res = await deleteStation(r.id);
                    if (!res.ok) toast.error(res.error);
                    else toast.success('Deleted.');
                  });
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {editing && (
        <EditDialog
          station={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setRows((prev) => {
              const exists = prev.some((x) => x.id === saved.id);
              return exists
                ? prev.map((x) => (x.id === saved.id ? saved : x))
                : [...prev, saved];
            });
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function SortableRow({
  row,
  disabled,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  row: PollingStation;
  disabled: boolean;
  onEdit: () => void;
  onTogglePublish: (v: boolean) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style}>
      <FloatingCard
        interactive={false}
        className={cn(
          'flex items-center gap-3 p-3.5 sm:p-4',
          isDragging && 'opacity-60 shadow-card-hover',
        )}
      >
        <button
          {...attributes}
          {...listeners}
          aria-label="Reorder"
          className="grid h-9 w-9 shrink-0 cursor-grab place-items-center rounded-sm text-cream-400 hover:bg-glass-soft hover:text-cream-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          onClick={onEdit}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-glass-border bg-glass-soft font-mono text-[13px] tabular-nums text-cream-100">
            {String(row.display_order).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-[17px] leading-tight text-cream-100">
              {row.name || <span className="text-cream-400 italic">Unnamed station</span>}
            </div>
            <div className="mt-0.5 truncate text-[12px] text-cream-300">
              <MapPin className="mr-1 inline-block h-3 w-3" />
              {row.address || 'No address'}
            </div>
          </div>
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <Badge tone={row.is_published ? 'green' : 'neutral'} dot>
            {row.is_published ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <button
          onClick={() => onTogglePublish(!row.is_published)}
          disabled={disabled}
          className="grid h-9 w-9 place-items-center rounded-sm border border-glass-border bg-glass-soft text-cream-200 hover:border-glass-border-strong hover:text-cream-100"
          aria-label={row.is_published ? 'Unpublish' : 'Publish'}
        >
          {row.is_published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={onDelete}
          disabled={disabled}
          className="grid h-9 w-9 place-items-center rounded-sm border border-[#5C2A2A] bg-[#3A1F1F]/40 text-[#D26B6B] hover:bg-[#3A1F1F]/70"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </FloatingCard>
    </li>
  );
}

function EditDialog({
  station,
  onClose,
  onSaved,
}: {
  station: PollingStation;
  onClose: () => void;
  onSaved: (s: PollingStation) => void;
}) {
  const [form, setForm] = useState(station);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await upsertStation(form);
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success('Saved.');
    onSaved(res.data);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-base/80 p-4 backdrop-blur-sm">
      <GlassPanel
        tone="raised"
        className="w-full max-w-lg overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-glass-border/60 px-5 py-4">
          <div className="font-display text-[18px] text-cream-100">Edit station</div>
          <button
            onClick={onClose}
            className="rounded-sm px-2 py-1 text-cream-300 hover:bg-glass-soft hover:text-cream-100"
          >
            Close
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-3 p-5"
        >
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="Slug (URL)">
            <input
              required
              pattern="[a-z0-9-]+"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="input font-mono"
              placeholder="entally-academy"
            />
          </Field>
          <Field label="Address">
            <input
              value={form.address ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                value={form.lat ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    lat: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                className="input font-mono"
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                value={form.lng ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    lng: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                className="input font-mono"
              />
            </Field>
          </div>
          <Field label="Building photo URL">
            <input
              value={form.building_photo_url ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, building_photo_url: e.target.value || null }))
              }
              className="input font-mono"
              placeholder="https://…supabase.co/storage/…"
            />
          </Field>

          <div className="flex items-center justify-between pt-3">
            <label className="flex items-center gap-2 text-[12px] text-cream-300">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                className="h-4 w-4 rounded-sm accent-brand-saffron"
              />
              Published
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                variant="amber"
                size="md"
                loading={saving}
                iconLeft={<Save className="h-4 w-4" />}
                type="submit"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </GlassPanel>

      <style jsx>{`
        :global(.input) {
          @apply block h-11 w-full rounded-md border border-glass-border bg-ink-900/60 px-3.5 text-[14px] text-cream-100 placeholder:text-cream-400 focus:border-glass-border-strong focus:outline-none focus:ring-1 focus:ring-cream-100/20;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-cream-400">
        {label}
      </span>
      {children}
    </label>
  );
}
