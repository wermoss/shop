<template>
  <div>
    <h2 class="text-3xl font-semibold mb-6">{{ title }}</h2>
    <div class="world-map-container">
      <div id="world-map" ref="mapContainer" class="map-container"></div>
      <div v-if="loading" class="map-loading">Ładowanie mapy...</div>
      <div v-if="error" class="map-error">
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Definicja interfejsu dla lokalizacji
interface Location {
  name: string;
  country: string;
  coordinates: [number, number];
  sales: number;
}

const props = defineProps({
  title: {
    type: String,
    default: "Mapa sprzedaży na świecie",
  },
  dataSource: {
    type: String,
    default: "/data/sales-locations.json",
  },
  initialZoom: {
    type: Number,
    default: 1.5,
  },
  showPopup: {
    type: Boolean,
    default: true,
  },
  markerColor: {
    type: String,
    default: "#FF4136", // Kolor markerów
  },
  fitToMarkers: {
    type: Boolean,
    default: true, // Automatyczne dopasowanie widoku do wszystkich markerów
  },
  renderWorldCopies: {
    type: Boolean,
    default: false, // Kontroluje czy kontynenty powinny się powtarzać przy oddaleniu
  },
});

const mapContainer = ref(null);
const locations = ref<Location[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Funkcja do pobierania danych
async function fetchLocationData() {
  try {
    console.log("Pobieranie danych z:", props.dataSource);
    const response = await fetch(props.dataSource);

    if (!response.ok) {
      console.error("Błąd HTTP:", response.status, response.statusText);
      throw new Error(`Nie udało się pobrać danych (${response.status})`);
    }

    const data = await response.json();
    console.log("Pobrane dane:", data);

    if (!data || !data.locations || !Array.isArray(data.locations)) {
      console.error("Nieprawidłowy format danych:", data);
      throw new Error("Nieprawidłowy format danych lokalizacji");
    }

    locations.value = data.locations;
    console.log("Załadowano lokalizacje:", locations.value.length);
  } catch (err) {
    console.error("Błąd podczas pobierania danych lokalizacji:", err);
    error.value =
      "Wystąpił błąd podczas ładowania danych. Spróbuj odświeżyć stronę.";
  } finally {
    loading.value = false;
  }
}

// Inicjalizacja mapy
function initMap() {
  if (!mapContainer.value) {
    console.error("Kontener mapy nie znaleziony");
    error.value = "Nie można zainicjalizować mapy - kontener nieznaleziony.";
    loading.value = false;
    return;
  }

  // Sprawdzenie czy mapboxgl jest dostępny
  if (typeof mapboxgl === "undefined") {
    console.error("Biblioteka mapbox-gl nie została załadowana");
    error.value =
      "Nie można załadować biblioteki map. Proszę odświeżyć stronę.";
    loading.value = false;
    return;
  }

  const config = useRuntimeConfig();
  const mapboxToken = config.public.mapboxToken;

  console.log(
    "Inicjalizacja mapy z tokenem:",
    mapboxToken ? "Token dostępny" : "Token niedostępny"
  );

  if (!mapboxToken) {
    error.value = "Brak klucza API Mapbox. Sprawdź konfigurację.";
    loading.value = false;
    return;
  }

  // Ustawienie tokena Mapbox
  mapboxgl.accessToken = mapboxToken;

  try {
    // Używamy bloku try-catch, aby przechwycić wszelkie błędy inicjalizacji mapy
    console.log(
      "Próba utworzenia mapy z tokenem:",
      mapboxToken.substring(0, 10) + "..."
    );

    // Tworzenie instancji mapy z bardziej podstawowym stylem, który jest bardziej stabilny
    const map = new mapboxgl.Map({
      container: mapContainer.value,
      style: "mapbox://styles/mapbox/light-v10", // Używamy jasnego stylu dla lepszej widoczności markerów
      center: [0, 20],
      zoom: props.initialZoom,
      projection: "mercator", // Na stałe ustawiamy mercator, który jest najbardziej stabilny
      renderWorldCopies: props.renderWorldCopies, // Kontrola czy kontynenty powinny się powtarzać przy oddaleniu
      maxBounds: props.renderWorldCopies
        ? undefined
        : [
            [-180, -85],
            [180, 85],
          ], // Ograniczenie widoku tylko gdy renderWorldCopies=false
    });

    // Dodajemy kontrolkę nawigacji
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Ustawiamy limity przybliżenia, aby użytkownik nie mógł oddalić mapy zbyt daleko
    map.setMinZoom(0.5); // Minimalny poziom przybliżenia (najbardziej oddalony widok)
    map.setMaxZoom(10); // Maksymalny poziom przybliżenia (najbliższy widok)

    // Po załadowaniu mapy dodajemy markery
    map.on("load", () => {
      console.log(
        "Mapa załadowana, dodawanie markerów dla",
        locations.value.length,
        "lokalizacji"
      );

      // Sprawdźmy, czy mamy dane lokalizacji
      if (!locations.value || locations.value.length === 0) {
        console.error("Brak danych lokalizacji do wyświetlenia na mapie");

        // Dodajemy przykładowy marker w centrum mapy dla celów debugowania
        if (import.meta.env.DEV) {
          const debugMarker = new mapboxgl.Marker({ color: "#FF0000" })
            .setLngLat([0, 0])
            .setPopup(
              new mapboxgl.Popup().setHTML("<h3>Brak danych lokalizacji</h3>")
            )
            .addTo(map);
        }
        return;
      }

      // Dodanie markerów dla każdej lokalizacji
      locations.value.forEach((location, index) => {
        console.log(
          `Dodawanie markera ${index + 1}/${locations.value.length}:`,
          location.name
        );

        // Tworzymy element HTML dla markera
        const markerElement = document.createElement("div");
        markerElement.className = "custom-marker";

        // Ustawiamy stały rozmiar dla wszystkich markerów
        const size = 12; // Mniejszy, jednolity rozmiar dla wszystkich markerów
        markerElement.style.width = `${size}px`;
        markerElement.style.height = `${size}px`;
        markerElement.style.backgroundColor = props.markerColor || "#FF4136";

        // Tworzymy marker
        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: "center",
        }).setLngLat(location.coordinates);

        // Dodajemy popup jeśli jest włączony
        if (props.showPopup) {
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(`
              <div class="marker-popup">
                <h3>${location.name}, ${location.country}</h3>
              </div>
            `);

          marker.setPopup(popup);
        }

        // Dodajemy marker do mapy
        marker.addTo(map);
      });

      // Dopasowanie widoku mapy, aby pokazywał wszystkie markery (tylko jeśli opcja jest włączona)
      if (props.fitToMarkers && locations.value.length > 0) {
        // Tworzymy obwiednię (bounding box) obejmującą wszystkie markery
        const bounds = new mapboxgl.LngLatBounds();

        // Dodajemy każdą lokalizację do obwiedni
        locations.value.forEach((location) => {
          bounds.extend(location.coordinates);
        });

        // Dostosowujemy widok mapy do obwiedni z niewielkim paddingiem
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 5, // Ograniczamy maksymalne przybliżenie przy dopasowywaniu widoku
          duration: 1000, // Dodajemy płynną animację przejścia
        });
      }

      // Ukrywamy loader
      loading.value = false;
    });

    // Obsługa błędów ładowania mapy
    map.on("error", (e) => {
      console.error("Błąd Mapbox:", e);
      error.value = "Wystąpił błąd podczas ładowania mapy.";
      loading.value = false;
    });
  } catch (err) {
    console.error("Błąd podczas inicjalizacji mapy:", err);
    error.value =
      "Nie udało się zainicjalizować mapy. Sprawdź konsolę przeglądarki po szczegóły.";
    loading.value = false;
  }
}

