/** Prove the filing-service HTTP path: /start drives the wizard, /confirm submits. */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 4199
const KEY = 'test-key'
const OUT = '/tmp/nia-recon'

const JPEG = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AvwA//9k='

const application = {
  docType: 'Ordinary Passport', surname: 'smith', givenNames: 'john michael', sex: 'Male',
  dob: '1990-05-14', nationality: 'United States', passportNumber: 'e1234567',
  countryOfBirth: 'United Kingdom', cityOfBirth: 'London', passportLostStolen: 'No',
  transportMode: 'Flight', carrierNumber: 'ca938', arrivalDate: '2026-07-03',
  entryCity: 'Beijing', entryPort: 'Beijing Capital International Airport (PEK)',
  purpose: 'Sightseeing/Leisure', destinationCity: 'Beijing',
  addressInChina: 'Beijing Hotel, Dongcheng District', beenToOtherCountries: 'No',
  hasVisa: 'Yes', visaType: 'Tourism (L)', visaNumber: 'V123456',
  phoneAreaCode: '+1 (United States / Canada)', phone: '2025550123', email: 'john@example.com',
  passportImage: 'data:image/jpeg;base64,' + JPEG,
}

const post = async (p, body) => {
  const r = await fetch(`http://127.0.0.1:${PORT}${p}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-filing-key': KEY }, body: JSON.stringify(body),
  })
  return { status: r.status, json: await r.json().catch(() => ({})) }
}
const health = async () => { try { const r = await fetch(`http://127.0.0.1:${PORT}/health`); return r.ok } catch { return false } }

const run = async () => {
  const srv = spawn('node', ['filing-service.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(PORT), FILING_SERVICE_KEY: KEY, WORKER_BROWSER_CHANNEL: 'chrome', WORKER_HEADLESS: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  srv.stdout.on('data', (d) => process.stdout.write('[svc] ' + d))
  srv.stderr.on('data', (d) => process.stderr.write('[svc-err] ' + d))

  try {
    for (let i = 0; i < 40 && !(await health()); i++) await new Promise((r) => setTimeout(r, 250))
    if (!(await health())) throw new Error('service did not start')

    console.log('\n--- POST /start ---')
    const start = await post('/start', { reference: 'FILING-TEST', application })
    console.log('status', start.status, '| filled', start.json.filled, '/', start.json.total, '| missed', JSON.stringify(start.json.missed))
    if (start.json.formPreview) { fs.writeFileSync(OUT + '/filing-preview.png', Buffer.from(start.json.formPreview.split(',')[1], 'base64')); console.log('preview saved') }
    const sessionId = start.json.sessionId
    if (!sessionId) throw new Error('no sessionId: ' + JSON.stringify(start.json))

    console.log('\n--- POST /confirm ---')
    const conf = await post('/confirm', { sessionId })
    console.log('status', conf.status, '| result', JSON.stringify({ status: conf.json.status, confirmation: conf.json.confirmation, portal: conf.json.portal }))
    if (conf.json.receiptImage) { fs.writeFileSync(OUT + '/filing-receipt.png', Buffer.from(conf.json.receiptImage.split(',')[1], 'base64')); console.log('receipt saved -> ' + OUT + '/filing-receipt.png') }

    const ok = conf.json.status === 'completed' && conf.json.confirmation && (start.json.missed || []).length === 0
    console.log('\nRESULT:', ok ? 'PASS ✓' : 'CHECK ✗')
    process.exitCode = ok ? 0 : 2
  } catch (e) {
    console.error('ERROR', e.message); process.exitCode = 1
  } finally {
    srv.kill('SIGKILL')
  }
}
run()
