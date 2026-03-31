export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            IdeaValidation<span className="text-emerald-500">Lite</span> Dashboard
          </h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
          <p className="text-gray-600 mb-4">Your validation reports will appear here.</p>
          <a href="/" className="text-emerald-500 hover:text-emerald-600 font-medium">
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  )
}
