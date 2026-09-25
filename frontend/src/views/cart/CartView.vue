<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { useCartStore } from "../../stores/cart";
import { useToastStore } from "../../stores/toast";
import BaseButton from "../../components/base/BaseButton.vue";

const cartStore = useCartStore();
const toastStore = useToastStore();
const router = useRouter();

async function handleQuantityChange(productId: number, event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (value < 1) return;
  try {
    await cartStore.updateItem(productId, value);
  } catch (err: any) {
    toastStore.push(err.response?.data?.error?.message || "No se pudo actualizar la cantidad", "error");
    await cartStore.fetchCart();
  }
}

async function handleRemove(productId: number) {
  await cartStore.removeItem(productId);
  toastStore.push("Producto eliminado del carrito");
}

function goToCheckout() {
  router.push("/checkout");
}

onMounted(() => {
  cartStore.fetchCart();
});
</script>

<template>
  <div class="container cart-page">
    <h1>Carrito</h1>

    <p v-if="!cartStore.items.length" class="cart-page__empty">
      Tu carrito está vacío. Explora el catálogo para agregar productos.
    </p>

    <template v-else>
      <table class="cart-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartStore.items" :key="item.id" :class="{ 'cart-table__row--unavailable': !item.available }">
            <td>
              {{ item.productName }}
              <p v-if="!item.available" class="cart-table__warning">
                <Icon icon="mdi:alert-circle-outline" width="16" />
                No disponible en la cantidad solicitada
              </p>
            </td>
            <td>${{ Number(item.unitPrice).toFixed(2) }}</td>
            <td>
              <input
                type="number"
                min="1"
                :max="item.availableStock"
                :value="item.quantity"
                @change="handleQuantityChange(item.productId, $event)"
              />
            </td>
            <td>${{ Number(item.subtotal).toFixed(2) }}</td>
            <td>
              <button class="cart-table__remove" @click="handleRemove(item.productId)">
                <Icon icon="mdi:trash-can-outline" width="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="cart-page__summary">
        <p class="cart-page__total">Total: ${{ Number(cartStore.total).toFixed(2) }}</p>
        <p v-if="!cartStore.canCheckout" class="cart-page__warning">
          Ajusta o elimina los productos no disponibles antes de continuar.
        </p>
        <BaseButton :disabled="!cartStore.canCheckout" @click="goToCheckout">
          Continuar al pago
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart-page {
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
}

.cart-page__empty {
  color: var(--steel);
  padding: var(--space-5) 0;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--space-4);
}

.cart-table th {
  text-align: left;
  font-size: 0.8125rem;
  color: var(--steel);
  font-weight: 500;
  border-bottom: 1px solid var(--line);
  padding-bottom: var(--space-2);
}

.cart-table td {
  padding: var(--space-3) var(--space-2) var(--space-3) 0;
  border-bottom: 1px solid var(--line);
}

.cart-table__row--unavailable {
  color: var(--steel);
}

.cart-table__warning {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--alert);
  font-size: 0.8125rem;
  margin-top: var(--space-1);
}

.cart-table input {
  width: 64px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-1);
}

.cart-table__remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--steel);
  display: flex;
}

.cart-table__remove:hover {
  color: var(--alert);
}

.cart-page__summary {
  margin-top: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.cart-page__total {
  font-family: var(--font-display);
  font-size: 1.5rem;
}

.cart-page__warning {
  color: var(--alert);
  font-size: 0.875rem;
}
</style>