import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { getUsersHandler, getUserDetailHandler, blockUserHandler, unblockUserHandler } from "./user.controller";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/", asyncHandler(getUsersHandler));
router.get("/:id", asyncHandler(getUserDetailHandler));
router.post("/:id/block", asyncHandler(blockUserHandler));
router.post("/:id/unblock", asyncHandler(unblockUserHandler));

export default router;