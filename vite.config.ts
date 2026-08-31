import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { sendEnquiry } from './server/email-service.mjs'

function enquiryApi(apiKey: string): Plugin {
  const requests = new Map<string, number[]>()
  const middleware = () => async (request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse, next: () => void) => {
    if (request.url !== '/api/enquiry' || request.method !== 'POST') return next()
    response.setHeader('Content-Type', 'application/json')
    const address = request.socket.remoteAddress || 'unknown'
    const now = Date.now()
    const recent = (requests.get(address) || []).filter((time) => now - time < 10 * 60_000)
    if (recent.length >= 5) {
      response.statusCode = 429
      return response.end(JSON.stringify({ error: 'Too many requests. Please try again in a few minutes.' }))
    }
    requests.set(address, [...recent, now])
    try {
      let body = ''
      for await (const chunk of request) {
        body += chunk
        if (body.length > 20_000) throw new Error('Request is too large.')
      }
      const result = await sendEnquiry(JSON.parse(body), apiKey)
      response.statusCode = 200
      response.end(JSON.stringify({ ok: true, id: result.messageId }))
    } catch (error) {
      response.statusCode = 400
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to send enquiry.' }))
    }
  }
  return {
    name: 'enquiry-api',
    configureServer(server) { server.middlewares.use(middleware()) },
    configurePreviewServer(server) { server.middlewares.use(middleware()) },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return { plugins: [react(), enquiryApi(env.SMTP2GO_API_KEY)] }
})
