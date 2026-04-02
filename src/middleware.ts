import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// CORS 配置 - 允许 Vercel 前端访问
const ALLOWED_ORIGINS = [
  'https://idea-validation-lite.vercel.app',
  'https://idea-validation-lite-git-main-rainbow686-8727s-projects.vercel.app',
  'http://localhost:3000',
]

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || ''

  // Check if the origin is allowed
  const isAllowed = ALLOWED_ORIGINS.includes(origin)

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Handle regular requests
  const response = NextResponse.next()

  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Expose-Headers', 'Content-Type')
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
