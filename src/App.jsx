import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Car, CalendarClock, ClipboardList, Plus, UserRound, Wrench, Search, ShieldCheck, Save, LogIn, Trash2, Pencil, Building2, LogOut } from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'tallersmart_multi_taller_v2';

const seed = {
  workshops: [
    { id: 1, name: 'Taller Centro', city: 'La Plata', adminUser: 'centro', adminPass: '1234' },
    { id: 2, name: 'Taller Ruta 2', city: 'Dolores', adminUser: 'ruta2', adminPass: '1234' },
  ],
  clients: [
    { id: 1, workshopId: 1, name: 'Juan Pérez', phone: '221 555-1234', email: 'juan@email.com', vehicle: 'Toyota Corolla 2018', plate: 'AB123CD', km: 84200, nextServiceKm: 90000, nextServiceDate: '2026-07-10' },
    { id: 2, workshopId: 1, name: 'María Gómez', phone: '11 6026-4052', email: 'maria@email.com', vehicle: 'Ford Ranger 2020', plate: 'AC456EF', km: 119500, nextServiceKm: 120000, nextServiceDate: '2026-05-30' },
    { id: 3, workshopId: 2, name: 'Juan Pérez', phone: '221 555-1234', email: 'juan@email.com', vehicle: 'Toyota Corolla 2018', plate: 'AB123CD', km: 86000, nextServiceKm: 90000, nextServiceDate: '2026-07-10' },
  ],
  works: [
    { id: 1, plate: 'AB123CD', workshopId: 1, date: '2026-04-12', title: 'Cambio de aceite y filtros', km: 81000, cost: '$95.000' },
    { id: 2, plate: 'AB123CD', workshopId: 1, date: '2025-12-02', title: 'Pastillas de freno delanteras', km: 76000, cost: '$130.000' },
    { id: 3, plate: 'AC456EF', workshopId: 1, date: '2026-02-20', title: 'Service completo', km: 110000, cost: '$210.000' },
    { id: 4, plate: 'AB123CD', workshopId: 2, date: '2026-05-02', title: 'Reparación de pérdida de agua', km: 86000, cost: '$75.000' },
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

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>;
}

function Header({ mode, setMode, admin, onLogout }) {
  return <header className="header"><div className="header-inner"><div className="brand"><div className="logo"><Wrench /></div><div><h1>TallerSmart</h1><p>{admin ? `${admin.name} · ${admin.city}` : 'Historial vehicular multi-taller'}</p></div></div><div className="role-buttons"><button className={mode==='admin'?'active':''} onClick={()=>setMode('admin')}>Administrador</button><button className={mode==='client'?'active':''} onClick={()=>setMode('client')}>Cliente</button>{admin && <button onClick={onLogout}><LogOut size={16}/> Salir</button>}</div></div></header>;
}

function AdminLogin({ data, onLogin }) {
  const [user,setUser]=useState('centro'); const [pass,setPass]=useState('1234'); const [err,setErr]=useState('');
  const submit=()=>{ const w=data.workshops.find(x=>x.adminUser===user && x.adminPass===pass); if(!w){setErr('Usuario o contraseña incorrectos. Demo: centro / 1234 o ruta2 / 1234'); return;} setErr(''); onLogin(w); };
  return <div className="login"><div className="card"><h2>Ingreso administrador</h2><p>Cada taller entra con su propio usuario y solo ve sus clientes.</p><Field label="Usuario del taller" value={user} onChange={setUser}/><Field label="Contraseña" type="password" value={pass} onChange={setPass}/>{err&&<p className="error">{err}</p>}<button className="primary full" onClick={submit}><LogIn size={18}/> Entrar</button><p className="hint">Usuarios demo: centro / 1234 — ruta2 / 1234</p></div></div>;
}

const emptyForm = { name:'', phone:'', email:'', vehicle:'', plate:'', km:'', nextServiceKm:'', nextServiceDate:'' };
function ClientForm({ editing, onSave, onCancel }) {
  const [f,setF]=useState(editing || emptyForm);
  useEffect(()=>setF(editing || emptyForm),[editing]);
  const set=(k,v)=>setF({...f,[k]:v});
  const save=()=>{ if(!f.name || !f.plate || !f.vehicle) return alert('Completá nombre, patente y vehículo'); onSave({...f, plate: cleanPlate(f.plate), km:Number(f.km||0), nextServiceKm:Number(f.nextServiceKm||0)}); if(!editing) setF(emptyForm); };
  return <div className="card"><h3>{editing?'Editar cliente':'Nuevo cliente'}</h3><div className="grid2"><Field label="Nombre" value={f.name} onChange={v=>set('name',v)}/><Field label="Teléfono" value={f.phone} onChange={v=>set('phone',v)}/><Field label="Email" value={f.email} onChange={v=>set('email',v)}/><Field label="Vehículo" value={f.vehicle} onChange={v=>set('vehicle',v)} placeholder="Ej: Corolla 2018"/><Field label="Patente" value={f.plate} onChange={v=>set('plate',v)}/><Field label="Km actual" type="number" value={f.km} onChange={v=>set('km',v)}/><Field label="Próximo service en km" type="number" value={f.nextServiceKm} onChange={v=>set('nextServiceKm',v)}/><Field label="Fecha próximo service" type="date" value={f.nextServiceDate} onChange={v=>set('nextServiceDate',v)}/></div><div className="actions"><button className="primary" onClick={save}><Save size={18}/> Guardar</button>{editing&&<button className="outline" onClick={onCancel}>Cancelar</button>}</div></div>;
}

function AdminPanel({ data, setData, admin }) {
  const myClients = data.clients.filter(c=>c.workshopId===admin.id);
  const [selected,setSelected]=useState(myClients[0]||null); const [editing,setEditing]=useState(null); const [q,setQ]=useState('');
  useEffect(()=>{ if(selected && !data.clients.find(c=>c.id===selected.id)) setSelected(myClients[0]||null); },[data]);
  const filtered=myClients.filter(c=>`${c.name} ${c.plate} ${c.vehicle}`.toLowerCase().includes(q.toLowerCase()));
  const saveClient=(client)=>{
    if(client.id){ const updated={...client, workshopId:admin.id}; setData({...data, clients:data.clients.map(c=>c.id===client.id?updated:c)}); setSelected(updated); setEditing(null); }
    else { const n={...client,id:Date.now(),workshopId:admin.id}; setData({...data,clients:[n,...data.clients]}); setSelected(n); }
  };
  const del=(id)=>{ if(!confirm('¿Eliminar este cliente de este taller? El historial cargado del vehículo queda disponible por patente.')) return; setData({...data, clients:data.clients.filter(c=>c.id!==id)}); };
  const addWork=(work)=>{ if(!selected) return; const plate=cleanPlate(selected.plate); const w={id:Date.now(), plate, workshopId:admin.id, ...work, km:Number(work.km||selected.km)}; const clients=data.clients.map(c=>c.id===selected.id?{...c,km:w.km}:c); setData({...data, clients, works:[w,...data.works]}); setSelected({...selected,km:w.km}); };
  const works = selected ? data.works.filter(w=>cleanPlate(w.plate)===cleanPlate(selected.plate)).sort((a,b)=>new Date(b.date)-new Date(a.date)) : [];
  return <main className="layout"><section className="sidebar"><div className="card"><div className="panel-title"><div><h2>Panel del taller</h2><p>Solo ves clientes cargados por {admin.name}.</p></div><ShieldCheck/></div><div className="stats"><div className="stat"><strong>{myClients.length}</strong><span>Clientes</span></div><div className="stat"><strong>{myClients.filter(c=>statusFor(c)==='Urgente').length}</strong><span>Urgentes</span></div><div className="stat"><strong>{data.works.filter(w=>w.workshopId===admin.id).length}</strong><span>Trabajos</span></div></div></div><ClientForm editing={editing} onSave={saveClient} onCancel={()=>setEditing(null)}/><div className="card"><div className="search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar cliente, patente o vehículo"/></div><div className="client-list">{filtered.map(c=><button key={c.id} className={`client-item ${selected?.id===c.id?'selected':''}`} onClick={()=>setSelected(c)}><div><strong>{c.name}</strong><span className={badgeClass(statusFor(c))}>{statusFor(c)}</span></div><p>{c.vehicle}</p><small>Patente {c.plate}</small></button>)}</div></div></section><section className="detail">{selected ? <VehicleDetail client={selected} works={works} data={data} admin onEdit={()=>setEditing(selected)} onDelete={()=>del(selected.id)} onAddWork={addWork}/> : <div className="card">Cargá o seleccioná un cliente.</div>}</section></main>;
}

function WorkForm({ onAddWork, km }) { const [w,setW]=useState({title:'',date:new Date().toISOString().slice(0,10),km:km||'',cost:''}); useEffect(()=>setW(x=>({...x,km:km||''})),[km]); const set=(k,v)=>setW({...w,[k]:v}); return <div className="card"><h3>Registrar trabajo realizado</h3><div className="grid4"><Field label="Trabajo" value={w.title} onChange={v=>set('title',v)} placeholder="Ej: Cambio de aceite"/><Field label="Fecha" type="date" value={w.date} onChange={v=>set('date',v)}/><Field label="Km" type="number" value={w.km} onChange={v=>set('km',v)}/><Field label="Costo" value={w.cost} onChange={v=>set('cost',v)} placeholder="$"/></div><button className="primary" onClick={()=>{ if(!w.title)return alert('Cargá el trabajo'); onAddWork(w); setW({title:'',date:new Date().toISOString().slice(0,10),km:w.km,cost:''}); }}><Plus size={18}/> Agregar al historial</button></div> }

function VehicleDetail({ client, works, data, admin=false, onEdit, onDelete, onAddWork }) {
  const kmLeft=Number(client.nextServiceKm||0)-Number(client.km||0);
  return <><div className="card hero"><div className="hero-top"><div><span>{admin?'Ficha del cliente':'Vehículo'}</span><h2>{client.vehicle}</h2><p>Patente {client.plate}</p></div><Car size={42}/></div><div className="info-grid"><Info icon={<UserRound/>} label="Cliente" value={client.name}/><Info icon={<ClipboardList/>} label="Km actual" value={`${Number(client.km||0).toLocaleString('es-AR')} km`}/><Info icon={<CalendarClock/>} label="Próximo service" value={client.nextServiceDate||'Sin fecha'}/></div>{admin&&<div className="admin-actions"><button className="outline" onClick={onEdit}><Pencil size={16}/> Editar cliente</button><button className="danger" onClick={onDelete}><Trash2 size={16}/> Eliminar cliente</button></div>}</div><div className="card"><div className="between"><div><h3>Mantenimiento pendiente</h3><p>Aviso calculado por km y fecha.</p></div><span className={badgeClass(statusFor(client))}>{statusFor(client)}</span></div><div className="km-box"><span>Faltan aproximadamente</span><strong>{kmLeft.toLocaleString('es-AR')} km</strong><span>para el service de {Number(client.nextServiceKm||0).toLocaleString('es-AR')} km.</span></div></div>{admin&&<WorkForm onAddWork={onAddWork} km={client.km}/>}<History works={works} data={data}/></>;
}
function Info({ icon,label,value }){ return <div className="info"><div>{icon}</div><span>{label}</span><strong>{value}</strong></div>; }
function History({ works, data }){ return <div className="card"><h3>Historial completo por patente</h3><p>Incluye trabajos cargados por cualquier taller de la red.</p><div className="history">{works.length===0&&<p>No hay trabajos cargados.</p>}{works.map(w=>{ const shop=data.workshops.find(x=>x.id===w.workshopId); return <div className="history-item" key={w.id}><div><strong>{w.title}</strong><p>{w.date} · {Number(w.km||0).toLocaleString('es-AR')} km</p><small><Building2 size={14}/> {shop?.name || 'Taller no identificado'} · {shop?.city || ''}</small></div><strong>{money(w.cost)}</strong></div>})}</div></div> }

function ClientSearch({ data }) {
  const [plate,setPlate]=useState('AB123CD'); const normalized=cleanPlate(plate);
  const records=data.clients.filter(c=>cleanPlate(c.plate)===normalized);
  const latest=records.sort((a,b)=>Number(b.km||0)-Number(a.km||0))[0];
  const works=data.works.filter(w=>cleanPlate(w.plate)===normalized).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return <div className="client-view"><div className="card"><h2>Ingreso cliente</h2><p>Ingresá la patente y vas a ver todo el historial del vehículo, aunque los trabajos los hayan cargado distintos talleres.</p><div className="search client-search"><Search/><input value={plate} onChange={e=>setPlate(e.target.value)} placeholder="Ej: AB123CD"/></div></div>{latest ? <VehicleDetail client={latest} works={works} data={data}/> : <div className="card"><h3>No encontramos esa patente</h3><p>Probá con AB123CD o AC456EF para ver datos demo.</p></div>}</div>;
}

export default function App(){
  const [data,setData]=useState(()=>{ try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||seed}catch{return seed} });
  const [mode,setMode]=useState('admin'); const [admin,setAdmin]=useState(null);
  useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(data)),[data]);
  return <><Header mode={mode} setMode={setMode} admin={admin} onLogout={()=>setAdmin(null)}/>{mode==='admin' ? (admin ? <AdminPanel data={data} setData={setData} admin={admin}/> : <AdminLogin data={data} onLogin={setAdmin}/>) : <ClientSearch data={data}/>}</>;
}

createRoot(document.getElementById('root')).render(<App/>);
