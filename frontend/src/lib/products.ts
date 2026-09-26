import { api } from "./api";

export interface ProductListItem {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: string[];
  imageIds: number[];
  timesPurchased: number;
}

export interface ProductListParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
}

export interface ProductFormInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  categoryIds: number[];
}

export function buildImageUrl(productId: number, imageId: number): string {
  return `${import.meta.env.VITE_API_URL}/products/${productId}/images/${imageId}`;
}

export async function fetchProducts(params: ProductListParams) {
  const { data } = await api.get("/products", { params });
  return data.data;
}

export async function fetchCategories() {
  const { data } = await api.get("/products/categories");
  return data.data;
}

export async function fetchProductById(id: number) {
  const { data } = await api.get(`/products/${id}`);
  return data.data;
}

export async function fetchProductReviews(productId: number) {
  const { data } = await api.get(`/products/${productId}/reviews`);
  return data.data;
}

export async function submitProductReview(productId: number, rating: number, comment: string) {
  await api.post(`/products/${productId}/reviews`, { rating, comment });
}

export async function fetchAllProductsForAdmin() {
  const { data } = await api.get("/products", { params: { pageSize: 50, includeInactive: true } });
  return data.data;
}

export async function createProduct(input: ProductFormInput) {
  const { data } = await api.post("/products", input);
  return data.data;
}

export async function updateProduct(id: number, input: Partial<ProductFormInput>) {
  const { data } = await api.put(`/products/${id}`, input);
  return data.data;
}

export async function deleteProduct(id: number) {
  await api.delete(`/products/${id}`);
}

export async function createCategory(name: string) {
  const { data } = await api.post("/products/categories", { name });
  return data.data;
}

export async function uploadProductImages(productId: number, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  await api.post(`/products/${productId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function deleteProductImage(productId: number, imageId: number) {
  await api.delete(`/products/${productId}/images/${imageId}`);
}

export async function reactivateProduct(id: number) {
  await api.post(`/products/${id}/reactivate`);
}