import { writeFile } from "fs/promises";
import { resolve } from "path";
import productsData from "../../../data/products.json";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { productId, quantity } = body;

    // Znajdź produkt i zaktualizuj jego stan
    const product = productsData.products.find((p) => p.id === productId);
    if (product) {
      product.stock -= quantity;
      if (product.stock < 0) product.stock = 0;

      // Zapisz zaktualizowane dane do pliku
      const filePath = resolve("./data/products.json");
      await writeFile(filePath, JSON.stringify(productsData, null, 2));

      return { success: true, product };
    }

    throw new Error("Product not found");
  } catch (error) {
    throw createError({
      statusCode: 400,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update product stock",
    });
  }
});
