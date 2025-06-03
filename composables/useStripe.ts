import { loadStripe } from "@stripe/stripe-js";

// Przechowujemy instancję Stripe jako zmienną modułu
let stripePromise: Promise<any> | null = null;

export const useStripe = () => {
  const config = useRuntimeConfig();

  // Inicjalizujemy Stripe tylko raz
  if (!stripePromise) {
    const publicKey = config.public.stripePublicKey;
    if (!publicKey) {
      throw new Error("Stripe public key is not configured");
    }
    stripePromise = loadStripe(publicKey).catch((error) => {
      console.error("Failed to initialize Stripe:", error);
      throw error;
    });
  }

  return {
    stripe: stripePromise,
  };
};
