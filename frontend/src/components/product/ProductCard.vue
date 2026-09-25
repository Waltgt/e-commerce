<script setup lang="ts">
import { buildImageUrl, type ProductListItem } from "../../lib/products";
import { Icon } from "@iconify/vue";

defineProps<{ product: ProductListItem }>();
</script>

<template>
  <router-link :to="`/products/${product.id}`" class="product-card">
    <div class="product-card__image">
      <img
        v-if="product.imageIds.length"
        :src="buildImageUrl(product.id, product.imageIds[0])"
        :alt="product.name"
      />
      <div v-else class="product-card__image-placeholder">
        <Icon icon="mdi:image-outline" width="32" />
      </div>
    </div>
    <div class="product-card__info">
      <h3>{{ product.name }}</h3>
      <p class="product-card__categories">{{ product.categories.join(", ") }}</p>
      <p class="product-card__price">${{ Number(product.price).toFixed(2) }}</p>
    </div>
  </router-link>
</template>

<style scoped>
.product-card__image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--steel);
}
.product-card {
  display: block;
  border-bottom: 1px solid var(--line);
  padding: var(--space-3) 0;
  color: var(--ink);
}

.product-card:hover {
  text-decoration: none;
}

.product-card:hover h3 {
  color: var(--indigo);
}

.product-card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--line);
  margin-bottom: var(--space-2);
  overflow: hidden;
}

.product-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__categories {
  font-size: 0.8125rem;
  color: var(--steel);
  margin-top: var(--space-1);
}

.product-card__price {
  font-family: var(--font-display);
  font-size: 1.125rem;
  margin-top: var(--space-2);
}
</style>