import { z } from "zod";

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["CREDIT_CARD", "PAYPAL", "CASH"]),
  cardNumber: z.string().optional(), // solo relevante si paymentMethod es CREDIT_CARD
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;