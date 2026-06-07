import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'

// Login page uses dummy submission and routes to the dashboard without backend calls.
function LoginPage() {
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <section className="grid min-h-[calc(100vh-150px)] items-center gap-10 lg:grid-cols-[1fr_420px]">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Video meetings made simple
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          Welcome back to SmartMeet
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Sign in with dummy credentials and continue to your meeting dashboard.
          Backend authentication will be connected in a later step.
        </p>
      </div>

      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-normal text-slate-950">
            Login
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Use any email and password for now.
          </p>
        </div>
        <div className="space-y-4">
          <FormField
            autoComplete="email"
            label="Email address"
            placeholder="you@example.com"
            required
            type="email"
          />
          <FormField
            autoComplete="current-password"
            label="Password"
            placeholder="Enter your password"
            required
            type="password"
          />
        </div>
        <Button className="mt-6 w-full" type="submit">
          Login
        </Button>
        <p className="mt-5 text-center text-sm text-slate-600">
          New to SmartMeet?{' '}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" to="/signup">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  )
}

export default LoginPage
