import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { blockUser, unblockUser } from "../auth/auth.service";

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isBlocked: true,
      createdAt: true,
      role: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserDetail(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      isBlocked: true,
      createdAt: true,
      role: { select: { name: true } },
      orders: {
        select: {
          id: true,
          total: true,
          createdAt: true,
          status: { select: { name: true } },
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              product: { select: { name: true } },
            },
          },
          payment: {
            select: {
              method: { select: { name: true } },
              status: { select: { name: true } },
              dummyReference: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "Usuario no encontrado");
  }

  return user;
}

export async function adminBlockUser(targetId: number, requesterId: number) {
  if (targetId === requesterId) {
    throw new AppError(400, "CANNOT_BLOCK_SELF", "No puedes bloquear tu propia cuenta");
  }
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "Usuario no encontrado");
  }
  await blockUser(targetId);
}

export async function adminUnblockUser(targetId: number) {
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "Usuario no encontrado");
  }
  await unblockUser(targetId);
}