/**
 * API 配置
 *
 * 开发环境：使用本地 API (localhost:3000)
 * 生产环境：使用 Render API
 */

// 从环境变量获取 Render API URL
const RENDER_API_URL = process.env.NEXT_PUBLIC_RENDER_API_URL

// 自动检测环境
export const getApiBaseUrl = () => {
  // 浏览器端
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost'
    if (isLocalhost) {
      return 'http://localhost:3000'
    }
    // 生产环境（Vercel）使用 Render API
    return RENDER_API_URL || ''
  }
  // 服务器端默认返回空（生产环境应该配置了环境变量）
  return RENDER_API_URL || ''
}

export const API_BASE_URL = getApiBaseUrl()
