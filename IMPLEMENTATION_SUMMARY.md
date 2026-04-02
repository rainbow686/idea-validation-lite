# 按次付费系统实现总结

## 完成的工作

### 1. 数据库 Schema (`supabase/migrations/20260403_add_credit_system.sql`)

创建了完整的额度系统数据库结构：

**表结构：**
- `users` - 用户表（增加 `free_credits` 和 `paid_credits` 字段）
- `payments` - 支付记录表
- `credit_usage` - 额度使用记录表
- `reports` - 报告表

**RLS 安全策略：**
- 所有表启用 Row Level Security
- 用户只能访问自己的数据

**数据库函数：**
- `get_user_credits()` - 获取用户当前额度
- `consume_credits()` - 消耗额度（免费额度优先）
- `add_credits()` - 添加额度

### 2. 类型定义 (`src/types/credit.ts`)

```typescript
- UserCredits - 用户额度类型
- Payment - 支付记录类型
- CreditUsage - 额度使用类型
- PaymentChannel - 支付渠道（stripe/alipay/wechat）
- CREDIT_PURCHASE_OPTIONS - 套餐选项常量
```

### 3. 支付 API

**`/api/payment/create`** - 创建支付会话
- 支持 Stripe（卡支付 + 支付宝）
- 支持 Alipay/WeChat（预留接口）
- 返回支付链接或二维码

**`/api/payment/webhook`** - 支付回调
- 处理 `checkout.session.completed`
- 处理 `charge.refunded`
- 自动更新用户额度

### 4. 报告生成 API 集成 (`/api/generate-report`)

- 检查用户额度
- 消耗额度（1 次/报告）
- 额度不足返回 402 错误
- 保存报告到数据库

### 5. React Hooks (`src/hooks/useCredits.ts`)

```typescript
useCredits() {
  credits: UserCredits | null
  isLoading: boolean
  refreshCredits: () => void
  consumeCredits: (amount, reportId?) => Promise<...>
  payments: Payment[]
  usageHistory: CreditUsage[]
}
```

### 6. 前端组件

**`CreditPurchase`** - 额度购买组件
- 显示当前额度余额
- 三个套餐选项（¥9.9/次，¥49/5 次，¥99/12 次）
- 自定义额度购买
- 支付历史记录

**`CreditBalance`** - 额度余额显示
- 紧凑布局
- 适合放在导航栏

**`CreditCheck`** - 额度检查包装器
- 自动检查额度
- 额度不足提示购买
- 消耗额度后执行操作

**`InsufficientCreditsAlert`** - 额度不足提示

### 7. 定价页面 (`/pricing`)

- 灵活付费说明
- 与其他产品对比
- 常见问题解答

### 8. 配置更新

**`.env.example`** - 新增环境变量
```bash
STRIPE_PRICE_ID_CREDIT_1=xxx  # ¥9.9
STRIPE_PRICE_ID_CREDIT_5=xxx  # ¥49
STRIPE_PRICE_ID_CREDIT_12=xxx # ¥99
```

**`package.json`** - 新增依赖
- `@supabase/auth-helpers-nextjs`
- `jest`, `ts-jest`, `@types/jest`

## 定价策略

| 套餐 | 价格 | 单次价格 | 说明 |
|------|------|----------|------|
| 单次体验 | ¥9.9 | ¥9.9/次 | 低门槛尝试 |
| 5 次套餐 | ¥49 | ¥9.8/次 | 节省 2% |
| 12 次套餐 | ¥99 | ¥8.25/次 | 节省 17%，最受欢迎 |
| 新用户福利 | 免费 3 次 | - | 注册即送 |

## 使用指南

### 1. 配置环境

```bash
# 复制环境变量
cp .env.example .env.local

# 填写 Supabase 和 Stripe 配置
```

### 2. 应用数据库迁移

```sql
-- 在 Supabase Dashboard -> SQL Editor 执行
-- supabase/migrations/20260403_add_credit_system.sql 内容
```

### 3. 创建 Stripe 产品

在 Stripe Dashboard 创建三个产品：
1. 1 Credit - ¥9.9
2. 5 Credits - ¥49
3. 12 Credits - ¥99

获取 `price_id` 填入环境变量。

### 4. 配置 Webhook

```
Endpoint: https://your-domain.com/api/payment/webhook
Events:
  - checkout.session.completed
  - charge.refunded
```

### 5. 前端集成

```tsx
// 显示额度余额
import { CreditBalance } from '@/components'
<CreditBalance />

// 购买额度
import { CreditPurchase } from '@/components'
<CreditPurchase />

// 消耗额度生成报告
import { useCredits } from '@/hooks/useCredits'
const { credits, consumeCredits } = useCredits()
```

## 文件清单

```
/tmp/idea-validation-worktree/
├── supabase/
│   └── migrations/
│       └── 20260403_add_credit_system.sql
├── src/
│   ├── types/
│   │   └── credit.ts
│   ├── hooks/
│   │   └── useCredits.ts
│   ├── components/
│   │   ├── CreditPurchase.tsx
│   │   ├── CreditCheck.tsx
│   │   └── index.ts
│   ├── app/
│   │   ├── api/
│   │   │   ├── payment/
│   │   │   │   ├── create/
│   │   │   │   │   └── route.ts
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts
│   │   │   └── generate-report/
│   │   │       └── route.ts (updated)
│   │   └── pricing/
│   │       └── page.tsx
│   ├── lib/
│   │   └── stripe.ts (updated)
│   └── __tests__/
│       └── credit-system.test.ts
├── .env.example (updated)
├── package.json (updated)
├── jest.config.js
├── CREDIT_SYSTEM.md
└── IMPLEMENTATION_SUMMARY.md (本文件)
```

## 下一步

1. **测试**
   - [ ] 配置 Stripe 测试账号
   - [ ] 测试支付流程
   - [ ] 测试 webhook 回调
   - [ ] 测试额度消耗

2. **支付宝/微信支付集成**
   - [ ] 申请支付宝 API
   - [ ] 申请微信支付 API
   - [ ] 实现二维码生成

3. **优化**
   - [ ] 添加额度过期提醒
   - [ ] 添加支付成功邮件通知
   - [ ] 添加发票功能

## 注意事项

1. **安全**
   - 所有数据库操作都有 RLS 保护
   - Webhook 需要验证签名
   - 不要在前端暴露 `SUPABASE_SERVICE_ROLE_KEY`

2. **成本**
   - API 调用会产生 Stripe 手续费（约 2%）
   - Supabase 免费额度足够初期使用

3. **扩展性**
   - 支持添加更多套餐
   - 支持订阅制（月卡/年卡）
   - 支持企业批量采购
