// QPay v2 API integration
// Docs: https://developer.qpay.mn

const BASE = process.env.QPAY_BASE_URL || "https://merchant.qpay.mn/v2";
const USERNAME = process.env.QPAY_USERNAME || "";
const PASSWORD = process.env.QPAY_PASSWORD || "";
const INVOICE_CODE = process.env.QPAY_INVOICE_CODE || "";

// Token cache — QPay tokens last 3600 s; cache to avoid re-auth on every request
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
  const res = await fetch(`${BASE}/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QPay auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

export interface QPayInvoiceResult {
  invoice_id: string;
  qr_text: string;
  qr_image: string; // base64 PNG
  urls: Array<{ name: string; description: string; logo: string; link: string }>;
}

export async function createInvoice(params: {
  invoiceNo: string;   // unique per invoice
  description: string;
  amount: number;      // MNT
  callbackUrl: string;
}): Promise<QPayInvoiceResult> {
  const token = await getToken();

  const body = {
    invoice_code: INVOICE_CODE,
    sender_invoice_no: params.invoiceNo,
    invoice_receiver_code: "terminal",
    invoice_description: params.description,
    amount: params.amount,
    callback_url: params.callbackUrl,
  };

  const res = await fetch(`${BASE}/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QPay invoice creation failed: ${res.status} ${text}`);
  }

  return res.json();
}

export interface QPayPaymentStatus {
  count: number;           // number of successful payments
  paid_amount: number;
  rows: Array<{ payment_status: string; payment_amount: number }>;
}

export async function checkPayment(invoiceId: string): Promise<QPayPaymentStatus> {
  const token = await getToken();

  const res = await fetch(`${BASE}/payment/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ object_type: "INVOICE", object_id: invoiceId }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QPay check failed: ${res.status} ${text}`);
  }

  return res.json();
}

// Pricing in MNT
export const PLAN_PRICING: Record<string, { amount: number; label: string; monthly: string }> = {
  pro:        { amount: 99_000,  label: "Pro план",        monthly: "₮99,000/сар"  },
  enterprise: { amount: 299_000, label: "Enterprise план", monthly: "₮299,000/сар" },
};
