<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchOrderHistory } from "../../lib/orders";

const orders = ref<any[]>([]);

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  PAYMENT_REJECTED: "Pago rechazado",
};

onMounted(async () => {
  orders.value = await fetchOrderHistory();
});
</script>

<template>
  <div class="container orders-page">
    <h1>Mis pedidos</h1>

    <p v-if="!orders.length" class="orders-page__empty">
      Aún no has realizado ningún pedido.
    </p>

    <article v-for="order in orders" :key="order.id" class="order-card">
      <header class="order-card__header">
        <div>
          <p class="order-card__id">Pedido #{{ order.id }}</p>
          <p class="order-card__date">{{ new Date(order.createdAt).toLocaleDateString() }}</p>
        </div>
        <span :class="['order-card__status', `order-card__status--${order.status.name.toLowerCase()}`]">
          {{ statusLabels[order.status.name] || order.status.name }}
        </span>
      </header>

      <ul class="order-card__items">
        <li v-for="item in order.items" :key="item.id">
          {{ item.product.name }} × {{ item.quantity }} — ${{ Number(item.unitPrice).toFixed(2) }}
        </li>
      </ul>

      <footer class="order-card__footer">
        <span v-if="order.payment">
          {{ order.payment.method.name }} · Ref. {{ order.payment.dummyReference }}
        </span>
        <span class="order-card__total">${{ Number(order.total).toFixed(2) }}</span>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.orders-page {
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
  max-width: 640px;
}

.orders-page__empty {
  color: var(--steel);
  padding: var(--space-5) 0;
}

.order-card {
  border: 1px solid var(--line);
  padding: var(--space-3);
  margin-bottom: var(--space-3);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--line);
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-2);
}

.order-card__id {
  font-family: var(--font-display);
  font-size: 1.0625rem;
}

.order-card__date {
  font-size: 0.8125rem;
  color: var(--steel);
}

.order-card__status {
  font-size: 0.8125rem;
  padding: 2px var(--space-2);
  border: 1px solid var(--line);
  color: var(--steel);
}

.order-card__status--paid,
.order-card__status--delivered {
  color: var(--indigo);
  border-color: var(--indigo);
}

.order-card__status--payment_rejected,
.order-card__status--cancelled {
  color: var(--alert);
  border-color: var(--alert);
}

.order-card__items {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.9375rem;
  color: var(--steel);
}

.order-card__items li {
  padding: var(--space-1) 0;
}

.order-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--line);
  padding-top: var(--space-2);
  margin-top: var(--space-2);
  font-size: 0.875rem;
}

.order-card__total {
  font-family: var(--font-display);
  font-size: 1.125rem;
  color: var(--ink);
}
</style>