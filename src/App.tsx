import { useEffect, useState } from 'react'
import {
  AirVent, ArrowLeft, ArrowRight, CheckCircle2, Clock3,
  Mail, MapPin, Menu, Phone, Refrigerator, Star,
  WashingMachine, Wrench, X,
} from 'lucide-react'
import assets from './assets.json'
import { EnquiryForm } from './EnquiryForm'
import './App.css'

const phone = '0790076362'
const slides = [
  { image: assets.heroWashing, eyebrow: 'Washing Machines in Nairobi', title: 'Washing Machine Repair in Nairobi' },
  { image: assets.heroFridge, eyebrow: 'Fast, reliable & affordable', title: 'Fridge & Freezer Repair Experts' },
  { image: assets.heroTreadmill, eyebrow: 'Professional home service', title: 'Treadmill Repair in Nairobi' },
]
const services = [
  { icon: WashingMachine, title: 'Washing Machine Repair', href: '/services/front-loader-laundry-washing-machine/', text: 'Expert diagnosis and same-day repairs for top loaders, front loaders and washer dryers.' },
  { icon: Refrigerator, title: 'Fridge & Freezer Repair', href: '/services/fridge-repair-in-nairobi/', text: 'We restore cooling, fix leaks, compressors, thermostats and electrical faults.' },
  { icon: Wrench, title: 'Cooker & Oven Repair', href: '/services/oven-repair-in-nairobi/', text: 'Reliable repairs for electric and gas cookers, ovens, hobs and microwaves.' },
  { icon: AirVent, title: 'Air Conditioner Service', href: '/services/air-conditioner-repair-in-nairobi/', text: 'Installation, repair and maintenance for domestic and commercial AC units.' },
]
const news = [
  { image: assets.newsWashing, href: '/2019/09/20/installation-maintenance-guide-2/', title: 'What causes a washing machine spin belt to slip off?', text: 'A belt will fall off if worn out. Learn the warning signs and the right solution.' },
  { image: assets.newsRepair, href: '/2019/09/20/prepare-to-enjoy-this-vacation-2/', title: 'Common washing machine problems and solutions', text: 'A practical guide to filling, draining, spinning and unusual vibration issues.' },
  { image: assets.newsTools, href: '/2019/09/20/alternative-to-an-air-conditioner/', title: 'Common washing machine error codes', text: 'Understand the errors on your display and know when to call an expert.' },
]

