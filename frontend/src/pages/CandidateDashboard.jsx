import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs/')
      setJobs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('candidate_token')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Available Jobs</h1>
            <p className="text-gray-400 mt-1">Browse and apply to open positions</p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400">No open jobs at the moment</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{job.title}</h2>
                  <p className="text-gray-400 text-sm mb-2">{job.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {job.requirements.split(',').map(skill => (
                      <span key={skill} className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded-full">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/candidate/apply/${job.id}`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition ml-4 whitespace-nowrap"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}