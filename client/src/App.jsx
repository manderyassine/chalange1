import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Tasks from './pages/Tasks.jsx'
import Notes from './pages/Notes.jsx'
import Weather from './pages/Weather.jsx'
import { Protected } from './auth.jsx'
import { isAuthed } from './auth.js'
import api from './api'
import { ToastProvider } from './components/Toast.jsx'

function Layout({ children }) {
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    if (isAuthed()) {
      api.get('/auth/me').then(r => setMe(r.data.user)).catch(()=>{})
    } else {
      setMe(null)
    }
  }, [])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  const logout = async () => {
    await api.post('/auth/logout', null, { withCredentials: true }).catch(()=>{})
    localStorage.removeItem('token'); navigate('/login')
  }
  return (
    <div>
      <nav>
        <div className="bar container">
          <NavLink to="/" className="ui" style={{ fontWeight:700 }}><i className="uil uil-bolt"/> PerfectTask</NavLink>
          <NavLink to="/tasks" className="ui"><i className="uil uil-check-square"/> Tasks</NavLink>
          <NavLink to="/notes" className="ui"><i className="uil uil-notes"/> Notes</NavLink>
          <NavLink to="/weather" className="ui"><i className="uil uil-cloud-sun"/> Weather</NavLink>
          <div className="spacer"/>
          <button className="ghost ui" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} title="Toggle theme">
            <i className={theme==='dark' ? 'uil uil-sun' : 'uil uil-moon'} />
          </button>
          {me && <span className="muted">Hi, {me.name}</span>}
          {isAuthed() ? (
            <button className="ghost ui" onClick={logout}><i className="uil uil-signout"/> Logout</button>
          ) : (
            <Link className="ui" to="/login"><i className="uil uil-enter"/> Login</Link>
          )}
        </div>
      </nav>
      <main className="container">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Tasks /></Protected>} />
          <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
          <Route path="/notes" element={<Protected><Notes /></Protected>} />
          <Route path="/weather" element={<Protected><Weather /></Protected>} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}
