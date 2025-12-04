import { useEffect, useState } from 'react'
import { listCenters, adminApproveCenter, analyticsOverview } from '../services/api.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { LoadingSpinner } from '../components/LoadingSpinner.jsx'
import { Toast } from '../components/Toast.jsx'

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#9333ea', '#ec4899', '#14b8a6']

export default function AdminDashboard() {
  const [centers, setCenters] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [filterApproved, setFilterApproved] = useState('all')

  async function load() {
    setLoading(true)
    try {
      const c = await listCenters()
      setCenters(c)
      const a = await analyticsOverview()
      setAnalytics(a)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const approve = async (id) => {
    try {
      await adminApproveCenter(id)
      showToast('Center approved successfully!', 'success')
      await load()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to approve center', 'error')
    }
  }

  const filteredCenters = centers.filter(c => {
    if (filterApproved === 'approved') return c.approved
    if (filterApproved === 'pending') return !c.approved
    return true
  })

  const catData = analytics ? Object.entries(analytics.by_category).map(([k, v]) => ({ name: k, value: v })) : []
  const perfData = analytics ? analytics.center_performance : []
  const topContributors = analytics?.top_contributors || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
        <div className="text-sm text-slate-600">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Summary Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-5 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Centers</div>
            <div className="text-3xl font-bold">{centers.length}</div>
            <div className="text-xs opacity-75 mt-1">
              {centers.filter(c => c.approved).length} approved
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg p-5 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Reports</div>
            <div className="text-3xl font-bold">
              {Object.values(analytics.by_category).reduce((a, b) => a + b, 0)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-5 shadow-lg">
            <div className="text-sm opacity-90 mb-1">CO₂ Saved</div>
            <div className="text-3xl font-bold">{analytics.co2_saved_kg} kg</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-5 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Top Contributors</div>
            <div className="text-3xl font-bold">{topContributors.length}</div>
          </div>
        </div>
      )}

      {/* Recycler Centers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Recycler Centers</h3>
          <select
            value={filterApproved}
            onChange={e => setFilterApproved(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Centers</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCenters.map(c => (
            <div
              key={c.id}
              className={`border rounded-lg p-4 ${
                c.approved ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-slate-800">{c.name}</div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    c.approved
                      ? 'bg-emerald-200 text-emerald-700'
                      : 'bg-amber-200 text-amber-700'
                  }`}
                >
                  {c.approved ? '✓ Approved' : '⏳ Pending'}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1 mb-3">
                <div>📍 {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</div>
                <div>📊 Performance: {Math.round(c.performance_score)}/100</div>
              </div>
              {!c.approved && (
                <button
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md"
                  onClick={() => approve(c.id)}
                >
                  ✓ Approve Center
                </button>
              )}
            </div>
          ))}
        </div>
        {filteredCenters.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No centers found matching the filter.
          </div>
        )}
      </div>

      {/* Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Waste by Category</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={catData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {catData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-500">No data available</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Center Performance</h3>
          {perfData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={perfData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="recycled" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-500">No data available</div>
          )}
        </div>
      </div>

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Top Contributors</h3>
          <div className="space-y-3">
            {topContributors.map((contributor, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                        ? 'bg-slate-400'
                        : index === 2
                        ? 'bg-amber-600'
                        : 'bg-blue-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{contributor.name}</div>
                    <div className="text-xs text-slate-600">Contributor</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">{contributor.points} pts</div>
                  <div className="text-xs text-slate-500">Reward Points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
