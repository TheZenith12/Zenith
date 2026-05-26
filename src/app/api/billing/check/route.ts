import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPayment } from "@/lib/qpay";

// GET /api/billing/check?invoiceId=xxx
// Called every 3 seconds by the frontend while waiting for payment
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoiceId = new URL(req.url).searchParams.get("invoiceId");
  if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });

  // Verify this invoice belongs to the current user
  const payment = await prisma.payment.findUnique({ where: { invoiceId } });
  if (!payment || payment.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Already marked paid in our DB
  if (payment.status === "paid") {
    return NextResponse.json({ status: "paid", plan: payment.plan });
  }

  try {
    const result = await checkPayment(invoiceId);

    if (result.count > 0) {
      // Payment confirmed — activate plan
      await prisma.$transaction([
        prisma.payment.update({
          where: { invoiceId },
          data: { status: "paid", paidAt: new Date() },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: {
            plan: payment.plan,
            planStatus: "active",
            planRequested: null,
            planRequestedAt: null,
          },
        }),
      ]);

      return NextResponse.json({ status: "paid", plan: payment.plan });
    }

    return NextResponse.json({ status: "pending" });
  } catch (err) {
    console.error("QPay check error:", err);
    return NextResponse.json({ status: "pending" }); // keep polling, don't fail
  }
}
