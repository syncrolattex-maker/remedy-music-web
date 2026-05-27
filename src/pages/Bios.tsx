import React, { useState, useRef } from 'react';

/* ──────────────────────────────────────────────────────────────
   FLOATING ALBUM ORBIT — appears on discography hover
────────────────────────────────────────────────────────────── */
interface FloatingAlbum {
  src: string;
  label: string;
  angle: number; // deg around card centre
}

const OrbitingAlbums = ({ albums, active }: { albums: FloatingAlbum[]; active: boolean }) => (
  <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
    {albums.map((a, i) => {
      // Distribute in a wide arc
      const rad = (a.angle * Math.PI) / 180;
      const rx = 52; // horizontal radius %
      const ry = 42; // vertical radius %
      const cx = 50 + rx * Math.cos(rad);
      const cy = 50 + ry * Math.sin(rad);
      return (
        <div
          key={i}
          className="absolute w-20 h-20 border-4 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden"
          style={{
            left: `${cx}%`,
            top: `${cy}%`,
            transform: `translate(-50%,-50%) rotate(${a.angle * 0.15}deg)`,
            animation: active ? `orbit-float-${(i % 3) + 1} ${2.5 + i * 0.4}s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.18}s`,
            zIndex: 30,
          }}
        >
          <img src={a.src} alt={a.label} className="w-full h-full object-cover" />
        </div>
      );
    })}
  </div>
);

/* ──────────────────────────────────────────────────────────────
   DOSSIER CARD
────────────────────────────────────────────────────────────── */
interface DossierCardProps {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  accentColor: string;         // card background
  accentTextColor: string;
  isDark?: boolean;            // true → dark background, flip all text to white
  photo: string | null;        // null → SVG placeholder
  photoAlt: string;
  bio: string[];               // paragraphs
  milestones: { year: string; text: string }[];
  discography: { year: string; title: string }[];
  orbitAlbums: FloatingAlbum[];
  flip?: boolean;              // zigzag: photo left or right
}

