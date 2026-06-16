import { useCallback, useEffect, useRef, useState } from 'react'
import { submitFocusScore } from '../services/analyticsService.js'

const REPORT_INTERVAL_MS = 5000
const FOCUS_YAW_THRESHOLD = 25
const FOCUS_PITCH_THRESHOLD = 20

function calculateHeadOrientation(landmarks) {
  if (!landmarks || landmarks.length < 468) return { pitch: 0, roll: 0, yaw: 0 }

  const noseTip = landmarks[1]
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const chin = landmarks[152]
  const forehead = landmarks[10]

  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  }

  const yaw = (noseTip.x - eyeCenter.x) * 300
  const pitch = (noseTip.y - (forehead.y + chin.y) / 2) * 200
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI)

  return { pitch, roll, yaw }
}

function computeAttentionScore(orientation, faceDetected) {
  if (!faceDetected) return 0

  const yawPenalty = Math.min(100, Math.abs(orientation.yaw) * 2)
  const pitchPenalty = Math.min(60, Math.abs(orientation.pitch) * 2)
  const score = Math.max(0, 100 - yawPenalty - pitchPenalty)
  return Math.round(score)
}

// useFocusDetection runs MediaPipe Face Mesh on the video element and reports attention scores.
function useFocusDetection(meetingId, videoRef, enabled = false) {
  const [attentionScore, setAttentionScore] = useState(100)
  const [isFocused, setIsFocused] = useState(true)
  const [faceDetected, setFaceDetected] = useState(false)
  const [headOrientation, setHeadOrientation] = useState({ pitch: 0, roll: 0, yaw: 0 })
  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)
  const reportTimerRef = useRef(null)
  const latestScoreRef = useRef({ attentionScore: 100, faceDetected: false, headOrientation: { pitch: 0, roll: 0, yaw: 0 }, isFocused: true })

  const reportScore = useCallback(async () => {
    if (!meetingId) return
    try {
      await submitFocusScore(meetingId, latestScoreRef.current)
    } catch {
      // Non-critical; best effort reporting
    }
  }, [meetingId])

  useEffect(() => {
    if (!enabled || !videoRef?.current || !meetingId) return

    let cancelled = false

    async function initFaceMesh() {
      try {
        const { FaceMesh } = await import('@mediapipe/face_mesh')
        const { Camera } = await import('@mediapipe/camera_utils')

        const faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        })

        faceMesh.setOptions({
          maxNumFaces: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          refineLandmarks: false,
        })

        faceMesh.onResults((results) => {
          if (cancelled) return

          const detected = results.multiFaceLandmarks?.length > 0
          setFaceDetected(detected)

          const orientation = detected
            ? calculateHeadOrientation(results.multiFaceLandmarks[0])
            : { pitch: 0, roll: 0, yaw: 0 }

          const score = computeAttentionScore(orientation, detected)
          const focused =
            detected &&
            Math.abs(orientation.yaw) < FOCUS_YAW_THRESHOLD &&
            Math.abs(orientation.pitch) < FOCUS_PITCH_THRESHOLD

          setHeadOrientation(orientation)
          setAttentionScore(score)
          setIsFocused(focused)

          latestScoreRef.current = { attentionScore: score, faceDetected: detected, headOrientation: orientation, isFocused: focused }
        })

        faceMeshRef.current = faceMesh

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current && videoRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current })
            }
          },
          width: 320,
          height: 240,
        })

        cameraRef.current = camera
        await camera.start()

        reportTimerRef.current = setInterval(reportScore, REPORT_INTERVAL_MS)
      } catch (err) {
        console.warn('Focus detection unavailable:', err.message)
      }
    }

    initFaceMesh()

    return () => {
      cancelled = true
      clearInterval(reportTimerRef.current)
      cameraRef.current?.stop()
      faceMeshRef.current?.close()
    }
  }, [enabled, meetingId, reportScore, videoRef])

  return { attentionScore, faceDetected, headOrientation, isFocused }
}

export default useFocusDetection
