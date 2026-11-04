import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createApp } from './app.js'

test('customer submission, private review, owner edits, publication, enquiries and restart persistence',async()=>{
 const dataDir=await mkdtemp(path.join(tmpdir(),'bhoomera-test-'))
 let server
 async function start(){const app=await createApp({dataDir,username:'test-owner',password:'test-secret'});server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));return 'http://127.0.0.1:'+server.address().port}
 let base=await start(),cookie=''
 async function request(route,method='GET',body,owner=false){const response=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(owner?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {response,body:await response.json()}}
 try{
  const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZk0AAAAASUVORK5CYII='
  const sample={title:'Test Yacharam plot',description:'A residential plot used only in an isolated automated test.',property_type:'Plot',purpose:'sale',price:5000000,area:200,area_unit:'sq yd',city:'Hyderabad',locality:'Yacharam',contact_name:'Test Seller',contact_phone:'9000000000',contact_email:'seller@example.test',images:[photo],status:'approved'}
  assert.equal((await request('/api/admin/properties')).response.status,401)
  assert.equal((await request('/api/admin/properties','POST',sample)).response.status,401)
  assert.equal((await request('/api/submissions','POST',{...sample,price:-1})).response.status,400)
  const localOrigin=await fetch(base+'/api/submissions',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});assert.equal(localOrigin.status,400,'same-origin submissions reach field validation')
  assert.equal((await request('/api/submissions','POST',{...sample,images:['data:image/png;base64,SGVsbG9Ob3RBblBob3Rv']})).response.status,400)
  const submitted=await request('/api/submissions','POST',sample);assert.equal(submitted.response.status,201);assert.equal(submitted.body.status,'pending')
  const id=submitted.body.id
  assert.deepEqual((await request('/api/properties')).body,[])
  assert.equal((await request('/api/properties/'+id)).response.status,404)
  assert.equal((await request('/api/admin/login','POST',{username:'test-owner',password:'wrong'})).response.status,401)
  const login=await request('/api/admin/login','POST',{username:'test-owner',password:'test-secret'});assert.equal(login.response.status,200);cookie=login.response.headers.get('set-cookie').split(';')[0];assert.match(login.response.headers.get('set-cookie'),/HttpOnly/)
  const pending=(await request('/api/admin/properties','GET',null,true)).body;assert.equal(pending[0].contact_phone,sample.contact_phone)
  assert.match(pending[0].images[0],/^\/uploads\/[a-f0-9-]+\.png$/)
  const storedPhoto=await fetch(base+pending[0].images[0]);assert.equal(storedPhoto.status,200);assert.match(storedPhoto.headers.get('content-type'),/image\/png/)
  const edited=await request('/api/admin/properties/'+id,'PATCH',{title:'Reviewed Yacharam plot',price:5500000,facing:'East',status:'approved'},true);assert.equal(edited.response.status,200)
  const publicRows=(await request('/api/properties?purpose=sale&type=Plot&q=yacharam&min=5400000')).body;assert.equal(publicRows.length,1);assert.equal(publicRows[0].title,'Reviewed Yacharam plot');assert.equal(publicRows[0].price,5500000);assert.equal(publicRows[0].facing,'East');assert.ok(!('contact_phone'in publicRows[0]));assert.ok(!('contact_email'in publicRows[0]))
  assert.deepEqual((await request('/api/properties?purpose=rent')).body,[])
  assert.deepEqual((await request('/api/properties?min=6000000')).body,[])
  const origin=await fetch(base+'/api/admin/properties/'+id,{method:'PATCH',headers:{Origin:'https://other.test',Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({status:'archived'})});assert.equal(origin.status,403)
  const enquiry=await request('/api/enquiries','POST',{propertyId:id,name:'Test Buyer',phone:'9111111111',email:'buyer@example.test'});assert.equal(enquiry.response.status,201)
  const enquiries=(await request('/api/admin/enquiries','GET',null,true)).body;assert.equal(enquiries.length,1)
  assert.equal((await request('/api/admin/enquiries/'+enquiries[0].id,'PATCH',{status:'accepted'},true)).response.status,200)
  const ownerAdded=await request('/api/admin/properties','POST',{...sample,title:'Owner created rent listing',purpose:'rent',status:'approved'},true);assert.equal(ownerAdded.response.status,201)
  assert.equal((await request('/api/properties?purpose=rent')).body.length,1)
  await Promise.all([request('/api/submissions','POST',{...sample,title:'Concurrent submission one'}),request('/api/submissions','POST',{...sample,title:'Concurrent submission two'})])
  assert.equal(JSON.parse(await readFile(path.join(dataDir,'properties.json'),'utf8')).properties.length,4)
  await new Promise(resolve=>server.close(resolve));base=await start()
  assert.equal((await request('/api/properties?purpose=sale')).body.length,1)
  assert.equal((await fetch(base+pending[0].images[0])).status,200)
  assert.equal((await request('/api/admin/properties','GET',null,true)).response.status,401)
  const relogin=await request('/api/admin/login','POST',{username:'test-owner',password:'test-secret'});cookie=relogin.response.headers.get('set-cookie').split(';')[0]
  await request('/api/admin/properties/'+id,'PATCH',{status:'archived'},true)
  assert.equal((await request('/api/properties/'+id)).response.status,404)
  await request('/api/admin/logout','POST',null,true)
  assert.equal((await request('/api/admin/properties','GET',null,true)).response.status,401)
 }finally{await new Promise(resolve=>server.close(resolve));await rm(dataDir,{recursive:true,force:true})}
})

test('unconfigured owner access never accepts omitted credentials',async()=>{
 const dataDir=await mkdtemp(path.join(tmpdir(),'bhoomera-auth-')),app=await createApp({dataDir,username:'',password:''}),server=app.listen(0,'127.0.0.1')
 await new Promise(resolve=>server.once('listening',resolve))
 try{const r=await fetch('http://127.0.0.1:'+server.address().port+'/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,503)}finally{await new Promise(resolve=>server.close(resolve));await rm(dataDir,{recursive:true,force:true})}
})
