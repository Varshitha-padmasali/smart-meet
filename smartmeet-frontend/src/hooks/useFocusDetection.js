import { useCallback, useEffect, useRef, useState } from 'react'
import { submitFocusScore } from '../services/analyticsService.js'

const REPORT_INTERVAL_MS = 5000
const FRAME_INTERVAL_MS = 180
const FOCUS_THRESHOLD = 60
const FACE_MESH_VERSION = '0.4.1633559619'

function resolveFaceMeshConstructor(module) {
  const FaceMesh =
    module.FaceMesh ||
    module.default?.FaceMesh ||
    module['module.exports']?.FaceMesh

  if (typeof FaceMesh !== 'function') {
    throw new Error('MediaPipe Face Mesh did not load correctly')
  }

  return FaceMesh
}

function average(points) {
  return points.reduce(
    (total, point) => ({ x: total.x + point.x / points.length, y: total.y + point.y / points.length }),
    { x: 0, y: 0 },
  )
}

// Estimates visual attention from normalized head pose and refined iris landmarks.
function calculateVisualAttention(landmarks) {
  const nose = landmarks[1]
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const chin = landmarks[152]
  const forehead = landmarks[10]
  const eyeCenter = average([leftEye, rightEye])
  const eyeDistance = Math.max(Math.abs(rightEye.x - leftEye.x), 0.01)
  const faceHeight = Math.max(Math.abs(chin.y - forehead.y), 0.01)

  const yaw = ((nose.x - eyeCenter.x) / eyeDistance) * 55
  const pitchRatio = (nose.y - forehead.y) / faceHeight
  const pitch = (pitchRatio - 0.5) * 90
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI)

  let gaze = 0
  if (landmarks.length >= 478) {
    const leftIris = average(landmarks.slice(468, 473))
    const rightIris = average(landmarks.slice(473, 478))
    const leftCorners = [landmarks[33], landmarks[133]]
    const rightCorners = [landmarks[263], landmarks[362]]

    const eyeOffset = (iris, corners) => {
      const minX = Math.min(corners[0].x, corners[1].x)
      const width = Math.max(Math.abs(corners[0].x - corners[1].x), 0.001)
      return Math.abs((iris.x - minX) / width - 0.5)
    }

    gaze = ((eyeOffset(leftIris, leftCorners) + eyeOffset(rightIris, rightCorners)) / 2) * 100
  }

  const penalty =
    Math.max(0, Math.abs(yaw) - 5) * 2.4 +
    Math.max(0, Math.abs(pitch) - 5) * 2 +
    Math.max(0, Math.abs(roll) - 8) * 1.2 +
    Math.max(0, gaze - 16) * 1.4
  const score = Math.round(Math.max(0, Math.min(100, 100 - penalty)))

  return { orientation: { pitch, roll, yaw }, score }
}

// Runs Face Mesh against the existing meeting video without requesting the camera twice.
function useFocusDetection(meetingId, videoRef, enabled = false) {
  const [attentionScore, setAttentionScore] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [error, setError] = useState('')
  const [headOrientation, setHeadOrientation] = useState({ pitch: 0, roll: 0, yaw: 0 })
  const latestScoreRef = useRef({
    attentionScore: 0,
    faceDetected: false,
    headOrientation: { pitch: 0, roll: 0, yaw: 0 },
    isFocused: false,
  })

  const reportScore = useCallback(async () => {
    if (!meetingId || !localStorage.getItem('smartmeet_token')) return
    try {
      await submitFocusScore(meetingId, latestScoreRef.current)
    } catch (requestError) {
      console.warn('[Focus] Score reporting failed:', requestError.response?.data?.message || requestError.message)
    }
  }, [meetingId])

  useEffect(() => {
    if (!enabled || !videoRef?.current || !meetingId) return undefined

    let cancelled = false
    let faceMesh
    let frameTimer
    let reportTimer
    let processing = false
    let smoothedScore = 0

    async function processFrame() {
      const video = videoRef.current
      if (cancelled || processing || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return

      processing = true
      try {
        await faceMesh.send({ image: video })
      } catch (frameError) {
        if (!cancelled) setError(`Attention tracking stopped: ${frameError.message}`)
      } finally {
        processing = false
      }
    }

    async function initialize() {
      try {
        setError('')
        const faceMeshModule = await import('@mediapipe/face_mesh')
        const FaceMesh = resolveFaceMeshConstructor(faceMeshModule)
        faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${FACE_MESH_VERSION}/${file}`,
        })
        faceMesh.setOptions({
          maxNumFaces: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
          refineLandmarks: true,
        })

        faceMesh.onResults((results) => {
          if (cancelled) return
          const landmarks = results.multiFaceLandmarks?.[0]
          const detected = Boolean(landmarks)

          if (!detected) {
            smoothedScore = 0
            const emptyResult = {
              attentionScore: 0,
              faceDetected: false,
              headOrientation: { pitch: 0, roll: 0, yaw: 0 },
              isFocused: false,
            }
            latestScoreRef.current = emptyResult
            setAttentionScore(0)
            setFaceDetected(false)
            setIsFocused(false)
            return
          }

          const { orientation, score } = calculateVisualAttention(landmarks)
          smoothedScore = smoothedScore ? Math.round(smoothedScore * 0.65 + score * 0.35) : score
          const focused = smoothedScore >= FOCUS_THRESHOLD
          latestScoreRef.current = {
            attentionScore: smoothedScore,
            faceDetected: true,
            headOrientation: orientation,
            isFocused: focused,
          }
          setAttentionScore(smoothedScore)
          setFaceDetected(true)
          setHeadOrientation(orientation)
          setIsFocused(focused)
        })

        await faceMesh.initialize()
        if (cancelled) return
        frameTimer = setInterval(processFrame, FRAME_INTERVAL_MS)
        reportTimer = setInterval(reportScore, REPORT_INTERVAL_MS)
        processFrame()
      } catch (initializationError) {
        if (!cancelled) {
          setAttentionScore(0)
          setFaceDetected(false)
          setIsFocused(false)
          setError(`Attention tracking is unavailable: ${initializationError.message}`)
        }
      }
    }

    initialize()

    return () => {
      cancelled = true
      clearInterval(frameTimer)
      clearInterval(reportTimer)
      faceMesh?.close()
    }
  }, [enabled, meetingId, reportScore, videoRef])

  return { attentionScore, error, faceDetected, headOrientation, isFocused }
}

export default useFocusDetection
