import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api/axios'

export default function ApplyJob() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const token = localStorage.getItem('candidate_token')

  useEffect(() => {
    if (!token) { navigate('/candidate/login'); return }
    fetchJob()
  }, [])

  const fetchJob = async () => {
    try {
      const res = await API.get(`/jobs/${jobId}`)
      setJob(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cvFile) { setError('Please select your CV file'); return }
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('token', token)
    formData.append('cv_file', cvFile)

    try {
      const res = await API.post(`/cvs/apply/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Application failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
          <p className="text-gray-400 mb-6">The AI has analysed your CV</p>

          <div className="bg-gray-800 rounded-xl p-4 mb-4 text-left">
            <p className="text-xs text-purple-400 mb-1">🧠 AI Score</p>
            <p className="text-4xl font-bold text-center my-2">{success.score}<span className="text-lg text-gray-400">/100</span></p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-purple-400 mb-2">📋 Summary</p>
            <p className="text-gray-300 text-sm">{success.summary}</p>
          </div>

          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/candidate/dashboard')} className="text-gray-500 hover:text-white">←</button>
          <div>
            <h1 className="text-2xl font-bold">Apply for Job</h1>
            {job && <p className="text-purple-400 text-sm">{job.title}</p>}
          </div>
        </div>

        {job && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1">
              {job.requirements.split(',').map(skill => (
                <span key={skill} className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded-full">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Upload Your CV</label>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-purple-500 transition">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCvFile(e.target.files[0])}
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <p className="text-3xl mb-2">📄</p>
                {cvFile
                  ? <p className="text-green-400 text-sm font-medium">{cvFile.name}</p>
                  : <p className="text-gray-400 text-sm">Click to select your CV (PDF only)</p>
                }
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
          >
            {loading ? '🧠 AI is analysing your CV...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}