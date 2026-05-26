import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInvoice, PLAN_PRICING } from "@/lib/qpay";

// POST /api/billing/checkout  { plan: "pro" | "enterprise" }
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!["pro", "enterprise"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Already on this plan
  if (user.plan === plan && user.planStatus === "active") {
    return NextResponse.json({ error: "Already on this plan" }, { status: 400 });
  }

  const pricing = PLAN_PRICING[plan];
  const invoiceNo = `ZENITH-${user.id.slice(-8).toUpperCase()}-${Date.now()}`;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  // Embed the webhook secret in the callback URL so QPay carries it back to us
  const webhookSecret = process.env.QPAY_WEBHOOK_SECRET;
  const callbackUrl = webhookSecret
    ? `${baseUrl}/api/billing/callback?secret=${encodeURIComponent(webhookSecret)}`
    : `${baseUrl}/api/billing/callback`;

  try {
    const qpay = await createInvoice({
      invoiceNo,
      description: `${pricing.label} — ${user.email}`,
      amount: pricing.amount,
      callbackUrl,
    });

    // Save pending payment to DB
    await prisma.payment.create({
      data: {
        userId: user.id,
        plan,
        amount: pricing.amount,
        invoiceId: qpay.invoice_id,
        status: "pending",
      },
    });

    return NextResponse.json({
      invoiceId: qpay.invoice_id,
      qrImage: qpay.qr_image,    // base64 PNG
      qrText: qpay.qr_text,
      urls: qpay.urls,            // deep links for banking apps
      amount: pricing.amount,
      plan,
    });
  } catch (err) {
    console.error("QPay checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create QPay invoice. Please try again." },
      { status: 502 }
    );
  }
}
