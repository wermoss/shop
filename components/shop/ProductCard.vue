<template>
  <div class="bg-[#EBEBEB] rounded-lg p-10 relative">
    <!-- Discount badge - absolute positioned in top right corner -->
    <div
      v-if="showDiscount"
      class="absolute top-3 right-3 z-10 bg-black text-white px-1.5 py-0.5 text-xs rounded"
    >
      -{{ getTotalDisplayDiscount }}%
    </div>

    <NuxtLink :to="`/shop/product/${product.id}`" class="block">
      <div class="w-full aspect-square rounded-md overflow-hidden p-8">
        <div
          class="w-full h-full bg-center bg-cover transition-transform duration-300 ease-in-out hover:scale-110"
          :style="{ backgroundImage: `url(${product.image})` }"
          :aria-label="product.name"
        ></div>
      </div>
    </NuxtLink>
    <NuxtLink
      :to="`/shop/product/${product.id}`"
      class="block hover:text-green-600 transition-colors"
    >
      <h3 class="text-xl font-semibold mt-4">{{ product.name }}</h3>
    </NuxtLink>

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
          <!-- <span class="ml-1">{{ feature.value }}</span> -->
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
    <div class="flex justify-between items-center">
      <div>
        <div class="space-y-2 mt-4">
          <div class="mt-4">
            <button
              @click="addToCart"
              :disabled="!canAddToCart"
              class="w-full bg-black text-white px-10 py-3 rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ addToCartButtonText }}
            </button>
          </div>
          <div v-if="isLimitReached" class="mt-2 text-sm text-red-600">
            Osiągnięto limit {{ product.orderLimit }} szt.
          </div>
        </div>
      </div>
      <div>
        <div class="my-3">
          <!-- Show either discounted price or normal price -->
          <p class="text-2xl font-bold text-gray-900">
            {{
              showDiscount
                ? formatPrice(discountedPrice)
                : formatPrice(product.price)
            }}
          </p>
        </div>
      </div>
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

  // Get quantity of this product in cart
  const cartItem = cartStore.items.find((item) => item.id === props.product.id);
  const productQuantityInCart = cartItem ? cartItem.quantity : 0;

  // Otherwise see if there's a cart discount based on quantity
  const discountTier = CART_DISCOUNT_TIERS.sort(
    (a: any, b: any) => b.quantity - a.quantity
  ).find((tier: any) => productQuantityInCart >= tier.quantity);

  // Also check the general cart discount which applies based on total items
  const cartDiscountValue = cartStore.cartDiscount;

  // Return the higher discount (product-specific custom discount or cart discount)
  return Math.max(discountTier?.discount || 0, cartDiscountValue || 0);
});

// Show discount if there's any discount percentage to apply (either quantity-based or coupon-based)
const showDiscount = computed(
  () =>
    getDiscountPercent.value > 0 ||
    (cartStore.appliedDiscountCode && cartStore.codeDiscount > 0)
);

// Calculate the total combined discount for display
const getTotalDisplayDiscount = computed(() => {
  let totalDiscount = getDiscountPercent.value;

  if (cartStore.appliedDiscountCode) {
    totalDiscount += cartStore.codeDiscount;
  }

  return totalDiscount;
});

// Calculate discounted price
const discountedPrice = computed(() => {
  const price = props.product.price;

  // Get the quantity-based discount
  let quantityDiscountPercent = getDiscountPercent.value;

  // Get the coupon-based discount
  let couponDiscountPercent = 0;
  if (cartStore.appliedDiscountCode) {
    couponDiscountPercent = cartStore.codeDiscount;
  }

  // Calculate the total discount percentage (both discounts apply)
  const totalDiscountPercent = quantityDiscountPercent + couponDiscountPercent;

  const discountMultiplier = 1 - totalDiscountPercent / 100;
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
