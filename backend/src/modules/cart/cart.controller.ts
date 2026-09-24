import { Response } from "express";
import { addCartItemSchema, updateCartItemSchema } from "./cart.schema";
import { getCart, addItemToCart, updateCartItemQuantity, removeCartItem, clearCart } from "./cart.service";
import { ok } from "../../lib/apiResponse";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export async function getCartHandler(req: AuthenticatedRequest, res: Response) {
  const cart = await getCart(req.user!.userId);
  res.json(ok(cart));
}

export async function addItemHandler(req: AuthenticatedRequest, res: Response) {
  const input = addCartItemSchema.parse(req.body);
  const cart = await addItemToCart(req.user!.userId, input.productId, input.quantity);
  res.status(201).json(ok(cart));
}

export async function updateItemHandler(req: AuthenticatedRequest, res: Response) {
  const productId = Number(req.params.productId);
  const input = updateCartItemSchema.parse(req.body);
  const cart = await updateCartItemQuantity(req.user!.userId, productId, input.quantity);
  res.json(ok(cart));
}

export async function removeItemHandler(req: AuthenticatedRequest, res: Response) {
  const productId = Number(req.params.productId);
  const cart = await removeCartItem(req.user!.userId, productId);
  res.json(ok(cart));
}

export async function clearCartHandler(req: AuthenticatedRequest, res: Response) {
  await clearCart(req.user!.userId);
  res.json(ok({ message: "Carrito vaciado" }));
}