export function LeaderboardCard({ rank, name, points, level, itemsRecycled, co2Saved, isCurrentUser = false }) {
  const medalColors = {
    1: 'bg-yellow-400 text-yellow-900',
    2: 'bg-slate-300 text-slate-800',
    3: 'bg-amber-600 text-amber-100',
  }

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
        isCurrentUser
          ? 'border-emerald-500 bg-emerald-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
        rank <= 3 ? medalColors[rank] : 'bg-slate-100 text-slate-600'
      }`}>
        {rank <= 3 ? '🏆' : rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-slate-800 truncate">{name}</div>
          {isCurrentUser && (
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full font-medium">You</span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
          <span>Level {level}</span>
          <span>•</span>
          <span>{itemsRecycled} items</span>
          <span>•</span>
          <span>{co2Saved} kg CO₂</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-emerald-600">{points.toLocaleString()}</div>
        <div className="text-xs text-slate-500">points</div>
      </div>
    </div>
  )
}

