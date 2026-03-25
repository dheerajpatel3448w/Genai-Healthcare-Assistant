export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <span className="text-3xl font-bold text-white">H+</span>
            </div>
            <h1 className="text-4xl font-bold text-white">GenAI Healthcare Assistant</h1>
            <p className="text-lg text-slate-300">Frontend Status Check</p>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4">
            {/* Frontend Status */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <h3 className="font-semibold text-emerald-300">Frontend Status</h3>
              </div>
              <p className="text-sm text-emerald-200">✓ Next.js frontend is running successfully</p>
            </div>

            {/* API Status */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="font-semibold text-blue-300">Backend Status</h3>
              </div>
              <p className="text-sm text-blue-200">Configure backend URL in .env.local</p>
              <p className="text-xs text-blue-400 mt-2">NEXT_PUBLIC_API_URL=http://localhost:3001</p>
            </div>

            {/* Configuration */}
            <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4 space-y-3">
              <h3 className="font-semibold text-slate-200">Quick Start</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>✓ <strong>Frontend:</strong> Running on http://localhost:3000</li>
                <li>• <strong>Login Page:</strong> <a href="/login" className="text-blue-400 hover:text-blue-300 underline">/login</a></li>
                <li>• <strong>Register Page:</strong> <a href="/register" className="text-blue-400 hover:text-blue-300 underline">/register</a></li>
              </ul>
            </div>

            {/* Features */}
            <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4 space-y-3">
              <h3 className="font-semibold text-slate-200">Available Features</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>✓ User authentication (Patient & Doctor roles)</li>
                <li>✓ AI-powered chat interface (HealthBrain & DoctorBrain)</li>
                <li>✓ Appointment management system</li>
                <li>✓ Medical records management</li>
                <li>✓ Doctor directory & booking</li>
                <li>✓ User profile management</li>
              </ul>
            </div>

            {/* Backend Services */}
            <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4 space-y-3">
              <h3 className="font-semibold text-slate-200">Backend Services Required</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p><strong>Auth Service</strong> (Port 3001) - User authentication</p>
                <p><strong>User Service</strong> (Port 3002) - User profiles</p>
                <p><strong>Appointment Service</strong> (Port 3003) - Appointment management</p>
                <p><strong>Doctor Service</strong> (Port 3004) - Doctor information</p>
                <p><strong>AI Service</strong> (Port 3005) - AI chat & analysis</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-center pt-8">
            <a
              href="/login"
              className="inline-flex px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Go to Login
            </a>
            <a
              href="/register"
              className="inline-flex px-6 py-3 rounded-lg border border-blue-600 text-blue-400 hover:bg-blue-600/10 font-semibold transition"
            >
              Go to Register
            </a>
          </div>

          {/* Footer */}
          <div className="pt-8 text-center text-xs text-slate-400">
            <p>Frontend v1.0 | GenAI Healthcare Assistant</p>
            <p className="mt-2">This page is for debugging. Remove it in production.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
