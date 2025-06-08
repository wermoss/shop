<template>
  <div>
    <h1 class="text-center text-2xl font-bold my-8">Testing Layouts</h1>
    <div class="flex justify-center space-x-4">
      <NuxtLink
        to="/layout-test?layout=default"
        class="px-4 py-2 bg-blue-500 text-white rounded"
        >Default Layout</NuxtLink
      >
      <NuxtLink
        to="/layout-test?layout=clean"
        class="px-4 py-2 bg-green-500 text-white rounded"
        >Clean Layout</NuxtLink
      >
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const layout = computed(() => route.query.layout || "default");

// Set layout dynamically
definePageMeta({
  layout: false,
});

// This will dynamically set the layout based on the query parameter
onMounted(() => {
  setPageLayout(layout.value);
});

watch(
  () => route.query.layout,
  (newLayout) => {
    if (newLayout) {
      setPageLayout(newLayout);
    }
  }
);
</script>
