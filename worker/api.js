// Thin client for the operator API exposed by the web app.
import { config } from './config.js'

const headers = () => ({
  'Content-Type': 'application/json',
  'x-operator-key': config.operatorKey,
})

export async function pullQueue(status = config.pullStatus) {
  const url = `${config.apiBase}/api/operator/queue?status=${encodeURIComponent(status)}`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) throw new Error(`Queue fetch failed (${res.status}): ${await res.text()}`)
  const json = await res.json()
  return json.orders || []
}

export async function getOrder(reference) {
  const url = `${config.apiBase}/api/operator/orders/${encodeURIComponent(reference)}`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) throw new Error(`Order fetch failed (${res.status})`)
  const json = await res.json()
  return json.order
}

export async function setStatus(reference, status, note, confirmation) {
  const url = `${config.apiBase}/api/operator/orders/${encodeURIComponent(reference)}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status, note, confirmation }),
  })
  if (!res.ok) throw new Error(`Status update failed (${res.status}): ${await res.text()}`)
  return (await res.json()).order
}
