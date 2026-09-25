<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import BaseInput from "../../components/base/BaseInput.vue";
import BaseButton from "../../components/base/BaseButton.vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

async function handleSubmit() {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push("/");
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error?.message || "No se pudo iniciar sesión";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container auth-page">
    <h1>Iniciar sesión</h1>
    <form @submit.prevent="handleSubmit">
      <BaseInput v-model="email" label="Correo electrónico" type="email" />
      <BaseInput v-model="password" label="Contraseña" type="password" />
      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      <BaseButton type="submit" :disabled="isLoading">Entrar</BaseButton>
    </form>
    <p class="auth-links">
      <router-link to="/forgot-password">Olvidé mi contraseña</router-link>
      ·
      <router-link to="/register">Crear una cuenta</router-link>
    </p>
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
  margin-bottom: var(--space-3);
}

.auth-links {
  margin-top: var(--space-4);
  font-size: 0.875rem;
  color: var(--steel);
}
</style>