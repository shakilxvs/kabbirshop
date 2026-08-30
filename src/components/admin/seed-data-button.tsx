"use client";

import { useState, useTransition } from "react";
import { Database, CheckCircle2 } from "lucide-react";
import { seedDefaultData } from "@/lib/actions/setup";

export function SeedDataButton() {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await seedDefaultData();
              setDone(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to load default data.");
            }
          });
        }}
        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm py-2.5 rounded-lg transition disabled:opacity-50"
      >
        <Database size={15} />
        {isPending ? "Loading…" : "Load Default Data"}
      </button>
      {done && (
        <p className="flex items-center gap-1.5 text-xs text-green-400 mt-2">
          <CheckCircle2 size={13} /> Default settings, categories, and demo products loaded.
        </p>
      )}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
