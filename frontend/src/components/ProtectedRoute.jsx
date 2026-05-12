import { Navigate } from 'react-router-dom'

export function CompanyRoute({ children }) {
  const token = localStorage.getItem('company_token')
  if (!token) return <Navigate to="/company/login" replace />
  return children
}

export function CandidateRoute({ children }) {
  const token = localStorage.getItem('candidate_token')
  if (!token) return <Navigate to="/candidate/login" replace />
  return children
}