import { readFileSync } from 'node:fs'
import * as cheerio from 'cheerio'

const pages = JSON.parse(readFileSync('public/site-pages.json', 'utf8'))
const known = new Set(['/', ...pages.map((page) => normalize(page.path))])
const missing = new Map()
let links = 0
for (const page of pages) {
  const $ = cheerio.load(page.html, null, false)
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href')
    if (!href || /^(#|tel:|mailto:|javascript:)/.test(href)) return
    const destination = new URL(href, 'https://homeappliancesrepair.co.ke')
    if (destination.origin !== 'https://homeappliancesrepair.co.ke' || destination.pathname.startsWith('/wp-')) return
    links++
    const path = normalize(destination.pathname)
    if (!known.has(path)) {
      if (!missing.has(path)) missing.set(path, new Set())
      missing.get(path).add(page.path)
    }
  })
}
console.log(`Audited ${links} internal links across ${pages.length} pages.`)
if (missing.size) {
  for (const [path, sources] of missing) console.log(`Missing ${path} linked from ${[...sources].slice(0, 3).join(', ')}`)
  process.exitCode = 1
} else console.log('All internal backlink targets resolve to recreated routes.')

function normalize(path) { return path === '/' ? path : `${path.replace(/\/+$/, '')}/` }
