import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  postReviewHandler,
  getReviewsHandler,
  hideReviewHandler,
  deleteReviewHandler,
} from "./review.controller";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(getReviewsHandler));
router.post("/", requireAuth, asyncHandler(postReviewHandler));

export default router;

export const adminReviewRouter = Router();
adminReviewRouter.use(requireAuth, requireRole("ADMIN"));
adminReviewRouter.patch("/:id/hide", asyncHandler(hideReviewHandler));
adminReviewRouter.delete("/:id", asyncHandler(deleteReviewHandler));