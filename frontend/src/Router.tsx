import React, { useEffect, useState } from 'react'

const BASE = '/core/'

export const useRoute = () => {
  const getPath = () => {
    const full = window.location.pathname
    // убираем basename из пути: '/core/form' → '/form'
    return full.startsWith(BASE.slice(0, -1))
      ? full.slice(BASE.length - 1) || '/'
      : full
  }

  const [path, setPath] = useState<string>(getPath)

  useEffect(() => {
    const onLocationChange = () => setPath(getPath())
    window.addEventListener('popstate', onLocationChange)
    return () => window.removeEventListener('popstate', onLocationChange)
  }, [])

  return path
}

const Router = ({ routes }: { routes: Record<string, React.ComponentType> }) => {
  const path = useRoute()
  const Component = routes[path] || routes['*']
  return <Component />
}

export default Router