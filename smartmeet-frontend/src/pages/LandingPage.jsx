import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'
import BrandLogo from '../components/BrandLogo.jsx'
import Button from '../components/Button.jsx'

const features = [
  {
    title: 'HD Video Meetings',
    description: 'Run clear browser-based meetings with audio, video, chat, and screen sharing.',
    accent: 'bg-cyan-500',
  },
  {
    title: 'AI Live Captions',
    description: 'Surface spoken conversation as readable captions for more accessible meetings.',
    accent: 'bg-violet-500',
  },
  {
    title: 'Real-Time Translation',
    description: 'Prepare multilingual collaboration flows for distributed teams and interviews.',
    accent: 'bg-emerald-500',
  },
  {
    title: 'AI Moderation',
    description: 'Detect harmful chat and voice patterns so hosts can keep calls professional.',
    accent: 'bg-rose-500',
  },
  {
    title: 'Screen Sharing',
    description: 'Present portfolios, code, slide decks, and product demos without leaving the room.',
    accent: 'bg-amber-500',
  },
  {
    title: 'Meeting Analytics',
    description: 'Track participation, attention, and engagement signals from a host dashboard.',
    accent: 'bg-indigo-500',
  },
]

const stats = [
  { label: 'AI signals', value: '4+' },
  { label: 'Realtime channels', value: '3' },
  { label: 'Guest-ready', value: 'Yes' },
]

// LandingPage is the public homepage recruiters and guests see before signing in.
function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,#0891b244,transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#102a43_100%)]" />

      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <BrandLogo tone="dark" />
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <a className="rounded-md px-3 py-2 text-slate-200 transition hover:bg-white/10" href="/">
              Home
            </a>
            <a
              className="rounded-md px-3 py-2 text-slate-200 transition hover:bg-white/10"
              href="#features"
            >
              Features
            </a>
            <Link
              className="rounded-md px-3 py-2 text-slate-200 transition hover:bg-white/10"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="rounded-md bg-white px-4 py-2 text-slate-950 shadow-sm transition hover:bg-cyan-50"
              to="/signup"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              SmartMeet AI meeting workspace
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              AI Powered Video Conferencing Platform
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              SmartMeet combines secure video rooms, real-time chat, screen sharing,
              AI moderation, focus insights, and meeting analytics in one polished
              collaboration experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" to="/signup">
                Get Started
              </Button>
              <Button
                className="border-white/25 bg-white/10 text-white hover:border-cyan-200 hover:bg-white/15 hover:text-white"
                to="/join"
                variant="secondary"
              >
                Join Meeting
              </Button>
              <Button
                className="border-white/25 bg-transparent text-white hover:border-cyan-200 hover:bg-white/10 hover:text-white"
                to="/login"
                variant="secondary"
              >
                Login
              </Button>
            </div>

            <div className="mt-5">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-300/35 bg-emerald-300/10 px-5 py-2.5 text-sm font-semibold text-emerald-100 shadow-sm transition hover:bg-emerald-300/15"
                to="/join"
              >
                Continue as Guest
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur"
                  key={stat.label}
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-cyan-400/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
              <img
                alt="SmartMeet video conferencing dashboard preview"
                className="aspect-[4/3] w-full object-cover"
                src={heroImage}
              />
              <div className="grid gap-3 border-t border-white/10 bg-slate-950/70 p-4 sm:grid-cols-3">
                {['Video', 'Chat', 'Analytics'].map((item) => (
                  <div className="rounded-lg bg-white/10 px-4 py-3" key={item}>
                    <p className="text-sm font-semibold text-white">{item}</p>
                    <div className="mt-3 h-1.5 rounded-full bg-slate-700">
                      <div className="h-1.5 w-3/4 rounded-full bg-cyan-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-y border-white/10 bg-white px-5 py-20 text-slate-950 lg:px-8"
          id="features"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Features</p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
                Built for interviews, demos, classrooms, and team calls.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl"
                  key={feature.title}
                >
                  <span className={`block h-2 w-12 rounded-full ${feature.accent}`} />
                  <h3 className="mt-5 text-lg font-bold tracking-normal text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-slate-950 px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>SmartMeet. AI-powered video conferencing for polished live collaboration.</p>
          <a
            className="font-semibold text-cyan-200 transition hover:text-white"
            href="https://github.com/Varshitha-padmasali/smart-meet"
            rel="noreferrer"
            target="_blank"
          >
            View GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
