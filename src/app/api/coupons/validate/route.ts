import { NextRequest, NextResponse } from "next/server";
import { checkCoupon } from "@/lib/orders/coupons";

export async function POST(req: NextRequest) {
  const { code, subtotal, phone } = await req.json().catch(() => ({}));
  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ error: "Missing coupon code or subtotal." }, { status: 400 });
  }
  const result = await checkCoupon(code, subtotal, phone ?? "");
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ discount: result.discount, code: result.coupon!.code });
}
