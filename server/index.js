import express from 'express'
import { createClient } from '@supabase/supabase-js'

const app=express();app.use(express.json());
const supabaseUrl=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin=supabaseUrl&&serviceKey?createClient(supabaseUrl,serviceKey,{auth:{persistSession:false}}):null;
app.use((req,res,next)=>{
 const origin=String(req.headers.origin||'');
 if(!origin||/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)){res.setHeader('Access-Control-Allow-Origin',origin||'*')}
 res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Admin-Username, X-Admin-Password');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS');
 if(req.method==='OPTIONS')return res.sendStatus(204);next();
});
app.get('/api/health',(_,res)=>res.json({status:'ok'}));
app.post('/api/auth/dev-signup', async (req,res)=>{
  if(process.env.NODE_ENV==='production')return res.status(404).json({error:'Not available'});
  const origin=String(req.headers.origin||'');
  if(origin&&!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))return res.status(403).json({error:'Development signup is only allowed locally'});
  const {email,password,fullName,username,role}=req.body||{};
  if(!admin)return res.status(503).json({error:'Backend is not configured'});
  if(typeof email!=='string'||typeof password!=='string'||password.length<8)return res.status(400).json({error:'Valid email and an 8-character password are required'});
  const cleanUsername=String(username||'').trim().toLowerCase();
  if(!/^[a-zA-Z0-9_.]{3,30}$/.test(cleanUsername))return res.status(400).json({error:'Invalid username'});
  const cleanEmail=String(email).trim().toLowerCase();
  const users=await admin.auth.admin.listUsers({page:1,perPage:1000});
  const authUser=users.data?.users.find(user=>user.email?.toLowerCase()===cleanEmail);
  let user;
  if(authUser){
    const confirmed=await admin.auth.admin.updateUserById(authUser.id,{password,email_confirm:true,user_metadata:{...(authUser.user_metadata||{}),full_name:fullName,username:cleanUsername,account_type:role||'buyer'}});
    if(confirmed.error)return res.status(400).json({error:confirmed.error.message});
    user=confirmed.data.user;
  } else {
    const existing=await admin.from('profiles').select('id').eq('username',cleanUsername).maybeSingle();
    if(existing.data)return res.status(409).json({error:'Username is already in use'});
    const created=await admin.auth.admin.createUser({email:cleanEmail,password,email_confirm:true,user_metadata:{full_name:fullName,username:cleanUsername,account_type:role||'buyer'}});
    if(created.error)return res.status(400).json({error:created.error.message});
    user=created.data.user;
  }
  res.status(201).json({user:{id:user?.id,email:user?.email}});
});
app.post('/api/auth/resolve-username',async(req,res)=>{
 const username=String(req.body?.username||'').trim().toLowerCase();
 if(!username)return res.status(400).json({error:'Username is required'});if(!admin)return res.status(503).json({error:'Backend is not configured'});
 const {data,error}=await admin.from('profiles').select('id').eq('username',username).maybeSingle();if(error||!data)return res.status(404).json({error:'Account not found'});
 const {data:user}=await admin.auth.admin.getUserById(data.id);if(!user?.user?.email)return res.status(404).json({error:'Account not found'});
 res.json({email:user.user.email});
});
app.post('/api/admin/login',(req,res)=>{const {username,password}=req.body||{};if(username===process.env.ADMIN_USERNAME&&password===process.env.ADMIN_PASSWORD)return res.json({authenticated:true});return res.status(401).json({error:'Invalid administrator credentials'})});
app.post('/api/enquiries',async(req,res)=>{if(!admin)return res.status(503).json({error:'Backend not configured'});const {propertyId,buyerId,name,email,phone,message,propertyTitle}=req.body||{};if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(String(email).trim()))return res.status(400).json({error:'Valid email is required'});const cleanName=String(name||'').trim();const cleanPhone=String(phone||'').trim();if(!cleanName||!cleanPhone)return res.status(400).json({error:'Name and phone number are required'});const payload={property_id:typeof propertyId==='string'&&propertyId.length===36?propertyId:null,buyer_id:null,name:cleanName,email:String(email).trim().toLowerCase(),phone:cleanPhone,message:`${String(message||'Viewing request')}${propertyTitle?` — ${propertyTitle}`:''}`,status:'new'};const {error}=await admin.from('enquiries').insert(payload);if(error)return res.status(400).json({error:error.message});res.status(201).json({success:true})});
function adminAuthorized(req){return req.headers['x-admin-username']===process.env.ADMIN_USERNAME&&req.headers['x-admin-password']===process.env.ADMIN_PASSWORD}
app.get('/api/admin/stats',async(req,res)=>{if(!adminAuthorized(req))return res.status(401).json({error:'Unauthorized'});if(!admin)return res.status(503).json({error:'Backend not configured'});const [users,properties,pending,views,enquiries]=await Promise.all([admin.from('profiles').select('id',{count:'exact',head:true}),admin.from('properties').select('id',{count:'exact',head:true}),admin.from('properties').select('id',{count:'exact',head:true}).eq('status','pending'),admin.from('property_views').select('id',{count:'exact',head:true}),admin.from('enquiries').select('id',{count:'exact',head:true})]);const {data:viewRows}=await admin.from('property_views').select('property_id');const {data:propertyRows}=await admin.from('properties').select('id,title,city,status,purpose,price').order('created_at',{ascending:false});const {data:enquiryRows}=await admin.from('enquiries').select('id,property_id,name,email,phone,message,status,created_at,properties(title,city)').order('created_at',{ascending:false});const viewCounts={};for(const row of viewRows||[])viewCounts[row.property_id]=(viewCounts[row.property_id]||0)+1;const propertiesWithViews=(propertyRows||[]).map(property=>({...property,views:viewCounts[property.id]||0}));res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');res.json({users:users.count||0,properties:properties.count||0,pending:pending.count||0,views:views.count||0,enquiries:enquiries.count||0,propertyRows:propertiesWithViews,enquiryRows:enquiryRows||[]})});
app.patch('/api/admin/enquiries/:id',async(req,res)=>{if(!adminAuthorized(req)||!admin)return res.status(401).json({error:'Unauthorized'});const status=req.body?.status;if(!['new','accepted','declined'].includes(status))return res.status(400).json({error:'Invalid status'});const {error}=await admin.from('enquiries').update({status}).eq('id',req.params.id);if(error)return res.status(400).json({error:error.message});res.json({success:true})});
app.listen(process.env.PORT||3001,()=>console.log(`ESTORA API running on ${process.env.PORT||3001}`));
