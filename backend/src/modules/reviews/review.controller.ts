import { Response } from "express";
import { createReviewSchema } from "./review.schema";
import { createReview, listReviewsForProduct, hideReview, deleteReview } from "./review.service";
import { ok } from "../../lib/apiResponse";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export async function postReviewHandler(req: AuthenticatedRequest, res: Response) {
  const productId = Number(req.params.id);
  const input = createReviewSchema.parse(req.body);
  const review = await createReview(req.user!.userId, productId, input);
  res.status(201).json(ok(review));
}

export async function getReviewsHandler(req: AuthenticatedRequest, res: Response) {
  const productId = Number(req.params.id);
  const reviews = await listReviewsForProduct(productId);
  res.json(ok(reviews));
}

export async function hideReviewHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  await hideReview(id);
  res.json(ok({ message: "Reseña ocultada" }));
}

export async function deleteReviewHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  await deleteReview(id);
  res.json(ok({ message: "Reseña eliminada" }));
}