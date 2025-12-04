import { useEffect, useState } from 'react'
import {
  recyclerAssigned,
  recyclerUpdateStatus,
  listCenters,
  claimCenter,
  getMe
} from '../services/api.js'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { ImageModal } from '../components/ImageModal.jsx'
import { LoadingSpinner } from '../components/LoadingSpinner.jsx'
import { Toast } from '../components/Toast.jsx'

export default function RecyclerDashboard() {
  const [items, setItems] = useState([])
  const [toast, setToast] = useState(null)
  const [centers, setCenters] = useState([])
  const [availableCenters, setAvailableCenters] = useState([])
  const [claimedCenters, setClaimedCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const me = await getMe()
      const centerRes = await listCenters()
      setCenters(centerRes)
      setClaimedCenters(centerRes.filter(c => c.manager_user_id === me.id))
      setAvailableCenters(
        centerRes.filter(c => c.approved && (!c.manager_user_id || c.manager_user_id === me.id))
      )
      const assignments = await recyclerAssigned()
      setItems(assignments)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to load dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const update = async (id, status) => {
    try {
      await recyclerUpdateStatus(id, status)
      showToast(`Status updated to ${status}`, 'success')
      await loadDashboard()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to update status', 'error')
    }
  }

  const handleClaim = async (centerId) => {
    try {
      await claimCenter(centerId)
      showToast('Center claimed successfully!', 'success')
      await loadDashboard()
    } catch (err) {
      const detail = err?.response?.data?.detail
      showToast(detail || 'Unable to claim center', 'error')
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.suggestion && item.suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'assigned').length,
    received: items.filter(i => i.status === 'received').length,
    recycled: items.filter(i => i.status === 'recycled').length,
  }

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
      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-lg">
          <div className="text-sm opacity-90">Total Assignments</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-4 shadow-lg">
          <div className="text-sm opacity-90">Pending</div>
          <div className="text-3xl font-bold">{stats.pending}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg">
          <div className="text-sm opacity-90">Received</div>
          <div className="text-3xl font-bold">{stats.received}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg p-4 shadow-lg">
          <div className="text-sm opacity-90">Recycled</div>
          <div className="text-3xl font-bold">{stats.recycled}</div>
        </div>
      </div>

      {/* Center Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Your Recycling Center</h2>
        {claimedCenters.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="text-sm text-amber-800">
              ⚠️ Claim an approved center below to start receiving assignments.
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-3">
          {claimedCenters.map(c => (
            <div key={c.id} className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-emerald-800">{c.name}</div>
                <span className="px-2 py-1 bg-emerald-200 text-emerald-700 rounded text-xs font-medium">
                  ✓ Active
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div>📍 Location: {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</div>
                <div>📊 Performance: {Math.round(c.performance_score)}/100</div>
              </div>
            </div>
          ))}
          {claimedCenters.length === 0 && (
            <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-500 col-span-2">
              No center claimed yet.
            </div>
          )}
        </div>
      </div>

      {/* Available Centers */}
      {availableCenters.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Available Approved Centers</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {availableCenters.map(c => (
              <div key={c.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-semibold text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Performance: {Math.round(c.performance_score)}/100
                  </div>
                </div>
                {!c.manager_user_id && (
                  <button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                    onClick={() => handleClaim(c.id)}
                  >
                    Claim Center
                  </button>
                )}
                {c.manager_user_id && (
                  <div className="text-xs text-emerald-700 font-medium">✓ Already claimed by you</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Reports */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Assigned Reports</h2>
          {items.length > 0 && (
            <div className="text-sm text-slate-600">
              Showing {filteredItems.length} of {items.length}
            </div>
          )}
        </div>

        {/* Search and Filter */}
        {items.length > 0 && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Search by category or suggestion..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="received">Received</option>
              <option value="recycled">Recycled</option>
            </select>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {filteredItems.map(r => (
            <div
              key={r.id}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <img
                  src={`http://localhost:8000${r.image_url}`}
                  alt={r.category}
                  className="w-24 h-24 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPreviewImage(`http://localhost:8000${r.image_url}`)}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 mb-1">{r.category}</div>
                  <div className="text-xs text-slate-600 mb-2 line-clamp-2">{r.suggestion}</div>
                  <div className="mb-3">
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {r.status === 'assigned' && (
                      <button
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm"
                        onClick={() => update(r.id, 'received')}
                      >
                        ✓ Mark Received
                      </button>
                    )}
                    {r.status === 'received' && (
                      <button
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm"
                        onClick={() => update(r.id, 'recycled')}
                      >
                        ♻️ Mark Recycled
                      </button>
                    )}
                    {r.status === 'recycled' && (
                      <span className="text-xs text-emerald-700 font-medium">✓ Completed</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            {items.length === 0 ? (
              <div>
                <div className="text-4xl mb-2">📦</div>
                <div className="font-medium">
                  {claimedCenters.length === 0
                    ? 'Claim a center to start receiving e-waste assignments.'
                    : 'No reports assigned yet.'}
                </div>
              </div>
            ) : (
              'No matching reports found.'
            )}
          </div>
        )}
      </div>
    </div>
  )
}
