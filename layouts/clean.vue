<template>
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
