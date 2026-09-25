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