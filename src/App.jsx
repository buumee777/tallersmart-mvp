import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Car, CalendarClock, ClipboardList, Plus, UserRound, Wrench, Search, ShieldCheck, Save, LogIn } from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "tallersmart_mvp_data";

const demoClients = [
  {
    id: 1,
    name: "Juan Pérez",
    phone: "221 555-1234",
    email: "juan@email.com",
    accessCode: "JUAN123",
    vehicle: "Toyota Corolla 2018",
    plate: "AB123CD",
    km: 84200,
    nextServiceKm: 90000,
    nextServiceDate: "2026-07-10",
    status: "Próximo",
    history: [
      { id: 1, date: "2026-04-12", title: "Cambio de aceite y filtros", km: 81000, cost: "$95.000" },
      { id: 2, date: "2025-12-02", title: "Pastillas de freno delanteras", km: 76000, cost: "$130.000" },
    ],
  },
  {
    id: 2,
    name: "María Gómez",
    phone: "11 6026-4052",
    email: "maria@email.com",
    accessCode: "MARIA123",
    vehicle: "Ford Ranger 2020",
    plate: "AC456EF",
    km: 119500,
    nextServiceKm: 120000,
    nextServiceDate: "2026-05-30",
    status: "Urgente",
    history: [
      { id: 1, date: "2026-02-20", title: "Service completo", km: 110000, cost: "$210.000" },
      { id: 2, date: "2025-10-15", title: "Cambio de batería", km: 103000, cost: "$165.000" },
    ],
  },
];

function calculateStatus(km, nextServiceKm, nextServiceDate) {
  const kmLeft = Number(nextServiceKm || 0) - Number(km || 0);
  const today = new Date();
  const serviceDate = new Date(nextServiceDate);
  const daysLeft = Math.ceil((serviceDate - today) / (1000 * 60 * 60 * 24));
  if (kmLeft <= 1000 || daysLeft <= 15) return "Urgente";
  if (kmLeft <= 5000 || daysLeft <= 45) return "Próximo";
  return "Normal";
}

function AppHeader({ role, setRole }) {
  return <div className="header"><div className="header-inner"><div className="brand"><div className="logo"><Wrench /></div><div><h1>TallerSmart</h1><p>Mantenimiento vehicular inteligente</p></div></div><div className="role-buttons"><button className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>Admin</button><button className={role === "client" ? "active" : ""} onClick={() => setRole("client")}>Cliente</button></div></div></div>;
}

