// pk-screens1.jsx — AI Dashboard + Prospect Grid
;(function() {
const { useState } = React;
const T = window.PK_THEME;

/* ─── Dashboard ─── */
function PKDashboard({ prospects, setView, setProspect }) {
  const sorted = [...prospects].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const topPick = sorted.find(p => p.analysis) || sorted[0];
  const kitsReady = prospects.filter(p => p.kit).length;
  const analyzed = prospects.filter(p => p.analysis).length;
  const totalRev = prospects.reduce((s, p) => s + (p.analysis?.revenue?.min || 0), 0);
  const sc = s => s >= 85 ? T.accent : s >= 70 ? T.yellow : T.blue;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PKTopBar title="Intelligence Dashboard"
        actions={<PKButton variant="primary" size="sm" onClick={() => setView('prospects')}>+ Nuevo Prospecto</PKButton>}/>
      <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:18 }}>

        {/* Main grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:14 }}>
          {/* Prospect of the Day */}
          <div style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:12, padding:28,
            position:'relative', overflow:'hidden', cursor:'pointer', transition:'border-color 150ms ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.borderStrong}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            onClick={() => { setProspect(topPick); setView('analysis'); }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%',
              background:`radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 65%)`, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-80, left:-40, width:200, height:200, borderRadius:'50%',
              background:`radial-gradient(circle, rgba(74,158,255,0.04) 0%, transparent 60%)`, pointerEvents:'none' }}/>

            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:T.accent, display:'inline-block' }}/>
                    <span style={{ fontSize:11, color:T.accent, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>Prospecto del día</span>
                  </div>
                  <div style={{ fontSize:28, fontWeight:900, color:T.text, letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:6 }}>
                    {topPick.name}
                  </div>
                  <div style={{ fontSize:13, color:T.muted }}>{topPick.industry} · {topPick.city}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:54, fontWeight:900, color:sc(topPick.opportunityScore),
                    letterSpacing:'-0.04em', lineHeight:1 }}>{topPick.opportunityScore}</div>
                  <div style={{ fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginTop:2 }}>oportunidad</div>
                </div>
              </div>

              {topPick.analysis?.aiRecs && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, color:T.dim, textTransform:'uppercase', letterSpacing:'0.09em', fontWeight:700, marginBottom:10 }}>
                    IA recomienda vender:
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {topPick.analysis.aiRecs.slice(0,3).map(r => (
                      <div key={r.service} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                        background:'rgba(255,255,255,0.03)', borderRadius:8, border:`1px solid ${T.border}` }}>
                        <span style={{ fontSize:15 }}>{r.icon}</span>
                        <span style={{ flex:1, fontSize:13, color:T.text, fontWeight:500 }}>{r.service}</span>
                        <span style={{ fontSize:13, fontWeight:800, color:T.accent, fontVariantNumeric:'tabular-nums' }}>
                          ${r.revenue.toLocaleString()}{r.unit}
                        </span>
                        <span style={{ fontSize:10, color:T.muted, width:32, textAlign:'right' }}>{r.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:10 }} onClick={e => e.stopPropagation()}>
                <PKButton variant="primary" size="sm" onClick={() => { setProspect(topPick); setView('analysis'); }}>
                  Ver análisis completo →
                </PKButton>
                <PKButton variant="accent" size="sm" onClick={() => { setProspect(topPick); setView('kitgen'); }}>
                  ⚡ Generar Kit
                </PKButton>
                <PKButton variant="secondary" size="sm" onClick={() => { setProspect(topPick); setView('assets'); }}>
                  Crear Asset
                </PKButton>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                {label:'Prospectos', value: prospects.length},
                {label:'Analizados', value: analyzed},
                {label:'Kits Listos', value: kitsReady},
                {label:'Pot. MXN', value: `$${(totalRev/1000).toFixed(0)}K`},
              ].map(s => (
                <div key={s.label} style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:9, padding:'12px 14px' }}>
                  <div style={{ fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{s.label}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:T.text, letterSpacing:'-0.02em' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Top Oportunidades */}
            <div style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:10, padding:14, flex:1 }}>
              <div style={{ fontSize:11, color:T.muted, textTransform:'uppercase', letterSpacing:'0.09em', fontWeight:700, marginBottom:12 }}>
                Top Oportunidades
              </div>
              {sorted.map((p, i) => (
                <div key={p.id} onClick={() => { setProspect(p); setView(p.analysis ? 'analysis' : 'detail'); }}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                    borderBottom: i < sorted.length-1 ? `1px solid ${T.border}` : 'none', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  <span style={{ fontSize:11, color:T.dim, fontWeight:700, width:16, flexShrink:0 }}>{i+1}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize:10, color:T.muted }}>{p.industry}</div>
                  </div>
                  <span style={{ fontSize:13, fontWeight:900, color:sc(p.opportunityScore), flexShrink:0 }}>{p.opportunityScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acciones recomendadas */}
        <div>
          <div style={{ fontSize:12, color:T.muted, textTransform:'uppercase', letterSpacing:'0.09em', fontWeight:700, marginBottom:10 }}>
            Acciones recomendadas por IA
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:10 }}>
            {[
              {icon:'📍', label:'GMB para Taller García', desc:'Score 94 · Acción urgente', prospect:2, view:'analysis'},
              {icon:'⚡', label:'Generar Kit Farmacia', desc:'Score 76 · Sin análisis', prospect:4, view:'kitgen'},
              {icon:'🎨', label:'Assets Studio Lumière', desc:'Contactado · Crear material', prospect:3, view:'assets'},
              {icon:'🍰', label:'Analizar El Rincón', desc:'Score 82 · Nuevo prospecto', prospect:5, view:'analysis'},
            ].map(a => {
              const p = prospects.find(x => x.id === a.prospect);
              return (
                <div key={a.label} onClick={() => { if(p) { setProspect(p); setView(a.view); } }}
                  style={{ padding:'14px 16px', borderRadius:10, background:T.s2, border:`1px solid ${T.border}`,
                    cursor:'pointer', transition:'border-color 120ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.borderStrong}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:15 }}>{a.icon}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{a.label}</span>
                  </div>
                  <div style={{ fontSize:11, color:T.muted }}>{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Prospects Grid ─── */
function PKProspects({ prospects, setProspects, setView, setProspect }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const sc = s => s >= 85 ? T.accent : s >= 70 ? T.yellow : s >= 55 ? T.blue : T.muted;
  const sorted = [...prospects].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const filtered = sorted.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.industry.toLowerCase().includes(q) || p.city.toLowerCase().includes(q))
      && (filter === 'all' || p.status === filter);
  });

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PKTopBar title="Prospectos" crumb="Ordenados por score de oportunidad"
        actions={<PKButton variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Nuevo Prospecto</PKButton>}/>
      <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, maxWidth:300 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar negocio…"
              style={{ width:'100%', background:T.s2, border:`1px solid ${T.border}`, borderRadius:8,
                padding:'9px 12px 9px 34px', color:T.text, fontSize:13, outline:'none' }}/>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:T.dim }}>⊙</span>
          </div>
          {['all','kit-ready','analyzed','new'].map(f => {
            const lbl = {all:'Todos','kit-ready':'Kit Listo',analyzed:'Analizados',new:'Nuevos'}[f];
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 14px', borderRadius:7,
                fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all 120ms ease',
                background: filter===f ? T.accentBg : 'rgba(255,255,255,0.04)',
                color: filter===f ? T.accent : T.muted,
                border:`1px solid ${filter===f ? T.accentBorder : T.border}` }}>
                {lbl}
              </button>
            );
          })}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px,1fr))', gap:12 }}>
          {filtered.map(p => <ProspectCard key={p.id} p={p} sc={sc}
            onClick={() => { setProspect(p); setView(p.analysis ? 'analysis' : 'detail'); }}
            onKit={() => { setProspect(p); setView('kitgen'); }}
            onAssets={() => { setProspect(p); setView('assets'); }}/>)}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:T.muted, fontSize:14 }}>No se encontraron prospectos.</div>
        )}
      </div>
      {showModal && <NewProspectModal onClose={() => setShowModal(false)}
        onAdd={p => { setProspects(prev => [p, ...prev]); setShowModal(false); }}/>}
    </div>
  );
}

