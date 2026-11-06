import test from 'node:test'
import assert from 'node:assert/strict'
import {handleSubmission,submitGoogleForm} from './google-submit.js'
const enquiry={kind:'enquiry',fields:{'entry.2071933396':'QA test','entry.96690586':'0000000000','entry.1951885304':'Yacharam'}}
const receipt=(text)=>new Response(`<div class="vHW8K">${text}</div>`,{status:200})
test('enquiry requires a real Google receipt, not echoed input',async()=>{
 await assert.rejects(submitGoogleForm(enquiry,async()=>new Response('<input value="Your response has been recorded.">')),{status:502})
 assert.deepEqual(await submitGoogleForm(enquiry,async()=>receipt('Your response has been recorded.')),{success:true})
})
test('reject invalid input before forwarding to Google',async()=>{
 let sent=false
 await assert.rejects(submitGoogleForm({...enquiry,fields:{...enquiry.fields,'entry.96690586':'abc'}},async()=>{sent=true}),{status:400})
 assert.equal(sent,false)
})
test('Google errors and network failures never report success',async()=>{
 await assert.rejects(submitGoogleForm(enquiry,async()=>new Response('error',{status:400})),{status:502})
 await assert.rejects(submitGoogleForm(enquiry,async()=>{throw new Error('offline')}),{status:502})
})
test('submission endpoint rejects foreign origins, malformed JSON and GET',async()=>{
 const origin='https://bhoomera.example'
 assert.equal((await handleSubmission(new Request(origin+'/api/google-submit',{method:'POST',headers:{origin:'https://other.example','Content-Type':'application/json'},body:JSON.stringify(enquiry)}))).status,403)
 assert.equal((await handleSubmission(new Request(origin+'/api/google-submit',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:'{bad'}))).status,400)
 assert.equal((await handleSubmission(new Request(origin+'/api/google-submit'))).status,405)
})
test('rental submission maps purpose, numeric fields and options correctly',async()=>{
 const f={'1670899146':'QA test','1309331210':'0000000000','754330704':'QA rental','1512321670':'Apartment','747117302':'Rent','1774159753':'20000','692955134':'1000','116858689':'Sq feet','559848742':'Hyderabad','183680740':'Kandukur','1780213084':'QA description','1998816007':'I confirm I am authorized to share this property and agree to be contacted by Bhoomera Realty.'}
 const body={kind:'sell',fields:Object.fromEntries(Object.entries(f).map(([k,v])=>['entry.'+k,v]))}
 assert.deepEqual(await submitGoogleForm(body,async(url,init)=>{
  assert.equal(init.body.get('entry.747117302'),'Rent')
  assert.equal(init.body.get('entry.1512321670'),'Apartment')
  assert.equal(init.body.get('entry.1774159753'),'20000')
  return receipt('Thank you! Bhoomera Realty has received your property details. We will review your submission and contact you.')
 }),{success:true})
 await assert.rejects(submitGoogleForm({...body,fields:{...body.fields,'entry.1774159753':'0'}}),{status:400})
})
