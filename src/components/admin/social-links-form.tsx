"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SocialLink } from "@/types";
import { saveSocialLinks } from "@/lib/actions/cms";

const PLATFORMS: SocialLink["platform"][] = ["facebook", "instagram", "youtube", "tiktok", "x", "linkedin", "pinterest"];

export function SocialLinksForm({ initial }: { initial: SocialLink[] }) {
  const [links, setLinks] = useState<SocialLink[]>(initial);

  function update(id: string, patch: Partial<SocialLink>) {
    setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLink() {
    setLinks((ls) => [...ls, { id: `social-${Date.now()}`, platform: "facebook", url: "", active: true, order: ls.length + 1 }]);
  }

  function removeLink(id: string) {
    setLinks((ls) => ls.filter((l) => l.id !== id));
  }

  return (
    <form action={saveSocialLinks} className="space-y-3">
      <input type="hidden" name="socialJson" value={JSON.stringify(links)} />
      {links.map((link) => (
        <div key={link.id} className="flex items-center gap-2">
          <select
            value={link.platform}
            onChange={(e) => update(link.id, { platform: e.target.value as SocialLink["platform"] })}
            className="input w-36"
          >
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            placeholder="https://…"
            value={link.url}
            onChange={(e) => update(link.id, { url: e.target.value })}
            className="input flex-1"
          />
          <label className="flex items-center gap-1 text-xs shrink-0">
            <input type="checkbox" checked={link.active} onChange={(e) => update(link.id, { active: e.target.checked })} /> Active
          </label>
          <button type="button" onClick={() => removeLink(link.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 shrink-0">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button type="button" onClick={addLink} className="flex items-center gap-2 text-sm text-brand-primary">
        <Plus size={14} /> Add social link
      </button>

      <div>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90 mt-4">
          Save Social Links
        </button>
      </div>
    </form>
  );
}
