import { api } from "./api";

export async function fetchUsers() {
  const { data } = await api.get("/admin/users");
  return data.data;
}

export async function fetchUserDetail(id: number) {
  const { data } = await api.get(`/admin/users/${id}`);
  return data.data;
}

export async function blockUser(id: number) {
  await api.post(`/admin/users/${id}/block`);
}

export async function unblockUser(id: number) {
  await api.post(`/admin/users/${id}/unblock`);
}