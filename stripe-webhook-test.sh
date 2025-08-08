#!/bin/bash

# This script helps set up and test Stripe webhooks for local development

echo "Setting up Stripe webhook testing environment"
echo "=============================================="
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
  echo "❌ Stripe CLI is not installed. Please install it first:"
  echo "  https://stripe.com/docs/stripe-cli"
  exit 1
fi

# Check if user is logged in
echo "Checking Stripe CLI login status..."
LOGGED_IN=$(stripe whoami 2>&1 | grep "logged in as")

if [ -z "$LOGGED_IN" ]; then
  echo "❌ You're not logged in to Stripe CLI. Please log in first:"
  echo "  stripe login"
  exit 1
fi

echo "✅ Logged in to Stripe CLI"
echo ""

# Ask for which action to take
echo "What would you like to do?"
echo "1. Start webhook forwarding (keep running in background)"
echo "2. Test checkout.session.completed webhook event"
echo "3. Exit"
read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "Starting webhook forwarding to http://localhost:3000/api/stripe/webhook"
    echo "Keep this terminal window open while testing webhooks"
    echo "Press Ctrl+C to stop"
    echo ""
    stripe listen --forward-to http://localhost:3000/api/stripe/webhook
    ;;
  2)
    echo ""
    echo "Triggering test checkout.session.completed webhook event"
    stripe trigger checkout.session.completed
    ;;
  3)
    echo "Exiting"
    exit 0
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac
