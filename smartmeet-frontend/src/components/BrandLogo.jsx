import { Link } from 'react-router-dom'

// BrandLogo centralizes SmartMeet branding so headers and auth pages stay consistent.
function BrandLogo({ tone = 'light' }) {
  const textClass = tone === 'dark' ? 'text-white' : 'text-slate-950'

  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-lg font-bold text-white shadow-sm">
        S
      </span>
      <span className={`text-xl font-semibold tracking-normal ${textClass}`}>
        SmartMeet
      </span>
    </Link>
  )
}

export default BrandLogo
