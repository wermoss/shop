# NuxtShop

A Nuxt.js e-commerce application with Stripe integration and email notifications.

## Features

- Product catalog
- Shopping cart
- Stripe checkout integration
- Order confirmation emails
- Cart abandonment notifications
- Discount codes
- World sales map

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
USE_TEST_KEYS=true
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_TEST_PUBLIC_KEY=pk_test_...
STRIPE_TEST_WEBHOOK_SECRET=whsec_...
STRIPE_LIVE_SECRET_KEY=sk_...
STRIPE_LIVE_PUBLIC_KEY=pk_...
STRIPE_LIVE_WEBHOOK_SECRET=whsec_...
BREVO_API_KEY=xkeysib-...
ADMIN_EMAIL=services@wooboo.pl
ORDER_SIGNATURE_SECRET=twoj_tajny_klucz_tutaj
```

Zobacz plik `.env.example` dla wszystkich dostępnych zmiennych środowiskowych.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev
```

### Stripe Webhook Setup for Local Development

For testing Stripe webhooks locally, follow the instructions in [STRIPE-WEBHOOK-SETUP.md](STRIPE-WEBHOOK-SETUP.md) or use the provided helper script:

```bash
./stripe-webhook-test.sh
```

### Bezpieczeństwo

- **Zabezpieczenie stron zamówień**: System zabezpiecza strony potwierdzenia zamówienia przed manipulacją parametrami URL - szczegóły w [SECURE-ORDER-PAGES.md](SECURE-ORDER-PAGES.md)
- **Webhooks Stripe**: Wszystkie zdarzenia Stripe są weryfikowane kryptograficznie

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
