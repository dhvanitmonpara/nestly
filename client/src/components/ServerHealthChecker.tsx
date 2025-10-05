"use client"

import { useEffect, useState } from "react"
import getServerStatus from "../utils/getServerStatus"
import { useNavigate } from "react-router-dom"

function ServerHealthChecker() {
  const [attempts, setAttempts] = useState(0)
  const [timer, setTimer] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    let stopped = false

    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    const checkServer = () => {
      if (stopped) return
      getServerStatus(
        () => {
          setAttempts(prev => {
            const next = prev + 1
            if (next >= 5) stopped = true
            return next
          })
        },
        () => {
          stopped = true
          clearInterval(attemptsInterval)
          clearInterval(timerInterval)
          navigate("/")
        },
      )
    }

    const attemptsInterval = setInterval(checkServer, 5000)

    return () => {
      stopped = true
      clearInterval(attemptsInterval)
      clearInterval(timerInterval)
    }
  }, [navigate])

  if (attempts < 5) return <p>{timer} seconds</p>

  return <p className="text-red-400">{attempts} attempts failed, please try again</p>
}

export default ServerHealthChecker
