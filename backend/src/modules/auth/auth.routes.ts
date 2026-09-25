import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { register, login, refresh, logout, googleLogin, requestReset, confirmReset  } from "./auth.controller";


const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.post("/google", asyncHandler(googleLogin));
router.post("/password-reset/request", asyncHandler(requestReset));
router.post("/password-reset/confirm", asyncHandler(confirmReset));

export default router;