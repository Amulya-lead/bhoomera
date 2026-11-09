import { GoogleEnquiryPage, enquiryLink } from './googleWorkflow'
import { api, SellPage, OwnerConsole, ListingDetails, type Property } from './PropertyWorkflow'
import About from './About'
import HeroVideo from './HeroVideo'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Bath, BedDouble, Building2, Heart, MapPin, Menu, Moon, Search, ShieldCheck, Square, Sun, X } from 'lucide-react'
import { motion } from 'framer-motion'
const categories = ['Residential plots', 'Land opportunities', 'Apartments', 'Independent houses', 'Villas', 'Commercial']

const locations = [
  { name: 'Yacharam', note: 'Open plots & land opportunities', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85' },
  { name: 'Kandukur', note: 'Location & connectivity updates', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85' },
  { name: 'Bharat Future City region', note: 'Development & surrounding areas', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85' }
]
const enquiry = '#enquire'
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
function BrandLogo() { return <a className="logo brand-logo" href="#top" aria-label="Bhoomera Realty home"><span className="brand-symbol"><img src="/images/bhoomera-realty-logo.png" alt=""/></span><span className="brand-wordmark"><b>BHOOMERA</b><small>REALTY</small></span></a> }

function Header({onNavigate}: {onNavigate:(section:string)=>void}) {
 const [open,setOpen]=useState(false)
 useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};window.addEventListener('keydown',close);const resize=()=>{if(window.innerWidth>900)setOpen(false)};window.addEventListener('resize',resize);return()=>{window.removeEventListener('keydown',close);window.removeEventListener('resize',resize)}},[open])
 const [light,setLight]=useState(()=>localStorage.getItem('BHOOMERA-mode')!=='dark')
 useEffect(()=>{document.documentElement.dataset.mode=light?'light':'dark';localStorage.setItem('BHOOMERA-mode',light?'light':'dark')},[light])
 return <header className="header scrolled"><BrandLogo/><nav id="main-navigation" aria-label="Main navigation" className={open?'open':''}>{[['top','Home'],['buy','Buy'],['rent','Rent'],['sell','Sell'],['learn','Learn'],['about','About']].map(([section,label])=><button key={section} onClick={()=>{setOpen(false);onNavigate(section)}}>{label}</button>)}</nav><a className="header-contact" href={enquiry}>Let’s talk <ArrowRight size={15}/></a><button className="theme-toggle" onClick={()=>setLight(!light)} aria-label={light?'Switch to dark theme':'Switch to light theme'}>{light?<Moon/>:<Sun/>}</button><button className="menu" onClick={()=>setOpen(!open)} aria-label={open?'Close menu':'Open menu'} aria-controls="main-navigation" aria-expanded={open}>{open?<X/>:<Menu/>}</button></header>
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => location.hash.replace('#',''))
  const [purpose, setPurpose] = useState<'Buy' | 'Rent' | 'Sell'>('Buy'); const [query, setQuery] = useState(''); const [type, setType] = useState('Any property'); const [minPrice, setMinPrice] = useState(''); const [maxPrice, setMaxPrice] = useState('')
  const [listingError, setListingError] = useState('');
  const listingRequest = useRef(0)
  const [properties, setProperties] = useState<Property[]>([]); const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); const [compare, setCompare] = useState<Property[]>([])
  const [page, setPage] = useState<'home' | 'buy' | 'rent' | 'explore' | 'sell' | 'admin'>('home')
  useEffect(() => { const syncPage = () => { const route=location.hash.replace('#',''); setCurrentRoute(route); if(route==='buy'||route==='rent'){localStorage.setItem('BHOOMERA-intent',route)} setPage(route === 'buy' || route === 'rent' || route === 'explore' || route === 'sell' || route === 'admin' ? route as typeof page : 'home'); const routeTheme=route==='rent'||route.startsWith('property-')&&localStorage.getItem('BHOOMERA-intent')==='rent'?'royal-rent':route==='sell'?'lavender-sell':route==='explore'?'lavender-explore':'mocha-buy'; document.documentElement.dataset.accent=routeTheme; if (['','top','buy','rent','sell','explore','admin'].includes(route) || route.startsWith('property-') || route.startsWith('enquire')) window.scrollTo({top:0,behavior:'smooth'}); else window.requestAnimationFrame(()=>document.getElementById(route)?.scrollIntoView({behavior:'smooth'})) }; syncPage(); window.addEventListener('hashchange', syncPage); return () => window.removeEventListener('hashchange', syncPage) }, [])

  useEffect(() => { loadProperties() }, [])
  useEffect(()=>{const refresh=()=>{if(document.visibilityState==='visible')void loadProperties()};window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh)},[purpose,query,type,minPrice,maxPrice])
  useEffect(() => { if (page === 'buy') { setPurpose('Buy'); void loadProperties('Buy') } if (page === 'rent') { setPurpose('Rent'); void loadProperties('Rent') } }, [page])
  async function loadProperties(selectedPurpose?: 'Buy' | 'Rent' | 'Sell', filters?: { query?: string; type?: string; min?: string; max?: string }) {
    const request = ++listingRequest.current
    const listingPurpose = selectedPurpose || purpose
    const locationQuery = filters?.query ?? query
    const selectedType = filters?.type ?? type
    const minimum = filters?.min ?? minPrice
    const maximum = filters?.max ?? maxPrice
    setLoading(true)
    setListingError('')
    try {
      const params=new URLSearchParams({purpose:listingPurpose==='Rent'?'rent':'sale'})
      if(locationQuery.trim())params.set('q',locationQuery.trim())
      if(selectedType!=='Any property')params.set('type',selectedType)
      if(minimum)params.set('min',minimum);if(maximum)params.set('max',maximum)
      const data=await api<Property[]>('/properties?'+params)
      if(request!==listingRequest.current)return
      setProperties(data.map(p=>({...p,image:p.images?.[0],purpose:p.purpose==='rent'?'For rent':'For sale'})))
    } catch(error) {if(request!==listingRequest.current)return;setProperties([]);setListingError((error as Error).message)}
    setLoading(false)
  }

  if (currentRoute.startsWith('enquire')) return <><Header onNavigate={navigate}/><GoogleEnquiryPage/><Footer/></>
  if (page === 'admin') return <OwnerConsole />
  if (currentRoute.startsWith('property-')) return <><Header onNavigate={navigate}/><ListingDetails id={location.hash.replace('#property-','')}/><Footer/></>
  function navigate(section:string) { if (section==='top') location.hash=''; else if (section==='buy'||section==='rent'||section==='explore'||section==='sell') location.hash=section; else { location.hash=''; window.setTimeout(() => document.getElementById(section)?.scrollIntoView({behavior:'smooth'}), 80) } }
  function toggleCompare(property: Property) { setCompare(current => current.some(p => p.id === property.id) ? current.filter(p => p.id !== property.id) : current.length < 3 ? [...current, property] : current) }

  if (page === 'buy' || page === 'rent' || page === 'explore') return <><Header onNavigate={navigate} /><DiscoveryPage error={listingError} page={page} properties={properties} loading={loading} viewMode={viewMode} setViewMode={setViewMode} toggleCompare={toggleCompare} compare={compare}/><Footer /></>
  if (page === 'sell') return <><Header onNavigate={navigate}/><SellPage/><Footer/></>

  return <>
    <Header onNavigate={navigate} />
    <div className={`home-page theme-${purpose.toLowerCase()}`}><main id="top">
      <section className="hero"><HeroVideo/><div className="hero-shade"/><span className="hero-edition">BHARAT FUTURE CITY / HYDERABAD</span><motion.div className="hero-copy" initial={{opacity:0,y:22}} animate={{opacity:1,y:0}}><div className="eyebrow">BHARAT FUTURE CITY, HYDERABAD</div><h1>Your next property.<br/><em>A clearer decision.</em></h1><p>Open plots, land opportunities and homes.<br/>Simple information to help you take the next step.</p><div className="hero-actions"><a href="#properties">Explore properties <ArrowRight size={17}/></a><a href={enquiry}>Talk to us</a></div></motion.div>
        <div className="hero-note"><span>ABOUT THE VIDEO</span><p>Bharat Future City,<br/>Hyderabad.</p><a href="#about">Discover our approach <ArrowRight size={16}/></a></div>
        <motion.div className="search-box" initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{delay:.15}}><div className="purpose-toggle"><button className={purpose==='Buy'?'active':''} onClick={()=>setPurpose('Buy')}>Buy</button><button className={purpose==='Rent'?'active':''} onClick={()=>setPurpose('Rent')}>Rent</button><button className={purpose==='Sell'?'active':''} onClick={()=>{setPurpose('Sell');location.hash='sell'}}>Sell</button></div><div className="search-fields"><label><span>LOCATION</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try Yacharam or Kandukur"/></label><label><span>PROPERTY TYPE</span><select value={type} onChange={e=>setType(e.target.value)}><option>Any property</option><option>Plot</option><option>Land</option><option>Villa</option><option>House</option><option>Apartment</option><option>Commercial</option></select></label><label className="price-field"><span>MINIMUM PRICE</span><input inputMode="numeric" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="₹ 0"/></label><label className="price-field"><span>MAXIMUM PRICE</span><input inputMode="numeric" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="₹ Any"/></label><button className="search-submit" onClick={() => loadProperties(purpose)}><Search/><span>Search</span></button></div></motion.div>
      </section>
      <section className="collection" id="properties"><div className="section-heading"><div><span className="kicker">01 — PROPERTY DISCOVERY</span><h2>Plots, land & homes</h2></div><div className="result-tools"><button className={viewMode==='grid'?'active':''} onClick={()=>setViewMode('grid')}>Grid</button><button className={viewMode==='list'?'active':''} onClick={()=>setViewMode('list')}>List</button></div></div>
        {loading ? <Loading /> : properties.length ? <div className={`property-grid ${viewMode}`} >{properties.map((p,i)=><PropertyCard key={p.id} property={p} index={i} compared={compare.some(x=>x.id===p.id)} onCompare={()=>toggleCompare(p)}/>)}</div> : <div className="empty-state"><Building2/><h3>Let’s find the right property.</h3><p>{listingError || (query || minPrice || maxPrice || type !== 'Any property' ? 'No listings match these filters. Try another search or tell us what you need.' : 'Contact us for current availability, prices and site visits in Hyderabad and surrounding areas.')}</p><a className="inline-contact" href={enquiry}>Ask about available properties <ArrowRight size={16}/></a><button onClick={()=>{setQuery('');setMinPrice('');setMaxPrice('');setType('Any property');void loadProperties(purpose, {query:'',type:'Any property',min:'',max:''})}}>Clear filters</button></div>}
        {compare.length > 1 && <CompareBar properties={compare} />}
      </section>
      <section className="learning-section" id="learn"><div className="learning-intro"><span className="kicker">02 — REAL ESTATE, EXPLAINED</span><h2 lang="te">రియల్ ఎస్టేట్ విషయాలు<br/><em>సింపుల్‌గా</em></h2><p>With Bhoomera Realty. Understand the details before you make a property decision.</p></div><div className="learning-cards"><article><span>01 / DOCUMENTS</span><ShieldCheck/><h3>Approvals & documents</h3><p>Understand DTCP and HMDA layout approvals, title documents and the checks to discuss with a legal professional.</p></article><article><span>02 / LOCATION</span><MapPin/><h3>Know the location</h3><p>Look at road access, connectivity, nearby facilities and development progress beyond the brochure.</p></article><article><span>03 / BUDGET</span><Building2/><h3>See the full picture</h3><p>Consider the property price, registration costs and other charges. Ask lenders about your loan eligibility.</p></article></div></section>
      <section className="locations"><div className="section-heading"><div><span className="kicker">03 — OUR AREAS OF FOCUS</span><h2>A closer look at Hyderabad.</h2></div><p>Local information. Useful updates.</p></div><div>{locations.map((l,i)=><a key={l.name} href={enquiryLink(l.name)} target="_blank" rel="noreferrer" className="area-card"><span className="area-index">0{i+1}</span><MapPin/><h3>{l.name}</h3><p>{l.note}</p><span className="area-link">Ask about this area <ArrowRight size={16}/></span></a>)}</div><p className="area-note">Also covering Hayathnagar and surrounding locations. Ask us about current availability and location details.</p></section>
      <section className="categories" id="explore"><span className="kicker">04 — YOUR PROPERTY, YOUR PLANS</span><h2>What are you<br/><em>looking for?</em></h2><div className="category-grid">{categories.map((name,i)=><button key={name} onClick={()=>{const nextType=name==='Apartments'?'Apartment':name==='Independent houses'?'House':name==='Villas'?'Villa':name==='Residential plots'?'Plot':name==='Land opportunities'?'Land':'Commercial';setType(nextType);void loadProperties(purpose,{type:nextType});document.getElementById('properties')?.scrollIntoView()}}><span>0{i+1}</span><strong>{name}</strong><ArrowRight/></button>)}</div></section>
      <About />
      <section className="sell" id="sell"><div><span className="kicker">HAVE A PROPERTY TO SELL?</span><h2>Let’s talk about<br/><em>your property.</em></h2></div><p>Share the location and property details. We’ll discuss the next steps with you.</p><a href="#sell" target="_blank" rel="noreferrer">Discuss your property <ArrowRight/></a></section>
      <MortgageCalculator />
      <section className="contact-section" id="contact"><div><span className="kicker">LET’S START WITH A CONVERSATION</span><h2>Tell us what<br/><em>you’re looking for.</em></h2><p>Property details, location information or a site visit.<br/>We’re here to help you understand your options.</p></div><div className="contact-actions"><a href="tel:+919849558210">98495 58210 <ArrowRight/></a><a href={enquiry}>Send an enquiry <ArrowRight/></a><span>Hyderabad &amp; surrounding areas</span></div></section>
    </main></div><Footer />


  </>
}

