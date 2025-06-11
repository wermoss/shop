<template>
  <section
    class="bg-green-100 flex flex-col"
    style="height: calc(100vh - 70px); min-height: 700px; position: relative"
  >
    <div class="container mx-auto flex-grow bg-blue-100 flex flex-col">
      <div class="grid grid-cols-12 flex-grow items-center h-full">
        <div
          class="col-span-3 bg-amber-100 h-full flex flex-col justify-center"
        >
          <div v-if="product && product.slider">
            <p class="font-semibold text-xl">{{ product.slider.title }}</p>
            <p class="text-sm text-gray-600 mb-4">
              {{ product.slider.subtitle }}
            </p>
            <p class="mb-6">
              {{ product.slider.description }}
            </p>
            <p class="font-semibold">{{ formatPrice(product.slider.price) }}</p>
          </div>
        </div>
        <div
          class="col-span-6 relative h-full flex items-center justify-center overflow-hidden"
        >
          <!-- Kontener tła z obrazem -->
          <div class="w-full h-full flex items-center justify-center">
            <img
              :src="product?.slider?.image || '/images/hands1.png'"
              :alt="product?.slider?.title || 'Betonowe dłonie'"
              class="object-contain"
            />
          </div>
        </div>
        <div
          class="col-span-3 bg-amber-100 h-full flex flex-col justify-center"
        >
          <div
            class="flex flex-wrap bg-blue-300"
            v-if="product && product.slider"
          >
            <div
              v-for="feature in product.slider.features"
              :key="feature.name"
              class="w-1/2 p-2"
            >
              {{ feature.name }}<br />{{ feature.value }}
              <div
                v-if="feature.colorCode"
                class="w-4 h-4 inline-block ml-1 rounded-full"
                :style="{ backgroundColor: feature.colorCode }"
              ></div>
            </div>
            <div>Płatności ikony</div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-12 gap-4 py-2 bg-pink-100">
        <div class="col-span-3 flex items-center justify-start">
          <p>A</p>
        </div>
        <div class="col-span-6 flex items-center justify-center">
          <p>social icons</p>
        </div>
        <div class="col-span-3 flex items-center justify-end">
          <button
            class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded"
            @click="addOneToCart"
          >
            Dodaj do koszyka
          </button>
        </div>
      </div>
    </div>
  </section>
  <Fetures />
</template>

<script setup lang="ts">
import { useProductsStore } from "~/stores/shop/products";
import { useCartStore } from "~/stores/shop/cart";
import type { Product } from "~/types/shop";

const productsStore = useProductsStore();
const cartStore = useCartStore();
const product = ref<Product | undefined>(productsStore.getProduct(1)); // Pobieramy produkt o ID = 1

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(price);
};

const getFeatureValue = (name: string): string => {
  if (!product.value?.features) return "";
  const feature = product.value.features.find((f) => f.name === name);
  return feature ? feature.value : "";
};

// Funkcje dla danych ze slidera
const getSliderFeatureValue = (name: string): string => {
  if (!product.value?.slider?.features) return "";
  const feature = product.value.slider.features.find((f) => f.name === name);
  return feature ? feature.value : "";
};

const getSliderFeatureColor = (name: string): string => {
  if (!product.value?.slider?.features) return "";
  const feature = product.value.slider.features.find((f) => f.name === name);
  return feature?.colorCode || "";
};

const addOneToCart = () => {
  if (product.value) {
    cartStore.addToCart(product.value.id, 1); // Dodajemy zawsze 1 produkt
    // Optional: dodaj tutaj notyfikację o dodaniu do koszyka
  }
};
</script>
