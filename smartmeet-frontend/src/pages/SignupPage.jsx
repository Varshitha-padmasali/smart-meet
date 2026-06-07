import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'

// Signup page captures frontend-only account details and navigates to the dashboard.
function SignupPage() {
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <section className="mx-auto grid max-w-5xl items-center gap-10 py-8 lg:grid-cols-[1fr_460px]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Start collaborating
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          Create your SmartMeet account
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          This step only builds the frontend flow. Submitted details stay in the
          browser and no account is created yet.
        </p>
      </div>

      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-normal text-slate-950">
            Signup
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter dummy details to continue.
          </p>
        </div>
        <div className="space-y-4">
          <FormField
            autoComplete="name"
            label="Full name"
            placeholder="Your name"
            required
            type="text"
          />
          <FormField
            autoComplete="email"
            label="Email address"
            placeholder="you@example.com"
            required
            type="email"
          />
          <FormField
            autoComplete="new-password"
            label="Password"
            placeholder="Create a password"
            required
            type="password"
          />
        </div>
        <Button className="mt-6 w-full" type="submit">
          Create account
        </Button>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" to="/login">
            Login
          </Link>
        </p>
      </form>
    </section>
  )
}

export default SignupPage
