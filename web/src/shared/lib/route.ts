export type Route = 'landing' | 'tool' | 'ai'

/** The tool and the AI statement have their own pages. Any other hash, such as `#intro`, stays on the landing page. */
export function routeFromHash(hash: string): Route {
  if (hash === '#/tool') return 'tool'
  if (hash === '#/ai') return 'ai'
  return 'landing'
}
