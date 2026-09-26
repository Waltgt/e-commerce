<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import {
  fetchAllProductsForAdmin,
  deleteProduct,
  reactivateProduct,
  buildImageUrl,
} from "../../lib/products";
import { useToastStore } from "../../stores/toast";
import BaseButton from "../../components/base/BaseButton.vue";

const toastStore = useToastStore();
const products = ref<any[]>([]);

async function loadProducts() {
  const result = await fetchAllProductsForAdmin();
  products.value = result.items;
}

async function handleDelete(id: number) {
  await deleteProduct(id);
  toastStore.push("Producto desactivado");
  await loadProducts();
}

async function handleReactivate(id: number) {
  await reactivateProduct(id);
  toastStore.push("Producto reactivado");
  await loadProducts();
}

onMounted(loadProducts);
</script>

<template>
  <div class="container admin-products">
    <header class="admin-products__header">
      <h1>Productos</h1>
      <router-link to="/admin/products/new">
        <BaseButton>Nuevo producto</BaseButton>
      </router-link>
    </header>

    <table class="admin-table">
      <thead>
        <tr>
          <th></th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p.id" :class="{ 'admin-table__row--inactive': !p.isActive }">
          <td>
            <img
              v-if="p.imageIds?.length"
              :src="buildImageUrl(p.id, p.imageIds[0])"
              class="admin-table__thumb"
            />
            <div v-else class="admin-table__thumb admin-table__thumb--empty">
              <Icon icon="mdi:image-outline" width="18" />
            </div>
          </td>
          <td>{{ p.name }}</td>
          <td>${{ Number(p.price).toFixed(2) }}</td>
          <td>{{ p.stock }}</td>
          <td>{{ p.isActive ? "Activo" : "Desactivado" }}</td>
          <td class="admin-table__actions">
            <router-link :to="`/admin/products/${p.id}/edit`">
              <Icon icon="mdi:pencil-outline" width="18" />
            </router-link>
            <button v-if="p.isActive" @click="handleDelete(p.id)">
              <Icon icon="mdi:trash-can-outline" width="18" />
            </button>
            <button v-else @click="handleReactivate(p.id)">
              <Icon icon="mdi:restore" width="18" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-products {
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
}

.admin-products__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
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

.admin-table__row--inactive {
  color: var(--steel);
}

.admin-table__thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.admin-table__thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--line);
  color: var(--steel);
}

.admin-table__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.admin-table__actions a,
.admin-table__actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 0;
}

.admin-table__actions a:hover,
.admin-table__actions button:hover {
  color: var(--indigo);
}
</style>