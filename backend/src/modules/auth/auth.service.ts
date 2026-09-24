import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { hashPassword, comparePassword } from "../../lib/hash";
import { generateOpaqueToken, hashToken } from "../../lib/tokenHash";
import { signAccessToken } from "../../lib/jwt";
import { AppError } from "../../lib/AppError";
import { RegisterInput, LoginInput } from "./auth.schema";

const REFRESH_TOKEN_DAYS = 7;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Ese correo ya está registrado");
  }

  const customerRole = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });
  if (!customerRole) {
    // Esto solo pasaría si el seed no se corrió; es un error de configuración, no del usuario
    throw new AppError(500, "ROLE_NOT_SEEDED", "El rol CUSTOMER no existe en el sistema");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      roleId: customerRole.id,
    },
  });

  return { id: user.id, name: user.name, email: user.email };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { role: true },
  });

  // Mismo mensaje si el correo no existe o la contraseña es incorrecta:
  // evita que alguien pueda confirmar qué correos están registrados
  if (!user || !user.passwordHash) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos");
  }

  const validPassword = await comparePassword(input.password, user.passwordHash);
  if (!validPassword) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos");
  }

  if (user.isBlocked) {
    throw new AppError(403, "USER_BLOCKED", "Tu cuenta ha sido bloqueada. Contacta a soporte.");
  }

  return issueTokens(user.id, user.role.id, user.role.name);
}

export async function issueTokens(userId: number, roleId: number, roleName: string) {
  const accessToken = signAccessToken({ userId, roleId, roleName });

  const refreshTokenPlain = generateOpaqueToken();
  const refreshTokenHash = hashToken(refreshTokenPlain);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, tokenHash: refreshTokenHash, expiresAt },
  });

  return { accessToken, refreshTokenPlain };
}

export async function refreshAccessToken(refreshTokenPlain: string) {
  const tokenHash = hashToken(refreshTokenPlain);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { role: true } } },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Sesión inválida o expirada");
  }

  if (stored.user.isBlocked) {
    throw new AppError(403, "USER_BLOCKED", "Tu cuenta ha sido bloqueada. Contacta a soporte.");
  }

  // Rotación: se revoca el refresh usado y se emite uno nuevo.
  // Si alguien reutiliza un refresh token ya rotado, esto lo detecta en el siguiente intento.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(stored.user.id, stored.user.role.id, stored.user.role.name);
}

export async function logoutUser(refreshTokenPlain: string) {
  const tokenHash = hashToken(refreshTokenPlain);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// La usará el módulo de administración de usuarios cuando bloqueemos una cuenta
export async function blockUser(userId: number) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { isBlocked: true } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  // TTL de 1 día: cubre la vida máxima de un access token ya emitido (15 min)
  // con margen amplio; se puede limpiar antes si se desbloquea al usuario.
  await redis.set(`block:user:${userId}`, "1", "EX", 60 * 60 * 24);
}

export async function unblockUser(userId: number) {
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: false } });
  await redis.del(`block:user:${userId}`);
}