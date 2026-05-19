import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Car, CalendarClock, ClipboardList, Plus, UserRound, Wrench, Search, ShieldCheck, Save, LogIn, Trash2, Pencil, Building2, LogOut, MailCheck, MapPin, Phone, Clock, UserPlus, Eye, EyeOff, CreditCard, CheckCircle2, Wallet, ChevronRight, FileText, Users, Shield, Home } from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'tallersmart_demo_pro_v5';

const seed = {
  workshops: [
    { id: 1, name: 'Taller Centro', email: 'centro@demo.com', password: '1234', phone: '2215551234', address: 'Plaza Moreno, La Plata, Buenos Aires', hours: 'Lunes a viernes 8:00 a 18:00', confirmed: true, confirmCode: '111111', mercadoPagoAlias: 'tallercentro', modoAlias: 'tallercentro', cbu: '0000003100012345678901' },
    { id: 2, name: 'Taller Ruta 2', email: 'ruta2@demo.com', password: '1234', phone: '2245559876', address: 'Ruta 2 Km 200, Dolores, Buenos Aires', hours: 'Lunes a sábado 9:00 a 17:00', confirmed: true, confirmCode: '222222', mercadoPagoAlias: 'tallerruta2', modoAlias: 'tallerruta2', cbu: '0000003100098765432109' },
  ],
  clients: [
    { id: 1, workshopId: 1, name: 'Juan Pérez', phone: '221 555-1234', email: 'juan@email.com', vehicle: 'Toyota Corolla 2018', plate: 'AB123CD', km: 84200, nextServiceKm: 90000, nextServiceDate: '2026-07-10' },
    { id: 2, workshopId: 1, name: 'María Gómez', phone: '11 6026-4052', email: 'maria@email.com', vehicle: 'Ford Ranger 2020', plate: 'AC456EF', km: 119500, nextServiceKm: 120000, nextServiceDate: '2026-05-30' },
    { id: 3, workshopId: 2, name: 'Juan Pérez', phone: '221 555-1234', email: 'juan@email.com', vehicle: 'Toyota Corolla 2018', plate: 'AB123CD', km: 86000, nextServiceKm: 90000, nextServiceDate: '2026-07-10' },
  ],
  works: [
    { id: 1, plate: 'AB123CD', workshopId: 1, date: '2026-04-12', title: 'Cambio de aceite y filtros', km: 81000, cost: '$95.000', paymentStatus: 'pending', paidAt: '' },
    { id: 2, plate: 'AB123CD', workshopId: 1, date: '2025-12-02', title: 'Pastillas de freno delanteras', km: 76000, cost: '$130.000', paymentStatus: 'pending', paidAt: '' },
    { id: 3, plate: 'AC456EF', workshopId: 1, date: '2026-02-20', title: 'Service completo', km: 110000, cost: '$210.000', paymentStatus: 'pending', paidAt: '' },
    { id: 4, plate: 'AB123CD', workshopId: 2, date: '2026-05-02', title: 'Reparación de pérdida de agua', km: 86000, cost: '$75.000', paymentStatus: 'pending', paidAt: '' },
  ],
};

