import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-cyan-600 text-white hover:bg-cyan-700 focus-visible:outline-cyan-600',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:border-cyan-500 hover:text-cyan-700 focus-visible:outline-cyan-600',
}

// Reusable button component that supports regular buttons and router links.
function Button({ children, className = '', to, variant = 'primary', ...props }) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
