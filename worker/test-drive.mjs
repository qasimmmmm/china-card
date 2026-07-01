/** End-to-end proof: drive the Element-UI mock wizard with the driver and submit. */
import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { driveWizard } from './official-driver.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MOCK = pathToFileURL(path.join(__dirname, 'mock-portal', 'index.html')).href
const OUT = '/tmp/nia-recon'; fs.mkdirSync(OUT, { recursive: true })

// tiny valid JPEG (mock only needs a file present to pass the upload gate)
const IMG = path.join(OUT, 'passport.jpg')
fs.writeFileSync(IMG, Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AvwA//9k=', 'base64'))

const order = {
  reference: 'TEST-DRIVE',
  passportImagePath: IMG,
  application: {
    docType: 'Ordinary Passport', surname: 'smith', givenNames: 'john michael', sex: 'Male',
    dob: '1990-05-14', nationality: 'United States', passportNumber: 'e1234567',
    countryOfBirth: 'United Kingdom', cityOfBirth: 'London', passportLostStolen: 'No',
    transportMode: 'Flight', carrierNumber: 'ca938', arrivalDate: '2026-07-03',
    entryCity: 'Beijing', entryPort: 'Beijing Capital International Airport (PEK)',
    purpose: 'Sightseeing/Leisure', destinationCity: 'Beijing',
    addressInChina: 'Beijing Hotel, Dongcheng District', beenToOtherCountries: 'No',
    hasVisa: 'Yes', visaType: 'Tourism (L)', visaNumber: 'V123456',
    phoneAreaCode: '+1 (United States / Canada)', phone: '2025550123', email: 'john@example.com',
    accompanying: 'No',
  },
}

const run = async () => {
  const headless = process.env.HEADFUL !== '1'
  const b = await chromium.launch({ channel: 'chrome', headless })
  const page = await (await b.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' })).newPage()
  page.on('console', (m) => { if (m.type() === 'error') console.log('[page-error]', m.text()) })
  try {
    await page.goto(MOCK, { waitUntil: 'networkidle', timeout: 45000 })
    const res = await driveWizard(page, order, { submit: true })
    console.log('\n=== DRIVE RESULT ===')
    console.log('filled:', res.filled, '/', res.total)
    console.log('missed:', JSON.stringify(res.missed, null, 0))
    console.log('confirmation:', res.confirmation)
    console.log('submitted:', res.submitted)
    if (res.receiptImage) {
      fs.writeFileSync(OUT + '/receipt.png', Buffer.from(res.receiptImage.split(',')[1], 'base64'))
      console.log('receipt saved -> ' + OUT + '/receipt.png')
    }
    await page.screenshot({ path: OUT + '/final.png', fullPage: true })
    // exit code reflects success
    if (!res.confirmation) { console.log('RESULT: FAIL (no confirmation)'); process.exitCode = 2 }
    else if (res.missed.length) { console.log('RESULT: PARTIAL (fields missed)'); process.exitCode = 3 }
    else console.log('RESULT: PASS ✓')
  } catch (e) {
    console.error('ERROR', e.message)
    await page.screenshot({ path: OUT + '/error.png', fullPage: true }).catch(() => {})
    process.exitCode = 1
  } finally { await b.close() }
}
run()
