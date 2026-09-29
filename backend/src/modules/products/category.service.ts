import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { getCached, setCached, invalidateCacheByPrefix } from "../../lib/cache";

const CATEGORIES_CACHE_KEY = "products:categories";

export async function listCategories() {
  const cached = await getCached<Awaited<ReturnType<typeof queryCategories>>>(CATEGORIES_CACHE_KEY);
  if (cached) return cached;

  const categories = await queryCategories();
  await setCached(CATEGORIES_CACHE_KEY, categories, 300);
  return categories;
}

function queryCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(name: string) {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    throw new AppError(409, "CATEGORY_ALREADY_EXISTS", "Esa categoría ya existe");
  }
  const category = await prisma.category.create({ data: { name } });
  await invalidateCacheByPrefix(CATEGORIES_CACHE_KEY);
  await invalidateCacheByPrefix("products:list:"); // el listado incluye nombres de categoría
  return category;
}