import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "./auth.service";
import { ok } from "../../lib/apiResponse";
import { AppError } from "../../lib/AppError";

const REFRESH_COOKIE_NAME = "refreshToken";
const isProduction = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  res.status(201).json(ok(user));
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { accessToken, refreshTokenPlain } = await loginUser(input);
  setRefreshCookie(res, refreshTokenPlain);
  res.json(ok({ accessToken }));
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw new AppError(401, "MISSING_REFRESH_TOKEN", "No se encontró la sesión");
  }
  const { accessToken, refreshTokenPlain } = await refreshAccessToken(token);
  setRefreshCookie(res, refreshTokenPlain);
  res.json(ok({ accessToken }));
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    await logoutUser(token);
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.json(ok({ message: "Sesión cerrada" }));
}