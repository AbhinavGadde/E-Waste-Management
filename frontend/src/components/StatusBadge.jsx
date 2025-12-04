export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-slate-200 text-slate-700',
    assigned: 'bg-blue-100 text-blue-700',
    received: 'bg-amber-100 text-amber-700',
    recycled: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

