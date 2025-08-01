<template>
  <div class="container mx-auto py-12 px-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">Mapa Sprzedaży Globalnej</h1>
      <button
        @click="toggleDebugInfo"
        class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
      >
        {{ showDebugInfo ? "Ukryj debugowanie" : "Pokaż debugowanie" }}
      </button>
    </div>

    <WorldSalesMap
      title="Globalna mapa sprzedaży"
      dataSource="/data/sales-locations.json"
      :initialZoom="1.5"
      markerColor="#FF4136"
      :showPopup="true"
      :renderWorldCopies="false"
      :fitToMarkers="true"
    />

    <!-- Pomocniczy element do debugowania - można usunąć po naprawie problemu -->
    <div
      v-if="showDebugInfo"
      class="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded"
    >
      <h3 class="font-bold mb-2">Informacje debugowania:</h3>
      <p>
        URL do pliku JSON:
        <code class="bg-gray-100 px-2 py-1 rounded"
          >/data/sales-locations.json</code
        >
      </p>
      <p class="mt-2">Ostatnie załadowane lokalizacje: {{ locationCount }}</p>
      <div class="mt-4">
        <button
          @click="refreshPage"
          class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
        >
          Odśwież stronę
        </button>
        <button
          @click="checkLocationData"
          class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        >
          Sprawdź dane lokalizacji
        </button>
      </div>
      <div v-if="debugLocations.length > 0" class="mt-4">
        <h4 class="font-bold">Załadowane lokalizacje:</h4>
        <ul class="mt-2 text-sm">
          <li v-for="(loc, index) in debugLocations" :key="index" class="mb-1">
            {{ loc.name }}, {{ loc.country }} ({{ loc.coordinates.join(", ") }})
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-4">Informacje o mapie</h2>
      <div class="bg-gray-100 p-6 rounded-md">
        <p class="mb-4">
          Ta mapa pokazuje lokalizacje, gdzie nasze produkty zostały sprzedane
          na całym świecie.
        </p>
        <p>
          Najedź kursorem na dowolny punkt, aby zobaczyć nazwę miejsca i kraj.
          Możesz również przybliżać i oddalać mapę za pomocą przycisków w prawym
          górnym rogu.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const showDebugInfo = ref(false);
const debugLocations = ref([]);
const locationCount = ref(0);

// Funkcja do przełączania widoczności informacji debugowania
function toggleDebugInfo() {
  showDebugInfo.value = !showDebugInfo.value;
  if (showDebugInfo.value) {
    checkLocationData();
  }
}

// Funkcja do odświeżania strony
function refreshPage() {
  window.location.reload();
}

// Funkcja do sprawdzania danych lokalizacji
async function checkLocationData() {
  try {
    const response = await fetch("/data/sales-locations.json");
    if (!response.ok) {
      console.error("Błąd podczas pobierania danych:", response.status);
      return;
    }

    const data = await response.json();
    if (data && data.locations && Array.isArray(data.locations)) {
      debugLocations.value = data.locations;
      locationCount.value = data.locations.length;
      console.log("Dane lokalizacji załadowane poprawnie:", data.locations);
    } else {
      console.error("Nieprawidłowy format danych:", data);
    }
  } catch (err) {
    console.error("Błąd podczas sprawdzania danych lokalizacji:", err);
  }
}
</script>
