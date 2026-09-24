import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { uploadProductImages } from "../../middlewares/upload.middleware";
import {
  getProducts,
  getProduct,
  postProduct,
  putProduct,
  deleteProduct,
  postProductImages,
  getProductImageBinary,
  deleteProductImageEndpoint,
  getCategories,
  postCategory,
} from "./product.controller";

const router = Router();

// Públicas
router.get("/", asyncHandler(getProducts));
router.get("/categories", asyncHandler(getCategories));
router.get("/:id", asyncHandler(getProduct));
router.get("/:id/images/:imageId", asyncHandler(getProductImageBinary));

// Solo ADMIN
router.post("/", requireAuth, requireRole("ADMIN"), asyncHandler(postProduct));
router.put("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(putProduct));
router.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(deleteProduct));
router.post(
  "/:id/images",
  requireAuth,
  requireRole("ADMIN"),
  uploadProductImages.array("images", 5),
  asyncHandler(postProductImages)
);
router.delete("/:id/images/:imageId", requireAuth, requireRole("ADMIN"), asyncHandler(deleteProductImageEndpoint));
router.post("/categories", requireAuth, requireRole("ADMIN"), asyncHandler(postCategory));

export default router;