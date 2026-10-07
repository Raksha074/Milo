import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import axios from 'axios'
import ProtectedRoute from './Components/ProtectedRoute'
import Navbar from './Components/Navbar'
import Builder from './pages/Builder'
import Billing from './pages/Billing'
import { Toaster } from "react-hot-toast"

// eslint-disable-next-line react-refresh/only-export-components
export const ServerUrl = import.meta.env.VITE_SERVER_URL || "https://milo1-anww.onrender.com"
// eslint-disable-next-line react-refresh/only-export-components
export const CLIENT_URL = typeof window !== 'undefined' ? window.location.origin : "https://milo-snowy.vercel.app"


function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(ServerUrl + "/api/user/current-user", { withCredentials: true })
        setUser(res.data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])


  return (
    <>

      <Toaster position='top-right' />
      <Routes>

        <Route path='/login' element={!loading && user ? <Navigate to="/" replace /> : <Login setUser={setUser} />} />

        <Route path='/*' element={<ProtectedRoute user={user} loading={loading}>
          <Navbar setUser={setUser} user={user} />
          <Routes>
            <Route path='/' element={<Home user={user} />} />
            <Route path='/builder' element={<Builder user={user} setUser={setUser} />} />
            <Route path='/billing' element={<Billing user={user} setUser={setUser} />} />

            <Route path='*' element={<Navigate to="/" replace />} />
          </Routes>


        </ProtectedRoute>} />

      </Routes>

    </>
  )
}

export default App
