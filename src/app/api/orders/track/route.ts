import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types";

export async function POST(req: NextRequest) {
  const { orderNumber, phone } = await req.json().catch(() => ({}));

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: "Please enter both your order number and phone number." }, { status: 400 });
  }

  const normalizedNumber = String(orderNumber).trim().replace(/^#/, "").toUpperCase();
  const normalizedPhone = String(phone).trim();

  const snap = await adminDb
    .collection("orders")
    .where("orderNumber", "==", normalizedNumber)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: "We couldn't find an order with that number and phone." }, { status: 404 });
  }

  const order = snap.docs[0].data() as Order;

  // Require BOTH order number and phone to match (spec #38) — never expose an order
  // to anyone who only guesses the order number.
  if (order.customer.phone.replace(/\D/g, "") !== normalizedPhone.replace(/\D/g, "")) {
    return NextResponse.json({ error: "We couldn't find an order with that number and phone." }, { status: 404 });
  }

  // Strip internal notes before returning to the customer (spec #43).
  const { internalNotes, ...publicOrder } = order;
  return NextResponse.json({ order: publicOrder });
}
