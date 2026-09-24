import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto").max(120),
  email: z.string().email("Correo inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[a-zA-Z]/, "Debe incluir al menos una letra")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
});

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;