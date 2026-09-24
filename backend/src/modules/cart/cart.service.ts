import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";

async function getOrCreateCart(userId: number) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
}

export async function getCart(userId: number) {
  const cart = await getOrCreateCart(userId);

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  const enrichedItems = items.map((item) => {
    const available = item.product.isActive && item.product.stock >= item.quantity;
    return {
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      unitPrice: item.product.price,
      quantity: item.quantity,
      subtotal: Number(item.product.price) * item.quantity,
      available, // false = producto desactivado o sin stock suficiente
      availableStock: item.product.stock,
    };
  });

  const hasUnavailableItems = enrichedItems.some((i) => !i.available);
  const total = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);

  return {
    cartId: cart.id,
    items: enrichedItems,
    total,
    canCheckout: enrichedItems.length > 0 && !hasUnavailableItems,
  };
}

export async function addItemToCart(userId: number, productId: number, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || !product.isActive) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Producto no encontrado");
  }

  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const totalQuantity = (existing?.quantity || 0) + quantity;

  if (totalQuantity > product.stock) {
    throw new AppError(
      400,
      "INSUFFICIENT_STOCK",
      `Solo hay ${product.stock} unidades disponibles de "${product.name}"`
    );
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: totalQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return getCart(userId);
}

export async function updateCartItemQuantity(userId: number, productId: number, quantity: number) {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
    include: { product: true },
  });

  if (!item) {
    throw new AppError(404, "CART_ITEM_NOT_FOUND", "El producto no está en el carrito");
  }

  if (quantity > item.product.stock) {
    throw new AppError(
      400,
      "INSUFFICIENT_STOCK",
      `Solo hay ${item.product.stock} unidades disponibles de "${item.product.name}"`
    );
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  return getCart(userId);
}

export async function removeCartItem(userId: number, productId: number) {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (!item) {
    throw new AppError(404, "CART_ITEM_NOT_FOUND", "El producto no está en el carrito");
  }

  await prisma.cartItem.delete({ where: { id: item.id } });

  return getCart(userId);
}

export async function clearCart(userId: number) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}