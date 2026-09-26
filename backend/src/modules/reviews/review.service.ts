import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { CreateReviewInput } from "./review.schema";

const PURCHASED_STATUSES = ["PAID", "SHIPPED", "DELIVERED"];

export async function createReview(userId: number, productId: number, input: CreateReviewInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Producto no encontrado");
  }

  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: { name: { in: PURCHASED_STATUSES } } },
    },
  });

  if (!purchase) {
    throw new AppError(403, "PRODUCT_NOT_PURCHASED", "Solo puedes reseñar productos que hayas comprado");
  }

  return prisma.review.create({
    data: { productId, userId, rating: input.rating, comment: input.comment },
  });
}

export async function listReviewsForProduct(productId: number) {
  return prisma.review.findMany({
    where: { productId, isVisible: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function hideReview(id: number) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new AppError(404, "REVIEW_NOT_FOUND", "Reseña no encontrada");
  }
  await prisma.review.update({ where: { id }, data: { isVisible: false } });
}

export async function deleteReview(id: number) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new AppError(404, "REVIEW_NOT_FOUND", "Reseña no encontrada");
  }
  await prisma.review.delete({ where: { id } });
}

export async function listAllReviewsForAdmin(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count(),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function unhideReview(id: number) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new AppError(404, "REVIEW_NOT_FOUND", "Reseña no encontrada");
  }
  await prisma.review.update({ where: { id }, data: { isVisible: true } });
}