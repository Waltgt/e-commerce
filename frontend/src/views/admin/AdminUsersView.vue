<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { fetchUsers, blockUser, unblockUser } from "../../lib/users";
import { useAuthStore } from "../../stores/auth";
import { useToastStore } from "../../stores/toast";

const authStore = useAuthStore();
const toastStore = useToastStore();
const users = ref<any[]>([]);
const expandedUserId = ref<number | null>(null);
const userDetail = ref<any>(null);

async function loadUsers() {
  users.value = await fetchUsers();
}

async function toggleDetail(id: number) {
  if (expandedUserId.value === id) {
    expandedUserId.value = null;
    return;
  }
  expandedUserId.value = id;
  const { fetchUserDetail } = await import("../../lib/users");
  userDetail.value = await fetchUserDetail(id);
}

async function handleBlock(id: number) {
  try {
    await blockUser(id);
    toastStore.push("Usuario bloqueado");
    await loadUsers();
  } catch (err: any) {
    toastStore.push(err.response?.data?.error?.message || "No se pudo bloquear al usuario", "error");
  }
}

async function handleUnblock(id: number) {
  await unblockUser(id);
  toastStore.push("Usuario desbloqueado");
  await loadUsers();
}

onMounted(loadUsers);
</script>

<template>
  <div class="container admin-users">
    <h1>Usuarios</h1>

    <table class="admin-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="user in users" :key="user.id">
          <tr>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role.name }}</td>
            <td>{{ user.isBlocked ? "Bloqueado" : "Activo" }}</td>
            <td class="admin-table__actions">
              <button @click="toggleDetail(user.id)">
                <Icon icon="mdi:eye-outline" width="18" />
              </button>
              <button
                v-if="!user.isBlocked && user.id !== authStore.user?.userId"
                @click="handleBlock(user.id)"
              >
                <Icon icon="mdi:lock-outline" width="18" />
              </button>
              <button v-else-if="user.isBlocked" @click="handleUnblock(user.id)">
                <Icon icon="mdi:lock-open-outline" width="18" />
              </button>
            </td>
          </tr>
          <tr v-if="expandedUserId === user.id && userDetail">
            <td colspan="5" class="user-detail">
              <p class="user-detail__label">Historial de pedidos</p>
              <p v-if="!userDetail.orders.length" class="user-detail__empty">Sin pedidos registrados.</p>
              <ul v-else>
                <li v-for="order in userDetail.orders" :key="order.id">
                  Pedido #{{ order.id }} — {{ order.status.name }} — ${{ Number(order.total).toFixed(2) }}
                </li>
              </ul>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-users {
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--space-4);
}

.admin-table th {
  text-align: left;
  font-size: 0.8125rem;
  color: var(--steel);
  font-weight: 500;
  border-bottom: 1px solid var(--line);
  padding-bottom: var(--space-2);
}

.admin-table td {
  padding: var(--space-2);
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}

.admin-table__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.admin-table__actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--steel);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 0;
}

.admin-table__actions button:hover {
  color: var(--indigo);
}

.user-detail {
  background: var(--paper);
}

.user-detail__label {
  font-size: 0.8125rem;
  color: var(--steel);
  margin-bottom: var(--space-2);
}

.user-detail ul {
  margin: 0;
  padding-left: var(--space-4);
  font-size: 0.9375rem;
}

.user-detail__empty {
  color: var(--steel);
  font-size: 0.9375rem;
}
</style>