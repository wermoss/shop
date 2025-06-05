<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Koszyk</h1>
    <div
      v-if="cartItems.length > 0"
      class="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <!-- Lewa kolumna - lista produktów -->
      <div class="lg:col-span-2">
        <!-- Informacja o brakujących produktach do pierwszego progu rabatowego -->
        <div
          v-if="cartStore.totalQuantity < firstDiscountTier.quantity"
          class="mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500"
        >
          <p class="text-yellow-700">
            <span class="font-semibold"
              >Dodaj jeszcze {{ productsMissingForDiscount }}
              {{
                productsMissingForDiscount === 1
                  ? "produkt"
                  : productsMissingForDiscount < 5
                  ? "produkty"
                  : "produktów"
              }}
              do koszyka</span
            >
            aby otrzymać rabat {{ firstDiscountTier.discount }}%!
          </p>
        </div>

        <!-- Informacja o osiągniętym pierwszym progu rabatowym -->
        <div
          v-else-if="
            cartStore.cartDiscount === firstDiscountTier.discount &&
            cartStore.totalQuantity < secondDiscountTier.quantity
          "
          class="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500"
        >
          <p class="text-green-700 font-semibold">
            Gratulacje! Otrzymujesz rabat {{ firstDiscountTier.discount }}% na
            całe zamówienie!
          </p>
        </div>

        <!-- Informacja o osiągniętym drugim progu rabatowym -->
        <div
          v-else-if="
            cartStore.cartDiscount === secondDiscountTier.discount &&
            cartStore.totalQuantity < thirdDiscountTier.quantity
          "
          class="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500"
        >
          <p class="text-green-700 font-semibold">
            Całkiem spore zamówienie! Twój rabat właśnie wzrósł do
            {{ secondDiscountTier.discount }}% na całe zamówienie!
          </p>
        </div>

        <!-- Informacja o osiągniętym trzecim progu rabatowym -->
        <div
          v-else-if="cartStore.cartDiscount === thirdDiscountTier.discount"
          class="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500"
        >
          <p class="text-green-700 font-semibold">
            Wow, chyba zamierzasz handlować łapami. Teraz Twój rabat wynosi
            {{ thirdDiscountTier.discount }}%!
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <img
              :src="item.product.image"
              :alt="item.product.name"
              class="w-24 h-24 object-cover rounded-md"
            />
            <div class="flex-1">
              <h3 class="text-xl font-semibold">{{ item.product.name }}</h3>

              <!-- Dodanie cech produktu -->
              <div
                v-if="item.product.features && item.product.features.length > 0"
                class="mt-1 mb-2"
              >
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="feature in item.product.features"
                    :key="feature.name"
                    class="inline-flex items-center text-xs text-gray-600"
                  >
                    <span class="font-medium">{{ feature.name }}:</span>
                    <span class="ml-1">{{ feature.value }}</span>
                    <!-- Kolorowe kółko dla cech z kolorem -->
                    <span
                      v-if="feature.colorCode"
                      class="ml-1 inline-block w-2 h-2 rounded-full border border-gray-300"
                      :style="{ backgroundColor: feature.colorCode }"
                      :title="feature.value"
                    ></span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <p class="text-lg">
                  {{ formatPrice(item.product.price) }} / szt.
                </p>
                <p class="text-sm text-gray-600">
                  Suma:
                  {{ formatPrice(item.product.price * item.quantity) }}
                </p>
              </div>
              <div class="flex items-center gap-4 mt-2">
                <div class="flex items-center space-x-2">
                  <button
                    @click="decreaseQuantity(item.id)"
                    class="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    -
                  </button>
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  <button
                    @click="increaseQuantity(item.id)"
                    class="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                    :disabled="!canIncreaseQuantity(item.id)"
                  >
                    +
                  </button>
                  <div
                    v-if="isLimitReached(item.id)"
                    class="text-sm text-red-600 ml-2"
                  >
                    Max: {{ getProductLimit(item.id) }}
                  </div>
                </div>
              </div>
            </div>
            <button
              @click="removeFromCart(item.id)"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              x
            </button>
          </div>
        </div>
      </div>

      <!-- Prawa kolumna - podsumowanie koszyka -->
      <div class="lg:col-span-1">
        <div class="bg-gray-50 rounded-lg p-6 sticky top-4">
          <h2 class="text-xl font-semibold mb-4">Podsumowanie</h2>

          <div class="flex justify-between items-center mb-2">
            <span>Liczba produktów:</span>
            <span class="font-semibold"
              >{{ cartStore.totalQuantity }} szt.</span
            >
          </div>

          <div class="flex justify-between items-center mb-2">
            <span>Wartość przed rabatem:</span>
            <span>{{ formatPrice(cartStore.subtotalPrice) }}</span>
          </div>

          <div
            v-if="cartStore.cartDiscount > 0"
            class="flex justify-between items-center text-green-600 mb-2"
          >
            <span>Rabat {{ cartStore.cartDiscount }}%:</span>
            <span class="font-semibold">-{{ formatPrice(discountValue) }}</span>
          </div>

          <div
            class="flex justify-between items-center text-xl font-bold border-t border-gray-300 pt-2 mt-2"
          >
            <span>Do zapłaty:</span>
            <span>{{ formatPrice(totalPrice) }}</span>
          </div>

          <!-- Informacja o progach rabatowych -->
          <div class="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold mb-2">Dostępne progi rabatowe:</h3>
            <ul class="space-y-1">
              <li
                v-for="tier in cartDiscountTiers"
                :key="tier.quantity"
                :class="{
                  'text-green-600 font-semibold':
                    cartStore.totalQuantity >= tier.quantity,
                }"
              >
                <span
                  >{{ tier.quantity }}+ produktów: -{{ tier.discount }}%
                  rabatu</span
                >
                <span v-if="cartStore.totalQuantity >= tier.quantity">
                  (aktywny)</span
                >
              </li>
            </ul>
          </div>

          <div class="mt-6">
            <button
              @click="proceedToCheckout"
              class="w-full py-3 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Przejdź do płatności
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Komunikat o pustym koszyku -->
    <div v-else class="text-center py-12">
      <p class="text-xl text-gray-600">Twój koszyk jest pusty</p>
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
import { useCartStore, CART_DISCOUNT_TIERS } from "~/stores/shop/cart";
import { useProductsStore } from "~/stores/shop/products";
import { useRouter } from "vue-router";

