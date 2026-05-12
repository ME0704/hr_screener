import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api/axios'

export default function ViewApplications() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const token = localStorage.getItem('company_token')

  useEffect(() => {
    if (!token) { navigate('/company/login'); return }
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await API.get(`/cvs/job/${jobId}/applications?token=${token}`)
      setApplications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (applicationId, status) => {
    setUpdating(applicationId)
    try {
      await API.put(`/cvs/application/${applicationId}/status?token=${token}&status=${status}`)
      fetchApplications()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
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

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/company/dashboard')}
            className="text-gray-500 hover:text-white transition text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-gray-400 mt-1">
              {applications.length} candidate{applications.length !== 1 ? 's' : ''} — ranked by AI score
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400">No applications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app, index) => (
              <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">

                {/* Top row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-800 text-gray-400 text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{app.candidate_name}</p>
                        <p className="text-gray-500 text-xs">{app.candidate_email}</p>
                      <p className="text-gray-500 text-xs">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${getScoreColor(app.score)}`}>
                      {app.score}
                    </p>
                    <p className="text-gray-500 text-xs">AI Score / 100</p>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4">
                <p className="text-xs text-purple-400 mb-1">🧠 AI Summary</p>
                <p className="text-gray-300 text-sm">{app.summary}</p>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                    { label: 'Skills', max: 25, color: 'bg-purple-600' },
                    { label: 'Experience', max: 20, color: 'bg-blue-600' },
                    { label: 'Education', max: 15, color: 'bg-yellow-600' },
                    { label: 'Relevance', max: 10, color: 'bg-green-600' },
                    { label: 'CV Quality', max: 30, color: 'bg-pink-600' },
                ].map(({ label, max, color }) => {
                    const regex = new RegExp(`${label}: ([\\d.]+)/${max}`)
                    const match = app.summary?.match(regex)
                    const val = match ? parseFloat(match[1]) : 0
                    const pct = Math.round((val / max) * 100)
                    return (
                    <div key={label} className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className="text-lg font-bold text-white">
                        {val}<span className="text-xs text-gray-500">/{max}</span>
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div
                            className={`${color} h-1 rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                        />
                        </div>
                    </div>
                    )
                })}
                </div>

                {/* Skills */}

                {/* Skills */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">✅ Matched Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(app.matched_skills || '[]').length > 0
                        ? JSON.parse(app.matched_skills).map(s => (
                            <span key={s} className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">
                              {s}
                            </span>
                          ))
                        : <span className="text-gray-600 text-xs">None detected</span>
                      }
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">❌ Missing Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(app.missing_skills || '[]').map(s => (
                        <span key={s} className="bg-red-900 text-red-400 text-xs px-2 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(app.id, 'shortlisted')}
                      disabled={updating === app.id}
                      className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg transition"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'interviewed')}
                      disabled={updating === app.id}
                      className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg transition"
                    >
                      Interview
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'rejected')}
                      disabled={updating === app.id}
                      className="bg-red-800 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition"
                    >
                      Reject
                    </button>
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