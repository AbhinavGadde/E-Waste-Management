export function ImageModal({ src, onClose, title }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
        >
          ×
        </button>
        {title && <div className="text-white mb-2 font-semibold">{title}</div>}
        <img src={src} alt={title} className="max-w-full max-h-[80vh] rounded-lg" />
      </div>
    </div>
  )
}

