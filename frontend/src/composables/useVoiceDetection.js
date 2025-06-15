import { ref, onUnmounted } from 'vue'

export function useVoiceDetection(options = {}) {
  const { sensitivity = 0.08, smoothing = 0.85 } = options
  
  const isListening = ref(false)
  const audioLevel = ref(0)
  const isSupported = ref(true)
  const error = ref(null)
  
  let mediaStreamRef = null
  let audioContextRef = null
  let analyserRef = null
  let animationFrameRef = null
  let smoothedLevelRef = 0
  let isInitializingRef = false

  const startListening = async () => {
    if (isInitializingRef) return
    isInitializingRef = true

    try {
      error.value = null

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone access not supported")
      }

      // Clean up any existing resources first
      if (mediaStreamRef) {
        mediaStreamRef.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef && audioContextRef.state !== "closed") {
        await audioContextRef.close()
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      mediaStreamRef = stream

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Wait for audio context to be ready
      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }

      audioContextRef = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      analyserRef = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let lastUpdateTime = 0

      const updateAudioLevel = (currentTime) => {
        if (!analyserRef || !isListening.value) return

        // Throttle updates to prevent overwhelming the GPU
        if (currentTime - lastUpdateTime < 16) {
          // ~60fps max
          animationFrameRef = requestAnimationFrame(updateAudioLevel)
          return
        }
        lastUpdateTime = currentTime

        try {
          analyserRef.getByteFrequencyData(dataArray)

          // Calculate RMS with gentler sensitivity
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i]
          }
          const rms = Math.sqrt(sum / dataArray.length)
          const normalizedLevel = Math.min(rms / 120, 1)

          // Apply sensitivity threshold with smooth curve
          const adjustedLevel = normalizedLevel > sensitivity ? Math.pow(normalizedLevel, 0.8) : 0

          // Smooth transitions
          smoothedLevelRef = smoothedLevelRef * smoothing + adjustedLevel * (1 - smoothing)
          const boostedLevel = Math.min(smoothedLevelRef * 1.1, 1)

          audioLevel.value = boostedLevel
        } catch (err) {
          console.warn("Audio processing error:", err)
        }

        animationFrameRef = requestAnimationFrame(updateAudioLevel)
      }

      // Start audio processing
      animationFrameRef = requestAnimationFrame(updateAudioLevel)
      isListening.value = true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access microphone"
      error.value = errorMessage
      isSupported.value = false
      console.error("Voice detection error:", err)
      isListening.value = false
    } finally {
      isInitializingRef = false
    }
  }

  const stopListening = () => {
    isListening.value = false

    if (animationFrameRef) {
      cancelAnimationFrame(animationFrameRef)
      animationFrameRef = null
    }

    if (mediaStreamRef) {
      mediaStreamRef.getTracks().forEach((track) => track.stop())
      mediaStreamRef = null
    }

    if (audioContextRef && audioContextRef.state !== "closed") {
      audioContextRef.close().catch(console.warn)
      audioContextRef = null
    }

    analyserRef = null
    audioLevel.value = 0
    smoothedLevelRef = 0
    isInitializingRef = false
  }

  onUnmounted(() => {
    stopListening()
  })

  return {
    isListening,
    audioLevel,
    isSupported,
    error,
    startListening,
    stopListening,
  }
} 