import { defineStore } from "pinia";
import type { CartItem, Product } from "~/types/shop";
import { useProductsStore } from "./products";

interface CartState {
  items: CartItem[];
}

export interface CartItemWithDiscount extends CartItem {
  product: Product;
  discount?: number;
  finalPrice?: number; // zmiana z required na optional
}

export const useCartStore = defineStore<
  "cart",
  CartState,
  {
    itemsWithDiscounts: CartItemWithDiscount[];
    totalPrice: number;
  }
>("cart", {
  state: () => ({
    items: [],
  }),

  getters: {
    itemsWithDiscounts(): CartItemWithDiscount[] {
      const productsStore = useProductsStore();

      return this.items.map((item) => {
        const product = productsStore.getProduct(item.id);
        if (!product)
          return { ...item, product, finalPrice: 0 } as CartItemWithDiscount;

        // Znajdź odpowiedni próg zniżki
        const discountTier = [...product.discountTiers]
          .sort((a, b) => b.quantity - a.quantity)
          .find((tier) => item.quantity >= tier.quantity);

        const discount = discountTier?.discount || 0;
        const finalPrice = product.price * (1 - discount / 100);

        return {
          ...item,
          product,
          discount,
          finalPrice,
        };
      });
    },

    totalPrice(): number {
      return this.itemsWithDiscounts.reduce((sum, item) => {
        return sum + item.finalPrice * item.quantity;
      }, 0);
    },
  },

  actions: {
    addToCart(productId: number) {
      const productsStore = useProductsStore();
      const product = productsStore.getProduct(productId);

      if (!product) return false;

      const existingItem = this.items.find((item) => item.id === productId);

      if (existingItem) {
        if (existingItem.quantity >= product.orderLimit) {
          return false;
        }
        existingItem.quantity++;
      } else {
        this.items.push({
          id: productId,
          quantity: 1,
        });
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
      const productsStore = useProductsStore();
      const product = productsStore.getProduct(productId);

      if (!product) return false;

      // Sprawdź czy nowa ilość nie przekracza limitu
      if (quantity > product.orderLimit) {
        quantity = product.orderLimit;
      }

      const item = this.items.find((item) => item.id === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId);
        } else {
          item.quantity = quantity;
        }
      }
      return true;
    },

    clearCart() {
      this.items = [];
    },

    // Nowa metoda do sprawdzania dostępności limitu
    canIncreaseQuantity(productId: number): boolean {
      const productsStore = useProductsStore();
      const product = productsStore.getProduct(productId);
      const item = this.items.find((item) => item.id === productId);

      if (!product || !item) return true;

      return item.quantity < product.orderLimit;
    },

    // Nowa metoda do pobierania limitu dla produktu
    getProductLimit(productId: number): number {
      const productsStore = useProductsStore();
      const product = productsStore.getProduct(productId);
      return product?.orderLimit ?? 0;
    },
  },

  persist: true,
});
