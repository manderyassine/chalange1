import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import ReactMarkdown from 'react-markdown'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [q, setQ] = useState('')
  const [filterTags, setFilterTags] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const params = { page, limit, sortBy, sortOrder }
      if (q) params.q = q
      const t = filterTags.split(',').map(t=>t.trim()).filter(Boolean)
      if (t.length) params.tags = t.join(',')
      const { data } = await api.get('/notes', { params })
      setNotes(data.items); setTotal(data.total)
    } catch (e) { setError(e.response?.data?.error || 'Failed to load notes') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [q, filterTags, page, limit, sortBy, sortOrder])

  const addNote = async (e) => {
    e.preventDefault()
    const tagList = tags.split(',').map(t=>t.trim()).filter(Boolean)
    const { data } = await api.post('/notes', { title, content, tags: tagList })
    setTitle(''); setContent(''); setTags('')
    // Reload to reflect pagination
    setPage(1); load()
  }

  const updateNote = async (n, fields) => {
    const { data } = await api.put(`/notes/${n._id}`, { ...n, ...fields })
    setNotes(notes.map(x => x._id === n._id ? data : x))
  }

  const remove = async (n) => {
    await api.delete(`/notes/${n._id}`)
    setNotes(notes.filter(x => x._id !== n._id))
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <h2 className="ui"><i className="uil uil-notes"/> Notes</h2>
      <div className="card row">
        <input placeholder="Search notes" value={q} onChange={e=>{ setPage(1); setQ(e.target.value) }} />
        <input placeholder="Filter tags (comma separated)" value={filterTags} onChange={e=>{ setPage(1); setFilterTags(e.target.value) }} />
        <label>Sort by
          <select value={sortBy} onChange={e=>{ setPage(1); setSortBy(e.target.value) }} style={{ marginLeft:6 }}>
            <option value="updatedAt">Updated</option>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
          </select>
        </label>
        <select value={sortOrder} onChange={e=>{ setPage(1); setSortOrder(e.target.value) }}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <label>Per page
          <select value={limit} onChange={e=>{ setPage(1); setLimit(parseInt(e.target.value)) }} style={{ marginLeft:6 }}>
            {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        {loading && <span className="muted ui"><i className="uil uil-refresh"/> Loading…</span>}
        {error && <span className="error ui"><i className="uil uil-exclamation-triangle"/> {error}</span>}
      </div>
      <form onSubmit={addNote} className="card grid" style={{ gap: 10 }}>
        <label className="ui">
          <i className="uil uil-heading"/>
          <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="grow" />
        </label>
        <div className="grid grid-2">
          <textarea placeholder="Markdown content" value={content} onChange={e=>setContent(e.target.value)} rows={8} />
          <div className="card" style={{ background:'#0b1227' }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        <label className="ui">
          <i className="uil uil-label"/>
          <input placeholder="tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} className="grow" />
        </label>
        <button className="ui"><i className="uil uil-plus"/> Add Note</button>
      </form>

      <div className="grid" style={{ gap:12 }}>
        {notes.map(n => (
          <div key={n._id} className="card">
            <input value={n.title} onChange={e=>updateNote(n, { title: e.target.value })} style={{ fontSize:18, fontWeight:600, width:'100%' }} />
            <div className="grid grid-2" style={{ marginTop:8 }}>
              <textarea value={n.content} onChange={e=>updateNote(n, { content: e.target.value })} rows={8} />
              <div className="card" style={{ background:'#0b1227' }}>
                <ReactMarkdown>{n.content}</ReactMarkdown>
              </div>
            </div>
            <label className="ui" style={{ marginTop:8 }}>
              <i className="uil uil-label"/>
              <input value={n.tags?.join(', ') || ''} onChange={e=>updateNote(n, { tags: e.target.value.split(',').map(t=>t.trim()).filter(Boolean) })} placeholder="tags" className="grow" />
            </label>
            <div className="row" style={{ flexWrap:'wrap', marginTop:8 }}>
              {(n.tags||[]).map(t => <span key={t} className="muted card" style={{ padding:'2px 8px' }}>{t}</span>)}
              <button className="ghost right ui" onClick={()=>remove(n)}><i className="uil uil-trash-alt"/> Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop:12 }}>
        <button className="ghost" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><i className="uil uil-arrow-left"/> Prev</button>
        <span className="muted">Page {page} of {Math.max(1, Math.ceil(total/limit))}</span>
        <button className="ghost" disabled={page>=Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)}>Next <i className="uil uil-arrow-right"/></button>
      </div>
    </div>
  )
}
