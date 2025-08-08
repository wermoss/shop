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
NUXT_STRIPE_SECRET_KEY=sk_test_...
NUXT_STRIPE_PUBLIC_KEY=pk_test_...
NUXT_STRIPE_WEBHOOK_SECRET=whsec_...
NUXT_BREVO_API_KEY=xkeysib-...
```

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
