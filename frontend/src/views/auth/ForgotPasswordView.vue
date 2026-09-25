<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import BaseInput from "../../components/base/BaseInput.vue";
import BaseButton from "../../components/base/BaseButton.vue";

const authStore = useAuthStore();
const email = ref("");
const isSubmitted = ref(false);
const isLoading = ref(false);

async function handleSubmit() {
  isLoading.value = true;
  await authStore.requestPasswordReset(email.value);
  isSubmitted.value = true;
  isLoading.value = false;
}
</script>

<template>
  <div class="container auth-page">
    <h1>Recuperar contraseña</h1>
    <p v-if="isSubmitted">
      Si el correo existe en el sistema, se envió un enlace para restablecer la contraseña.
    </p>
    <form v-else @submit.prevent="handleSubmit">
      <BaseInput v-model="email" label="Correo electrónico" type="email" />
      <BaseButton type="submit" :disabled="isLoading">Enviar enlace</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.auth-page {
  max-width: 360px;
  padding-top: var(--space-6);
}
</style>