import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  postReviewHandler,
  getReviewsHandler,
  hideReviewHandler,
  deleteReviewHandler,
  getAllReviewsHandler, 
  unhideReviewHandler
} from "./review.controller";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(getReviewsHandler));
router.post("/", requireAuth, asyncHandler(postReviewHandler));

export default router;

export const adminReviewRouter = Router();
adminReviewRouter.use(requireAuth, requireRole("ADMIN"));
adminReviewRouter.get("/", asyncHandler(getAllReviewsHandler));
adminReviewRouter.patch("/:id/hide", asyncHandler(hideReviewHandler));
adminReviewRouter.patch("/:id/unhide", asyncHandler(unhideReviewHandler));
adminReviewRouter.delete("/:id", asyncHandler(deleteReviewHandler));