import { randomUUID } from 'node:crypto'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REQUEST_TYPES = new Set(['Appointment request', 'General enquiry', 'Quotation request'])

export function validateEnquiry(input) {
  const data = {
    name: String(input.name || '').trim().slice(0, 120),
    phone: String(input.phone || '').trim().slice(0, 40),
    email: String(input.email || '').trim().slice(0, 160),
    location: String(input.location || '').trim().slice(0, 160),
    service: String(input.service || '').trim().slice(0, 160),
    requestType: String(input.requestType || 'Appointment request').trim().slice(0, 80),
    message: String(input.message || '').trim().slice(0, 4000),
    source: String(input.source || 'Website').trim().slice(0, 300),
    website: String(input.website || '').trim(),
  }
  if (data.website) throw new Error('Spam submission rejected.')
  if (!data.name || !data.phone || !data.message) throw new Error('Name, phone number, and message are required.')
  if (data.email && !EMAIL_PATTERN.test(data.email)) throw new Error('Enter a valid email address.')
  if (!REQUEST_TYPES.has(data.requestType)) data.requestType = 'General enquiry'
  return data
}

export async function sendEnquiry(input, apiKey = process.env.SMTP2GO_API_KEY) {
  if (!apiKey) throw new Error('SMTP2GO_API_KEY is not configured.')
  const data = validateEnquiry(input)
  const escape = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
  const reference = `HAR-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 6).toUpperCase()}`
  const submittedAt = new Intl.DateTimeFormat('en-KE', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Nairobi' }).format(new Date())
  const service = data.service || 'General appliance assistance'
  const rows = [
    ['Reference', reference], ['Request type', data.requestType], ['Service required', service],
    ['Customer name', data.name], ['Telephone', data.phone], ['Email address', data.email || 'Not provided'],
    ['Service location', data.location || 'Not provided'], ['Submitted', submittedAt], ['Website page', data.source],
  ]
  const textBody = `${data.requestType.toUpperCase()}\nReference: ${reference}\n\nA customer has submitted a ${data.requestType.toLowerCase()} through the Home Appliances Repair website.\n\n${rows.slice(1).map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nCUSTOMER'S MESSAGE\n${data.message}\n\nNEXT STEP\nPlease contact ${data.name} on ${data.phone} to acknowledge this request and arrange the next step.\n\nThis message was generated securely by homeappliancesrepair.co.ke.`
  const contactButtons = `<a href="tel:${escape(data.phone)}" style="display:inline-block;background:#ffd000;color:#20252e;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:4px;margin:0 8px 8px 0">Call ${escape(data.phone)}</a>${data.email ? `<a href="mailto:${escape(data.email)}" style="display:inline-block;background:#292e38;color:#fff;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:4px">Reply by email</a>` : ''}`
  const htmlBody = `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,sans-serif;color:#20252e"><div style="display:none;max-height:0;overflow:hidden">${escape(data.requestType)} from ${escape(data.name)} for ${escape(service)}</div><div style="max-width:720px;margin:24px auto;background:#fff;border:1px solid #e2e4e8"><div style="background:#292e38;padding:26px 30px"><div style="color:#ffd000;font-size:12px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase">Home Appliances Repair Nairobi</div><h1 style="color:#fff;font-size:25px;line-height:1.3;margin:8px 0 0">${escape(data.requestType)}</h1></div><div style="padding:28px 30px"><p style="font-size:16px;line-height:1.7;margin-top:0">A customer has submitted a <strong>${escape(data.requestType.toLowerCase())}</strong> through the website. Please review the details below and respond promptly.</p><div style="background:#fff9dc;border-left:4px solid #ffd000;padding:14px 18px;margin:22px 0"><strong>Reference:</strong> ${reference}<br><strong>Required service:</strong> ${escape(service)}</div><table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 25px">${rows.slice(3).map(([label, value]) => `<tr><th style="text-align:left;vertical-align:top;padding:11px 10px;border-bottom:1px solid #eceef1;width:145px;color:#59616d;font-size:13px">${escape(label)}</th><td style="padding:11px 10px;border-bottom:1px solid #eceef1;font-size:14px">${escape(value)}</td></tr>`).join('')}</table><div style="background:#f6f7f9;padding:20px 22px;margin:24px 0"><h2 style="font-size:16px;margin:0 0 10px">Customer's message</h2><p style="white-space:pre-wrap;line-height:1.7;margin:0;color:#454c56">${escape(data.message)}</p></div><h2 style="font-size:16px;margin:25px 0 8px">Recommended next step</h2><p style="line-height:1.6;color:#59616d">Contact <strong>${escape(data.name)}</strong> to acknowledge the request, confirm the appliance details, and arrange a suitable appointment.</p><div style="margin-top:20px">${contactButtons}</div></div><div style="background:#f0f1f3;color:#717781;font-size:12px;line-height:1.6;padding:18px 30px">Sent securely from homeappliancesrepair.co.ke · ${escape(reference)}<br>Primary recipient: enquiries@homeappliancesrepair.co.ke · CC: info@homeappliancesrepair.co.ke</div></div></body></html>`
  const payload = {
    sender: 'Home Appliances Repair <enquiries@homeappliancesrepair.co.ke>',
    to: ['enquiries@homeappliancesrepair.co.ke'],
    cc: ['info@homeappliancesrepair.co.ke'],
    subject: `[${data.requestType}] ${service} — ${data.name}${data.location ? `, ${data.location}` : ''} (${reference})`,
    text_body: textBody,
    html_body: htmlBody,
    custom_headers: data.email ? [{ header: 'Reply-To', value: data.email }] : [],
  }
  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Smtp2go-Api-Key': apiKey },
    body: JSON.stringify(payload),
  })
  const result = await response.json()
  if (!response.ok || result?.data?.error || !result?.data?.succeeded) {
    const detail = result?.data?.error || result?.data?.failures?.[0] || result?.error || `HTTP ${response.status}`
    throw new Error(`Email delivery failed: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
  }
  return { messageId: result.data.email_id, succeeded: result.data.succeeded }
}