function cleanPlate(value = '') { return value.replace(/\s|-/g, '').toUpperCase(); }
function statusFor(c) {
  const kmLeft = Number(c.nextServiceKm || 0) - Number(c.km || 0);
  const daysLeft = Math.ceil((new Date(c.nextServiceDate) - new Date()) / 86400000);
  if (kmLeft <= 1000 || daysLeft <= 15) return 'Urgente';
  if (kmLeft <= 5000 || daysLeft <= 45) return 'Próximo';
  return 'Normal';
}
function badgeClass(s) { return `badge ${s.toLowerCase()}`; }
function money(v){ return v || '$0'; }
function randomCode(){ return String(Math.floor(100000 + Math.random() * 900000)); }
function whatsappLink(phone=''){
  const digits = phone.replace(/\D/g,'');
  const normalized = digits.startsWith('54') ? digits : `549${digits}`;
  return `https://wa.me/${normalized}`;
}
function mapsLink(address=''){
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
function parseAmount(cost=''){
  const n = String(cost).replace(/[^0-9]/g,'');
  return Number(n || 0);
}
function mercadoPagoLink(shop){
  if(!shop?.mercadoPagoAlias) return 'https://www.mercadopago.com.ar/';
  return `https://link.mercadopago.com.ar/${shop.mercadoPagoAlias}`;
}
function modoLink(shop){
  const q = encodeURIComponent(`${shop?.modoAlias || shop?.name || ''} ${shop?.cbu || ''}`);
  return `https://modo.com.ar/?q=${q}`;
}
function formatPaidDate(value){
  if(!value) return '';
  return new Date(value).toLocaleString('es-AR', { dateStyle:'short', timeStyle:'short' });
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>;
}


function HomeScreen({ setMode }) {
  return <main className="home-screen">
    <section className="welcome-card">
      <img className="home-logo" src="/logo.png" alt="TallerSmart" />
      <h1>TallerSmart</h1>
      <p className="home-description">TallerSmart centraliza el historial vehicular entre talleres y clientes, permitiendo trazabilidad, pagos y seguimiento inteligente del mantenimiento.</p>
      <div className="home-actions">
        <button className="home-action" onClick={()=>setMode('admin')}><span className="home-icon"><Building2 size={38}/></span><span><strong>Ingresar como Taller</strong><small>Gestioná tu taller y clientes</small></span><ChevronRight size={34}/></button>
        <button className="home-action" onClick={()=>setMode('client')}><span className="home-icon"><Car size={40}/></span><span><strong>Ingresar con Patente</strong><small>Consultá el historial de tu vehículo</small></span><ChevronRight size={34}/></button>
        <button className="home-action" onClick={()=>setMode('register')}><span className="home-icon"><UserPlus size={40}/></span><span><strong>Registrar nuevo Taller</strong><small>Sumá tu taller a TallerSmart</small></span><ChevronRight size={34}/></button>
      </div>
    </section>
    <section className="features-section">
      <h2>¿Qué ofrece TallerSmart?</h2>
      <div className="features-grid">
        <div className="feature"><div><FileText/></div><strong>Historial</strong><p>Accedé al historial completo de tu vehículo.</p></div>
        <div className="feature"><div><CreditCard/></div><strong>Pagos</strong><p>Pagos seguros y comprobantes en un solo lugar.</p></div>
        <div className="feature"><div><Wrench/></div><strong>Mantenimiento</strong><p>Seguimiento de próximos servicios.</p></div>
        <div className="feature"><div><Users/></div><strong>Conexión</strong><p>Talleres y clientes conectados de forma inteligente.</p></div>
      </div>
    </section>
    <section className="security-banner"><Shield/><div><strong>Seguro, simple y siempre disponible</strong><p>Tu información y la de tu vehículo está protegida 24/7.</p></div></section>
  </main>
}

function Header({ mode, setMode, admin, clientPlate, onAdminLogout, onClientLogout }) {
  return <header className="header"><div className="header-inner"><button className="brand brand-button" onClick={()=>setMode('home')}><img className="brand-logo" src="/logo.png" alt="TallerSmart"/><div><h1>TallerSmart</h1><p>{admin ? `${admin.name} · ${admin.email}` : clientPlate ? `Cliente · patente ${clientPlate}` : 'Demo PRO · Historial vehicular'}</p></div></button><div className="role-buttons"><button onClick={()=>setMode('home')}><Home size={16}/> Inicio</button><button className={mode==='admin'?'active':''} onClick={()=>setMode('admin')}>Taller</button><button className={mode==='client'?'active':''} onClick={()=>setMode('client')}>Patente</button>{admin && <button onClick={onAdminLogout}><LogOut size={16}/> Salir</button>}{clientPlate && mode==='client' && <button onClick={onClientLogout}><LogOut size={16}/> Salir</button>}</div></div></header>;
}

function AdminAuth({ data, setData, onLogin }) {
  const [screen,setScreen]=useState('login');
  if(screen==='register') return <AdminRegister data={data} setData={setData} goLogin={()=>setScreen('login')} />;
  return <AdminLogin data={data} onLogin={onLogin} goRegister={()=>setScreen('register')} />;
}

function AdminLogin({ data, onLogin, goRegister }) {
  const [email,setEmail]=useState('centro@demo.com'); const [pass,setPass]=useState('1234'); const [err,setErr]=useState(''); const [show,setShow]=useState(false);
  const submit=()=>{ const w=data.workshops.find(x=>x.email.toLowerCase()===email.toLowerCase() && x.password===pass); if(!w){setErr('Correo o contraseña incorrectos. Demo: centro@demo.com / 1234'); return;} if(!w.confirmed){setErr('La cuenta todavía no está confirmada. Registrate nuevamente o ingresá el código de confirmación.'); return;} setErr(''); onLogin(w); };
  return <div className="login"><div className="card"><h2>Ingreso administrador</h2><p>Cada taller entra con correo y contraseña, y solo ve sus propios clientes.</p><Field label="Correo electrónico" value={email} onChange={setEmail}/><label className="field"><span>Contraseña</span><div className="password-row"><input type={show?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} /><button onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>{err&&<p className="error">{err}</p>}<button className="primary full" onClick={submit}><LogIn size={18}/> Entrar</button><button className="outline full" onClick={goRegister}><UserPlus size={18}/> Registrar nuevo taller</button><p className="hint">Usuarios demo: centro@demo.com / 1234 — ruta2@demo.com / 1234</p></div></div>;
}

function AdminRegister({ data, setData, goLogin }) {
  const [step,setStep]=useState('form');
  const [code,setCode]=useState('');
  const [typed,setTyped]=useState('');
  const [error,setError]=useState('');
  const [form,setForm]=useState({ name:'', email:'', phone:'', address:'', hours:'', mercadoPagoAlias:'', modoAlias:'', cbu:'', password:'' });
  const set=(k,v)=>setForm({...form,[k]:v});
  const submit=()=>{
    if(!form.name || !form.email || !form.phone || !form.address || !form.hours || !form.password) return setError('Completá los datos obligatorios del taller.');
    if(data.workshops.some(w=>w.email.toLowerCase()===form.email.toLowerCase())) return setError('Ese correo ya está registrado.');
    const generated=randomCode();
    const workshop={ id: Date.now(), ...form, confirmed:false, confirmCode: generated };
    setData({...data, workshops:[workshop,...data.workshops]});
    setCode(generated); setError(''); setStep('verify');
  };
  const verify=()=>{
    if(typed!==code) return setError('Código incorrecto. Revisá los 6 dígitos.');
    setData({...data, workshops:data.workshops.map(w=>w.email===form.email?{...w,confirmed:true}:w)});
    setStep('done'); setError('');
  };
  return <div className="login"><div className="card"><h2>Registro de taller</h2>{step==='form'&&<><p>Completá los datos del administrador/taller.</p><div className="grid2"><Field label="Nombre del taller" value={form.name} onChange={v=>set('name',v)} /><Field label="Correo electrónico" value={form.email} onChange={v=>set('email',v)} /><Field label="Teléfono" value={form.phone} onChange={v=>set('phone',v)} /><Field label="Dirección" value={form.address} onChange={v=>set('address',v)} /><Field label="Horario de atención" value={form.hours} onChange={v=>set('hours',v)} placeholder="Ej: Lun a vie 8 a 18" /><Field label="Alias Mercado Pago" value={form.mercadoPagoAlias} onChange={v=>set('mercadoPagoAlias',v)} placeholder="Ej: mitaller" /><Field label="Alias MODO" value={form.modoAlias} onChange={v=>set('modoAlias',v)} placeholder="Ej: mitaller" /><Field label="CBU/CVU de cobro" value={form.cbu} onChange={v=>set('cbu',v)} placeholder="Opcional" /><Field label="Contraseña" type="password" value={form.password} onChange={v=>set('password',v)} /></div>{error&&<p className="error">{error}</p>}<button className="primary full" onClick={submit}><MailCheck size={18}/> Enviar código de confirmación</button><button className="outline full" onClick={goLogin}>Ya tengo cuenta</button></>}{step==='verify'&&<><div className="success-box"><MailCheck/><div><strong>Código enviado al correo</strong><p>Modo prueba: como todavía no hay servidor de email real, el código demo es <b>{code}</b>.</p></div></div><Field label="Código de 6 dígitos" value={typed} onChange={setTyped} placeholder="123456" />{error&&<p className="error">{error}</p>}<button className="primary full" onClick={verify}>Confirmar cuenta</button></>}{step==='done'&&<><div className="success-box"><ShieldCheck/><div><strong>Cuenta confirmada</strong><p>Tu taller ya puede ingresar con correo y contraseña.</p></div></div><button className="primary full" onClick={goLogin}>Ir al ingreso</button></>}</div></div>;
}

const emptyForm = { name:'', phone:'', email:'', vehicle:'', plate:'', km:'', nextServiceKm:'', nextServiceDate:'' };
function ClientForm({ editing, onSave, onCancel }) {
  const [f,setF]=useState(editing || emptyForm);
  useEffect(()=>setF(editing || emptyForm),[editing]);
  const set=(k,v)=>setF({...f,[k]:v});
  const save=()=>{ if(!f.name || !f.plate || !f.vehicle) return alert('Completá nombre, patente y vehículo'); onSave({...f, plate: cleanPlate(f.plate), km:Number(f.km||0), nextServiceKm:Number(f.nextServiceKm||0)}); if(!editing) setF(emptyForm); };
  return <div className="card"><h3>{editing?'Editar cliente':'Nuevo cliente'}</h3><div className="grid2"><Field label="Nombre" value={f.name} onChange={v=>set('name',v)}/><Field label="Teléfono" value={f.phone} onChange={v=>set('phone',v)}/><Field label="Email" value={f.email} onChange={v=>set('email',v)}/><Field label="Vehículo" value={f.vehicle} onChange={v=>set('vehicle',v)} placeholder="Ej: Corolla 2018"/><Field label="Patente" value={f.plate} onChange={v=>set('plate',v)}/><Field label="Km actual" type="number" value={f.km} onChange={v=>set('km',v)}/><Field label="Próximo service en km" type="number" value={f.nextServiceKm} onChange={v=>set('nextServiceKm',v)}/><Field label="Fecha próximo service" type="date" value={f.nextServiceDate} onChange={v=>set('nextServiceDate',v)}/></div><div className="actions"><button className="primary" onClick={save}><Save size={18}/> Guardar</button>{editing&&<button className="outline" onClick={onCancel}>Cancelar</button>}</div></div>;
}

function AdminPanel({ data, setData, admin, refreshAdmin }) {
  const myClients = data.clients.filter(c=>c.workshopId===admin.id);
  const [selected,setSelected]=useState(myClients[0]||null); const [editing,setEditing]=useState(null); const [q,setQ]=useState('');
  useEffect(()=>{ if(selected && !data.clients.find(c=>c.id===selected.id)) setSelected(myClients[0]||null); },[data]);
  const filtered=myClients.filter(c=>`${c.name} ${c.plate} ${c.vehicle}`.toLowerCase().includes(q.toLowerCase()));
  const saveClient=(client)=>{
    if(client.id){ const updated={...client, workshopId:admin.id}; setData({...data, clients:data.clients.map(c=>c.id===client.id?updated:c)}); setSelected(updated); setEditing(null); }
    else { const n={...client,id:Date.now(),workshopId:admin.id}; setData({...data,clients:[n,...data.clients]}); setSelected(n); }
  };
  const del=(id)=>{ if(!confirm('¿Eliminar este cliente de este taller? El historial cargado del vehículo queda disponible por patente.')) return; setData({...data, clients:data.clients.filter(c=>c.id!==id)}); };
  const addWork=(work)=>{ if(!selected) return; const plate=cleanPlate(selected.plate); const w={id:Date.now(), plate, workshopId:admin.id, ...work, km:Number(work.km||selected.km), paymentStatus:'pending', paidAt:''}; const clients=data.clients.map(c=>c.id===selected.id?{...c,km:w.km}:c); setData({...data, clients, works:[w,...data.works]}); setSelected({...selected,km:w.km}); };
  const works = selected ? data.works.filter(w=>cleanPlate(w.plate)===cleanPlate(selected.plate)).sort((a,b)=>new Date(b.date)-new Date(a.date)) : [];
  return <main className="layout"><section className="sidebar"><div className="card"><div className="panel-title"><div><h2>Panel del taller</h2><p>Solo ves clientes cargados por {admin.name}.</p></div><ShieldCheck/></div><div className="shop-data"><p><MapPin size={14}/> {admin.address}</p><p><Phone size={14}/> {admin.phone}</p><p><Clock size={14}/> {admin.hours}</p><p><CreditCard size={14}/> Mercado Pago: {admin.mercadoPagoAlias || 'sin cargar'}</p><p><Wallet size={14}/> MODO: {admin.modoAlias || 'sin cargar'}</p></div><div className="stats"><div className="stat"><strong>{myClients.length}</strong><span>Clientes</span></div><div className="stat"><strong>{myClients.filter(c=>statusFor(c)==='Urgente').length}</strong><span>Urgentes</span></div><div className="stat"><strong>{data.works.filter(w=>w.workshopId===admin.id).length}</strong><span>Trabajos</span></div></div></div><ClientForm editing={editing} onSave={saveClient} onCancel={()=>setEditing(null)}/><div className="card"><div className="search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar cliente, patente o vehículo"/></div><div className="client-list">{filtered.map(c=><button key={c.id} className={`client-item ${selected?.id===c.id?'selected':''}`} onClick={()=>setSelected(c)}><div><strong>{c.name}</strong><span className={badgeClass(statusFor(c))}>{statusFor(c)}</span></div><p>{c.vehicle}</p><small>Patente {c.plate}</small></button>)}</div></div></section><section className="detail">{selected ? <VehicleDetail client={selected} works={works} data={data} admin onEdit={()=>setEditing(selected)} onDelete={()=>del(selected.id)} onAddWork={addWork}/> : <div className="card">Cargá o seleccioná un cliente.</div>}</section></main>;
}

function WorkForm({ onAddWork, km }) { const [w,setW]=useState({title:'',date:new Date().toISOString().slice(0,10),km:km||'',cost:''}); useEffect(()=>setW(x=>({...x,km:km||''})),[km]); const set=(k,v)=>setW({...w,[k]:v}); return <div className="card"><h3>Registrar trabajo realizado</h3><div className="grid4"><Field label="Trabajo" value={w.title} onChange={v=>set('title',v)} placeholder="Ej: Cambio de aceite"/><Field label="Fecha" type="date" value={w.date} onChange={v=>set('date',v)}/><Field label="Km" type="number" value={w.km} onChange={v=>set('km',v)}/><Field label="Costo" value={w.cost} onChange={v=>set('cost',v)} placeholder="$"/></div><button className="primary" onClick={()=>{ if(!w.title)return alert('Cargá el trabajo'); onAddWork(w); setW({title:'',date:new Date().toISOString().slice(0,10),km:w.km,cost:''}); }}><Plus size={18}/> Agregar al historial</button></div> }

function VehicleDetail({ client, works, data, admin=false, onEdit, onDelete, onAddWork, onMarkPaid }) {
  const kmLeft=Number(client.nextServiceKm||0)-Number(client.km||0);
  return <><div className="card hero"><div className="hero-top"><div><span>{admin?'Ficha del cliente':'Vehículo'}</span><h2>{client.vehicle}</h2><p>Patente {client.plate}</p></div><Car size={42}/></div><div className="info-grid"><Info icon={<UserRound/>} label="Cliente" value={client.name}/><Info icon={<ClipboardList/>} label="Km actual" value={`${Number(client.km||0).toLocaleString('es-AR')} km`}/><Info icon={<CalendarClock/>} label="Próximo service" value={client.nextServiceDate||'Sin fecha'}/></div>{admin&&<div className="admin-actions"><button className="outline" onClick={onEdit}><Pencil size={16}/> Editar cliente</button><button className="danger" onClick={onDelete}><Trash2 size={16}/> Eliminar cliente</button></div>}</div><div className="card"><div className="between"><div><h3>Mantenimiento pendiente</h3><p>Aviso calculado por km y fecha.</p></div><span className={badgeClass(statusFor(client))}>{statusFor(client)}</span></div><div className="km-box"><span>Faltan aproximadamente</span><strong>{kmLeft.toLocaleString('es-AR')} km</strong><span>para el service de {Number(client.nextServiceKm||0).toLocaleString('es-AR')} km.</span></div></div>{admin&&<WorkForm onAddWork={onAddWork} km={client.km}/>}<History works={works} data={data} canPay={!admin} onMarkPaid={onMarkPaid}/></>;
}
function Info({ icon,label,value }){ return <div className="info"><div>{icon}</div><span>{label}</span><strong>{value}</strong></div>; }
function WorkshopDetails({ shop }){
  if(!shop) return null;
  return <div className="workshop-details"><p><Building2 size={16}/><b>{shop.name}</b></p><p><MapPin size={16}/><a href={mapsLink(shop.address)} target="_blank" rel="noreferrer">{shop.address}</a></p><p><Phone size={16}/><a href={whatsappLink(shop.phone)} target="_blank" rel="noreferrer">Enviar WhatsApp</a> · {shop.phone}</p><p><Clock size={16}/>{shop.hours}</p></div>;
}
function PaymentBox({ work, shop, onMarkPaid }){
  const [open,setOpen]=useState(false);
  const paid = work.paymentStatus === 'paid';
  if(paid) return <div className="payment-paid"><CheckCircle2 size={16}/> Pago acreditado {work.paidAt ? `· ${formatPaidDate(work.paidAt)}` : ''}</div>;
  if(!onMarkPaid) return <div className="payment-pending"><CreditCard size={16}/> Pendiente de pago</div>;
  return <div className="payment-box"><button className="pay-button" onClick={()=>setOpen(!open)}><CreditCard size={16}/> Pagar {money(work.cost)}</button>{open&&<div className="payment-options"><p>Importe preseleccionado por el taller: <b>{money(work.cost)}</b></p><a className="pay-link" href={mercadoPagoLink(shop)} target="_blank" rel="noreferrer">Abrir Mercado Pago</a><a className="pay-link" href={modoLink(shop)} target="_blank" rel="noreferrer">Abrir MODO</a><button className="primary small" onClick={()=>onMarkPaid(work.id)}>Simular pago acreditado</button><small>Modo prueba: en la versión real, Mercado Pago/MODO confirmarían automáticamente con webhook.</small></div>}</div>;
}
function History({ works, data, canPay=false, onMarkPaid }){
  const [open,setOpen]=useState(null);
  return <div className="card"><h3>Historial completo por patente</h3><p>Incluye trabajos cargados por cualquier taller de la red.</p><div className="history">{works.length===0&&<p>No hay trabajos cargados.</p>}{works.map(w=>{ const shop=data.workshops.find(x=>x.id===w.workshopId); const isOpen=open===w.id; return <div className="history-item" key={w.id}><div className="history-main"><div><strong>{w.title}</strong><p>{w.date} · {Number(w.km||0).toLocaleString('es-AR')} km</p><small><Building2 size={14}/> {shop?.name || 'Taller no identificado'}</small></div><div className="history-side"><strong>{money(w.cost)}</strong><PaymentBox work={w} shop={shop} onMarkPaid={canPay ? onMarkPaid : null}/></div></div><button className="outline small" onClick={()=>setOpen(isOpen?null:w.id)}>Datos del taller</button>{isOpen&&<WorkshopDetails shop={shop}/>}</div>})}</div></div> }

function ClientSearch({ data, setData, plateSession, setPlateSession }) {
  const [plate,setPlate]=useState(plateSession || '');
  const normalized=cleanPlate(plateSession || plate);
  const records=data.clients.filter(c=>cleanPlate(c.plate)===normalized);
  const latest=[...records].sort((a,b)=>Number(b.km||0)-Number(a.km||0))[0];
  const works=data.works.filter(w=>cleanPlate(w.plate)===normalized).sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!plateSession){
    return <div className="client-view"><div className="card"><h2>Ingreso cliente</h2><p>Ingresá la patente y vas a ver todo el historial del vehículo, aunque los trabajos los hayan cargado distintos talleres.</p><div className="search client-search"><Search/><input value={plate} onChange={e=>setPlate(e.target.value)} placeholder="Ej: AB123CD"/></div><button className="primary full" onClick={()=>setPlateSession(cleanPlate(plate))}><LogIn size={18}/> Ingresar por patente</button><p className="hint">Patentes demo: AB123CD / AC456EF</p></div></div>;
  }
  return <div className="client-view">{latest ? <VehicleDetail client={latest} works={works} data={data} onMarkPaid={(workId)=>setData({...data, works:data.works.map(w=>w.id===workId?{...w,paymentStatus:'paid',paidAt:new Date().toISOString()}:w)})}/> : <div className="card"><h3>No encontramos esa patente</h3><p>Probá cerrar sesión e ingresar AB123CD o AC456EF para ver datos demo.</p></div>}</div>;
}

export default function App(){
  const [data,setData]=useState(()=>{ try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||seed}catch{return seed} });
  const [mode,setMode]=useState('home'); const [admin,setAdmin]=useState(null); const [clientPlate,setClientPlate]=useState(null);
  useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(data)),[data]);
  if(mode==='home') return <HomeScreen setMode={setMode}/>;
  return <><Header mode={mode} setMode={setMode} admin={admin} clientPlate={clientPlate} onAdminLogout={()=>setAdmin(null)} onClientLogout={()=>setClientPlate(null)}/>{mode==='admin' ? (admin ? <AdminPanel data={data} setData={setData} admin={admin}/> : <AdminAuth data={data} setData={setData} onLogin={setAdmin}/>) : mode==='register' ? <AdminRegister data={data} setData={setData} goLogin={()=>setMode('admin')} /> : <ClientSearch data={data} setData={setData} plateSession={clientPlate} setPlateSession={setClientPlate}/>}</>;
}

createRoot(document.getElementById('root')).render(<App/>);
