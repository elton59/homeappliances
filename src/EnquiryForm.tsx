import { useState, type FormEvent } from 'react'
import { CheckCircle2, Send } from 'lucide-react'

type Status = { type: 'idle' | 'sending' | 'success' | 'error'; message: string }

export function EnquiryForm({ source, className = 'appointment-form' }: { source: string; className?: string }) {
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' })

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())
    setStatus({ type: 'sending', message: 'Sending your request…' })
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to send your request.')
      form.reset()
      setStatus({ type: 'success', message: 'Thank you. Your request was sent successfully. Our team will contact you shortly.' })
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Unable to send your request. Please call 0790076362.' })
    }
  }

  return <form className={className} onSubmit={submit}>
    <input className="form-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <div className="form-row">
      <label>Name*<input name="name" required maxLength={120} autoComplete="name" placeholder="Your full name" /></label>
      <label>Phone number*<input name="phone" required maxLength={40} type="tel" autoComplete="tel" placeholder="07XX XXX XXX" /></label>
    </div>
    <div className="form-row">
      <label>Email<input name="email" maxLength={160} type="email" autoComplete="email" placeholder="you@example.com" /></label>
      <label>Location<input name="location" maxLength={160} autoComplete="address-level2" placeholder="Your area in Nairobi" /></label>
    </div>
    <div className="form-row">
      <label>Request type<select name="requestType" defaultValue="Appointment request"><option>Appointment request</option><option>Quotation request</option><option>General enquiry</option></select></label>
      <label>Service<select name="service" defaultValue=""><option value="">General appliance assistance</option><option>Washing Machine Repair</option><option>Fridge & Freezer Repair</option><option>Cooker & Oven Repair</option><option>Dishwasher Repair</option><option>Air Conditioner Service</option><option>Home Plumbing</option><option>Other Appliance</option></select></label>
    </div>
    <label>How can we help?*<textarea name="message" required maxLength={4000} rows={4} placeholder="Tell us about the appliance and the problem" /></label>
    <button className="button primary" type="submit" disabled={status.type === 'sending'}>{status.type === 'sending' ? 'Sending…' : 'Request appointment'} <Send size={17} /></button>
    {status.type !== 'idle' && <div className={`form-status ${status.type}`} role="status">{status.type === 'success' && <CheckCircle2 />}<span>{status.message}</span></div>}
  </form>
}
