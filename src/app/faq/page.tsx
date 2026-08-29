import { getFaqs } from "@/lib/data";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata = { title: "Frequently Asked Questions" };

export default async function FaqPage() {
  const faqs = await getFaqs().catch(() => []);

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-12">
      <h1 className="font-display text-2xl font-semibold mb-6">Frequently Asked Questions</h1>
      {faqs.length === 0 ? (
        <p className="text-sm text-brand-text/50">No FAQs added yet.</p>
      ) : (
        <FaqAccordion faqs={faqs} />
      )}
    </main>
  );
}
