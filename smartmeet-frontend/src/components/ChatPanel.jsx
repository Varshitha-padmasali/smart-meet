import { useEffect, useState } from 'react'
import socket from '../services/socketService.js'

// ChatPanel connects to a meeting room and exchanges real-time Socket.io messages.
function ChatPanel({ meetingId, user }) {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const [socketError, setSocketError] = useState('')

  useEffect(() => {
    if (!meetingId) {
      return undefined
    }

    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('meeting:join', {
      meetingId,
      user,
    })

    function handleNewMessage(message) {
      setMessages((currentMessages) => [...currentMessages, message])
    }

    function handleChatError(error) {
      setSocketError(error.message)
    }

    socket.on('chat:new-message', handleNewMessage)
    socket.on('chat:error', handleChatError)

    return () => {
      socket.off('chat:new-message', handleNewMessage)
      socket.off('chat:error', handleChatError)
    }
  }, [meetingId, user])

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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-normal text-slate-950">
          Meeting chat
        </h2>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {meetingId ? 'Connected room' : 'No room'}
        </span>
      </div>

      {socketError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {socketError}
        </p>
      ) : null}

      <div className="mt-4 h-64 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <article className="rounded-md bg-white p-3 shadow-sm" key={message.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                {message.sender?.name || 'Participant'}
              </p>
              <p className="mt-1 text-sm text-slate-700">{message.message}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            Join a meeting room to start chatting.
          </p>
        )}
      </div>

      <form className="mt-4 flex gap-3" onSubmit={handleSubmit}>
        <input
          className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
          disabled={!meetingId}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message"
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
