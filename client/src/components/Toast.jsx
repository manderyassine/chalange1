import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const remove = useCallback((id) => setItems(x => x.filter(t => t.id !== id)), [])
  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2)
    setItems(x => [...x, { id, type, message }])
    setTimeout(() => remove(id), 3000)
  }, [remove])
  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m)
  }), [push])
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-container">
        {items.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <i className={`uil ${t.type==='success'?'uil-check-circle':t.type==='error'?'uil-exclamation-octagon':'uil-info-circle'}`} />
            <span>{t.message}</span>
            <button className="close" onClick={() => remove(t.id)}><i className="uil uil-times" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
