"use client"

import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import getServerStatus from "../utils/getServerStatus"

function useCheckServerStatus() {
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    getServerStatus(() => {
      if (isMounted) navigate("/server-health")
    })

    return () => {
      isMounted = false
    }
  }, [navigate])

  return null
}

export default useCheckServerStatus
