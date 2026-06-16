import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { getMeetingAnalytics } from '../services/analyticsService.js'
import { getMeetingById } from '../services/meetingService.js'

function StatCard({ label, value, sub, color = 'text-slate-950' }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
    </div>
  )
}

function EngagementBar({ percentage }) {
  const color =
    percentage >= 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-400' : 'bg-red-500'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Engagement</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{percentage}%</p>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function AnalyticsPage() {
  const { meetingId } = useParams()
  const [analytics, setAnalytics] = useState(null)
  const [meeting, setMeeting] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [analyticsData, meetingData] = await Promise.all([
          getMeetingAnalytics(meetingId),
          getMeetingById(meetingId).catch(() => ({ meeting: null })),
        ])
        setAnalytics(analyticsData.analytics)
        setMeeting(meetingData.meeting)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [meetingId])

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading analytics...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {error}
      </div>
    )
  }

  const a = analytics || {}

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          eyebrow="Host Analytics"
          title={meeting?.title || 'Meeting Analytics'}
          description="Real-time focus and engagement metrics. Refreshes every 10 seconds."
        />
        <Link
          to={`/meeting/${meetingId}`}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:border-cyan-500 hover:text-cyan-700 transition"
        >
          Back to Room
        </Link>
      </div>

      {a.lowEngagementAlert ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Low engagement alert — fewer than 50% of participants are focused.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Participants" value={a.totalParticipants ?? 0} />
        <StatCard
          label="Focused"
          value={a.focusedCount ?? 0}
          color="text-emerald-600"
          sub={`of ${a.totalParticipants ?? 0} total`}
        />
        <StatCard
          label="Distracted"
          value={a.distractedCount ?? 0}
          color="text-amber-600"
        />
        <StatCard
          label="Avg Attention"
          value={`${a.avgAttentionScore ?? 0}%`}
          color="text-cyan-700"
        />
      </div>

      <EngagementBar percentage={a.engagementPercentage ?? 0} />

      {/* Per-participant table */}
      {a.participants?.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">Participant Focus</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 font-semibold text-slate-600">Participant</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Attention</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">Face</th>
                </tr>
              </thead>
              <tbody>
                {a.participants.map((p) => (
                  <tr
                    key={p.userId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-3 font-medium text-slate-950">
                      {p.user?.name || 'Participant'}
                      {p.user?.username ? (
                        <span className="ml-2 text-xs text-slate-400">
                          @{p.user.username}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              p.attentionScore >= 70
                                ? 'bg-emerald-500'
                                : p.attentionScore >= 40
                                ? 'bg-amber-400'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${p.attentionScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{p.attentionScore}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.isFocused
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.isFocused ? 'Focused' : 'Distracted'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {p.faceDetected ? 'Detected' : 'Not detected'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          No focus data yet. Participants need to enable focus detection in the meeting room.
        </div>
      )}

      {/* Violations log */}
      {a.violations?.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">
              Toxicity Violations
              <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-600">
                {a.violations.length}
              </span>
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {a.violations.map((v) => (
              <div key={v._id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-950">
                    {v.senderName}
                    <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-600 capitalize">
                      {v.violationType}
                    </span>
                  </p>
                  <p className="mt-1 text-sm italic text-slate-500">
                    &ldquo;{v.originalText}&rdquo;
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>{new Date(v.createdAt).toLocaleTimeString()}</p>
                  <p className="mt-0.5 font-semibold text-amber-600 capitalize">{v.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AnalyticsPage
