import { useCallback, useEffect, useRef, useState } from 'react'

// useSpeechToText wraps the browser Web Speech API for live meeting captions.
function useSpeechToText(onFinalTranscript) {
  const recognitionRef = useRef(null)
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(
    () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
  )
  const [transcript, setTranscript] = useState('')

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.')
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')

      setTranscript(text)

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) {
          onFinalTranscript?.(result[0].transcript)
        }
      }
    }

    recognition.onerror = () => {
      setError('Speech recognition stopped unexpectedly.')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setError('')
    setIsListening(true)
  }, [isSupported, onFinalTranscript])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
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
