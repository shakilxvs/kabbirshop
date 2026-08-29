import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { AdminUser } from "@/types";

export async function requireAdmin(): Promise<AdminUser> {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie) redirect("/admin/login");

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      redirect("/admin/login");
    }

    return adminDoc.data() as AdminUser;
  } catch {
    redirect("/admin/login");
  }
}
