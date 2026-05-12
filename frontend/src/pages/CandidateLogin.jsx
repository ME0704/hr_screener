import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function CandidateLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/auth/candidate/login', form)
      localStorage.setItem('candidate_token', res.data.access_token)
      navigate('/candidate/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">

        <div className="text-3xl mb-2 text-center">👤</div>
        <h1 className="text-2xl font-bold text-center mb-1">Candidate Login</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Welcome back</p>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="john@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          No account?{' '}
          <span
            onClick={() => navigate('/candidate/register')}
            className="text-green-400 cursor-pointer hover:underline"
          >
            Register here
          </span>
        </p>

        <p className="text-center text-gray-600 text-sm mt-2">
          <span onClick={() => navigate('/')} className="cursor-pointer hover:text-gray-400">
            ← Back to Home
          </span>
        </p>
      </div>
    </div>
  )
}