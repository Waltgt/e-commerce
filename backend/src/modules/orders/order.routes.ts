import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { requireAuth } from "../../middlewares/auth.middleware";
import { checkoutHandler, getHistoryHandler, getOrderHandler } from "./order.controller";

const router = Router();

router.use(requireAuth);

router.post("/checkout", asyncHandler(checkoutHandler));
router.get("/", asyncHandler(getHistoryHandler));
router.get("/:id", asyncHandler(getOrderHandler));

export default router;