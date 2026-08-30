"use client";

import { useState } from "react";

export function ColorField({ label, name, value }: { label: string; name: string; value: string }) {
  const [hex, setHex] = useState(value);
  return (
    <label className="block">
      <span className="block text-xs text-white/50 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="w-9 h-9 rounded-lg border border-white/10 bg-transparent"
        />
        <input name={name} value={hex} onChange={(e) => setHex(e.target.value)} className="input flex-1" />
      </div>
    </label>
  );
}
