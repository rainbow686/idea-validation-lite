# Tavily Search API 配置指南

## 为什么选择 Tavily 而不是 Google Search？

| 维度 | Google Custom Search | Tavily |
|------|---------------------|--------|
| **免费额度** | 100 次/天 | 1000 次/月 |
| **配置复杂度** | 高（需要 Google Cloud + Search Engine） | 低（只需 API Key） |
| **API 设计** | 通用搜索 | 专为 AI/LLM 优化 |
| **结果质量** | 一般 | 更好（去重、摘要） |
| **Setup 时间** | 15-20 分钟 | 2 分钟 |

**结论**：对于 MVP 阶段，**Tavily 更简单快速**。

---

## 配置步骤

### 步骤 1: 获取 API Key

1. 访问 [Tavily Dashboard](https://app.tavily.com/home)
2. 注册/登录账号
3. 复制 API Key（格式：`tvly-...`）

### 步骤 2: 配置环境变量

在 `.env.local` 文件中添加：

```bash
# Tavily Search API
TAVILY_API_KEY=tvly-dev-...  # 你的 API Key
```

### 步骤 3: Vercel 生产环境配置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 "idea-validation-lite"
3. Settings > Environment Variables
4. 添加 `TAVILY_API_KEY` 变量
5. 点击 "Save"
6. **重新部署项目**（Deployments > Redeploy）

---

## 测试配置

### 本地测试

```bash
npm run dev
```

1. 访问 http://localhost:3000
2. 输入一个创业创意（例如："AI-powered task manager for developers"）
3. 点击 "Analyze Free"
4. 检查控制台输出
   - 如果看到 Tavily API 响应数据，说明配置成功

---

## 免费额度

Tavily 免费额度：
- **每月 1000 次搜索** 免费
- 超出后：$19 每 1000 次搜索

我们的使用情况：
- 每次报告生成 = 4 次搜索（市场 + 竞品 + Reddit + 替代方案）
- 免费额度可支持：**每月 250 份报告**

对于 MVP 阶段完全够用。

---

## API 参数说明

Tavily 提供专为 AI 优化的参数：

```javascript
fetch('https://api.tavily.com/search', {
  method: 'POST',
  body: JSON.stringify({
    api_key: TAVILY_API_KEY,
    query: 'your search query',
    search_depth: 'advanced',  // basic 或 advanced
    max_results: 5,            // 返回结果数量
    include_answer: false,     // 是否需要 AI 生成的答案
    include_raw_content: false // 是否需要原始内容
  })
})
```

---

## 与 Google Search 的代码对比

**Google Search:**
```typescript
const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}`
const response = await fetch(url)
const data = await response.json()
return data.items.map(item => ({ title: item.title, snippet: item.snippet, link: item.link }))
```

**Tavily:**
```typescript
const response = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  body: JSON.stringify({
    api_key: tavilyApiKey,
    query,
    search_depth: 'advanced',
    max_results: 5
  })
})
const data = await response.json()
return data.results.map(item => ({ title: item.title, snippet: item.content, link: item.url }))
```

---

## 常见问题

### Q: Tavily 搜索结果不准确怎么办？

A: 调整 `search_depth` 参数：
- `basic` - 快速搜索，结果较少
- `advanced` - 深度搜索，结果更相关（默认）

### Q: 搜索速度慢怎么办？

A: Tavily 的 advanced 模式需要 2-3 秒，比 Google 稍慢但质量更好。可以考虑：
- 减少搜索查询数量
- 使用 `basic` 模式

### Q: 超出免费额度怎么办？

A: 升级计划或优化搜索：
- 合并相似查询
- 减少每次报告的搜索次数（从 4 次减到 2-3 次）

---

**创建日期**: 2026-04-01  
**状态**: ✅ 已配置  
**API Key**: `tvly-REDACTED`
