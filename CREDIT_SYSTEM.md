# 按次付费系统（Credit System）

## 概述

IdeaValidation Lite 采用按次付费模式，降低使用门槛：
- **免费赠送**：新用户注册即送 3 次免费额度
- **按次购买**：¥9.9/次
- **套餐优惠**：
  - 5 次套餐：¥49（¥9.8/次）
  - 12 次套餐：¥99（¥8.25/次，最优惠）

## 架构

### 数据库 Schema

```
users
├── id (UUID)
├── email (TEXT)
├── free_credits (INTEGER) - 免费额度
├── paid_credits (INTEGER) - 付费额度
└── created_at, updated_at

payments
├── id (UUID)
├── user_id (UUID)
├── amount (INTEGER) - 金额（分）
├── channel (TEXT) - alipay/wechat/stripe
├── credits (INTEGER) - 购买额度
├── status (TEXT) - pending/success/failed/refunded
├── transaction_id (TEXT)
└── created_at, updated_at

credit_usage
├── id (UUID)
├── user_id (UUID)
├── credits_used (INTEGER)
├── report_id (UUID)
├── action (TEXT)
└── created_at
```

### RLS 安全策略

所有表都启用了 Row Level Security（RLS），确保用户只能访问自己的数据。

## 使用指南

### 1. 配置环境变量

在 `.env.local` 中添加：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anthropic-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Credit Pricing
STRIPE_PRICE_ID_CREDIT_1=price_xxx  # ¥9.9
STRIPE_PRICE_ID_CREDIT_5=price_xxx  # ¥49
STRIPE_PRICE_ID_CREDIT_12=price_xxx # ¥99
```

### 2. 应用数据库迁移

```bash
# 使用 Supabase CLI
npx supabase migration up

# 或手动执行 SQL
# 将 supabase/migrations/20260403_add_credit_system.sql
# 内容复制到 Supabase Dashboard -> SQL Editor 执行
```

### 3. 创建 Stripe 产品

在 Stripe Dashboard 创建以下产品：

1. **1 Credit** - ¥9.9
2. **5 Credits** - ¥49
3. **12 Credits** - ¥99

获取 `price_id` 并填入环境变量。

### 4. 配置 Webhook

在 Stripe Dashboard 配置 Webhook：

```
Endpoint: https://your-domain.com/api/payment/webhook
Events:
  - checkout.session.completed
  - payment_intent.failed
  - charge.refunded
```

### 5. 前端集成

#### 显示额度余额

```tsx
import { CreditBalance } from '@/components'

function Header() {
  return (
    <header>
      <CreditBalance />
    </header>
  )
}
```

#### 购买额度页面

```tsx
import { CreditPurchase } from '@/components'

function PricingPage() {
  return <CreditPurchase />
}
```

#### 消耗额度生成报告

```tsx
import { useCredits } from '@/hooks/useCredits'

function ReportGenerator() {
  const { credits, consumeCredits } = useCredits()

  const handleGenerate = async () => {
    if (!credits || credits.total_credits < 1) {
      alert('额度不足，请前往购买')
      return
    }

    const result = await consumeCredits(1)
    if (result.success) {
      // Generate report
    }
  }

  return (
    <button onClick={handleGenerate}>
      生成报告（消耗 1 额度）
    </button>
  )
}
```

## API 端点

### POST /api/payment/create

创建支付会话

**请求：**
```json
{
  "amount": 999,
  "channel": "stripe",
  "credits": 1
}
```

**响应：**
```json
{
  "success": true,
  "paymentId": "cs_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/payment/webhook

处理支付回调（Stripe/Alipay/WeChat）

### POST /api/generate-report

生成报告（自动检查并消耗额度）

**响应（额度不足）：**
```json
{
  "error": "Insufficient credits",
  "code": "PAYMENT_REQUIRED",
  "currentCredits": 0,
  "requiredCredits": 1
}
```

## 测试

运行测试：

```bash
npm test
```

## 数据库函数

### `get_user_credits()`

获取当前用户额度

```sql
SELECT * FROM get_user_credits();
-- Returns: free_credits, paid_credits, total_credits
```

### `consume_credits(credits_to_consume, report_id)`

消耗额度

```sql
SELECT * FROM consume_credits(1, 'report-uuid');
-- Returns: success, remaining_credits, message
```

### `add_credits(target_user_id, credits_to_add, credit_type)`

添加额度（用于 webhook 回调）

```sql
SELECT * FROM add_credits('user-uuid', 5, 'paid');
-- Returns: success, new_total
```

## 故障排查

### 额度未到账

1. 检查支付状态：`SELECT * FROM payments WHERE user_id = 'xxx' ORDER BY created_at DESC`
2. 检查 webhook 日志：Stripe Dashboard -> Developers -> Webhooks
3. 手动添加额度：
   ```sql
   SELECT add_credits('user-id', 5, 'paid');
   ```

### 额度消耗失败

1. 检查 RLS 策略是否启用
2. 确认用户已登录
3. 检查数据库函数权限

## 未来计划

- [ ] 支持支付宝/微信支付二维码
- [ ] 企业批量采购
- [ ] 额度转赠功能
- [ ] 发票开具
- [ ] 订阅计划（月卡/年卡）
