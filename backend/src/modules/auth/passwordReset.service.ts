import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { hashPassword } from "../../lib/hash";
import { generateOpaqueToken, hashToken } from "../../lib/tokenHash";
import { sendMail } from "../../lib/mailer";

const RESET_TOKEN_HOURS = 1;

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    return;
  }

  const tokenPlain = generateOpaqueToken();
  const tokenHash = hashToken(tokenPlain);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${tokenPlain}`;

  await sendMail(
    user.email,
    "Recuperación de contraseña",
    `<h2>Recuperación de contraseña</h2>
     <p>Hola ${user.name}, solicitaste restablecer tu contraseña.</p>
     <p><a href="${resetUrl}">Haz clic aquí para crear una nueva contraseña</a></p>
     <p>Este enlace expira en ${RESET_TOKEN_HOURS} hora. Si no solicitaste esto, ignora este correo.</p>`
  );
}

export async function confirmPasswordReset(tokenPlain: string, newPassword: string) {
  const tokenHash = hashToken(tokenPlain);

  const stored = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
    throw new AppError(400, "INVALID_RESET_TOKEN", "El enlace es inválido o ya expiró");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
    
    prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}