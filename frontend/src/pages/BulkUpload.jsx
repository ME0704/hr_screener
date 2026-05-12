import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api/axios'

export default function BulkUpload() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const token = localStorage.getItem('company_token')

  useEffect(() => {
    if (!token) { navigate('/company/login'); return }
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

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type === 'application/pdf')
    setFiles(selected)
    setError(selected.length === 0 ? 'Only PDF files are accepted' : '')
  }

  const handleUpload = async () => {
    if (files.length === 0) { setError('Please select at least one CV'); return }
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('token', token)
    files.forEach(file => formData.append('cv_files', file))

    try {
      const res = await API.post(`/cvs/bulk-upload/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResults(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400'
    if (score >= 55) return 'text-yellow-400'
    if (score >= 35) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBg = (score) => {
    if (score >= 75) return 'border-green-800 bg-green-950'
    if (score >= 55) return 'border-yellow-800 bg-yellow-950'
    if (score >= 35) return 'border-orange-800 bg-orange-950'
    return 'border-gray-800 bg-gray-900'
  }

  const getRankIcon = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  // Results view
  if (results) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/company/dashboard')}
              className="text-gray-500 hover:text-white transition"
            >
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold">AI Results</h1>
              <p className="text-gray-400 mt-1">{job?.title}</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold">{results.total_uploaded}</p>
              <p className="text-gray-400 text-sm mt-1">CVs Uploaded</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-green-400">{results.total_processed}</p>
              <p className="text-gray-400 text-sm mt-1">Processed</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-purple-400">
                {results.results[0]?.score ?? 0}
              </p>
              <p className="text-gray-400 text-sm mt-1">Top Score</p>
            </div>
          </div>

          {/* Top 3 Highlight */}
          {results.results.length >= 3 && (
            <div className="bg-gray-900 border border-purple-800 rounded-xl p-5 mb-6">
              <p className="text-xs text-purple-400 mb-3 letter-spacing-wide">
                🧠 AI TOP 3 RECOMMENDATIONS
              </p>
              <div className="grid grid-cols-3 gap-3">
                {results.results.slice(0, 3).map((r, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-2xl mb-1">{getRankIcon(i)}</p>
                    <p className="font-semibold text-sm">{r.candidate_name}</p>
                    <p className={`text-2xl font-bold mt-1 ${getScoreColor(r.score)}`}>
                      {r.score}
                    </p>
                    <p className="text-gray-500 text-xs">/ 100</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Ranked List */}
          <div className="flex flex-col gap-3">
            {results.results.map((r, index) => (
              <div
                key={index}
                className={`border rounded-xl p-5 ${getScoreBg(r.score)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-400 w-8">
                      {getRankIcon(index)}
                    </span>
                    <div>
                      <p className="font-semibold text-lg">{r.candidate_name}</p>
                      <p className="text-gray-500 text-xs">{r.candidate_email}</p>
                      <p className="text-gray-600 text-xs">{r.filename}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-bold ${getScoreColor(r.score)}`}>
                      {r.score}
                    </p>
                    <p className="text-gray-500 text-xs">/ 100</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      r.score >= 75 ? 'bg-green-500' :
                      r.score >= 55 ? 'bg-yellow-500' :
                      r.score >= 35 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>

                {/* Summary */}
                <p className="text-gray-300 text-sm mb-3">{r.summary}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {r.matched_skills?.map(s => (
                    <span key={s} className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">
                      ✓ {s}
                    </span>
                  ))}
                  {r.missing_skills?.map(s => (
                    <span key={s} className="bg-red-900 text-red-400 text-xs px-2 py-1 rounded-full">
                      ✗ {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate(`/company/jobs/${jobId}/applications`)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
            >
              View Full Applications Dashboard
            </button>
            <button
              onClick={() => { setResults(null); setFiles([]) }}
              className="flex-1 border border-gray-700 text-gray-400 hover:text-white py-3 rounded-lg transition"
            >
              Upload More CVs
            </button>
          </div>

        </div>
      </div>
    )
  }

  // Upload view
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/company/dashboard')} className="text-gray-500 hover:text-white">←</button>
          <div>
            <h1 className="text-2xl font-bold">Bulk CV Upload</h1>
            {job && <p className="text-purple-400 text-sm">{job.title}</p>}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-300">
            📌 Upload all CVs you received for this job at once.
            The AI will read, score and rank them all for you in seconds.
          </p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* File Drop Zone */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition mb-4">
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFiles}
            className="hidden"
            id="bulk-upload"
          />
          <label htmlFor="bulk-upload" className="cursor-pointer">
            <p className="text-4xl mb-3">📂</p>
            {files.length > 0 ? (
              <div>
                <p className="text-green-400 font-semibold">
                  {files.length} CV{files.length > 1 ? 's' : ''} selected
                </p>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {files.map((f, i) => (
                    <p key={i} className="text-gray-400 text-xs">{f.name}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 text-sm">Click to select multiple PDF CVs</p>
                <p className="text-gray-600 text-xs mt-1">You can select all files at once</p>
              </div>
            )}
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
        >
          {loading
            ? `🧠 AI is screening ${files.length} CVs...`
            : `Screen ${files.length > 0 ? files.length : ''} CVs with AI`
          }
        </button>

        {loading && (
          <p className="text-center text-gray-500 text-xs mt-3">
            This may take a few seconds per CV — please wait
          </p>
        )}
      </div>
    </div>
  )
}