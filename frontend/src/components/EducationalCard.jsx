export function EducationalCard({ title, content, icon, category }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-slate-200">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{icon}</div>
        <div className="flex-1">
          {category && (
            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded mb-2">
              {category}
            </span>
          )}
          <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  )
}

