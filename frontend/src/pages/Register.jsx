import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login } from '../services/api.js'
import { Toast } from '../components/Toast.jsx'
import { LoadingSpinner } from '../components/LoadingSpinner.jsx'

export default function Register({ onRegister }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [centerName, setCenterName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (role === 'recycler' && (!centerName || !latitude || !longitude)) {
      setError('Please provide center name and coordinates for recycler registration')
      showToast('Please fill all recycler center details', 'error')
      return
    }
    setLoading(true)
    try {
      const payload = {
        email,
        name,
        password,
        role,
        center_name: role === 'recycler' ? centerName : undefined,
        center_latitude: role === 'recycler' ? Number(latitude) : undefined,
        center_longitude: role === 'recycler' ? Number(longitude) : undefined,
      }
      await register(payload)
      await login(email, password)
      await onRegister()
      showToast('Registration successful!', 'success')
      setTimeout(() => {
        if (role === 'admin') navigate('/admin')
        else if (role === 'recycler') navigate('/recycler')
        else navigate('/dashboard')
      }, 500)
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Registration failed'
      setError(detail)
      showToast(detail, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">♻️</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h2>
          <p className="text-slate-600">Join the e-waste management community</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name (optional)</label>
            <input
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <div className="text-xs text-slate-500 mt-1">Minimum 6 characters</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="recycler">Recycler</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {role === 'recycler' && (
            <div className="space-y-3 border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏭</span>
                <div className="text-sm font-semibold text-slate-800">Recycler Center Details</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Center Name</label>
                <input
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="GreenCycle Hub"
                  value={centerName}
                  onChange={e => setCenterName(e.target.value)}
                  required={role === 'recycler'}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                  <input
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="28.6139"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    required={role === 'recycler'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                  <input
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="77.2090"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    required={role === 'recycler'}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                💡 These coordinates will place your center on the public map. Users can select your center when assigning e-waste.
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Login here
          </Link>
        </div>
      </div>
    </div>
  )
}
