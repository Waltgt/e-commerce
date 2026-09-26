import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { CreateProductInput, UpdateProductInput, ListProductsQuery } from "./product.schema";

export async function listProducts(query: ListProductsQuery) {
  const where: Prisma.ProductWhereInput = {
  ...(!query.includeInactive && { isActive: true }),
    ...(query.search && {
      name: { contains: query.search },
    }),
    ...(query.categoryId && {
      categories: { some: { categoryId: query.categoryId } },
    }),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? {
        price: {
          ...(query.minPrice !== undefined && { gte: query.minPrice }),
          ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
        },
      }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "popularity"
      ? { orderItems: { _count: "desc" } }
      : query.sort === "price_asc"
        ? { price: "asc" }
        : query.sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        images: { select: { id: true } }, // solo IDs, no el binario
        categories: { include: { category: true } },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      categories: p.categories.map((pc) => pc.category.name),
      imageIds: p.images.map((img) => img.id),
      timesPurchased: p._count.orderItems,
      isActive: p.isActive 
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize),
  };
}

export async function getProductById(id: number) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: {
      images: { select: { id: true } },
      categories: { include: { category: true } },
    },
  });

  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Producto no encontrado");
  }

  const ratingAgg = await prisma.review.aggregate({
    where: { productId: id, isVisible: true },
    _avg: { rating: true },
    _count: true,
  });

  return {
    ...product,
    imageIds: product.images.map((img) => img.id),
    images: undefined,
    categories: product.categories.map((pc) => pc.category.name),
    averageRating: ratingAgg._avg.rating,
    reviewCount: ratingAgg._count,
  };
}

export async function createProduct(input: CreateProductInput) {
  const categories = await prisma.category.findMany({
    where: { id: { in: input.categoryIds } },
  });
  if (categories.length !== input.categoryIds.length) {
    throw new AppError(400, "INVALID_CATEGORY", "Una o más categorías no existen");
  }

  return prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      lowStockThreshold: input.lowStockThreshold,
      categories: {
        create: input.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });
}

export async function updateProduct(id: number, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Producto no encontrado");
  }

  if (input.categoryIds) {
    const categories = await prisma.category.findMany({
      where: { id: { in: input.categoryIds } },
    });
    if (categories.length !== input.categoryIds.length) {
      throw new AppError(400, "INVALID_CATEGORY", "Una o más categorías no existen");
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.lowStockThreshold !== undefined && { lowStockThreshold: input.lowStockThreshold }),
      ...(input.categoryIds && {
        categories: {
          deleteMany: {}, // reemplaza el set completo de categorías
          create: input.categoryIds.map((categoryId) => ({ categoryId })),
        },
      }),
    },
  });
}

export async function softDeleteProduct(id: number) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Producto no encontrado");
  }
  await prisma.product.update({ where: { id }, data: { isActive: false } });
}

export async function addProductImages(productId: number, files: Express.Multer.File[]) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Producto no encontrado");
  }

  const data: Prisma.ProductImageCreateManyInput[] = files.map((file) => ({
    productId,
    data: file.buffer,
    mimeType: file.mimetype,
  })) as Prisma.ProductImageCreateManyInput[];

  await prisma.productImage.createMany({ data });
}

export async function getProductImage(productId: number, imageId: number) {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) {
    throw new AppError(404, "IMAGE_NOT_FOUND", "Imagen no encontrada");
  }
  return image;
}

export async function deleteProductImage(productId: number, imageId: number) {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) {
    throw new AppError(404, "IMAGE_NOT_FOUND", "Imagen no encontrada");
  }
  await prisma.productImage.delete({ where: { id: imageId } });
}

export async function reactivateProduct(id: number) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Producto no encontrado");
  }
  await prisma.product.update({ where: { id }, data: { isActive: true } });
}