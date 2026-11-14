// Pure: split a citation into plain text and links, so URLs inside it can be opened.
export type CitationPart = { kind: 'text'; value: string } | { kind: 'link'; value: string }

const URL_PATTERN = /https?:\/\/[^\s)"]+/g
const TRAILING = /[.,;:]+$/

export function splitCitation(citation: string): CitationPart[] {
  const parts: CitationPart[] = []
  let last = 0
  for (const match of citation.matchAll(URL_PATTERN)) {
    const url = match[0].replace(TRAILING, '')
    const start = match.index ?? 0
    if (start > last) parts.push({ kind: 'text', value: citation.slice(last, start) })
    parts.push({ kind: 'link', value: url })
    last = start + url.length
  }
  if (last < citation.length) parts.push({ kind: 'text', value: citation.slice(last) })
  return parts
}