// Po zamontowaniu komponentu
onMounted(async () => {
  try {
    // Najpierw pobieramy dane
    await fetchLocationData();

    // Następnie inicjalizujemy mapę
    if (locations.value.length > 0) {
      initMap();
    } else {
      error.value = "Nie znaleziono danych lokalizacji.";
      loading.value = false;
    }
  } catch (err) {
    console.error("Błąd w komponencie WorldSalesMap:", err);
    error.value = "Wystąpił nieoczekiwany błąd.";
    loading.value = false;
  }
});
</script>

<style scoped>
.world-map-container {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-loading,
.map-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 20;
  font-size: 1.2rem;
  font-weight: 500;
}

.map-loading {
  color: #2c3e50;
}

.map-error {
  background-color: rgba(255, 230, 230, 0.9);
  padding: 20px;
  text-align: center;
  color: #b71c1c;
}

.custom-marker {
  border-radius: 50%;
  background-color: #ff4136; /* Używamy stałego koloru */
  opacity: 0.9;
  border: 2px solid white;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
  z-index: 1; /* Upewniamy się, że marker ma odpowiedni z-index */
}

.custom-marker:hover {
  transform: scale(1.3);
  opacity: 1;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
}

/* Usunięto marker-inner, ponieważ teraz mamy jednolite markery */

:deep(.marker-popup) {
  padding: 10px 0;
  text-align: center;
}

:deep(.marker-popup h3) {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: 600;
}

:deep(.marker-popup p) {
  margin: 0;
  font-size: 12px;
}

:deep(.mapboxgl-popup-content) {
  border-radius: 8px;
  padding: 10px 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
