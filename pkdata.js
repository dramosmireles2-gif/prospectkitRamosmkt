// pk-data.js — ProspectKit v2 · AI Intelligence Platform
window.PK_THEME = {
  bg:'#0a0a0a', s1:'#111111', s2:'#181818', s3:'#1f1f1f',
  border:'rgba(255,255,255,0.07)', borderStrong:'rgba(255,255,255,0.13)',
  text:'#f0f0f0', muted:'#777777', dim:'#363636',
  accent:'#00ff88', accentBg:'rgba(0,255,136,0.07)', accentBorder:'rgba(0,255,136,0.22)',
  red:'#ff4455', redBg:'rgba(255,68,85,0.08)',
  yellow:'#ffbb44', yellowBg:'rgba(255,187,68,0.08)',
  blue:'#4a9eff', blueBg:'rgba(74,158,255,0.08)',
  purple:'#9966ff', sidebarW:220
};
window.PK_STATUS = {
  'new':       {label:'Nuevo',      color:'#555',    bg:'rgba(85,85,85,0.12)'},
  'analyzed':  {label:'Analizado',  color:'#4a9eff', bg:'rgba(74,158,255,0.1)'},
  'kit-ready': {label:'Kit Listo',  color:'#00ff88', bg:'rgba(0,255,136,0.1)'},
  'contacted': {label:'Contactado', color:'#ffbb44', bg:'rgba(255,187,68,0.1)'},
};
window.PK_OPP = {
  gmb:   {icon:'◉', color:'#4a9eff'},
  ads:   {icon:'▲', color:'#ff7744'},
  web:   {icon:'◈', color:'#9966ff'},
  social:{icon:'⬡', color:'#00cc88'},
  ecom:  {icon:'◆', color:'#ffbb44'},
};

