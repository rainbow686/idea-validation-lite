# 功能开发任务清单

## 差距分析总结

### 现有功能 ✅
- [x] 基础创意输入表单
- [x] 免费预览（分数 + 执行摘要）
- [x] 付费解锁完整报告
- [x] PDF 下载
- [x] Stripe 支付集成（一次性 + 订阅）
- [x] Supabase 数据库（users, reports, payments）

### 缺失功能（对比 IdeaProof）

#### P0 - 核心验证质量提升
| ID | 功能 | 优先级 | 预估工时 |
|----|------|--------|----------|
| P0-1 | SWOT 分析生成 | P0 | 30min |
| P0-2 | 目标受众画像 (ICP) | P0 | 30min |
| P0-3 | GO/NO-GO 明确建议 | P0 | 15min |
| P0-4 | 风险矩阵评估 | P0 | 30min |
| P0-5 | 收入模型建议 | P0 | 30min |

#### P1 - 用户体验增强
| ID | 功能 | 优先级 | 预估工时 |
|----|------|--------|----------|
| P1-1 | 报告分享链接 | P1 | 1hr |
| P1-2 | 创意历史列表 | P1 | 1hr |
| P1-3 | 可视化评分卡片 | P1 | 30min |
| P1-4 | 竞品对比图表 | P1 | 1hr |

#### P2 - 差异化创新
| ID | 功能 | 优先级 | 预估工时 |
|----|------|--------|----------|
| P2-1 | 免费计算器（TAM/SAM/SOM） | P2 | 2hr |
| P2-2 | 品牌原型分析（简化版） | P2 | 1hr |
| P2-3 | 营销文案生成 | P2 | 1hr |

---

## 开发任务详情

### P0-1: SWOT 分析生成
**文件**: `src/lib/report-generator.ts`
**修改**: 在 ValidationReport interface 中添加 `swotAnalysis` 字段
**AI Prompt**: 添加 SWOT 分析生成逻辑

### P0-2: 目标受众画像 (ICP)
**文件**: `src/lib/report-generator.ts`
**修改**: 添加 `targetAudience` 字段，包含 demographics, psychographics, pain points

### P0-3: GO/NO-GO 明确建议
**文件**: `src/lib/report-generator.ts`, `src/app/page.tsx`
**修改**: 添加 `goNoGoRecommendation` 字段，前端展示

### P0-4: 风险矩阵评估
**文件**: `src/lib/report-generator.ts`
**修改**: 添加 `riskMatrix` 字段，包含 risk level, impact, mitigation

### P0-5: 收入模型建议
**文件**: `src/lib/report-generator.ts`
**修改**: 添加 `revenueModelSuggestions` 字段

---

## 执行顺序

1. **先完成 P0 任务** - 提升报告质量
2. **然后 P1 任务** - 增强用户体验
3. **最后 P2 任务** - 差异化功能

---

## 技术决策

- **报告格式**: JSONB 存储完整报告
- **AI 模型**: Claude Sonnet 4 (默认) + Haiku 4.5 (快速模式)
- **数据库**: Supabase PostgreSQL
- **前端**: Next.js 14 + Tailwind CSS
- **部署**: Vercel

---

**创建日期**: 2026-04-01
**最后更新**: 2026-04-01
