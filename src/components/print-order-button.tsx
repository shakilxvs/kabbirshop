"use client";

import { Printer } from "lucide-react";

export function PrintOrderButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex-1 flex items-center justify-center gap-2 border border-black/10 font-medium py-3 rounded-lg hover:bg-black/5 transition"
    >
      <Printer size={16} /> Print / Download
    </button>
  );
}
