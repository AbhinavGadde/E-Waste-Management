export function Badge({ icon, name, description, type, earned, earnedAt }) {
  const typeColors = {
    bronze: 'from-amber-600 to-amber-700',
    silver: 'from-slate-400 to-slate-500',
    gold: 'from-yellow-400 to-yellow-500',
    platinum: 'from-purple-500 to-purple-600',
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 ${
      earned ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
    } p-4 transition-all hover:shadow-lg ${earned ? 'opacity-100' : 'opacity-60'}`}>
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${
          earned ? typeColors[type] || typeColors.bronze : 'from-slate-300 to-slate-400'
        } flex items-center justify-center text-3xl flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold ${earned ? 'text-slate-800' : 'text-slate-500'}`}>{name}</h3>
            {earned && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                ✓ Earned
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-2">{description}</p>
          {earned && earnedAt && (
            <p className="text-xs text-slate-500">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

