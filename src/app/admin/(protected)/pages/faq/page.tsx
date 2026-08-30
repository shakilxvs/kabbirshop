import { adminDb } from "@/lib/firebase/admin";
import { FaqEntry } from "@/types";
import { saveFaq } from "@/lib/actions/cms";
import { FaqDeleteButton } from "@/components/admin/faq-delete-button";

export default async function AdminFaqPage() {
  const snap = await adminDb.collection("faqs").orderBy("order", "asc").get();
  const faqs = snap.docs.map((d) => d.data() as FaqEntry);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-semibold mb-6">FAQ</h1>

      <div className="rounded-xl2 border border-white/10 divide-y divide-white/10 mb-8">
        {faqs.length === 0 && <p className="px-4 py-8 text-center text-white/40 text-sm">No FAQs yet.</p>}
        {faqs.map((f) => (
          <div key={f.id} className="flex items-start gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{f.question}</p>
              <p className="text-xs text-white/40 mt-0.5">{f.answer}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${f.active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}>
              {f.active ? "Active" : "Hidden"}
            </span>
            <FaqDeleteButton id={f.id} question={f.question} />
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Add FAQ</h2>
      <form action={saveFaq} className="space-y-3">
        <input required placeholder="Question" name="question" className="input" />
        <textarea required placeholder="Answer" name="answer" rows={3} className="input" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Category (optional)" name="category" className="input" />
          <input type="number" placeholder="Display Order" name="order" className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Active</label>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Add FAQ</button>
      </form>
    </div>
  );
}
