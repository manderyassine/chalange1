import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App.jsx'

test('renders navigation links', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
  expect(screen.getByText('Tasks')).toBeInTheDocument()
  expect(screen.getByText('Notes')).toBeInTheDocument()
  expect(screen.getByText('Weather')).toBeInTheDocument()
})
