import { Response } from "express";
import { createReviewSchema, listReviewsQuerySchema } from "./review.schema";
import { createReview, listReviewsForProduct, hideReview, deleteReview, listAllReviewsForAdmin, unhideReview } from "./review.service";
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

export async function getAllReviewsHandler(req: Request, res: Response) {
  const query = listReviewsQuerySchema.parse(req.query);
  const result = await listAllReviewsForAdmin(query.page, query.pageSize);
  res.json(ok(result));
}

export async function unhideReviewHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  await unhideReview(id);
  res.json(ok({ message: "Reseña restaurada" }));
}