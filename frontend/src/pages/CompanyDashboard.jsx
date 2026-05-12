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
              <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex justify-between items-center">
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
                <button
                  onClick={() => navigate(`/company/jobs/${job.id}/applications`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition ml-4 whitespace-nowrap"
                >
                  View CVs
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}