<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import {
  fetchProductById,
  fetchCategories,
  createProduct,
  updateProduct,
  createCategory,
  uploadProductImages,
  deleteProductImage,
  buildImageUrl,
} from "../../lib/products";
import { useToastStore } from "../../stores/toast";
import BaseInput from "../../components/base/BaseInput.vue";
import BaseButton from "../../components/base/BaseButton.vue";

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const productId = route.params.id ? Number(route.params.id) : null;
const isEditMode = computed(() => productId !== null);

const name = ref("");
const description = ref("");
const price = ref("");
const stock = ref("");
const lowStockThreshold = ref("");
const selectedCategoryIds = ref<number[]>([]);
const categories = ref<{ id: number; name: string }[]>([]);
const newCategoryName = ref("");
const imageIds = ref<number[]>([]);
const errorMessage = ref("");
const isSubmitting = ref(false);

async function loadCategories() {
  categories.value = await fetchCategories();
}

async function loadProduct() {
  if (!productId) return;
  const product = await fetchProductById(productId);
  name.value = product.name;
  description.value = product.description;
  price.value = String(product.price);
  stock.value = String(product.stock);
  lowStockThreshold.value = product.lowStockThreshold ? String(product.lowStockThreshold) : "";
  selectedCategoryIds.value = categories.value
    .filter((c) => product.categories.includes(c.name))
    .map((c) => c.id);
  imageIds.value = product.imageIds;
}

async function handleAddCategory() {
  if (!newCategoryName.value.trim()) return;
  try {
    const category = await createCategory(newCategoryName.value.trim());
    categories.value.push(category);
    selectedCategoryIds.value.push(category.id);
    newCategoryName.value = "";
  } catch (err: any) {
    toastStore.push(err.response?.data?.error?.message || "No se pudo crear la categoría", "error");
  }
}

async function handleSubmit() {
  errorMessage.value = "";
  isSubmitting.value = true;

  const payload = {
    name: name.value,
    description: description.value,
    price: Number(price.value),
    stock: Number(stock.value),
    lowStockThreshold: lowStockThreshold.value ? Number(lowStockThreshold.value) : undefined,
    categoryIds: selectedCategoryIds.value,
  };

  try {
    if (isEditMode.value) {
      await updateProduct(productId!, payload);
      toastStore.push("Producto actualizado");
    } else {
      const created = await createProduct(payload);
      toastStore.push("Producto creado");
      router.push(`/admin/products/${created.id}/edit`);
      return;
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error?.message || "No se pudo guardar el producto";
  } finally {
    isSubmitting.value = false;
  }
}

async function handleImageUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files || !files.length || !productId) return;
  try {
    await uploadProductImages(productId, Array.from(files));
    const product = await fetchProductById(productId);
    imageIds.value = product.imageIds;
    toastStore.push("Imagen agregada");
  } catch (err: any) {
    toastStore.push(err.response?.data?.error?.message || "No se pudo subir la imagen", "error");
  }
}

async function handleImageDelete(imageId: number) {
  if (!productId) return;
  await deleteProductImage(productId, imageId);
  imageIds.value = imageIds.value.filter((id) => id !== imageId);
  toastStore.push("Imagen eliminada");
}

onMounted(async () => {
  await loadCategories();
  await loadProduct();
});
</script>

<template>
  <div class="container product-form">
    <h1>{{ isEditMode ? "Editar producto" : "Nuevo producto" }}</h1>

    <form @submit.prevent="handleSubmit" class="product-form__grid">
      <BaseInput v-model="name" label="Nombre" />
      <BaseInput v-model="price" label="Precio" type="number" />
      <BaseInput v-model="stock" label="Stock" type="number" />
      <BaseInput v-model="lowStockThreshold" label="Umbral de stock bajo (opcional)" type="number" />

      <label class="product-form__field product-form__field--full">
        <span>Descripción</span>
        <textarea v-model="description"></textarea>
      </label>

      <div class="product-form__field product-form__field--full">
        <span>Categorías</span>
        <div class="category-list">
          <label v-for="c in categories" :key="c.id" class="category-checkbox">
            <input type="checkbox" :value="c.id" v-model="selectedCategoryIds" />
            {{ c.name }}
          </label>
        </div>
        <div class="category-new">
          <input v-model="newCategoryName" placeholder="Nueva categoría" />
          <BaseButton variant="secondary" type="button" @click="handleAddCategory">Agregar</BaseButton>
        </div>
      </div>

      <p v-if="errorMessage" class="product-form__error product-form__field--full">{{ errorMessage }}</p>

      <div class="product-form__field--full">
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isEditMode ? "Guardar cambios" : "Crear producto" }}
        </BaseButton>
      </div>
    </form>

    <section v-if="isEditMode" class="product-form__images">
      <h2>Imágenes</h2>
      <div class="image-grid">
        <div v-for="id in imageIds" :key="id" class="image-grid__item">
          <img :src="buildImageUrl(productId!, id)" />
          <button @click="handleImageDelete(id)">
            <Icon icon="mdi:close" width="16" />
          </button>
        </div>
      </div>
      <label class="image-upload">
        <Icon icon="mdi:upload-outline" width="20" />
        Subir imagen
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden @change="handleImageUpload" />
      </label>
    </section>
  </div>
</template>

<style scoped>
.product-form {
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
  max-width: 640px;
}

.product-form__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 var(--space-3);
  margin-top: var(--space-4);
}

.product-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
  font-size: 0.875rem;
}

.product-form__field--full {
  grid-column: 1 / -1;
}

.product-form__field textarea {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-2);
  min-height: 100px;
  font-family: inherit;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
}

.category-new {
  display: flex;
  gap: var(--space-2);
}

.category-new input {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-2);
  flex: 1;
}

.product-form__error {
  color: var(--alert);
  font-size: 0.875rem;
}

.product-form__images {
  border-top: 1px solid var(--line);
  padding-top: var(--space-4);
  margin-top: var(--space-4);
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.image-grid__item {
  position: relative;
  width: 96px;
  height: 96px;
}

.image-grid__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-grid__item button {
  position: absolute;
  top: 2px;
  right: 2px;
  background: white;
  border: 1px solid var(--line);
  cursor: pointer;
  display: flex;
}

.image-upload {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px dashed var(--line);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--steel);
}
</style>