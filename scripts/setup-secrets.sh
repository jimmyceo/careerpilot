#!/bin/bash
# Setup GitHub Secrets for Hunt-X Auto-Deploy

# This script requires GitHub CLI (gh) to be installed and logged in
# Run: gh auth login first

echo "Setting up GitHub Secrets for Hunt-X..."

# Add secrets from your .env file
# You'll paste these values when prompted

echo "Adding RAILWAY_TOKEN..."
gh secret set RAILWAY_TOKEN --body "df22636f-80eb-43f1-bec1-f2e9376ac291" --repo jimmyceo/Hunt-X

echo "Adding VERCEL_TOKEN..."
gh secret set VERCEL_TOKEN --body "vcp_2Oo5nQ4veWU1ZYLNPyGxWmFOHC0EDYjuiIIrEu3qZ3QzHpyZjV2yIre3" --repo jimmyceo/Hunt-X

echo ""
echo "Now add these additional secrets via GitHub UI:"
echo "1. Go to: https://github.com/jimmyceo/Hunt-X/settings/secrets/actions"
echo "2. Add New Repository Secret"
echo ""
echo "Required secrets:"
echo "  - VERCEL_ORG_ID: Your Vercel org ID (get from vercel.json in your Vercel project)"
echo "  - VERCEL_PROJECT_ID: Your Vercel project ID"
echo "  - NEXT_PUBLIC_API_URL: Will be your Railway URL (after first backend deploy)"
echo ""
echo "Optional:"
echo "  - STRIPE_SECRET_KEY: From your Stripe dashboard"
echo "  - STRIPE_WEBHOOK_SECRET: From Stripe webhook settings"
echo ""
echo "Done! Pushes to main will now auto-deploy."
