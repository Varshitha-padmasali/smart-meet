// FocusIndicator displays the user's current attention score and focus state.
function FocusIndicator({ attentionScore, isFocused, faceDetected }) {
  const color = !faceDetected
    ? 'text-slate-500'
    : isFocused
    ? 'text-emerald-600'
    : 'text-amber-600'

  const bgColor = !faceDetected
    ? 'bg-slate-100'
    : isFocused
    ? 'bg-emerald-50 border-emerald-200'
    : 'bg-amber-50 border-amber-200'

  const label = !faceDetected ? 'No face' : isFocused ? 'Focused' : 'Distracted'

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${bgColor}`}>
      <div className="relative h-10 w-10 flex-shrink-0">
        <svg className="h-10 w-10 -rotate-90 transform" viewBox="0 0 36 36">
          <circle
            className="text-slate-200"
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            className={isFocused ? 'text-emerald-500' : 'text-amber-500'}
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${(attentionScore / 100) * 100} 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700">
          {attentionScore}
        </span>
      </div>
      <div>
        <p className={`text-sm font-bold ${color}`}>{label}</p>
        <p className="text-xs text-slate-500">Attention: {attentionScore}%</p>
      </div>
    </div>
  )
}

export default FocusIndicator
