import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useToast } from '../components/Toast.jsx'
import InputWithIcon from '../components/InputWithIcon.jsx'

export default function Register() {
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('token', data.token)
      navigate('/tasks')
      toast.success('Account created!')
    } catch (e) {
      const msg = e.response?.data?.error || 'Registration failed'
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="page-center">
      <div className="grid auth-card">
        <h2 className="ui text-center" style={{ justifyContent:'center' }}><i className="uil uil-user-plus"/> Register</h2>
        <form onSubmit={onSubmit} className="card grid" style={{ gap: 12 }}>
        <InputWithIcon icon="uil-user" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <InputWithIcon icon="uil-at" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <InputWithIcon icon="uil-lock" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit" className="ui"><i className="uil uil-user-check"/> Create Account</button>
        {error && <div className="error">{error}</div>}
        </form>
        <p className="muted">Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}
