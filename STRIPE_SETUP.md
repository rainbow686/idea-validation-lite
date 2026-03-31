# Stripe 配置指南

## 1. 创建 Stripe 账号

访问 https://stripe.com 注册账号（测试模式使用测试 API 密钥）

## 2. 创建产品

### 产品 1: Starter (One-time)
- **名称**: Starter Report
- **描述**: One-time access to a complete validation report
- **价格**: $9.99 (one-time payment)
- **类型**: One-time payment

### 产品 2: Pro (Subscription)
- **名称**: Pro Subscription
- **描述**: 3 validation reports per month + PDF downloads
- **价格**: $29/month (recurring)
- **类型**: Subscription

### 产品 3: Enterprise (Subscription) - 可选
- **名称**: Enterprise Subscription
- **描述**: 10 validation reports per month + priority support
- **价格**: $79/month (recurring)
- **类型**: Subscription

## 3. 获取价格 ID

创建产品后，在 Stripe Dashboard 中找到 Price ID：

1. 进入 Products 页面
2. 点击产品
3. 找到 Price ID (格式：`price_xxxxxxxxxxxxx`)

## 4. 配置环境变量

### 本地开发 (.env.local)
```bash
STRIPE_PRICE_ID_ONE_TIME=price_xxxxxx_one_time
STRIPE_PRICE_ID_MONTHLY=price_xxxxxx_monthly
STRIPE_PRICE_ID_PRO=price_xxxxxx_pro
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### Vercel 生产环境
在 Vercel Dashboard → Settings → Environment Variables 中配置：
- `STRIPE_PRICE_ID_ONE_TIME`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## 5. 配置 Webhook (生产环境)

Stripe → Developers → Webhooks → Add endpoint

**Endpoint URL**: `https://your-domain.com/api/stripe/webhook`

**Events to listen**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 6. 测试支付流程

1. 使用 Stripe 测试卡号：`4242 4242 4242 4242`
2.  expiry: 任意未来日期
3.  CVC: 任意 3 位数
4.  ZIP: 任意 5 位数

## 7. 检查清单

- [ ] 创建 Starter 产品（$9.99 one-time）
- [ ] 创建 Pro 产品（$29/month）
- [ ] 获取所有 Price IDs
- [ ] 配置本地 .env.local
- [ ] 配置 Vercel 环境变量
- [ ] 配置 Webhook（生产环境）
- [ ] 测试支付流程
- [ ] 验证 webhook 事件处理

---

**创建日期**: 2026-04-01
**状态**: 待配置
