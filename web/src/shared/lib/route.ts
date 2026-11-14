export type Route = 'landing' | 'tool'

/** The tool has its own page at `#/tool`. Any other hash, such as `#intro`, stays on the landing page. */
export function routeFromHash(hash: string): Route {
  return hash === '#/tool' ? 'tool' : 'landing'
}