const DossierCard: React.FC<DossierCardProps> = ({
  id, name, role, roleColor, accentColor, accentTextColor, isDark = false, photo, photoAlt,
  bio, milestones, discography, orbitAlbums, flip = false,
}) => {
  const [discHover, setDiscHover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Parallax on photo
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setOffset({ x: (e.clientX - cx) * 0.012, y: (e.clientY - cy) * 0.012 });
  };
  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  const PhotoBlock = () => (
    <div
      className="relative shrink-0"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: 'transform 0.15s ease-out', zIndex: 20 }}
    >
      {/* Stacked shadow layers for depth */}
      <div className="absolute inset-0 translate-x-4 translate-y-4 bg-black" />
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-zinc-700" />
      <div className="relative w-56 sm:w-64 md:w-72 border-4 border-black overflow-hidden aspect-[3/4]">
        {photo ? (
          <img src={photo} alt={photoAlt} className="w-full h-full object-cover object-top filter contrast-[1.1]" />
        ) : (
          /* SVG placeholder — high contrast silhouette style */
          <svg viewBox="0 0 300 400" className="w-full h-full bg-zinc-900">
            <rect width="300" height="400" fill="#111" />
            {/* Diagonal stripes */}
            <defs>
              <pattern id={`stripes-${id}`} width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="12" stroke="#1e1e1e" strokeWidth="6" />
              </pattern>
            </defs>
            <rect width="300" height="400" fill={`url(#stripes-${id})`} />
            {/* Body silhouette */}
            <ellipse cx="150" cy="130" rx="55" ry="65" fill="#2a2a2a" />
            <path d="M60 400 Q80 260 150 240 Q220 260 240 400Z" fill="#2a2a2a" />
            {/* Equipment hint */}
            <rect x="85" y="310" width="130" height="55" rx="4" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
            <circle cx="115" cy="338" r="15" fill="#0a0a0a" stroke="#444" strokeWidth="2" />
            <circle cx="185" cy="338" r="15" fill="#0a0a0a" stroke="#444" strokeWidth="2" />
            {/* Label */}
            <text x="150" y="385" fill="#555" fontSize="11" fontFamily="monospace" textAnchor="middle">FOTO PRÓXIMAMENTE</text>
          </svg>
        )}
        {/* Grain overlay */}
        <div className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '150px' }}
        />
      </div>
      {/* Role badge tape */}
      <div
        className="absolute -top-3 -right-4 px-3 py-1.5 border-3 border-black font-mono text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#000] rotate-2 select-none z-30"
        style={{ backgroundColor: roleColor, color: '#000' }}
      >
        {role}
      </div>
    </div>
  );

  return (
    <div
      ref={cardRef}
      id={`dossier-${id}`}
      className="relative w-full overflow-visible"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main card */}
      <div
        className="relative border-4 border-black shadow-[12px_12px_0px_0px_#000] p-6 sm:p-8 md:p-10"
        style={{ backgroundColor: accentColor }}
      >
        {/* Dossier number watermark */}
        <span className={`absolute top-4 right-6 font-heading text-[80px] md:text-[120px] leading-none select-none pointer-events-none font-extrabold ${isDark ? 'text-white/5' : 'text-black/5'}`}>
          #{id === 'rosvil' ? '01' : '02'}
        </span>

        {/* Content row */}
        <div className={`flex flex-col md:flex-row gap-8 md:gap-12 items-start ${flip ? 'md:flex-row-reverse' : ''}`}>

          {/* Photo */}
          <div className={`${flip ? 'md:self-center' : 'md:self-start'} md:-mt-16 md:-mb-8 relative z-20`}>
            <PhotoBlock />
          </div>

          {/* Text block */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

            {/* Name heading */}
            <div className={`border-b-4 pb-4 ${isDark ? 'border-zinc-700' : 'border-black'}`}>
              <p className={`font-mono text-xs uppercase tracking-[0.3em] mb-1 ${isDark ? 'text-zinc-400' : 'text-black/60'}`}>// ARTIST DOSSIER</p>
              <h2
                className="font-heading text-6xl sm:text-7xl md:text-8xl leading-none uppercase"
                style={{ color: accentTextColor }}
              >
                {name}
              </h2>
            </div>

            {/* Bio paragraphs */}
            <div className="flex flex-col gap-3">
              {bio.map((p, i) => (
                <p key={i}
                  className={`font-sans text-sm md:text-base leading-relaxed ${isDark ? 'text-zinc-300' : 'text-black/90'}`}
                  dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>

            {/* Milestones */}
            <div className={`border-t-4 pt-4 flex flex-col gap-2 ${isDark ? 'border-zinc-700' : 'border-black'}`}>
              <p className={`font-mono text-[10px] uppercase tracking-widest font-black mb-1 ${isDark ? 'text-zinc-500' : 'text-black/50'}`}>// HITOS</p>
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-3 items-baseline">
                  <span className="font-mono text-xs font-black shrink-0 bg-black text-white px-1.5 py-0.5">{m.year}</span>
                  <span className={`font-sans text-sm ${isDark ? 'text-zinc-200' : 'text-black'}`}>{m.text}</span>
                </div>
              ))}
            </div>

            {/* Discography — triggers orbit */}
            <div
              className={`border-4 p-4 relative cursor-crosshair transition-all duration-300 ${isDark ? 'border-zinc-600' : 'border-black'}`}
              style={{ backgroundColor: discHover ? '#000' : 'transparent' }}
              onMouseEnter={() => setDiscHover(true)}
              onMouseLeave={() => setDiscHover(false)}
            >
              <p className={`font-mono text-[10px] uppercase tracking-widest font-black mb-3 transition-colors ${discHover ? 'text-[#FFDE00]' : isDark ? 'text-zinc-400' : 'text-black/50'}`}>
                // DISCOGRAFÍA CLAVE — HOVER PARA VER PORTADAS
              </p>
              <div className="flex flex-col gap-1.5">
                {discography.map((d, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <span className={`font-mono text-xs font-black shrink-0 transition-colors ${discHover ? 'text-[#FF0055]' : isDark ? 'text-zinc-500' : 'text-black/40'}`}>{d.year}</span>
                    <span className={`font-heading text-xl leading-none transition-colors ${discHover ? 'text-white' : isDark ? 'text-zinc-100' : 'text-black'}`}>{d.title}</span>
                  </div>
                ))}
              </div>
              {/* Floating orbit albums */}
              <OrbitingAlbums albums={orbitAlbums} active={discHover} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   BIOS PAGE
────────────────────────────────────────────────────────────── */
export const Bios = () => {
  const rosvil: DossierCardProps = {
    id: 'rosvil',
    name: 'DJ ROSVIL',
    role: 'FUNDADOR',
    roleColor: '#FFDE00',
    accentColor: '#F5F0E8',
    accentTextColor: '#000000',
    photo: '/artists/rosvil.jpg', // DJ Rosvil — platos vinilo, hoodie verde
    photoAlt: 'DJ Rosvil en acción con platos Pioneer',
    bio: [
      'DJ, productor y <strong>coleccionista de discos de vinilo desde 2006</strong>. Fundador del sello <strong>Remedy Music Vlc en 2020</strong> y DJ referente en la escena nacional de rap.',
      'Actualmente trabaja con el MC Erick Hervé, con quien ha girado durante más de <strong>10 años por España y Latinoamérica</strong>.',
      'Sus sesiones eclécticas parten del Soul primitivo y el Funk, hasta los grooves actuales, el Boogaloo y la música Breakdance, todo mezclado con técnicas clásicas de scratch.',
      'Colaboraciones con <strong>Tote King, Juaninacka y Chicoes3</strong>.',
    ],
    milestones: [
      { year: '2006', text: 'Inicia su trayectoria como DJ y coleccionista de vinilo.' },
      { year: '2020', text: 'Funda Remedy Music Vlc.' },
      { year: '2021', text: 'EP That\'s The Way en Remedy Music Vlc.' },
      { year: '2023', text: 'LP Wall Of Shadows en vinilo.' },
      { year: '2024', text: 'Remix 45s de Los Fulanos con Fonki Cheff (Frantic Brown Beat Records).' },
      { year: '2026', text: 'Próximo: EP We Can Fly (Marzo).' },
    ],
    discography: [
      { year: '2021', title: "That's The Way EP" },
      { year: '2023', title: 'Wall Of Shadows LP' },
      { year: '2024', title: 'Los Fulanos Remix 45s' },
      { year: '2026', title: 'We Can Fly EP' },
    ],
    orbitAlbums: [
      { src: '/catalog/thats_the_way_cover.png', label: "That's The Way", angle: -60 },
      { src: '/catalog/we_can_fly_cover.jpg', label: 'We Can Fly', angle: 0 },
      { src: '/catalog/the_mixtape_2025_cover.jpg', label: 'Wall of Shadows', angle: 60 },
      { src: '/catalog/thats_the_way_1.jpg', label: 'Vinyl 1', angle: 120 },
    ],
    flip: false,
  };

  const taktel: DossierCardProps = {
    id: 'taktel',
    name: 'DJ TAKTEL',
    role: 'PROD. EJECUTIVO',
    roleColor: '#00F0FF',
    accentColor: '#0D0D0D',
    accentTextColor: '#FFDE00',
    isDark: true,
    photo: '/artists/taktel.jpg', // DJ Taktel — iluminación azul cian escenario
    photoAlt: 'DJ Taktel en escenario con iluminación azul cian',
    bio: [
      'Con <strong>25 años de trayectoria</strong> en el mundo de la música. <strong>Subcampeón del DMC Spain en 2006 y 2007</strong>.',
      'Se unió al proyecto Remedy Music en <strong>2020</strong> para aportar conocimiento musical y ejercer como productor ejecutivo.',
      'En 2026 fundó la crew <strong>Feed The Monster</strong> junto al productor Golden Samplers, colaborador histórico desde sus inicios en 1998.',
      'Sus sesiones de scratch avanzado abarcan hip hop, soul, funk, reggae y afrobeat. Ha compartido escenario con <strong>Templo Negro, Alberto Gambino, Sean Price</strong> y el pianista Vicent Colonques.',
    ],
    milestones: [
      { year: '2006–07', text: 'Subcampeón del DMC Spain consecutivo.' },
      { year: '2010', text: 'Control Remoto — álbum fundacional con Cómodo.' },
      { year: '2018', text: '10 junto a Erick Hervé.' },
      { year: '2019', text: 'Productor de la Gala Carlos Santos de la Música Valenciana.' },
      { year: '2020', text: 'Se incorpora como Productor Ejecutivo de Remedy Music Vlc.' },
      { year: '2023', text: 'Safary con Chicoes3 & Cómodo.' },
      { year: '2026', text: 'Funda la crew Feed The Monster con Golden Samplers.' },
    ],
    discography: [
      { year: '2010', title: 'Control Remoto' },
      { year: '2018', title: '10 (con Erick Hervé)' },
      { year: '2023', title: 'Safary (con Chicoes3)' },
      { year: '2025', title: 'Arrugas en el Chándal' },
    ],
    orbitAlbums: [
      { src: '/catalog/control_remoto_cover.jpg', label: 'Control Remoto', angle: -70 },
      { src: '/catalog/safary_cover.png', label: 'Safary', angle: 10 },
      { src: '/catalog/arrugas_en_el_chandal_cover.jpg', label: 'Arrugas', angle: 80 },
      { src: '/catalog/safary_record.jpg', label: 'Safary Vinyl', angle: 150 },
    ],
    flip: true,
  };

  return (
    <div className="w-full min-h-screen bg-[#080808] text-white overflow-hidden">

      {/* CSS animations for orbit */}
      <style>{`
        @keyframes orbit-float-1 {
          0%, 100% { transform: translate(-50%, -50%) rotate(-4deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(4deg) scale(1.06); }
        }
        @keyframes orbit-float-2 {
          0%, 100% { transform: translate(-50%, -50%) rotate(3deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(-5deg) scale(1.04); }
        }
        @keyframes orbit-float-3 {
          0%, 100% { transform: translate(-50%, -50%) rotate(-6deg) scale(1.02); }
          50% { transform: translate(-50%, -50%) rotate(3deg) scale(0.97); }
        }
        @keyframes marquee-bios {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-bios {
          animation: marquee-bios 18s linear infinite;
        }
      `}</style>

      {/* ── HEADER STRIP ─────────────────────────────────── */}
      <div className="border-b-4 border-[#FFDE00] bg-[#FFDE00] overflow-hidden py-2 select-none">
        <div className="flex whitespace-nowrap animate-marquee-bios">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="font-heading text-2xl text-black mx-6 tracking-widest uppercase">
              REMEDY MUSIC VLC &nbsp;·&nbsp; ARTIST ROSTER &nbsp;·&nbsp; BIOS &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── PAGE TITLE ───────────────────────────────────── */}
      <div className="px-6 md:px-12 pt-14 pb-8 text-center select-none">
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-[0.4em] mb-3">// Artist Roster — Remedy Music Vlc</p>
        <h1 className="font-heading text-6xl sm:text-8xl md:text-[10rem] leading-none text-stroke-primary-2 text-fill-transparent uppercase tracking-widest">
          LOS DJS
        </h1>
        <p className="font-mono text-xs text-zinc-600 mt-4 tracking-widest">
          DOSSIER CONFIDENCIAL · ACCESO AUTORIZADO
        </p>
      </div>

      {/* ── DOSSIER CARDS ────────────────────────────────── */}
      <div className="flex flex-col gap-0 px-4 sm:px-8 md:px-12 pb-24 max-w-7xl mx-auto">

        {/* Card 1 — Rosvil (light card) */}
        <div className="relative z-10 -mb-2">
          <DossierCard {...rosvil} />
        </div>

        {/* Connector zig-zag strip */}
        <div className="w-full flex items-center z-20 relative">
          <div className="flex-1 h-0 border-t-4 border-dashed border-[#FF0055]" />
          <div className="mx-4 border-4 border-black bg-[#FF0055] text-black font-mono text-[10px] font-black px-3 py-1 uppercase tracking-widest shadow-[4px_4px_0px_#000] rotate-[-1deg] select-none">
            + REMEDY ROSTER +
          </div>
          <div className="flex-1 h-0 border-t-4 border-dashed border-[#FF0055]" />
        </div>

        {/* Card 2 — Taktel (dark card) */}
        <div className="relative z-10 -mt-2">
          <DossierCard {...taktel} />
        </div>

      </div>
    </div>
  );
};
