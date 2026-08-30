import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  await adminDb.collection("newsletterSubscribers").doc(email).set(
    { email, subscribedAt: Date.now() },
    { merge: true }
  );
  return NextResponse.json({ ok: true });
}
