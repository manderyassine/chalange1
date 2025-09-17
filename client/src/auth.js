export function isAuthed() {
	return Boolean(localStorage.getItem('token'))
}
// JS helper only; the JSX Protected wrapper lives in auth.jsx