window.PK_DATA = {
  user:{name:'Carlos Ramos', role:'Pro · Agencia', avatar:'CR'},
  prospects:[
    {
      id:1, name:'Bella Cocina', industry:'Restaurante', city:'Monterrey, NL',
      website:'bellacocina.mx', instagram:'@bellacocina_mty', facebook:'BellaCocina', whatsapp:'+52 81 1234 5678',
      status:'kit-ready', opportunityScore:88, lastActivity:'Hace 2h', created:'May 30, 2026',
      notes:'Restaurante familiar con buena reputación local. Sin presencia digital sólida. Alto potencial para redes y Ads.',
      analysis:{
        opportunityScore:88, scoreLabel:'Alta oportunidad',
        scoreBreakdown:[
          {label:'Calidad del sitio web',   value:25,  note:'Desactualizado, sin móvil'},
          {label:'Experiencia móvil',        value:20,  note:'No responsivo'},
          {label:'Presencia en redes',       value:55,  note:'Activo pero sin estrategia'},
          {label:'Oportunidades de conv.',   value:82,  note:'Sin CTA, sin reservas'},
          {label:'Funcionalidades clave',    value:88,  note:'5 de 6 ausentes'},
        ],
        missingFeatures:[
          {name:'Google My Business', critical:true},
          {name:'WhatsApp integrado',  critical:true},
          {name:'Menú digital',        critical:false},
          {name:'Sistema de reservas', critical:false},
          {name:'Meta Ads activos',    critical:false},
          {name:'Sitio responsivo',    critical:true},
        ],
        aiRecs:[
          {service:'Landing Page',       confidence:95, revenue:3500, unit:'/mes', icon:'🌐', desc:'Sitio moderno con menú digital y reservas online'},
          {service:'Google My Business', confidence:98, revenue:800,  unit:' setup',icon:'📍', desc:'Perfil verificado — captura 200+ búsquedas/mes'},
          {service:'Meta Ads locales',   confidence:85, revenue:2000, unit:'/mes', icon:'📣', desc:'Campañas en radio 5km · ROI estimado 4x'},
          {service:'WhatsApp Business',  confidence:78, revenue:500,  unit:'/mes', icon:'💬', desc:'Automatización de mensajes y cotizaciones'},
        ],
        opportunities:[
          {type:'gmb',   title:'Google My Business', desc:'Sin perfil verificado. 89% de búsquedas locales usan Google Maps.', priority:'urgente', impact:95},
          {type:'ads',   title:'Meta Ads locales',   desc:'Radio 5km · Target 25-45 años · CPC $0.40 · ROI proyectado 4x.', priority:'alta',    impact:90},
          {type:'web',   title:'Rediseño de sitio',  desc:'Sitio 3+ años sin actualizar. Menú digital aumenta conversiones.', priority:'alta',   impact:82},
          {type:'social',title:'Contenido orgánico', desc:'5x posts/semana con Reels. Nicho con muy alto engagement.', priority:'media', impact:68},
        ],
        recs:[
          {action:'Crear perfil GMB verificado',    impact:'Muy alto',effort:'Bajo',  tag:'Quick Win'},
          {action:'Campaña Meta Ads de lanzamiento',impact:'Alto',    effort:'Medio', tag:'Revenue'},
          {action:'Rediseño web + menú digital',    impact:'Alto',    effort:'Alto',  tag:'Proyecto'},
          {action:'Plan de contenido 30 días',      impact:'Medio',   effort:'Medio', tag:'Retención'},
        ],
        revenue:{min:3500, max:12000},
        weaknesses:['Website desactualizado','Sin Google My Business','Baja frecuencia de posts','Sin estrategia de Ads'],
      },
      kit:{
        whatsapp:'Hola 👋 Vi Bella Cocina en Monterrey — qué lugar tan especial. Soy Carlos de RamosMKT y ayudo a restaurantes a atraer más clientes con estrategias digitales.\n\n¿Les gustaría ver cómo podríamos llenarles más mesas? Puedo mostrarles resultados en 10 min 🍽️',
        instagram:'Hola! 👋 Pasé por el perfil de @bellacocina_mty y me encantó lo que hacen. Tengo una idea para ayudarles a crecer en Monterrey — ¿puedo compartirles algo rápido? 🚀',
        facebook:'Hola equipo de Bella Cocina! 👋 Trabajo con restaurantes para aumentar reservaciones. ¿Les interesa una revisión gratuita de su presencia online? Sin compromiso 🍽️',
        email:{subject:'Oportunidad digital para Bella Cocina · Análisis Gratuito',
          body:'Estimado equipo de Bella Cocina,\n\nMi nombre es Carlos Ramos, director de RamosMKT. Analizamos su presencia digital e identificamos 4 oportunidades que podrían incrementar sus clientes en 30-40% en 90 días:\n\n• Sin perfil en Google My Business (~200 búsquedas/mes perdidas)\n• Sitio web sin optimización móvil (70% del tráfico es mobile)\n• Potencial sin explotar en Meta Ads locales\n\n¿Agendamos 15 minutos para revisar el análisis completo?\n\nCarlos Ramos · RamosMKT · ramosmkt.lat'}
      }
    },
    {
      id:2, name:'Taller García', industry:'Automotriz', city:'Guadalajara, JAL',
      website:'', instagram:'@taller_garcia_gdl', facebook:'TallerGarciaGDL', whatsapp:'+52 33 9876 5432',
      status:'analyzed', opportunityScore:94, lastActivity:'Ayer', created:'May 28, 2026',
      notes:'Taller con 15 años en el mercado. Sin presencia web. Opera solo por referencias.',
      analysis:{
        opportunityScore:94, scoreLabel:'Oportunidad crítica',
        scoreBreakdown:[
          {label:'Calidad del sitio web',  value:0,  note:'Sin sitio web'},
          {label:'Experiencia móvil',       value:0,  note:'Sin sitio'},
          {label:'Presencia en redes',      value:15, note:'FB inactivo 6 meses'},
          {label:'Oportunidades de conv.',  value:95, note:'Sin CTA digital'},
          {label:'Funcionalidades clave',   value:96, note:'6 de 6 ausentes'},
        ],
        missingFeatures:[
          {name:'Sitio web',            critical:true},
          {name:'Google My Business',   critical:true},
          {name:'WhatsApp Button',      critical:true},
          {name:'Sistema de citas',     critical:false},
          {name:'Meta Ads',             critical:false},
          {name:'Instagram activo',     critical:false},
        ],
        aiRecs:[
          {service:'Sitio web + Citas',  confidence:99, revenue:2500, unit:'/mes', icon:'🌐', desc:'Landing con formulario de citas y WhatsApp CTA'},
          {service:'Google My Business', confidence:99, revenue:800,  unit:' setup',icon:'📍', desc:'78% busca talleres en Google antes de visitar'},
          {service:'WhatsApp Business',  confidence:92, revenue:500,  unit:'/mes', icon:'💬', desc:'Automatización de cotizaciones y seguimiento'},
        ],
        opportunities:[
          {type:'gmb', title:'Google My Business urgente',desc:'Sector auto: 78% busca en Google antes de visitar.',priority:'urgente',impact:92},
          {type:'web', title:'Landing page + agenda',     desc:'Formulario de citas capta 15-20 leads/mes.',priority:'alta',impact:85},
        ],
        recs:[
          {action:'Crear GMB inmediatamente',   impact:'Muy alto',effort:'Bajo',  tag:'Quick Win'},
          {action:'Landing + WhatsApp CTA',     impact:'Alto',   effort:'Medio', tag:'Revenue'},
        ],
        revenue:{min:2500, max:9000},
        weaknesses:['Sin sitio web','Sin Google My Business','Facebook inactivo 6 meses','Sin sistema de citas'],
      },
      kit:null
    },
    {
      id:3, name:'Studio Lumière', industry:'Fotografía', city:'Ciudad de México',
      website:'studiolumiere.mx', instagram:'@studiolumiere', facebook:'StudioLumiereMX', whatsapp:'+52 55 5555 4444',
      status:'contacted', opportunityScore:71, lastActivity:'Hace 3 días', created:'May 25, 2026',
      notes:'Estudio fotográfico premium. Buen IG (3.2k seguidores) pero sin monetización vía Ads.',
      analysis:{
        opportunityScore:71, scoreLabel:'Buen potencial',
        scoreBreakdown:[
          {label:'Calidad del sitio web',  value:55, note:'Lento (4.2s), mejorable'},
          {label:'Experiencia móvil',       value:40, note:'No optimizado'},
          {label:'Presencia en redes',      value:70, note:'Activo, 3.2k seguidores'},
          {label:'Oportunidades de conv.',  value:65, note:'Sin ads ni CTA claro'},
          {label:'Funcionalidades clave',   value:60, note:'Sin tienda ni reservas'},
        ],
        missingFeatures:[
          {name:'Meta Ads activos',      critical:false},
          {name:'Tienda online',         critical:false},
          {name:'Optimización velocidad',critical:true},
          {name:'Sistema de reservas',   critical:false},
        ],
        aiRecs:[
          {service:'Meta Ads bodas/XV',  confidence:90, revenue:2000, unit:'/mes', icon:'📣', desc:'Temporada alta. CPC bajo. ROI muy alto'},
          {service:'Tienda de prints',   confidence:75, revenue:1500, unit:'/mes', icon:'🛒', desc:'Prints artísticos. Margen alto, ingreso pasivo'},
          {service:'SEO local',          confidence:80, revenue:800,  unit:'/mes', icon:'🔍', desc:'Posicionar en búsquedas de fotógrafos en CDMX'},
        ],
        opportunities:[
          {type:'ads',  title:'Ads bodas y XV años',  desc:'Temporada alta. CPC bajo. ROI alto en este nicho.',priority:'alta', impact:85},
          {type:'ecom', title:'Tienda de impresiones',desc:'Prints artísticos con margen alto. Ingreso pasivo.',priority:'media',impact:62},
        ],
        recs:[
          {action:'Campaña Meta Ads bodas',  impact:'Alto', effort:'Medio',tag:'Revenue'},
          {action:'Optimización velocidad',  impact:'Medio',effort:'Bajo', tag:'Quick Win'},
        ],
        revenue:{min:2000, max:7000},
        weaknesses:['Sin Meta Ads activos','Website lento (4.2s)','Sin e-commerce','Contenido poco diverso'],
      },
      kit:null
    },
    {
      id:4, name:'Farmacia Integral', industry:'Salud', city:'Puebla, PUE',
      website:'farmaciaintegral.com.mx', instagram:'@farmaciaintegral', facebook:'FarmaciaIntegralPue', whatsapp:'+52 22 2333 4455',
      status:'new', opportunityScore:76, lastActivity:'Hace 5 días', created:'May 22, 2026',
      notes:'3 sucursales. Website de 2018. Sin marketing activo desde 2022.',
      analysis:null, kit:null
    },
    {
      id:5, name:'El Rincón Dulce', industry:'Repostería', city:'León, GTO',
      website:'', instagram:'@rincondulce_leon', facebook:'', whatsapp:'+52 47 7888 9900',
      status:'new', opportunityScore:82, lastActivity:'Hace 1 semana', created:'May 18, 2026',
      notes:'Pastelería artesanal. Solo tiene Instagram. Opera 100% por WhatsApp.',
      analysis:null, kit:null
    }
  ]
};
