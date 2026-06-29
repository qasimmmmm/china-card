import 'server-only'

/**
 * Operator/worker authentication. The automation worker and any internal
 * tooling must present the shared secret in the `x-operator-key` header.
 * In development a default key is allowed so you can test locally; in
 * production OPERATOR_API_KEY must be set or all operator endpoints are denied.
 */
const DEV_FALLBACK = 'dev-operator-key'

export function operatorKey(): string | null {
  const k = process.env.OPERATOR_API_KEY
  if (k && k.trim() && k !== 'change-me-to-a-long-random-string') return k
  if (process.env.NODE_ENV !== 'production') return DEV_FALLBACK
  return null
}

export function isOperator(req: Request): boolean {
  const expected = operatorKey()
  if (!expected) return false
  const provided = req.headers.get('x-operator-key') || ''
  return provided === expected
}
