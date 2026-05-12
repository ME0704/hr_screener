import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CompanyRegister from './pages/CompanyRegister'
import CompanyLogin from './pages/CompanyLogin'
import CompanyDashboard from './pages/CompanyDashboard'
import PostJob from './pages/PostJob'
import ViewApplications from './pages/ViewApplications'
import CandidateRegister from './pages/CandidateRegister'
import CandidateLogin from './pages/CandidateLogin'
import CandidateDashboard from './pages/CandidateDashboard'
import ApplyJob from './pages/ApplyJob'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/post-job" element={<PostJob />} />
        <Route path="/company/jobs/:jobId/applications" element={<ViewApplications />} />
        <Route path="/candidate/register" element={<CandidateRegister />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate/apply/:jobId" element={<ApplyJob />} />
      </Routes>
    </Router>
  )
}

export default App