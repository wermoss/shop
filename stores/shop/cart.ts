import { defineStore } from "pinia";
import type { CartItem } from "~/types/shop";
import { useProductsStore } from "./products";

interface CartState {
  items: CartItem[];
}

type CartActions = {
  addToCart(productId: number): boolean;
  removeFromCart(productId: number): void;
  updateQuantity(productId: number, quantity: number): boolean;
  clearCart(): void;
};

export const useCartStore = defineStore<"cart", CartState, {}, CartActions>(
  "cart",
  {
    state: () => ({
      items: [],
    }),

    actions: {
      addToCart(productId: number) {
        const productsStore = useProductsStore();
        const product = productsStore.getProduct(productId);

        if (!product) {
          return false;
        }

        const existingItem = this.items.find((item) => item.id === productId);
        if (existingItem) {
          existingItem.quantity++;
        } else {
          this.items.push({ id: productId, quantity: 1 });
        }
        return true;
      },

      removeFromCart(productId: number) {
        const index = this.items.findIndex((item) => item.id === productId);
        if (index > -1) {
          this.items.splice(index, 1);
        }
      },

      updateQuantity(productId: number, quantity: number) {
        if (quantity < 1) return false;

        const item = this.items.find((item) => item.id === productId);
        if (item) {
          item.quantity = quantity;
          return true;
        }
        return false;
      },

      clearCart() {
        this.items = [];
      },
    },

    persist: true,
  }
);
