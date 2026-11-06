const forms = {
  enquiry: {id:'1FAIpQLSda-pQs3MkDiNnnXc24wKtka3WZItCl2C5hdrxztWMB7alcXA', fields:['2071933396','96690586','1423972999','1951885304','826190633','2022145013'], required:['2071933396','96690586','1951885304'], phone:'96690586', email:'1423972999'},
  sell: {id:'1FAIpQLSc8Hks5nApY6_c45JyDbpjX1Dr315_qe4AwP9U3WFCT9SzpZw', fields:['1670899146','1309331210','1132249680','754330704','1512321670','747117302','1774159753','692955134','116858689','559848742','183680740','1551624812','2040399084','39834161','52098469','1226793403','1385942450','1780213084','563977778','1034738943','1998816007'], required:['1670899146','1309331210','754330704','1512321670','747117302','1774159753','692955134','116858689','559848742','183680740','1780213084','1998816007'], phone:'1309331210',email:'1132249680'}
}
function reject(message,status=400){throw Object.assign(new Error(message),{status})}
export async function submitGoogleForm(body, fetcher=fetch) {
  const form=forms[body?.kind]
  if(!form||!body.fields||typeof body.fields!=='object'||Array.isArray(body.fields))reject('Please complete the form and try again.')
  const values={}
  for(const id of form.fields){const raw=body.fields['entry.'+id]??'';if(typeof raw!=='string'||raw.length>5000)reject('A field is too long. Please shorten your details.');values[id]=raw.trim()}
  if(form.required.some(id=>!values[id]))reject('Please complete all required fields.')
  if(!/^[+\d\s()-]{10,20}$/.test(values[form.phone])||values[form.phone].replace(/\D/g,'').length<10)reject('Please enter a valid phone number.')
  if(values[form.email]&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[form.email]))reject('Please enter a valid email address.')
  if(body.kind==='sell'){
    if(!['Plot','Land','Apartment','House','Villa','Commercial'].includes(values['1512321670'])||!['Sale','Rent'].includes(values['747117302'])||!['Sq yards','Sq feet','Acres'].includes(values['116858689']))reject('Please select a valid property type, purpose and area unit.')
    for(const id of ['1774159753','692955134'])if(!Number.isFinite(Number(values[id]))||Number(values[id])<=0||Number(values[id])>1e12)reject('Price and area must be greater than zero.')
    for(const id of ['2040399084','39834161'])if(values[id]&&(!Number.isInteger(Number(values[id]))||Number(values[id])<0||Number(values[id])>100))reject('Bedrooms and bathrooms must be whole numbers from 0 to 100.')
    if(values['1998816007']!=='I confirm I am authorized to share this property and agree to be contacted by Bhoomera Realty.')reject('Please confirm you are authorized to submit this property.')
  }
  const params=new URLSearchParams(Object.entries(values).filter(([,v])=>v).map(([id,v])=>['entry.'+id,v]))
  const uncertain='We couldn’t confirm receipt. Your details may have reached us. Please call 98495 58210 before trying again.'
  try {
    const response=await fetcher(`https://docs.google.com/forms/d/e/${form.id}/formResponse?hl=en`,{method:'POST',body:params,signal:AbortSignal.timeout(20000)})
    const html=await response.text()
    // Check Google's receipt element, not an arbitrary phrase echoed from a field.
    const receipt=html.match(/<div[^>]*class="[^"]*\bvHW8K\b[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1]?.replace(/<[^>]*>/g,' ').trim()
    const confirmed=body.kind==='sell'?receipt?.startsWith('Thank you! Bhoomera Realty has received your property details.'):receipt==='Your response has been recorded.'
    if(!response.ok||!confirmed)reject(uncertain,502)
    return {success:true}
  } catch(error) {if(error.status)throw error;reject(uncertain,502)}
}

export async function handleSubmission(request) {
  const headers={'Cache-Control':'no-store','Content-Type':'application/json'}
  if(request.method!=='POST')return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{...headers,Allow:'POST'}})
  const origin=request.headers.get('origin')
  if(!origin||origin!==new URL(request.url).origin)return new Response(JSON.stringify({error:'Please submit from the Bhoomera Realty website.'}),{status:403,headers})
  if(!request.headers.get('content-type')?.includes('application/json'))return new Response(JSON.stringify({error:'Invalid request format.'}),{status:415,headers})
  try {
    const raw=await request.text()
    if(raw.length>40000)reject('Your submission is too long.',413)
    let body;try{body=JSON.parse(raw)}catch{reject('Invalid request format.')}
    return new Response(JSON.stringify(await submitGoogleForm(body)),{status:200,headers})
  } catch(error){return new Response(JSON.stringify({error:error.status?error.message:'Unable to send your request. Please try again.'}),{status:error.status||500,headers})}
}
