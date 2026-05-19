import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabaseClient';
import { Car, Building2, CalendarDays, CreditCard, FileText, LogOut, Menu, Plus, Search, Trash2, Edit3, MapPin, Phone, ChevronRight, Wrench, BarChart3, Users, CheckCircle2, Clock3, ArrowLeft, AlertTriangle } from 'lucide-react';
import './styles.css';

const VERSION = 'TallerSmart Real MVP v9.0 · Pagos Sandbox';
const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 });
const plateNorm = (p) => (p || '').toUpperCase().replace(/\s|-/g, '');
const toDateInput = (d) => d ? new Date(d).toISOString().slice(0,10) : '';
const daysUntil = (dateValue) => { if(!dateValue) return null; const today=new Date(); today.setHours(0,0,0,0); const d=new Date(dateValue); d.setHours(0,0,0,0); return Math.ceil((d-today)/(1000*60*60*24)); };
const fullAddress = (w) => [w?.address_street || w?.address, w?.address_number, w?.city, w?.state, w?.country].filter(Boolean).join(', ');
const mapsUrl = (w) => { const q = [fullAddress(w), w?.name].filter(Boolean).join(' '); return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || 'taller mecánico')}`; };
const whatsappUrl = (phone) => { const digits=(phone||'').replace(/\D/g,''); return digits ? `https://wa.me/${digits}` : '#'; };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : 'Sin fecha';

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
  return <Shell>{view==='home'&&<Home setView={setView}/>} {view==='login'&&<WorkshopLogin setView={setView} onReady={(w)=>{setWorkshop(w);setView('admin')}}/>} {view==='register'&&<WorkshopRegister setView={setView}/>} {view==='plate'&&<ClientPlate signOut={()=>setView('home')}/>} {view==='admin'&& session && workshop && <AdminDashboard workshop={workshop} signOut={signOut}/>}</Shell>;
}
function Shell({children}){return <div className="app">{children}</div>}
function Home({setView}){return <div className="home"><img src="/logo.png" className="logo"/><h1>TallerSmart</h1><p className="desc">TallerSmart centraliza el historial vehicular entre talleres y clientes, permitiendo trazabilidad, pagos y seguimiento inteligente del mantenimiento.</p><button className="big" onClick={()=>setView('login')}><Building2/><span><b>Ingresar como Taller</b><small>Gestioná tu taller y clientes</small></span><ChevronRight/></button><button className="big" onClick={()=>setView('plate')}><Car/><span><b>Ingresar con Patente</b><small>Consultá el historial de tu vehículo</small></span><ChevronRight/></button><section className="features"><h2>¿Qué ofrece TallerSmart?</h2><div><Feature icon={<FileText/>} t="Historial" d="Accedé al historial completo."/><Feature icon={<CreditCard/>} t="Pagos" d="Pagos y comprobantes."/><Feature icon={<Wrench/>} t="Mantenimiento" d="Seguimiento inteligente."/><Feature icon={<Users/>} t="Conexión" d="Talleres y clientes conectados."/></div></section><footer>{VERSION}</footer></div>}
function Feature({icon,t,d}){return <article>{icon}<b>{t}</b><small>{d}</small></article>}
function WorkshopLogin({setView,onReady}){const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [msg,setMsg]=useState('');async function login(){setMsg('Ingresando...');const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error){setMsg(error.message);return} const pending=JSON.parse(localStorage.getItem('pendingWorkshop')||'null'); let {data:ws}=await supabase.from('workshops').select('*').eq('owner_id',data.user.id).maybeSingle(); if(!ws && pending){const {data:newWs,error:e}=await supabase.from('workshops').insert({...pending,owner_id:data.user.id,email:data.user.email,confirmed:true}).select().single(); if(e){setMsg(e.message);return} localStorage.removeItem('pendingWorkshop'); ws=newWs;} if(!ws){setMsg('Ingresaste, pero falta registrar los datos del taller.');return} onReady(ws)} return <AuthCard title="Ingreso Taller"><input placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={login}>Ingresar</button><p>{msg}</p><button className="link" onClick={()=>setView('register')}>Registrar taller</button><button className="link" onClick={()=>setView('home')}>Volver</button></AuthCard>}
function WorkshopRegister({setView}){const [f,setF]=useState({name:'',email:'',phone:'',address_street:'',address_number:'',city:'',state:'',country:'Argentina',opening_hours:'',mercadopago_alias:'',modo_alias:'',password:''});const [msg,setMsg]=useState('');const set=(k,v)=>setF({...f,[k]:v});async function reg(){setMsg('Creando cuenta...'); localStorage.setItem('pendingWorkshop',JSON.stringify({name:f.name,phone:f.phone,address_street:f.address_street,address_number:f.address_number,city:f.city,state:f.state,country:f.country,opening_hours:f.opening_hours,mercadopago_alias:f.mercadopago_alias,modo_alias:f.modo_alias})); const {error}=await supabase.auth.signUp({email:f.email,password:f.password}); if(error){setMsg(error.message);return} setMsg('Cuenta creada. Si Supabase pide confirmación, revisá tu correo. Luego iniciá sesión.');} return <AuthCard title="Registrar nuevo taller"><input placeholder="Nombre del taller" onChange={e=>set('name',e.target.value)}/><input placeholder="Correo electrónico" onChange={e=>set('email',e.target.value)}/><input placeholder="Teléfono / WhatsApp" onChange={e=>set('phone',e.target.value)}/><input placeholder="Calle" onChange={e=>set('address_street',e.target.value)}/><input placeholder="Número" onChange={e=>set('address_number',e.target.value)}/><input placeholder="Ciudad" onChange={e=>set('city',e.target.value)}/><input placeholder="Provincia / Estado" onChange={e=>set('state',e.target.value)}/><input placeholder="País" defaultValue="Argentina" onChange={e=>set('country',e.target.value)}/><input placeholder="Horario de atención" onChange={e=>set('opening_hours',e.target.value)}/><input placeholder="Alias Mercado Pago" onChange={e=>set('mercadopago_alias',e.target.value)}/><input placeholder="Alias MODO" onChange={e=>set('modo_alias',e.target.value)}/><input placeholder="Contraseña" type="password" onChange={e=>set('password',e.target.value)}/><button onClick={reg}>Crear cuenta</button><p>{msg}</p><button className="link" onClick={()=>setView('login')}>Ya tengo cuenta</button></AuthCard>}
function AuthCard({title,children}){return <div className="auth"><img src="/logo.png"/><h2>{title}</h2>{children}</div>}

