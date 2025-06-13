<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-[#EBEBEB] h-[60px] flex items-end relative z-30">
      <nav class="container mx-auto grid grid-cols-12 items-center">
        <div class="col-span-6 lg:col-span-3 flex justify-start">
          <NuxtLink
            to="/shop"
            class="text-black text-3xl font-bold leading-none"
          >
            wermoss</NuxtLink
          >
        </div>

        <div class="col-span-6 hidden lg:flex justify-center text-[14px] gap-6">
          <div class="flex uppercase tracking-[0.2em] group">
            <NuxtLink to="/shop" class="relative overflow-hidden">
              <div class="px-3 mb-1">Sklep</div>
              <div class="relative">
                <!-- Linia zielona - rośnie od lewej do prawej przy najechaniu -->
                <div
                  class="h-[1px] bg-green-700 w-0 group-hover:w-full transition-all duration-300 origin-left"
                ></div>
                <!-- "Zasłona" - rośnie od prawej do lewej przy opuszczeniu -->
                <div
                  class="absolute top-0 right-0 h-[1px] bg-[#EBEBEB] w-full group-hover:w-0 transition-all duration-300 origin-right"
                ></div>
              </div>
            </NuxtLink>
          </div>
          <div class="flex uppercase tracking-[0.2em] group">
            <NuxtLink to="/main" class="relative overflow-hidden">
              <div class="px-3 mb-1">o nas</div>
              <div class="relative">
                <!-- Linia różowa - rośnie od lewej do prawej przy najechaniu -->
                <div
                  class="h-[1px] bg-green-700 w-0 group-hover:w-full transition-all duration-300 origin-left"
                ></div>
                <!-- "Zasłona" - rośnie od prawej do lewej przy opuszczeniu -->
                <div
                  class="absolute top-0 right-0 h-[1px] bg-[#EBEBEB] w-full group-hover:w-0 transition-all duration-300 origin-right"
                ></div>
              </div>
            </NuxtLink>
          </div>
          <div class="flex uppercase tracking-[0.2em] group">
            <NuxtLink to="/main" class="relative overflow-hidden">
              <div class="px-3 mb-1">Kontakt</div>
              <div class="relative">
                <!-- Linia różowa - rośnie od lewej do prawej przy najechaniu -->
                <div
                  class="h-[1px] bg-green-700 w-0 group-hover:w-full transition-all duration-300 origin-left"
                ></div>
                <!-- "Zasłona" - rośnie od prawej do lewej przy opuszczeniu -->
                <div
                  class="absolute top-0 right-0 h-[1px] bg-[#EBEBEB] w-full group-hover:w-0 transition-all duration-300 origin-right"
                ></div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div class="col-span-6 lg:col-span-3 flex justify-end items-center">
          <button
            class="hamburger hamburger--elastic lg:hidden mr-6 relative z-50"
            :class="{ 'is-active': isMobileMenuOpen }"
            type="button"
            @click="toggleMobileMenu"
            aria-label="Menu"
          >
            <span class="hamburger-box">
              <span class="hamburger-inner"></span>
            </span>
          </button>

          <NuxtLink to="/shop/cart" class="text-white relative">
            <span
              v-if="cartItemsCount > 0"
              class="bg-black text-white text-[12px] rounded-full h-6 w-6 flex items-center justify-center"
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

    <!-- Mobilne menu -->
    <MobileMenu :is-open="isMobileMenuOpen" @close="closeMobileMenu" />
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/shop/cart";

const cartStore = useCartStore();

const cartItemsCount = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Kontrola stanu mobilnego menu
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>
