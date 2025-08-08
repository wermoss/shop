<template>
  <div class="absolute w-full z-20 bg-white lg:bg-transparent">
    <div
      class="container mx-auto flex justify-between items-center h-[60px] px-8"
    >
      <NuxtLink to="/main" class="font-bold text-3xl">wermoss</NuxtLink>
      <NuxtLink to="/shop" class="text-black text-sm"
        ><img
          src="/icons/back.svg"
          alt="Wróć do sklepu"
          class="inline-block mr-2 w-4 h-4"
        />Wróć do sklepu</NuxtLink
      >
    </div>
  </div>

  <div class="min-h-screen flex flex-col">
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";

// Ten layout nie zawiera headera ani innych elementów wspólnych
// Służy do wyświetlania stron, które potrzebują "czystego" widoku
</script>
