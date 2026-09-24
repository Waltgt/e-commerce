import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getCartHandler,
  addItemHandler,
  updateItemHandler,
  removeItemHandler,
  clearCartHandler,
} from "./cart.controller";

const router = Router();

// Todas las rutas del carrito requieren sesión activa
router.use(requireAuth);

router.get("/", asyncHandler(getCartHandler));
router.post("/items", asyncHandler(addItemHandler));
router.put("/items/:productId", asyncHandler(updateItemHandler));
router.delete("/items/:productId", asyncHandler(removeItemHandler));
router.delete("/", asyncHandler(clearCartHandler));

export default router;