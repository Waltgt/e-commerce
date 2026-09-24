import { Response } from "express";
import { checkoutSchema } from "./order.schema";
import { checkout, getOrderHistory, getOrderById } from "./order.service";
import { ok } from "../../lib/apiResponse";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export async function checkoutHandler(req: AuthenticatedRequest, res: Response) {
  const input = checkoutSchema.parse(req.body);
  const result = await checkout(req.user!.userId, input);
  res.status(201).json(ok(result));
}

export async function getHistoryHandler(req: AuthenticatedRequest, res: Response) {
  const orders = await getOrderHistory(req.user!.userId);
  res.json(ok(orders));
}

export async function getOrderHandler(req: AuthenticatedRequest, res: Response) {
  const orderId = Number(req.params.id);
  const order = await getOrderById(req.user!.userId, orderId);
  res.json(ok(order));
}