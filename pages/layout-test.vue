<template>
  <div
    class="relative lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    id="layout-container"
  >
    <!-- Background solution that aligns with grid -->
    <div
      class="absolute w-full h-full lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    >
      <div class="container mx-auto h-full">
        <div class="grid grid-cols-12 h-full">
          <div class="col-span-12 lg:col-span-8 bg-white lg:bg-[#EBEBEB]"></div>
          <div class="col-span-12 lg:col-span-4 bg-white lg:bg-white"></div>
        </div>
      </div>
    </div>

    <!-- Background extensions -->
    <div
      class="absolute top-0 lg:bottom-0 left-0 right-1/3 -z-10 bg-[#EBEBEB] lg:[#EBEBEB] content-height lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    ></div>
    <div
      class="absolute top-0 lg:bottom-0 left-2/3 right-0 -z-10 bg-[#EBEBEB] lg:bg-white content-height lg:min-h-screen xl:min-h-screen 2xl:min-h-screen"
    ></div>

    <!-- Content -->
    <div class="container mx-auto relative z-10 pt-[60px]">
      <div class="grid grid-cols-12">
        <div
          class="col-span-12 lg:col-span-8 bg-[#EBEBEB] p-10"
          id="left-column"
        >
          <div class="border-t border-b border-gray-300 py-6 tracking-wider">
            <!-- Uproszczony układ wykorzystujący tylko Tailwind CSS -->
            <div
              class="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-8"
            >
              <!-- Wizerunek produktu -->
              <div
                class="aspect-square w-20 mx-auto lg:mx-0 lg:h-28 lg:w-28 bg-gray-100 flex items-center justify-center"
              >
                1
              </div>

              <!-- Informacje o produkcie -->
              <div class="text-sm lg:text-[16px] lg:flex-1">
                <p class="font-semibold">Betonowe dłonie z mchem</p>
                <p>Beton: Szary Mech: Spring Green</p>
                <p>100,00 zł / szt</p>
              </div>

              <!-- Ilość produktu -->
              <div class="inline-block w-1/2 lg:w-32 text-sm text-left">
                <div class="flex">
                  <div
                    class="px-4 py-2 border-b border-t border-l border-gray-300 rounded-l-md"
                  >
                    -
                  </div>
                  <div class="px-4 py-2 border border-gray-300">2</div>
                  <div
                    class="px-4 py-2 border-b border-t border-r border-gray-300 rounded-r-md"
                  >
                    +
                  </div>
                </div>
              </div>

              <!-- Cena produktu -->
              <div
                class="inline-block w-1/2 lg:w-24 text-[16px] font-medium text-right"
              >
                200,00 zł
              </div>

              <!-- Przycisk usunięcia -->
              <div
                class="hidden lg:flex w-8 h-8 items-center justify-center text-center bg-gray-300 text-white rounded-full leading-none"
              >
                x
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-4 bg-white p-10">
          <p class="text-2xl tracking-wider">Podsumowanie</p>
          <div
            class="space-y-3 border-b border-t border-gray-200 my-6 py-6 tracking-wider"
          >
            <!-- <div class="flex justify-between">
              <p>Ilość produktów</p>
              <p class="text-right">2 szt</p>
            </div> -->
            <div class="flex justify-between">
              <p>Wartość produktów</p>
              <p class="text-right">400,00 zł</p>
            </div>
            <div class="flex justify-between">
              <p>Wartośś VAT</p>
              <p class="text-right">0,00 zł</p>
            </div>
            <div class="flex justify-between">
              <p>Rabat ilościowy -10%</p>
              <p class="text-right">- 20,00 zł</p>
            </div>
            <div class="flex justify-between">
              <p>Koszt wysyłki</p>
              <p class="text-right">0,00 zł</p>
            </div>
          </div>
          <div class="flex justify-between text-2xl tracking-wider">
            <p>Suma</p>
            <p class="text-right">380,00 zł</p>
          </div>
          <button
            class="w-full bg-black text-white py-4 rounded-full hover:opacity-100 opacity-90 transition-all mt-16 cursor-pointer"
          >
            Przejdź do płatności
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "clean",
});

// Skrypt do dostosowania wysokości tła do zawartości
onMounted(() => {
  const adjustBackgroundHeight = () => {
    if (window.innerWidth < 1024) {
      // lg breakpoint w Tailwind
      const leftColumn = document.getElementById("left-column");
      const bgElements = document.querySelectorAll(".content-height");

      if (leftColumn && bgElements.length) {
        const height = leftColumn.offsetHeight + 60; // 50px to padding-top
        bgElements.forEach((el) => {
          el.style.height = `${height}px`;
          el.style.bottom = "auto";
        });
      }
    } else {
      // Przywróć domyślne style dla większych ekranów i upewnij się, że tło zajmuje pełną wysokość
      const bgElements = document.querySelectorAll(".content-height");
      bgElements.forEach((el) => {
        el.style.height = "100vh"; // Ustaw pełną wysokość viewportu
        el.style.bottom = "0";
      });
    }
  };

  // Uruchom funkcję po załadowaniu i przy zmianie rozmiaru
  adjustBackgroundHeight();
  window.addEventListener("resize", adjustBackgroundHeight);

  // Cleanup przy unmount
  onUnmounted(() => {
    window.removeEventListener("resize", adjustBackgroundHeight);
  });
});
</script>

<style scoped>
@media (max-width: 1023px) {
  #layout-container {
    min-height: auto;
  }
}

@media (min-width: 1024px) {
  #layout-container {
    min-height: 100vh;
  }
}
</style>
