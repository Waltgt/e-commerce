import jwt, { SignOptions } from "jsonwebtoken";

interface AccessTokenPayload {
  userId: number;
  roleId: number;
  roleName: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET no está definido en las variables de entorno");
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN as unknown as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}