function DiscoveryPage({error,page,properties,loading,viewMode,setViewMode,toggleCompare,compare}:{error:string;page:string;properties:Property[];loading:boolean;viewMode:'grid'|'list';setViewMode:(v:'grid'|'list')=>void;toggleCompare:(p:Property)=>void;compare:Property[]}){const title=page==='rent'?'Homes for rent':page==='explore'?'Explore properties':'Plots, land & homes for sale';return <div className={`discovery-theme theme-${page}`}><main className="discovery-page"><section className="discovery-heading"><div><span className="kicker">BHOOMERA COLLECTION</span><h1>{title}</h1><p>Explore published listings. Contact us to confirm availability, documents and complete pricing.</p></div><div className="result-tools"><button className={viewMode==='grid'?'active':''} onClick={()=>setViewMode('grid')}>Grid</button><button className={viewMode==='list'?'active':''} onClick={()=>setViewMode('list')}>List</button></div></section><section>{loading?<Loading/>:properties.length?<div className={`property-grid ${viewMode}`}>{properties.map((p,i)=><PropertyCard key={p.id} property={p} index={i} compared={compare.some(x=>x.id===p.id)} onCompare={()=>toggleCompare(p)}/>)}</div>:<div className="empty-state"><Building2/><h3>{error?'Unable to load properties':'New possibilities, coming soon.'}</h3><p role={error?'alert':undefined}>{error||'Contact Bhoomera Realty for current options around Hyderabad.'}</p><a className="inline-contact" href={enquiry}>Ask about properties <ArrowRight size={16}/></a></div>}</section>{compare.length>1&&<CompareBar properties={compare}/>}</main></div>}

