import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function MyApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('candidate_token')

  useEffect(() => {
    if (!token) { navigate('/candidate/login'); return }
    fetchMyApplications()
  }, [])

  const fetchMyApplications = async () => {
    try {
      const res = await API.get(`/cvs/my-applications?token=${token}`)
      setApplications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    if (score >= 30) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-900 text-green-400'
      case 'rejected': return 'bg-red-900 text-red-400'
      case 'interviewed': return 'bg-blue-900 text-blue-400'
      default: return 'bg-gray-800 text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="text-gray-500 hover:text-white transition text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-gray-400 mt-1">Track your CV scores and application status</p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400 mb-4">You haven't applied to any jobs yet</p>
            <button
              onClick={() => navigate('/candidate/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map(app => (
              <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">{app.job_title}</h2>
                    <p className="text-gray-500 text-xs mt-1">
                      Applied {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${getScoreColor(app.score)}`}>
                      {app.score}
                    </p>
                    <p className="text-gray-500 text-xs">AI Score / 100</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4">
                  <p className="text-xs text-purple-400 mb-1">🧠 AI Feedback</p>
                  <p className="text-gray-300 text-sm">{app.summary}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(app.matched_skills || '[]').map(s => (
                      <span key={s} className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}