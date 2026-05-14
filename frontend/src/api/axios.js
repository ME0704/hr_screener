import axios from 'axios'

const API = axios.create({
  baseURL: 'https://hr-screener-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
})

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('company_token')
      localStorage.removeItem('candidate_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default API