function Loading(){return <div className="loading-grid">{[1,2,3].map(x=><div className="skeleton" key={x}/>)}</div>}

function PropertyCard({property:p,index,compared,onCompare}:{property:Property,index:number,compared:boolean,onCompare:()=>void}){
  const [saved,setSaved]=useState(false)
  function save(){setSaved(!saved)}
  return <motion.article className="property-card" initial={{y:12}} animate={{y:0}} transition={{delay:index*.05}}><div className="property-image" style={{backgroundImage:p.image?`url(${p.image})`:undefined}}><span>{p.purpose}</span>{!p.image&&<div className="no-photo">Photos available on request</div>}<button className={saved?'saved':''} onClick={save} aria-label="Save property"><Heart/></button></div><div className="property-body"><span className="location"><MapPin/> {p.city}{p.locality?' · '+p.locality:''}</span><div className="property-title"><h3>{p.title}</h3><strong>{typeof p.price==='number'?money(p.price):p.price}</strong></div><div className="property-meta">{p.beds>0&&<span><BedDouble/> {p.beds} beds</span>}{p.baths>0&&<span><Bath/> {p.baths} baths</span>}<span><Square/> {p.area} {p.area_unit||'sq ft'}</span></div><div className="card-actions"><button onClick={onCompare}>{compared?'Remove compare':'Compare'}</button><button onClick={()=>{localStorage.setItem('BHOOMERA-intent',p.purpose==='For rent'?'rent':'buy');location.hash=`property-${p.id}`}}>View property</button></div></div></motion.article>
}

