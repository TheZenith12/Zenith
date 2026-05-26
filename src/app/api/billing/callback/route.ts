import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * QPay webhook — called by QPay server when a payment is confirmed.
 *
 * Security: We embed a shared secret in the callback URL and verify it here.
 * Set QPAY_WEBHOOK_SECRET in your .env — QPay will include it in every callback URL.
 */
export async function POST(req: NextRequest) {
  // ── Verify the shared webhook secret ─────────────────────────────────────
  const webhookSecret = process.env.QPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const provided = new URL(req.url).searchParams.get("secret");
    // Use timing-safe comparison to prevent timing attacks
    const matches = provided && timingSafeEqual(provided, webhookSecret);
    if (!matches) {
      console.warn("[billing/callback] Invalid webhook secret");
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  try {
    const body = await req.json();
    // QPay sends: { payment_id, invoice_id, payment_status, ... }
    const { invoice_id, payment_status } = body;

    if (!invoice_id) return NextResponse.json({ ok: false });

    const payment = await prisma.payment.findUnique({ where: { invoiceId: invoice_id } });
    if (!payment) return NextResponse.json({ ok: false });

    // Idempotency: skip if already processed
    if (payment.status === "paid") return NextResponse.json({ ok: true });

    if (payment_status === "PAID" || payment_status === "SUCCESS") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { invoiceId: invoice_id },
          data: { status: "paid", paidAt: new Date() },
        }),
        prisma.user.update({
          where: { id: payment.userId },
          data: {
            plan: payment.plan,
            planStatus: "active",
            planRequested: null,
            planRequestedAt: null,
          },
        }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[billing/callback]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
