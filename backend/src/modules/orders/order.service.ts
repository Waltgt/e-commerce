import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { processDummyPayment } from "./payment.service";
import { checkLowStockAndNotify } from "./stockAlert.service";
import { CheckoutInput } from "./order.schema";

export async function checkout(userId: number, input: CheckoutInput) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    throw new AppError(400, "EMPTY_CART", "El carrito está vacío");
  }

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  });

  if (items.length === 0) {
    throw new AppError(400, "EMPTY_CART", "El carrito está vacío");
  }

  for (const item of items) {
    if (!item.product.isActive) {
      throw new AppError(400, "PRODUCT_UNAVAILABLE", `"${item.product.name}" ya no está disponible`);
    }
    if (item.quantity > item.product.stock) {
      throw new AppError(
        400,
        "INSUFFICIENT_STOCK",
        `Solo hay ${item.product.stock} unidades disponibles de "${item.product.name}"`
      );
    }
  }

  const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

  const pendingStatus = await prisma.orderStatus.findUnique({ where: { name: "PENDING" } });
  if (!pendingStatus) {
    throw new AppError(500, "STATUS_NOT_SEEDED", "El estado PENDING no existe en el sistema");
  }

  // 1. Crear el pedido en estado PENDING, con snapshot del precio actual
  const order = await prisma.order.create({
    data: {
      userId,
      statusId: pendingStatus.id,
      total,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
      },
    },
  });

  // 2. Procesar el pago dummy 
  const paymentResult = processDummyPayment(input.paymentMethod, input.cardNumber);

  const methodRow = await prisma.paymentMethod.findUnique({ where: { name: input.paymentMethod } });
  const paymentStatusRow = await prisma.paymentStatus.findUnique({
    where: { name: paymentResult.approved ? "APPROVED" : "REJECTED" },
  });

  if (!methodRow || !paymentStatusRow) {
    throw new AppError(500, "CATALOG_NOT_SEEDED", "Faltan catálogos de pago en el sistema");
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      methodId: methodRow.id,
      statusId: paymentStatusRow.id,
      amount: total,
      dummyReference: paymentResult.reference,
    },
  });

  if (!paymentResult.approved) {
    const rejectedStatus = await prisma.orderStatus.findUnique({ where: { name: "PAYMENT_REJECTED" } });
    if (rejectedStatus) {
      await prisma.order.update({ where: { id: order.id }, data: { statusId: rejectedStatus.id } });
    }
    // El carrito NO se vacía: el cliente puede reintentar el pago sin rearmar el carrito
    return { orderId: order.id, status: "PAYMENT_REJECTED", total };
  }

  // 3. Pago aprobado: descuenta stock, cambia estado, vacía carrito (transacción atómica)
  const paidStatus = await prisma.orderStatus.findUnique({ where: { name: "PAID" } });
  if (!paidStatus) {
    throw new AppError(500, "STATUS_NOT_SEEDED", "El estado PAID no existe en el sistema");
  }

  await prisma.$transaction([
    ...items.map((i) =>
      prisma.product.update({
        where: { id: i.productId },
        data: { stock: { decrement: i.quantity } },
      })
    ),
    prisma.order.update({ where: { id: order.id }, data: { statusId: paidStatus.id } }),
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
  ]);

  // 4. Verificación de stock bajo
  for (const item of items) {
    await checkLowStockAndNotify(item.productId);
  }

  return { orderId: order.id, status: "PAID", total };
}

export async function getOrderHistory(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      status: true,
      items: { include: { product: { select: { name: true } } } },
      payment: { include: { method: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(userId: number, orderId: number) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      status: true,
      items: { include: { product: { select: { name: true } } } },
      payment: { include: { method: true, status: true } },
    },
  });

  if (!order) {
    throw new AppError(404, "ORDER_NOT_FOUND", "Pedido no encontrado");
  }

  return order;
}