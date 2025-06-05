<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
      <div class="space-y-6">
        <h1 class="text-3xl font-bold">{{ product.name }}</h1>
        <p class="text-gray-600 text-lg">{{ product.description }}</p>
        <p class="text-2xl font-bold">{{ formatPrice(product.price) }}</p>
        <div class="space-y-4">
          <div class="mt-8">
            <div class="flex items-center gap-4">
              <div class="flex items-center border rounded-md">
                <button
                  @click="decreaseQuantity"
                  class="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  :disabled="quantity <= 1"
                >
                  -
                </button>
                <span class="px-4 py-2 border-x">{{ quantity }}</span>
                <button
                  @click="increaseQuantity"
                  class="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  :disabled="quantity >= product.orderLimit"
                >
                  +
                </button>
              </div>
              <button
                @click="addToCart"
                :disabled="!canAddToCart"
                class="flex-1 bg-green-500 text-white px-8 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ addToCartButtonText }}
              </button>
            </div>
            <p v-if="isLimitReached" class="mt-2 text-sm text-red-600">
              Osiągnięto limit {{ product.orderLimit }} szt.
            </p>
            <p v-else class="mt-2 text-sm text-gray-500">
              Maksymalny limit zamówienia: {{ product.orderLimit }} szt.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12">
      <p class="text-xl text-gray-600">Produkt nie został znaleziony</p>
      <NuxtLink
        to="/shop"
        class="inline-block mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Wróć do sklepu
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/shop/cart";
import { useProductsStore } from "~/stores/shop/products";

const route = useRoute();
const productsStore = useProductsStore();

const product = computed(() => {
  return productsStore.getProduct(Number(route.params.id));
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const quantity = ref(1);
const cartStore = useCartStore();
const isAddingToCart = ref(false);

const isLimitReached = computed(() => {
  const cartItem = cartStore.items.find(
    (item) => item.id === product.value?.id
  );
  const currentInCart = cartItem?.quantity || 0;
  return currentInCart + quantity.value > (product.value?.orderLimit || 0);
});

const canAddToCart = computed(() => {
  return product.value && !isLimitReached.value && !isAddingToCart.value;
});

const addToCartButtonText = computed(() => {
  if (!product.value) return "Dodaj do koszyka";
  if (isLimitReached.value) {
    return `Limit: ${product.value.orderLimit} szt.`;
  }
  if (isAddingToCart.value) {
    return "Dodano";
  }
  return "Dodaj do koszyka";
});

const increaseQuantity = () => {
  if (product.value && quantity.value < product.value.orderLimit) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const addToCart = () => {
  if (product.value && !isLimitReached.value && !isAddingToCart.value) {
    for (let i = 0; i < quantity.value; i++) {
      const success = cartStore.addToCart(product.value.id);
      if (!success) break;
    }
    quantity.value = 1;

    // Ustaw stan dodawania i zresetuj go po 3 sekundach
    isAddingToCart.value = true;
    setTimeout(() => {
      isAddingToCart.value = false;
    }, 3000);
  }
};
</script>
