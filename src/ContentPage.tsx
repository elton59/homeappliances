import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Clock3, Mail, Phone, ShieldCheck, Wrench } from 'lucide-react'
import { SiteShell } from './SiteShell'
import assets from './assets.json'
import './ContentPage.css'
import { EnquiryForm } from './EnquiryForm'

type SitePage = { path: string; sourceUrl: string; title: string; description: string; html: string }

const normalizePath = (path: string) => path === '/' ? path : `${path.replace(/\/+$/, '')}/`

export function ContentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [pages, setPages] = useState<SitePage[] | null>(null)
  const path = normalizePath(location.pathname)
  const page = pages?.find((item) => normalizePath(item.path) === path)

  useEffect(() => {
    fetch('/site-pages.json').then((response) => response.json()).then(setPages)
  }, [])

  useEffect(() => {
    if (!page) return
    document.title = `${cleanTitle(page.title)} | Home Appliances Repair Nairobi`
    window.scrollTo(0, 0)
  }, [page])

  if (!pages) return <SiteShell><main className="page-loading"><span>Loading page…</span></main></SiteShell>
  if (!page) return <Navigate to="/" replace />
  const title = cleanTitle(page.title)
  const kind = getPageKind(path)
  const heroImage = getHeroImage(path)

  const followInternalLink = (event: React.MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest('a')
    if (!anchor) return
    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return
    try {
      const destination = new URL(href, window.location.origin)
      if (destination.origin === window.location.origin) {
        event.preventDefault()
        navigate(`${destination.pathname}${destination.search}${destination.hash}`)
      }
    } catch { /* leave malformed legacy links untouched */ }
  }

  return <SiteShell>
    <main className={`legacy-page ${kind}-page`}>
      <section className="page-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(18,23,31,.94), rgba(18,23,31,.48)), url(${heroImage})` }}>
        <div className="container"><span>Home Appliances Repair Nairobi</span><h1>{title}</h1><div className="breadcrumbs"><a href="/">Home</a><ChevronRight size={14} /><span>{title}</span></div></div>
      </section>
      {kind !== 'archive' && <section className="page-benefits"><div className="container">
        <div><Clock3 /><span><strong>Same-day support</strong>Fast Nairobi response</span></div>
        <div><Wrench /><span><strong>Skilled technicians</strong>All leading brands</span></div>
        <div><ShieldCheck /><span><strong>Trusted service</strong>Quality workmanship</span></div>
      </div></section>}
      <div className="container modern-content-grid">
          <article className="modern-article">
            <div className="modern-page-intro">
              <span>{kind === 'service' ? 'Professional appliance care' : 'Home Appliances Repair Nairobi'}</span>
              <h2>{kind === 'service' ? `Reliable ${title}` : title}</h2>
              <p>{kind === 'service' ? `Get dependable ${title.toLowerCase()} from experienced technicians serving homes and businesses throughout Nairobi.` : 'Practical information and professional support from Nairobi’s trusted home appliance repair team.'}</p>
              <div className="intro-features"><div><CheckCircle2 /><strong>Fast response</strong></div><div><CheckCircle2 /><strong>Expert diagnosis</strong></div><div><CheckCircle2 /><strong>Quality parts</strong></div><div><CheckCircle2 /><strong>Fair pricing</strong></div></div>
              <h3>Service details</h3>
            </div>
            <div className="legacy-content" onClick={followInternalLink} dangerouslySetInnerHTML={{ __html: page.html }} />
          </article>
        {kind !== 'archive' && <aside className="service-sidebar">
          <div className="sidebar-card service-menu"><span className="sidebar-kicker">Our services</span><h2>How can we help?</h2>
            <a href="/services/front-loader-laundry-washing-machine/">Washing machine repair <ChevronRight /></a>
            <a href="/services/fridge-repair-in-nairobi/">Fridge & freezer repair <ChevronRight /></a>
            <a href="/services/oven-repair-in-nairobi/">Oven & cooker repair <ChevronRight /></a>
            <a href="/services/dishwasher-repair-in-nairobi/">Dishwasher repair <ChevronRight /></a>
            <a href="/services/air-conditioner-repair-in-nairobi/">Air conditioner repair <ChevronRight /></a>
            <a href="/services/home-plumbing-and-installation-services-in-nairobi/">Home plumbing <ChevronRight /></a>
          </div>
          <div className="sidebar-card emergency-card"><div className="sidebar-phone"><Phone /></div><span>24/7 customer care</span><h2>Need urgent help?</h2><p>Speak directly with an appliance repair technician in Nairobi.</p><a href="tel:0790076362">0790 076 362</a><a className="sidebar-email" href="mailto:enquiries@homeappliancesrepair.co.ke"><Mail /> Email our team</a></div>
          <div className="sidebar-card promise-card"><h3>Why choose us?</h3><span><CheckCircle2 /> Transparent pricing</span><span><CheckCircle2 /> Experienced specialists</span><span><CheckCircle2 /> Convenient scheduling</span><span><CheckCircle2 /> Service across Nairobi</span></div>
        </aside>}
      </div>
      <section className="page-enquiry" id="enquiry"><div className="container page-enquiry-grid"><div><span className="kicker">Request an appointment</span><h2>Tell us how we can help</h2><p>Complete the form and the request will be emailed directly to our repair team. A technician will contact you to confirm the appointment.</p><div className="enquiry-contact"><a href="tel:0790076362"><Phone /> 0790 076 362</a><a href="mailto:enquiries@homeappliancesrepair.co.ke"><Mail /> enquiries@homeappliancesrepair.co.ke</a></div></div><EnquiryForm source={`${title} — ${path}`} /></div></section>
      <section className="content-cta"><div className="container"><div><span>Need a reliable technician?</span><h2>Get your appliance working again today</h2></div><a className="button dark" href="tel:0790076362"><Phone size={18} /> Call 0790076362</a></div></section>
    </main>
  </SiteShell>
}

function cleanTitle(title: string) {
  return title.split(/\s+-\s+Home Appliances Repair/i)[0].trim()
}

function getPageKind(path: string) {
  if (path.startsWith('/services/')) return 'service'
  if (path.startsWith('/projects/')) return 'project'
  if (/^\/\d{4}\//.test(path)) return 'article'
  if (path.startsWith('/faqs/')) return 'faq'
  if (path.startsWith('/testimonials/') || path.startsWith('/teams/')) return 'profile'
  return 'archive'
}

function getHeroImage(path: string) {
  if (/fridge|freezer|refrigerator/.test(path)) return assets.heroFridge
  if (/washing|laundry|dryer/.test(path)) return assets.heroWashing
  if (/treadmill|lawn/.test(path)) return assets.heroTreadmill
  return assets.servicesBackground
}
