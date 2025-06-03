export function generateOrderNumber(): string {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const numbers = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `${letter}${numbers}`;
}
