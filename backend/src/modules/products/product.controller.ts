import { Request, Response } from "express";
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from "./product.schema";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  addProductImages,
  getProductImage,
  deleteProductImage,
} from "./product.service";
import { listCategories, createCategory } from "./category.service";
import { ok } from "../../lib/apiResponse";
import { AppError } from "../../lib/AppError";

export async function getProducts(req: Request, res: Response) {
  const query = listProductsQuerySchema.parse(req.query);
  const result = await listProducts(query);
  res.json(ok(result));
}

export async function getProduct(req: Request, res: Response) {
  const id = Number(req.params.id);
  const product = await getProductById(id);
  res.json(ok(product));
}

export async function postProduct(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body);
  const product = await createProduct(input);
  res.status(201).json(ok(product));
}

export async function putProduct(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateProductSchema.parse(req.body);
  const product = await updateProduct(id, input);
  res.json(ok(product));
}

export async function deleteProduct(req: Request, res: Response) {
  const id = Number(req.params.id);
  await softDeleteProduct(id);
  res.json(ok({ message: "Producto eliminado" }));
}

export async function postProductImages(req: Request, res: Response) {
  const productId = Number(req.params.id);
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError(400, "NO_FILES", "No se enviaron imágenes");
  }
  await addProductImages(productId, files);
  res.status(201).json(ok({ message: "Imágenes agregadas" }));
}

export async function getProductImageBinary(req: Request, res: Response) {
  const productId = Number(req.params.id);
  const imageId = Number(req.params.imageId);
  const image = await getProductImage(productId, imageId);
  res.set("Content-Type", image.mimeType);
  res.set("Cache-Control", "public, max-age=86400"); // 1 día, reduce carga repetida a MySQL
  res.send(image.data);
}

export async function deleteProductImageEndpoint(req: Request, res: Response) {
  const productId = Number(req.params.id);
  const imageId = Number(req.params.imageId);
  await deleteProductImage(productId, imageId);
  res.json(ok({ message: "Imagen eliminada" }));
}

export async function getCategories(req: Request, res: Response) {
  const categories = await listCategories();
  res.json(ok(categories));
}

export async function postCategory(req: Request, res: Response) {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    throw new AppError(400, "INVALID_NAME", "Falta el nombre de la categoría");
  }
  const category = await createCategory(name);
  res.status(201).json(ok(category));
}