const properties = [
  {title:'Linden House',location:'Pacific Heights, San Francisco',price:'$3,280,000',beds:4,baths:3,area:'2,840 sq ft',image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',type:'House'},
  {title:'Atelier Residence',location:'SoHo, New York',price:'$2,150,000',beds:3,baths:2,area:'1,920 sq ft',image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',type:'Apartment'},
  {title:'The Glass Villa',location:'Palm Springs, California',price:'$4,850,000',beds:5,baths:4,area:'3,560 sq ft',image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',type:'Villa'}
];

const propertyGrid=document.getElementById('propertyGrid');
function renderProperties(items=properties){
  propertyGrid.innerHTML=items.map((p,i)=>`<article class="property-card reveal visible" data-type="${p.type}">
    <div class="property-image" style="background-image:url('${p.image}')"><button class="save-property" aria-label="Save ${p.title}">♡</button></div>
    <div class="property-info"><div class="property-location">${p.location}</div><h3>${p.title}</h3><div class="property-meta"><strong>${p.price}</strong><span>${p.beds} beds &nbsp;·&nbsp; ${p.baths} baths &nbsp;·&nbsp; ${p.area}</span></div></div>
  </article>`).join('');
}
renderProperties();

propertyGrid.addEventListener('click',e=>{
  const button=e.target.closest('.save-property');
  if(!button)return;
  const saved=JSON.parse(localStorage.getItem('havenlySaved')||'[]');
  const card=button.closest('.property-card');
  const title=card.querySelector('h3').textContent;
  const index=saved.indexOf(title);
  if(index>=0)saved.splice(index,1); else saved.push(title);
  localStorage.setItem('havenlySaved',JSON.stringify(saved));
  button.textContent=index>=0?'♡':'♥';
  button.classList.toggle('saved',index<0);
  updateSavedState();
});

const heroImages=[
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85'
];
let heroIndex=0;const heroImage=document.querySelector('.hero-image');const imageCount=document.getElementById('imageCount');
function changeHero(direction){heroIndex=(heroIndex+direction+heroImages.length)%heroImages.length;heroImage.style.opacity='0';setTimeout(()=>{heroImage.style.backgroundImage=`url('${heroImages[heroIndex]}')`;heroImage.style.opacity='1';},220);imageCount.textContent=`0${heroIndex+1} / 03`}
document.getElementById('prevHero').addEventListener('click',()=>changeHero(-1));document.getElementById('nextHero').addEventListener('click',()=>changeHero(1));

const header=document.getElementById('header');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>60));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const modal=document.getElementById('authModal');let authMode='login';
function setAuthMode(mode){
  authMode=mode;
  document.querySelectorAll('[data-tab]').forEach(tab=>tab.classList.toggle('active',tab.dataset.tab===mode));
  document.querySelector('.signup-only').style.display=mode==='signup'?'block':'none';
  document.querySelector('.login-only').style.display=mode==='login'?'flex':'none';
  document.getElementById('authTitle').textContent=mode==='login'?'Welcome back':'Create your account';
  document.getElementById('authSubtitle').textContent=mode==='login'?'Continue your home search':'Start discovering remarkable homes';
  document.querySelector('.auth-submit').textContent=mode==='login'?'Log in':'Create account';
  document.getElementById('password').autocomplete=mode==='login'?'current-password':'new-password';
  document.getElementById('formError').textContent='';
}
function openAuth(mode='login'){setAuthMode(mode);modal.classList.add('open');modal.setAttribute('aria-hidden','false');setTimeout(()=>document.getElementById('identity').focus(),250)}
function closeAuth(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.querySelectorAll('[data-auth]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.auth==='login'&&localStorage.getItem('havenlyUser')){document.getElementById('memberDashboard').scrollIntoView({behavior:'smooth'});return}openAuth(button.dataset.auth)}));
document.querySelectorAll('[data-tab]').forEach(tab=>tab.addEventListener('click',()=>setAuthMode(tab.dataset.tab)));
document.querySelector('[data-close]').addEventListener('click',closeAuth);
modal.addEventListener('click',e=>{if(e.target===modal)closeAuth()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAuth()});
document.getElementById('togglePassword').addEventListener('click',function(){const input=document.getElementById('password');const shown=input.type==='text';input.type=shown?'password':'text';this.textContent=shown?'Show':'Hide'});

const form=document.getElementById('authForm');
form.addEventListener('submit',e=>{
  e.preventDefault();const identity=document.getElementById('identity').value.trim();const password=document.getElementById('password').value;const name=document.getElementById('fullName').value.trim();const error=document.getElementById('formError');
  if(authMode==='signup'&&!name){error.textContent='Please enter your full name.';return}
  if(!identity){error.textContent='Please enter your email or username.';return}
  if(authMode==='signup'&&identity.includes('@')&&!/^\S+@\S+\.\S+$/.test(identity)){error.textContent='Please enter a valid email address.';return}
  if(password.length<8){error.textContent='Password must be at least 8 characters.';return}
  let users=JSON.parse(localStorage.getItem('havenlyUsers')||'[]');
  if(authMode==='signup'){if(users.some(u=>u.identity.toLowerCase()===identity.toLowerCase())){error.textContent='An account with this email or username already exists.';return}users.push({name,identity,password});localStorage.setItem('havenlyUsers',JSON.stringify(users));localStorage.setItem('havenlyUser',identity)}
  else{const user=users.find(u=>u.identity.toLowerCase()===identity.toLowerCase()&&u.password===password);if(!user){error.textContent='Email/username or password is incorrect.';return}localStorage.setItem('havenlyUser',identity)}
  closeAuth();updateUserButton();
});
function updateSavedState(){
  const saved=JSON.parse(localStorage.getItem('havenlySaved')||'[]');
  document.querySelectorAll('.property-card').forEach(card=>{
    const button=card.querySelector('.save-property'); const title=card.querySelector('h3').textContent; const isSaved=saved.includes(title);
    if(button){button.textContent=isSaved?'♥':'♡';button.classList.toggle('saved',isSaved)}
  });
  const count=document.getElementById('savedCount'), stat=document.getElementById('statSaved');
  if(count)count.textContent=saved.length;if(stat)stat.textContent=saved.length;
}
function updateUserButton(){
  const user=localStorage.getItem('havenlyUser'); const login=document.querySelector('[data-auth="login"]'); const dashboard=document.getElementById('memberDashboard');
  if(!login)return;
  login.onclick=null;
  if(!user){login.textContent='Log in';login.setAttribute('data-auth','login');dashboard.hidden=true;updateSavedState();return}
  login.textContent='My sanctuary'; login.removeAttribute('data-auth');
  login.onclick=()=>{dashboard.scrollIntoView({behavior:'smooth'});};
  dashboard.hidden=false;
  const users=JSON.parse(localStorage.getItem('havenlyUsers')||'[]'); const account=users.find(u=>u.identity.toLower?.()===user.toLowerCase());
  document.getElementById('memberName').textContent=(account?.name||user.split('@')[0]).replace(/(^|\s)\S/g,c=>c.toUpperCase());
  updateSavedState();
}
updateUserButton();
document.getElementById('viewSaved').addEventListener('click',()=>document.getElementById('properties').scrollIntoView({behavior:'smooth'}));
document.getElementById('logoutButton').addEventListener('click',()=>{localStorage.removeItem('havenlyUser');updateUserButton();window.scrollTo({top:0,behavior:'smooth'});});
document.getElementById('favoritesButton').addEventListener('click',()=>document.getElementById('properties').scrollIntoView({behavior:'smooth'}));

function filterProperties(){const location=document.getElementById('locationSearch').value.trim().toLowerCase();const type=document.getElementById('typeSearch').value;const filtered=properties.filter(p=>(!location||p.location.toLowerCase().includes(location)||p.title.toLowerCase().includes(location))&&(!type||p.type===type));renderProperties(filtered.length?filtered:properties);document.getElementById('properties').scrollIntoView({behavior:'smooth'})}
document.getElementById('searchButton').addEventListener('click',filterProperties);document.getElementById('locationSearch').addEventListener('keydown',e=>{if(e.key==='Enter')filterProperties()});
