interface DummyPaymentResult {
  approved: boolean;
  reference: string;
}

export function processDummyPayment(
  method: "CREDIT_CARD" | "PAYPAL" | "CASH",
  cardNumber?: string
): DummyPaymentResult {
  const reference = `DUMMY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (method === "CREDIT_CARD" && cardNumber?.endsWith("0000")) {
    return { approved: false, reference };
  }

  return { approved: true, reference };
}