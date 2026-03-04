import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from "recharts";

const C = {
  rose: "#C9747A", blush: "#E8A4A4", gold: "#C9A84C",
  cream: "#FAF3E8", sage: "#8BAF8B", ivory: "#FFF9F0",
  dark: "#3D2B2B", muted: "#9E7878", lightGold: "#F0D9A0",
};

const catColors = {
  "Buffet": "#C9747A", "Local": "#C9A84C", "Foto/Vídeo": "#8BAF8B",
  "Indumentária": "#E8A4A4", "Decoração": "#B5A4E8",
  "Entretenimento": "#F0D9A0", "Papelaria": "#A4C9E8",
  "Viagem": "#E8C4A4", "Cerimonial": "#C4E8A4",
};

const initEntradas = [
  { id: 1, descricao: "Contribuição Família da Noiva", categoria: "Família",    valor: 15000, data: "2024-01", pago: true },
  { id: 2, descricao: "Contribuição Família do Noivo", categoria: "Família",    valor: 12000, data: "2024-02", pago: true },
  { id: 3, descricao: "Economias do Casal",            categoria: "Poupança",   valor: 8000,  data: "2024-03", pago: true },
  { id: 4, descricao: "Vaquinha Online",               categoria: "Presentes",  valor: 3200,  data: "2024-04", pago: true },
  { id: 5, descricao: "Renda Extra - Freelas",         categoria: "Renda Extra",valor: 2500,  data: "2024-05", pago: false },
  { id: 6, descricao: "Poupança Mensal Jun",           categoria: "Poupança",   valor: 1800,  data: "2024-06", pago: false },
];

const initSaidas = [
  { id: 1,  descricao: "Buffet & Gastronomia",  categoria: "Buffet",         valor: 14000, data: "2024-02", pago: true },
  { id: 2,  descricao: "Espaço / Salão",        categoria: "Local",          valor: 8500,  data: "2024-01", pago: true },
  { id: 3,  descricao: "Fotografia & Vídeo",    categoria: "Foto/Vídeo",     valor: 6000,  data: "2024-03", pago: true },
  { id: 4,  descricao: "Vestido de Noiva",      categoria: "Indumentária",   valor: 4500,  data: "2024-04", pago: true },
  { id: 5,  descricao: "Decoração & Flores",    categoria: "Decoração",      valor: 5200,  data: "2024-03", pago: false },
  { id: 6,  descricao: "Música / DJ / Banda",   categoria: "Entretenimento", valor: 3800,  data: "2024-05", pago: false },
  { id: 7,  descricao: "Convites & Papelaria",  categoria: "Papelaria",      valor: 800,   data: "2024-02", pago: true },
  { id: 8,  descricao: "Lua de Mel",            categoria: "Viagem",         valor: 7000,  data: "2024-06", pago: false },
  { id: 9,  descricao: "Traje do Noivo",        categoria: "Indumentária",   valor: 1200,  data: "2024-04", pago: false },
  { id: 10, descricao: "Cerimonialista",        categoria: "Cerimonial",     valor: 3500,  data: "2024-01", pago: true },
];

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const fmtMes = (s) => {
  const [, m] = s.split("-");
  return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][+m - 1];
};

