import { defineEventHandler } from "h3";

/**
 * Endpoint diagnostyczny do przechwytywania wszystkich żądań HTTP
 * i zapisywania ich do logów - może pomóc w debugowaniu problemów z webhookami
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const url = event.node.req.url;
  const headers = event.node.req.headers;

  console.log(`🔍 [HTTP Debug] ${method} ${url}`);

  // Tylko logujemy, nie zmieniamy przepływu żądania
  // Nie zwracamy żadnej wartości, więc żądanie przejdzie dalej do właściwych handlerów
});
