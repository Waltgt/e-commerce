import { api } from "./api";

export interface CheckoutInput {
  paymentMethod: "CREDIT_CARD" | "PAYPAL" | "CASH";
  cardNumber?: string;
}

export async function submitCheckout(input: CheckoutInput) {
  const { data } = await api.post("/orders/checkout", input);
  return data.data;
}

export async function fetchOrderHistory() {
  const { data } = await api.get("/orders");
  return data.data;
}