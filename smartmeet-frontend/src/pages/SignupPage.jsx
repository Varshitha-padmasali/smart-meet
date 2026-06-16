import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import useAuth from '../hooks/useAuth.js'
import { getAuthErrorMessage } from '../services/authService.js'

// Signup page creates a backend account and stores the returned JWT.
function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    username: '',
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
      await signup(formData)
      navigate('/dashboard')
    } catch (apiError) {
      setError(getAuthErrorMessage(apiError))
    } finally {
      setIsSubmitting(false)
    }
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
          Create your account through the SmartMeet backend and continue to your
          meeting dashboard.
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
            Your account will be created through the authentication API.
          </p>
        </div>
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <FormField
            autoComplete="name"
            label="Full name"
            name="name"
            onChange={handleChange}
            placeholder="Your name"
            required
            type="text"
            value={formData.name}
          />
          <FormField
            autoComplete="username"
            helperText="Use letters, numbers, and underscores only."
            label="Username"
            name="username"
            onChange={handleChange}
            placeholder="varshitha_01"
            required
            type="text"
            value={formData.username}
          />
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
            autoComplete="new-password"
            label="Password"
            name="password"
            onChange={handleChange}
            placeholder="Create a password"
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            className="font-semibold text-cyan-700 hover:text-cyan-800"
            to="/login"
          >
            Login
          </Link>
        </p>
      </form>
    </section>
  )
}

export default SignupPage
