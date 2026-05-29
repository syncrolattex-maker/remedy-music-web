import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, CreditCard } from 'lucide-react';
import { Track } from '../App';

interface CatalogProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onBuyTrack: (track: Track, edition: string) => void;
}

const catalogData: Track[] = [
  // 45s Club (Vinyl 7")
  {
    id: '45-1',
    title: "That's the Way",
    artist: 'Dj Rosvil',
    format: 'vinyl',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview124/v4/6b/ec/39/6bec391f-bcec-0998-1069-f14ef0a7403a/mzaf_6907891805952860261.plus.aac.p.m4a',
    price: 15.00,
    color: '#FFE6F0', // pastel pink
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/that-s-the-way-ep',
    tracks: [
      'Bboy Thing',
      'That´s The Way',
      'The Way short Version (Bonus track digital only)',
      'Way beats (Bonus track digital only)'
    ]
  },
  {
    id: '45-2',
    title: "What We've Lost",
    artist: 'Freedust feat. Mabreezee',
    format: 'vinyl',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d6/fc/f2/d6fcf221-94f1-d956-0d2c-a6c2193a6b58/mzaf_3663461496267727358.plus.aac.p.m4a',
    price: 15.00,
    color: '#FAF6EE', // cream
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/freedust-feat-mabreeze',
    tracks: [
      "What We've Lost (Vocal)",
      "What We've Lost (Instrumental)",
      "Bonus Beats"
    ]
  },
  {
    id: '45-3',
    title: 'Nuevos Capitales',
    artist: 'Dj Rosvil',
    format: 'vinyl',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    price: 18.00,
    color: '#2A464A', // dark teal from cover
    tracks: [
      'A1 Vocal',
      'B1 Instrumental',
      'B2 Bonus Beats'
    ]
  },
  {
    id: '45-4',
    title: 'We can fly',
    artist: 'Dj Rosvil',
    format: 'vinyl',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/5c/6c/86/5c6c861d-b2ff-b840-74a5-41b5943b9091/mzaf_15145812101927049115.plus.aac.p.m4a',
    price: 15.00,
    color: '#FFF9E6' // pastel yellow
  },
  
  // Raps (Vinyl 12")
  {
    id: 'rap-1',
    title: 'Kendall Syndrome',
    artist: 'Erick Hervé',
    format: 'vinyl',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/15/56/92/15569243-e3c4-ab4a-8989-755e6a2b446c/mzaf_11098362903754451430.plus.aac.p.m4a',
    price: 30.00,
    color: '#E6F7FF', // pastel blue
    tracks: [
      'MENOS 20',
      '6 DÍAS',
      'KENDALL',
      'LA SIGUIENTE',
      'S.K. (feat. Cristian Brawler & CeErre)',
      '1K',
      'PROCESOS',
      'AMOR POR ESTO'
    ]
  },
  {
    id: 'rap-2',
    title: 'Safary',
    artist: 'Chicoes3, Dj Taktel & Cómodo',
    format: 'vinyl',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a2/ba/cc/a2baccfc-1cc1-96b2-d66b-e0f0ced263bf/mzaf_14650790324370677972.plus.aac.p.m4a',
    price: 28.00,
    color: '#FAF6EE', // cream
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/safary',
    tracks: [
      'We Back.',
      'De donde salgo Ft. N.Bajozero.',
      'Mi Scalextric.',
      'Morir por.',
      'Fuego.',
      'Yo no era.',
      'Slalom Ft. SdKong.',
      'See me mal Ft. Giannis A, Dj Rosvil y Victor Sauce.',
      'Puntos Ft. Tino Bonet.',
      'Elevador Ft. Nico Miseria & Tino Bonet.',
      'Otro cliente más Ft. Tino Bonet.',
      'Pintando un cuadro Ft. Smoke God.',
      'Bolsa de plástico.',
      'Nos fuimos.'
    ]
  },
  {
    id: 'rap-3',
    title: 'The Mixtape 2025',
    artist: 'Erick Hervé',
    format: 'vinyl',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/70/7b/d9/707bd972-d0c8-f21a-24b1-d597635cbb4c/mzaf_17472200973565442155.plus.aac.p.m4a',
    price: 25.00,
    color: '#FFE6F0', // pastel pink
    tracks: [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre'
    ]
  },

  // Tape Series (Cassette)
  {
    id: 'tape-1',
    title: 'Control Remoto',
    artist: 'Dj Taktel & Cómodo',
    format: 'cassette',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/01/20/ea/0120ea9f-3a5f-9e3b-0758-f3774a37afe2/mzaf_15075094142984574226.plus.aac.p.m4a',
    price: 10.00,
    color: '#FFF3E0', // warm orange tint
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/control-remoto',
    tracks: [
      'Intro',
      'Somewhere in Brazil',
      'Mingus',
      'Groovenstein skit',
      'Delphia',
      'Superbandidos con Alberto Gambino',
      'Mendes',
      'Relaja tus arrugas',
      'Kool',
      'Green',
      'Antivirus con Soak',
      'Flor de loto con Alberto Gambino',
      'Hammond & The Yorkers',
      'Noize',
      'Ke les parece',
      'Outro'
    ]
  },
  {
    id: 'tape-2',
    title: 'Arrugas en el Chándal',
    artist: 'Dj Taktel',
    format: 'cassette',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/01/20/ea/0120ea9f-3a5f-9e3b-0758-f3774a37afe2/mzaf_15075094142984574226.plus.aac.p.m4a',
    price: 12.00,
    color: '#FFF9E6', // pastel yellow
    tracks: [
      'Tel y Sabalas (Intro) [con Golden Samplers]',
      'Qué les Parece',
      'Has Visto Dolor',
      'El Rey',
      'El Platanito',
      'Vamos al Jardín',
      'Espacio'
    ]
  },
  {
    id: 'tape-3',
    title: 'Geometría Variable',
    artist: 'Geometria Variable (Tino & Eddie)',
    format: 'cassette',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/15/56/92/15569243-e3c4-ab4a-8989-755e6a2b446c/mzaf_11098362903754451430.plus.aac.p.m4a',
    price: 10.00,
    color: '#EDE7F6', // lavender purple matching cassette shell
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/geometria-variable',
    tracks: [
      'CAROLINA',
      'ASTRAL',
      'ANCESTRAL',
      'CHAPUCERA',
      'MILES',
      'TOC',
      'NIHONGO',
      'ROMANTIC CRUISE',
      'FUSTES'
    ]
  },

  // Beats (Sampler / MPC)
  {
    id: 'beat-1',
    title: 'Sampled Head (Argent Rock 69-79)',
    artist: 'Dj Rosvil',
    format: 'beats',
    audioUrl: '/catalog/sampled_head_preview.mp3',
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/sampled-head-argent-rock-69-79',
    price: 10.00,
    color: '#D91C80', // pinkish purple
    tracks: [
      'A1 Argentrock 69-79',
      'A2 Hippies Milicos',
      'A3 Música Progresiva',
      'B1 Sampledhead (Bonus)'
    ]
  },
  {
    id: 'beat-2',
    title: 'Safary Beats',
    artist: 'Dj Rosvil',
    format: 'beats',
    audioUrl: '/catalog/safary_beats_preview.mp3',
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/safary-beats',
    price: 10.00,
    color: '#E30A17', // red
    tracks: [
      'A1 Safary (Instrumental)',
      'A2 Beat 02',
      'A3 Beat 03',
      'B1 Bonus Beat'
    ]
  },
  {
    id: 'beat-3',
    title: 'Wall of shadows',
    artist: 'Dj Rosvil',
    format: 'beats',
    audioUrl: '/catalog/wall_of_shadows_preview.mp3',
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/wall-of-shadows-2',
    price: 12.00,
    color: '#93EEA7', // glitch green
    tracks: [
      'A1 Hi!! Producers.',
      'A2 Wall On Which The Prophets Wrote.',
      'A3 Like Past Wind.',
      'B1 Italian Shadow.',
      'B2 Lake.'
    ]
  },
  {
    id: 'beat-4',
    title: 'Tempus Fugit',
    artist: 'Golden Samplers (feat. Dj Taktel)',
    format: 'beats',
    audioUrl: '/catalog/tempus_fugit_preview.mp3',
    bandcampUrl: 'https://remedymusicvlc.bandcamp.com/album/tempus-fugit',
    price: 10.00,
    color: '#D8CEBC', // sand/beige
    tracks: [
      'A1 Everything Changes.',
      'A2 Backwash.',
      'A3 Bitter.',
      'B1 Loop Playback.',
      'B2 Tempus Fugit.'
    ]
  }
];