function App() {
  const [slide, setSlide] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 6000)
    return () => window.clearInterval(timer)
  }, [])
  const moveSlide = (direction: number) => setSlide((value) => (value + direction + slides.length) % slides.length)
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
        <a className="brand" href="#home"><img src={assets.logo} alt="Home Appliances Repair" /></a>
        <nav className={menuOpen ? 'open' : ''} aria-label="Main navigation">
          {['Home', 'Services', 'About', 'Reviews', 'Contact'].map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>)}
          <a className="nav-call" href={`tel:${phone}`}><Phone size={17} /> Call now</a>
        </nav>
        <button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div></div>
    </header>

    <main>
      <section className="hero" id="home" style={{ backgroundImage: `url(${slides[slide].image})` }}>
        <div className="hero-overlay" />
        <div className="container hero-content" key={slide}>
          <span className="eyebrow">{slides[slide].eyebrow}</span><h1>{slides[slide].title}</h1>
          <p>Fast, professional appliance repairs at your doorstep. Available across Nairobi and surrounding areas.</p>
          <div className="hero-actions"><a className="button primary" href="#services">Explore services</a><a className="button ghost" href={`tel:${phone}`}><Phone size={18} /> {phone}</a></div>
        </div>
        <button className="slider-control previous" onClick={() => moveSlide(-1)} aria-label="Previous slide"><ArrowLeft /></button>
        <button className="slider-control next" onClick={() => moveSlide(1)} aria-label="Next slide"><ArrowRight /></button>
        <div className="slider-dots">{slides.map((item, index) => <button key={item.title} className={index === slide ? 'active' : ''} onClick={() => setSlide(index)} aria-label={`View slide ${index + 1}`} />)}</div>
      </section>

      <section className="trust-strip"><div className="container trust-grid">
        <div><Clock3 /><span><strong>24/7 Service</strong>Emergency response</span></div>
        <div><Wrench /><span><strong>Expert Technicians</strong>Skilled & experienced</span></div>
        <div><CheckCircle2 /><span><strong>Quality Guaranteed</strong>Reliable workmanship</span></div>
      </div></section>

      <section className="section services" id="services"><div className="container">
        <div className="section-heading centered"><span className="kicker">What we do</span><h2>Our Repair Services</h2><p>Complete care for the appliances that keep your home running.</p></div>
        <div className="service-grid">{services.map(({ icon: Icon, title, text, href }) => <article className="service-card" key={title}>
          <div className="service-icon"><Icon /></div><h3>{title}</h3><p>{text}</p><a href={href}>Read more <ArrowRight size={16} /></a>
        </article>)}</div>
      </div></section>

      <section className="section about" id="about"><div className="container about-grid">
        <div className="about-image"><img src={assets.technician} alt="Home appliance repair technician" /><div className="experience"><strong>10+</strong><span>Years of<br />experience</span></div></div>
        <div className="about-copy"><span className="kicker">About our company</span><h2>Your Trusted Home Appliance Repair Partner</h2>
          <p>We offer appliance repair, electrical installation and home plumbing solutions. Our technicians install, repair and maintain washing machines, tumble dryers, cookers, ovens, refrigerators, freezers and air conditioners.</p>
          <div className="checks"><span><CheckCircle2 /> Same-day repair options</span><span><CheckCircle2 /> All major brands supported</span><span><CheckCircle2 /> Transparent, fair pricing</span><span><CheckCircle2 /> Service across Nairobi</span></div>
          <div className="call-box"><div><Phone /></div><span>Need emergency service?<a href={`tel:${phone}`}>{phone}</a></span></div>
        </div>
      </div></section>

      <section className="cta"><div className="container cta-inner"><div><span>Special offer</span><h2>We Repair All Makes & Brands</h2><p>Call our engineer today for a quick quote and professional assistance.</p></div><a className="button dark" href={`tel:${phone}`}><Phone size={18} /> Call {phone}</a></div></section>

      <section className="section appointment" id="contact"><div className="container appointment-grid">
        <div className="appointment-intro"><span className="kicker light">Book a technician</span><h2>Make an Appointment</h2><p>Share a few details and our expert team will contact you to arrange convenient, professional help.</p><ul><li><CheckCircle2 /> Quick response</li><li><CheckCircle2 /> Convenient scheduling</li><li><CheckCircle2 /> No hidden charges</li></ul></div>
        <EnquiryForm source="Homepage appointment form" />
      </div></section>

      <section className="section reviews" id="reviews"><div className="container">
        <div className="section-heading centered"><span className="kicker">Testimonials</span><h2>What Our Customers Say</h2></div>
        <div className="review-grid">{['Nelson Nyachae', 'Cyprian Katana', 'Timon Kipkoech'].map((name) => <article className="review-card" key={name}>
          <div className="stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} fill="currentColor" />)}</div><p>“Home Appliance Repair helped me out when I was in a pinch. The technician was prompt, professional and got the appliance working again.”</p><div className="reviewer"><img src={assets.avatar} alt="" /><span><strong>{name}</strong>Verified customer</span></div>
        </article>)}</div>
      </div></section>

      <section className="section news"><div className="container"><div className="section-heading centered"><span className="kicker">Helpful advice</span><h2>Latest News & Tips</h2></div><div className="news-grid">
        {news.map((item) => <article className="news-card" key={item.title}><img src={item.image} alt="" /><div><span>Appliance care · 5 min read</span><h3>{item.title}</h3><p>{item.text}</p><a href={item.href}>Read article <ArrowRight size={16} /></a></div></article>)}
      </div></div></section>
    </main>

    <footer><div className="container footer-grid">
      <div><img className="footer-logo" src={assets.logo} alt="Home Appliances Repair" /><p>Professional home appliance repair, plumbing and electrical services in Nairobi, Kenya.</p></div>
      <div><h3>Quick links</h3><a href="#services">Our services</a><a href="#about">About us</a><a href="#reviews">Customer reviews</a><a href="#contact">Book a repair</a></div>
      <div><h3>Contact us</h3><a href={`tel:${phone}`}><Phone size={16} /> {phone}</a><a href="mailto:enquiries@homeappliancesrepair.co.ke"><Mail size={16} /> enquiries@homeappliancesrepair.co.ke</a><span><MapPin size={16} /> Nairobi, Kenya</span></div>
    </div><div className="copyright"><div className="container">© {new Date().getFullYear()} Home Appliances Repair. All rights reserved.</div></div></footer>
    <a className="whatsapp" href={`https://wa.me/254${phone.slice(1)}`} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><img src={assets.whatsappIcon} alt="" /><b>Chat with us</b></a>
  </>
}
export default App
