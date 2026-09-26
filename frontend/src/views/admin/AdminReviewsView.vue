<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { fetchAllReviewsForAdmin, hideReview, unhideReview, deleteReview } from "../../lib/reviews";
import { useToastStore } from "../../stores/toast";
import BaseButton from "../../components/base/BaseButton.vue";

const toastStore = useToastStore();
const reviews = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);

async function loadReviews() {
  const result = await fetchAllReviewsForAdmin(page.value);
  reviews.value = result.items;
  totalPages.value = result.totalPages;
}

async function handleHide(id: number) {
  await hideReview(id);
  toastStore.push("Reseña ocultada");
  await loadReviews();
}

async function handleUnhide(id: number) {
  await unhideReview(id);
  toastStore.push("Reseña restaurada");
  await loadReviews();
}

async function handleDelete(id: number) {
  await deleteReview(id);
  toastStore.push("Reseña eliminada");
  await loadReviews();
}

function changePage(delta: number) {
  page.value += delta;
  loadReviews();
}

onMounted(loadReviews);
</script>

<template>
  <div class="container admin-reviews">
    <h1>Reseñas</h1>

    <p v-if="!reviews.length" class="admin-reviews__empty">No hay reseñas registradas.</p>

    <article
      v-for="review in reviews"
      :key="review.id"
      :class="['review-row', { 'review-row--hidden': !review.isVisible }]"
    >
      <div class="review-row__meta">
        <p><strong>{{ review.user.name }}</strong> sobre <em>{{ review.product.name }}</em></p>
        <p class="review-row__rating">
          <Icon v-for="n in 5" :key="n" :icon="n <= review.rating ? 'mdi:star' : 'mdi:star-outline'" width="14" />
          <span v-if="!review.isVisible" class="review-row__badge">Oculta</span>
        </p>
      </div>
      <p class="review-row__comment">{{ review.comment }}</p>
      <div class="review-row__actions">
        <BaseButton v-if="review.isVisible" variant="secondary" @click="handleHide(review.id)">
          Ocultar
        </BaseButton>
        <BaseButton v-else variant="secondary" @click="handleUnhide(review.id)">
          Restaurar
        </BaseButton>
        <BaseButton variant="secondary" @click="handleDelete(review.id)">
          Eliminar
        </BaseButton>
      </div>
    </article>

    <div v-if="totalPages > 1" class="admin-reviews__pagination">
      <BaseButton variant="secondary" :disabled="page <= 1" @click="changePage(-1)">Anterior</BaseButton>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <BaseButton variant="secondary" :disabled="page >= totalPages" @click="changePage(1)">Siguiente</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.admin-reviews {
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
  max-width: 640px;
}

.admin-reviews__empty {
  color: var(--steel);
  padding: var(--space-5) 0;
}

.review-row {
  border-bottom: 1px solid var(--line);
  padding: var(--space-3) 0;
}

.review-row--hidden {
  color: var(--steel);
}

.review-row__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
}

.review-row__rating {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--indigo);
}

.review-row__badge {
  font-size: 0.75rem;
  color: var(--alert);
  border: 1px solid var(--alert);
  padding: 0 var(--space-1);
  margin-left: var(--space-1);
}

.review-row__comment {
  margin: var(--space-2) 0;
}

.review-row__actions {
  display: flex;
  gap: var(--space-2);
}

.admin-reviews__pagination {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-4);
}
</style>