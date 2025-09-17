import axios from 'axios'

const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'
const api = axios.create({
  baseURL: base,
  withCredentials: true
})
if (typeof window !== 'undefined') {
  // Debug: remove after confirming deployment
  console.debug('[api] baseURL =', base)
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let queue = []

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    if (status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      isRefreshing = true
      try {
        const { data } = await api.post('/auth/refresh', null, { withCredentials: true })
        localStorage.setItem('token', data.token)
        queue.forEach(p => p.resolve(data.token)); queue = []
        original.headers.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch (e) {
        queue.forEach(p => p.reject(e)); queue = []
        localStorage.removeItem('token')
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
