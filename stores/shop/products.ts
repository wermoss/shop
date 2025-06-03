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
    async updateStock(productId: number, quantity: number) {
      const product = this.products.find((p) => p.id === productId);
      if (product) {
        try {
          // Wywołaj API aby zaktualizować stan w pliku
          const response = await fetch("/api/products/update-stock", {
            method: "POST",
            body: JSON.stringify({ productId, quantity }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to update stock");
          }

          // Aktualizuj stan w store
          product.stock -= quantity;
          if (product.stock < 0) product.stock = 0;
        } catch (error) {
          console.error("Error updating stock:", error);
          throw error;
        }
      }
    },

    getProduct(productId: number) {
      return this.products.find((p) => p.id === productId);
    },

    // Dodana metoda do odświeżania stanu produktów
    async fetchProducts() {
      try {
        // Załaduj świeże dane z pliku
        const response = await fetch("/data/products.json");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        this.products = data.products;
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback do danych z importu jeśli fetch się nie powiedzie
        this.products = productsData.products;
      }
    },
  },
});
