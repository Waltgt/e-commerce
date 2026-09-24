import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().min(1),
  price: z.coerce.number().positive("El precio debe ser mayor a cero"),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  categoryIds: z.array(z.coerce.number().int()).min(1, "Debe tener al menos una categoría"),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  categoryId: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["popularity", "price_asc", "price_desc", "newest"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;