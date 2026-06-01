// pk-app.jsx — Main App v2
;(function() {
const { useState } = React;
const T = window.PK_THEME;

function App() {
  const [view, setView]         = useState('dashboard');
  const [prospect, setProspect] = useState(null);
  const [prospects, setProspects] = useState(window.PK_DATA.prospects);

  const navigate = (v) => {
    if (['detail','analysis','kitgen','assets'].includes(v) && !prospect) {
      setView('prospects'); return;
    }
    setView(v);
  };

  const selectProspect = (p) => { setProspect(p); setView('analysis'); };

  const handleKitGenerated = () => {
    if (!prospect) return;
    const genKit = {
      whatsapp:`Hola 👋 Vi ${prospect.name} en ${prospect.city}. Soy Carlos de RamosMKT y ayudo negocios a crecer digitalmente.\n\n¿Puedo mostrarte cómo en 10 min? Sin costo 🚀`,
      instagram:`Hola! 👋 Vi el perfil de ${prospect.name} y me encantó. Tengo algo que ayudarles a crecer — ¿lo comparto? ✨`,
      facebook:`Hola equipo de ${prospect.name}! 👋 Trabajo con negocios para aumentar clientes digitalmente. ¿Revisión gratuita? Sin compromiso.`,
      email:{subject:`Oportunidad digital para ${prospect.name} · Análisis Gratuito`,
        body:`Estimado equipo de ${prospect.name},\n\nMi nombre es Carlos Ramos de RamosMKT. Identificamos oportunidades clave de crecimiento para su negocio.\n\n¿15 minutos para revisar el análisis?\n\nCarlos Ramos · RamosMKT`}
    };
    const updated = {...prospect, status:'kit-ready', kit: prospect.kit || genKit};
    setProspect(updated);
    setProspects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const screen = () => {
    switch(view) {
      case 'dashboard': return <PKDashboard prospects={prospects} setView={navigate} setProspect={p => { setProspect(p); navigate('analysis'); }}/>;
      case 'prospects': return <PKProspects prospects={prospects} setProspects={setProspects} setView={navigate} setProspect={p => { setProspect(p); navigate('analysis'); }}/>;
      case 'detail':    return prospect ? <PKDetail   prospect={prospect} setView={navigate}/> : null;
      case 'analysis':  return prospect ? <PKAnalysis prospect={prospect} setView={navigate}/> : null;
      case 'kitgen':    return prospect ? <PKKitGen   prospect={prospect} setView={navigate} onKitGenerated={handleKitGenerated}/> : null;
      case 'assets':    return prospect ? <PKAssets   prospect={prospect} setView={navigate}/> : null;
      default:          return <PKDashboard prospects={prospects} setView={navigate} setProspect={p => { setProspect(p); navigate('analysis'); }}/>;
    }
  };

  return (
    <div style={{ display:'flex', height:'100vh', background:T.bg, overflow:'hidden' }}>
      <PKSidebar view={view} setView={navigate} prospect={prospect}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {screen()}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
})();