function CompareBar({properties}:{properties:Property[]}){return <div className="compare-bar"><div><strong>Property comparison</strong><span>{properties.length} properties selected</span></div><div>{properties.map(p=><b key={p.id}>{p.title}</b>)}</div></div>}

function MortgageCalculator(){const [price,setPrice]=useState(5000000);const [down,setDown]=useState(1000000);const [years,setYears]=useState(20);const [rate,setRate]=useState(8.5);const principal=Math.max(price-down,0);const monthlyRate=rate/1200;const months=years*12;const emi=monthlyRate ? principal*monthlyRate*Math.pow(1+monthlyRate,months)/(Math.pow(1+monthlyRate,months)-1):principal/months;return <section className="calculator"><div><span className="kicker">PLAN YOUR PURCHASE</span><h2>Home loan EMI calculator</h2><p>An indicative estimate. Actual interest rates, eligibility and charges depend on the lender.</p></div><div className="calculator-panel"><label>Property price <strong>{money(price)}</strong><input type="range" min="500000" max="30000000" step="100000" value={price} onChange={e=>{const next=Number(e.target.value);setPrice(next);setDown(current=>Math.min(current,next))}}/></label><label>Down payment <strong>{money(down)}</strong><input type="range" min="0" max={price} step="5000" value={down} onChange={e=>setDown(Number(e.target.value))}/></label><label>Duration <strong>{years} years</strong><input type="range" min="5" max="30" value={years} onChange={e=>setYears(Number(e.target.value))}/></label><label>Interest rate <strong>{rate}%</strong><input type="range" min="1" max="12" step="0.1" value={rate} onChange={e=>setRate(Number(e.target.value))}/></label><output><span>Estimated monthly payment</span><strong>{money(Math.round(emi||0))}</strong></output></div></section>}

function Footer(){return <footer className="brand-footer"><BrandLogo/><p>Clear information. A better property journey.</p><div><a href="#about">About us</a><a href="#learn">Learn</a><a href="#sell">Submit a property</a><a href="/hyderabad-real-estate/">Future City &amp; Hayathnagar Guides</a><a href="tel:+919849558210">98495 58210</a></div><small>© {new Date().getFullYear()} Bhoomera Realty · Hyderabad</small></footer>}