const Tip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div style={{ background: C.ivory, border: `1px solid ${C.gold}`, borderRadius: 10, padding: "10px 16px", fontFamily: "serif" }}>
      {label && <p style={{ color: C.muted, fontSize: 12 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.dark, fontSize: 14, fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  ) : null;

const emptyForm = { descricao: "", categoria: "", valor: "", data: "2024-06", pago: false };

export default function App() {
  const [entradas, setEntradas] = useState(initEntradas);
  const [saidas, setSaidas]     = useState(initSaidas);
  const [tab, setTab]           = useState("dashboard");
  const [modal, setModal]       = useState(null);   // "entrada" | "saida"
  const [editId, setEditId]     = useState(null);   // id do item sendo editado
  const [form, setForm]         = useState(emptyForm);
  const [notif, setNotif]       = useState(null);

  const totalE   = entradas.reduce((s, e) => s + e.valor, 0);
  const totalS   = saidas.reduce((s, e) => s + e.valor, 0);
  const saldo    = totalE - totalS;
  const pago     = saidas.filter((s) => s.pago).reduce((a, b) => a + b.valor, 0);
  const pendente = saidas.filter((s) => !s.pago).reduce((a, b) => a + b.valor, 0);
  const progresso = Math.min(100, Math.round((pago / totalS) * 100));

  const pieData = Object.entries(
    saidas.reduce((acc, s) => { acc[s.categoria] = (acc[s.categoria] || 0) + s.valor; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const months = [...new Set([...entradas.map((e) => e.data), ...saidas.map((s) => s.data)])].sort();
  const evolData = months.map((m) => ({
    mes: fmtMes(m),
    Entradas: entradas.filter((e) => e.data === m).reduce((a, b) => a + b.valor, 0),
    "Saídas": saidas.filter((s) => s.data === m).reduce((a, b) => a + b.valor, 0),
  }));

  const fonteData = Object.entries(
    entradas.reduce((acc, e) => { acc[e.categoria] = (acc[e.categoria] || 0) + e.valor; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  function notify(msg) { setNotif(msg); setTimeout(() => setNotif(null), 2500); }

  function openAdd(type) {
    setEditId(null);
    setForm(emptyForm);
    setModal(type);
  }

  function openEdit(type, row) {
    setEditId(row.id);
    setForm({ descricao: row.descricao, categoria: row.categoria, valor: String(row.valor), data: row.data, pago: row.pago });
    setModal(type);
  }

  function save(type) {
    const updated = { descricao: form.descricao, categoria: form.categoria || "Outros", valor: parseFloat(form.valor) || 0, data: form.data, pago: form.pago };
    if (editId) {
      // editar item existente
      if (type === "entrada") setEntradas((p) => p.map((e) => e.id === editId ? { ...e, ...updated } : e));
      else setSaidas((p) => p.map((s) => s.id === editId ? { ...s, ...updated } : s));
      notify("Item atualizado! ✏️");
    } else {
      // novo item
      const item = { id: Date.now(), ...updated };
      if (type === "entrada") setEntradas((p) => [...p, item]);
      else setSaidas((p) => [...p, item]);
      notify(type === "entrada" ? "Entrada adicionada! 💚" : "Despesa registrada! 📝");
    }
    setModal(null); setEditId(null); setForm(emptyForm);
  }

  function del(type, id) {
    if (type === "entrada") setEntradas((p) => p.filter((e) => e.id !== id));
    else setSaidas((p) => p.filter((s) => s.id !== id));
    notify("Item removido.");
  }

  const navBtn = (key, label) => (
    <button key={key} onClick={() => setTab(key)} style={{
      background: tab === key ? C.gold : "transparent",
      color: tab === key ? C.dark : "#C8A0A0",
      border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer",
      fontFamily: "serif", fontSize: 14, fontWeight: tab === key ? 700 : 400,
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,#FAF0E8,#FFF5EC,#F5EDE0)`, fontFamily: "Georgia,serif", color: C.dark }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:wght@400;600&display=swap" rel="stylesheet" />

      {notif && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:1000, background:C.sage, color:"white", padding:"12px 20px", borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,.18)", fontFamily:"serif", fontSize:15 }}>
          {notif}
        </div>
      )}

      {/* Header */}
      <header style={{ background:`linear-gradient(135deg,${C.dark},#5C3A3A)`, padding:"0 32px", boxShadow:"0 4px 24px rgba(61,43,43,.25)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:72, maxWidth:1400, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:26 }}>💍</span>
            <div>
              <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:600, color:C.lightGold, letterSpacing:".06em", margin:0 }}>
                Planejamento de Casamento
              </h1>
              <p style={{ color:"#B89090", fontSize:12, margin:"2px 0 0", letterSpacing:".1em" }}>Controle Financeiro · Ana & Pedro</p>
            </div>
          </div>
          <nav style={{ display:"flex", gap:4 }}>
            {navBtn("dashboard","📊 Dashboard")}
            {navBtn("entradas","💚 Entradas")}
            {navBtn("saidas","📝 Despesas")}
          </nav>
        </div>
      </header>

      <main style={{ padding:"28px 32px", maxWidth:1400, margin:"0 auto" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:24 }}>
              {[
                { label:"Total Orçado",      value:fmt(totalS),  icon:"🎯", color:C.gold },
                { label:"Total Arrecadado",  value:fmt(totalE),  icon:"💰", color:C.sage },
                { label:"Saldo Disponível",  value:fmt(saldo),   icon:saldo>=0?"✅":"⚠️", color:saldo>=0?C.sage:C.rose },
                { label:"Já Pago",           value:fmt(pago),    icon:"🏷️", color:C.rose },
              ].map((k, i) => (
                <div key={i} style={{ background:C.ivory, borderRadius:16, padding:"20px 22px", border:`1px solid ${C.lightGold}40`, boxShadow:"0 2px 16px rgba(201,168,76,.08)" }}>
                  <div style={{ fontSize:26, marginBottom:8 }}>{k.icon}</div>
                  <div style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:4, fontWeight:600, letterSpacing:".05em" }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ background:C.ivory, borderRadius:16, padding:"18px 26px", border:`1px solid ${C.lightGold}40`, marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:".1em" }}>PROGRESSO DOS PAGAMENTOS</span>
                <span style={{ fontSize:18, fontWeight:700, color:C.gold }}>{progresso}%</span>
              </div>
              <div style={{ height:10, background:"#EDD8C0", borderRadius:10, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progresso}%`, background:`linear-gradient(90deg,${C.gold},${C.rose})`, borderRadius:10, transition:"width 1s ease" }} />
              </div>
              <div style={{ display:"flex", gap:24, marginTop:8 }}>
                <span style={{ fontSize:12, color:C.sage }}>✓ Pago: {fmt(pago)}</span>
                <span style={{ fontSize:12, color:C.gold }}>⏳ Pendente: {fmt(pendente)}</span>
              </div>
            </div>

            {/* Row 1 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:18, marginBottom:18 }}>
              <ChartCard title="DESPESAS POR CATEGORIA">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieData.map((e, i) => <Cell key={i} fill={catColors[e.name] || Object.values(catColors)[i % 9]} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 12px", justifyContent:"center", marginTop:8 }}>
                  {pieData.map((d, i) => (
                    <span key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:C.muted }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:catColors[d.name]||Object.values(catColors)[i%9], display:"inline-block" }} />
                      {d.name}
                    </span>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="EVOLUÇÃO MENSAL — ENTRADAS VS SAÍDAS">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={evolData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D8C8" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize:11, fill:C.muted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={(v)=>`R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<Tip />} />
                    <Legend wrapperStyle={{ fontSize:13 }} />
                    <Bar dataKey="Entradas" fill={C.sage} radius={[6,6,0,0]} />
                    <Bar dataKey="Saídas"   fill={C.rose} radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Row 2 */}
            <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18 }}>
              <ChartCard title="ACUMULADO — CAIXA DO CASAMENTO">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={evolData}>
                    <defs>
                      <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.sage} stopOpacity={0.3} /><stop offset="95%" stopColor={C.sage} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.rose} stopOpacity={0.3} /><stop offset="95%" stopColor={C.rose} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D8C8" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize:11, fill:C.muted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={(v)=>`R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<Tip />} />
                    <Legend wrapperStyle={{ fontSize:13 }} />
                    <Area type="monotone" dataKey="Entradas" stroke={C.sage} strokeWidth={2} fill="url(#gE)" />
                    <Area type="monotone" dataKey="Saídas"   stroke={C.rose} strokeWidth={2} fill="url(#gS)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="FONTES DE RENDA">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={fonteData} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D8C8" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={(v)=>`R$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:C.muted }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="value" name="Valor" fill={C.gold} radius={[0,6,6,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </>
        )}

        {/* ── ENTRADAS ── */}
        {tab === "entradas" && (
          <TableView
            title="Entradas & Receitas"
            subtitle={<>Total arrecadado: <strong style={{ color:C.sage }}>{fmt(totalE)}</strong></>}
            btnLabel="+ Nova Entrada"
            btnColor={`linear-gradient(135deg,${C.sage},#6A9F6A)`}
            onAdd={() => openAdd("entrada")}
            rows={entradas}
            isSaida={false}
            onEdit={(row) => openEdit("entrada", row)}
            onDelete={(id) => del("entrada", id)}
          />
        )}

        {/* ── SAIDAS ── */}
        {tab === "saidas" && (
          <TableView
            title="Despesas do Casamento"
            subtitle={<>Total: <strong style={{ color:C.rose }}>{fmt(totalS)}</strong> · Pago: <strong style={{ color:C.sage }}>{fmt(pago)}</strong> · Pendente: <strong style={{ color:C.gold }}>{fmt(pendente)}</strong></>}
            btnLabel="+ Nova Despesa"
            btnColor={`linear-gradient(135deg,${C.rose},#B05C62)`}
            onAdd={() => openAdd("saida")}
            rows={saidas}
            isSaida={true}
            onEdit={(row) => openEdit("saida", row)}
            onToggle={(id) => setSaidas((p) => p.map((s) => s.id === id ? { ...s, pago: !s.pago } : s))}
            onDelete={(id) => del("saida", id)}
          />
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(61,43,43,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, backdropFilter:"blur(4px)" }}>
          <div style={{ background:C.ivory, borderRadius:20, padding:32, width:440, boxShadow:"0 20px 60px rgba(61,43,43,.3)", border:`1px solid ${C.lightGold}60` }}>
            <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:17, margin:"0 0 22px", letterSpacing:".05em" }}>
              {editId
                ? (modal === "entrada" ? "✏️ Editar Entrada" : "✏️ Editar Despesa")
                : (modal === "entrada" ? "💚 Nova Entrada"   : "📝 Nova Despesa")
              }
            </h2>
            {[
              { label:"Descrição", key:"descricao", type:"text",   placeholder:"Ex: Buffet, Família..." },
              { label:"Categoria", key:"categoria", type:"text",   placeholder:"Ex: Família, Buffet..." },
              { label:"Valor (R$)",key:"valor",     type:"number", placeholder:"0,00" },
              { label:"Mês",       key:"data",      type:"month",  placeholder:"" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:700, letterSpacing:".1em", color:C.muted, display:"block", marginBottom:5 }}>{f.label.toUpperCase()}</label>
                <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width:"100%", padding:"10px 13px", borderRadius:8, border:`1px solid ${C.lightGold}`, background:"white", fontFamily:"serif", fontSize:14, color:C.dark, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
            <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22, cursor:"pointer" }}>
              <input type="checkbox" checked={form.pago} onChange={(e) => setForm((p) => ({ ...p, pago: e.target.checked }))} />
              <span style={{ fontSize:14, color:C.muted }}>{modal === "entrada" ? "Já recebido" : "Já pago"}</span>
            </label>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setModal(null)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1px solid ${C.lightGold}`, background:"transparent", cursor:"pointer", fontFamily:"serif", fontSize:14, color:C.muted }}>Cancelar</button>
              <button onClick={() => save(modal)} style={{ flex:2, padding:"10px 0", borderRadius:10, border:"none", background:modal==="entrada"?`linear-gradient(135deg,${C.sage},#6A9F6A)`:`linear-gradient(135deg,${C.rose},#B05C62)`, cursor:"pointer", color:"white", fontFamily:"serif", fontSize:14, fontWeight:700 }}>{editId ? "Salvar Alterações" : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background:"#FFF9F0", borderRadius:16, padding:"22px 18px", border:"1px solid #F0D9A040", boxShadow:"0 2px 16px rgba(201,168,76,.08)" }}>
      <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:".12em", color:"#9E7878", margin:"0 0 14px" }}>{title}</h3>
      {children}
    </div>
  );
}

