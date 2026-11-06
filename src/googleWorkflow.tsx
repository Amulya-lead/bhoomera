import NativeGoogleForm from './NativeGoogleForm'
import { ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react'
import type { Property } from './PropertyWorkflow'

export const GOOGLE_WORKFLOW = true
export const GOOGLE_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSc8Hks5nApY6_c45JyDbpjX1Dr315_qe4AwP9U3WFCT9SzpZw/viewform'
export const GOOGLE_SHEET = 'https://docs.google.com/spreadsheets/d/1kINCkzOq5q8wZ_pYUCxrzzvoCelkegsyVSlM4xnJh6Y/edit#gid=1324259729'
export const GOOGLE_FEED = 'https://script.google.com/macros/s/AKfycbwwUlKB2sLwQEx5qbImcjRmJCC5XTQJlDRfY3mLUU4gajNjxgImOtJWnXKH0FYXfQ5DtA/exec'

function readFeed(): Promise<Property[]> {
  return new Promise((resolve,reject)=>{
    const callback='bhoomera_'+crypto.randomUUID().replaceAll('-','')
    const callbacks=window as unknown as Record<string,unknown>
    const tag=document.createElement('script')
    const cleanup=()=>{delete callbacks[callback];tag.remove();window.clearTimeout(timeout)}
    const timeout=window.setTimeout(()=>{cleanup();reject(new Error('Property information is taking longer than expected. Please retry or contact us.'))},25000)
    callbacks[callback]=(data:{properties?:Property[];error?:string})=>{
      cleanup()
      if(data.error || !Array.isArray(data.properties)){reject(new Error(data.error||'Unable to load property listings'));return}
      resolve(data.properties.filter(p=>p.status==='approved'))
    }
    tag.onerror=()=>{cleanup();reject(new Error('Unable to connect to the property listings. Please retry.'))}
    tag.src=GOOGLE_FEED+'?callback='+callback
    document.head.appendChild(tag)
  })
}

export async function googleApi(url:string):Promise<unknown> {
  if(!url.startsWith('/properties'))throw new Error('Property management is now in the private Google Sheet. Use the customer enquiry form for site visits.')
  const parsed=new URL(url,'https://bhoomera.local')
  const properties=await readFeed()
  if(parsed.pathname.startsWith('/properties/')){
    const p=properties.find(p=>p.id===decodeURIComponent(parsed.pathname.slice('/properties/'.length)))
    if(!p)throw new Error('This property is no longer available.')
    return p
  }
  const filters=parsed.searchParams
  return properties.filter(p=>{
    const q=(filters.get('q')||'').trim().toLowerCase()
    return (!filters.get('purpose')||p.purpose===filters.get('purpose')) &&
      (!filters.get('type')||p.property_type===filters.get('type')) &&
      (!q||`${p.title} ${p.city} ${p.locality}`.toLowerCase().includes(q)) &&
      (!filters.get('min')||Number(p.price)>=Number(filters.get('min'))) &&
      (!filters.get('max')||Number(p.price)<=Number(filters.get('max')))
  })
}

export function GoogleSellPage(){return <main className="workflow-page google-sell"><div className="workflow-heading"><span className="kicker">SELL WITH BHOOMERA REALTY</span><h1>Your property.<br/><em>Our personal attention.</em></h1><p>Share your property details below. We’ll review the information and contact you before publishing your listing.</p></div><NativeGoogleForm kind="sell"/></main>}

export function GoogleOwnerPage(){return <main className="workflow-page google-owner"><a className="listing-back" href="#top">← Back to website</a><div className="workflow-heading"><span className="kicker">BHOOMERA REALTY / OWNER</span><h1>Manage properties<br/><em>in Google Sheets.</em></h1><p>Use the Google account that owns the Sheet. Access is protected by Google; no separate website password is needed.</p></div><div className="google-owner-panel"><ShieldCheck size={30}/><h2>Your private property workspace</h2><p>Review submissions, edit listing details, add public photo URLs, and choose a status. Only approved listings appear on the website.</p><a className="workflow-primary" href={GOOGLE_SHEET} target="_blank" rel="noreferrer">Open property Sheet <ExternalLink size={17}/></a><ol><li><strong>Review:</strong> Check the customer’s details and property information.</li><li><strong>Edit:</strong> Update any fields and add public image links under <b>Public photo URLs</b>.</li><li><strong>Publish:</strong> Set <b>Status</b> to <b>Approved</b>. Sale listings appear on Buy; rentals appear on Rent.</li><li><strong>Unpublish:</strong> Change Status to <b>Archived</b> or <b>Rejected</b>.</li></ol><p className="form-help">To add a property yourself, add a new row with its details and a unique Property ID, such as BHR-001. Leave seller contact fields private. Approved rows need a title, city, locality, positive price and area.</p><a className="inline-contact" href="#buy">View published properties <ArrowRight size={15}/></a></div></main>}


export const ENQUIRY_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSda-pQs3MkDiNnnXc24wKtka3WZItCl2C5hdrxztWMB7alcXA/viewform'
export function enquiryLink(property = '', reference = '') {
  return '#enquire?' + new URLSearchParams({property, reference})
}
export function GoogleEnquiryPage() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '')
  const property = params.get('property') || ''
  const reference = params.get('reference') || ''
  return <main className="workflow-page google-sell"><div className="workflow-heading"><a className="listing-back" href={reference ? '#property-' + encodeURIComponent(reference) : '#top'}>← Back</a><span className="kicker">ENQUIRE WITH BHOOMERA REALTY</span><h1>Let’s find your<br/><em>next property.</em></h1><p>{property ? 'Enquiring about: ' + property : 'Tell us what you’re looking for or request a site visit. Our team will contact you.'}</p></div><NativeGoogleForm key={property+reference} kind="enquiry" property={property} reference={reference}/></main>
}
