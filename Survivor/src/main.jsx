import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './composant/App/App.jsx'
import './Style/index.scss'
import './Style/_reset.scss'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
