import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'

type Field = { id: string; label: string; required?: boolean; type?: string; options?: string[]; wide?: boolean; value?: string }
const enquiryFields: Field[] = [
  {id:'2071933396',label:'Your name',required:true},
  {id:'96690586',label:'Phone number',type:'tel',required:true},
  {id:'1423972999',label:'Email address',type:'email'},
  {id:'1951885304',label:'Property or location of interest',required:true},
  {id:'826190633',label:'Property reference'},
  {id:'2022145013',label:'Your requirements or preferred site visit date',type:'textarea',wide:true},
]
const sellerFields: Field[] = [
  {id:'1670899146',label:'Owner name',required:true},
  {id:'1309331210',label:'Phone number',type:'tel',required:true},
  {id:'1132249680',label:'Email address',type:'email'},
  {id:'754330704',label:'Property title',required:true},
  {id:'1512321670',label:'Property type',options:['Plot','Land','Apartment','House','Villa','Commercial'],required:true},
  {id:'747117302',label:'Listing purpose',options:['Sale','Rent'],required:true},
  {id:'1774159753',label:'Asking price / monthly rent (₹)',type:'number',required:true},
  {id:'692955134',label:'Area',type:'number',required:true},
  {id:'116858689',label:'Area unit',options:['Sq yards','Sq feet','Acres'],required:true},
  {id:'559848742',label:'City / district',required:true},
  {id:'183680740',label:'Locality / village',required:true},
  {id:'1551624812',label:'Address or location link',wide:true},
  {id:'2040399084',label:'Bedrooms',type:'number'},
  {id:'39834161',label:'Bathrooms',type:'number'},
  {id:'52098469',label:'Facing'},
  {id:'1226793403',label:'Road width'},
  {id:'1385942450',label:'Approval details',wide:true},
  {id:'1780213084',label:'Property description',type:'textarea',required:true,wide:true},
  {id:'563977778',label:'Amenities / features',type:'textarea',wide:true},
  {id:'1034738943',label:'Photo links',type:'textarea',wide:true},
]

export default function NativeGoogleForm({kind,property='',reference=''}:{kind:'sell'|'enquiry';property?:string;reference?:string}) {
  const [submitted,setSubmitted] = useState(false)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const inFlight=useRef(false)
  const statusRef=useRef<HTMLElement>(null)
  const fields = kind === 'sell' ? sellerFields : enquiryFields
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    if(inFlight.current)return
    inFlight.current=true
    const values=Object.fromEntries(new FormData(event.currentTarget).entries())
    setBusy(true);setError('')
    try{
      const response=await fetch('/api/google-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,fields:values}),signal:AbortSignal.timeout(30000)})
      const result=await response.json()
      if(!response.ok||result.success!==true)throw new Error(result.error||'Unable to confirm your submission. Please call us before trying again.')
      setSubmitted(true)
      requestAnimationFrame(()=>{statusRef.current?.focus();statusRef.current?.scrollIntoView({behavior:'smooth',block:'center'})})
    }catch(error){setError(error instanceof Error&&error.name!=='TimeoutError'&&error.name!=='AbortError'?error.message:'We couldn’t confirm receipt. Please call 98495 58210 before trying again to avoid a duplicate.')}
    finally{setBusy(false);inFlight.current=false}
  }
  return <div className="native-form-panel">
    <div className="native-form-intro"><ShieldCheck size={22}/><p>{kind==='sell'?'Property submission':'Customer enquiry'}<span>Your contact information stays private.</span></p></div>
    <form className="property-form native-google-form" onSubmit={submit} hidden={submitted} aria-busy={busy}>
      <fieldset disabled={busy} className="native-fields">
      <p className="form-help">Fields marked * are required.</p>
      <div className="form-grid">{fields.map(field=>{
        const value = field.id==='1951885304'?property:field.id==='826190633'?reference:field.value
        return <label key={field.id} className={field.wide?'full':undefined}>{field.label}{field.required?' *':' (optional)'}
          {field.options?<select name={'entry.'+field.id} required={field.required} defaultValue=""><option value="" disabled>Select an option</option>{field.options.map(option=><option key={option}>{option}</option>)}</select>
          :field.type==='textarea'?<textarea name={'entry.'+field.id} required={field.required} rows={4} maxLength={5000}/>
          :<input name={'entry.'+field.id} type={field.type||'text'} required={field.required} defaultValue={value} pattern={field.type==='tel'?'[+0-9 ()\\-]{10,20}':undefined} min={field.type==='number'?(field.required?'0.01':'0'):undefined} max={field.type==='number'?(field.required?'1000000000000':'100'):undefined} step={field.type==='number'?(field.required?'any':'1'):undefined} maxLength={field.type==='number'?undefined:500}/>}
        </label>
      })}</div>
      {kind==='sell'&&<label className="native-consent"><input type="checkbox" name="entry.1998816007" value="I confirm I am authorized to share this property and agree to be contacted by Bhoomera Realty." required/><span>I am authorized to share this property and agree to be contacted by Bhoomera Realty.</span></label>}
      {kind==='sell'&&<p className="form-help">Add shareable photo links above. We review every property before it appears on the website.</p>}
      </fieldset>
      {error&&<p className="native-form-error" role="alert">{error}</p>}
      <button className="workflow-primary" type="submit" disabled={busy}>{busy?'Sending…':kind==='sell'?'Submit property':'Send enquiry'} <ArrowRight size={17}/></button>
    </form>
    <section ref={statusRef} tabIndex={-1} hidden={!submitted} className="native-receipt" aria-label="Submission confirmation" role="status">
      <CheckCircle2 size={44}/><span className="kicker">THANK YOU FOR CHOOSING BHOOMERA REALTY</span>
      <h2>{kind==='sell'?'Your property details are received.':'Your enquiry is received.'}</h2>
      <p>{kind==='sell'?'Our team will review your property and contact you. Your listing will appear only after approval.':'Our team will contact you to discuss your requirements and the next steps.'}</p>
      <a className="workflow-primary" href={kind==='sell'?'#buy':reference?'#property-'+encodeURIComponent(reference):'#buy'}>{reference&&kind==='enquiry'?'Back to property':'Explore properties'} <ArrowRight size={17}/></a>
      <a className="native-home-link" href="#top">Back to home</a>
    </section>
  </div>
}
