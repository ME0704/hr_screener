import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CompanyRoute, CandidateRoute } from './components/ProtectedRoute'
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
import MyApplications from './pages/MyApplications'
import BulkUpload from './pages/BulkUpload'
import EditJob from './pages/EditJob'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Public */}
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/candidate/register" element={<CandidateRegister />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />

        {/* Protected Company Routes */}
        <Route path="/company/dashboard" element={
          <CompanyRoute><CompanyDashboard /></CompanyRoute>
        } />
        <Route path="/company/post-job" element={
          <CompanyRoute><PostJob /></CompanyRoute>
        } />
        <Route path="/company/jobs/:jobId/applications" element={
          <CompanyRoute><ViewApplications /></CompanyRoute>
        } />

        {/* Protected Candidate Routes */}
        <Route path="/candidate/dashboard" element={
          <CandidateRoute><CandidateDashboard /></CandidateRoute>
        } />
        <Route path="/candidate/apply/:jobId" element={
          <CandidateRoute><ApplyJob /></CandidateRoute>
        } />
        <Route path="/candidate/my-applications" element={
          <CandidateRoute><MyApplications /></CandidateRoute>
        } />
        <Route path="/company/bulk-upload/:jobId" element={
          <CompanyRoute><BulkUpload /></CompanyRoute>
        } />
        <Route path="/company/edit-job/:jobId" element={
          <CompanyRoute><EditJob /></CompanyRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App