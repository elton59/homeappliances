import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import * as cheerio from 'cheerio'
import { v2 as cloudinary } from 'cloudinary'

const ORIGIN = 'https://homeappliancesrepair.co.ke'
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(Boolean).map((line) => {
  const at = line.indexOf('=')
  return [line.slice(0, at), line.slice(at + 1)]
}))
cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true })

const fetchText = async (url) => {
  const response = await fetch(url, { headers: { 'User-Agent': 'HomeAppliancesRecreation/1.0' } })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.text()
}
const locations = (xml) => [...xml.matchAll(/<loc>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/loc>/g)].map((match) => match[1].replaceAll('&amp;', '&'))
const index = await fetchText(`${ORIGIN}/wp-sitemap.xml`)
const sitemapUrls = locations(index)
const includedSitemaps = sitemapUrls
const sitemapResults = await Promise.allSettled(includedSitemaps.map(fetchText))
const pageUrls = [...new Set(sitemapResults.flatMap((result) => result.status === 'fulfilled' ? locations(result.value) : []))]
  .filter((url) => url.startsWith(ORIGIN) && new URL(url).pathname !== '/')
const discoveredUrls = new Set(pageUrls.map((url) => new URL(url).pathname.replace(/\/+$/, '') || '/'))
console.log(`Discovered ${pageUrls.length} content pages in ${includedSitemaps.length} sitemaps`)

const absoluteUrl = (value, base) => {
  try { return new URL(value, base).href } catch { return value }
}
const rawPages = []
let cursor = 0
async function crawlWorker() {
  while (cursor < pageUrls.length) {
    const url = pageUrls[cursor++]
    try {
      const html = await fetchText(url)
      const $ = cheerio.load(html)
      const title = $('h1').first().text().replace(/\s+/g, ' ').trim() || $('title').text().split(' - ')[0].trim()
      const description = $('meta[name="description"]').attr('content') || ''
      const wrapper = $('.page-wrapper').first()
      let content = ''
      if (wrapper.length) {
        const fragments = wrapper.children().filter((_, element) => {
          const node = $(element)
          return !node.is('header,footer,.main-header,.footer_last,.clearfix') && !node.hasClass('main-header')
        }).map((_, element) => $.html(element)).get()
        content = fragments.join('\n')
      }
      if (!content) content = $('article').first().html() || $('main').first().html() || $('.entry-content').first().html() || ''
      const fragment = cheerio.load(`<div id="crawl-root">${content}</div>`, null, false)
      fragment('script,style,iframe,noscript,form,.wptwa-container,.wptwa-flag,#wptwa-show-widget').remove()
      fragment('a[href]').each((_, element) => {
        const href = absoluteUrl(fragment(element).attr('href'), url)
        if (href.startsWith(ORIGIN)) {
          const destination = new URL(href)
          const normalized = destination.pathname.replace(/\/+$/, '') || '/'
          fragment(element).attr('href', destination.pathname + destination.search)
          const isContentLink = normalized !== '/' && !normalized.startsWith('/wp-') && !normalized.endsWith('/feed') && !/\.[a-z0-9]{2,5}$/i.test(normalized)
          if (isContentLink && !destination.search && !discoveredUrls.has(normalized)) {
            discoveredUrls.add(normalized)
            pageUrls.push(`${ORIGIN}${normalized}/`)
          }
        }
      })
      fragment('img').each((_, element) => {
        const node = fragment(element)
        const source = node.attr('data-src') || node.attr('src')
        if (source && !source.startsWith('data:')) node.attr('src', absoluteUrl(source, url)).removeAttr('srcset data-src data-lazy-src')
      })
      rawPages.push({ path: new URL(url).pathname, sourceUrl: url, title, description, html: fragment('#crawl-root').html() || '' })
      console.log(`Crawled ${rawPages.length}/${pageUrls.length}: ${new URL(url).pathname}`)
    } catch (error) { console.warn(`Skipped ${url}: ${error.message}`) }
  }
}
await Promise.all(Array.from({ length: 6 }, crawlWorker))

for (const sourceUrl of pageUrls) {
  const path = new URL(sourceUrl).pathname
  if (path === '/our-projects/' || rawPages.some((page) => page.path === path)) continue
  const title = path.split('/').filter(Boolean).pop()?.replaceAll('-', ' ') || 'Archive'
  rawPages.push({
    path,
    sourceUrl,
    title: title.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    description: 'Home Appliances Repair Nairobi archive.',
    html: `<section><div class="container"><div class="sec-title"><h1>${title}</h1><p>This archive link is retained from the original website. For current appliance repair information, browse our services or contact our Nairobi technicians.</p><a class="btn-one" href="/services/">View services</a></div></div></section>`,
  })
}

if (!rawPages.some((page) => page.path === '/our-projects/')) {
  const projectPages = rawPages.filter((page) => page.path.startsWith('/projects/'))
  rawPages.push({
    path: '/our-projects/',
    sourceUrl: `${ORIGIN}/our-projects/`,
    title: 'Our Projects',
    description: 'Home appliance repair projects, service areas, brands, parts and repairs across Nairobi.',
    html: `<section><div class="container"><div class="sec-title"><h1>Our Projects</h1><p>Explore our repair coverage, appliance brands, replacement parts and completed work across Nairobi.</p></div><div class="row project-archive">${projectPages.map((page) => `<div class="col-md-4"><article class="single-project-item"><h3><a href="${page.path}">${page.title.split(/\s+-\s+Home Appliances Repair/i)[0]}</a></h3><p>Professional home appliance repair and support from our experienced Nairobi technicians.</p><a class="btn-one" href="${page.path}">View details</a></article></div>`).join('')}</div></div></section>`,
  })
}

const imageUrls = [...new Set(rawPages.flatMap((page) => {
  const $ = cheerio.load(page.html, null, false)
  const urls = $('img[src]').map((_, element) => $(element).attr('src')).get()
  for (const match of page.html.matchAll(/url\(["']?(https?:\/\/.*?)["']?\)/g)) urls.push(match[1])
  return urls
}).filter((url) => url?.startsWith('http')))]
console.log(`Uploading ${imageUrls.length} unique content images to Cloudinary`)
const cloudinaryMap = {}
let imageCursor = 0
async function uploadWorker() {
  while (imageCursor < imageUrls.length) {
    const source = imageUrls[imageCursor++]
    const extension = new URL(source).pathname.split('.').pop()?.toLowerCase().slice(0, 5) || 'img'
    const id = createHash('sha1').update(source).digest('hex').slice(0, 16)
    try {
      const result = await cloudinary.uploader.upload(source, { public_id: `${id}-${extension}`, folder: 'home-appliances-repair/crawled', overwrite: false, resource_type: 'image' })
      cloudinaryMap[source] = result.secure_url
      console.log(`Uploaded ${Object.keys(cloudinaryMap).length}/${imageUrls.length} images`)
    } catch (error) { console.warn(`Image skipped: ${source} (${error.message})`) }
  }
}
await Promise.all(Array.from({ length: 5 }, uploadWorker))

const pages = rawPages.map((page) => {
  let html = page.html
  for (const [source, cloudUrl] of Object.entries(cloudinaryMap)) html = html.split(source).join(cloudUrl)
  return { ...page, html }
}).sort((a, b) => a.path.localeCompare(b.path))
writeFileSync('public/site-pages.json', `${JSON.stringify(pages, null, 2)}\n`)
writeFileSync('src/crawled-assets.json', `${JSON.stringify(cloudinaryMap, null, 2)}\n`)
console.log(`Saved ${pages.length} pages and ${Object.keys(cloudinaryMap).length} Cloudinary images`)
