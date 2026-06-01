// pk-components.jsx — UI primitives + Sidebar
;(function() {
const T = window.PK_THEME;
const { useState } = React;

/* ── Badge ── */
function PKBadge({ status }) {
  const s = window.PK_STATUS[status] || { label: status, color: '#666', bg: 'rgba(100,100,100,0.1)' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:20,
      background:s.bg, color:s.color, fontSize:11, fontWeight:600, letterSpacing:'0.02em', whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.color, flexShrink:0 }} />
      {s.label}
    </span>
  );
}

/* ── Card ── */
function PKCard({ children, style, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:T.s2, border:`1px solid ${hov && onClick ? T.borderStrong : T.border}`,
        borderRadius:10, padding:20, cursor:onClick ? 'pointer' : 'default',
        transition:'border-color 120ms ease', ...style }}>
      {children}
    </div>
  );
}

/* ── Button ── */
function PKButton({ variant='primary', size='md', children, onClick, disabled, style }) {
  const [hov, setHov] = useState(false);
  const pad = { sm:'5px 12px', md:'8px 16px', lg:'11px 22px' }[size];
  const fs  = { sm:12, md:13, lg:14 }[size];
  const base = { display:'inline-flex', alignItems:'center', gap:7, borderRadius:8,
    padding:pad, fontSize:fs, fontFamily:'inherit', cursor:disabled?'not-allowed':'pointer',
    opacity:disabled?0.45:1, transition:'all 120ms ease', border:'none', ...style };
  const v = {
    primary:   { background: hov ? '#00e87a' : T.accent, color:'#000', fontWeight:700 },
    secondary: { background: hov ? T.s3 : T.s2, color:T.text, fontWeight:500, border:`1px solid ${T.border}` },
    ghost:     { background:'transparent', color: hov ? T.text : T.muted, fontWeight:500 },
    danger:    { background: hov ? 'rgba(255,68,85,0.18)' : T.redBg, color:T.red, fontWeight:500, border:`1px solid rgba(255,68,85,0.2)` },
    accent:    { background: hov ? 'rgba(0,255,136,0.15)' : T.accentBg, color:T.accent, fontWeight:600, border:`1px solid ${T.accentBorder}` },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...v }}>{children}</button>
  );
}

/* ── TopBar ── */
function PKTopBar({ title, crumb, actions }) {
  return (
    <div style={{ height:56, borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center',
      padding:'0 28px', gap:16, flexShrink:0, background:T.bg }}>
      <div style={{ flex:1 }}>
        {crumb && <div style={{ fontSize:11, color:T.dim, marginBottom:2, letterSpacing:'0.04em' }}>{crumb}</div>}
        <div style={{ fontSize:15, fontWeight:700, color:T.text, letterSpacing:'-0.01em' }}>{title}</div>
      </div>
      {actions && <div style={{ display:'flex', gap:8, alignItems:'center' }}>{actions}</div>}
    </div>
  );
}

/* ── Tag ── */
function PKTag({ children, color }) {
  const c = color || T.muted;
  return (
    <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:4,
      background:`${c}18`, color:c, border:`1px solid ${c}30`,
      fontSize:11, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>
      {children}
    </span>
  );
}

/* ── MetricCard ── */
function PKMetric({ label, value, sub, accent }) {
  return (
    <PKCard style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:11, color:T.muted, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:800, color: accent ? T.accent : T.text,
        letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#00bb66', marginTop:8 }}>{sub}</div>}
    </PKCard>
  );
}

/* ── ScoreRing ── */
function PKScoreRing({ value, size=76 }) {
  const r = size/2 - 7;
  const c = 2*Math.PI*r;
  const dash = (value/100)*c;
  const col = value >= 70 ? T.accent : value >= 50 ? T.yellow : T.red;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={6}
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dasharray 0.6s ease' }}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fill={col} fontSize={17} fontWeight="800" fontFamily="DM Sans,system-ui">{value}</text>
    </svg>
  );
}

