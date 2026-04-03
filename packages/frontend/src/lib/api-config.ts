/**
 * API 配置
 *
 * 开发环境：使用本地 API (localhost:3000)
 * 生产环境：使用 Render API（无超时限制，支持 60-90 秒 AI 报告生成）
 */

// 从环境变量获取 Render API URL
const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL

// 默认 Render API URL（如果环境变量未配置）
const DEFAULT_RENDER_API_URL = 'https://idea-validation-api.onrender.com'

// 自动检测环境
export const getApiBaseUrl = () => {
  // 浏览器端
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost'
    if (isLocalhost) {
      return 'http://localhost:3000'
    }
    // 生产环境（Vercel）使用 Render API
    return RENDER_API_URL || DEFAULT_RENDER_API_URL
  }
  // 服务器端默认使用 Render API
  return DEFAULT_RENDER_API_URL
}

export const API_BASE_URL = getApiBaseUrl()
