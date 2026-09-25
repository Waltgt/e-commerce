<script setup lang="ts">
import { useAuthStore } from "./stores/auth";
import ToastContainer from "./components/base/ToastContainer.vue";

const authStore = useAuthStore();


</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <router-link to="/" class="site-header__brand">Sistema E-Commerce</router-link>
      <nav class="site-header__nav">
        <router-link to="/cart">Carrito</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/orders">Pedidos</router-link>
        <router-link v-if="authStore.isAdmin" to="/admin/products">Admin</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/login">Entrar</router-link>
        <a v-else href="#" @click.prevent="authStore.logout()">Salir</a>
      </nav>
    </div>
  </header>
  <router-view />
  <ToastContainer />
</template>

<style scoped>
.site-header {
  border-bottom: 1px solid var(--line);
  background: white;
}

.site-header__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
}

.site-header__brand {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--ink);
}

.site-header__nav {
  display: flex;
  gap: var(--space-4);
  font-size: 0.9375rem;
}
</style>