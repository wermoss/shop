<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-gray-800 py-4">
      <nav class="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <NuxtLink to="/shop" class="text-white text-2xl font-bold"
          >NuxtShop</NuxtLink
        >
        <div class="flex gap-4">
          <NuxtLink
            to="/shop"
            class="text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >Sklep</NuxtLink
          >
          <NuxtLink
            to="/shop/cart"
            class="text-white px-4 py-2 rounded-md hover:bg-gray-700 relative"
          >
            Koszyk
            <span
              v-if="cartItemsCount > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartItemsCount }}
            </span>
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/shop/cart";

const cartStore = useCartStore();

const cartItemsCount = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + item.quantity, 0);
});
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}
</style>
