import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useToast } from '../components/Toast.jsx'
import InputWithIcon from '../components/InputWithIcon.jsx'

export default function Login() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      navigate('/tasks')
      toast.success('Welcome back!')
    } catch (e) {
      const msg = e.response?.data?.error || 'Login failed'
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="page-center">
      <div className="grid auth-card">
        <h2 className="ui text-center" style={{ justifyContent:'center' }}><i className="uil uil-enter"/> Login</h2>
        <form onSubmit={onSubmit} className="card grid" style={{ gap: 12 }}>
        <InputWithIcon icon="uil-at" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <InputWithIcon icon="uil-lock" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit" className="ui"><i className="uil uil-signin"/> Login</button>
        {error && <div className="error">{error}</div>}
        </form>
        <p className="muted">Need an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}