function AdminDashboard({workshop,signOut}){const [menu,setMenu]=useState(false);const [section,setSection]=useState('panel');const [clients,setClients]=useState([]);const [jobs,setJobs]=useState([]);const [appointments,setAppointments]=useState([]);const [selected,setSelected]=useState(null);useEffect(()=>{loadAll()},[]);async function loadAll(){const {data:c}=await supabase.from('clients').select('*, vehicles(*)').eq('workshop_id',workshop.id).order('created_at',{ascending:false});setClients(c||[]);const {data:j}=await supabase.from('jobs').select('*, vehicles(*), clients(name), workshops(name,address,address_street,address_number,city,state,country,phone,opening_hours)').eq('workshop_id',workshop.id).order('job_date',{ascending:false});setJobs(j||[]);const {data:a}=await supabase.from('appointments').select('*, vehicles(*), clients(name)').eq('workshop_id',workshop.id).order('appointment_date',{ascending:true});setAppointments(a||[]);}return <div className="dash"><header><button className="icon" onClick={()=>setMenu(!menu)}><Menu/></button><div><b>{workshop.name}</b><small>Panel de taller</small></div><button className="icon" onClick={signOut}><LogOut/></button></header>{menu&&<nav className="drawer"><button onClick={()=>{setSection('clients');setMenu(false)}}>Clientes</button><button onClick={()=>{setSection('jobs');setMenu(false)}}>Trabajos realizados</button><button onClick={()=>{setSection('billing');setMenu(false)}}>Facturación</button><button onClick={()=>{setSection('turns');setMenu(false)}}>Turnos</button></nav>} {section==='panel'&&<Panel clients={clients} jobs={jobs} appointments={appointments} setSection={setSection}/>} {section==='clients'&&<Clients clients={clients} workshop={workshop} reload={loadAll} selected={selected} setSelected={setSelected}/>} {section==='jobs'&&<Jobs jobs={jobs}/>} {section==='billing'&&<Billing jobs={jobs}/>} {section==='turns'&&<Turns workshop={workshop} clients={clients} appointments={appointments} reload={loadAll}/>}<footer>{VERSION}</footer></div>}
function Panel({clients,jobs,appointments,setSection}){const pending=jobs.filter(j=>j.payment_status!=='paid').length;return <main><div className="stats"><Stat n={clients.length} t="Clientes"/><Stat n={pending} t="Pagos pendientes"/><Stat n={jobs.length} t="Trabajos"/><Stat n={appointments.length} t="Turnos"/></div><div className="cards"><button onClick={()=>setSection('clients')}>Gestionar clientes</button><button onClick={()=>setSection('jobs')}>Ver trabajos</button><button onClick={()=>setSection('billing')}>Facturación</button><button onClick={()=>setSection('turns')}>Turnos</button></div></main>}
function Stat({n,t}){return <div className="stat"><b>{n}</b><small>{t}</small></div>}
function Clients({clients,workshop,reload,selected,setSelected}){const [mode,setMode]=useState('menu');const [q,setQ]=useState('');const shown=clients.filter(c=>(c.name+c.vehicles?.plate).toLowerCase().includes(q.toLowerCase()));return <main>{mode==='menu'&&<div className="cards"><button onClick={()=>setMode('new')}><Plus/>Nuevo cliente</button><button onClick={()=>setMode('search')}><Search/>Buscar cliente</button></div>}{mode==='new'&&<ClientForm workshop={workshop} reload={()=>{reload();setMode('search')}}/>}{mode==='search'&&<><input placeholder="Buscar por patente o cliente" value={q} onChange={e=>setQ(e.target.value)}/>{shown.map(c=><div className="item" key={c.id} onClick={()=>setSelected(c)}><b>{c.name}</b><small>{c.vehicles?.plate} · {c.vehicles?.brand} {c.vehicles?.model}</small></div>)}{selected&&<ClientDetail client={selected} workshop={workshop} reload={reload}/>}</>}<button className="link" onClick={()=>setMode('menu')}>Volver a Clientes</button></main>}
function ClientForm({workshop,reload}){const [f,setF]=useState({name:'',phone:'',email:'',plate:'',brand:'',model:'',year:'',current_km:''});const [msg,setMsg]=useState('');const set=(k,v)=>setF({...f,[k]:v});async function save(){setMsg('Guardando...'); const plate=plateNorm(f.plate); let {data:v}=await supabase.from('vehicles').select('*').eq('plate',plate).maybeSingle(); if(!v){const res=await supabase.from('vehicles').insert({plate,brand:f.brand,model:f.model,year:f.year||null,current_km:f.current_km||0}).select().single(); if(res.error){setMsg(res.error.message);return} v=res.data;} const {error}=await supabase.from('clients').insert({workshop_id:workshop.id,vehicle_id:v.id,name:f.name,phone:f.phone,email:f.email}); if(error){setMsg(error.message);return} setMsg('Cliente guardado'); reload();}return <div className="form"><h3>Nuevo cliente</h3>{['name','phone','email','plate','brand','model','year','current_km'].map(k=><input key={k} placeholder={k} onChange={e=>set(k,e.target.value)}/>)}<button onClick={save}>Guardar cliente</button><p>{msg}</p></div>}
function ClientDetail({client,workshop,reload}){const [edit,setEdit]=useState(false);const [name,setName]=useState(client.name);const [work,setWork]=useState({title:'',description:'',km:client.vehicles?.current_km||0,cost:''});async function del(){if(!confirm('¿Eliminar cliente?'))return; await supabase.from('clients').delete().eq('id',client.id); reload()}async function upd(){await supabase.from('clients').update({name}).eq('id',client.id);setEdit(false);reload()}async function addJob(){await supabase.from('jobs').insert({workshop_id:workshop.id,vehicle_id:client.vehicle_id,client_id:client.id,title:work.title,description:work.description,km:work.km,cost:work.cost||0,payment_status:'pending'}); reload(); alert('Trabajo cargado')}return <div className="detail"><h3>{client.name}</h3>{edit?<><input value={name} onChange={e=>setName(e.target.value)}/><button onClick={upd}>Guardar edición</button></>:<button onClick={()=>setEdit(true)}><Edit3/>Editar cliente</button>}<button className="danger" onClick={del}><Trash2/>Eliminar cliente</button><h3>Cargar trabajo</h3><input placeholder="Trabajo" onChange={e=>setWork({...work,title:e.target.value})}/><textarea placeholder="Detalle" onChange={e=>setWork({...work,description:e.target.value})}/><input placeholder="Km" type="number" onChange={e=>setWork({...work,km:e.target.value})}/><input placeholder="Costo" type="number" onChange={e=>setWork({...work,cost:e.target.value})}/><button onClick={addJob}>Agregar al historial</button></div>}
function Jobs({jobs}){return <main><h2>Trabajos realizados</h2>{jobs.map(j=><div className="item" key={j.id}><b>{j.title}</b><small>{j.clients?.name||'Cliente'} · {j.vehicles?.plate} · {fmt(j.cost)} · {j.payment_status==='paid'?'Pago acreditado':'Pendiente'}</small><p>{j.description}</p></div>)}</main>}
function Billing({jobs}){const total=jobs.reduce((a,j)=>a+Number(j.cost||0),0), paid=jobs.filter(j=>j.payment_status==='paid').reduce((a,j)=>a+Number(j.cost||0),0);return <main><h2>Facturación</h2><div className="stats"><Stat n={fmt(total)} t="Total trabajos"/><Stat n={fmt(paid)} t="Cobrado"/><Stat n={fmt(total-paid)} t="Pendiente"/></div><Jobs jobs={jobs}/></main>}
function Turns({workshop,clients,appointments,reload}){const [f,setF]=useState({client_id:'',title:'',appointment_date:'',notes:''});async function save(){const c=clients.find(x=>x.id===f.client_id); if(!c)return; await supabase.from('appointments').insert({workshop_id:workshop.id,client_id:c.id,vehicle_id:c.vehicle_id,title:f.title,appointment_date:f.appointment_date,notes:f.notes}); reload()}return <main><h2>Turnos</h2><div className="form"><select onChange={e=>setF({...f,client_id:e.target.value})}><option>Seleccionar cliente</option>{clients.map(c=><option value={c.id} key={c.id}>{c.name} - {c.vehicles?.plate}</option>)}</select><input placeholder="Motivo" onChange={e=>setF({...f,title:e.target.value})}/><input type="datetime-local" onChange={e=>setF({...f,appointment_date:e.target.value})}/><textarea placeholder="Notas" onChange={e=>setF({...f,notes:e.target.value})}/><button onClick={save}>Asignar turno</button></div>{appointments.map(a=><div className="item" key={a.id}><b>{new Date(a.appointment_date).toLocaleString('es-AR')}</b><small>{a.clients?.name} · {a.vehicles?.plate} · {a.title}</small></div>)}</main>}
function ClientPlate({signOut}){
  const [plate,setPlate]=useState(localStorage.getItem('clientPlate')||'');
  const [vehicle,setVehicle]=useState(null);
  const [jobs,setJobs]=useState([]);
  const [appointments,setAppointments]=useState([]);
  const [msg,setMsg]=useState('');
  const [menu,setMenu]=useState(false);
  const [screen,setScreen]=useState('login');
  const [selectedJob,setSelectedJob]=useState(null);
  const [vtvDate,setVtvDate]=useState('');

  useEffect(()=>{ if(localStorage.getItem('clientPlate')) search(localStorage.getItem('clientPlate'), true); },[]);

  async function search(value=plate, silent=false){
    if(!value){ setMsg('Ingresá una patente.'); return; }
    setMsg(silent?'':'Buscando...'); setVehicle(null); setJobs([]); setAppointments([]); setSelectedJob(null);
    const normalized = plateNorm(value);
    const {data:v,error:vehErr}=await supabase.from('vehicles').select('*').eq('plate',normalized).maybeSingle();
    if(vehErr){ setMsg(vehErr.message); return; }
    if(!v){ setMsg('No encontramos historial para esa patente.'); return; }
    localStorage.setItem('clientPlate', normalized);
    setPlate(normalized); setVehicle(v); setVtvDate(toDateInput(v.vtv_expiration_date));
    const {data:j,error:jErr}=await supabase.from('jobs').select('*, workshops(name,address,address_street,address_number,city,state,country,phone,opening_hours)').eq('vehicle_id',v.id).order('job_date',{ascending:false});
    if(jErr){ setMsg(jErr.message); return; }
    const {data:a,error:aErr}=await supabase.from('appointments').select('*, workshops(name,address,address_street,address_number,city,state,country,phone,opening_hours), clients(name)').eq('vehicle_id',v.id).order('appointment_date',{ascending:true});
    if(aErr){ console.warn(aErr); }
    setJobs(j||[]); setAppointments(a||[]); setMsg(''); setScreen('home');
  }

  async function logoutClient(){ localStorage.removeItem('clientPlate'); setPlate(''); setVehicle(null); setJobs([]); setAppointments([]); setMsg(''); setMenu(false); setScreen('login'); }
  async function pay(job){
    try{
      const res = await fetch('/api/create-payment-preference', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ jobId: job.id, title: job.title, description: job.description, amount: Number(job.cost || 0), plate })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'No se pudo crear el pago');
      window.location.href = data.init_point;
    }catch(e){ alert(e.message); }
  }
  async function saveVtv(){ if(!vehicle) return; const {error}=await supabase.from('vehicles').update({vtv_expiration_date: vtvDate || null}).eq('id',vehicle.id); if(error){ alert(error.message); return; } await search(plate,true); alert('Vencimiento de VTV guardado'); }

  if(screen==='login') return <main className="client"><button className="link" onClick={signOut}>Volver</button><h2>Ingreso cliente</h2><p className="muted">Ingresá la patente para consultar el historial, turnos y datos del vehículo.</p><input placeholder="Ej: AB123CD" value={plate} onChange={e=>setPlate(e.target.value)}/><button onClick={()=>search()}><Car/>Ingresar con patente</button><p>{msg}</p><footer>{VERSION}</footer></main>;

  const vtvDays = daysUntil(vehicle?.vtv_expiration_date);
  const upcomingAppointments = appointments.filter(a=>new Date(a.appointment_date)>=new Date()).slice(0,5);

  return <main className="client client-session">
    <header className="client-top"><button className="icon" onClick={()=>setMenu(!menu)}><Menu/></button><div><b>{vehicle?.plate}</b><small>Panel del cliente</small></div><button className="icon" onClick={logoutClient}><LogOut/></button></header>
    {menu&&<nav className="drawer client-drawer"><button onClick={()=>{setScreen('jobs');setMenu(false)}}><FileText/>Trabajos realizados</button><button onClick={()=>{setScreen('home');setMenu(false)}}><Car/>Inicio del vehículo</button></nav>}

    {screen==='home'&&<>
      <div className="vehicle"><Car/><h3>{vehicle.plate}</h3><p>{vehicle.brand} {vehicle.model} {vehicle.year||''}</p></div>
      {vtvDays!==null && vtvDays<=30 && <div className="alert-red"><AlertTriangle/><b>{vtvDays<=0?'Tu VTV está vencida':`Te quedan ${vtvDays} días para que se venza tu VTV`}</b></div>}
      <div className="form"><h3>Vencimiento de VTV</h3><p className="muted">Cargá o actualizá la fecha para ver recordatorios en el inicio.</p><input type="date" value={vtvDate} onChange={e=>setVtvDate(e.target.value)}/><button onClick={saveVtv}>Guardar vencimiento VTV</button></div>
      <h3>Turnos asignados</h3>
      {upcomingAppointments.length===0 && <p className="muted">No tenés turnos próximos cargados.</p>}
      {upcomingAppointments.map(a=><div className="item" key={a.id}><b>{formatDate(a.appointment_date)} · {new Date(a.appointment_date).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</b><small>{a.title} · {a.workshops?.name}</small><p>{a.notes}</p></div>)}
      <button onClick={()=>setScreen('jobs')}><FileText/>Ver trabajos realizados</button>
    </>}

    {screen==='jobs'&& !selectedJob && <><button className="link" onClick={()=>setScreen('home')}><ArrowLeft/>Volver al inicio</button><h2>Trabajos realizados</h2>{jobs.length===0&&<p className="muted">Todavía no hay trabajos cargados para este vehículo.</p>}{jobs.map(j=><button className="job-list-btn" key={j.id} onClick={()=>setSelectedJob(j)}><span><b>{j.title}</b><small>{formatDate(j.job_date)} · {j.workshops?.name} · {fmt(j.cost)}</small></span><ChevronRight/></button>)}</>}

    {screen==='jobs'&& selectedJob && <JobDetail job={selectedJob} onBack={()=>setSelectedJob(null)} onPay={pay}/>} 
    <footer>{VERSION}</footer>
  </main>
}

