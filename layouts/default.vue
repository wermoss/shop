<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-[#EBEBEB] py-4">
      <nav class="container mx-auto px-4 flex justify-between items-center">
        <NuxtLink to="/shop" class="text-black text-2xl font-bold"
          >wermoss</NuxtLink
        >
        <div class="flex gap-4">
          <NuxtLink
            to="/shop"
            class="text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >Sklep</NuxtLink
          >
          <NuxtLink
            to="/shop"
            class="text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >O nas</NuxtLink
          >
          <NuxtLink
            to="/shop"
            class="text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >Kontakt</NuxtLink
          >
          <NuxtLink
            to="/shop/cart"
            class="text-white px-4 py-2 rounded-md hover:bg-gray-700 relative"
          >
            <span
              v-if="cartItemsCount > 0"
              class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartItemsCount }}
            </span>
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
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
