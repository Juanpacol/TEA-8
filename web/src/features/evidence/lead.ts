/** Splits a statement after its first sentence, so the first can stand out. A full stop inside a number or an abbreviation does not count. */
export function splitLead(text: string): { lead: string; rest: string } {
  const match = /(?<=[a-z)%])\.\s+(?=[A-Z])/.exec(text)
  if (!match) return { lead: text, rest: '' }
  return { lead: text.slice(0, match.index + 1), rest: text.slice(match.index + match[0].length) }
}
