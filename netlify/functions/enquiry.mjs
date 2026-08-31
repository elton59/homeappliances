import { sendEnquiry } from '../../server/email-service.mjs'

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed.' }) }
  try {
    if ((event.body || '').length > 20_000) throw new Error('Request is too large.')
    const result = await sendEnquiry(JSON.parse(event.body || '{}'))
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, id: result.messageId }) }
  } catch (error) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to send enquiry.' }) }
  }
}
