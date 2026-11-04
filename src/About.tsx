import { ArrowRight, Heart, MapPin, ShieldCheck } from 'lucide-react'

export default function About() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-portrait">
        <div className="portrait-frame">
          <img src="/images/rambabu-portrait.png" alt="Rambabu of Bhoomera Realty, seated in his office" loading="lazy" width="472" height="834" />
        </div>
        <div className="portrait-caption"><span>THE PERSON BEHIND THE GUIDANCE</span><strong>Rambabu</strong><small>Bhoomera Realty · Hyderabad</small></div>
        <span className="portrait-side-label" aria-hidden="true">LOCAL KNOWLEDGE. PERSONAL ATTENTION.</span>
      </div>
      <div className="about-story">
        <span className="kicker"><i aria-hidden="true"/> A PERSONAL APPROACH TO PROPERTY</span>
        <h2 id="about-title">Good decisions begin<br/>with <em>honest conversations.</em></h2>
        <p className="about-lead">“Giving a customer the right information matters more than simply selling a property.”</p>
        <p>I’m Rambabu. With two years in Hyderabad real estate, I’ve supported more than 30 clients through successful property closures. Bhoomera Realty brings that experience to your property search.</p>
        <p>From open plots and land opportunities to homes, I help you understand locations, connectivity, approvals and the questions to ask before taking the next step.</p>
        <div className="about-track-record" aria-label="Experience"><div><strong>02<span>years</span></strong><p>Hyderabad real estate experience</p></div><div><strong>30<span>+</span></strong><p>Clients supported with property closures</p></div></div>
        <a className="about-contact" href="https://wa.me/919849558210" target="_blank" rel="noreferrer">Have a conversation <span><ArrowRight size={18}/></span></a>
      </div>
      <div className="about-principles"><article><ShieldCheck/><div><h3>Clarity first</h3><p>Property details and document checks, explained simply.</p></div></article><article><MapPin/><div><h3>Rooted in Hyderabad</h3><p>Local focus across Yacharam, Kandukur and surrounding areas.</p></div></article><article><Heart/><div><h3>Personal attention</h3><p>Support shaped around your requirements and budget.</p></div></article></div>
    </section>
  )
}
