import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabaseClient';
import { Car, Building2, CalendarDays, CreditCard, FileText, LogOut, Menu, Plus, Search, Trash2, Edit3, MapPin, Phone, ChevronRight, Wrench, BarChart3, Users, CheckCircle2, Clock3, ArrowLeft, AlertTriangle, Crown, Star, Bell, Share2, Download, Brain, Camera, ShieldCheck, Trophy, Activity, Globe2, ShoppingCart, Truck, ScanLine, BadgeCheck } from 'lucide-react';
import './styles.css';
const VERSION = 'TallerSmart Real MVP v11.0.04 · Product Polish';
const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 });
const plateNorm = (p) => (p || '').toUpperCase().replace(/\s|-/g, '');
const toDateInput = (d) => d ? new Date(d).toISOString().slice(0,10) : '';
const daysUntil = (dateValue) => { if(!dateValue) return null; const today=new Date(); today.setHours(0,0,0,0); const d=new Date(dateValue); d.setHours(0,0,0,0); return Math.ceil((d-today)/(1000*60*60*24)); };
const fullAddress = (w) => [w?.address_street || w?.address, w?.address_number, w?.city, w?.state, w?.country].filter(Boolean).join(', ');
const mapsUrl = (w) => { const q = [fullAddress(w), w?.name].filter(Boolean).join(' '); return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || 'taller mecánico')}`; };
const whatsappUrl = (phone) => { const digits=(phone||'').replace(/\D/g,''); return digits ? `https://wa.me/${digits}` : '#'; };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : 'Sin fecha';
const COUNTRIES = [
  { name:'Argentina', lang:'es' }, { name:'Uruguay', lang:'es' }, { name:'Chile', lang:'es' }, { name:'México', lang:'es' }, { name:'España', lang:'es' },
  { name:'Brasil', lang:'pt' }, { name:'Portugal', lang:'pt' },
  { name:'United States', lang:'en' }, { name:'United Kingdom', lang:'en' }, { name:'Canada', lang:'en' }, { name:'Other', lang:'en' }
];
const languageFromCountry = (country='Argentina') => (COUNTRIES.find(c=>c.name===country)?.lang || 'en');
const I18N = {
  es:{workshopLogin:'Ingresar como Taller',clientLogin:'Ingreso Cliente',workshopSub:'Gestioná tu taller y clientes',clientSub:'Tu garage digital y tus vehículos',country:'País',language:'Idioma',auto:'Idioma preestablecido por país',registerWorkshop:'Registrar nuevo taller',registerClient:'Registrar nuevo cliente',email:'Correo electrónico',password:'Contraseña',enter:'Ingresar',back:'Volver',createClient:'Crear usuario cliente',newUser:'Registrar nuevo usuario', panel:'Panel de taller', clients:'Clientes', jobs:'Trabajos realizados', billing:'Facturación', turns:'Turnos', backHome:'Volver al inicio', newClient:'Nuevo cliente', searchClient:'Buscar cliente', name:'Nombre', phone:'Teléfono', plate:'Patente', brand:'Marca', model:'Modelo', year:'Año', km:'Kilometraje actual', saveClient:'Guardar cliente', editClient:'Editar cliente', deleteClient:'Eliminar cliente', saveChanges:'Guardar cambios', loadWork:'Cargar trabajo', work:'Trabajo', detail:'Detalle', cost:'Costo', addHistory:'Agregar al historial', selectClient:'Seleccionar cliente', reason:'Motivo', notes:'Notas', assignTurn:'Asignar turno', editTurn:'Editar turno', deleteTurn:'Eliminar turno', assignedTurns:'Turnos asignados', proDemo:'Activar PRO Demo'},
  en:{workshopLogin:'Workshop Login',clientLogin:'Client Login',workshopSub:'Manage your shop and clients',clientSub:'Your digital garage and vehicles',country:'Country',language:'Language',auto:'Language is preset by country',registerWorkshop:'Register new workshop',registerClient:'Register new client',email:'Email address',password:'Password',enter:'Sign in',back:'Back',createClient:'Create client user',newUser:'Register new user', panel:'Workshop dashboard', clients:'Clients', jobs:'Completed jobs', billing:'Billing', turns:'Appointments', backHome:'Back to home', newClient:'New client', searchClient:'Search client', name:'Name', phone:'Phone', plate:'Plate', brand:'Brand', model:'Model', year:'Year', km:'Current mileage', saveClient:'Save client', editClient:'Edit client', deleteClient:'Delete client', saveChanges:'Save changes', loadWork:'Add job', work:'Job', detail:'Detail', cost:'Cost', addHistory:'Add to history', selectClient:'Select client', reason:'Reason', notes:'Notes', assignTurn:'Schedule appointment', editTurn:'Edit appointment', deleteTurn:'Delete appointment', assignedTurns:'Scheduled appointments', proDemo:'Activate PRO Demo'},
  pt:{workshopLogin:'Entrar como Oficina',clientLogin:'Entrar como Cliente',workshopSub:'Gerencie sua oficina e clientes',clientSub:'Sua garagem digital e seus veículos',country:'País',language:'Idioma',auto:'Idioma predefinido pelo país',registerWorkshop:'Registrar nova oficina',registerClient:'Registrar novo cliente',email:'E-mail',password:'Senha',enter:'Entrar',back:'Voltar',createClient:'Criar usuário cliente',newUser:'Registrar novo usuário', panel:'Painel da oficina', clients:'Clientes', jobs:'Serviços realizados', billing:'Faturamento', turns:'Agendamentos', backHome:'Voltar ao início', newClient:'Novo cliente', searchClient:'Buscar cliente', name:'Nome', phone:'Telefone', plate:'Placa', brand:'Marca', model:'Modelo', year:'Ano', km:'Quilometragem atual', saveClient:'Salvar cliente', editClient:'Editar cliente', deleteClient:'Excluir cliente', saveChanges:'Salvar alterações', loadWork:'Registrar serviço', work:'Serviço', detail:'Detalhe', cost:'Custo', addHistory:'Adicionar ao histórico', selectClient:'Selecionar cliente', reason:'Motivo', notes:'Notas', assignTurn:'Agendar', editTurn:'Editar agendamento', deleteTurn:'Excluir agendamento', assignedTurns:'Agendamentos', proDemo:'Ativar PRO Demo'}
};
const getLang = () => localStorage.getItem('tallersmart_lang') || 'es';
const setStoredLang = (l) => localStorage.setItem('tallersmart_lang', l);
const tr = () => I18N[getLang()] || I18N.es;
function LanguageSelector(){const [lang,setLang]=useState(getLang());return <div className="home-lang"><span>{lang.toUpperCase()}</span><select value={lang} onChange={e=>{setLang(e.target.value);setStoredLang(e.target.value);window.location.reload();}}><option value="es">Español</option><option value="en">English</option><option value="pt">Português</option></select></div>}
function CountrySelect({value,onChange}){const [country,setCountry]=useState(value||'Argentina');function change(v){setCountry(v);const lang=languageFromCountry(v);setStoredLang(lang);onChange(v,lang)}return <><select value={country} onChange={e=>change(e.target.value)}>{COUNTRIES.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select><small>{tr().auto}</small></>}
const vehicleScore = (vehicle, jobs=[]) => {
  let score = 100;
  const vtv = daysUntil(vehicle?.vtv_expiration_date);
  if (vtv !== null && vtv < 0) score -= 25;
  else if (vtv !== null && vtv <= 30) score -= 10;
  if (!jobs.length) score -= 20;
  if (jobs.some(j => (j.payment_status || 'pending') !== 'paid')) score -= 5;
  return Math.max(35, Math.min(100, score));
};
function App(){
  const [session,setSession]=useState(null);
  const [view,setView]=useState('home');
  const [workshop,setWorkshop]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ supabase.auth.getSession().then(({data})=>{setSession(data.session); setLoading(false)}); const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s)}); return()=>subscription.unsubscribe();},[]);
  useEffect(()=>{ if(session) loadWorkshop(session.user.id); else setWorkshop(null); },[session]);
  useEffect(()=>{ handlePaymentReturn(); },[]);
  async function handlePaymentReturn(){
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('job_id') || params.get('external_reference');
    const result = params.get('payment_result') || params.get('collection_status') || params.get('status');
    const mpPaymentId = params.get('payment_id') || params.get('collection_id');
    if(jobId && ['success','approved'].includes((result||'').toLowerCase())){
      await supabase.from('jobs').update({ payment_status:'paid', mp_payment_id: mpPaymentId || null }).eq('id', jobId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
  async function loadWorkshop(uid){ const {data}=await supabase.from('workshops').select('*').eq('owner_id',uid).maybeSingle(); if(data){setWorkshop(data);setView('admin')} }
  async function signOut(){ await supabase.auth.signOut(); setView('home'); }
  if(loading) return <Shell><p>Cargando...</p></Shell>;
  return <Shell>{view==='home'&&<Home setView={setView}/>} {view==='login'&&<WorkshopLogin setView={setView} onReady={(w)=>{setWorkshop(w);setView('admin')}}/>} {view==='register'&&<WorkshopRegister setView={setView}/>} {view==='client'&&<ClientAuth setView={setView}/>} {view==='clientAccount'&& session && <ClientAccount signOut={signOut}/>} {view==='admin'&& session && workshop && <AdminDashboard workshop={workshop} signOut={signOut}/>}</Shell>;
}
function Shell({children}){return <div className="app">{children}</div>}
function Home({setView}){const t=tr();return <div className="home"><LanguageSelector/><img src="/logo.png" className="logo"/><h1>TallerSmart</h1><p className="desc">TallerSmart centraliza el historial vehicular entre talleres y clientes, permitiendo trazabilidad, pagos y seguimiento inteligente del mantenimiento.</p><button className="big" onClick={()=>setView('login')}><Building2/><span><b>{t.workshopLogin}</b><small>{t.workshopSub}</small></span><ChevronRight/></button><button className="big" onClick={()=>setView('client')}><Car/><span><b>{t.clientLogin}</b><small>{t.clientSub}</small></span><ChevronRight/></button><section className="features"><h2>Global · ES / EN / PT</h2><div><Feature icon={<FileText/>} t="Historial / History" d="Historial completo del vehículo."/><Feature icon={<CreditCard/>} t="Pagos / Payments" d="Pagos y comprobantes."/><Feature icon={<Wrench/>} t="Mantenimiento / Maintenance" d="Seguimiento inteligente."/><Feature icon={<Users/>} t="Conexión / Connection" d="Talleres y clientes conectados."/></div></section><section className="features platform"><h2>Visión global v11.0.04</h2><div><Feature icon={<BadgeCheck/>} t="Identidad digital" d="Historial universal por vehículo."/><Feature icon={<ScanLine/>} t="Carfax LATAM" d="Informe para compra/venta."/><Feature icon={<Globe2/>} t="Plataforma total" d="Talleres, clientes, pagos, turnos y servicios."/><Feature icon={<Brain/>} t="IA vehicular" d="Diagnóstico y mantenimiento predictivo."/><Feature icon={<Truck/>} t="Flotas" d="Empresas, logística y transporte."/></div></section><footer>{VERSION}</footer></div>}
function Feature({icon,t,d}){return <article>{icon}<b>{t}</b><small>{d}</small></article>}
function WorkshopLogin({setView,onReady}){const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [msg,setMsg]=useState('');async function login(){setMsg('Ingresando...');const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error){setMsg(error.message);return} const pending=JSON.parse(localStorage.getItem('pendingWorkshop')||'null'); let {data:ws}=await supabase.from('workshops').select('*').eq('owner_id',data.user.id).maybeSingle(); if(!ws && pending){const {data:newWs,error:e}=await supabase.from('workshops').insert({...pending,owner_id:data.user.id,email:data.user.email,confirmed:true}).select().single(); if(e){setMsg(e.message);return} localStorage.removeItem('pendingWorkshop'); ws=newWs;} if(!ws){setMsg('Ingresaste, pero falta registrar los datos del taller.');return} onReady(ws)} return <AuthCard title="Ingreso Taller"><input placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={login}>Ingresar</button><p>{msg}</p><button className="link" onClick={()=>setView('register')}>Registrar taller</button><button className="link" onClick={()=>setView('home')}>Volver</button></AuthCard>}
function WorkshopRegister({setView}){const [f,setF]=useState({name:'',email:'',phone:'',address_street:'',address_number:'',city:'',state:'',country:'Argentina',language:getLang(),opening_hours:'',mercadopago_alias:'',modo_alias:'',password:''});const [msg,setMsg]=useState('');const set=(k,v)=>setF({...f,[k]:v});async function reg(){setMsg('Creando cuenta...'); localStorage.setItem('pendingWorkshop',JSON.stringify({name:f.name,phone:f.phone,address_street:f.address_street,address_number:f.address_number,city:f.city,state:f.state,country:f.country,language:f.language,opening_hours:f.opening_hours,mercadopago_alias:f.mercadopago_alias,modo_alias:f.modo_alias})); const {error}=await supabase.auth.signUp({email:f.email,password:f.password}); if(error){setMsg(error.message);return} setMsg('Cuenta creada. Si Supabase pide confirmación, revisá tu correo. Luego iniciá sesión.');} return <AuthCard title="Registrar nuevo taller"><input placeholder="Nombre del taller" onChange={e=>set('name',e.target.value)}/><input placeholder="Correo electrónico" onChange={e=>set('email',e.target.value)}/><input placeholder="Teléfono / WhatsApp" onChange={e=>set('phone',e.target.value)}/><input placeholder="Calle" onChange={e=>set('address_street',e.target.value)}/><input placeholder="Número" onChange={e=>set('address_number',e.target.value)}/><input placeholder="Ciudad" onChange={e=>set('city',e.target.value)}/><input placeholder="Provincia / Estado" onChange={e=>set('state',e.target.value)}/><label>{tr().country}</label><CountrySelect value={f.country} onChange={(country,language)=>setF({...f,country,language})}/><input placeholder="Horario de atención" onChange={e=>set('opening_hours',e.target.value)}/><input placeholder="Alias Mercado Pago" onChange={e=>set('mercadopago_alias',e.target.value)}/><input placeholder="Alias MODO" onChange={e=>set('modo_alias',e.target.value)}/><input placeholder="Contraseña" type="password" onChange={e=>set('password',e.target.value)}/><button onClick={reg}>Crear cuenta</button><p>{msg}</p><button className="link" onClick={()=>setView('login')}>Ya tengo cuenta</button></AuthCard>}
function AuthCard({title,children}){return <div className="auth"><img src="/logo.png"/><h2>{title}</h2>{children}</div>}
function AdminDashboard({workshop,signOut}){const [menu,setMenu]=useState(false);const [section,setSection]=useState('panel');const [clients,setClients]=useState([]);const [jobs,setJobs]=useState([]);const [appointments,setAppointments]=useState([]);const [selected,setSelected]=useState(null);useEffect(()=>{loadAll()},[]);async function loadAll(){const {data:c}=await supabase.from('clients').select('*, vehicles(*)').eq('workshop_id',workshop.id).order('created_at',{ascending:false});setClients(c||[]);const {data:j}=await supabase.from('jobs').select('*, vehicles(*), clients(name), workshops(name,address,address_street,address_number,city,state,country,phone,opening_hours)').eq('workshop_id',workshop.id).order('job_date',{ascending:false});setJobs(j||[]);const {data:a}=await supabase.from('appointments').select('*, vehicles(*), clients(name)').eq('workshop_id',workshop.id).order('appointment_date',{ascending:true});setAppointments(a||[]);}const t=tr();return <div className="dash"><header><button className="icon" onClick={()=>setMenu(!menu)}><Menu/></button><div><b>{workshop.name}</b><small>{t.panel}</small></div><button className="icon" onClick={signOut}><LogOut/></button></header>{menu&&<nav className="drawer"><button onClick={()=>{setSection('panel');setMenu(false)}}><ArrowLeft/>{t.backHome}</button><button onClick={()=>{setSection('clients');setMenu(false)}}><Users/>{t.clients}</button><button onClick={()=>{setSection('jobs');setMenu(false)}}><FileText/>{t.jobs}</button><button onClick={()=>{setSection('billing');setMenu(false)}}><BarChart3/>{t.billing}</button><button onClick={()=>{setSection('turns');setMenu(false)}}><CalendarDays/>{t.turns}</button></nav>} {section==='panel'&&<Panel clients={clients} jobs={jobs} appointments={appointments}/>} {section==='clients'&&<Clients clients={clients} workshop={workshop} reload={loadAll} selected={selected} setSelected={setSelected}/>} {section==='jobs'&&<Jobs jobs={jobs}/>} {section==='billing'&&<Billing jobs={jobs}/>} {section==='turns'&&<Turns workshop={workshop} clients={clients} appointments={appointments} reload={loadAll}/>}<footer>{VERSION}</footer></div>}
function Panel({clients,jobs,appointments}){const pending=jobs.filter(j=>j.payment_status!=='paid').length;const t=tr();return <main><h2>{t.panel}</h2><p className="muted">Usá el menú ☰ para acceder a clientes, trabajos realizados, facturación y turnos.</p><div className="stats"><Stat n={clients.length} t={t.clients}/><Stat n={pending} t="Pagos pendientes"/><Stat n={jobs.length} t={t.jobs}/><Stat n={appointments.length} t={t.turns}/></div></main>}
function Stat({n,t}){return <div className="stat"><b>{n}</b><small>{t}</small></div>}
function Clients({clients,workshop,reload,selected,setSelected}){const [mode,setMode]=useState('menu');const [q,setQ]=useState('');const shown=clients.filter(c=>(c.name+(c.vehicles?.plate||'')).toLowerCase().includes(q.toLowerCase()));const t=tr();return <main>{mode==='menu'&&<div className="cards"><button onClick={()=>setMode('new')}><Plus/>{t.newClient}</button><button onClick={()=>setMode('search')}><Search/>{t.searchClient}</button></div>}{mode==='new'&&<ClientForm workshop={workshop} reload={()=>{reload();setMode('search')}}/>}{mode==='search'&&<><input placeholder={t.searchClient+' / '+t.plate} value={q} onChange={e=>setQ(e.target.value)}/>{shown.map(c=><div className="item" key={c.id} onClick={()=>setSelected(c)}><b>{c.name}</b><small>{c.vehicles?.plate} · {c.vehicles?.brand} {c.vehicles?.model}</small></div>)}{selected&&<ClientDetail client={selected} workshop={workshop} reload={reload}/>}</>}<button className="link" onClick={()=>setMode('menu')}><ArrowLeft/>{t.backHome}</button></main>}
function ClientForm({workshop,reload}){const [f,setF]=useState({name:'',phone:'',email:'',plate:'',brand:'',model:'',year:'',current_km:''});const [msg,setMsg]=useState('');const t=tr();const labels={name:t.name,phone:t.phone,email:t.email,plate:t.plate,brand:t.brand,model:t.model,year:t.year,current_km:t.km};const set=(k,v)=>setF({...f,[k]:v});async function save(){setMsg('Guardando...'); const plate=plateNorm(f.plate); if(!plate||!f.name){setMsg('Completá nombre y patente');return} let {data:v}=await supabase.from('vehicles').select('*').eq('plate',plate).maybeSingle(); if(!v){const res=await supabase.from('vehicles').insert({plate,brand:f.brand,model:f.model,year:f.year||null,current_km:f.current_km||0}).select().single(); if(res.error){setMsg(res.error.message);return} v=res.data;} const {error}=await supabase.from('clients').insert({workshop_id:workshop.id,vehicle_id:v.id,name:f.name,phone:f.phone,email:f.email}); if(error){setMsg(error.message);return} setMsg('Cliente guardado'); reload();}return <div className="form"><h3>{t.newClient}</h3>{['name','phone','email','plate','brand','model','year','current_km'].map(k=><input key={k} placeholder={labels[k]} value={f[k]} onChange={e=>set(k,e.target.value)}/>)}<button onClick={save}>{t.saveClient}</button><p>{msg}</p></div>}
function ClientDetail({client,workshop,reload}){const [edit,setEdit]=useState(false);const [f,setF]=useState({name:client.name||'',phone:client.phone||'',email:client.email||'',plate:client.vehicles?.plate||'',brand:client.vehicles?.brand||'',model:client.vehicles?.model||'',year:client.vehicles?.year||'',current_km:client.vehicles?.current_km||''});const [work,setWork]=useState({title:'',description:'',km:client.vehicles?.current_km||0,cost:''});const t=tr();const labels={name:t.name,phone:t.phone,email:t.email,plate:t.plate,brand:t.brand,model:t.model,year:t.year,current_km:t.km};async function del(){if(!confirm('¿Eliminar cliente?'))return; await supabase.from('clients').delete().eq('id',client.id); reload()}async function upd(){const plate=plateNorm(f.plate); await supabase.from('clients').update({name:f.name,phone:f.phone,email:f.email}).eq('id',client.id); await supabase.from('vehicles').update({plate,brand:f.brand,model:f.model,year:f.year||null,current_km:f.current_km||0}).eq('id',client.vehicle_id); setEdit(false); reload()}async function addJob(){await supabase.from('jobs').insert({workshop_id:workshop.id,vehicle_id:client.vehicle_id,client_id:client.id,title:work.title,description:work.description,km:work.km,cost:work.cost||0,payment_status:'pending'}); reload(); alert('Trabajo cargado')}return <div className="detail"><h3>{client.name}</h3>{edit&&<div className="modal-lite"><h3>{t.editClient}</h3>{['name','phone','email','plate','brand','model','year','current_km'].map(k=><label key={k}><small>{labels[k]}</small><input value={f[k]||''} onChange={e=>setF({...f,[k]:e.target.value})}/></label>)}<button onClick={upd}>{t.saveChanges}</button><button className="link" onClick={()=>setEdit(false)}>Cancelar</button></div>}<button onClick={()=>setEdit(true)}><Edit3/>{t.editClient}</button><button className="danger" onClick={del}><Trash2/>{t.deleteClient}</button><h3>{t.loadWork}</h3><input placeholder={t.work} onChange={e=>setWork({...work,title:e.target.value})}/><textarea placeholder={t.detail} onChange={e=>setWork({...work,description:e.target.value})}/><input placeholder={t.km} type="number" onChange={e=>setWork({...work,km:e.target.value})}/><input placeholder={t.cost} type="number" onChange={e=>setWork({...work,cost:e.target.value})}/><button onClick={addJob}>{t.addHistory}</button></div>}
function Jobs({jobs}){const t=tr();return <main><h2>{t.jobs}</h2>{jobs.map(j=><div className="item" key={j.id}><b>{j.title}</b><small>{j.clients?.name||'Cliente'} · {j.vehicles?.plate} · {fmt(j.cost)} · {j.payment_status==='paid'?'Pago acreditado':'Pendiente'}</small><p>{j.description}</p></div>)}</main>}
function Billing({jobs}){const t=tr();const total=jobs.reduce((a,j)=>a+Number(j.cost||0),0), paid=jobs.filter(j=>j.payment_status==='paid').reduce((a,j)=>a+Number(j.cost||0),0);return <main><h2>{t.billing}</h2><div className="stats"><Stat n={fmt(total)} t="Total trabajos"/><Stat n={fmt(paid)} t="Cobrado"/><Stat n={fmt(total-paid)} t="Pendiente"/></div><Jobs jobs={jobs}/></main>}
function Turns({workshop,clients,appointments,reload}){const [f,setF]=useState({client_id:'',title:'',appointment_date:'',notes:''});const [editing,setEditing]=useState(null);const t=tr();async function save(){const c=clients.find(x=>x.id===f.client_id); if(!c)return alert(t.selectClient); if(editing){await supabase.from('appointments').update({client_id:c.id,vehicle_id:c.vehicle_id,title:f.title,appointment_date:f.appointment_date,notes:f.notes}).eq('id',editing.id);setEditing(null)}else{await supabase.from('appointments').insert({workshop_id:workshop.id,client_id:c.id,vehicle_id:c.vehicle_id,title:f.title,appointment_date:f.appointment_date,notes:f.notes});} setF({client_id:'',title:'',appointment_date:'',notes:''}); reload()}function edit(a){setEditing(a);setF({client_id:a.client_id||'',title:a.title||'',appointment_date:a.appointment_date?new Date(a.appointment_date).toISOString().slice(0,16):'',notes:a.notes||''})}async function del(a){if(!confirm('¿Eliminar turno?'))return; await supabase.from('appointments').delete().eq('id',a.id); reload()}return <main><h2>{t.turns}</h2><div className="form"><select value={f.client_id} onChange={e=>setF({...f,client_id:e.target.value})}><option value="">{t.selectClient}</option>{clients.map(c=><option value={c.id} key={c.id}>{c.name} - {c.vehicles?.plate}</option>)}</select><input placeholder={t.reason} value={f.title} onChange={e=>setF({...f,title:e.target.value})}/><input type="datetime-local" value={f.appointment_date} onChange={e=>setF({...f,appointment_date:e.target.value})}/><textarea placeholder={t.notes} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/><button onClick={save}>{editing?t.editTurn:t.assignTurn}</button>{editing&&<button className="link" onClick={()=>{setEditing(null);setF({client_id:'',title:'',appointment_date:'',notes:''})}}>Cancelar edición</button>}</div><h3>{t.assignedTurns}</h3>{appointments.map(a=><div className="item" key={a.id}><b>{new Date(a.appointment_date).toLocaleString('es-AR')}</b><small>{a.clients?.name} · {a.vehicles?.plate} · {a.title}</small><div className="row"><button onClick={()=>edit(a)}><Edit3/>{t.editTurn}</button><button className="danger" onClick={()=>del(a)}><Trash2/>{t.deleteTurn}</button></div></div>)}</main>}
function ClientAuth({setView}){
  const [mode,setMode]=useState('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [name,setName]=useState('');
  const [country,setCountry]=useState('Argentina');
  const [lang,setLang]=useState(getLang());
  const [msg,setMsg]=useState('');
  async function ensureProfile(user, displayName=''){
    if(!user) return;
    const {data:existing}=await supabase.from('client_profiles').select('*').eq('user_id', user.id).maybeSingle();
    if(!existing){
      await supabase.from('client_profiles').insert({user_id:user.id,email:user.email,full_name:displayName || user.email,country,language:lang,plan:'free',vehicle_limit:1});
    }
  }
  async function login(){
    setMsg('Ingresando...');
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error){setMsg(error.message);return}
    await ensureProfile(data.user);
    setView('clientAccount');
  }
  async function register(){
    setMsg('Creando usuario...');
    const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,country,language:lang}}});
    if(error){setMsg(error.message);return}
    if(data.user && data.session){ await ensureProfile(data.user,name); setView('clientAccount'); return; }
    localStorage.setItem('pendingClientProfile', JSON.stringify({email,full_name:name,country,language:lang}));
    setMsg('Usuario creado. Si Supabase pide confirmación, revisá tu correo y luego iniciá sesión.');
  }
  return <AuthCard title={mode==='login'?'Ingreso Cliente':'Registrar nuevo cliente'}>
    {mode==='register'&&<input placeholder="Nombre y apellido" value={name} onChange={e=>setName(e.target.value)}/>} {mode==='register'&&<><label>{tr().country}</label><CountrySelect value={country} onChange={(c,l)=>{setCountry(c);setLang(l)}}/></>} 
    <input placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)}/>
    <input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button onClick={mode==='login'?login:register}>{mode==='login'?'Ingresar':'Crear usuario cliente'}</button>
    <p>{msg}</p>
    {mode==='login'?<button className="link" onClick={()=>setMode('register')}>Registrar nuevo usuario</button>:<button className="link" onClick={()=>setMode('login')}>Ya tengo cuenta</button>}
    <button className="link" onClick={()=>setView('home')}>Volver</button>
  </AuthCard>
}
function ClientAccount({signOut}){
  const [profile,setProfile]=useState(null);
  const [vehicles,setVehicles]=useState([]);
  const [selected,setSelected]=useState(null);
  const [jobs,setJobs]=useState([]);
  const [appointments,setAppointments]=useState([]);
  const [menu,setMenu]=useState(false);
  const [screen,setScreen]=useState('home');
  const [selectedJob,setSelectedJob]=useState(null);
  const [plate,setPlate]=useState('');
  const [msg,setMsg]=useState('');
  const [vtvDate,setVtvDate]=useState('');
  useEffect(()=>{ init(); },[]);
  useEffect(()=>{ if(selected) loadVehicleData(selected); },[selected?.id]);
  async function init(){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user) return;
    const pending=JSON.parse(localStorage.getItem('pendingClientProfile')||'null');
    let {data:p}=await supabase.from('client_profiles').select('*').eq('user_id',user.id).maybeSingle();
    if(!p){
      const {data:newP,error}=await supabase.from('client_profiles').insert({user_id:user.id,email:user.email,full_name:pending?.full_name || user.email,country:pending?.country || 'Argentina',language:pending?.language || getLang(),plan:'free',vehicle_limit:1}).select().single();
      if(error){setMsg(error.message);return}
      localStorage.removeItem('pendingClientProfile'); p=newP;
    }
    setProfile(p); await loadGarage();
  }
  async function loadGarage(){
    const {data,error}=await supabase.from('user_vehicles').select('*, vehicles(*)').order('created_at',{ascending:true});
    if(error){setMsg(error.message);return}
    setVehicles(data||[]);
    if((data||[]).length && !selected) setSelected(data[0].vehicles);
  }
  async function loadVehicleData(v){
    setVtvDate(toDateInput(v.vtv_expiration_date)); setSelectedJob(null);
    const {data:j}=await supabase.from('jobs').select('*, workshops(name,address,address_street,address_number,city,state,country,phone,opening_hours)').eq('vehicle_id',v.id).order('job_date',{ascending:false});
    setJobs(j||[]);
    const {data:a}=await supabase.from('appointments').select('*, workshops(name,address,address_street,address_number,city,state,country,phone,opening_hours), clients(name)').eq('vehicle_id',v.id).order('appointment_date',{ascending:true});
    setAppointments(a||[]);
  }
  async function addVehicle(){
    const normalized=plateNorm(plate);
    if(!normalized){setMsg('Ingresá una patente.');return}
    const isPremium=(profile?.plan||'free')!=='free';
    const limit=Number(profile?.vehicle_limit || 1);
    if(!isPremium && vehicles.length>=limit){setMsg('Tu plan gratis permite 1 vehículo. Para agregar más, activá Cliente PRO.');return}
    setMsg('Asociando vehículo...');
    let {data:v,error:findErr}=await supabase.from('vehicles').select('*').eq('plate',normalized).maybeSingle();
    if(findErr){setMsg(findErr.message);return}
    if(!v){
      const {data:newV,error:createErr}=await supabase.from('vehicles').insert({plate:normalized}).select().single();
      if(createErr){setMsg(createErr.message);return}
      v=newV;
    }
    const {error:linkErr}=await supabase.from('user_vehicles').insert({vehicle_id:v.id,alias:normalized});
    if(linkErr){setMsg(linkErr.message);return}
    setPlate(''); setMsg('Vehículo asociado correctamente.'); await loadGarage(); setSelected(v); setScreen('home');
  }
  async function saveVtv(){ if(!selected) return; const {error}=await supabase.from('vehicles').update({vtv_expiration_date: vtvDate || null}).eq('id',selected.id); if(error){alert(error.message);return} await loadGarage(); await loadVehicleData({...selected,vtv_expiration_date:vtvDate}); alert('Vencimiento de VTV guardado'); }
  async function activateProDemo(){
    if(!profile) return;
    const {error}=await supabase.from('client_profiles').update({plan:'pro',vehicle_limit:10}).eq('id',profile.id);
    if(error){alert(error.message);return}
    await loadProfile();
    alert('PRO Demo activado');
  }
  async function pay(job){
    try{const res=await fetch('/api/create-payment-preference',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId:job.id,title:job.title,description:job.description,amount:Number(job.cost||0),plate:selected?.plate})});const data=await res.json();if(!res.ok)throw new Error(data.error||'No se pudo crear el pago');window.location.href=data.init_point;}catch(e){alert(e.message)}
  }
  const planFree=(profile?.plan||'free')==='free';
  const vtvDays=daysUntil(selected?.vtv_expiration_date);
  const upcomingAppointments=appointments.filter(a=>new Date(a.appointment_date)>=new Date()).slice(0,5);
  return <main className="client client-session">
    <header className="client-top"><button className="icon" onClick={()=>setMenu(!menu)}><Menu/></button><div><b>{profile?.full_name || 'Cliente'}</b><small>{planFree?'Plan Gratis · 1 vehículo':'Cliente PRO · múltiples vehículos'}</small></div><button className="icon" onClick={signOut}><LogOut/></button></header>
    {menu&&<nav className="drawer client-drawer"><button onClick={()=>{setScreen('home');setMenu(false)}}><Car/>Mi garage</button><button onClick={()=>{setScreen('vehicles');setMenu(false)}}><Plus/>Agregar vehículo</button><button onClick={()=>{setScreen('jobs');setMenu(false)}}><FileText/>Trabajos realizados</button><button onClick={()=>{setScreen('alerts');setMenu(false)}}><Bell/>Alertas</button><button onClick={()=>{setScreen('score');setMenu(false)}}><Activity/>Score del vehículo</button><button onClick={()=>{setScreen('documents');setMenu(false)}}><Camera/>Fotos y documentos</button><button onClick={()=>{setScreen('sharing');setMenu(false)}}><Share2/>Vehículo compartido</button><button onClick={()=>{setScreen('workshops');setMenu(false)}}><Star/>Talleres favoritos</button><button onClick={()=>{setScreen('ai');setMenu(false)}}><Brain/>IA vehicular</button><button onClick={()=>{setScreen('premium');setMenu(false)}}><Crown/>Cliente PRO</button></nav>}
    {msg&&<div className="alert-red"><AlertTriangle/><b>{msg}</b></div>}
    {!vehicles.length && screen==='home' && <OnboardingClient onAdd={()=>setScreen('vehicles')} onPro={()=>setScreen('premium')}/>}
    {screen==='home'&&<>
      <div className="garage-head"><h2>Mi garage digital</h2><button onClick={()=>setScreen('vehicles')}><Plus/>Agregar vehículo</button></div>
      <div className="garage-list">{vehicles.map(x=><button key={x.id} className={selected?.id===x.vehicles?.id?'vehicle-pill active':'vehicle-pill'} onClick={()=>setSelected(x.vehicles)}><Car/><span>{x.alias||x.vehicles?.plate}</span></button>)}</div>
      {!vehicles.length&&<div className="form"><h3>Asociá tu primer vehículo</h3><input placeholder="Patente" value={plate} onChange={e=>setPlate(e.target.value)}/><button onClick={addVehicle}>Agregar vehículo gratis</button></div>}
      {selected&&<><VehicleHealth selected={selected} jobs={jobs} appointments={appointments} onJobs={()=>setScreen('jobs')} onScore={()=>setScreen('score')}/>{vtvDays!==null && vtvDays<=30 && <div className="alert-red"><AlertTriangle/><b>{vtvDays<=0?'Tu VTV está vencida':`Te quedan ${vtvDays} días para que se venza tu VTV`}</b></div>}<div className="form"><h3>Vencimiento de VTV</h3><input type="date" value={vtvDate} onChange={e=>setVtvDate(e.target.value)}/><button onClick={saveVtv}>Guardar vencimiento VTV</button></div><h3>Turnos asignados</h3>{upcomingAppointments.length===0&&<p className="muted">No tenés turnos próximos cargados.</p>}{upcomingAppointments.map(a=><div className="item" key={a.id}><b>{formatDate(a.appointment_date)} · {new Date(a.appointment_date).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</b><small>{a.title} · {a.workshops?.name}</small><p>{a.notes}</p></div>)}<button onClick={()=>setScreen('jobs')}><FileText/>Ver trabajos realizados</button></>}
    </>}
    {screen==='vehicles'&&<><button className="link" onClick={()=>setScreen('home')}><ArrowLeft/>Volver</button><h2>Agregar vehículo</h2><div className="plan-card"><b>{planFree?'Plan gratis':'Cliente PRO'}</b><small>{planFree?`Usados ${vehicles.length}/1 vehículos. Para más vehículos necesitás PRO.`:'Podés asociar múltiples vehículos.'}</small></div><input placeholder="Patente" value={plate} onChange={e=>setPlate(e.target.value)}/><button onClick={addVehicle}>Asociar patente</button>{planFree&&vehicles.length>=1&&<button onClick={()=>setScreen('premium')}><Crown/>Activar Cliente PRO</button>}</>}
    {screen==='jobs'&& !selectedJob && <><button className="link" onClick={()=>setScreen('home')}><ArrowLeft/>Volver al inicio</button><h2>Trabajos realizados</h2>{!selected&&<p className="muted">Seleccioná un vehículo.</p>}{jobs.length===0&&selected&&<p className="muted">Todavía no hay trabajos cargados para este vehículo.</p>}{jobs.map(j=><button className="job-list-btn" key={j.id} onClick={()=>setSelectedJob(j)}><span><b>{j.title}</b><small>{formatDate(j.job_date)} · {j.workshops?.name} · {fmt(j.cost)}</small></span><ChevronRight/></button>)}</>}
    {screen==='jobs'&& selectedJob && <JobDetail job={selectedJob} onBack={()=>setSelectedJob(null)} onPay={pay}/>} 
    {screen==='alerts'&&<ClientAlerts selected={selected} jobs={jobs} appointments={appointments} onBack={()=>setScreen('home')}/>}
    {screen==='score'&&<ClientScore selected={selected} jobs={jobs} onBack={()=>setScreen('home')}/>}
    {screen==='documents'&&<ClientDocuments onBack={()=>setScreen('home')}/>}
    {screen==='sharing'&&<ClientSharing onBack={()=>setScreen('home')}/>}
    {screen==='workshops'&&<ClientWorkshops jobs={jobs} onBack={()=>setScreen('home')}/>}
    {screen==='ai'&&<ClientAI selected={selected} jobs={jobs} onBack={()=>setScreen('home')}/>}
    {screen==='premium'&&<><button className="link" onClick={()=>setScreen('home')}><ArrowLeft/>Volver</button><h2>Cliente PRO</h2><div className="premium-card"><Crown/><h3>Desbloqueá tu garage completo</h3><p>Agregá más de 1 vehículo, alertas avanzadas, historial premium, IA vehicular y futuras funciones pagas.</p><button onClick={activateProDemo}><Crown/>{tr().proDemo}</button><button className="link" onClick={()=>alert('Próximo paso: pago de suscripción Cliente PRO con Mercado Pago.')}>Simular pago de suscripción</button></div></>}
    {screen==='global'&&<GlobalPlatform onBack={()=>setScreen('home')} />}
    <footer>{VERSION}</footer>
  </main>
}
function OnboardingClient({onAdd,onPro}){
  return <section className="onboarding"><h2>Bienvenido a tu identidad vehicular digital</h2><p>Agregá tu primer vehículo, consultá historial, VTV, pagos, turnos y futuras alertas inteligentes.</p><div className="onboard-grid"><article><Car/><b>1. Asociá una patente</b><small>El plan gratis incluye 1 vehículo.</small></article><article><FileText/><b>2. Consultá historial</b><small>Trabajos cargados por talleres conectados.</small></article><article><Crown/><b>3. Activá PRO</b><small>Múltiples vehículos, IA y alertas avanzadas.</small></article></div><button onClick={onAdd}><Plus/>Agregar mi primer vehículo</button><button className="link" onClick={onPro}><Crown/>Ver Cliente PRO</button></section>
}
function VehicleHealth({selected,jobs,appointments,onJobs,onScore}){
  const score=vehicleScore(selected,jobs);
  const pending=jobs.filter(j=>(j.payment_status||'pending')!=='paid').length;
  const vtv=daysUntil(selected?.vtv_expiration_date);
  return <section className="health"><div className="vehicle compact"><Car/><h3>{selected.plate}</h3><p>{selected.brand} {selected.model} {selected.year||''}</p></div><div className="score"><b>{score}/100</b><small>Salud del vehículo</small></div><div className="mini-stats"><article><FileText/><b>{jobs.length}</b><small>Trabajos</small></article><article><CreditCard/><b>{pending}</b><small>Pagos pendientes</small></article><article><CalendarDays/><b>{appointments.length}</b><small>Turnos</small></article><article><ShieldCheck/><b>{vtv===null?'—':vtv}</b><small>Días VTV</small></article></div><div className="quick-actions"><button onClick={onJobs}><FileText/>Historial</button><button onClick={onScore}><Activity/>Ver score</button></div></section>
}
function ClientAlerts({selected,jobs,appointments,onBack}){
  const vtv=daysUntil(selected?.vtv_expiration_date);
  const pending=jobs.filter(j=>(j.payment_status||'pending')!=='paid');
  return <Screen title="Alertas inteligentes" onBack={onBack}><div className="alert-list">{vtv!==null&&vtv<=30&&<div className="alert-red"><AlertTriangle/><b>{vtv<=0?'VTV vencida':`VTV vence en ${vtv} días`}</b></div>}{pending.length>0&&<div className="alert-yellow"><CreditCard/><b>Tenés {pending.length} pago(s) pendiente(s)</b></div>}{appointments.slice(0,3).map(a=><div className="item" key={a.id}><b>Turno: {formatDate(a.appointment_date)}</b><small>{a.title} · {a.workshops?.name}</small></div>)}{vtv===null&&!pending.length&&!appointments.length&&<p className="muted">Sin alertas importantes por ahora.</p>}</div></Screen>
}
function ClientScore({selected,jobs,onBack}){const score=vehicleScore(selected,jobs);return <Screen title="Score del vehículo" onBack={onBack}><div className="score-card"><Activity/><b>{score}/100</b><p>Este puntaje estima la salud del vehículo según VTV, historial cargado, pagos pendientes y frecuencia de mantenimiento.</p></div><div className="cards"><button><Trophy/>Vehículo bien mantenido</button><button><ShieldCheck/>Historial certificado</button><button><Download/>Exportar informe PDF</button></div></Screen>}
function ClientDocuments({onBack}){return <Screen title="Fotos y documentos" onBack={onBack}><div className="premium-card"><Camera/><h3>Archivos del vehículo</h3><p>Próximamente vas a poder guardar fotos, facturas, garantías, comprobantes y documentos de cada trabajo.</p><button><Plus/>Agregar archivo</button></div></Screen>}
function ClientSharing({onBack}){return <Screen title="Vehículo compartido" onBack={onBack}><div className="premium-card"><Share2/><h3>Compartí tu vehículo</h3><p>Invitá familiares, socios o usuarios autorizados para ver historial, turnos y alertas.</p><input placeholder="Email del invitado"/><button><Share2/>Enviar invitación</button></div></Screen>}
function ClientWorkshops({jobs,onBack}){const shops=[...new Map(jobs.map(j=>[j.workshops?.name,j.workshops]).filter(([k])=>k)).values()];return <Screen title="Talleres favoritos" onBack={onBack}>{shops.length===0&&<p className="muted">Todavía no hay talleres vinculados a este vehículo.</p>}{shops.map((w,i)=><div className="item" key={i}><b><Star/> {w.name}</b><small>{fullAddress(w)}</small><a href={mapsUrl(w)} target="_blank" rel="noreferrer">Abrir en Google Maps</a></div>)}</Screen>}
function ClientAI({selected,jobs,onBack}){return <Screen title="IA vehicular" onBack={onBack}><div className="premium-card"><Brain/><h3>Diagnóstico inteligente</h3><p>La IA usará historial, kilometraje y síntomas para orientar mantenimiento preventivo.</p><textarea placeholder="Ej: hace ruido al frenar, vibra en ruta, prende una luz del tablero..."/><button onClick={()=>alert('Próxima versión: IA conectada para diagnóstico inicial.')}>Analizar con IA</button></div><div className="item"><b>Recomendación demo</b><small>{jobs.length?'Revisar próximo service según historial cargado.':'Cargá historial para obtener recomendaciones más precisas.'}</small></div></Screen>}
function Screen({title,onBack,children}){return <section><button className="link" onClick={onBack}><ArrowLeft/>Volver</button><h2>{title}</h2>{children}</section>}
function GlobalPlatform({onBack}){
  const items=[
    {icon:<BadgeCheck/>,title:'Identidad digital del vehículo',text:'Cada patente concentra historial, talleres, kilometraje, VTV, pagos y score sin depender de un solo taller.'},
    {icon:<ScanLine/>,title:'Informe tipo Carfax LATAM',text:'Base para generar reportes de compra/venta y validar mantenimiento, kilómetros y trazabilidad.'},
    {icon:<Globe2/>,title:'Plataforma vehicular total',text:'Ecosistema para clientes, talleres, pagos, turnos, seguros, VTV, grúas, repuestos y servicios.'},
    {icon:<Brain/>,title:'IA vehicular',text:'Diagnóstico inicial, mantenimiento predictivo, presupuesto sugerido y lectura futura de imágenes del tablero.'},
    {icon:<Truck/>,title:'Flotas y empresas',text:'Modo B2B para logística, transporte, remises y empresas con métricas, costos y mantenimientos.'}
  ];
  return <Screen title="Plataforma global" onBack={onBack}><div className="global-grid">{items.map((x,i)=><article className="global-card" key={i}>{x.icon}<h3>{x.title}</h3><p>{x.text}</p><button>Explorar módulo</button></article>)}</div></Screen>
}
function JobDetail({job,onBack,onPay}){
  const w=job.workshops||{};
  return <div className="job"><button className="link" onClick={onBack}><ArrowLeft/>Volver a trabajos</button><h3>{job.title}</h3><p>{job.description||'Sin detalle cargado.'}</p><small>{formatDate(job.job_date)} · {job.km||0} km · {fmt(job.cost)}</small><div className={job.payment_status==='paid'?'paid':'pending'}>{job.payment_status==='paid'?<><CheckCircle2/> Pago acreditado</>:<><Clock3/> Pendiente de pago</>}</div>{job.payment_status!=='paid'&&<button onClick={()=>onPay(job)}><CreditCard/> Pagar con Mercado Pago</button>}<section className="workshop-box"><h3>Datos del taller</h3><p><b>{w.name||'Taller no informado'}</b></p><p>{fullAddress(w)||'Dirección no informada'}</p><a href={mapsUrl(w)} target="_blank" rel="noreferrer"><MapPin/> Abrir en Google Maps</a><a href={whatsappUrl(w.phone)} target="_blank" rel="noreferrer"><Phone/> WhatsApp del taller</a><p><b>Horario:</b> {w.opening_hours||'No informado'}</p></section></div>
}
createRoot(document.getElementById('root')).render(<App/>);