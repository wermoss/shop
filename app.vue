<template>
  <NuxtLayout :key="$route.fullPath">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Dodajemy key do NuxtLayout, aby wymuszać jego przeładowanie
// przy każdej zmianie ścieżki (key=$route.fullPath)
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.font-roboto-mono {
  font-family: "Roboto Mono", monospace;
}

/* Animacja przejścia między layoutami */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.3s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

/* Animacja przejścia między stronami */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
