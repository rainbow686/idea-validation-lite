// Credit and Payment Types

export interface UserCredits {
  free_credits: number;
  paid_credits: number;
  total_credits: number;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;  // In cents (分)
  channel: PaymentChannel;
  credits: number;
  status: PaymentStatus;
  transaction_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type PaymentChannel = 'alipay' | 'wechat' | 'stripe' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface CreditUsage {
  id: string;
  user_id: string;
  credits_used: number;
  report_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  idea_title: string;
  idea_description: string;
  status: ReportStatus;
  report_data: Record<string, unknown>;
  is_public: boolean;
  slug: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';

// API Request/Response Types

export interface CreatePaymentRequest {
  amount: number;  // In cents
  channel: PaymentChannel;
  credits?: number;  // Optional, will be calculated based on amount if not provided
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentId: string;
  url?: string;  // For Stripe redirect
  qrCode?: string;  // For Alipay/WeChat
  clientSecret?: string;  // For Stripe Elements
}

export interface PaymentWebhookRequest {
  payment_id: string;
  transaction_id: string;
  status: PaymentStatus;
  channel: PaymentChannel;
}

export interface CreditPurchaseOption {
  credits: number;
  price: number;  // In cents
  label: string;
  popular?: boolean;
}

// Credit purchase options (¥9.9/次，¥49/5 次，¥99/12 次)
export const CREDIT_PURCHASE_OPTIONS: CreditPurchaseOption[] = [
  {
    credits: 1,
    price: 999,  // ¥9.9
    label: '单次体验',
  },
  {
    credits: 5,
    price: 4900,  // ¥49
    label: '5 次套餐',
    popular: true,
  },
  {
    credits: 12,
    price: 9900,  // ¥99
    label: '12 次套餐（送 2 次）',
  },
];

// Helper to calculate credits from amount
export function calculateCreditsFromAmount(amount: number): number {
  // ¥9.9 = 1 credit, round up for partial credits
  return Math.floor(amount / 999);
}

// Helper to calculate amount from credits
export function calculateAmountFromCredits(credits: number): number {
  // Find the best matching package
  const option = CREDIT_PURCHASE_OPTIONS.find(opt => opt.credits === credits);
  if (option) {
    return option.price;
  }
  // Default calculation for custom amounts
  return credits * 999;
}
