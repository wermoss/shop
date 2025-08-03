<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-20">
      <div class="space-y-4">
        <!-- Main image -->
        <img
          :src="selectedImage || product.image"
          :alt="product.name"
          class="w-full h-auto select-none"
        />

        <!-- Thumbnail gallery with Swiper -->
        <div
          v-if="
            product.additionalImages &&
            (product.additionalImages.length > 0 || product.image)
          "
          class="mt-4 select-none"
        >
          <!-- Gallery navigation wrapper with arrow positioning -->
          <div class="gallery-navigation-wrapper px-12 relative">
            <!-- Swiper container -->
            <swiper
              :modules="[Navigation]"
              :slides-per-view="4"
              :space-between="10"
              :navigation="{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }"
              :breakpoints="{
                // when window width is >= 320px
                320: {
                  slidesPerView: 2,
                  spaceBetween: 8,
                },
                // when window width is >= 480px
                480: {
                  slidesPerView: 3,
                  spaceBetween: 10,
                },
                // when window width is >= 640px
                640: {
                  slidesPerView: 4,
                  spaceBetween: 10,
                },
              }"
              class="thumb-swiper px-10"
            >
              <!-- Main product image thumbnail -->
              <swiper-slide>
                <div
                  class="w-full h-24 cursor-pointer rounded-md overflow-hidden border-2 select-none"
                  :class="
                    selectedImageIndex === -1
                      ? 'border-green-500'
                      : 'border-gray-200'
                  "
                  @click="selectImage(-1)"
                >
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-full object-cover select-none"
                    draggable="false"
                  />
                </div>
              </swiper-slide>

              <!-- Additional images thumbnails -->
              <swiper-slide
                v-for="(img, index) in product.additionalImages"
                :key="index"
              >
                <div
                  class="w-full h-24 cursor-pointer rounded-md overflow-hidden border-2 select-none"
                  :class="
                    selectedImageIndex === index
                      ? 'border-green-500'
                      : 'border-gray-200'
                  "
                  @click="selectImage(index)"
                >
                  <img
                    :src="img"
                    :alt="`${product.name} - zdjęcie ${index + 1}`"
                    class="w-full h-full object-cover select-none"
                    draggable="false"
                  />
                </div>
              </swiper-slide>
            </swiper>

            <!-- Navigation arrows -->
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <h1 class="text-3xl font-bold">{{ product.name }}</h1>
        <p class="text-gray-600 text-lg">{{ product.description }}</p>

        <!-- Cechy produktu -->
        <div
          v-if="product.features && product.features.length > 0"
          class="mt-4"
        >
          <h2 class="text-lg font-semibold mb-2">Cechy produktu:</h2>
          <ul class="space-y-2">
            <li
              v-for="feature in product.features"
              :key="feature.name"
              class="flex items-center"
            >
              <span class="font-medium">{{ feature.name }}:</span>
              <span class="ml-2">{{ feature.value }}</span>
              <!-- Kolorowe kółko, jeśli cecha ma zdefiniowany kolor -->
              <span
                v-if="feature.colorCode"
                class="ml-2 inline-block w-4 h-4 rounded-full"
                :style="{ backgroundColor: feature.colorCode }"
                :title="feature.value"
              ></span>
            </li>
          </ul>
        </div>

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
// Import Swiper components
import { Swiper, SwiperSlide } from "swiper/vue";
// Import Swiper modules
import { Navigation } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const route = useRoute();
const productsStore = useProductsStore();

const product = computed(() => {
  return productsStore.getProduct(Number(route.params.id));
});

// Track the selected image index: -1 for main image, 0+ for additional images
const selectedImageIndex = ref<number>(-1);

// Computed property to get the actual selected image URL
const selectedImage = computed<string | null>(() => {
  if (selectedImageIndex.value === -1 || !product.value) {
    return null; // Main product image
  }

  if (
    product.value.additionalImages &&
    product.value.additionalImages.length > selectedImageIndex.value
  ) {
    return product.value.additionalImages[selectedImageIndex.value];
  }

  return null;
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

// Function to handle image selection by index
const selectImage = (index: number) => {
  selectedImageIndex.value = index;
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

<style scoped>
/* Styling for thumbnail carousel */
.thumb-swiper {
  position: relative;
}

.gallery-navigation-wrapper {
  position: relative;
  width: 100%;
}

:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  width: 30px;
  height: 30px;
  color: white;
  opacity: 0.7;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50px;
  z-index: 10;
}

:deep(.swiper-button-prev) {
  left: 0;
}

:deep(.swiper-button-next) {
  right: 0;
}

:deep(.swiper-button-prev):hover,
:deep(.swiper-button-next):hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.7);
}

:deep(.swiper-button-prev)::after,
:deep(.swiper-button-next)::after {
  font-size: 16px;
  font-weight: bold;
}

/* Prevent any text or image selection */
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
