<template>
  <section
    class="bg-[#EBEBEB] flex flex-col"
    style="height: calc(100svh - 70px); min-height: 700px; position: relative"
  >
    <div class="container mx-auto flex-grow flex flex-col">
      <swiper
        :modules="[Pagination]"
        :pagination="{
          clickable: true,
          el: '.swiper-pagination',
        }"
        :loop="true"
        @slideChange="onSlideChange"
        class="h-full w-full flex-grow"
      >
        <swiper-slide
          v-for="(product, index) in products"
          :key="product.id"
          class="h-full"
        >
          <div class="grid grid-cols-12 h-full items-center">
            <!-- Kolumna z opisem produktu -->
            <div
              class="col-span-12 lg:col-span-3 h-full flex flex-col justify-center order-2 lg:order-1"
            >
              <div v-if="product && product.slider">
                <p class="font-semibold text-5xl text-left tracking-wide">
                  {{ product.slider.title }}
                </p>
                <p
                  class="text-[0.9em] text-gray-600 mt-2 text-left uppercase tracking-[0.2em]"
                >
                  {{ product.slider.subtitle }}
                </p>
                <p class="my-8 text-left text-lg">
                  {{ product.slider.description }}
                </p>
                <p class="font-semibold text-3xl text-right">
                  {{ formatPrice(product.slider.price) }}
                </p>
              </div>
            </div>

            <!-- Kolumna ze zdjęciem -->
            <div
              class="col-span-12 lg:col-span-6 relative h-full flex items-center justify-center overflow-hidden order-1 lg:order-2"
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

            <!-- Kolumna z cechami produktu -->
            <div
              class="col-span-12 lg:col-span-3 h-full hidden lg:flex flex-col justify-center order-3"
            >
              <!-- Tabela 2x2 z cechami produktu -->
              <div
                class="w-full border-collapse"
                style="display: table"
                v-if="product && product.slider"
              >
                <!-- Pierwszy wiersz -->
                <div style="display: table-row">
                  <!-- Komórka 1 (góra-lewo): Pierwsza cecha (zazwyczaj BETON) -->
                  <div
                    style="
                      display: table-cell;
                      padding: 24px;
                      border-right: 1px solid #cfcfcf;
                      border-bottom: 1px solid #cfcfcf;
                      width: 50%;
                    "
                  >
                    <div
                      class="text-gray-500 text-sm text-left uppercase tracking-widest pb-1"
                    >
                      {{ product.slider.features[0]?.name || "BETON" }}
                    </div>
                    <div class="flex items-center mt-2">
                      <div
                        v-if="product.slider.features[0]?.colorCode"
                        class="w-5 h-5 rounded-full mr-3"
                        :style="{
                          backgroundColor:
                            product.slider.features[0]?.colorCode,
                        }"
                      ></div>
                      <span>{{
                        product.slider.features[0]?.value || "Szary"
                      }}</span>
                    </div>
                  </div>

                  <!-- Komórka 2 (góra-prawo): Druga cecha (zazwyczaj MECH) -->
                  <div
                    style="
                      display: table-cell;
                      padding-left: 24px;
                      border-bottom: 1px solid #cfcfcf;
                      width: 50%;
                    "
                  >
                    <div
                      class="text-gray-500 text-sm text-left uppercase tracking-widest pb-1"
                    >
                      {{ product.slider.features[1]?.name || "MECH" }}
                    </div>
                    <div class="flex items-center mt-2">
                      <div
                        v-if="product.slider.features[1]?.colorCode"
                        class="w-5 h-5 rounded-full mr-3"
                        :style="{
                          backgroundColor:
                            product.slider.features[1]?.colorCode,
                        }"
                      ></div>
                      <span>{{
                        product.slider.features[1]?.value || "Spring green"
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Drugi wiersz -->
                <div style="display: table-row">
                  <!-- Komórka 3 (dół-lewo): Trzecia cecha (zazwyczaj WYSYŁKA) -->
                  <div
                    style="
                      display: table-cell;
                      padding: 24px;
                      border-right: 1px solid #cfcfcf;
                      width: 50%;
                    "
                  >
                    <div
                      class="text-gray-500 text-sm text-left uppercase tracking-widest pb-1"
                    >
                      {{ product.slider.features[2]?.name || "WYSYŁKA" }}
                    </div>
                    <div class="mt-2 text-left">
                      {{ product.slider.features[2]?.value || "Bezpłatna" }}
                    </div>
                  </div>

                  <!-- Komórka 4 (dół-prawo): Czwarta cecha (zazwyczaj PŁATNOŚĆ) -->
                  <div style="display: table-cell; padding: 24px; width: 50%">
                    <div
                      class="text-gray-500 text-sm text-left uppercase tracking-widest pb-1"
                    >
                      {{ product.slider.features[3]?.name || "PŁATNOŚĆ" }}
                    </div>
                    <div class="mt-2 text-left">
                      {{
                        product.slider.features[3]?.value || "Płatności ikony"
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>

      <!-- Dolny pasek z przyciskami -->
      <div class="grid grid-cols-12 pb-10">
        <!-- Paginacja (zastąpienie "A") -->
        <div class="col-span-3 flex items-end justify-start">
          <div class="swiper-pagination"></div>
        </div>

        <!-- Social icons -->
        <div class="col-span-6 flex items-end justify-center gap-2">
          <div class="px-2 cursor-pointer group">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/icons/facebook_dark.svg"
                alt="Facebook"
                class="h-4 w-auto transform transition-all duration-300 group-hover:-translate-y-2"
              />
            </a>
          </div>

          <div class="px-2 cursor-pointer group">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/icons/instagram_dark.svg"
                alt="Instagram"
                class="h-4 w-auto transform transition-all duration-300 group-hover:-translate-y-2"
              />
            </a>
          </div>

          <div class="px-2 cursor-pointer group">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/icons/linkedin_dark.svg"
                alt="LinkedIn"
                class="h-4 w-auto transform transition-all duration-300 group-hover:-translate-y-2"
              />
            </a>
          </div>
        </div>

        <!-- Przycisk dodawania do koszyka -->
        <div class="col-span-3 flex items-center justify-end">
          <!-- Komunikat o osiągniętym limicie produktów -->
          <div
            v-if="isLimitReached"
            class="mr-4 text-sm text-red-600 whitespace-nowrap font-medium"
          >
            Limit {{ currentProduct?.orderLimit || 0 }} szt.
          </div>
          <button
            class="w-[70px] h-[70px] text-white rounded-full transition-all flex items-center justify-center relative group"
            :class="{
              'bg-black hover:opacity-80 opacity-100 cursor-pointer':
                canAddToCart,
              'bg-gray-400 cursor-not-allowed': !canAddToCart,
            }"
            @click="canAddToCart && addOneToCart()"
          >
            <!-- Znak plus z animacją Tailwind -->
            <div
              class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out"
              :class="showAddedToCartCheck ? 'opacity-0' : 'opacity-100'"
            >
              <div
                class="relative w-5 h-5 transition-all duration-300 ease-in-out"
                :class="{ 'group-hover:rotate-90': canAddToCart }"
              >
                <!-- Pozioma linia plusa -->
                <div
                  class="w-[20px] h-[1px] bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                ></div>
                <!-- Pionowa linia plusa -->
                <div
                  class="h-[20px] w-[1px] bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                ></div>
              </div>
            </div>

            <!-- Ikona potwierdzenia dodania do koszyka (check) z efektem fade używając Tailwind -->
            <div
              class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out"
              :class="showAddedToCartCheck ? 'opacity-100' : 'opacity-0'"
            >
              <img
                src="/icons/check.svg"
                alt="Dodano do koszyka"
                class="w-5 h-5 text-white"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useProductsStore } from "~/stores/shop/products";
import { useCartStore } from "~/stores/shop/cart";
import type { Product } from "~/types/shop";

// Importujemy Swiper i SwiperSlide
import { Swiper, SwiperSlide } from "swiper/vue";
// Importujemy moduł Pagination
import { Pagination } from "swiper/modules";

// Importujemy style Swipera
import "swiper/css";
import "swiper/css/pagination";

// Sprawdźmy najprostszy import - bez dodatkowych modułów
// Później będziemy je dodawać stopniowo

const productsStore = useProductsStore();
const cartStore = useCartStore();

// Pobieramy wszystkie produkty, które mają być w sliderze
const products = ref<Product[]>(
  [
    productsStore.getProduct(1),
    productsStore.getProduct(2),
    productsStore.getProduct(3),
  ].filter(Boolean) as Product[]
); // Filtrujemy undefined

// Aktualnie wyświetlany produkt
const currentProduct = ref<Product | undefined>(products.value[0]);
const activeIndex = ref(0);
const showAddedToCartCheck = ref(false); // Flaga do pokazywania ikony potwierdzenia

// Sprawdzamy czy osiągnięto limit produktu w koszyku
const isLimitReached = computed(() => {
  if (!currentProduct.value) return false;
  const cartItem = cartStore.items.find(
    (item) => item.id === currentProduct.value?.id
  );
  return (
    cartItem && cartItem.quantity >= (currentProduct.value?.orderLimit || 0)
  );
});

// Sprawdzamy czy można dodać produkt do koszyka (limit nie jest osiągnięty i nie trwa animacja)
const canAddToCart = computed(
  () => !isLimitReached.value && !showAddedToCartCheck.value
);

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(price);
};

// Funkcje dla danych ze slidera - aktualizowane dla currentProduct
const getFeatureValue = (name: string): string => {
  if (!currentProduct.value?.features) return "";
  const feature = currentProduct.value.features.find((f) => f.name === name);
  return feature ? feature.value : "";
};

const getSliderFeatureValue = (name: string): string => {
  if (!currentProduct.value?.slider?.features) return "";
  const feature = currentProduct.value.slider.features.find(
    (f) => f.name === name
  );
  return feature ? feature.value : "";
};

const getSliderFeatureColor = (name: string): string => {
  if (!currentProduct.value?.slider?.features) return "";
  const feature = currentProduct.value.slider.features.find(
    (f) => f.name === name
  );
  return feature?.colorCode || "";
};

const addOneToCart = () => {
  if (currentProduct.value && !isLimitReached.value) {
    const success = cartStore.addToCart(currentProduct.value.id);

    if (success) {
      // Płynna animacja: pokazujemy ikonę check
      showAddedToCartCheck.value = true;

      // Po 2 sekundach płynnie przywracamy znak plus
      setTimeout(() => {
        showAddedToCartCheck.value = false;
      }, 2000);
    }
  }
};

// Funkcja wywoływana przy zmianie slajdu
const onSlideChange = (swiper: any) => {
  activeIndex.value = swiper.realIndex;
  // Gdy używamy loop, musimy użyć realIndex, który reprezentuje faktyczny indeks niezależnie od klonowanych slajdów
  const index = swiper.realIndex % products.value.length;
  currentProduct.value = products.value[index];
};
</script>

<style>
/* Style dla Swiper */
.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Dostosowanie paginacji */
.swiper-pagination {
  display: flex !important; /* !important aby nadpisać style Swipera */
  position: static !important; /* !important aby nadpisać style Swipera */
  gap: 12px;
  align-items: center;
}

.swiper-pagination-bullet {
  width: 48px;
  height: 5px;
  background-color: #d1d5db; /* gray-300 z Tailwind */
  border-radius: 0;
  opacity: 1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.swiper-pagination-bullet-active {
  background-color: #000000; /* Czarny */
  opacity: 1;
  height: 5px; /* Zwiększona wysokość kreski aktywnego slajdu */
}

/* Ukrywamy przyciski nawigacji */
.swiper-button-next,
.swiper-button-prev {
  display: none;
}
</style>
