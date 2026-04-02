# 架构决策记录 (ADR)

**日期**: 2026-04-03  
**项目**: Idea Validation Lite  
**决策**: 前后端分离部署架构

---

## 决策内容

采用 **前后端分离部署** 架构：
- **前端**: Vercel Hobby (免费)
- **后端**: Render Free (免费)
- **数据库**: Supabase Free (免费)

---

## 架构图

```
┌───────────────────────────────────────────────────────────┐
│                      用户访问                              │
│   https://idea-validation-lite.vercel.app                 │
└───────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (前端页面)
                            ▼
┌───────────────────────────────────────────────────────────┐
│  前端：Vercel Hobby (免费)                                 │
│  - CDN 全球分发 (边缘节点缓存)                              │
│  - 静态资源优化                                            │
│  - 自动 HTTPS                                              │
│  - 100GB 带宽/月                                           │
└───────────────────────────────────────────────────────────┘
                            │
                            │ API 调用 (跨域请求)
                            │ fetch('https://xxx.onrender.com/api/generate-report')
                            ▼
┌───────────────────────────────────────────────────────────┐
│  后端：Render Free (免费)                                  │
│  - 无超时限制 (Vercel 限制 60 秒)                            │
│  - 支持 60-90 秒 AI 报告生成                                 │
│  - 512MB 内存 / 750 小时/月                                 │
│  - CORS 中间件配置允许 Vercel 域名访问                       │
└───────────────────────────────────────────────────────────┘
                            │
                            │ PostgreSQL
                            ▼
┌───────────────────────────────────────────────────────────┐
│  数据库：Supabase Free                                     │
│  - 用户表 (users)                                          │
│  - 报告表 (reports)                                        │
│  - 支付表 (payments)                                       │
│  - 500MB 存储                                              │
└───────────────────────────────────────────────────────────┘
```

---

## 决策原因

### 为什么分离部署？

| 考量 | Vercel (前端) | Render (后端) | 分离的收益 |
|------|---------------|---------------|------------|
| **核心能力** | CDN 静态资源分发 | 长时间运行任务 | 各自发挥优势 |
| **超时限制** | N/A (静态资源) | **无限制** | 后端可运行 60-90 秒 AI 任务 |
| **免费额度** | 100GB 带宽/月 | 512MB 内存 + 750 小时/月 | 两者免费额度都够用 |
| **全球延迟** | 边缘节点缓存 (~50ms) | 单区域 (~200ms) | 前端页面加载更快 |
| **成本** | $0/月 | $0/月 | **零成本启动** |

### 为什么不单体部署？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **单体 Render** | 简单，无需 CORS | 前端不走 CDN，全球加载慢 |
| **分离部署** | 前端 CDN 加速 + 后端无超时 | 需要配置 CORS 和环境变量 |

**结论**: 分离部署在零成本前提下，提供了最佳的用户体验（前端快）和技术可行性（后端无超时）。

---

## 技术方案

### 前端技术栈
- **框架**: Next.js 14 (App Router)
- **部署**: Vercel Hobby
- **优化**: 静态生成 + ISR
- **API 调用**: fetch 到 Render 后端

### 后端技术栈
- **框架**: Next.js 14 (API Routes)
- **部署**: Render Free
- **运行**: Node.js + server.js (自定义服务器)
- **AI**: Alibaba Cloud Qwen3.5-Plus
- **搜索**: Tavily Search API

### 关键配置

#### 前端环境变量 (Vercel)
```env
NEXT_PUBLIC_RENDER_API_URL=https://idea-validation-api.onrender.com
```

#### 后端环境变量 (Render)
```env
NODE_ENV=production
ANTHROPIC_API_KEY=sk-sp-xxx
ANTHROPIC_BASE_URL=https://coding.dashscope.aliyuncs.com/apps/anthropic
TAVILY_API_KEY=tvly-dev-xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

#### CORS 配置 (src/middleware.ts)
```typescript
const ALLOWED_ORIGINS = [
  'https://idea-validation-lite.vercel.app',
  'http://localhost:3000',
]
```

---

## 权衡分析

### 优点 ✅
1. **前端加载快** - Vercel CDN 全球分发
2. **后端无超时** - Render 支持长时间 AI 任务
3. **零成本启动** - 所有服务都在免费层
4. **独立扩展** - 前后端可以独立升级/扩容
5. **专业分工** - 每个平台做自己擅长的事

### 缺点 ⚠️
1. **配置复杂** - 需要管理两个部署平台
2. **CORS 问题** - 需要正确配置跨域
3. **环境变量翻倍** - 两套环境配置
4. **首次请求慢** - Render 免费层有 Sleep 机制

### 未来优化方向
| 问题 | 解决方案 | 触发条件 |
|------|----------|----------|
| Render Sleep | UptimeRobot 保活 | 用户反馈首次加载慢 |
| 环境变量管理 | 迁移到 Doppler 等工具 | 环境变量超过 10 个 |
| CORS 配置 | 添加更多允许域名 | 需要支持自定义域名 |
| 成本上升 | 升级到付费计划 | 月收入 > $100 |

---

## 部署命令

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器 (前后端一起)
npm run dev

# 访问 http://localhost:3000
```

### 部署后端 (Render)
```bash
# 推送代码
git push origin main

# Render 自动部署 (配置了 Auto-Deploy)
# 或者手动触发：Dashboard → Manual Deploy
```

### 部署前端 (Vercel)
```bash
# 推送代码
git push origin main

# Vercel 自动部署 (配置了 Git 集成)
# 或者手动触发：vercel --prod
```

---

## 监控指标

| 指标 | 目标值 | 告警阈值 |
|------|--------|----------|
| 前端加载时间 | < 2s | > 5s |
| API 响应时间 | 60-90s | > 120s |
| API 错误率 | < 1% | > 5% |
| 月度成本 | ¥50 | > ¥200 |

---

## 决策记录

| 日期 | 变更 | 原因 |
|------|------|------|
| 2026-04-01 | 初始架构：单体 Vercel | 快速上线 MVP |
| 2026-04-02 | 发现问题：Vercel 60 秒超时 | API 调用失败 |
| 2026-04-03 | 决定分离部署 | Vercel Hobby 无法支持长任务 |
| 2026-04-03 | 实施：前端 Vercel + 后端 Render | 零成本 + 无超时限制 |

---

## 相关文档

- [部署文档](./DEPLOY.md) - 详细部署步骤
- [检查清单](./CHECKLIST.md) - 部署前检查
- [README](./README.md) - 项目说明

---

**决策状态**: ✅ 已实施  
**下次审查**: 2026-05-03 (或月收入超过 $100 时)
