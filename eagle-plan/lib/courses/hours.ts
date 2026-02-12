export function parseCourseHours(raw: string | null | undefined): number {
  if (!raw) return 0
  const text = String(raw).replace(/\u00A0/g, " ").trim()

  // Common formats: "3 hours", "3", "3-4", "3–4"
  const range = text.match(/(\d+)\s*[\-–]\s*(\d+)/)
  if (range) {
    const a = Number(range[1])
    const b = Number(range[2])
    return Number.isFinite(a) && Number.isFinite(b) ? Math.max(a, b) : 0
  }

  const first = text.match(/(\d+)/)
  if (!first) return 0

  const n = Number(first[1])
  return Number.isFinite(n) ? n : 0
}