const CassetteReel = ({ isPlaying, bgClass = 'bg-zinc-950' }: { isPlaying: boolean; bgClass?: string }) => (
  <div className={`w-3.5 h-3.5 rounded-full ${bgClass} flex items-center justify-center relative ${isPlaying ? 'animate-spin-slow' : ''} select-none pointer-events-none`}>
    {/* Gear teeth */}
    {[...Array(6)].map((_, i) => (
      <div 
        key={i} 
        className="absolute w-[1.5px] h-3 bg-zinc-600"
        style={{ transform: `rotate(${i * 30}deg)` }}
      />
    ))}
    {/* Center hole */}
    <div className="absolute w-1.5 h-1.5 rounded-full bg-black border border-zinc-800 z-10" />
  </div>
);

const renderCoverPlaceholder = (format: 'vinyl' | 'cassette' | 'beats', title: string, artist: string, color: string) => {
  return (
    <svg 
      className="w-full h-full bg-zinc-900 select-none text-white border-2 border-black" 
      viewBox="0 0 100 100"
    >
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#222" strokeWidth="0.5" />
        </pattern>
        <pattern id="stripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#333" strokeWidth="3.5" />
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#grid)" />
      {format === 'cassette' && <rect width="100%" height="100%" fill="url(#stripes)" opacity="0.3" />}

      <rect x="5" y="5" width="90" height="90" fill="none" stroke="#444" strokeWidth="1" />
      
      {/* Saturated accent block */}
      <rect x="10" y="15" width="70" height="28" fill={color} stroke="#000" strokeWidth="2" />
      <text x="50" y="32" fill="#000" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        {format === 'beats' ? 'SAMPLER' : format.toUpperCase()}
      </text>

      {/* Diagonal crossed lines (the brutalist 'X') */}
      <line x1="5" y1="5" x2="95" y2="95" stroke="#333" strokeWidth="0.5" />
      <line x1="95" y1="5" x2="5" y2="95" stroke="#333" strokeWidth="0.5" />

      {/* Artist & Title block */}
      <rect x="8" y="55" width="80" height="28" fill="#000" stroke="#fff" strokeWidth="1.5" />
      
      <text x="50" y="67" fill="#FFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
        {title.length > 15 ? title.substring(0, 13) + '..' : title}
      </text>
      
      <text x="50" y="76" fill="#FFDE00" fontSize="4.5" fontFamily="monospace" textAnchor="middle">
        {artist.toUpperCase()}
      </text>
    </svg>
  );
};

