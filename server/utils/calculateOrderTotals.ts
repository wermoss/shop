import type { CartItem, Product } from "~/types/shop";
import productsData from "../../data/products.json";
import discountsData from "../../data/discounts.json";

const CART_DISCOUNT_TIERS = discountsData.cartDiscountTiers;
const DISCOUNT_CODES = discountsData.discountCodes;

interface OrderTotals {
  subtotalAmount: number;
  cartDiscountPercent: number;
  cartDiscountAmount: number;
  codeDiscountPercent: number;
  codeDiscountAmount: number;
  totalDiscountAmount: number;
  finalAmount: number;
  totalQuantity: number;
  appliedDiscountCode?: string | null;
  productsWithCalculatedPrices: Array<
    Product & {
      quantity: number;
      lineItemTotalPrice: number; // Total price for this line item (unit price * quantity) BEFORE any cart/code discount
      unitPriceWithDiscount: number; // Unit price AFTER cart/code discount applied proportionally
      lineItemTotalPriceWithDiscount: number; // Total price for this line item AFTER cart/code discount
      discountAppliedToLineItem: number; // The amount of discount applied to this line item
    }
  >;
}

export function calculateOrderTotals(
  cartItems: Array<{ id: number; quantity: number; product: Product }>,
  appliedDiscountCode?: string | null
): OrderTotals {
  let subtotalAmount = 0;
  const productsWithCalculatedPrices: OrderTotals["productsWithCalculatedPrices"] =
    [];

  cartItems.forEach((item) => {
    const product = productsData.products.find((p) => p.id === item.product.id);
    if (!product) {
      // Or handle this error more gracefully
      throw new Error(`Product with ID ${item.product.id} not found.`);
    }
    const lineItemTotalPrice = product.price * item.quantity;
    subtotalAmount += lineItemTotalPrice;
    productsWithCalculatedPrices.push({
      ...product,
      quantity: item.quantity,
      lineItemTotalPrice,
      // Placeholder, will be calculated later
      unitPriceWithDiscount: product.price,
      lineItemTotalPriceWithDiscount: lineItemTotalPrice,
      discountAppliedToLineItem: 0,
    });
  });

  const totalQuantity = cartItems.reduce(
    (total: number, item) => total + item.quantity,
    0
  );

  const discountTier = [...CART_DISCOUNT_TIERS]
    .sort((a, b) => b.quantity - a.quantity)
    .find((tier) => totalQuantity >= tier.quantity);
  const cartDiscountPercent = discountTier?.discount || 0;

  let codeDiscountPercent = 0;
  if (appliedDiscountCode) {
    const discountCodeInfo = DISCOUNT_CODES.find(
      (code) => code.code.toUpperCase() === appliedDiscountCode.toUpperCase()
    );
    if (discountCodeInfo) {
      codeDiscountPercent = discountCodeInfo.discount;
    }
  }

  // Calculate discount amounts based on percentages
  // These are rounded to the nearest PLN (or cent, depending on currency precision)
  const cartDiscountAmount =
    cartDiscountPercent > 0
      ? Math.round(subtotalAmount * (cartDiscountPercent / 100))
      : 0;
  const codeDiscountAmount =
    codeDiscountPercent > 0
      ? Math.round(subtotalAmount * (codeDiscountPercent / 100))
      : 0;

  // Total discount is the sum of the two, but ensure it doesn't exceed subtotal
  let totalDiscountAmount = cartDiscountAmount + codeDiscountAmount;
  if (totalDiscountAmount > subtotalAmount) {
    totalDiscountAmount = subtotalAmount;
  }

  const finalAmount = subtotalAmount - totalDiscountAmount;

  // Distribute the totalDiscountAmount proportionally across products
  if (subtotalAmount > 0 && totalDiscountAmount > 0) {
    productsWithCalculatedPrices.forEach((p) => {
      const proportionOfSubtotal = p.lineItemTotalPrice / subtotalAmount;
      const discountForThisLineItem =
        Math.round(totalDiscountAmount * proportionOfSubtotal * 100) / 100; // round to 2 decimal places

      p.discountAppliedToLineItem = discountForThisLineItem;
      p.lineItemTotalPriceWithDiscount =
        p.lineItemTotalPrice - discountForThisLineItem;
      p.unitPriceWithDiscount = p.lineItemTotalPriceWithDiscount / p.quantity;
    });

    // Due to rounding, the sum of distributed discounts might not exactly match totalDiscountAmount.
    // Adjust the discount on the last item to ensure the sum is correct.
    const sumOfDistributedDiscounts = productsWithCalculatedPrices.reduce(
      (sum, p) => sum + p.discountAppliedToLineItem,
      0
    );
    const roundingDifference = totalDiscountAmount - sumOfDistributedDiscounts;
    if (roundingDifference !== 0 && productsWithCalculatedPrices.length > 0) {
      const lastProduct =
        productsWithCalculatedPrices[productsWithCalculatedPrices.length - 1];
      lastProduct.discountAppliedToLineItem += roundingDifference;
      lastProduct.lineItemTotalPriceWithDiscount -= roundingDifference;
      lastProduct.unitPriceWithDiscount =
        lastProduct.lineItemTotalPriceWithDiscount / lastProduct.quantity;
    }
  }

  return {
    subtotalAmount,
    cartDiscountPercent,
    cartDiscountAmount,
    codeDiscountPercent,
    codeDiscountAmount,
    totalDiscountAmount,
    finalAmount,
    totalQuantity,
    appliedDiscountCode: appliedDiscountCode || null,
    productsWithCalculatedPrices,
  };
}
