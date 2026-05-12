import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function CompanyDashboard() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('company_token')

  useEffect(() => {
    if (!token) { navigate('/company/login'); return }
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await API.get(`/jobs/my-jobs?token=${token}`)
      setJobs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
        await API.put(`/jobs/${jobId}/toggle-status?token=${token}`)
        fetchJobs()
    } catch (err) {
        console.error(err)
    }
    }

    const handleDelete = async (jobId) => {
    const confirmed = window.confirm('Are you sure you want to delete this job? This cannot be undone.')
    if (!confirmed) return
    try {
        await API.delete(`/jobs/${jobId}?token=${token}`)
        fetchJobs()
    } catch (err) {
        console.error(err)
    }
    }

  const handleLogout = () => {
    localStorage.removeItem('company_token')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Company Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your job postings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/company/post-job')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Post Job
            </button>
            <button
              onClick={handleLogout}
              className="border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Jobs</p>
            <p className="text-3xl font-bold mt-1">{jobs.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Active Jobs</p>
            <p className="text-3xl font-bold mt-1 text-green-400">
              {jobs.filter(j => j.is_active === 'active').length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Closed Jobs</p>
            <p className="text-3xl font-bold mt-1 text-gray-500">
              {jobs.filter(j => j.is_active === 'closed').length}
            </p>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 mb-4">No jobs posted yet</p>
            <button
              onClick={() => navigate('/company/post-job')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
            >
              Post your first job
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map(job => (
            <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">

                {/* Top row — title and status */}
                <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold">{job.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                        job.is_active === 'active'
                        ? 'bg-green-900 text-green-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                        {job.is_active}
                    </span>
                    </div>
                    <p className="text-gray-400 text-sm">{job.requirements}</p>
                    <p className="text-gray-600 text-xs mt-1">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                <button
                    onClick={() => navigate(`/company/bulk-upload/${job.id}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition"
                >
                    📂 Bulk Upload CVs
                </button>
                <button
                    onClick={() => navigate(`/company/jobs/${job.id}/applications`)}
                    className="border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-3 py-2 rounded-lg text-sm transition"
                >
                    👁 View Ranked
                </button>
                <button
                    onClick={() => navigate(`/company/edit-job/${job.id}`)}
                    className="border border-yellow-700 text-yellow-400 hover:bg-yellow-700 hover:text-white px-3 py-2 rounded-lg text-sm transition"
                >
                    ✏️ Edit
                </button>
                <button
                    onClick={() => handleToggleStatus(job.id, job.is_active)}
                    className={`px-3 py-2 rounded-lg text-sm transition border ${
                    job.is_active === 'active'
                        ? 'border-orange-700 text-orange-400 hover:bg-orange-700 hover:text-white'
                        : 'border-green-700 text-green-400 hover:bg-green-700 hover:text-white'
                    }`}
                >
                    {job.is_active === 'active' ? '🔒 Close Job' : '🔓 Reopen Job'}
                </button>
                <button
                    onClick={() => handleDelete(job.id)}
                    className="border border-red-800 text-red-400 hover:bg-red-800 hover:text-white px-3 py-2 rounded-lg text-sm transition"
                >
                    🗑 Delete
                </button>
                </div>

            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}