/* ── Sidebar ── */
const NAV_ICONS = {
  dashboard: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.3" fill="currentColor" opacity=".65"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.3" fill="currentColor" opacity=".65"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.3" fill="currentColor" opacity=".65"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.3" fill="currentColor" opacity=".65"/></svg>,
  prospects: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="5.5" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.4"/><path d="M1 13c0-2.5 2-4.5 4.5-4.5h4C12 8.5 14 10.5 14 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  detail:    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><line x1="5" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="5" y1="8" x2="8.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  analysis:  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 11L5.5 6.5l3 3L13.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  kitgen:    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L9.2 5.8 14 6.5l-3.3 3.2.8 4.5L7.5 12 3 14.2l.8-4.5L.5 6.5l4.8-.7z" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>,
  assets:    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="8.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="1.5" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="8.5" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/></svg>,
  export:    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5v8M5 5l2.5-3.5L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 10v3h9v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
};

function NavItem({ id, label, icon, indent, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onClick(id)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:9, borderRadius:7, marginBottom:1,
        padding: indent ? '6px 10px 6px 26px' : '6px 10px',
        background: active ? T.accentBg : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
        color: active ? T.accent : hov ? T.text : T.muted,
        fontSize:13, fontWeight: active ? 600 : 400, cursor:'pointer', transition:'all 100ms ease' }}>
      <span style={{ flexShrink:0, opacity: active ? 1 : 0.55 }}>{icon}</span>
      <span style={{ flex:1 }}>{label}</span>
      {active && <span style={{ width:4, height:4, borderRadius:'50%', background:T.accent, flexShrink:0 }}/>}
    </div>
  );
}

function PKSidebar({ view, setView, prospect }) {
  const user = window.PK_DATA.user;
  const mainNav = [
    { id:'dashboard', label:'Dashboard',   icon:NAV_ICONS.dashboard },
    { id:'prospects', label:'Prospectos',  icon:NAV_ICONS.prospects },
  ];
  const prospNav = prospect ? [
    { id:'analysis', label:'Análisis IA',      icon:NAV_ICONS.analysis },
    { id:'kitgen',   label:'Kit Generator',    icon:NAV_ICONS.kitgen   },
    { id:'assets',   label:'Assets PNG/JPG',   icon:NAV_ICONS.assets   },
  ] : [];

  return (
    <div style={{ width:T.sidebarW, flexShrink:0, height:'100vh', display:'flex', flexDirection:'column',
      background:T.s1, borderRight:`1px solid ${T.border}`, padding:'14px 10px', overflowY:'auto' }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:9, padding:'4px 10px 18px' }}>
        <div style={{ width:28, height:28, borderRadius:7, background:T.accent,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:900, fontSize:13, color:'#000', letterSpacing:'-0.04em', flexShrink:0 }}>R</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1.2 }}>ProspectKit</div>
          <div style={{ fontSize:10, color:T.dim, lineHeight:1 }}>by RamosMKT</div>
        </div>
      </div>

      {/* Main nav */}
      {mainNav.map(n => <NavItem key={n.id} {...n} active={view===n.id} onClick={setView}/>)}

      {/* Prospect context */}
      {prospect && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:10, color:T.dim, textTransform:'uppercase', letterSpacing:'0.1em',
            fontWeight:700, padding:'0 10px 6px' }}>
            {prospect.name.length > 18 ? prospect.name.slice(0,17)+'…' : prospect.name}
          </div>
          {prospNav.map(n => <NavItem key={n.id} {...n} indent active={view===n.id} onClick={setView}/>)}
        </div>
      )}

      <div style={{ flex:1 }}/>

      {/* User pill */}
      <div style={{ padding:'10px 10px', borderRadius:8, background:T.s2,
        border:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
        <div style={{ width:30, height:30, borderRadius:'50%', background:T.accentBg,
          border:`1px solid ${T.accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:11, fontWeight:800, color:T.accent, flexShrink:0 }}>{user.avatar}</div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</div>
          <div style={{ fontSize:10, color:T.dim }}>{user.role}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PKBadge, PKCard, PKButton, PKTopBar, PKTag, PKMetric, PKScoreRing, PKSidebar });
})();
