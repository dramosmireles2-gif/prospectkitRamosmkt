// pk-screens2.jsx — Prospect Detail + AI Analysis Center
;(function() {
const { useState } = React;
const T = window.PK_THEME;

/* ─── Detail ─── */
function PKDetail({ prospect: p, setView }) {
  const sc = s => s >= 85 ? T.accent : s >= 70 ? T.yellow : T.blue;
  const SocialRow = ({ icon, label, value }) => (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
      background: value ? T.s3 : 'rgba(255,68,85,0.04)', borderRadius:8,
      border:`1px solid ${value ? T.border : 'rgba(255,68,85,0.15)'}` }}>
      <span style={{ fontSize:15, opacity: value ? 1 : 0.4 }}>{icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>{label}</div>
        <div style={{ fontSize:12, color: value ? T.text : T.red, fontWeight: value ? 500 : 400,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {value || `Sin ${label.toLowerCase()} detectado`}
        </div>
      </div>
      <div style={{ width:6, height:6, borderRadius:'50%', background: value ? T.accent : T.red, flexShrink:0 }}/>
    </div>
  );

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PKTopBar title={p.name} crumb={`${p.industry} · ${p.city}`}
        actions={<>
          <PKButton variant="secondary" size="sm" onClick={() => setView('analysis')}>Ver Análisis</PKButton>
          <PKButton variant="primary" size="sm" onClick={() => setView('kitgen')}>⚡ Generar Kit</PKButton>
        </>}/>
      <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:16 }}>
        {/* Hero */}
        <div style={{ background:`linear-gradient(135deg, ${T.s2} 0%, rgba(0,255,136,0.03) 100%)`,
          border:`1px solid ${T.border}`, borderRadius:12, padding:'22px 26px',
          display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:T.accentBg, border:`1px solid ${T.accentBorder}`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, color:T.accent, flexShrink:0 }}>
            {p.name[0]}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800, color:T.text, letterSpacing:'-0.02em', marginBottom:6 }}>{p.name}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <PKBadge status={p.status}/>
              <span style={{ fontSize:12, color:T.muted }}>{p.industry}</span>
              <span style={{ fontSize:12, color:T.dim }}>·</span>
              <span style={{ fontSize:12, color:T.muted }}>{p.city}</span>
              <span style={{ fontSize:12, color:T.dim }}>·</span>
              <span style={{ fontSize:12, color:T.muted }}>{p.created}</span>
            </div>
          </div>
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <div style={{ fontSize:40, fontWeight:900, color:sc(p.opportunityScore), letterSpacing:'-0.03em', lineHeight:1 }}>
              {p.opportunityScore}
            </div>
            <div style={{ fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginTop:2 }}>Score</div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <PKCard style={{ padding:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
              Presencia Digital
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <SocialRow icon="🌐" label="Website"   value={p.website}/>
              <SocialRow icon="📷" label="Instagram" value={p.instagram}/>
              <SocialRow icon="👥" label="Facebook"  value={p.facebook}/>
              <SocialRow icon="💬" label="WhatsApp"  value={p.whatsapp}/>
            </div>
          </PKCard>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <PKCard style={{ padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Notas</div>
              <div style={{ fontSize:13, color: p.notes ? T.text : T.dim, lineHeight:1.65 }}>
                {p.notes || 'Sin notas.'}
              </div>
            </PKCard>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                {label:'Última actividad', value:p.lastActivity},
                {label:'Creado', value:p.created},
              ].map(r => (
                <PKCard key={r.label} style={{ padding:14 }}>
                  <div style={{ fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{r.label}</div>
                  <div style={{ fontSize:12, color:T.text, fontWeight:600 }}>{r.value}</div>
                </PKCard>
              ))}
            </div>
          </div>
        </div>

        {/* Nav actions */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {[
            { icon:'◈', label:'Análisis IA', desc: p.analysis ? `${p.analysis.opportunities.length} oportunidades` : 'Sin análisis',
              color:T.blue, action:() => setView('analysis') },
            { icon:'⚡', label:'Kit Generator', desc: p.kit ? 'Kit generado' : 'Generar mensajes y material',
              color:T.accent, action:() => setView('kitgen') },
            { icon:'🎨', label:'Prospecting Assets', desc:'Crear imágenes PNG/JPG',
              color:T.purple, action:() => setView('assets') },
          ].map(a => (
            <div key={a.label} onClick={a.action}
              style={{ padding:'16px 18px', borderRadius:10, background:T.s2, border:`1px solid ${T.border}`,
                cursor:'pointer', transition:'border-color 120ms ease', display:'flex', alignItems:'center', gap:12 }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.borderStrong}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
              <div style={{ width:36, height:36, borderRadius:8, background:`${a.color}12`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:a.color, flexShrink:0 }}>
                {a.icon}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color: a.color === T.accent ? T.accent : T.text }}>{a.label}</div>
                <div style={{ fontSize:11, color:T.muted }}>{a.desc}</div>
              </div>
              <span style={{ color:T.dim, fontSize:14 }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Analysis ─── */
function PKAnalysis({ prospect: p, setView }) {
  const a = p.analysis;
  const sc = s => s >= 85 ? T.accent : s >= 70 ? T.yellow : T.blue;
  const tagColors = {'Quick Win':T.accent, 'Revenue':T.yellow, 'Proyecto':T.blue, 'Retención':T.purple};
  const priorityColors = {urgente:T.red, alta:T.yellow, media:T.blue};
  const oppCfg = window.PK_OPP;

  if (!a) return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PKTopBar title="Análisis IA" crumb={p.name}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
        <div style={{ fontSize:48, opacity:0.3 }}>◈</div>
        <div style={{ fontSize:18, fontWeight:700, color:T.text }}>Sin análisis disponible</div>
        <div style={{ fontSize:13, color:T.muted, maxWidth:320, textAlign:'center', lineHeight:1.6 }}>
          Este prospecto aún no tiene análisis. Ejecuta el análisis para detectar oportunidades y obtener recomendaciones de IA.
        </div>
        <PKButton variant="primary" size="lg" onClick={() => setView('kitgen')}>⚡ Analizar y Generar Kit</PKButton>
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <PKTopBar title="Análisis IA" crumb={p.name}
        actions={<>
          <PKButton variant="secondary" size="sm" onClick={() => setView('assets')}>🎨 Crear Assets</PKButton>
          <PKButton variant="primary" size="sm" onClick={() => setView('kitgen')}>⚡ Generar Kit</PKButton>
        </>}/>
      <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Score header */}
        <div style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:14 }}>
          <PKCard style={{ padding:22, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, textAlign:'center' }}>
            <PKScoreRing value={a.opportunityScore} size={90}/>
            <div style={{ fontSize:12, fontWeight:700, color:sc(a.opportunityScore) }}>{a.scoreLabel}</div>
            <div style={{ fontSize:10, color:T.muted }}>Score de oportunidad</div>
          </PKCard>

          {/* Score breakdown */}
          <PKCard style={{ padding:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:16 }}>
              Desglose del score
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {a.scoreBreakdown.map(s => {
                const col = s.value >= 70 ? T.red : s.value >= 40 ? T.yellow : T.accent;
                return (
                  <div key={s.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5 }}>
                      <span style={{ fontSize:12, color:T.muted }}>{s.label}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:10, color:T.dim }}>{s.note}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:col, fontVariantNumeric:'tabular-nums', width:28, textAlign:'right' }}>{s.value}</span>
                      </div>
                    </div>
                    <div style={{ height:4, background:T.border, borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${s.value}%`, background:col, borderRadius:2, transition:'width 0.6s ease' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:14, padding:'10px 14px', background:T.accentBg, borderRadius:8,
              border:`1px solid ${T.accentBorder}`, fontSize:12, color:T.muted }}>
              <strong style={{ color:T.accent }}>Interpretación:</strong> Los valores bajos indican mayores oportunidades de mejora — y más servicios que venderle.
            </div>
          </PKCard>
        </div>

        {/* Missing features */}
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:12, letterSpacing:'-0.01em' }}>
            Características digitales faltantes
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {a.missingFeatures.map(f => (
              <div key={f.name} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 14px', borderRadius:20,
                background: f.critical ? T.redBg : 'rgba(255,255,255,0.04)',
                border:`1px solid ${f.critical ? 'rgba(255,68,85,0.25)' : T.border}` }}>
                <span style={{ color: f.critical ? T.red : T.muted, fontWeight:700, fontSize:12 }}>✕</span>
                <span style={{ fontSize:12, color: f.critical ? T.red : T.muted, fontWeight: f.critical ? 600 : 400 }}>{f.name}</span>
                {f.critical && <span style={{ fontSize:9, color:T.red, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700 }}>urgente</span>}
              </div>
            ))}
          </div>
        </div>

        {/* AI Recs — What to sell */}
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:12, letterSpacing:'-0.01em' }}>
            Qué vender — Recomendaciones IA
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {a.aiRecs.map((r, i) => (
              <div key={r.service} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px',
                background:T.s2, border:`1px solid ${i === 0 ? T.accentBorder : T.border}`,
                borderRadius:10, position:'relative', overflow:'hidden' }}>
                {i === 0 && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:T.accent, borderRadius:'0 2px 2px 0' }}/>}
                <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.04)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{r.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:3 }}>{r.service}</div>
                  <div style={{ fontSize:12, color:T.muted }}>{r.desc}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:10, color:T.dim, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Confianza IA</div>
                    <div style={{ fontSize:13, fontWeight:700, color: r.confidence >= 90 ? T.accent : T.yellow }}>{r.confidence}%</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:10, color:T.dim, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Ingreso est.</div>
                    <div style={{ fontSize:14, fontWeight:800, color:T.accent }}>${r.revenue.toLocaleString()}{r.unit}</div>
                  </div>
                  <PKButton variant="accent" size="sm" onClick={() => setView('kitgen')}>⚡ Kit</PKButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue potential */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <PKCard style={{ padding:20, background:`linear-gradient(135deg, ${T.s2} 0%, rgba(0,255,136,0.04) 100%)`,
            border:`1px solid ${T.accentBorder}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.accent, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:10 }}>
              Potencial de ingresos
            </div>
            <div style={{ fontSize:13, color:T.muted, marginBottom:6 }}>Este prospecto representa entre</div>
            <div style={{ fontSize:28, fontWeight:900, color:T.text, letterSpacing:'-0.02em' }}>
              ${a.revenue.min.toLocaleString()} — ${a.revenue.max.toLocaleString()}
              <span style={{ fontSize:14, fontWeight:400, color:T.muted }}> MXN/mes</span>
            </div>
            <div style={{ fontSize:12, color:T.muted, marginTop:8 }}>Con los servicios recomendados por IA</div>
          </PKCard>

          <PKCard style={{ padding:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:12 }}>
              Debilidades detectadas
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {a.weaknesses.map(w => (
                <span key={w} style={{ padding:'4px 10px', borderRadius:20, background:T.redBg,
                  border:'1px solid rgba(255,68,85,0.2)', color:T.red, fontSize:11, fontWeight:500 }}>{w}</span>
              ))}
            </div>
          </PKCard>
        </div>

        {/* Opportunities grid */}
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:12 }}>Oportunidades detectadas</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
            {a.opportunities.map(o => {
              const cfg = oppCfg[o.type] || {icon:'◉', color:T.blue};
              return (
                <PKCard key={o.title} style={{ padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:30, height:30, borderRadius:7, background:`${cfg.color}14`,
                        display:'flex', alignItems:'center', justifyContent:'center', color:cfg.color, fontSize:14 }}>{cfg.icon}</div>
                      <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{o.title}</span>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', padding:'2px 7px',
                      borderRadius:20, background:`${priorityColors[o.priority]}18`, color:priorityColors[o.priority] }}>{o.priority}</span>
                  </div>
                  <div style={{ fontSize:12, color:T.muted, lineHeight:1.6, marginBottom:10 }}>{o.desc}</div>
                  <div style={{ height:3, background:T.border, borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${o.impact}%`, background:cfg.color, borderRadius:2 }}/>
                  </div>
                  <div style={{ fontSize:10, color:T.dim, marginTop:4 }}>Impacto estimado: {o.impact}%</div>
                </PKCard>
              );
            })}
          </div>
        </div>

        {/* Action plan */}
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:12 }}>Plan de acción</div>
          <PKCard style={{ padding:0, overflow:'hidden' }}>
            {a.recs.map((r, i) => (
              <div key={r.action} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 20px',
                borderBottom: i < a.recs.length-1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:T.s3,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:T.muted, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1, fontSize:13, fontWeight:500, color:T.text }}>{r.action}</div>
                <PKTag color={tagColors[r.tag]}>{r.tag}</PKTag>
                <div style={{ textAlign:'right', minWidth:70 }}>
                  <div style={{ fontSize:10, color:T.dim }}>Impacto</div>
                  <div style={{ fontSize:12, fontWeight:700, color:T.accent }}>{r.impact}</div>
                </div>
              </div>
            ))}
          </PKCard>
        </div>

        {/* Bottom CTA */}
        <div style={{ padding:'18px 22px', background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:12,
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:T.accent, marginBottom:3 }}>Análisis completo</div>
            <div style={{ fontSize:12, color:'rgba(0,255,136,0.55)' }}>
              Genera el kit de prospección y los assets visuales personalizados
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <PKButton variant="secondary" onClick={() => setView('assets')}>🎨 Crear Assets</PKButton>
            <PKButton variant="primary" onClick={() => setView('kitgen')}>⚡ Generar Kit →</PKButton>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { PKDetail, PKAnalysis });
})();
