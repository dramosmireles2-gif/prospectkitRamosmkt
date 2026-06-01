// pk-screens3.jsx — Kit Generator
;(function() {
const { useState, useEffect } = React;
const T = window.PK_THEME;

function PKKitGen({ prospect: p, setView, onKitGenerated }) {
  const [phase, setPhase] = useState(p.kit ? 'done' : 'idle');
  const [step, setStep]   = useState(0);
  const [tab, setTab]     = useState('messages');
  const [copied, setCopied] = useState(null);

  const steps = [
    'Analizando presencia digital…',
    'Identificando oportunidades clave…',
    'Generando mensajes personalizados…',
    'Creando propuesta de valor…',
    '¡Kit de prospección listo!',
  ];

  const startGenerate = () => {
    setPhase('loading'); setStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++; setStep(s);
      if (s >= steps.length - 1) { clearInterval(iv); setTimeout(() => { setPhase('done'); onKitGenerated && onKitGenerated(); }, 600); }
    }, 750);
  };

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const kit = p.kit || {
    whatsapp: `Hola 👋 Vi ${p.name} en ${p.city} — qué negocio tan interesante.\nSoy Carlos de RamosMKT y ayudo a negocios locales a crecer digitalmente.\n\n¿Puedo mostrarte cómo en 10 minutos? Sin costo ni compromiso 🚀`,
    instagram: `Hola! 👋 Pasé por el perfil de ${p.name} y me encantó lo que hacen. Tengo una idea para ayudarles a crecer — ¿puedo compartir algo rápido? ✨`,
    facebook: `Hola equipo de ${p.name}! 👋 Trabajo con negocios para aumentar clientes con estrategias digitales. ¿Les interesa una revisión gratuita? Sin compromiso.`,
    email: {
      subject: `Oportunidad digital para ${p.name} · Análisis Gratuito`,
      body: `Estimado equipo de ${p.name},\n\nMi nombre es Carlos Ramos, director de RamosMKT. Analizamos su presencia digital e identificamos oportunidades clave de crecimiento.\n\n¿Les interesaría una llamada de 15 min para revisar el análisis completo? Sin costo ni compromiso.\n\nCarlos Ramos\nRamosMKT · ramosmkt.lat`
    }
  };

  const messages = [
    { id:'whatsapp',  label:'WhatsApp',     icon:'💬', color:'#25d366', text: kit.whatsapp },
    { id:'instagram', label:'Instagram DM', icon:'📷', color:'#e1306c', text: kit.instagram },
    { id:'facebook',  label:'Facebook DM',  icon:'👥', color:'#1877f2', text: kit.facebook },
    { id:'email',     label:'Email',         icon:'✉️', color:T.blue,
      text: kit.email ? `ASUNTO: ${kit.email.subject}\n\n${kit.email.body}` : '' },
  ];

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PKTopBar title="Kit Generator" crumb={p.name}
        actions={phase === 'done' && <>
          <PKButton variant="secondary" size="sm" onClick={() => setView('assets')}>🎨 Crear Assets →</PKButton>
        </>}/>
      <div style={{ flex:1, overflowY:'auto', padding:28 }}>

        {/* IDLE */}
        {phase === 'idle' && (
          <div style={{ maxWidth:520, margin:'0 auto', paddingTop:48, textAlign:'center',
            display:'flex', flexDirection:'column', alignItems:'center', gap:22 }}>
            <div style={{ width:64, height:64, borderRadius:16, background:T.accentBg, border:`1px solid ${T.accentBorder}`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>⚡</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:T.text, letterSpacing:'-0.02em', marginBottom:8 }}>
                Generar Kit de Prospección
              </div>
              <div style={{ fontSize:14, color:T.muted, lineHeight:1.6 }}>
                La IA generará un paquete completo de mensajes y material de contacto para <strong style={{ color:T.text }}>{p.name}</strong>.
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, width:'100%', maxWidth:380, textAlign:'left' }}>
              {['Mensaje de WhatsApp','Instagram DM','Facebook DM','Email profesional',
                'Propuesta Before/After','Copy para Ads'].map(item => (
                <div key={item} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px',
                  background:T.s2, borderRadius:8, border:`1px solid ${T.border}`, fontSize:12, color:T.muted }}>
                  <span style={{ color:T.accent, fontWeight:700, flexShrink:0 }}>✓</span> {item}
                </div>
              ))}
            </div>
            <PKButton variant="primary" size="lg" onClick={startGenerate}>⚡ Generar Kit Ahora</PKButton>
          </div>
        )}

        {/* LOADING */}
        {phase === 'loading' && (
          <div style={{ maxWidth:460, margin:'60px auto 0', display:'flex', flexDirection:'column', gap:22, alignItems:'center' }}>
            <SpinnerIcon/>
            <div style={{ width:'100%' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ fontSize:14, fontWeight:600, color:T.text }}>{steps[step]}</div>
                <div style={{ fontSize:13, color:T.accent, fontWeight:700 }}>{Math.round((step/(steps.length-1))*100)}%</div>
              </div>
              <div style={{ height:4, background:T.border, borderRadius:2 }}>
                <div style={{ height:'100%', background:T.accent, borderRadius:2,
                  width:`${(step/(steps.length-1))*100}%`, transition:'width 0.65s ease' }}/>
              </div>
            </div>
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:6 }}>
              {steps.slice(0, step+1).map((s, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                  borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ color: i < step ? T.accent : T.muted, fontSize:13, fontWeight:700, width:16 }}>
                    {i < step ? '✓' : '◌'}
                  </span>
                  <span style={{ fontSize:13, color: i < step ? T.muted : T.text }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DONE */}
        {phase === 'done' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {/* Banner */}
            <div style={{ padding:'14px 20px', background:T.accentBg, border:`1px solid ${T.accentBorder}`,
              borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ color:T.accent, fontSize:18 }}>✓</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:T.accent }}>Kit generado para {p.name}</div>
                  <div style={{ fontSize:11, color:'rgba(0,255,136,0.55)' }}>4 mensajes personalizados · listo para enviar</div>
                </div>
              </div>
              <PKButton variant="accent" size="sm" onClick={() => setView('assets')}>🎨 Crear Assets Visuales →</PKButton>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${T.border}` }}>
              {[{id:'messages',label:'Mensajes de contacto'},{id:'proposal',label:'Propuesta Before/After'}].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding:'10px 20px', background:'transparent', border:'none',
                    borderBottom: tab===t.id ? `2px solid ${T.accent}` : '2px solid transparent',
                    color: tab===t.id ? T.accent : T.muted, fontSize:13, fontWeight: tab===t.id ? 600 : 400,
                    cursor:'pointer', marginBottom:-1, fontFamily:'inherit', transition:'all 120ms ease' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'messages' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {messages.map(m => (
                  <PKCard key={m.id} style={{ padding:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:16 }}>{m.icon}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{m.label}</span>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:m.color }}/>
                      </div>
                      <PKButton variant="secondary" size="sm" onClick={() => copyText(m.id, m.text)}>
                        {copied===m.id ? '✓ Copiado' : 'Copiar'}
                      </PKButton>
                    </div>
                    <div style={{ background:T.s3, borderRadius:8, padding:'14px 16px', fontSize:13,
                      color:T.text, lineHeight:1.75, whiteSpace:'pre-wrap', fontFamily:'inherit' }}>
                      {m.text}
                    </div>
                  </PKCard>
                ))}
              </div>
            )}

            {tab === 'proposal' && (
              <PKCard style={{ padding:24 }}>
                <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:18 }}>
                  Propuesta Before / After — {p.name}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div style={{ padding:18, background:T.redBg, borderRadius:10, border:'1px solid rgba(255,68,85,0.2)' }}>
                    <div style={{ fontSize:11, color:T.red, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Situación actual</div>
                    {(p.analysis?.weaknesses || ['Sin presencia digital','Sin Google My Business','Sin Ads activos','Sin estrategia de contenido']).map(w => (
                      <div key={w} style={{ display:'flex', gap:8, marginBottom:9, fontSize:13, color:T.muted }}>
                        <span style={{ color:T.red, flexShrink:0, fontWeight:700 }}>✕</span> {w}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:18, background:T.accentBg, borderRadius:10, border:`1px solid ${T.accentBorder}` }}>
                    <div style={{ fontSize:11, color:T.accent, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Con RamosMKT</div>
                    {['Presencia digital sólida','Google Maps verificado','Ads con ROI medible','Contenido 5x/semana','WhatsApp automatizado'].map(d => (
                      <div key={d} style={{ display:'flex', gap:8, marginBottom:9, fontSize:13, color:T.muted }}>
                        <span style={{ color:T.accent, flexShrink:0, fontWeight:700 }}>✓</span> {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop:18, textAlign:'center' }}>
                  <PKButton variant="primary" onClick={() => setView('assets')}>🎨 Exportar como imagen PNG/JPG →</PKButton>
                </div>
              </PKCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SpinnerIcon() {
  const [deg, setDeg] = useState(0);
  useEffect(() => { const iv = setInterval(() => setDeg(d => d+8), 30); return () => clearInterval(iv); }, []);
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ transform:`rotate(${deg}deg)` }}>
      <circle cx="24" cy="24" r="19" stroke={`${T.accent}25`} strokeWidth="4"/>
      <path d="M24 5A19 19 0 0 1 43 24" stroke={T.accent} strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}

Object.assign(window, { PKKitGen });
})();
