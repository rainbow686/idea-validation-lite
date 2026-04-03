# IdeaValidationLite 2.0 设计方案

**版本**: 2.0  
**创建日期**: 2026-04-01  
**最后更新**: 2026-04-03  
**状态**: ✅ 已实现

---

## 选定的设计方案：Variant C + Variant B 融合

### 设计理念
- **现代渐变风格**：emerald/teal/cyan 渐变，与 IdeaProof 的蓝色系形成差异化
- **数据驱动**：展示 120s、89%、500+ 等关键数据，建立信任
- **清晰的价值传达**："Don't Build Blind. Validate Your Idea First."
- **中文友好**：优化中文排版，支持中国大陆支付方式

---

## 颜色方案（2.0 更新）

### 主色调
```
主色：emerald-500 (#10B981), teal-500 (#14B8A6), cyan-500 (#06B6D4)
背景：emerald-50, gray-50, white
文字：gray-900, gray-600, gray-500
```

### 状态色
```
成功：emerald-500
警告：amber-500
错误：red-500
信息：blue-500
```

### 字体选择（支持中文）
```
英文：Inter, system-ui
中文：系统默认（PingFang SC, Microsoft YaHei）
代码：monospace
```

---

## 页面设计

### 1. 首页 (Landing Page)

#### Hero 区域
```
1. 背景：from-emerald-50 via-white to-white，带装饰性光晕
2. Badge：AI-Powered Validation — 89% Accuracy Rate
3. Headline: Don't Build Blind. / Validate Your Idea First.
   中文：盲目开发太冒险 · AI 验证你的创业想法
4. Stats: 120s Analysis Time, 89% Accuracy Rate, 500+ Ideas Validated
5. 输入框：集成在 Hero 中，一行式布局
6. 信任指标：Free preview, No credit card, Instant PDF
7. 功能 Pills: TAM/SAM/SOM, SWOT, GO/NO-GO, Risk Matrix, Revenue Models, Competitor Research
```

#### "我没有想法" 功能（新增）
```
位置：Hero 输入框下方
样式：幽灵按钮 "我没有想法 → 生成创意"
交互：点击弹出创意生成器模态框
```

#### How It Works
```
- 卡片式布局，白色背景，圆角 xl
- 数字图标：w-12 h-12 bg-emerald-100 rounded-xl
- 3 步骤：输入想法 → AI 分析 → 获取报告
```

#### Pricing（2.0 更新）
```
标题：Simple, Transparent Pricing

套餐：
1. Free - ¥0
   - 3 次免费验证
   - 基础分数 + 执行摘要
   
2. 按次付费 - ¥9.9/次（推荐）
   - 完整验证报告
   - PDF 下载
   - 无订阅压力
   
3. 月度订阅 - ¥99/月
   - 12 次验证（送 2 次）
   - 优先支持
   - 创意库访问
```

---

### 2. 创意输入页

#### 表单设计
```
- 创意标题输入框
- 创意描述多行文本框
- 行业分类下拉框（可选）
- 目标用户描述（可选）
- 提交按钮："免费验证"（emerald 渐变）
```

#### "我没有想法" 模态框（新增）
```
- 行业过滤器下拉框
- 投资金额范围选择
- "生成 10 个创意" 按钮
- 创意卡片网格展示（2 列）
- 每个创意卡片：
  - 标题 + 难度标签
  - 简短描述
  - 行业/用户/痛点/盈利模式
  - "验证这个创意" 按钮
```

---

### 3. 报告展示页（2.0 更新）

#### 分数展示
```
- 大号圆形进度条显示总体分数（0-100）
- 分数颜色：>80 绿色，60-80 黄色，<60 红色
- GO/NO-GO 建议徽章
```

#### 详细分析模块
```
1. 执行摘要（免费预览）
2. SWOT 分析（4 象限卡片）
3. 目标受众画像（ICP 卡片）
4. 市场规模（TAM/SAM/SOM 图表）
5. 竞品分析（对比表格）
6. 风险矩阵（HIGH/MEDIUM/LOW 标签）
7. 收入模型建议（多选项对比）
8. GO/NO-GO 建议 + 关键条件
```

#### PDF 下载（付费功能）
```
- 锁定状态：灰色按钮 + "解锁完整报告" 提示
- 解锁后：emerald 按钮 "下载 PDF 报告"
```

---

### 4. 创意库页面（新增）

#### 页面布局
```
- 顶部筛选栏：行业、难度、排序
- 卡片网格：3 列响应式
- 每张卡片：
  - 标题 + 行业标签
  - 难度分数（1-10）
  - 浏览量、验证数
  - "查看详情" 按钮
```

