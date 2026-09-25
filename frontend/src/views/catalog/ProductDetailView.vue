<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import {
  fetchProductById,
  fetchProductReviews,
  submitProductReview,
  buildImageUrl,
} from "../../lib/products";
import { useCartStore } from "../../stores/cart";
import { useAuthStore } from "../../stores/auth";
import { useToastStore } from "../../stores/toast";
import BaseButton from "../../components/base/BaseButton.vue";

const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const productId = Number(route.params.id);
const product = ref<any>(null);
const reviews = ref<any[]>([]);
const quantity = ref(1);
const reviewRating = ref(5);
const reviewComment = ref("");
const reviewErrorMessage = ref("");

async function loadData() {
  product.value = await fetchProductById(productId);
  reviews.value = await fetchProductReviews(productId);
}

async function handleAddToCart() {
  try {
    await cartStore.addItem(productId, quantity.value);
    toastStore.push("Agregado al carrito");
  } catch (err: any) {
    toastStore.push(
      err.response?.data?.error?.message || "No se pudo agregar al carrito",
      "error",
    );
  }
}

async function handleSubmitReview() {
  reviewErrorMessage.value = "";
  try {
    await submitProductReview(
      productId,
      reviewRating.value,
      reviewComment.value,
    );
    reviewComment.value = "";
    await loadData();
    toastStore.push("Reseña publicada");
  } catch (err: any) {
    reviewErrorMessage.value =
      err.response?.data?.error?.message || "No se pudo publicar la reseña";
  }
}

const averageRatingRounded = computed(() =>
  product.value?.averageRating ? Math.round(product.value.averageRating) : 0,
);

onMounted(loadData);
</script>

<template>
  <div class="container product-detail" v-if="product">
    <div class="product-detail__gallery">
      <img
        v-if="product.imageIds.length"
        :src="buildImageUrl(product.id, product.imageIds[0])"
        :alt="product.name"
      />
      <div v-else class="product-detail__gallery-placeholder">
        <Icon icon="mdi:image-outline" width="48" />
      </div>
    </div>

    <div class="product-detail__info">
      <p class="product-detail__categories">
        {{ product.categories.join(", ") }}
      </p>
      <h1>{{ product.name }}</h1>
      <p class="product-detail__rating">
        <Icon
          v-for="n in 5"
          :key="n"
          :icon="n <= averageRatingRounded ? 'mdi:star' : 'mdi:star-outline'"
          width="18"
        />
        <span v-if="product.reviewCount"
          >({{ product.reviewCount }} reseñas)</span
        >
      </p>
      <p class="product-detail__price">
        ${{ Number(product.price).toFixed(2) }}
      </p>
      <p class="product-detail__description">{{ product.description }}</p>

      <div class="product-detail__purchase">
        <label>
          <span>Cantidad</span>
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            :max="product.stock"
          />
        </label>
        <BaseButton :disabled="product.stock === 0" @click="handleAddToCart">
          Agregar al carrito
        </BaseButton>
      </div>
    </div>

    <section class="product-detail__reviews">
      <h2>Reseñas</h2>

      <div v-if="authStore.isAuthenticated" class="review-form">
        <label>
          <span>Calificación</span>
          <select v-model.number="reviewRating">
            <option v-for="n in [5, 4, 3, 2, 1]" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </label>
        <textarea
          v-model="reviewComment"
          placeholder="Escribe tu comentario"
        ></textarea>
        <p v-if="reviewErrorMessage" class="form-error">
          {{ reviewErrorMessage }}
        </p>
        <BaseButton @click="handleSubmitReview">Publicar reseña</BaseButton>
      </div>

      <p v-if="!reviews.length" class="product-detail__empty">
        Aún no hay reseñas para este producto.
      </p>
      <article v-for="r in reviews" :key="r.id" class="review-item">
        <p class="review-item__meta">
          <strong>{{ r.user.name }}</strong>
          <Icon
            v-for="n in 5"
            :key="n"
            :icon="n <= r.rating ? 'mdi:star' : 'mdi:star-outline'"
            width="14"
          />
        </p>
        <p>{{ r.comment }}</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.product-detail__gallery-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--steel);
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
}

.product-detail__gallery {
  aspect-ratio: 1;
  background: var(--line);
  overflow: hidden;
}

.product-detail__gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-detail__categories {
  font-size: 0.8125rem;
  color: var(--steel);
}

.product-detail__rating {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--indigo);
  font-size: 0.875rem;
  margin-top: var(--space-2);
}

.product-detail__price {
  font-family: var(--font-display);
  font-size: 1.75rem;
  margin-top: var(--space-3);
}

.product-detail__description {
  margin-top: var(--space-3);
  color: var(--steel);
  max-width: 60ch;
}

.product-detail__purchase {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.product-detail__purchase input {
  width: 80px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-2);
  display: block;
  margin-top: var(--space-1);
}

.product-detail__reviews {
  grid-column: 1 / -1;
  border-top: 1px solid var(--line);
  padding-top: var(--space-4);
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 480px;
  margin-bottom: var(--space-5);
}

.review-form textarea {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-2);
  min-height: 80px;
  font-family: inherit;
}

.review-item {
  border-bottom: 1px solid var(--line);
  padding: var(--space-3) 0;
}

.review-item__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.form-error {
  color: var(--alert);
  font-size: 0.875rem;
}

.product-detail__empty {
  color: var(--steel);
}
</style>
