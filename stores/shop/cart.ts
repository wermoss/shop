import { defineStore } from "pinia";
import type { CartItem, Product } from "~/types/shop";
import { useProductsStore } from "./products";
import discountsData from "../../data/discounts.json";

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  appliedDiscountCode: string | null;
}

export interface CartItemWithDiscount extends CartItem {
  product: Product;
}

// Importujemy progi rabatowe i kody rabatowe z pliku JSON
export const CART_DISCOUNT_TIERS = discountsData.cartDiscountTiers;
export const DISCOUNT_CODES = discountsData.discountCodes;

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
    discountCode: null as string | null,
    appliedDiscountCode: null as string | null,
  }),

  getters: {
    itemsWithDiscounts(): CartItemWithDiscount[] {
      const productsStore = useProductsStore();

      return this.items.map((item) => {
        const product = productsStore.getProduct(item.id);
        return {
          ...item,
          product: product ?? {
            id: item.id,
            name: "Produkt niedostępny",
            price: 0,
            image: "",
            description: "",
            orderLimit: 0,
          },
        };
      });
    },

    // Łączna liczba sztuk w koszyku
    totalQuantity(): number {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    },

    // Rabat ilościowy dla koszyka
    cartDiscount(): number {
      const discountTier = [...CART_DISCOUNT_TIERS]
        .sort((a, b) => b.quantity - a.quantity)
        .find((tier) => this.totalQuantity >= tier.quantity);

      return discountTier?.discount || 0;
    },

    // Sprawdzanie poprawności kodu rabatowego
    discountCodeValid(): boolean {
      if (!this.discountCode) return false;
      return DISCOUNT_CODES.some(
        (code) => code.code.toUpperCase() === this.discountCode?.toUpperCase()
      );
    },

    // Rabat z kodu rabatowego
    codeDiscount(): number {
      if (!this.appliedDiscountCode) return 0;

      const discountCode = DISCOUNT_CODES.find(
        (code) =>
          code.code.toUpperCase() === this.appliedDiscountCode?.toUpperCase()
      );

      return discountCode?.discount || 0;
    },

    // Suma cen przed rabatem
    subtotalPrice(): number {
      return this.itemsWithDiscounts.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
    },

    // Wartość rabatu ilościowego
    cartDiscountAmount(): number {
      const amount = (this.subtotalPrice * this.cartDiscount) / 100;
      return Math.round(amount * 100) / 100;
    },

    // Wartość rabatu z kodu
    codeDiscountAmount(): number {
      const amount = (this.subtotalPrice * this.codeDiscount) / 100;
      return Math.round(amount * 100) / 100;
    },

    // Łączna wartość rabatu
    totalDiscountAmount(): number {
      return this.cartDiscountAmount + this.codeDiscountAmount;
    },

    // Łączny procent rabatu (koszyk + kod)
    totalDiscount(): number {
      return this.cartDiscount + this.codeDiscount;
    },

    // Cena po rabacie
    totalPrice(): number {
      return (
        Math.round((this.subtotalPrice - this.totalDiscountAmount) * 100) / 100
      );
    },
  },

  actions: {
    // Add item to cart
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

    // Remove item from cart
    removeFromCart(productId: number) {
      const index = this.items.findIndex((item) => item.id === productId);
      if (index > -1) {
        this.items.splice(index, 1);
      }
    },

    // Increment quantity
    incrementQuantity(productId: number) {
      const productsStore = useProductsStore();
      const product = productsStore.getProduct(productId);
      const item = this.items.find((item) => item.id === productId);

      if (item && product) {
        // Sprawdź limit zamówienia przed zwiększeniem ilości
        if (item.quantity < product.orderLimit) {
          item.quantity += 1;
        } else {
          // Opcjonalnie: Możesz tu dodać powiadomienie o limicie
          console.warn(
            `Osiągnięto limit zamówienia (${product.orderLimit}) dla produktu ${product.name}`
          );
        }
      }
    },

    // Decrement quantity
    decrementQuantity(productId: number) {
      const item = this.items.find((item) => item.id === productId);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    // Sprawdzenie czy można zmniejszyć ilość
    canDecreaseQuantity(productId: number): boolean {
      const item = this.items.find((item) => item.id === productId);
      return item ? item.quantity > 1 : false;
    },

    // Sprawdzanie dostępności limitu
    canIncreaseQuantity(productId: number): boolean {
      const productsStore = useProductsStore();
      const product = productsStore.getProduct(productId);
      const item = this.items.find((item) => item.id === productId);

      if (!product || !item) return true;

      return item.quantity < product.orderLimit;
    },

    // Pobieranie limitu dla produktu
    getProductLimit(productId: number): number {
      const productsStore = useProductsStore();
      const product = productsStore.getProduct(productId);
      return product?.orderLimit ?? 0;
    },

    // Ustawienie kodu rabatowego tymczasowo przed zastosowaniem
    setDiscountCode(code: string | null) {
      this.discountCode = code;
    },

    // Zastosowanie kodu rabatowego
    applyDiscountCode() {
      if (this.discountCodeValid) {
        this.appliedDiscountCode = this.discountCode;
        this.discountCode = null;
        return true;
      }
      return false;
    },

    // Usunięcie zastosowanego kodu rabatowego
    removeDiscountCode() {
      this.appliedDiscountCode = null;
    },

    // Pobranie informacji o zastosowanym kodzie rabatowym
    getAppliedDiscountInfo() {
      if (!this.appliedDiscountCode) return null;

      return (
        DISCOUNT_CODES.find(
          (code) =>
            code.code.toUpperCase() === this.appliedDiscountCode?.toUpperCase()
        ) || null
      );
    },

    // Clear cart
    clearCart() {
      this.items = [];
      this.discountCode = null;
      this.appliedDiscountCode = null;
    },
  },

  // Konfiguracja persist
  persist: true,
});
