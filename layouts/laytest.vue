<template>
  <div class="absolute w-full h-[50px] z-20">
    <div class="container mx-auto flex justify-between">
      <p>wermoss</p>
      <p>Zamknij</p>
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
