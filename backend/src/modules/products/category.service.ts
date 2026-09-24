import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(name: string) {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    throw new AppError(409, "CATEGORY_ALREADY_EXISTS", "Esa categoría ya existe");
  }
  return prisma.category.create({ data: { name } });
}