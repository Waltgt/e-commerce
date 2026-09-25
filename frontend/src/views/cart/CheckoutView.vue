<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../../stores/cart";
import { useToastStore } from "../../stores/toast";
import { submitCheckout } from "../../lib/orders";
import BaseButton from "../../components/base/BaseButton.vue";
import BaseInput from "../../components/base/BaseInput.vue";
import { Icon } from "@iconify/vue";

const cartStore = useCartStore();
const toastStore = useToastStore();
const router = useRouter();

const paymentMethod = ref<"CREDIT_CARD" | "PAYPAL" | "CASH">("CREDIT_CARD");
const cardNumber = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

async function handleConfirm() {
  errorMessage.value = "";
  isSubmitting.value = true;
  try {
    const result = await submitCheckout({
      paymentMethod: paymentMethod.value,
      cardNumber:
        paymentMethod.value === "CREDIT_CARD" ? cardNumber.value : undefined,
    });

    if (result.status === "PAYMENT_REJECTED") {
      errorMessage.value =
        "El pago fue rechazado. Verifica los datos e intenta de nuevo.";
      return;
    }

    cartStore.clearLocal();
    toastStore.push("Pedido confirmado");
    router.push("/orders");
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.error?.message || "No se pudo procesar el pedido";
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  if (!cartStore.items.length) {
    cartStore.fetchCart();
  }
});
</script>

<template>
  <div class="container checkout-page">
    <h1>Confirmar pedido</h1>

    <section class="checkout-summary">
      <p
        v-for="item in cartStore.items"
        :key="item.id"
        class="checkout-summary__line"
      >
        <span>{{ item.productName }} × {{ item.quantity }}</span>
        <span>${{ Number(item.subtotal).toFixed(2) }}</span>
      </p>
      <p class="checkout-summary__total">
        <span>Total</span>
        <span>${{ Number(cartStore.total).toFixed(2) }}</span>
      </p>
    </section>

    <section class="checkout-payment">
      <h2>Método de pago</h2>
      <label class="payment-option">
        <input type="radio" value="CREDIT_CARD" v-model="paymentMethod" />
        <Icon icon="mdi:credit-card-outline" width="20" />
        Tarjeta de crédito
      </label>
      <label class="payment-option">
        <input type="radio" value="PAYPAL" v-model="paymentMethod" />
        <Icon icon="logos:paypal" width="20" />
        PayPal
      </label>
      <label class="payment-option">
        <input type="radio" value="CASH" v-model="paymentMethod" />
        <Icon icon="mdi:cash" width="20" />
        Efectivo
      </label>

      <BaseInput
        v-if="paymentMethod === 'CREDIT_CARD'"
        v-model="cardNumber"
        label="Número de tarjeta"
      />

      <p v-if="errorMessage" class="checkout-payment__error">
        {{ errorMessage }}
      </p>

      <BaseButton :disabled="isSubmitting" @click="handleConfirm">
        Confirmar pedido
      </BaseButton>
    </section>
  </div>
</template>

<style scoped>
.checkout-page {
  max-width: 480px;
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
}

.checkout-summary {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: var(--space-3) 0;
  margin: var(--space-4) 0;
}

.checkout-summary__line {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  padding: var(--space-1) 0;
}

.checkout-summary__total {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-display);
  font-size: 1.25rem;
  padding-top: var(--space-2);
}

.checkout-payment h2 {
  margin-bottom: var(--space-3);
}

.payment-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: 0.9375rem;
}

.checkout-payment__error {
  color: var(--alert);
  font-size: 0.875rem;
  margin: var(--space-2) 0;
}
</style>
