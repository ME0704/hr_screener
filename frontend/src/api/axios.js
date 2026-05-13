import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Automatically handle expired tokens
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear all tokens
      localStorage.removeItem('company_token')
      localStorage.removeItem('candidate_token')
      // Redirect to home
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default API