'use client'

import { CreditPurchase } from '@/components/CreditPurchase'
import { CreditBalance } from '@/components/CreditCheck'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              IdeaValidation<span className="text-emerald-500">Lite</span>
            </h1>
            <nav className="flex items-center gap-4">
              <CreditBalance />
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                返回首页
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">灵活付费，随用随买</h2>
          <p className="text-lg opacity-90">
            无需订阅，按次付费。每个报告仅需 ¥9.9
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <CreditPurchase />

        {/* Pricing Comparison */}
        <div className="mt-12 bg-white rounded-xl shadow p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">为什么选择按次付费？</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">其他产品</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">€70/月（约¥550/月）</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">必须订阅才能使用</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">用不用都要付钱</span>
                </li>
              </ul>
            </div>
            <div className="border rounded-lg p-6 border-emerald-200 bg-emerald-50">
              <h4 className="font-bold text-emerald-700 mb-4">我们的产品</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">¥9.9/次，用多少付多少</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">免费赠送 3 次体验</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">套餐优惠，最低¥8.25/次</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-xl shadow p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">常见问题</h3>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">额度会过期吗？</h4>
              <p className="text-gray-600 text-sm">不会，您购买的额度永久有效，可以隨時使用。</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">可以退款吗？</h4>
              <p className="text-gray-600 text-sm">在未使用额度的情况下，我们支持 7 天内无理由退款。</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">支持哪些支付方式？</h4>
              <p className="text-gray-600 text-sm">目前支持支付宝、微信支付和信用卡支付。</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">免费额度怎么用？</h4>
              <p className="text-gray-600 text-sm">新用户注册后自动获得 3 次免费额度，无需绑定支付方式。</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 IdeaValidation Lite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
