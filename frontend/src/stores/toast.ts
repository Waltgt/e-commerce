import { defineStore } from "pinia";

interface Toast {
  id: number;
  message: string;
  variant: "success" | "error";
}

let nextId = 1;

export const useToastStore = defineStore("toast", {
  state: () => ({
    toasts: [] as Toast[],
  }),

  actions: {
    push(message: string, variant: "success" | "error" = "success") {
      const id = nextId++;
      this.toasts.push({ id, message, variant });
      setTimeout(() => this.dismiss(id), 3500);
    },

    dismiss(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
  },
});