import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api/axios'

export default function EditJob() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', requirements: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const token = localStorage.getItem('company_token')

  useEffect(() => {
    fetchJob()
  }, [])

  const fetchJob = async () => {
    try {
      const res = await API.get(`/jobs/${jobId}`)
      setForm({
        title: res.data.title,
        description: res.data.description,
        requirements: res.data.requirements
      })
    } catch (err) {
      setError('Failed to load job')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await API.put(`/jobs/${jobId}?token=${token}`, form)
      navigate('/company/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Loading job...</p>
    </div>
  )

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
            <h1 className="text-2xl font-bold">Edit Job</h1>
            <p className="text-gray-400 text-sm">Update the job details</p>
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
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Job Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
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
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition mt-2"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}