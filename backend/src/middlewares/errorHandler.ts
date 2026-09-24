import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError";
import { fail } from "../lib/apiResponse";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(fail(err.code, err.message, err.details));
  }

  // Error no controlado: no exponemos el detalle interno al cliente
  console.error("Error no controlado:", err);
  return res.status(500).json(fail("INTERNAL_ERROR", "Ocurrió un error inesperado"));
}