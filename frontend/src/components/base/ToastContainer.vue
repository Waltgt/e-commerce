<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useToastStore } from "../../stores/toast";

const toastStore = useToastStore();
</script>

<template>
  <div class="toast-stack">
    <div
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      :class="['toast', toast.variant]"
    >
      <span>{{ toast.message }}</span>
      <button class="toast__close" @click="toastStore.dismiss(toast.id)">
        <Icon icon="mdi:close" width="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 100;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: white;
  border: 1px solid var(--line);
  border-left: 3px solid var(--indigo);
  padding: var(--space-2) var(--space-3);
  min-width: 240px;
  font-size: 0.9375rem;
}

.toast.error {
  border-left-color: var(--alert);
}

.toast__close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--steel);
  display: flex;
}
</style>