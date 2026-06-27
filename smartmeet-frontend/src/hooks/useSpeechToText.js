import { useCallback, useEffect, useRef, useState } from 'react'

const RESTART_DELAY_MS = 300

function getSpeechErrorMessage(code) {
  const messages = {
    'audio-capture': 'No working microphone was found. Check your audio device.',
    'not-allowed': 'Microphone access was denied. Allow it in browser settings to use captions.',
    'service-not-allowed': 'Speech recognition is blocked by this browser or network.',
    network: 'Live captions lost the speech service connection. Retrying...',
  }

  return messages[code] || 'Live captions stopped unexpectedly. Please try again.'
}

// Wraps the Web Speech API and keeps captions alive when Chrome ends a session after silence.
function useSpeechToText(onFinalTranscript) {
  const recognitionRef = useRef(null)
  const restartTimerRef = useRef(null)
  const shouldListenRef = useRef(false)
  const finalCallbackRef = useRef(onFinalTranscript)
  const finalTextRef = useRef('')
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(
    () => typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
  )
  const [transcript, setTranscript] = useState('')

  useEffect(() => {
    finalCallbackRef.current = onFinalTranscript
  }, [onFinalTranscript])

  const stopListening = useCallback(() => {
    shouldListenRef.current = false
    clearTimeout(restartTimerRef.current)
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Live captions require Chrome, Edge, or another browser with speech recognition.')
      return false
    }

    if (shouldListenRef.current) return true

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'

    recognition.onstart = () => {
      setError('')
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let interimText = ''
      let newFinalText = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0]?.transcript?.trim()
        if (!text) continue

        if (event.results[index].isFinal) {
          newFinalText += `${text} `
          finalCallbackRef.current?.(text)
        } else {
          interimText += `${text} `
        }
      }

      if (newFinalText) {
        finalTextRef.current = `${finalTextRef.current} ${newFinalText}`.trim().slice(-2000)
      }

      setTranscript(`${finalTextRef.current} ${interimText}`.trim())
    }

    recognition.onerror = (event) => {
      const fatal = ['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)
      setError(getSpeechErrorMessage(event.error))
      setIsListening(false)
      if (fatal) shouldListenRef.current = false
    }

    recognition.onend = () => {
      setIsListening(false)
      if (!shouldListenRef.current) return

      restartTimerRef.current = setTimeout(() => {
        try {
          recognition.start()
        } catch {
          shouldListenRef.current = false
          setError('Live captions could not restart. Turn captions off and on again.')
        }
      }, RESTART_DELAY_MS)
    }

    recognitionRef.current = recognition
    shouldListenRef.current = true

    try {
      recognition.start()
      return true
    } catch {
      shouldListenRef.current = false
      setError('Live captions could not start. Check microphone permission and try again.')
      return false
    }
  }, [isSupported])

  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      clearTimeout(restartTimerRef.current)
      recognitionRef.current?.abort()
    }
  }, [])

  return {
    error,
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
  }
}

export default useSpeechToText
