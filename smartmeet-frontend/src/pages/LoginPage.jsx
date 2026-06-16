import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import useAuth from '../hooks/useAuth.js'
import { getAuthErrorMessage } from '../services/authService.js'

// Login page submits credentials to the backend and stores the returned JWT.
function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(formData)
      navigate('/dashboard')
    } catch (apiError) {
      setError(getAuthErrorMessage(apiError))
    } finally {
      setIsSubmitting(false)
    }
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
          Sign in with your SmartMeet account and continue to your meeting
          dashboard.
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
            Enter the email and password you used during signup.
          </p>
        </div>
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <FormField
            autoComplete="email"
            label="Email address"
            name="email"
            onChange={handleChange}
            placeholder="you@example.com"
            required
            type="email"
            value={formData.email}
          />
          <FormField
            autoComplete="current-password"
            label="Password"
            name="password"
            onChange={handleChange}
            placeholder="Enter your password"
            required
            type="password"
            value={formData.password}
          />
        </div>
        <Button
          className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
        <p className="mt-5 text-center text-sm text-slate-600">
          New to SmartMeet?{' '}
          <Link
            className="font-semibold text-cyan-700 hover:text-cyan-800"
            to="/signup"
          >
            Create an account
          </Link>
        </p>
      </form>
    </section>
  )
}

export default LoginPage