function ProspectCard({ p, sc, onClick, onKit, onAssets }) {
  const [hov, setHov] = useState(false);
  const col = sc(p.opportunityScore);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:T.s2, border:`1px solid ${hov ? T.borderStrong : T.border}`, borderRadius:12,
        padding:20, transition:'border-color 120ms ease', display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:T.accentBg, border:`1px solid ${T.accentBorder}`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:T.accent, flexShrink:0 }}>
            {p.name[0]}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{p.name}</div>
            <div style={{ fontSize:11, color:T.muted }}>{p.industry} · {p.city}</div>
          </div>
        </div>
        <PKBadge status={p.status}/>
      </div>

      <div style={{ padding:'12px 0', borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Score de oportunidad</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:34, fontWeight:900, color:col, letterSpacing:'-0.03em', lineHeight:1 }}>{p.opportunityScore}</div>
          <div style={{ flex:1 }}>
            <div style={{ height:5, background:T.border, borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${p.opportunityScore}%`, background:col, borderRadius:3 }}/>
            </div>
            {p.analysis && (
              <div style={{ fontSize:10, color:T.muted, marginTop:4 }}>{p.analysis.scoreLabel}</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <PKButton variant="secondary" size="sm" style={{ flex:1, justifyContent:'center' }} onClick={onClick}>
          {p.analysis ? 'Ver análisis' : 'Analizar'}
        </PKButton>
        {p.analysis && <PKButton variant="ghost" size="sm" onClick={onKit} style={{ padding:'5px 10px' }}>⚡</PKButton>}
        {p.analysis && <PKButton variant="ghost" size="sm" onClick={onAssets} style={{ padding:'5px 10px' }}>🎨</PKButton>}
      </div>
    </div>
  );
}

/* ─── New Prospect Modal ─── */
function NewProspectModal({ onClose, onAdd }) {
  const [form, setForm] = useState({name:'',industry:'',city:'',website:'',instagram:'',facebook:'',whatsapp:'',notes:''});
  const set = (k, v) => setForm(f => ({...f,[k]:v}));
  const valid = form.name.trim() && form.industry.trim() && form.city.trim();
  const handleAdd = () => {
    if (!valid) return;
    onAdd({ id:Date.now(), ...form, status:'new', opportunityScore:Math.floor(Math.random()*30)+50,
      lastActivity:'Hace un momento', created:'Jun 1, 2026', analysis:null, kit:null });
  };
  const Field = ({label, field, placeholder}) => (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <label style={{ fontSize:11, color:T.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</label>
      <input value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder}
        style={{ background:T.s3, border:`1px solid ${T.border}`, borderRadius:7, padding:'9px 12px',
          color:T.text, fontSize:13, outline:'none' }}
        onFocus={e => e.target.style.borderColor='rgba(0,255,136,0.4)'}
        onBlur={e => e.target.style.borderColor=T.border}/>
    </div>
  );
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:T.s2, border:`1px solid ${T.borderStrong}`, borderRadius:14, width:500,
        maxHeight:'90vh', overflowY:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ padding:'20px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:T.text }}>Nuevo Prospecto</div>
            <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Agrega un negocio al sistema de inteligencia</div>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:T.muted, cursor:'pointer', fontSize:18, padding:4 }}>✕</button>
        </div>
        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:11, color:T.dim, textTransform:'uppercase', letterSpacing:'0.09em', fontWeight:700 }}>Negocio</div>
          <Field label="Nombre *" field="name" placeholder="ej. Bella Cocina"/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Industria *" field="industry" placeholder="ej. Restaurante"/>
            <Field label="Ciudad *" field="city" placeholder="ej. Monterrey, NL"/>
          </div>
          <div style={{ height:1, background:T.border, margin:'4px 0' }}/>
          <div style={{ fontSize:11, color:T.dim, textTransform:'uppercase', letterSpacing:'0.09em', fontWeight:700 }}>Canales digitales</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Website" field="website" placeholder="ejemplo.com"/>
            <Field label="Instagram" field="instagram" placeholder="@usuario"/>
            <Field label="Facebook" field="facebook" placeholder="NombrePagina"/>
            <Field label="WhatsApp" field="whatsapp" placeholder="+52 81 0000 0000"/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <label style={{ fontSize:11, color:T.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em' }}>Notas</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Observaciones, contexto, oportunidades detectadas…" rows={3}
              style={{ background:T.s3, border:`1px solid ${T.border}`, borderRadius:7, padding:'9px 12px',
                color:T.text, fontSize:13, outline:'none', resize:'none', fontFamily:'inherit' }}
              onFocus={e => e.target.style.borderColor='rgba(0,255,136,0.4)'}
              onBlur={e => e.target.style.borderColor=T.border}/>
          </div>
          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <PKButton variant="secondary" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancelar</PKButton>
            <PKButton variant="primary" onClick={handleAdd} disabled={!valid} style={{ flex:2, justifyContent:'center' }}>
              Crear Prospecto →
            </PKButton>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PKDashboard, PKProspects });
})();
