// Pure wording for the counts on a rotation card.
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}
