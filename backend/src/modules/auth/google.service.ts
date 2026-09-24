import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { issueTokens } from "./auth.service";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;

if (!GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID no está definido en las variables de entorno");
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function loginWithGoogle(idToken: string) {
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError(401, "INVALID_GOOGLE_TOKEN", "El token de Google no es válido");
  }

  if (!payload || !payload.email) {
    throw new AppError(401, "INVALID_GOOGLE_TOKEN", "El token de Google no contiene un correo válido");
  }

  if (!payload.email_verified) {
    throw new AppError(401, "GOOGLE_EMAIL_NOT_VERIFIED", "El correo de Google no está verificado");
  }

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name || email;

  let user = await prisma.user.findUnique({ where: { googleId }, include: { role: true } });

  if (!user) {
    // ¿Existe ya una cuenta local con este correo? Si sí, se vincula en vez de duplicar.
    const existingByEmail = await prisma.user.findUnique({ where: { email }, include: { role: true } });

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { googleId },
        include: { role: true },
      });
    } else {
      const customerRole = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });
      if (!customerRole) {
        throw new AppError(500, "ROLE_NOT_SEEDED", "El rol CUSTOMER no existe en el sistema");
      }

      user = await prisma.user.create({
        data: { name, email, googleId, roleId: customerRole.id },
        include: { role: true },
      });
    }
  }

  if (user.isBlocked) {
    throw new AppError(403, "USER_BLOCKED", "Tu cuenta ha sido bloqueada. Contacta a soporte.");
  }

  return issueTokens(user.id, user.role.id, user.role.name);
}