import { sendMail } from "../../lib/mailer";

interface OrderConfirmationData {
  email: string;
  name: string;
  orderId: number;
  total: number;
  items: { productName: string; quantity: number; unitPrice: number }[];
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationData) {
  const itemsHtml = data.items
    .map(
      (i) =>
        `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>$${i.unitPrice.toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <h2>Confirmación de pedido #${data.orderId}</h2>
    <p>Hola ${data.name}, tu pedido ha sido confirmado y pagado.</p>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p><strong>Total: $${data.total.toFixed(2)}</strong></p>
  `;

  await sendMail(data.email, `Confirmación de pedido #${data.orderId}`, html);
}