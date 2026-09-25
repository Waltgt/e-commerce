<script setup lang="ts">
defineProps<{
  modelValue: string;
  label: string;
  type?: string;
  error?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <label class="base-input">
    <span class="base-input__label">{{ label }}</span>
    <input
      :type="type || 'text'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="base-input__error">{{ error }}</span>
  </label>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.base-input__label {
  font-size: 0.875rem;
  color: var(--steel);
}

input {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-2);
  background: white;
  color: var(--ink);
}

input:focus {
  border-color: var(--indigo);
}

.base-input__error {
  font-size: 0.8125rem;
  color: var(--alert);
}
</style>