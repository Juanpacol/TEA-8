import { useEffect, useState } from 'react'
import { routeFromHash, type Route } from '../lib/route.ts'

/** The current page, from the URL hash. Opening another page starts at the top. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      const next = routeFromHash(window.location.hash)
      setRoute((current) => {
        if (current !== next) window.scrollTo({ top: 0, behavior: 'instant' })
        return next
      })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
