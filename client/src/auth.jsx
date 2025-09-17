import { Navigate } from 'react-router-dom'
import { isAuthed } from './auth.js'

export function Protected({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />
  return children
}