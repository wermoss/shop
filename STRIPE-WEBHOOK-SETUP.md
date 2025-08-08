# Setting Up Stripe Webhooks

This document explains how to set up Stripe webhooks for both local development and production environments.

## Overview

Our application uses Stripe webhooks to process order confirmations. When a payment is successfully completed, Stripe sends a webhook event to our server, which then triggers the order confirmation email to be sent to both the customer and the administrator.

## Production Environment Setup

1. Go to the Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://your-production-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add the secret to your production environment variables:
   ```
   NUXT_STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

## Local Development Setup

For local development, you need to use the Stripe CLI to forward events to your local server:

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to your Stripe account in the CLI:
   ```bash
   stripe login
   ```
3. Forward events to your local server:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```
4. The CLI will output a webhook signing secret. Add it to your `.env` file:
   ```
   NUXT_STRIPE_WEBHOOK_SECRET=whsec_your_local_secret_here
   ```
5. Keep the CLI running while you're testing webhooks locally

## Testing Webhook Functionality

To test the webhook functionality without making actual payments:

1. Use the Stripe CLI to send a test event:

   ```bash
   stripe trigger checkout.session.completed
   ```

   This will send a test `checkout.session.completed` event to your local server.

2. Or, use our built-in test endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/mail/test-order-confirmation
   ```
   This will trigger the order confirmation email directly with sample data.

## Troubleshooting

If webhooks aren't working:

1. Check the server logs for errors
2. Verify that the webhook signing secret is correct
3. Make sure the Stripe CLI is running and forwarding events (for local development)
4. Confirm that the `checkout.session.completed` event is being triggered
5. Check that session metadata contains all required order information

## Adding or Modifying Metadata

The webhook expects certain metadata fields to be present in the Stripe checkout session. If you modify the order details structure, make sure to update the metadata fields in the checkout session creation code as well.

Key metadata fields:

- orderNumber
- customerName
- customerEmail
- customerPhone
- products (JSON string)
- shipping address fields (shippingStreet, shippingHouseNumber, etc.)
- discount information (subtotalAmount, cartDiscountPercent, etc.)
- emailSent flag

### Important: Metadata Size Limits

Stripe has a limit of 500 characters per metadata field. For complex data like product details, we use a JSON string in the 'products' field.

If you encounter issues with metadata size:

1. Reduce the amount of data stored in each field
2. Split complex data across multiple metadata fields
3. Consider storing the minimum data needed in metadata and retrieving full details from your database when processing webhooks
