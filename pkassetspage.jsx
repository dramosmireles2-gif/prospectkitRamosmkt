// pk-assets-page.jsx — Prospecting Assets · HTML templates + PNG/JPG export
;(function() {
const { useState } = React;
const T = window.PK_THEME;

const TEMPLATES = [
  { id:'score-card',    label:'Score Card',          desc:'Oportunidad detectada · Landscape' },
  { id:'audit-card',    label:'Audit Card',           desc:'Gaps digitales · Visual' },
  { id:'before-after',  label:'Before / After',       desc:'Propuesta comparativa' },
  { id:'prospecting',   label:'Imagen de Prospección',desc:'Primer contacto · Impact' },
  { id:'audit-summary', label:'Resumen de Auditoría', desc:'Documento profesional' },
];

function PKAssets({ prospect: p, setView }) {
  const [tmpl, setTmpl] = useState('score-card');
  const [downloading, setDownloading] = useState(false);
  const [dlMsg, setDlMsg] = useState('');

  const doDownload = async (fmt) => {
    if (downloading) return;
    setDownloading(true);
    setDlMsg('Renderizando…');
    try {
      const el = document.getElementById('pk-asset-canvas');
      if (!el) throw new Error('Canvas not found');
      const h2c = window.html2canvas;
      if (!h2c) { setDlMsg('html2canvas no disponible'); setDownloading(false); return; }
      const canvas = await h2c(el, { scale:2, backgroundColor:'#0a0a0a', useCORS:true, logging:false });
      const link = document.createElement('a');
      const slug = p.name.replace(/\s+/g,'-').toLowerCase();
      link.download = `${slug}-${tmpl}.${fmt}`;
      link.href = canvas.toDataURL(fmt === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
      link.click();
      setDlMsg('¡Descargado!');
      setTimeout(() => setDlMsg(''), 2000);
    } catch(e) {
      setDlMsg('Error al generar');
      setTimeout(() => setDlMsg(''), 3000);
    }
    setDownloading(false);
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PKTopBar title="Prospecting Assets" crumb={p.name}
        actions={<>
          {dlMsg && <span style={{ fontSize:12, color:T.accent, fontWeight:600 }}>{dlMsg}</span>}
          <PKButton variant="secondary" size="sm" onClick={() => doDownload('png')} disabled={downloading}>↓ PNG</PKButton>
          <PKButton variant="primary" size="sm" onClick={() => doDownload('jpg')} disabled={downloading}>↓ JPG</PKButton>
        </>}/>

      <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'220px 1fr' }}>

        {/* Left: Template selector */}
        <div style={{ borderRight:`1px solid ${T.border}`, padding:16, overflowY:'auto',
          display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ fontSize:10, color:T.dim, textTransform:'uppercase', letterSpacing:'0.1em',
            fontWeight:700, marginBottom:6, padding:'0 4px' }}>Plantillas</div>
          {TEMPLATES.map(t => (
            <div key={t.id} onClick={() => setTmpl(t.id)}
              style={{ padding:'11px 14px', borderRadius:9, cursor:'pointer', transition:'all 100ms ease',
                background: tmpl===t.id ? T.accentBg : 'transparent',
                border:`1px solid ${tmpl===t.id ? T.accentBorder : 'transparent'}` }}>
              <div style={{ fontSize:13, fontWeight: tmpl===t.id ? 700 : 500,
                color: tmpl===t.id ? T.accent : T.text, marginBottom:3 }}>{t.label}</div>
              <div style={{ fontSize:10, color:T.muted, lineHeight:1.4 }}>{t.desc}</div>
            </div>
          ))}
          <div style={{ marginTop:'auto', padding:'16px 4px 4px', borderTop:`1px solid ${T.border}` }}>
            <div style={{ fontSize:10, color:T.dim, marginBottom:6 }}>Resolución de exportación</div>
            <div style={{ fontSize:11, color:T.muted }}>1200 × 630 px · 2x Retina</div>
            <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>PNG sin pérdida · JPG alta calidad</div>
          </div>
        </div>

        {/* Right: Preview + download bar */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Preview canvas area */}
          <div style={{ flex:1, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
            background:'#060606', padding:28 }}>
            <div style={{ position:'relative' }}>
              {/* Scaled preview wrapper */}
              <div style={{ width:600, height:315, overflow:'hidden', borderRadius:10,
                boxShadow:'0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)' }}>
                <div id="pk-asset-canvas"
                  style={{ width:1200, height:630, transform:'scale(0.5)', transformOrigin:'top left',
                    overflow:'hidden', fontFamily:"'DM Sans', system-ui, sans-serif" }}>
                  <AssetTemplate id={tmpl} p={p}/>
                </div>
              </div>
              <div style={{ position:'absolute', bottom:-28, left:0, right:0, textAlign:'center',
                fontSize:10, color:T.dim }}>Vista previa 50% · Exporta en 1200×630 px a 2x</div>
            </div>
          </div>

          {/* Download bar */}
          <div style={{ height:66, borderTop:`1px solid ${T.border}`, display:'flex', alignItems:'center',
            padding:'0 24px', gap:12, background:T.s1, flexShrink:0 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.text }}>
                {TEMPLATES.find(t=>t.id===tmpl)?.label}
              </div>
              <div style={{ fontSize:11, color:T.muted }}>
                {downloading ? 'Generando imagen…' : `${p.name} · listo para exportar`}
              </div>
            </div>
            <PKButton variant="secondary" size="md" onClick={() => doDownload('png')} disabled={downloading}>
              ↓ Descargar PNG
            </PKButton>
            <PKButton variant="primary" size="md" onClick={() => doDownload('jpg')} disabled={downloading}>
              ↓ Descargar JPG
            </PKButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Asset Templates (1200×630) ─── */
function AssetTemplate({ id, p }) {
  if (id === 'score-card')   return <ScoreCard p={p}/>;
  if (id === 'audit-card')   return <AuditCard p={p}/>;
  if (id === 'before-after') return <BeforeAfter p={p}/>;
  if (id === 'prospecting')  return <ProspectingImage p={p}/>;
  if (id === 'audit-summary') return <AuditSummary p={p}/>;
  return null;
}

const accent = '#00ff88';
const baseStyle = { width:'100%', height:'100%', background:'#0a0a0a', color:'#f0f0f0',
  fontFamily:"'DM Sans', system-ui, sans-serif", overflow:'hidden', position:'relative' };
const Brand = () => (
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    <div style={{ width:22, height:22, borderRadius:5, background:accent,
      display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:11, color:'#000' }}>R</div>
    <div>
      <div style={{ fontSize:12, fontWeight:700, color:'#f0f0f0', lineHeight:1.1 }}>RamosMKT</div>
      <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', lineHeight:1 }}>ramosmkt.lat</div>
    </div>
  </div>
);

/* Template 1: Score Card */
function ScoreCard({ p }) {
  const a = p.analysis;
  const score = p.opportunityScore;
  const col = score >= 85 ? accent : score >= 70 ? '#ffbb44' : '#4a9eff';
  return (
    <div style={baseStyle}>
      <div style={{ position:'absolute', top:-80, right:-80, width:360, height:360, borderRadius:'50%',
        background:`radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 60%)` }}/>
      <div style={{ position:'absolute', bottom:-60, left:-40, width:240, height:240, borderRadius:'50%',
        background:`radial-gradient(circle, rgba(74,158,255,0.05) 0%, transparent 60%)` }}/>
      <div style={{ display:'flex', height:'100%' }}>
        {/* Left 58% */}
        <div style={{ width:'58%', padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ display:'inline-block', padding:'5px 14px', borderRadius:20,
              background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.25)',
              color:accent, fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:28 }}>
              Análisis Digital
            </div>
            <div style={{ fontSize:44, fontWeight:900, color:'#f0f0f0', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:10 }}>
              {p.name}
            </div>
            <div style={{ fontSize:16, color:'rgba(255,255,255,0.4)', marginBottom:36 }}>
              {p.industry} · {p.city}
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Score de Oportunidad</span>
                <span style={{ fontSize:56, fontWeight:900, color:col, letterSpacing:'-0.04em', lineHeight:1 }}>{score}</span>
              </div>
              <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:3 }}>
                <div style={{ height:'100%', width:`${score}%`, background:col, borderRadius:3 }}/>
              </div>
            </div>
          </div>
          <Brand/>
        </div>
        {/* Right 42% */}
        {a && (
          <div style={{ width:'42%', background:'rgba(255,255,255,0.02)',
            borderLeft:'1px solid rgba(255,255,255,0.07)', padding:'48px 36px',
            display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textTransform:'uppercase',
              letterSpacing:'0.1em', fontWeight:700, marginBottom:4 }}>IA recomienda vender</div>
            {a.aiRecs.slice(0,4).map(r => (
              <div key={r.service} style={{ padding:'13px 16px', background:'rgba(255,255,255,0.04)',
                borderRadius:10, border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                  <span style={{ fontSize:18 }}>{r.icon}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:'#f0f0f0' }}>{r.service}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{r.confidence}% confianza</span>
                  <span style={{ fontSize:15, fontWeight:900, color:col }}>${r.revenue.toLocaleString()}{r.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Template 2: Audit Card */
function AuditCard({ p }) {
  const a = p.analysis;
  const features = a?.missingFeatures || [
    {name:'Google My Business',critical:true},{name:'WhatsApp Button',critical:true},
    {name:'Sitio responsivo',critical:true},{name:'Meta Ads',critical:false},
    {name:'Sistema de reservas',critical:false},{name:'Contenido activo',critical:false},
  ];
  const criticalCount = features.filter(f => f.critical).length;
  return (
    <div style={baseStyle}>
      <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%',
        background:`radial-gradient(circle, rgba(255,68,85,0.06) 0%, transparent 60%)` }}/>
      <div style={{ padding:'46px 54px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:11, color:accent, fontWeight:700, letterSpacing:'0.12em',
            textTransform:'uppercase', marginBottom:14 }}>Auditoría Digital Gratuita</div>
          <div style={{ fontSize:40, fontWeight:900, color:'#f0f0f0', letterSpacing:'-0.03em', marginBottom:6 }}>{p.name}</div>
          <div style={{ fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:36 }}>{p.industry} · {p.city}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {features.slice(0,6).map(f => (
              <div key={f.name} style={{ padding:'14px 16px', borderRadius:10,
                background: f.critical ? 'rgba(255,68,85,0.08)' : 'rgba(255,255,255,0.04)',
                border:`1px solid ${f.critical ? 'rgba(255,68,85,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                <div style={{ fontSize:20, fontWeight:900, color: f.critical ? '#ff4455' : 'rgba(255,255,255,0.3)',
                  marginBottom:6 }}>{f.critical ? '✕' : '○'}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:500 }}>{f.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'18px 22px', background:'rgba(255,68,85,0.06)',
          borderRadius:10, border:'1px solid rgba(255,68,85,0.2)' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#f0f0f0', marginBottom:3 }}>
              Detectamos <span style={{ color:'#ff4455' }}>{criticalCount} áreas críticas</span> de mejora
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Solicita el análisis completo gratuito</div>
          </div>
          <Brand/>
        </div>
      </div>
    </div>
  );
}

/* Template 3: Before / After */
function BeforeAfter({ p }) {
  const a = p.analysis;
  const before = a?.weaknesses || ['Sin presencia digital','Sin Google My Business','Sin Ads activos','Sin contenido'];
  const after = ['Presencia digital sólida','Google Maps verificado','Ads con ROI medible','Contenido 5x/semana'];
  return (
    <div style={{ ...baseStyle, display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'28px 48px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
        borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Propuesta digital para</div>
          <div style={{ fontSize:28, fontWeight:900, color:'#f0f0f0', letterSpacing:'-0.02em' }}>{p.name}</div>
        </div>
        <Brand/>
      </div>
      {/* Split */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr' }}>
        <div style={{ padding:'32px 44px', background:'rgba(255,68,85,0.04)', borderRight:'1px solid rgba(255,68,85,0.15)' }}>
          <div style={{ fontSize:12, color:'#ff4455', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.1em', marginBottom:22 }}>Situación actual</div>
          {before.slice(0,5).map(w => (
            <div key={w} style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-start' }}>
              <span style={{ color:'#ff4455', fontWeight:700, fontSize:16, flexShrink:0, lineHeight:1.3 }}>✕</span>
              <span style={{ fontSize:15, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>{w}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:'32px 44px', background:'rgba(0,255,136,0.04)' }}>
          <div style={{ fontSize:12, color:accent, fontWeight:700, textTransform:'uppercase',
            letterSpacing:'0.1em', marginBottom:22 }}>Con RamosMKT</div>
          {after.slice(0,5).map(d => (
            <div key={d} style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-start' }}>
              <span style={{ color:accent, fontWeight:700, fontSize:16, flexShrink:0, lineHeight:1.3 }}>✓</span>
              <span style={{ fontSize:15, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Template 4: Prospecting Image */
function ProspectingImage({ p }) {
  const score = p.opportunityScore;
  const col = score >= 85 ? accent : score >= 70 ? '#ffbb44' : '#4a9eff';
  const a = p.analysis;
  return (
    <div style={baseStyle}>
      <div style={{ position:'absolute', inset:0,
        background:`radial-gradient(ellipse at 70% 50%, rgba(0,255,136,0.07) 0%, transparent 55%)` }}/>
      <div style={{ position:'relative', zIndex:1, padding:'52px 60px', height:'100%',
        display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textTransform:'uppercase',
            letterSpacing:'0.12em', marginBottom:20 }}>Detectamos una oportunidad en</div>
          <div style={{ fontSize:50, fontWeight:900, color:'#f0f0f0', letterSpacing:'-0.03em',
            lineHeight:1.05, marginBottom:12 }}>{p.name}</div>
          <div style={{ fontSize:17, color:'rgba(255,255,255,0.45)', marginBottom:40 }}>
            {p.industry} · {p.city}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:28, marginBottom:36 }}>
            <div>
              <div style={{ fontSize:68, fontWeight:900, color:col, letterSpacing:'-0.05em', lineHeight:1 }}>{score}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.09em' }}>Score de oportunidad</div>
            </div>
            <div style={{ width:1, height:60, background:'rgba(255,255,255,0.1)' }}/>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {(a?.aiRecs || []).slice(0,3).map(r => (
                <div key={r.service} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:16 }}>{r.icon}</span>
                  <span style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>{r.service}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:col, marginLeft:4 }}>${r.revenue.toLocaleString()}{r.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ padding:'12px 24px', borderRadius:8, background:accent, color:'#000',
            fontSize:14, fontWeight:800, letterSpacing:'0.02em' }}>
            Análisis gratuito disponible
          </div>
          <Brand/>
        </div>
      </div>
    </div>
  );
}

/* Template 5: Audit Summary */
function AuditSummary({ p }) {
  const a = p.analysis;
  const score = p.opportunityScore;
  const col = score >= 85 ? accent : score >= 70 ? '#ffbb44' : '#4a9eff';
  return (
    <div style={{ ...baseStyle, background:'#0d0d0d' }}>
      <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
        {/* Header bar */}
        <div style={{ padding:'22px 48px', background:'rgba(0,255,136,0.06)',
          borderBottom:'1px solid rgba(0,255,136,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, color:accent, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.12em', marginBottom:4 }}>Resumen de Auditoría Digital</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#f0f0f0', letterSpacing:'-0.02em' }}>{p.name}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <Brand/>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:6 }}>Jun 2026</div>
          </div>
        </div>
        {/* Body */}
        <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', padding:'28px 48px', gap:32 }}>
          {/* Left */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:22 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:52, fontWeight:900, color:col, letterSpacing:'-0.04em', lineHeight:1 }}>{score}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Oportunidad</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>{p.industry} · {p.city}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.5 }}>{p.notes?.slice(0,80) || 'Prospecto analizado con IA'}</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:12, fontWeight:700 }}>
              Score por categoría
            </div>
            {(a?.scoreBreakdown || []).map(s => (
              <div key={s.label} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{s.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color: s.value < 40 ? accent : s.value < 70 ? '#ffbb44' : 'rgba(255,255,255,0.4)' }}>{s.value}</span>
                </div>
                <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${s.value}%`, borderRadius:2,
                    background: s.value < 40 ? accent : s.value < 70 ? '#ffbb44' : 'rgba(255,255,255,0.25)' }}/>
                </div>
              </div>
            ))}
          </div>
          {/* Right */}
          <div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:12, fontWeight:700 }}>
              Recomendaciones IA
            </div>
            {(a?.aiRecs || []).map((r, i) => (
              <div key={r.service} style={{ display:'flex', gap:10, marginBottom:12, padding:'10px 14px',
                background:'rgba(255,255,255,0.03)', borderRadius:8, border:'1px solid rgba(255,255,255,0.06)',
                alignItems:'center' }}>
                <span style={{ fontSize:16 }}>{r.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#f0f0f0' }}>{r.service}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{r.confidence}% confianza</div>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:col }}>${r.revenue.toLocaleString()}{r.unit}</div>
              </div>
            ))}
            {a?.revenue && (
              <div style={{ marginTop:16, padding:'14px 18px', background:'rgba(0,255,136,0.06)',
                border:'1px solid rgba(0,255,136,0.2)', borderRadius:10 }}>
                <div style={{ fontSize:10, color:accent, textTransform:'uppercase', letterSpacing:'0.09em', fontWeight:700, marginBottom:6 }}>
                  Potencial de ingresos
                </div>
                <div style={{ fontSize:18, fontWeight:900, color:'#f0f0f0' }}>
                  ${a.revenue.min.toLocaleString()} – ${a.revenue.max.toLocaleString()} <span style={{ fontSize:12, fontWeight:400, color:'rgba(255,255,255,0.4)' }}>MXN/mes</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PKAssets });
})();
