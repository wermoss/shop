import { defineStore } from "pinia";
import type { Product } from "~/types/shop";
import productsData from "~/data/products.json";

interface ProductsState {
  products: Product[];
}

export const useProductsStore = defineStore("products", {
  state: (): ProductsState => ({
    products: productsData.products,
  }),

  actions: {
    getProduct(productId: number) {
      return this.products.find((p) => p.id === productId);
    },
  },
});
