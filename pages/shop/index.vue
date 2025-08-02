<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
  <Features />
  <About />
</template>

<script setup lang="ts">
import ProductCard from "~/components/shop/ProductCard.vue";
import Features from "~/components/shop/Features.vue";
import About from "~/components/AboutMe.vue";
import { useProductsStore } from "~/stores/shop/products";

const productsStore = useProductsStore();
const products = computed(() => productsStore.products);
</script>
