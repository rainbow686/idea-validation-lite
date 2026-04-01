# Google Search API 配置指南

## 为什么需要 Google Search API？

当前 AI 分析报告质量不高的**核心原因**：没有真实的互联网数据输入。

没有配置 Google Search API 时，AI 收到的是**假数据**（mock data），生成的分析自然不准确、不具体、无法反映真实市场情况。

配置后，AI 会：
1. 搜索真实的市场规模数据（TAM/SAM/SOM）
2. 查找真实的竞争对手信息
3. 抓取 Reddit/论坛上的真实用户讨论
4. 分析用户当前的替代方案（status quo）

---

## 配置步骤

### 步骤 1: 创建 Google Cloud Project

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击 "Create Project"
3. 项目名称：例如 "idea-validation-search"
4. 等待项目创建完成

### 步骤 2: 启用 Custom Search API

1. 在项目控制台，搜索 "Custom Search API"
2. 点击 "Enable"
3. 等待 API 启用完成

### 步骤 3: 创建 API Key

1. 进入 "APIs & Services" > "Credentials"
2. 点击 "+ CREATE CREDENTIALS" > "API key"
3. 复制 API Key（格式：`AIzaSy...`）
4. **重要**: 点击 "Edit API key" > "Restrict key"
   - Application restrictions: HTTP referrers
   - Add referrer: `https://idea-validation-lite.vercel.app/*`
   - API restrictions: Custom Search API only

### 步骤 4: 创建 Search Engine

1. 访问 [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. 点击 "Add" 或 "Create"
3. 配置：
   - **What to search**: "Search the entire web"
   - **Name**: "Idea Validation Search Engine"
   - **Public search engine**: 关闭
4. 点击 "Create"
5. 复制 Search Engine ID（格式：`xxxxxxxxx:yyyyyyyyy`）

### 步骤 5: 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Google Search API
GOOGLE_SEARCH_API_KEY=AIzaSy...  # 你的 API Key
GOOGLE_SEARCH_ENGINE_ID=xxxxxxxxx:yyyyyyyyy  # 你的 Search Engine ID

# Anthropic API (如果使用阿里云 Coding Plan，这个指向阿里云)
ANTHROPIC_API_KEY=your-aliyun-api-key
```

**注意**: `.env.local` 已在 `.gitignore` 中，不会被提交到 Git

### 步骤 6: Vercel 生产环境配置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 "idea-validation-lite"
3. Settings > Environment Variables
4. 添加以下变量：
   - `GOOGLE_SEARCH_API_KEY`
   - `GOOGLE_SEARCH_ENGINE_ID`
   - `ANTHROPIC_API_KEY`
5. 点击 "Save"
6. **重新部署项目**（Deployments > Redeploy）

---

## 测试配置

### 本地测试

```bash
cd /Users/sunbin/myclaude/idea-validation-lite
npm run dev
```

1. 访问 http://localhost:3000
2. 输入一个创业创意（例如："AI-powered task manager for developers"）
3. 点击 "Analyze Free"
4. 检查控制台输出（`npm run dev` 的终端）
   - 如果看到 "Google Search API not configured"，说明配置失败
   - 如果没有警告，且分析报告包含具体数据，说明配置成功

### 验证搜索结果

在代码中添加临时日志查看搜索数据：

```typescript
// 在 report-generator.ts 的 generateValidationReport 函数中
console.log('Market search results:', marketSearch)
console.log('Competitor search results:', competitorSearch)
```

如果看到真实的搜索结果（有 title、snippet、link 数据），说明配置正确。

---

## 免费额度

Google Custom Search API 免费额度：
- **每天 100 次搜索** 免费
- 超出后：$5 每 1000 次搜索

我们的使用情况：
- 每次报告生成 = 4 次搜索（市场 + 竞品 + Reddit + 替代方案）
- 免费额度可支持：**每天 25 份报告**

对于 MVP 阶段完全够用。后续可以根据使用情况调整。

---

## 常见问题

### Q: 搜索结果是空的怎么办？

A: 检查以下几点：
1. API Key 是否正确（应该以 `AIzaSy` 开头）
2. Search Engine ID 格式是否正确（`xxxxxxxxx:yyyyyyyyy`）
3. Search Engine 是否配置为 "Search the entire web"
4. API 是否已启用（Custom Search API）

### Q: 搜索速度很慢怎么办？

A: 优化搜索查询：
- 当前代码已使用 `Promise.all` 并行搜索 4 个查询
- 如果还是很慢，可以减少查询数量（移除 workaroundSearch）

### Q: 搜索结果质量不高怎么办？

A: 优化搜索关键词：
- 当前 Prompt 已优化为包含 ideaTitle 和 ideaDescription
- 可以在 report-generator.ts 中调整搜索查询语句

---

## 替代方案：如果不配置 Google Search

如果暂时不想配置 Google Search API，可以：

1. **使用 AI 内部知识** - 修改 Prompt 让 AI 基于训练数据生成分析
2. **手动输入市场数据** - 让用户提供市场研究数据
3. **使用其他搜索 API** - 如 Bing Search API、Serper API 等

但**强烈建议配置 Google Search API**，这是生成高质量分析报告的核心基础设施。

---

**创建日期**: 2026-04-01  
**状态**: 待配置  
**负责人**: @sunbin
