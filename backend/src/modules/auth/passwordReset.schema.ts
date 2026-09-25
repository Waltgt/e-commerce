import { z } from "zod";

export const requestResetSchema = z.object({
  email: z.string().email("Correo inválido"),
});

export const confirmResetSchema = z.object({
  token: z.string().min(1, "Falta el token"),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[a-zA-Z]/, "Debe incluir al menos una letra")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
});

export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type ConfirmResetInput = z.infer<typeof confirmResetSchema>;