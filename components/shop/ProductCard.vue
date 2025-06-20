<template>
  <div class="border border-gray-200 rounded-lg p-4 max-w-sm">
    <img
      :src="product.image"
      :alt="product.name"
      class="w-full h-48 object-cover rounded-md"
    />
    <h3 class="text-xl font-semibold mt-4">{{ product.name }}</h3>

    <!-- Cechy produktu -->
    <div
      v-if="product.features && product.features.length > 0"
      class="mt-3 mb-3"
    >
      <div class="flex flex-wrap gap-2">
        <div
          v-for="feature in product.features"
          :key="feature.name"
          class="inline-flex items-center text-sm text-gray-700"
        >
          <span class="font-medium">{{ feature.name }}:</span>
          <span class="ml-1">{{ feature.value }}</span>
          <!-- Kolorowe kółko dla cech z kolorem -->
          <span
            v-if="feature.colorCode"
            class="ml-1 inline-block w-3 h-3 rounded-full border border-gray-300"
            :style="{ backgroundColor: feature.colorCode }"
            :title="feature.value"
          ></span>
        </div>
      </div>
    </div>

    <div class="my-3">
      <!-- If there's a quantity discount available, show original and discounted price -->
      <div v-if="showDiscount" class="flex flex-col">
        <div class="flex items-center">
          <span class="text-lg text-gray-400 line-through mr-2">{{
            formatPrice(product.price)
          }}</span>
          <span class="bg-black text-white px-1.5 py-0.5 text-xs rounded"
            >-{{ getDiscountPercent }}%</span
          >
        </div>
        <p class="text-2xl font-bold text-gray-900 mt-1">
          {{ formatPrice(discountedPrice) }}
        </p>
      </div>
      <!-- Otherwise just show the normal price -->
      <p v-else class="text-2xl font-bold text-gray-900">
        {{ formatPrice(product.price) }}
      </p>
    </div>
    <div class="space-y-2 mt-4">
      <div class="mt-4">
        <button
          @click="addToCart"
          :disabled="!canAddToCart"
          class="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ addToCartButtonText }}
        </button>
      </div>
      <div v-if="isLimitReached" class="mt-2 text-sm text-red-600">
        Osiągnięto limit {{ product.orderLimit }} szt.
      </div>
      <NuxtLink
        :to="`/shop/product/${product.id}`"
        class="block w-full py-2 px-4 text-center border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Zobacz szczegóły
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types/shop";
import { useCartStore } from "~/stores/shop/cart";

const props = defineProps<{
  product: Product;
}>();

const cartStore = useCartStore();
const isAddingToCart = ref(false);

const isLimitReached = computed(() => {
  const cartItem = cartStore.items.find((item) => item.id === props.product.id);
  return cartItem && cartItem.quantity >= props.product.orderLimit;
});

// Przycisk jest aktywny, gdy nie osiągnięto limitu i nie trwa dodawanie do koszyka
const canAddToCart = computed(
  () => !isLimitReached.value && !isAddingToCart.value
);

const addToCartButtonText = computed(() => {
  if (isLimitReached.value) {
    return `Limit: ${props.product.orderLimit} szt.`;
  }
  if (isAddingToCart.value) {
    return "Dodano";
  }
  return "Dodaj do koszyka";
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

// Import discount tiers
import { CART_DISCOUNT_TIERS } from "~/stores/shop/cart";

// Compute discount information
const getDiscountPercent = computed(() => {
  // Check if the product has a custom discount in the metadata
  // This is for products that might have their own specific discount
  const customDiscount = props.product.features?.find(
    (f) => f.name === "Rabat"
  )?.value;
  if (customDiscount) {
    const discountValue = parseInt(customDiscount);
    if (!isNaN(discountValue)) return discountValue;
  }

  // Otherwise see if there's a cart discount based on quantity
  const discountTier = CART_DISCOUNT_TIERS.sort(
    (a: any, b: any) => b.quantity - a.quantity
  ).find((tier: any) => 1 >= tier.quantity); // Assume minimum 1 item

  return discountTier?.discount || 0;
});

// Show discount if there's any discount percentage to apply
const showDiscount = computed(() => getDiscountPercent.value > 0);

// Calculate discounted price
const discountedPrice = computed(() => {
  const price = props.product.price;
  const discountMultiplier = 1 - getDiscountPercent.value / 100;
  return price * discountMultiplier;
});

const addToCart = () => {
  if (!isLimitReached.value && !isAddingToCart.value) {
    cartStore.addToCart(props.product.id);

    // Ustaw stan dodawania i zresetuj go po 3 sekundach
    isAddingToCart.value = true;
    setTimeout(() => {
      isAddingToCart.value = false;
    }, 3000);
  }
};
</script>
