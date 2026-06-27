import { useEffect, useRef, useState } from 'react'
import useAuth from '../hooks/useAuth.js'
import { getMeetingMessages } from '../services/messageService.js'
import socket from '../services/socketService.js'

// ChatPanel connects to a meeting room and exchanges real-time Socket.io messages.
function ChatPanel({ meetingId, user }) {
  const { isAuthenticated } = useAuth()
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const [socketError, setSocketError] = useState('')
  const [toxicWarning, setToxicWarning] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!meetingId) {
      return undefined
    }

    async function loadMessageHistory() {
      try {
        const data = await getMeetingMessages(meetingId)
        setMessages(
          data.messages.map((message) => ({
            createdAt: message.createdAt,
            flagged: message.moderationStatus === 'flagged',
            id: message._id,
            meetingId: message.meetingId,
            message:
              message.moderationStatus === 'flagged'
                ? '[Message flagged for inappropriate content]'
                : message.text,
            sender: {
              name: message.senderName,
              username: message.senderUsername,
            },
          })),
        )
      } catch {
        setSocketError('Unable to load chat history.')
      }
    }

    if (isAuthenticated) {
      loadMessageHistory()
    }

    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('meeting:join', { meetingId, user })

    function handleNewMessage(message) {
      setMessages((current) => [...current, message])
    }

    function handleChatError(error) {
      setSocketError(error.message)
    }

    function handleToxicWarning({ message }) {
      setToxicWarning(message)
      setTimeout(() => setToxicWarning(''), 5000)
    }

    socket.on('chat:new-message', handleNewMessage)
    socket.on('chat:error', handleChatError)
    socket.on('chat:warning', handleToxicWarning)

    return () => {
      socket.off('chat:new-message', handleNewMessage)
      socket.off('chat:error', handleChatError)
      socket.off('chat:warning', handleToxicWarning)
    }
  }, [isAuthenticated, meetingId, user])

  function handleSubmit(event) {
    event.preventDefault()

    if (!draft.trim() || !meetingId) {
      return
    }

    socket.emit('chat:send-message', {
      meetingId,
      message: draft,
      sender: user,
    })
    setDraft('')
  }

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-bold tracking-normal text-slate-950">
          Meeting chat
        </h2>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {meetingId ? 'Live' : 'No room'}
        </span>
      </div>

      {socketError ? (
        <p className="mx-5 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {socketError}
        </p>
      ) : null}

      {toxicWarning ? (
        <p className="mx-5 mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          {toxicWarning}
        </p>
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-4" style={{ maxHeight: '400px' }}>
        {messages.length > 0 ? (
          messages.map((message) => (
            <article
              className={`rounded-md p-3 shadow-sm ${
                message.flagged
                  ? 'border border-amber-200 bg-amber-50'
                  : 'bg-slate-50'
              }`}
              key={message.id}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  message.flagged ? 'text-amber-600' : 'text-cyan-700'
                }`}
              >
                {message.sender?.name || 'Participant'}
                {message.flagged ? ' — flagged' : ''}
              </p>
              <p
                className={`mt-1 text-sm ${
                  message.flagged ? 'italic text-amber-700' : 'text-slate-700'
                }`}
              >
                {message.message}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="flex gap-3 border-t border-slate-200 p-4" onSubmit={handleSubmit}>
        <input
          className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
          disabled={!meetingId}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          type="text"
          value={draft}
        />
        <button
          className="min-h-11 rounded-md bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!meetingId || !draft.trim()}
          type="submit"
        >
          Send
        </button>
      </form>
    </section>
  )
}

export default ChatPanel
