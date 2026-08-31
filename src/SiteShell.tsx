import { useState, type ReactNode } from 'react'
import { Mail, MapPin, Menu, Phone, X } from 'lucide-react'
import assets from './assets.json'

const phone = '0790076362'

export function SiteShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <>
    <header>
      <div className="topbar"><div className="container topbar-inner">
        <div className="contact-row">
          <a href={`tel:${phone}`}><Phone size={17} /> {phone}</a>
          <a href="mailto:mtatumadadi@gmail.com"><Mail size={17} /> mtatumadadi@gmail.com</a>
          <span><MapPin size={17} /> Paybill: 247247 Acc no: {phone}</span>
        </div>
        <div className="social-row" aria-label="Social media"><span>f</span><span>◎</span></div>
      </div></div>
      <div className="nav-wrap"><div className="container nav-inner">
        <a className="brand" href="/"><img src={assets.logo} alt="Home Appliances Repair" /></a>
        <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
          <a href="/">Home</a><a href="/services/">Services</a><a href="/about-us-2/">About</a><a href="/reviews/">Reviews</a><a href="/contact-us/">Contact</a>
          <a className="nav-call" href={`tel:${phone}`}><Phone size={17} /> Call now</a>
        </nav>
        <button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div></div>
    </header>
    {children}
    <footer><div className="container footer-grid">
      <div><img className="footer-logo" src={assets.logo} alt="Home Appliances Repair" /><p>Professional home appliance repair, plumbing and electrical services in Nairobi, Kenya.</p></div>
      <div><h3>Quick links</h3><a href="/services/">Our services</a><a href="/about-us-2/">About us</a><a href="/reviews/">Customer reviews</a><a href="/contact-us/">Book a repair</a></div>
      <div><h3>Contact us</h3><a href={`tel:${phone}`}><Phone size={16} /> {phone}</a><a href="mailto:enquiries@homeappliancesrepair.co.ke"><Mail size={16} /> enquiries@homeappliancesrepair.co.ke</a><span><MapPin size={16} /> Nairobi, Kenya</span></div>
    </div><div className="copyright"><div className="container">© {new Date().getFullYear()} Home Appliances Repair. All rights reserved.</div></div></footer>
    <a className="whatsapp" href={`https://wa.me/254${phone.slice(1)}`} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><img src={assets.whatsappIcon} alt="" /><b>Chat with us</b></a>
  </>
}