function JobDetail({job,onBack,onPay}){
  const w=job.workshops||{};
  return <div className="job"><button className="link" onClick={onBack}><ArrowLeft/>Volver a trabajos</button><h3>{job.title}</h3><p>{job.description||'Sin detalle cargado.'}</p><small>{formatDate(job.job_date)} · {job.km||0} km · {fmt(job.cost)}</small><div className={job.payment_status==='paid'?'paid':'pending'}>{job.payment_status==='paid'?<><CheckCircle2/> Pago acreditado</>:<><Clock3/> Pendiente de pago</>}</div>{job.payment_status!=='paid'&&<button onClick={()=>onPay(job)}><CreditCard/> Pagar con Mercado Pago</button>}<section className="workshop-box"><h3>Datos del taller</h3><p><b>{w.name||'Taller no informado'}</b></p><p>{fullAddress(w)||'Dirección no informada'}</p><a href={mapsUrl(w)} target="_blank" rel="noreferrer"><MapPin/> Abrir en Google Maps</a><a href={whatsappUrl(w.phone)} target="_blank" rel="noreferrer"><Phone/> WhatsApp del taller</a><p><b>Horario:</b> {w.opening_hours||'No informado'}</p></section></div>
}
createRoot(document.getElementById('root')).render(<App/>);
