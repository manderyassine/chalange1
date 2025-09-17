import { useEffect, useState } from 'react'
import api from '../api'
import InputWithIcon from '../components/InputWithIcon.jsx'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [newCompleted, setNewCompleted] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/tasks', { params: { page, limit, sortBy, sortOrder } })
      setTasks(data.items); setTotal(data.total)
    } catch (e) { setError(e.response?.data?.error || 'Failed to load tasks') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [page, limit, sortBy, sortOrder])

  const addTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
  const { data } = await api.post('/tasks', { title, completed: newCompleted })
    setTitle('')
    setNewCompleted(false)
    // reload to respect pagination/sort
    load()
  }

  const toggle = async (t) => {
  await api.put(`/tasks/${t._id}`, { completed: !t.completed, title: t.title })
    load()
  }

  const editTitle = async (t, newTitle) => {
  await api.put(`/tasks/${t._id}`, { title: newTitle, completed: t.completed })
    // Reload to ensure order matches current sort (e.g., title/updatedAt)
    load()
  }

  const remove = async (t) => {
  await api.delete(`/tasks/${t._id}`)
    load()
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <h2 className="ui"><i className="uil uil-check-square"/> Tasks</h2>
      <div className="card row">
        <label className="ui">Sort by
          <select value={sortBy} onChange={e=>{setPage(1); setSortBy(e.target.value)}} style={{ marginLeft:6 }}>
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
            <option value="title">Title</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <select value={sortOrder} onChange={e=>{setPage(1); setSortOrder(e.target.value)}}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <label>Per page
          <select value={limit} onChange={e=>{setPage(1); setLimit(parseInt(e.target.value))}} style={{ marginLeft:6 }}>
            {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        {loading && <span className="muted ui"><i className="uil uil-refresh"/> Loading…</span>}
        {error && <span className="error ui"><i className="uil uil-exclamation-triangle"/> {error}</span>}
      </div>
      <form onSubmit={addTask} className="row card">
        <InputWithIcon icon="uil-plus-circle" value={title} onChange={e=>setTitle(e.target.value)} placeholder="New task" className="grow" />
        <label className="ui" title="Completed">
          <input type="checkbox" checked={newCompleted} onChange={e=>setNewCompleted(e.target.checked)} />
          <span className="muted">Completed</span>
        </label>
        <button className="ui"><i className="uil uil-plus"/> Add</button>
      </form>
      <ul className="clean">
        {tasks.map(t => (
          <li key={t._id} className="item">
            <label className="ui" style={{ minWidth: 28 }}>
              <input type="checkbox" checked={t.completed} onChange={()=>toggle(t)} />
            </label>
            <div className="grow">
              <input value={t.title} onChange={e=>editTitle(t, e.target.value)} className="grow" />
              <div className="muted ui" style={{ fontSize: 12, marginTop: 6, gap: 14 }}>
                <span className="ui"><i className="uil uil-schedule"/> Created: {t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</span>
                <span className="ui"><i className="uil uil-history"/> Updated: {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : '-'}</span>
              </div>
            </div>
            <button className="ghost ui" onClick={()=>remove(t)}><i className="uil uil-trash-alt"/> Delete</button>
          </li>
        ))}
      </ul>
      <div className="row">
        <button className="ghost" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><i className="uil uil-arrow-left"/> Prev</button>
        <span className="muted">Page {page} of {Math.max(1, Math.ceil(total/limit))}</span>
        <button className="ghost" disabled={page>=Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)}>Next <i className="uil uil-arrow-right"/></button>
      </div>
    </div>
  )
}
