import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
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

  if (err instanceof ZodError) {
    return res.status(400).json(
      fail("VALIDATION_ERROR", "Datos inválidos", err.issues.map(i => ({
        field: i.path.join("."),
        message: i.message,
      })))
    );
  }

  console.error("Error no controlado:", err);
  return res.status(500).json(fail("INTERNAL_ERROR", "Ocurrió un error inesperado"));
}