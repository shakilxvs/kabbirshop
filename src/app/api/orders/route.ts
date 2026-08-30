import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { placeOrder, OrderError } from "@/lib/orders/place-order";
import { getStoreSettings } from "@/lib/data";
import { sendNewOrderWhatsAppAlert } from "@/lib/notifications/whatsapp";

const bodySchema = z.object({
  idempotencyKey: z.string().min(8),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantKey: z.string().optional(),
        quantity: z.number().int().positive().max(50),
      })
    )
    .min(1),
  customer: z.object({
    fullName: z.string().trim().min(2, "Please enter your full name."),
    phone: z
      .string()
      .trim()
      .regex(/^(?:\+?880|0)1[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number."),
    email: z.string().email().optional().or(z.literal("")),
  }),
  delivery: z.object({
    division: z.string().trim().min(1, "Division is required."),
    district: z.string().trim().min(1, "District is required."),
    area: z.string().trim().min(1, "Area/Upazila is required."),
    fullAddress: z.string().trim().min(5, "Please enter your full address."),
    instructions: z.string().optional(),
  }),
  deliveryZoneId: z.string().min(1),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors[0]?.message : "Invalid request.";
    return NextResponse.json({ error: message ?? "Please check your information and try again." }, { status: 400 });
  }

  try {
    const settings = await getStoreSettings();
    const order = await placeOrder(
      { ...parsed, customer: { ...parsed.customer, email: parsed.customer.email || undefined } },
      settings
    );

    // Fire-and-forget: never let a notification failure affect the customer's checkout.
    sendNewOrderWhatsAppAlert(order, settings).catch(() => {});

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Order placement failed:", err);
    return NextResponse.json({ error: "Unable to place your order. Please check your information and try again." }, { status: 500 });
  }
}
