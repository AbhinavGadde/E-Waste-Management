import { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import RecyclerDashboard from './pages/RecyclerDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { getMe } from './services/api.js'

function Nav({ user, onLogout }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <span className="font-bold text-xl">E-Waste Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            {!user && (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/login')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive('/register')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <div className="font-semibold">{user.name || user.email}</div>
                    <div className="text-xs text-slate-400 capitalize">{user.role}</div>
                  </div>
                  {user.role === 'user' && (
                    <Link
                      to="/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive('/dashboard')
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'recycler' && (
                    <Link
                      to="/recycler"
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive('/recycler')
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      Recycler
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive('/admin')
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function ProtectedRoute({ children, allow, user }) {
  if (!user) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  async function loadMe() {
    try {
      const res = await getMe()
      setUser(res)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMe()
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav user={user} onLogout={logout} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin" />
                ) : user.role === 'recycler' ? (
                  <Navigate to="/recycler" />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <div className="text-center mt-20 animate-fade-in">
                  <div className="text-6xl mb-6">♻️</div>
                  <h1 className="text-4xl font-bold mb-4 text-slate-800">Welcome to E-Waste Portal</h1>
                  <p className="text-lg text-slate-600 mb-8">
                    Manage, recycle, and track your electronic waste responsibly.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link
                      to="/login"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      Register
                    </Link>
                  </div>
                  <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="text-3xl mb-2">👤</div>
                      <h3 className="font-bold mb-2">For Users</h3>
                      <p className="text-sm text-slate-600">
                        Upload e-waste images, get AI-powered categorization, and earn reward points.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="text-3xl mb-2">🏭</div>
                      <h3 className="font-bold mb-2">For Recyclers</h3>
                      <p className="text-sm text-slate-600">
                        Manage assigned e-waste, track recycling status, and grow your center.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="text-3xl mb-2">👨‍💼</div>
                      <h3 className="font-bold mb-2">For Admins</h3>
                      <p className="text-sm text-slate-600">
                        Approve centers, view analytics, and monitor the entire system.
                      </p>
                    </div>
                  </div>
                </div>
              )
            }
          />
          <Route path="/login" element={<Login onLogin={loadMe} />} />
          <Route path="/register" element={<Register onRegister={loadMe} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} allow={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recycler"
            element={
              <ProtectedRoute user={user} allow={['recycler']}>
                <RecyclerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} allow={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  )
}
