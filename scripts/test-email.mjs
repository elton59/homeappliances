import { readFileSync } from 'node:fs'
import { sendEnquiry } from '../server/email-service.mjs'

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(Boolean).map((line) => {
  const at = line.indexOf('=')
  return [line.slice(0, at), line.slice(at + 1)]
}))

const result = await sendEnquiry({
  name: 'Website delivery test',
  phone: '0790076362',
  email: 'enquiries@homeappliancesrepair.co.ke',
  location: 'Nairobi',
  service: 'Email integration test',
  requestType: 'Appointment request',
  message: 'This is an automated test from the recreated website. The enquiry email integration is working correctly.',
  source: 'Local integration test',
}, env.SMTP2GO_API_KEY)
console.log(`Test email accepted successfully. Message ID: ${result.messageId || 'accepted'}`)