function TableView({ title, subtitle, btnLabel, btnColor, onAdd, rows, isSaida, onToggle, onDelete, onEdit }) {
  const total = rows.reduce((s, r) => s + r.valor, 0);
  const fmt = (v) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v);
  const fmtMes = (s) => { const [, m] = s.split("-"); return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][+m-1] + " " + s.split("-")[0]; };
  const C = { dark:"#3D2B2B", muted:"#9E7878", gold:"#C9A84C", lightGold:"#F0D9A0", sage:"#8BAF8B", rose:"#C9747A", ivory:"#FFF9F0" };
  const catColors = { "Buffet":"#C9747A","Local":"#C9A84C","Foto/Vídeo":"#8BAF8B","Indumentária":"#E8A4A4","Decoração":"#B5A4E8","Entretenimento":"#F0D9A0","Papelaria":"#A4C9E8","Viagem":"#E8C4A4","Cerimonial":"#C4E8A4" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:18, margin:0 }}>{title}</h2>
          <p style={{ margin:"4px 0 0", color:C.muted, fontSize:14 }}>{subtitle}</p>
        </div>
        <button onClick={onAdd} style={{ background:btnColor, color:"white", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer", fontFamily:"serif", fontSize:14, fontWeight:700, boxShadow:"0 4px 14px rgba(0,0,0,.15)" }}>
          {btnLabel}
        </button>
      </div>
      <div style={{ background:C.ivory, borderRadius:16, overflow:"hidden", border:`1px solid ${C.lightGold}40` }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:`linear-gradient(135deg,${C.dark},#5C3A3A)` }}>
              {["Descrição","Categoria","Mês","Valor","Status","Ações"].map((h) => (
                <th key={h} style={{ padding:"13px 18px", textAlign:"left", color:C.lightGold, fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:".1em", fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ background:i%2===0?"white":C.ivory, borderBottom:`1px solid ${C.lightGold}30` }}>
                <td style={{ padding:"12px 18px", fontSize:14 }}>{r.descricao}</td>
                <td style={{ padding:"12px 18px" }}>
                  <span style={{ background:`${isSaida?(catColors[r.categoria]||C.rose):C.gold}22`, color:isSaida?(catColors[r.categoria]||C.rose):C.gold, borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600 }}>{r.categoria}</span>
                </td>
                <td style={{ padding:"12px 18px", fontSize:13, color:C.muted }}>{fmtMes(r.data)}</td>
                <td style={{ padding:"12px 18px", fontSize:15, fontWeight:700, color:isSaida?C.rose:C.sage }}>{fmt(r.valor)}</td>
                <td style={{ padding:"12px 18px" }}>
                  {isSaida ? (
                    <button onClick={() => onToggle(r.id)} style={{ background:r.pago?`${C.sage}25`:`${C.rose}18`, color:r.pago?C.sage:C.rose, border:`1px solid ${r.pago?C.sage:C.rose}50`, borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      {r.pago ? "✓ Pago" : "⏳ Pendente"}
                    </button>
                  ) : (
                    <span style={{ background:r.pago?`${C.sage}25`:`${C.gold}25`, color:r.pago?C.sage:C.gold, borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600 }}>
                      {r.pago ? "✓ Recebido" : "⏳ Pendente"}
                    </span>
                  )}
                </td>
                <td style={{ padding:"12px 18px", display:"flex", gap:6 }}>
                  <button onClick={() => onEdit(r)} title="Editar" style={{ background:"none", border:"none", cursor:"pointer", color:C.gold, fontSize:16 }}>✏️</button>
                  <button onClick={() => onDelete(r.id)} title="Excluir" style={{ background:"none", border:"none", cursor:"pointer", color:C.rose, fontSize:16 }}>🗑</button>
                </td>
              </tr>
            ))}
            <tr style={{ background:`${C.gold}12` }}>
              <td colSpan={3} style={{ padding:"13px 18px", fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:".1em", color:C.muted }}>TOTAL</td>
              <td style={{ padding:"13px 18px", fontSize:15, fontWeight:700, color:C.gold }}>{fmt(total)}</td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
