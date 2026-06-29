import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import type { Order, OrderStatus } from './types'

/**
 * Pluggable order store.
 *
 *  - "memory"  → in-process Map (resets on restart; fine for previews/tests).
 *  - "file"    → JSON file on disk. Uses a project-local ./.data dir in dev and
 *                the OS temp dir on serverless (Vercel) where only /tmp is
 *                writable. NOTE: serverless filesystems are ephemeral — wire up
 *                the "postgres" driver (or Vercel KV/Postgres) for production.
 *
 * The API surface is async so a real database can be dropped in without
 * touching callers.
 */

const DRIVER = (process.env.ORDER_STORE_DRIVER || 'file').toLowerCase()

// Survive Next.js dev hot-reloads by stashing the map on globalThis.
const g = globalThis as unknown as { __orders?: Map<string, Order> }
const mem: Map<string, Order> = g.__orders ?? (g.__orders = new Map())

function filePath() {
  const onServerless = !!process.env.VERCEL || !!process.env.AWS_REGION
  const dir = onServerless ? path.join(os.tmpdir(), 'cac-data') : path.join(process.cwd(), '.data')
  return path.join(dir, 'orders.json')
}

async function readFileStore(): Promise<Map<string, Order>> {
  try {
    const raw = await fs.readFile(filePath(), 'utf8')
    const arr: Order[] = JSON.parse(raw)
    return new Map(arr.map((o) => [o.reference, o]))
  } catch {
    return new Map()
  }
}

async function writeFileStore(map: Map<string, Order>) {
  const fp = filePath()
  await fs.mkdir(path.dirname(fp), { recursive: true })
  await fs.writeFile(fp, JSON.stringify([...map.values()], null, 2), 'utf8')
}

async function load(): Promise<Map<string, Order>> {
  if (DRIVER === 'file') {
    try {
      return await readFileStore()
    } catch {
      return mem
    }
  }
  return mem
}

async function persist(map: Map<string, Order>) {
  if (DRIVER === 'file') {
    try {
      await writeFileStore(map)
      return
    } catch {
      // fall through to memory so the request still succeeds
    }
  }
  // keep memory in sync regardless
  mem.clear()
  for (const [k, v] of map) mem.set(k, v)
}

export async function saveOrder(order: Order): Promise<Order> {
  const map = await load()
  map.set(order.reference, order)
  await persist(map)
  return order
}

export async function getOrder(reference: string): Promise<Order | null> {
  const map = await load()
  return map.get(reference.trim().toUpperCase()) ?? null
}

export async function listOrders(filter?: { status?: OrderStatus }): Promise<Order[]> {
  const map = await load()
  let all = [...map.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  if (filter?.status) all = all.filter((o) => o.status === filter.status)
  return all
}

export async function updateOrderStatus(
  reference: string,
  status: OrderStatus,
  note?: string,
): Promise<Order | null> {
  const map = await load()
  const order = map.get(reference.trim().toUpperCase())
  if (!order) return null
  order.status = status
  order.updatedAt = new Date().toISOString()
  order.events.push({ at: order.updatedAt, status, note })
  map.set(order.reference, order)
  await persist(map)
  return order
}
