import Image from "next/image";
import { CmsPage } from "@/types";

export function CmsPageView({ page, fallbackTitle }: { page: CmsPage | null; fallbackTitle: string }) {
  if (!page) {
    return (
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-16">
        <h1 className="font-display text-2xl font-semibold mb-4">{fallbackTitle}</h1>
        <p className="text-sm text-brand-text/50">This page hasn&apos;t been set up yet. Check back soon.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-12">
      {page.imageUrl && (
        <div className="relative aspect-[3/1] rounded-xl2 overflow-hidden bg-black/[0.03] mb-8">
          <Image src={page.imageUrl} alt={page.title} fill className="object-cover" />
        </div>
      )}
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-6">{page.title}</h1>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="prose prose-sm max-w-none text-brand-text/80" dangerouslySetInnerHTML={{ __html: page.content }} />
    </main>
  );
}
