<template>
  <div class="absolute w-full z-20 bg-white lg:bg-transparent">
    <div
      class="container mx-auto flex justify-between items-center h-[60px] px-10"
    >
      <p class="font-bold text-3xl">wermoss</p>
      <p>Wróc do sklepu</p>
    </div>
  </div>

  <div class="min-h-screen flex flex-col">
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Ten layout nie zawiera headera ani innych elementów wspólnych
// Służy do wyświetlania stron, które potrzebują "czystego" widoku
</script>
