import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { Coupon, Order, OrderLineItem, Product, StoreSettings } from "@/types";
import { getEffectivePrice } from "@/lib/pricing";
import { checkCoupon } from "@/lib/orders/coupons";

export interface PlaceOrderInput {
  idempotencyKey: string;
  items: { productId: string; variantKey?: string; quantity: number }[];
  customer: { fullName: string; phone: string; email?: string };
  delivery: { division: string; district: string; area: string; fullAddress: string; instructions?: string };
  deliveryZoneId: string;
  couponCode?: string;
}

export class OrderError extends Error {}

export async function placeOrder(input: PlaceOrderInput, settings: StoreSettings): Promise<Order> {
  const { orders: orderSettings, delivery: zones } = settings;

  if (!orderSettings.codEnabled) throw new OrderError("Cash on Delivery is currently unavailable.");
  if (!input.items.length) throw new OrderError("Your cart is empty.");
  if (orderSettings.phoneRequired && !input.customer.phone) throw new OrderError("Phone number is required.");
  if (orderSettings.emailRequired && !input.customer.email) throw new OrderError("Email is required.");

  const zone = zones.find((z) => z.id === input.deliveryZoneId && z.active);
  if (!zone) throw new OrderError("Please select a valid delivery zone.");

  // Idempotency: if this exact checkout attempt already produced an order, return it instead of duplicating.
  const attemptRef = adminDb.collection("orderAttempts").doc(input.idempotencyKey);
  const existingAttempt = await attemptRef.get();
  if (existingAttempt.exists) {
    const existingOrder = await adminDb.collection("orders").doc(existingAttempt.data()!.orderId).get();
    if (existingOrder.exists) return existingOrder.data() as Order;
  }

  const counterRef = adminDb.collection("counters").doc("orders");
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const productRefs = productIds.map((id) => adminDb.collection("products").doc(id));

  const order = await adminDb.runTransaction(async (tx) => {
    // ---- Reads first (Firestore transaction rule: all reads before any write) ----
    const [counterSnap, ...productSnaps] = await Promise.all([tx.get(counterRef), ...productRefs.map((r) => tx.get(r))]);

    const productsById = new Map<string, Product>();
    productSnaps.forEach((snap, idx) => {
      if (!snap.exists) throw new OrderError("One of the items in your cart is no longer available.");
      productsById.set(productIds[idx], snap.data() as Product);
    });

    let couponDocId: string | null = null;
    let couponData: Coupon | null = null;
    let couponUsageRef: FirebaseFirestore.DocumentReference | null = null;
    let couponUsagePrevCount = 0;

    if (input.couponCode) {
      const check = await checkCoupon(input.couponCode, 0, input.customer.phone); // re-validated properly below with real subtotal
      // We re-run the full check after subtotal is known (see below); this first pass just
      // confirms the code exists so we can read its doc inside the transaction.
      if (check.coupon) {
        couponDocId = check.coupon.id;
        const couponRef = adminDb.collection("coupons").doc(couponDocId);
        const couponSnap = await tx.get(couponRef);
        if (couponSnap.exists) couponData = couponSnap.data() as Coupon;
        if (couponData?.perCustomerLimit) {
          couponUsageRef = couponRef.collection("usage").doc(input.customer.phone);
          const usageSnap = await tx.get(couponUsageRef);
          couponUsagePrevCount = usageSnap.exists ? (usageSnap.data()!.count as number) : 0;
        }
      }
    }

    // ---- Resolve trusted line items (spec #29: never trust client price/stock) ----
    const lineItems: OrderLineItem[] = [];
    for (const item of input.items) {
      const product = productsById.get(item.productId);
      if (!product || product.status !== "published") {
        throw new OrderError(`"${product?.name ?? "A product"}" in your cart is no longer available.`);
      }

      let unitPrice = getEffectivePrice(product);
      let stockAvailable = product.stockQuantity;
      let variantLabel: string | undefined;

      if (item.variantKey) {
        let matched = false;
        for (const group of product.variantGroups) {
          const opt = group.options.find((o) => o.id === item.variantKey || `${group.id}:${o.id}` === item.variantKey);
          if (opt) {
            matched = true;
            unitPrice = opt.salePrice ?? opt.price ?? unitPrice;
            if (opt.stock != null) stockAvailable = opt.stock;
            variantLabel = `${group.name}: ${opt.name}`;
          }
        }
        if (!matched) throw new OrderError(`Selected variant for "${product.name}" is no longer available.`);
      }

      if (product.trackInventory && stockAvailable < item.quantity) {
        throw new OrderError(`Only ${stockAvailable} of "${product.name}" left in stock.`);
      }

      lineItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: product.mainImageUrl,
        variantLabel,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      });
    }

    const subtotal = lineItems.reduce((sum, l) => sum + l.lineTotal, 0);

    if (orderSettings.minOrderAmount && subtotal < orderSettings.minOrderAmount) {
      throw new OrderError(`Minimum order amount is ৳${orderSettings.minOrderAmount}.`);
    }
    if (orderSettings.maxOrderAmount && subtotal > orderSettings.maxOrderAmount) {
      throw new OrderError(`Maximum order amount is ৳${orderSettings.maxOrderAmount}.`);
    }

    let discount = 0;
    let appliedCouponCode: string | undefined;

    if (input.couponCode && couponData) {
      const now = Date.now();
      if (!couponData.active) throw new OrderError("This coupon is no longer active.");
      if (couponData.startDate && now < couponData.startDate) throw new OrderError("This coupon isn't active yet.");
      if (couponData.expiryDate && now > couponData.expiryDate) throw new OrderError("This coupon has expired.");
      if (couponData.minOrderAmount && subtotal < couponData.minOrderAmount) {
        throw new OrderError(`This coupon requires a minimum order of ৳${couponData.minOrderAmount}.`);
      }
      if (couponData.usageLimit && couponData.usedCount >= couponData.usageLimit) {
        throw new OrderError("This coupon has reached its usage limit.");
      }
      if (couponData.perCustomerLimit && couponUsagePrevCount >= couponData.perCustomerLimit) {
        throw new OrderError("You've already used this coupon the maximum number of times.");
      }

      discount = couponData.type === "percentage" ? (subtotal * couponData.value) / 100 : couponData.value;
      if (couponData.maxDiscount) discount = Math.min(discount, couponData.maxDiscount);
      discount = Math.round(Math.min(discount, subtotal));
      appliedCouponCode = couponData.code;
    } else if (input.couponCode && !couponData) {
      throw new OrderError("This coupon code is invalid.");
    }

    const total = Math.max(0, subtotal + zone.charge - discount);

    // ---- Writes ----
    const current = counterSnap.exists ? (counterSnap.data()!.next as number) : orderSettings.startingNumber;
    tx.set(counterRef, { next: current + 1 }, { merge: true });
    const orderNumber = `${orderSettings.numberPrefix}${String(current).padStart(orderSettings.padding, "0")}`;

    for (const item of input.items) {
      const product = productsById.get(item.productId)!;
      if (!product.trackInventory) continue;
      const ref = adminDb.collection("products").doc(item.productId);
      if (item.variantKey) {
        const groups = product.variantGroups.map((g) => ({
          ...g,
          options: g.options.map((o) =>
            o.id === item.variantKey || `${g.id}:${o.id}` === item.variantKey
              ? { ...o, stock: Math.max(0, (o.stock ?? 0) - item.quantity) }
              : o
          ),
        }));
        tx.update(ref, { variantGroups: groups });
      } else {
        tx.update(ref, { stockQuantity: Math.max(0, product.stockQuantity - item.quantity) });
      }
    }

    if (appliedCouponCode && couponDocId) {
      const couponRef = adminDb.collection("coupons").doc(couponDocId);
      tx.update(couponRef, { usedCount: (couponData!.usedCount ?? 0) + 1 });
      if (couponUsageRef) {
        tx.set(couponUsageRef, { count: couponUsagePrevCount + 1 }, { merge: true });
      }
    }

    const now = Date.now();
    const orderId = adminDb.collection("orders").doc().id;
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      status: "pending",
      customer: { fullName: input.customer.fullName, phone: input.customer.phone, email: input.customer.email },
      delivery: input.delivery,
      items: lineItems,
      subtotal,
      deliveryCharge: zone.charge,
      discount,
      total,
      couponCode: appliedCouponCode,
      paymentMethod: "cod",
      internalNotes: [],
      audit: { createdAt: now, updatedAt: now },
    };

    tx.set(adminDb.collection("orders").doc(orderId), newOrder);
    tx.set(attemptRef, { orderId, createdAt: now });

    return newOrder;
  });

  return order;
}