function Badge({ status }) { return <span className={`badge ${status.toLowerCase()}`}>{status}</span>; }
function Card({ children, className="" }) { return <div className={`card ${className}`}>{children}</div>; }
function Field({ label, value, onChange, type = "text", placeholder = "" }) { return <label className="field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>; }
function Stat({ value, label }) { return <div className="stat"><strong>{value}</strong><span>{label}</span></div>; }

function ClientForm({ onCreate }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", vehicle: "", plate: "", km: "", nextServiceKm: "", nextServiceDate: "" });
  const update = (field, value) => setForm({ ...form, [field]: value });
  const submit = () => {
    if (!form.name || !form.vehicle || !form.plate) return alert("Completá nombre, vehículo y patente.");
    const accessCode = `${form.plate.replace(/\s/g, "").toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    onCreate({ id: Date.now(), ...form, accessCode, km: Number(form.km || 0), nextServiceKm: Number(form.nextServiceKm || 0), status: calculateStatus(form.km, form.nextServiceKm, form.nextServiceDate), history: [] });
    setForm({ name: "", phone: "", email: "", vehicle: "", plate: "", km: "", nextServiceKm: "", nextServiceDate: "" });
  };
  return <Card><h3><Plus size={18}/> Nuevo cliente</h3><div className="grid2"><Field label="Nombre" value={form.name} onChange={(v) => update("name", v)} /><Field label="Teléfono" value={form.phone} onChange={(v) => update("phone", v)} /><Field label="Email" value={form.email} onChange={(v) => update("email", v)} /><Field label="Vehículo" value={form.vehicle} onChange={(v) => update("vehicle", v)} placeholder="Ej: Toyota Corolla 2018" /><Field label="Patente" value={form.plate} onChange={(v) => update("plate", v)} /><Field label="Km actual" type="number" value={form.km} onChange={(v) => update("km", v)} /><Field label="Próximo service en km" type="number" value={form.nextServiceKm} onChange={(v) => update("nextServiceKm", v)} /><Field label="Fecha próximo service" type="date" value={form.nextServiceDate} onChange={(v) => update("nextServiceDate", v)} /></div><button className="primary full" onClick={submit}><Save size={18}/> Guardar cliente</button></Card>;
}

function AdminDashboard({ clients, selected, setSelected, setClients }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => clients.filter(c => `${c.name} ${c.vehicle} ${c.plate}`.toLowerCase().includes(search.toLowerCase())), [clients, search]);
  const createClient = (client) => { setClients([client, ...clients]); setSelected(client); };
  const addWork = (clientId, work) => {
    const updated = clients.map(c => {
      if (c.id !== clientId) return c;
      const newKm = Number(work.km || c.km);
      const updatedClient = { ...c, km: newKm, status: calculateStatus(newKm, c.nextServiceKm, c.nextServiceDate), history: [{ id: Date.now(), ...work, km: newKm }, ...c.history] };
      setSelected(updatedClient);
      return updatedClient;
    });
    setClients(updated);
  };
  return <main className="layout"><section className="sidebar"><Card><div className="panel-title"><div><h2>Panel del taller</h2><p>Datos guardados en este dispositivo.</p></div><ShieldCheck /></div><div className="stats"><Stat value={clients.length} label="Clientes" /><Stat value={clients.filter(c => c.status === "Urgente").length} label="Urgente" /><Stat value={clients.reduce((acc, c) => acc + c.history.length, 0)} label="Trabajos" /></div></Card><ClientForm onCreate={createClient} /><Card><div className="search"><Search size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente, patente o vehículo" /></div><div className="client-list">{filtered.map((client) => <button key={client.id} onClick={() => setSelected(client)} className={`client-item ${selected?.id === client.id ? "selected" : ""}`}><div><strong>{client.name}</strong><Badge status={client.status}/></div><p>{client.vehicle}</p><small>Patente {client.plate} · Código: {client.accessCode}</small></button>)}</div></Card></section>{selected ? <VehicleDetail client={selected} admin onAddWork={addWork} /> : <Card>Seleccioná o cargá un cliente.</Card>}</main>;
}

function WorkForm({ client, onAddWork }) {
  const [work, setWork] = useState({ title: "", date: new Date().toISOString().slice(0, 10), km: client.km, cost: "" });
  useEffect(() => setWork({ title: "", date: new Date().toISOString().slice(0, 10), km: client.km, cost: "" }), [client.id]);
  const submit = () => { if (!work.title) return alert("Completá el trabajo realizado."); onAddWork(client.id, work); };
  return <Card><h3>Registrar trabajo realizado</h3><div className="grid4"><Field label="Trabajo" value={work.title} onChange={(v) => setWork({ ...work, title: v })} placeholder="Ej: Cambio de aceite" /><Field label="Fecha" type="date" value={work.date} onChange={(v) => setWork({ ...work, date: v })} /><Field label="Km" type="number" value={work.km} onChange={(v) => setWork({ ...work, km: v })} /><Field label="Costo" value={work.cost} onChange={(v) => setWork({ ...work, cost: v })} placeholder="$" /></div><button className="primary" onClick={submit}><Plus size={18}/> Agregar al historial</button></Card>;
}

function InfoBox({ icon, label, value }) { return <div className="info"><div>{icon}</div><span>{label}</span><strong>{value}</strong></div>; }

function VehicleDetail({ client, admin = false, onAddWork }) {
  const kmLeft = Number(client.nextServiceKm || 0) - Number(client.km || 0);
  return <section className="detail"><Card className="hero"><div className="hero-top"><div><p>{admin ? "Ficha del cliente" : "Mi vehículo"}</p><h2>{client.vehicle}</h2><span>Patente {client.plate}</span></div><Car size={44}/></div><div className="info-grid"><InfoBox icon={<UserRound />} label="Cliente" value={client.name} /><InfoBox icon={<ClipboardList />} label="Kilometraje actual" value={`${Number(client.km || 0).toLocaleString("es-AR")} km`} /><InfoBox icon={<CalendarClock />} label="Próximo service" value={client.nextServiceDate || "Sin fecha"} /></div></Card><Card><div className="between"><div><h3>Mantenimiento pendiente</h3><p>Aviso calculado por kilometraje y fecha.</p></div><Badge status={client.status}/></div><div className="km-box"><span>Faltan aproximadamente</span><strong>{kmLeft.toLocaleString("es-AR")} km</strong><p>para el service de {Number(client.nextServiceKm || 0).toLocaleString("es-AR")} km.</p></div>{admin && <p className="code">Código de acceso del cliente: <b>{client.accessCode}</b></p>}</Card>{admin && <WorkForm client={client} onAddWork={onAddWork} />}<Card><h3>Historial de trabajos</h3><div className="history">{client.history.length === 0 && <p>Todavía no hay trabajos cargados.</p>}{client.history.map((item) => <div className="history-item" key={item.id}><div><strong>{item.title}</strong><p>{item.date} · {Number(item.km || 0).toLocaleString("es-AR")} km</p></div><b>{item.cost}</b></div>)}</div></Card></section>;
}

function ClientLogin({ clients, onLogin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    const found = clients.find(c => c.accessCode.toLowerCase() === code.trim().toLowerCase() || c.plate.toLowerCase() === code.trim().toLowerCase());
    if (!found) { setError("No encontramos ese código. Probá con JUAN123, MARIA123 o la patente."); return; }
    setError(""); onLogin(found);
  };
  return <div className="login"><Card><h2>Ingreso del cliente</h2><p>El taller le entrega al cliente un código para ver su vehículo.</p><Field label="Código o patente" value={code} onChange={setCode} placeholder="Ej: JUAN123" />{error && <p className="error">{error}</p>}<button className="primary full" onClick={submit}><LogIn size={18}/> Ingresar</button><div className="hint">Códigos demo: JUAN123 / MARIA123. En una versión real esto sería con usuario, contraseña y seguridad.</div></Card></div>;
}

function ClientView({ clients }) {
  const [client, setClient] = useState(null);
  if (!client) return <ClientLogin clients={clients} onLogin={setClient} />;
  return <main className="client-view"><Card><div className="between"><div><p>Ingresaste como cliente</p><h2>Hola, {client.name}</h2><p>Acá podés ver tu vehículo, próximos mantenimientos e historial.</p></div><button className="secondary" onClick={() => setClient(null)}>Salir</button></div></Card><VehicleDetail client={client} /></main>;
}

function TallerSmartMVP() {
  const [role, setRole] = useState("admin");
  const [clients, setClients] = useState(() => { try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : demoClients; } catch { return demoClients; } });
  const [selected, setSelected] = useState(clients[0] || null);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(clients)); }, [clients]);
  useEffect(() => { if (!selected && clients.length > 0) setSelected(clients[0]); }, [clients, selected]);
  return <div><AppHeader role={role} setRole={setRole} />{role === "admin" ? <AdminDashboard clients={clients} selected={selected} setSelected={setSelected} setClients={setClients} /> : <ClientView clients={clients} />}</div>;
}

createRoot(document.getElementById("root")).render(<TallerSmartMVP />);
