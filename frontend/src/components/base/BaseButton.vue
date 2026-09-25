<script setup lang="ts">
defineProps<{
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    :class="['base-button', variant || 'primary']"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  border: 1px solid var(--indigo);
  border-radius: var(--radius);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.base-button.primary {
  background: var(--indigo);
  color: var(--paper);
}

.base-button.primary:hover:not(:disabled) {
  background: #1F3B5F;
}

.base-button.secondary {
  background: transparent;
  color: var(--indigo);
}

.base-button.secondary:hover:not(:disabled) {
  background: var(--line);
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>