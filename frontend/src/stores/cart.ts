import { defineStore } from "pinia";
import { api } from "../lib/api";

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  available: boolean;
  availableStock: number;
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
    total: 0,
    canCheckout: false,
  }),

  actions: {
    async fetchCart() {
      const { data } = await api.get("/cart");
      this.items = data.data.items;
      this.total = data.data.total;
      this.canCheckout = data.data.canCheckout;
    },

    async addItem(productId: number, quantity: number) {
      const { data } = await api.post("/cart/items", { productId, quantity });
      this.items = data.data.items;
      this.total = data.data.total;
      this.canCheckout = data.data.canCheckout;
    },

    async updateItem(productId: number, quantity: number) {
      const { data } = await api.put(`/cart/items/${productId}`, { quantity });
      this.items = data.data.items;
      this.total = data.data.total;
      this.canCheckout = data.data.canCheckout;
    },

    async removeItem(productId: number) {
      const { data } = await api.delete(`/cart/items/${productId}`);
      this.items = data.data.items;
      this.total = data.data.total;
      this.canCheckout = data.data.canCheckout;
    },

    clearLocal() {
      this.items = [];
      this.total = 0;
      this.canCheckout = false;
    },
  },
});