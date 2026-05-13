import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">

      <div className="mb-4 text-5xl">🧠</div>
      <h1 className="text-4xl font-bold mb-2 text-center">HR CV Screener</h1>
      <p className="text-gray-400 mb-12 text-center text-lg">
        AI-powered recruitment — find the best candidates instantly
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">

        {/* Company Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="text-4xl">🏢</div>
          <h2 className="text-xl font-semibold">I'm a Company</h2>
          <p className="text-gray-400 text-sm text-center">
            Post jobs and let AI rank your candidates automatically
          </p>
          <button
            onClick={() => navigate('/company/login')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
          >
            Company Login
          </button>
          <button
            onClick={() => navigate('/company/register')}
            className="w-full border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white py-2 rounded-lg font-medium transition"
          >
            Register Company
          </button>
        </div>

        {/* Candidate Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="text-4xl">👤</div>
          <h2 className="text-xl font-semibold">I'm a Candidate</h2>
          <p className="text-gray-400 text-sm text-center">
            Browse jobs and apply with your CV in seconds
          </p>
          <button
            onClick={() => navigate('/candidate/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
          >
            Candidate Login
          </button>
          <button
            onClick={() => navigate('/candidate/register')}
            className="w-full border border-green-600 text-green-400 hover:bg-green-600 hover:text-white py-2 rounded-lg font-medium transition"
          >
            Register as Candidate
          </button>
        </div>

      </div>
      <p className="mt-8 text-gray-500 text-sm">
        <span
            onClick={() => navigate('/pricing')}
            className="text-purple-400 cursor-pointer hover:underline"
        >
            View Pricing Plans
        </span>
        </p>
    </div>
  )
}