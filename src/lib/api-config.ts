/**
 * API 配置
 *
 * 开发环境：使用本地 API
 * 生产环境：使用 Render API
 */
const API_CONFIG = {
  // 本地开发
  local: 'http://localhost:3000',

  // Render 生产环境
  // 替换为你的 Render 服务 URL
  production: process.env.NEXT_PUBLIC_API_URL || 'https://idea-validation-api.onrender.com',
}

// 自动检测环境
const getApiUrl = () => {
  // 在浏览器端，根据 hostname 判断
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost'
    return isLocalhost ? API_CONFIG.local : API_CONFIG.production
  }
  // 服务器端默认使用 production
  return API_CONFIG.production
}

export const API_BASE_URL = getApiUrl()