const router = useRouter();
const cartStore = useCartStore();
const productsStore = useProductsStore();

const cartItems = computed(() => cartStore.itemsWithDiscounts);
const totalPrice = computed(() => cartStore.totalPrice);
const cartDiscountTiers = computed(() =>
  [...CART_DISCOUNT_TIERS].sort((a, b) => a.quantity - b.quantity)
);

// Obliczenie konkretnej wartości rabatu
const discountValue = computed(() => {
  return cartStore.subtotalPrice - cartStore.totalPrice;
});

// Pierwszy próg rabatowy (najniższy)
const firstDiscountTier = computed(() => {
  return [...CART_DISCOUNT_TIERS].sort((a, b) => a.quantity - b.quantity)[0];
});

// Drugi próg rabatowy (środkowy)
const secondDiscountTier = computed(() => {
  return [...CART_DISCOUNT_TIERS].sort((a, b) => a.quantity - b.quantity)[1];
});

// Trzeci próg rabatowy (najwyższy)
const thirdDiscountTier = computed(() => {
  return [...CART_DISCOUNT_TIERS].sort((a, b) => a.quantity - b.quantity)[2];
});

// Obliczenie ile produktów brakuje do pierwszego progu rabatowego
const productsMissingForDiscount = computed(() => {
  return firstDiscountTier.value.quantity - cartStore.totalQuantity;
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
};

const updateQuantity = (productId: number, quantity: number) => {
  cartStore.updateQuantity(productId, quantity);
};

const removeFromCart = (productId: number) => {
  cartStore.removeFromCart(productId);
};

const proceedToCheckout = () => {
  router.push("/shop/checkout");
};

const isLimitReached = (productId: number) => {
  const item = cartItems.value.find((item) => item.id === productId);
  const product = item?.product;
  if (!item || !product) return false;
  return item.quantity >= product.orderLimit;
};

const canIncreaseQuantity = (productId: number) => {
  return !isLimitReached(productId);
};

const getProductLimit = (productId: number) => {
  const item = cartItems.value.find((item) => item.id === productId);
  return item?.product.orderLimit ?? 0;
};

const increaseQuantity = (productId: number) => {
  if (!isLimitReached(productId)) {
    cartStore.addToCart(productId);
  }
};

const decreaseQuantity = (productId: number) => {
  const item = cartStore.items.find((item) => item.id === productId);
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(productId, item.quantity - 1);
  } else {
    cartStore.removeFromCart(productId);
  }
};
</script>

<style scoped>
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 1rem;
}

.cart-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.cart-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
  margin: 0 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-controls button {
  padding: 0.5rem 1rem;
}

.remove-button {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cart-summary {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.checkout-button,
.continue-shopping {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #2ecc71;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 1rem;
}

.empty-cart {
  text-align: center;
  padding: 2rem;
}
</style>
