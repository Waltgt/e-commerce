<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { fetchProducts, fetchCategories, type ProductListItem } from "../../lib/products";
import ProductCard from "../../components/product/ProductCard.vue";
import BaseButton from "../../components/base/BaseButton.vue";

const products = ref<ProductListItem[]>([]);
const categories = ref<{ id: number; name: string }[]>([]);
const totalPages = ref(1);

const search = ref("");
const categoryId = ref<number | "">("");
const minPrice = ref("");
const maxPrice = ref("");
const sort = ref("newest");
const page = ref(1);

async function loadProducts() {
  const result = await fetchProducts({
    search: search.value || undefined,
    categoryId: categoryId.value || undefined,
    minPrice: minPrice.value ? Number(minPrice.value) : undefined,
    maxPrice: maxPrice.value ? Number(maxPrice.value) : undefined,
    sort: sort.value,
    page: page.value,
  });
  products.value = result.items;
  totalPages.value = result.totalPages;
}

function applyFilters() {
  page.value = 1;
  loadProducts();
}

function changePage(delta: number) {
  page.value += delta;
  loadProducts();
}

onMounted(async () => {
  categories.value = await fetchCategories();
  loadProducts();
});

watch(sort, loadProducts);
</script>

<template>
  <div class="container catalog">
    <aside class="catalog__filters">
      <h2>Filtros</h2>
      <label class="filter-field">
        <span>Buscar</span>
        <input v-model="search" type="text" @keyup.enter="applyFilters" />
      </label>
      <label class="filter-field">
        <span>Categoría</span>
        <select v-model="categoryId" @change="applyFilters">
          <option value="">Todas</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>
      <label class="filter-field">
        <span>Precio mínimo</span>
        <input v-model="minPrice" type="number" min="0" @keyup.enter="applyFilters" />
      </label>
      <label class="filter-field">
        <span>Precio máximo</span>
        <input v-model="maxPrice" type="number" min="0" @keyup.enter="applyFilters" />
      </label>
      <label class="filter-field">
        <span>Ordenar por</span>
        <select v-model="sort">
          <option value="newest">Más recientes</option>
          <option value="popularity">Popularidad</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>
      </label>
      <BaseButton @click="applyFilters">Aplicar filtros</BaseButton>
    </aside>

    <section class="catalog__results">
      <p v-if="!products.length" class="catalog__empty">
        No hay productos que coincidan con estos filtros.
      </p>
      <ProductCard v-for="p in products" :key="p.id" :product="p" />

      <div v-if="totalPages > 1" class="catalog__pagination">
        <BaseButton variant="secondary" :disabled="page <= 1" @click="changePage(-1)">
          Anterior
        </BaseButton>
        <span>Página {{ page }} de {{ totalPages }}</span>
        <BaseButton variant="secondary" :disabled="page >= totalPages" @click="changePage(1)">
          Siguiente
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.catalog {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: var(--space-5);
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
}

.catalog__filters h2 {
  margin-bottom: var(--space-3);
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
  font-size: 0.875rem;
}

.filter-field input,
.filter-field select {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-2);
  background: white;
}

.catalog__empty {
  color: var(--steel);
  padding: var(--space-5) 0;
}

.catalog__pagination {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-4);
}

@media (max-width: 720px) {
  .catalog {
    grid-template-columns: 1fr;
  }
}
</style>