interface AlbumCardProps {
  track: Track;
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onBuyTrack: (track: Track, edition: string) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ track, currentTrack, isPlaying, onPlayTrack, onBuyTrack }) => {
  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;
  const isCassette = track.format === 'cassette';

  // Variant state for "That's the way" (id: '45-1') and "What We've Lost" (id: '45-2')
  const hasVariants = track.id === '45-1' || track.id === '45-2';
  const hasCustomSleeve = track.id === '45-1' || track.id === '45-2' || track.id === '45-3' || track.id === '45-4' || track.id === 'rap-1' || track.id === 'rap-2' || track.id === 'rap-3' || track.id === 'tape-1' || track.id === 'tape-2' || track.id === 'tape-3' || track.id === 'beat-1' || track.id === 'beat-2' || track.id === 'beat-3' || track.id === 'beat-4';
  const [selectedVariant, setSelectedVariant] = useState<number>(1);
  const [showTracklist, setShowTracklist] = useState<boolean>(false);

  const getCoverImage = () => {
    if (track.id === '45-1') return '/catalog/thats_the_way_cover.png';
    if (track.id === '45-2') return '/catalog/freedust_cover.jpg';
    if (track.id === '45-3') return '/catalog/compro_oro_cover.jpg';
    if (track.id === '45-4') return '/catalog/we_can_fly_cover.jpg';
    if (track.id === 'rap-1') return '/catalog/kendall_syndrome_cover.jpg';
    if (track.id === 'rap-2') return '/catalog/safary_cover.png';
    if (track.id === 'rap-3') return '/catalog/the_mixtape_2025_cover.jpg';
    if (track.id === 'tape-1') return '/catalog/control_remoto_cover.jpg';
    if (track.id === 'tape-2') return '/catalog/arrugas_en_el_chandal_cover_case.png';
    if (track.id === 'tape-3') return '/catalog/geometria_variable_cover.jpg';
    if (track.id === 'beat-1') return '/catalog/sampled_head_cover.jpg';
    if (track.id === 'beat-2') return '/catalog/safary_beats_cover.png';
    if (track.id === 'beat-3') return '/catalog/wall_of_shadows_cover.jpg';
    if (track.id === 'beat-4') return '/catalog/tempus_fugit_cover.jpg';
    return '';
  };

  const getRecordImage = () => {
    if (track.id === '45-1') {
      if (selectedVariant === 1) return '/catalog/thats_the_way_1.jpg';
      if (selectedVariant === 2) return '/catalog/thats_the_way_3.jpg';
      if (selectedVariant === 3) return '/catalog/thats_the_way_2.jpg';
      if (selectedVariant === 4) return '/catalog/thats_the_way_4.jpg';
    }
    if (track.id === '45-2') {
      if (selectedVariant === 1) return '/catalog/freedust_1.jpg';
      if (selectedVariant === 2) return '/catalog/freedust_2.jpg';
    }
    if (track.id === 'rap-2') {
      return '/catalog/safary_record.jpg';
    }
    if (track.id === 'rap-1') {
      return '/catalog/kendall_syndrome_record.png';
    }
    if (track.id === 'rap-3') {
      return '/catalog/the_mixtape_2025_record.jpg';
    }
    if (track.id === 'tape-2') {
      return '/catalog/arrugas_en_el_chandal_tape.png';
    }
    if (track.id === 'tape-1') {
      return '/catalog/control_remoto_tape.png';
    }
    if (track.id === 'tape-3') {
      return '/catalog/geometria_variable_tape.png';
    }
    return '';
  };

  const recordImage = getRecordImage();

  const handleBuyClick = () => {
    let edition = 'Standard';
    if (hasVariants) {
      if (track.id === '45-1') {
        if (selectedVariant === 1) edition = 'Black Vinyl - Standard';
        if (selectedVariant === 2) edition = 'Red Vinyl - Standard';
        if (selectedVariant === 3) edition = 'Black Vinyl - Spiral Label';
        if (selectedVariant === 4) edition = 'Cola Vinyl - Spiral Label';
      } else if (track.id === '45-2') {
        if (selectedVariant === 1) edition = 'Standard Vocal';
        if (selectedVariant === 2) edition = 'Spiral Label';
      }
    }
    onBuyTrack(track, edition);
  };

  return (
    <div
      style={{ backgroundColor: track.color }}
      className="brutalist-border p-4 text-black flex flex-col justify-between group transition-transform duration-300 relative select-none hover:-translate-y-1"
    >
      {/* MEDIA WRAPPER & HOVER SLIDER */}
      <div className="w-full relative mb-4 aspect-square overflow-visible">
        
        {/* 1. SLIDING MEDIA ELEMENT */}
        {track.format === 'vinyl' && (
          recordImage ? (
            /* Custom Vinyl with actual image cropped to circle */
            <div 
              className={`absolute top-[6%] left-[6%] w-[88%] h-[88%] rounded-full z-0 transition-all duration-500 group-hover:translate-x-20 group-hover:rotate-180 flex items-center justify-center shadow-md ${
                isTrackPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{ clipPath: 'circle(49% at 50% 50%)' }}
            >
              <img src={recordImage} alt="Vinyl Record" className="w-full h-full object-cover" />
            </div>
          ) : (
            /* Generic CSS-drawn vinyl */
            <div 
              className={`absolute ${hasCustomSleeve ? 'top-[6%] left-[6%]' : 'top-2 right-0'} w-[88%] aspect-square rounded-full bg-[#121212] border-4 border-[#222] z-0 transition-all duration-500 group-hover:translate-x-20 group-hover:rotate-180 flex items-center justify-center shadow-md ${
                isTrackPlaying ? 'animate-spin-slow' : ''
              }`}
            >
              <div className="w-[85%] h-[85%] rounded-full border border-zinc-800 flex items-center justify-center">
                <div className="w-[70%] h-[70%] rounded-full border border-zinc-800 flex items-center justify-center">
                  <div className="w-[45%] h-[45%] rounded-full bg-[#FF0055] border-2 border-black flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-black border border-zinc-700"></div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {track.format === 'cassette' && (
          recordImage ? (
            /* Custom cassette tape image sliding out */
            <div 
              className={`absolute top-[18%] left-[9%] w-[82%] h-[64%] z-0 transition-all duration-500 flex items-center justify-center select-none drop-shadow-[4px_4px_0px_#000] ${
                isTrackPlaying 
                  ? 'translate-x-[72%] rotate-[8deg]' 
                  : 'translate-x-0 group-hover:translate-x-[72%] group-hover:rotate-[8deg]'
              }`}
            >
              <img src={recordImage} alt="Cassette Tape" className="w-full h-full object-contain" />
              {/* Spinning Reels overlay (aligned for landscape tape) */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Left Reel */}
                <div className="absolute left-[36.2%] top-[46.5%] -translate-x-1/2 -translate-y-1/2">
                  <CassetteReel isPlaying={isTrackPlaying} bgClass="bg-transparent" />
                </div>
                {/* Right Reel */}
                <div className="absolute left-[63.8%] top-[46.5%] -translate-x-1/2 -translate-y-1/2">
                  <CassetteReel isPlaying={isTrackPlaying} bgClass="bg-transparent" />
                </div>
              </div>
            </div>
          ) : (
            /* Generic CSS-drawn landscape cassette */
            <div 
              className={`absolute top-[18%] left-[9%] w-[82%] h-[64%] bg-[#1c1c1c] border-3 border-black z-0 transition-all duration-500 rounded p-1.5 flex flex-col justify-between shadow-[4px_4px_0px_0px_#000] select-none ${
                isTrackPlaying 
                  ? 'translate-x-[72%] rotate-[8deg]' 
                  : 'translate-x-0 group-hover:translate-x-[72%] group-hover:rotate-[8deg]'
              }`}
            >
              <div className="w-full h-[40%] bg-[#00F0FF] text-black text-[5px] font-mono font-bold flex flex-col items-center justify-center border-2 border-black p-0.5 leading-none">
                <span>REMEDY CASSETTE</span>
                <span className="text-[3.5px] mt-0.5 text-zinc-800">C-60 CHROME</span>
              </div>
              <div className="flex justify-around items-center w-full my-1.5 px-3">
                <CassetteReel isPlaying={isTrackPlaying} bgClass="bg-white" />
                <CassetteReel isPlaying={isTrackPlaying} bgClass="bg-white" />
              </div>
              <div className="w-3/5 h-1.5 bg-[#121212] mx-auto border-t-2 border-zinc-700"></div>
            </div>
          )
        )}

        {track.format === 'beats' && (
          <div 
            className="absolute top-4 right-0 w-[82%] aspect-square bg-[#00F0FF] border-3 border-black z-0 transition-transform duration-500 group-hover:translate-x-16 group-hover:rotate-12 p-1.5 flex flex-col justify-between shadow-md"
          >
            <div className="w-1/3 h-5 bg-zinc-400 border border-black self-end rounded-t-sm flex items-center justify-center">
              <div className="w-1 h-3 bg-black"></div>
            </div>
            <div className="w-full h-1/2 bg-white border border-black font-mono text-[6px] text-black p-1 flex flex-col leading-none">
              <span className="font-bold text-secondary">BEATS STORAGE</span>
              <span className="text-zinc-600 mt-1">MF-2DD 1.44MB</span>
            </div>
          </div>
        )}

        {/* 2. SLEEVE COVER (ON TOP) */}
        <div className="z-10 absolute inset-0 w-full h-full transition-transform duration-300 group-hover:-translate-y-2">
          {hasCustomSleeve ? (
            getCoverImage() ? (
              track.format === 'vinyl' ? (
                /* Vinyl cover with circular mask cutout in center (uses square SVG) */
                <svg viewBox="0 0 100 100" className="w-full h-full border-2 border-black relative">
                  <defs>
                    <mask id={`sleeveMask-${track.id}`}>
                      <rect width="100" height="100" fill="white" />
                      <circle cx="50" cy="50" r="26" fill="black" />
                    </mask>
                  </defs>
                  <image 
                    href={getCoverImage()} 
                    width="100" 
                    height="100" 
                    mask={`url(#sleeveMask-${track.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <rect width="100" height="100" fill="none" stroke="#000" strokeWidth="2" />
                  <circle cx="50" cy="50" r="26.5" fill="none" stroke={track.id === '45-1' || track.id === '45-2' || track.id === '45-4' || track.id === 'rap-1' || track.id === 'rap-2' || track.id === 'rap-3' ? '#222' : '#b08b5c'} strokeWidth={track.id === '45-1' || track.id === '45-2' || track.id === '45-4' || track.id === 'rap-1' || track.id === 'rap-2' || track.id === 'rap-3' ? 1.5 : 1} />
                </svg>
              ) : (
                /* Solid square cover image for cassette and beats (full cover, no cutout) */
                <img 
                  src={getCoverImage()} 
                  alt={track.title} 
                  className="w-full h-full object-cover select-none pointer-events-none border-2 border-black" 
                />
              )
            ) : (
              /* Cardboard color background fallback */
              <svg viewBox="0 0 100 100" className="w-full h-full border-2 border-black relative">
                <rect width="100" height="100" fill="#d2b48c" mask={`url(#sleeveMask-${track.id})`} />
                <rect width="100" height="100" fill="none" stroke="#000" strokeWidth="2" />
              </svg>
            )
          ) : (
            renderCoverPlaceholder(track.format, track.title, track.artist, track.color)
          )}
        </div>
          
          {/* Play Overlay Button */}
          <button
            onClick={() => onPlayTrack(track)}
            className="absolute bottom-3 right-3 p-3 bg-[#FF0055] text-white border-2 border-black rounded-full hover:bg-black active:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_#000] z-20"
          >
            {isTrackPlaying ? (
              <Pause className="w-4 h-4 fill-current animate-pulse" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>
        </div>

      {/* INFO, PRICE & VARIANTS */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-heading text-xl uppercase truncate leading-none pt-1">
            {track.title}
          </h3>
          <span className="font-mono text-xs font-bold bg-black text-white px-2 py-0.5 border border-black">
            ${track.price.toFixed(2)}
          </span>
        </div>
        <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-wider truncate leading-none">
          {track.artist}
        </p>

        {/* VARIANT SELECTORS */}
        {hasVariants && (
          <div className="mt-2 flex flex-col gap-1 border-t border-black/10 pt-2">
            <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-700 font-bold">Edición / Color:</span>
            <div className="flex gap-2.5 items-center">
              {track.id === '45-1' && (
                <>
                  {/* Variant 1: Black (Standard) */}
                  <button 
                    type="button"
                    onClick={() => setSelectedVariant(1)}
                    title="Black Vinyl (Standard)"
                    className={`w-5.5 h-5.5 rounded-full bg-black border-2 transition-all cursor-pointer ${selectedVariant === 1 ? 'border-secondary scale-110 shadow-[2px_2px_0_0_#000]' : 'border-zinc-500 hover:scale-105'}`}
                  />
                  {/* Variant 2: Red (Standard) */}
                  <button 
                    type="button"
                    onClick={() => setSelectedVariant(2)}
                    title="Red Vinyl (Standard)"
                    className={`w-5.5 h-5.5 rounded-full bg-red-600 border-2 transition-all cursor-pointer ${selectedVariant === 2 ? 'border-secondary scale-110 shadow-[2px_2px_0_0_#000]' : 'border-zinc-500 hover:scale-105'}`}
                  />
                  {/* Variant 3: Black (Spiral label) */}
                  <button 
                    type="button"
                    onClick={() => setSelectedVariant(3)}
                    title="Black Vinyl (Spiral Label)"
                    className={`w-5.5 h-5.5 rounded-full bg-black border-2 transition-all flex items-center justify-center cursor-pointer ${selectedVariant === 3 ? 'border-secondary scale-110 shadow-[2px_2px_0_0_#000]' : 'border-zinc-500 hover:scale-105'}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </button>
                  {/* Variant 4: Cola (Spiral label) */}
                  <button 
                    type="button"
                    onClick={() => setSelectedVariant(4)}
                    title="Cola Vinyl - Spiral Label"
                    className={`w-5.5 h-5.5 rounded-full bg-[#4A2010] border-2 transition-all flex items-center justify-center cursor-pointer ${selectedVariant === 4 ? 'border-secondary scale-110 shadow-[2px_2px_0_0_#000]' : 'border-zinc-500 hover:scale-105'}`}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </button>
                </>
              )}
              {track.id === '45-2' && (
                <>
                  {/* Variant 1: Black (Standard Vocal) */}
                  <button 
                    type="button"
                    onClick={() => setSelectedVariant(1)}
                    title="Standard Vocal Label"
                    className={`w-5.5 h-5.5 rounded-full bg-black border-2 transition-all cursor-pointer ${selectedVariant === 1 ? 'border-secondary scale-110 shadow-[2px_2px_0_0_#000]' : 'border-zinc-500 hover:scale-105'}`}
                  />
                  {/* Variant 2: Black (Spiral Logo) */}
                  <button 
                    type="button"
                    onClick={() => setSelectedVariant(2)}
                    title="Remedy Spiral Label"
                    className={`w-5.5 h-5.5 rounded-full bg-black border-2 transition-all flex items-center justify-center cursor-pointer ${selectedVariant === 2 ? 'border-secondary scale-110 shadow-[2px_2px_0_0_#000]' : 'border-zinc-500 hover:scale-105'}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* TRACKLIST ACCORDION */}
        {track.tracks && (
          <div className="mt-2 flex flex-col gap-1 border-t border-black/10 pt-2">
            <button
              type="button"
              onClick={() => setShowTracklist(!showTracklist)}
              className="w-full py-1.5 px-3 bg-black hover:bg-zinc-800 text-white border-2 border-black font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-between transition-all select-none cursor-pointer"
            >
              <span>{showTracklist ? 'Ocultar Tracklist ▲' : 'Ver Tracklist ▼'}</span>
              <span>[{track.tracks.length} TEMAS]</span>
            </button>
            {showTracklist && (
              <div className="mt-1.5 max-h-32 overflow-y-auto border-2 border-black bg-zinc-950 text-white p-2 font-mono text-[9px] flex flex-col gap-1 select-text scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                {track.tracks.map((t, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start py-0.5 border-b border-zinc-800 last:border-0">
                    <span className="text-[#FF0055] font-bold">{idx + 1}.</span>
                    <span className="flex-grow">{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-2 mt-4">
        {track.bandcampUrl && (
          <a
            href={track.bandcampUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 bg-[#1da0c3] hover:bg-[#1688a6] text-white border-3 border-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-center select-none"
          >
            Listen on Bandcamp
          </a>
        )}

        <button
          onClick={handleBuyClick}
          className="w-full py-2 px-4 bg-[#FFC439] text-black border-3 border-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          <CreditCard className="w-4.5 h-4.5 stroke-[2.5]" />
          Buy with PayPal
        </button>
      </div>
    </div>
  );
};

export const Catalog = ({ currentTrack, isPlaying, onPlayTrack, onBuyTrack }: CatalogProps) => {
  const { subfamily } = useParams<{ subfamily?: string }>();
  const navigate = useNavigate();
  const filters = ['45s Club', 'Raps', 'Tape Series', 'Beats'];

  // Helper to map route parameter to catalog display filter string
  const mapParamToFilter = (param?: string): string => {
    switch (param) {
      case '45s-club': return '45s Club';
      case 'raps': return 'Raps';
      case 'tape-series': return 'Tape Series';
      case 'beats': return 'Beats';
      default: return '45s Club';
    }
  };

  const mapFilterToParam = (filter: string): string => {
    switch (filter) {
      case '45s Club': return '45s-club';
      case 'Raps': return 'raps';
      case 'Tape Series': return 'tape-series';
      case 'Beats': return 'beats';
      default: return '45s-club';
    }
  };

  const activeFilter = mapParamToFilter(subfamily);

  // Map subfamilies to the data entries
  const getSubfamily = (track: Track): string => {
    if (track.id.startsWith('45-')) return '45s Club';
    if (track.id.startsWith('rap-')) return 'Raps';
    if (track.id.startsWith('tape-')) return 'Tape Series';
    if (track.id.startsWith('beat-')) return 'Beats';
    return '45s Club';
  };

  const filteredTracks = catalogData.filter(track => getSubfamily(track) === activeFilter);

  const sections = [activeFilter];

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 relative overflow-hidden font-sans pb-32">
      
      {/* TITLE */}
      <div className="flex flex-col items-center mb-10 text-center select-none z-10 relative">
        <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl text-stroke-primary-2 text-fill-transparent tracking-widest leading-none">
          REMEDY CATALOG
        </h1>
        <p className="font-mono text-xs sm:text-sm text-zinc-400 mt-4 tracking-widest uppercase">
          // Digitalized independent record store interface //
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-4 justify-center mb-12 z-10 relative">
        {filters.map((f) => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => navigate(`/catalogo/${mapFilterToParam(f)}`)}
              className={`px-6 py-3 border-4 border-black font-bold text-sm md:text-base transition-all select-none ${
                isActive
                  ? 'bg-[#FFDE00] text-black -translate-y-1 shadow-[6px_6px_0px_0px_#000]'
                  : 'bg-[#151515] text-zinc-400 hover:bg-[#202020] hover:text-white border-zinc-900 shadow-none'
              }`}
            >
              [ {f.toUpperCase()} ]
            </button>
          );
        })}
      </div>

      {/* SECTIONS */}
      <div className="flex flex-col gap-16 z-10 relative max-w-7xl mx-auto">
        {sections.map((section) => {
          const sectionTracks = filteredTracks.filter(t => getSubfamily(t) === section);
          if (sectionTracks.length === 0) return null;

          return (
            <div key={section} className="flex flex-col gap-6">
              {/* Section Heading */}
              <div className="border-b-4 border-zinc-800 pb-2 flex items-center justify-between">
                <h2 className="font-heading text-3xl md:text-5xl tracking-widest text-[#00F0FF] uppercase">
                  // {section}
                </h2>
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                  {sectionTracks.length} items
                </span>
              </div>

              {/* Tracks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {sectionTracks.map((track) => (
                  <AlbumCard
                    key={track.id}
                    track={track}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlayTrack={onPlayTrack}
                    onBuyTrack={onBuyTrack}
                  />
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
