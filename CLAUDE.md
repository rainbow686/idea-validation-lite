# Idea Validation Lite

AI-powered startup idea validation tool for solo founders.

**Production URL**: https://idea-validation-lite.vercel.app

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe
- **PDF**: @react-pdf/renderer
- **Deployment**: Vercel
- **AI**: Claude API
- **Search**: Google Search API

## Development

```bash
npm run dev    # Start dev server
npm run build  # Build for production
```

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID_ONE_TIME=
STRIPE_PRICE_ID_MONTHLY=

# APIs
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
idea-validation-lite/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-report/    # Report generation API
│   │   │   ├── generate-pdf/       # PDF generation API
│   │   │   └── stripe/
│   │   │       └── create-checkout/ # Stripe checkout API
│   │   ├── dashboard/              # User dashboard
│   │   ├── report/                 # Report view page
│   │   ├── page.tsx                # Landing page
│   │   └── layout.tsx              # Root layout
│   └── lib/
│       ├── report-generator.ts     # AI report generation
│       ├── pdf-generator.tsx       # PDF generation
│       ├── stripe.ts               # Stripe utilities
│       └── supabase.ts             # Supabase client
├── .env.example
└── package.json
```

## Database Schema

### users
- id (UUID, PK)
- email (TEXT, UNIQUE)
- stripe_customer_id (TEXT)
- subscription_status (TEXT)
- credits (INTEGER)

### reports
- id (UUID, PK)
- user_id (UUID, FK)
- idea_title (TEXT)
- idea_description (TEXT)
- overall_score (INTEGER)
- status (TEXT: draft/preview/paid)
- report_data (JSONB)

### payments
- id (UUID, PK)
- user_id (UUID, FK)
- stripe_payment_intent_id (TEXT)
- amount (INTEGER)
- status (TEXT)
- payment_type (TEXT: one_time/subscription)
