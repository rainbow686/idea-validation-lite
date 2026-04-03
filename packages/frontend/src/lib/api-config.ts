/**
 * API 配置
 *
 * 开发环境：使用本地 API (localhost:3000)
 * 生产环境：使用 Render API（无超时限制，支持 60-90 秒 AI 报告生成）
 */

// 从环境变量获取 Render API URL
const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL

// 默认 Render API URL（如果环境变量未配置）
const DEFAULT_RENDER_API_URL = 'https://idea-validation-lite.onrender.com'

// 默认本地 API URL
const LOCAL_API_URL = 'http://localhost:3000'

/**
 * 获取 API 基础 URL
 *
 * 注意：这是一个同步函数，在浏览器端会根据 hostname 判断环境
 * 在服务器端（SSR/SSG）会返回 Render API URL
 */
export const getApiBaseUrl = (): string => {
  // 服务器端渲染时返回 Render URL
  if (typeof window === 'undefined') {
    return RENDER_API_URL || DEFAULT_RENDER_API_URL
  }

  // 浏览器端根据 hostname 判断
  const isLocalhost = window.location.hostname === 'localhost'
  return isLocalhost ? LOCAL_API_URL : (RENDER_API_URL || DEFAULT_RENDER_API_URL)
}

// 导出常量，供组件直接使用
export const API_BASE_URL = getApiBaseUrl()
