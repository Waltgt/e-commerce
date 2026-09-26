import { api } from "./api";

export async function fetchAllReviewsForAdmin(page: number = 1) {
  const { data } = await api.get("/admin/reviews", { params: { page, pageSize: 20 } });
  return data.data;
}

export async function fetchAllReviews(productIds: number[]) {
  const results = await Promise.all(
    productIds.map((id) => api.get(`/products/${id}/reviews`).then((res) => res.data.data))
  );
  return results.flat();
}

export async function hideReview(id: number) {
  await api.patch(`/admin/reviews/${id}/hide`);
}

export async function unhideReview(id: number) {
  await api.patch(`/admin/reviews/${id}/unhide`);
}

export async function deleteReview(id: number) {
  await api.delete(`/admin/reviews/${id}`);
}

