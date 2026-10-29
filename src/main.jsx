import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Addtocartcontext from './AddtocartContext/Addtocartcontext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Addtocartcontext>
    <App />

    </Addtocartcontext>
  </StrictMode>,
)
