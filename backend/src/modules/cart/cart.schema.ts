import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a cero"),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a cero"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;