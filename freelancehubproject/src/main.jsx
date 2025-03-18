import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css'
import './index.css'
import App from './App.jsx'
import EmployerLoginStore from './contexts/EmployerLoginStore.jsx'
import FreelancerLoginStore from './contexts/FreelancerLoginStore.jsx'

createRoot(document.getElementById('root')).render(
   <EmployerLoginStore>
    <FreelancerLoginStore>
     <App />
    </FreelancerLoginStore>
   </EmployerLoginStore>
)