#### 筛选器
```
- 行业：AI/电商/教育/健康/金融/...
- 难度：全部 / 容易 (1-3) / 中等 (4-6) / 困难 (7-10)
- 排序：最新 / 最热 / 验证最多
```

---

### 5. 行业落地页（新增）

#### SEO 优化设计
```
- 行业标题 + 描述
- 该行业的热门创意列表
- 该行业的验证成功案例
- CTA："验证你的 [行业] 创意"
```

---

### 6. 分享功能（新增）

#### 分享模态框
```
- 分享渠道按钮：
  - 微信好友
  - 朋友圈
  - 微博
  - Twitter
  - LinkedIn
  - 复制链接
- 分享海报预览（带二维码）
```

#### 邀请奖励（新增）
```
- 邀请码展示
- 已邀请人数统计
- 获得的奖励 credits
- 邀请链接（一键复制）
```

---

## 组件样式规范

### 按钮
```css
/* 主按钮 */
.btn-primary {
  @apply px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500
         text-white rounded-xl font-semibold
         hover:from-emerald-600 hover:to-teal-600
         shadow-lg shadow-emerald-500/25
         transition;
}

/* 次级按钮 */
.btn-secondary {
  @apply px-6 py-3 bg-white border-2 border-emerald-200
         text-emerald-600 rounded-xl font-semibold
         hover:border-emerald-300 hover:bg-emerald-50
         transition;
}

/* 幽灵按钮 */
.btn-ghost {
  @apply px-4 py-2 text-gray-600 rounded-lg
         hover:bg-gray-100 transition;
}
```

### 卡片
```css
.card {
  @apply bg-white rounded-xl border border-gray-200
         hover:border-emerald-300 hover:shadow-md
         transition;
}
```

### 输入框
```css
.input {
  @apply w-full px-4 py-3 rounded-xl
         border border-gray-200
         focus:ring-2 focus:ring-emerald-500
         focus:border-transparent
         text-gray-900;
}
```

### Badge
```css
.badge-success {
  @apply px-2 py-1 bg-emerald-100 text-emerald-700
         text-xs font-medium rounded-full;
}

.badge-warning {
  @apply px-2 py-1 bg-amber-100 text-amber-700
         text-xs font-medium rounded-full;
}

.badge-danger {
  @apply px-2 py-1 bg-red-100 text-red-700
         text-xs font-medium rounded-full;
}
```

---

## 响应式断点

```css
/* 移动端优先 */
/* 小屏手机 */
@media (max-width: 375px) { ... }

/* 大屏手机 */
@media (min-width: 376px) { ... }

/* 平板 */
@media (min-width: 768px) {
  /* 2 列布局 */
  .grid-ideas { grid-template-columns: repeat(2, 1fr); }
}

/* 桌面 */
@media (min-width: 1024px) {
  /* 3 列布局 */
  .grid-ideas { grid-template-columns: repeat(3, 1fr); }
  /* Hero 大标题 */
  .hero-title { font-size: 3rem; }
}

/* 大屏幕 */
@media (min-width: 1280px) { ... }
```

---

## 与 IdeaProof 的差异化（2.0 更新）

| 维度 | IdeaProof | IdeaValidationLite 2.0 |
|------|-----------|------------------------|
| 主色 | 蓝色系 | Emerald/Teal 渐变 |
| 风格 | 传统 SaaS | 现代简约 |
| 定价 | €19-€99/月 | ¥9.9/次 + ¥99/月 |
| CTA | 多步骤 | 集成输入框，一步完成 |
| 数据展示 | 评分 | 120s, 89%, 500+ |
| 创意生成 | ❌ | ✅ "我没有想法" 功能 |
| 创意库 | ❌ | ✅ 公开创意库 |
| 分享功能 | 基础 | 海报 + 邀请奖励 |
| 中文支持 | ❌ | ✅ 完整支持 |

---

## 设计资源

### Tailwind 配置
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        emerald: { /* ... */ },
        teal: { /* ... */ },
        cyan: { /* ... */ },
      },
    },
  },
}
```

### 图标库
- Heroicons（主要图标）
- Lucide React（备用）

### 动画
- CSS transitions（主要）
- Tailwind animate（加载状态）

---

## 设计审查清单

- [x] 颜色一致性
- [x] 字体可读性（中英文）
- [x] 响应式布局
- [x] 无障碍访问（a11y）
- [x] 加载状态
- [x] 错误状态
- [x] 空状态

---

**最后审查**: 2026-04-03  
**审查结果**: ✅ 设计与实现一致
