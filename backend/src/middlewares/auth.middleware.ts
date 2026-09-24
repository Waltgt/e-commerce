import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { redis } from "../lib/redis";
import { AppError } from "../lib/AppError";

export interface AuthenticatedRequest extends Request {
  user?: { userId: number; roleId: number; roleName: string };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError(401, "MISSING_TOKEN", "No se proporcionó un token de acceso"));
  }

  const token = header.slice("Bearer ".length);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(new AppError(401, "INVALID_TOKEN", "Token inválido o expirado"));
  }

  try {
    const isBlocked = await redis.get(`block:user:${payload.userId}`);
    if (isBlocked) {
      return next(new AppError(403, "USER_BLOCKED", "Tu cuenta ha sido bloqueada"));
    }
  } catch (err) {
    console.error("Error consultando Redis en requireAuth:", err);
    return next(new AppError(503, "SERVICE_UNAVAILABLE", "Servicio no disponible temporalmente"));
  }

  req.user = payload;
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.roleName)) {
      return next(new AppError(403, "FORBIDDEN", "No tienes permiso para esta acción"));
    }
    next();
  };
}