import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerOptions {
  onComplete?: () => void
  storageKey?: string // persists timer across page changes
}

interface TimerState {
  isRunning: boolean
  elapsed: number // seconds
  startTime: number | null
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onComplete, storageKey } = options
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getInitialState = (): TimerState => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as TimerState
        if (parsed.isRunning && parsed.startTime) {
          const now = Date.now()
          const additionalElapsed = Math.floor((now - parsed.startTime) / 1000)
          return {
            ...parsed,
            elapsed: parsed.elapsed + additionalElapsed,
            startTime: now,
          }
        }
        return parsed
      }
    }
    return { isRunning: false, elapsed: 0, startTime: null }
  }

  const [state, setState] = useState<TimerState>(getInitialState)

  // Persist state
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(state))
    }
  }, [state, storageKey])

  // Tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState(s => ({ ...s, elapsed: s.elapsed + 1 }))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isRunning])

  const start = useCallback((initialElapsed: number = 0) => {
    setState({ isRunning: true, elapsed: initialElapsed, startTime: Date.now() })
  }, [])

  const stop = useCallback(() => {
    setState(s => ({ ...s, isRunning: false, startTime: null }))
    onComplete?.()
  }, [onComplete])

  const reset = useCallback(() => {
    if (storageKey) localStorage.removeItem(storageKey)
    setState({ isRunning: false, elapsed: 0, startTime: null })
  }, [storageKey])

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return {
    isRunning: state.isRunning,
    elapsed: state.elapsed,
    display: formatTime(state.elapsed),
    start,
    stop,
    reset,
  }
}

/**
 * Countdown timer — counts down from a given number of seconds
 */
export function useCountdown(totalSeconds: number, onComplete?: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    setRemaining(totalSeconds)
    setIsRunning(true)
  }, [totalSeconds])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, onComplete])

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const progress = 1 - remaining / totalSeconds

  return { isRunning, remaining, display: formatTime(remaining), progress, start, stop }
}
