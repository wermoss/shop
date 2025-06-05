import { defineStore } from "pinia";
import type { CartItem, Product } from "~/types/shop";
import { useProductsStore } from "./products";
import discountsData from "../../data/discounts.json";

interface CartState {
  items: CartItem[];
}

export interface CartItemWithDiscount extends CartItem {
  product: Product;
}

// Importujemy progi rabatowe z pliku JSON
export const CART_DISCOUNT_TIERS = discountsData.cartDiscountTiers;

export const useCartStore = defineStore<
  "cart",
  CartState,
  {
    itemsWithDiscounts: CartItemWithDiscount[];
    totalQuantity: number; // Nowy getter - łączna liczba sztuk w koszyku
    cartDiscount: number; // Nowy getter - obliczony rabat dla koszyka
    subtotalPrice: number; // Nowy getter - cena przed rabatem
    totalPrice: number; // Zaktualizowany getter - cena po rabacie
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
        if (!product) return { ...item, product } as CartItemWithDiscount;

        // Zwracamy element bez rabatu per produkt
        return {
          ...item,
          product,
        };
      });
    },

    // Nowy getter - łączna liczba sztuk w koszyku
    totalQuantity(): number {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    },

    // Nowy getter - obliczanie rabatu dla całego koszyka
    cartDiscount(): number {
      // Znajdź odpowiedni próg rabatowy dla koszyka
      const discountTier = [...CART_DISCOUNT_TIERS]
        .sort((a, b) => b.quantity - a.quantity)
        .find((tier) => this.totalQuantity >= tier.quantity);

      return discountTier?.discount || 0;
    },

    // Nowy getter - suma cen przed rabatem
    subtotalPrice(): number {
      return this.itemsWithDiscounts.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
    },

    // Zaktualizowany getter - cena po rabacie
    totalPrice(): number {
      return this.subtotalPrice * (1 - this.cartDiscount / 100);
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

  // Uproszczona konfiguracja persist
  persist: true,
});
