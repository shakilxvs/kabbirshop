"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ProductVariantGroup, ProductVariantOption } from "@/types";

// Replaces the old free-text "Color: Black, White, Blue" textarea, which had
// no way to set per-option stock, price, SKU, or image at all. Outputs a
// hidden JSON input the server action parses directly — no fragile text
// parsing involved.

function emptyOption(): ProductVariantOption {
  return { id: nanoid(8), name: "" };
}

function emptyGroup(): ProductVariantGroup {
  return { id: nanoid(8), name: "", options: [emptyOption()] };
}

export function VariantBuilder({ initial }: { initial: ProductVariantGroup[] }) {
  const [groups, setGroups] = useState<ProductVariantGroup[]>(initial.length ? initial : []);

  function updateGroup(groupId: string, patch: Partial<ProductVariantGroup>) {
    setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, ...patch } : g)));
  }

  function updateOption(groupId: string, optId: string, patch: Partial<ProductVariantOption>) {
    setGroups((gs) =>
      gs.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)) }
          : g
      )
    );
  }

  function addGroup() {
    setGroups((gs) => [...gs, emptyGroup()]);
  }

  function removeGroup(groupId: string) {
    setGroups((gs) => gs.filter((g) => g.id !== groupId));
  }

  function addOption(groupId: string) {
    setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, options: [...g.options, emptyOption()] } : g)));
  }

  function removeOption(groupId: string, optId: string) {
    setGroups((gs) =>
      gs.map((g) => (g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optId) } : g))
    );
  }

  // Clean out fully-empty groups/options before serializing, so an unused
  // "Add Variant Group" click doesn't save junk.
  const cleaned = groups
    .filter((g) => g.name.trim())
    .map((g) => ({ ...g, options: g.options.filter((o) => o.name.trim()) }))
    .filter((g) => g.options.length > 0);

  return (
    <div className="space-y-4">
      <input type="hidden" name="variantsJson" value={JSON.stringify(cleaned)} />

      {groups.map((group) => (
        <div key={group.id} className="rounded-xl2 border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              placeholder="Group name (e.g. Color, Storage)"
              value={group.name}
              onChange={(e) => updateGroup(group.id, { name: e.target.value })}
              className="input flex-1"
            />
            <button type="button" onClick={() => removeGroup(group.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {group.options.map((opt) => (
              <OptionRow
                key={opt.id}
                option={opt}
                onChange={(patch) => updateOption(group.id, opt.id, patch)}
                onRemove={() => removeOption(group.id, opt.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => addOption(group.id)}
            className="flex items-center gap-1.5 text-xs text-brand-primary mt-3"
          >
            <Plus size={12} /> Add option
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="flex items-center gap-2 text-sm text-brand-primary"
      >
        <Plus size={14} /> Add variant group
      </button>
    </div>
  );
}

function OptionRow({
  option,
  onChange,
  onRemove,
}: {
  option: ProductVariantOption;
  onChange: (patch: Partial<ProductVariantOption>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-white/5 p-2.5">
      <div className="flex items-center gap-2">
        <input
          placeholder="Option name (e.g. Black)"
          value={option.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="input flex-1 min-w-0"
        />
        <input
          type="number"
          placeholder="Stock"
          value={option.stock ?? ""}
          onChange={(e) => onChange({ stock: e.target.value === "" ? undefined : Number(e.target.value) })}
          className="input w-24 shrink-0"
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="p-2 rounded-lg hover:bg-white/10 shrink-0"
          aria-label="More fields"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button type="button" onClick={onRemove} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 shrink-0">
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input
            placeholder="SKU (optional)"
            value={option.sku ?? ""}
            onChange={(e) => onChange({ sku: e.target.value || undefined })}
            className="input"
          />
          <input
            placeholder="Image URL (optional)"
            value={option.imageUrl ?? ""}
            onChange={(e) => onChange({ imageUrl: e.target.value || undefined })}
            className="input"
          />
          <input
            type="number"
            placeholder="Price override (optional)"
            value={option.price ?? ""}
            onChange={(e) => onChange({ price: e.target.value === "" ? undefined : Number(e.target.value) })}
            className="input"
          />
          <input
            type="number"
            placeholder="Sale price override (optional)"
            value={option.salePrice ?? ""}
            onChange={(e) => onChange({ salePrice: e.target.value === "" ? undefined : Number(e.target.value) })}
            className="input"
          />
        </div>
      )}
    </div>
  );
}
