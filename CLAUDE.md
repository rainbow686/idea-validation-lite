# Idea Validation Lite

AI-powered startup idea validation tool for solo founders.

**Production URL**: https://idea-validation-lite.vercel.app

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Next.js API Routes (Render Free)
- **Database**: Supabase Free (PostgreSQL + RLS)
- **Payment**: Stripe / Alipay / WeChat Pay
- **PDF**: @react-pdf/renderer
- **Deployment**: Vercel Hobby (Frontend) + Render Free (Backend)
- **AI**: Qwen3.5-Plus (通义千问)
- **SEO**: AI-generated static pages + public reports

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

# Payment (Stripe for international, Alipay/WeChat for China)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
ALIPAY_MERCHANT_ID=
WECHAT_MERCHANT_ID=

# AI (Qwen3.5-Plus via DashScope)
DASHSCOPE_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000  # or Render URL in production
```

## Project Structure

```
idea-validation-lite/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-report/       # AI report generation
│   │   │   │   ├── route.ts
│   │   │   │   └── status/route.ts    # Polling for report status
│   │   │   ├── generate-pdf/          # PDF generation
│   │   │   ├── generate-ideas/        # "I don't have an idea" feature
│   │   │   ├── payment/
│   │   │   │   ├── create/route.ts    # Create payment session
│   │   │   │   └── webhook/route.ts   # Payment webhook handler
│   │   │   ├── invite/                # Invite code generation
│   │   │   ├── share/                 # Share poster generation
│   │   │   ├── seo/                   # SEO page generation
│   │   │   └── stripe/
│   │   │       └── create-checkout/   # Stripe checkout
│   │   ├── dashboard/                 # User dashboard
│   │   ├── report/[slug]/             # Public report page
│   │   ├── ideas/                     # Idea library
│   │   ├── validated/                 # Validated ideas pool
│   │   ├── industries/[industry]/     # Industry landing pages
│   │   ├── pricing/                   # Pricing page
│   │   ├── page.tsx                   # Landing page
│   │   └── layout.tsx                 # Root layout
│   ├── components/
│   │   ├── CreditCheck.tsx            # Credit balance checker
│   │   ├── CreditPurchase.tsx         # Credit purchase modal
│   │   ├── IdeaGenerator.tsx          # "I don't have an idea" modal
│   │   ├── ShareModal.tsx             # Share dialog
│   │   ├── ShareStats.tsx             # Share analytics
│   │   └── index.ts
│   ├── hooks/
│   │   └── useCredits.ts              # Credit management hook
│   ├── lib/
│   │   ├── report-generator.ts        # AI report generation
│   │   ├── pdf-generator.tsx          # PDF generation
│   │   ├── stripe.ts                  # Stripe utilities
│   │   ├── supabase.ts                # Supabase client
│   │   └── api-config.ts              # API configuration
│   ├── types/
│   │   └── credit.ts                  # Credit system types
│   └── middleware.ts                  # Auth middleware
├── supabase/
│   └── migrations/
│       ├── 20260403_add_credit_system.sql
│       ├── 20260403_add_seo_system.sql
│       └── 20260403_add_viral_sharing_system.sql
├── .env.example
└── package.json
```

## Database Schema

### users
- id (UUID, PK)
- email (TEXT, UNIQUE)
- free_credits (INTEGER, DEFAULT 3) - Free trial credits
- paid_credits (INTEGER, DEFAULT 0) - Purchased credits
- stripe_customer_id (TEXT)
- subscription_status (TEXT)
- created_at, updated_at

### reports
- id (UUID, PK)
- user_id (UUID, FK)
- idea_title (TEXT)
- idea_description (TEXT)
- overall_score (INTEGER)
- status (TEXT: draft/generating/completed/failed)
- report_data (JSONB)
- is_public (BOOLEAN, DEFAULT false)
- slug (TEXT, UNIQUE)
- view_count (INTEGER, DEFAULT 0)
- created_at, updated_at

### payments
- id (UUID, PK)
- user_id (UUID, FK)
- amount (INTEGER, cents)
- channel (TEXT: alipay/wechat/stripe/bank_transfer)
- credits (INTEGER)
- status (TEXT: pending/success/failed/refunded)
- transaction_id (TEXT, UNIQUE)
- metadata (JSONB)
- created_at, updated_at

### credit_usage
- id (UUID, PK)
- user_id (UUID, FK)
- credits_used (INTEGER)
- report_id (UUID, FK)
- action (TEXT)
- metadata (JSONB)
- created_at

### seo_pages
- id (UUID, PK)
- title (TEXT)
- slug (TEXT, UNIQUE)
- content (TEXT)
- meta_title, meta_description (TEXT)
- keywords (TEXT[])
- views (INTEGER, DEFAULT 0)
- status (TEXT: draft/published/archived)
- created_at, updated_at

### idea_library
- id (UUID, PK)
- title, description (TEXT)
- industry, target_user, pain_point (TEXT)
- revenue_model (TEXT)
- difficulty_score (INTEGER)
- views, validations (INTEGER, DEFAULT 0)
- is_public (BOOLEAN, DEFAULT true)
- created_at, updated_at

### invite_codes
- id (UUID, PK)
- user_id (UUID, FK)
- code (TEXT, UNIQUE)
- claimed_by (UUID[])
- claimed_count (INTEGER)
- created_at, updated_at

### invite_claims
- id (UUID, PK)
- invite_code (TEXT, FK)
- inviter_id, claimer_id (UUID, FK)
- credits_awarded (INTEGER)
- created_at

### share_analytics
- id (UUID, PK)
- user_id, report_id (UUID, FK)
- platform (TEXT)
- shared_at (TIMESTAMP)
- metadata (JSONB)
