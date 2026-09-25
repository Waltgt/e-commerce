<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import BaseInput from "../../components/base/BaseInput.vue";
import BaseButton from "../../components/base/BaseButton.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const newPassword = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const token = route.query.token as string;

async function handleSubmit() {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    await authStore.confirmPasswordReset(token, newPassword.value);
    router.push("/login");
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error?.message || "No se pudo restablecer la contraseña";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container auth-page">
    <h1>Nueva contraseña</h1>
    <form v-if="token" @submit.prevent="handleSubmit">
      <BaseInput v-model="newPassword" label="Nueva contraseña" type="password" />
      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      <BaseButton type="submit" :disabled="isLoading">Guardar</BaseButton>
    </form>
    <p v-else class="form-error">El enlace no incluye un token válido.</p>
  </div>
</template>

<style scoped>
.auth-page {
  max-width: 360px;
  padding-top: var(--space-6);
}

.form-error {
  color: var(--alert);
  font-size: 0.875rem;
}
</style>