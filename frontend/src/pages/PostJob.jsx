import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', requirements: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('company_token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await API.post(`/jobs/?token=${token}`, form)
      navigate('/company/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-8">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg">

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/company/dashboard')}
            className="text-gray-500 hover:text-white transition"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold">Post a Job</h1>
            <p className="text-gray-400 text-sm">Fill in the job details below</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Job Title</label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Job Description</label>
            <textarea
              placeholder="Describe the role, responsibilities and what you are looking for..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Required Skills
              <span className="text-gray-600 ml-1">(comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Python, FastAPI, PostgreSQL, 2 years experience"
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
            <p className="text-gray-600 text-xs mt-1">
              The AI uses these to score and rank candidates
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition mt-2"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  )
}