import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { createReport, listCenters, userHistory, getUserStats } from '../services/api.js'
import { StatusBadge } from '../components/StatusBadge.jsx'
import { ImageModal } from '../components/ImageModal.jsx'
import { LoadingSpinner } from '../components/LoadingSpinner.jsx'
import { Toast } from '../components/Toast.jsx'

// Fix default marker icons for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function UserDashboard() {
  const [centers, setCenters] = useState([])
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [file, setFile] = useState(null)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [previewImage, setPreviewImage] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const c = await listCenters()
    setCenters(c)
    const h = await userHistory()
    setHistory(h)
    const s = await getUserStats()
    setStats(s)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) {
      showToast('Please select an image', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await createReport(file, selectedCenter?.id)
      showToast(`Uploaded: ${res.category} (${Math.round(res.confidence * 100)}% confidence)`, 'success')
      await loadData()
      setFile(null)
      setSelectedCenter(null)
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Upload failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredHistory = history.filter(h => {
    const matchesSearch = h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.suggestion && h.suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const centerPos = centers.length ? [centers[0].latitude, centers[0].longitude] : [20.5937, 78.9629]

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-lg">
            <div className="text-sm opacity-90">Reward Points</div>
            <div className="text-3xl font-bold">{stats.points}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg p-4 shadow-lg">
            <div className="text-sm opacity-90">Total Reports</div>
            <div className="text-3xl font-bold">{stats.total_reports}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-4 shadow-lg">
            <div className="text-sm opacity-90">Recycled Items</div>
            <div className="text-3xl font-bold">{stats.recycled_count}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-lg">
            <div className="text-sm opacity-90">CO₂ Saved</div>
            <div className="text-3xl font-bold">{stats.co2_saved_kg} kg</div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Upload E-Waste Image</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {file && (
                  <div className="mt-2 text-sm text-emerald-600">✓ {file.name} selected</div>
                )}
              </div>
              <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded">
                💡 Choose a recycler on the map (optional) to assign your e-waste directly.
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </form>
          </div>

          {/* History Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Your History</h3>
            
            {/* Search and Filter */}
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="Search by category or suggestion..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="received">Received</option>
                <option value="recycled">Recycled</option>
              </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredHistory.map(h => (
                <div
                  key={h.id}
                  className="border border-slate-200 rounded-lg p-3 flex gap-3 items-center hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setPreviewImage(`http://localhost:8000${h.image_url}`)}
                >
                  <img
                    src={`http://localhost:8000${h.image_url}`}
                    alt={h.category}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 mb-1">{h.category}</div>
                    <div className="text-xs text-slate-600 mb-2 line-clamp-2">{h.suggestion}</div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.status} />
                      <span className="text-xs text-slate-500">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredHistory.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  {searchQuery || statusFilter !== 'all' ? 'No matching reports found.' : 'No reports yet.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">Nearest Recyclers</h2>
          <div className="mb-4">
            {selectedCenter && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                <div className="font-semibold text-emerald-800">✓ Selected: {selectedCenter.name}</div>
                <div className="text-xs text-emerald-600 mt-1">
                  {selectedCenter.approved ? 'Approved Center' : 'Pending Approval'}
                </div>
              </div>
            )}
          </div>
          <MapContainer
            center={centerPos}
            zoom={5}
            style={{ height: 500, borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {centers.map(c => (
              <Marker
                key={c.id}
                position={[c.latitude, c.longitude]}
                eventHandlers={{
                  click: () => setSelectedCenter(c),
                }}
              >
                <Popup>
                  <div className="space-y-2 min-w-[200px]">
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-xs space-y-1">
                      <div className={`inline-block px-2 py-1 rounded text-xs ${
                        c.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.approved ? '✓ Approved' : '⏳ Pending'}
                      </div>
                      <div className="text-slate-600">Performance: {Math.round(c.performance_score)}/100</div>
                    </div>
                    <button
                      onClick={() => setSelectedCenter(c)}
                      className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        selectedCenter?.id === c.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {selectedCenter?.id === c.id ? '✓ Selected' : 'Select This Center'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
