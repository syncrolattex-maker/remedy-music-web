/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Folder, FileText, ChevronRight, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

interface Section {
  id: string;
  filename: string;
  title: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    id: 'ventas',
    filename: 'VENTAS.TXT',
    title: 'CONDICIONES DE VENTA Y ENVÍO (E-COMMERCE)',
    content: `[MÉTODOS DE PAGO]
Todas las transacciones en Remedy Music VLC se procesan de forma segura a través de PayPal. No almacenamos datos financieros en nuestros servidores.

[ENVÍOS DE FORMATO FÍSICO (VINILOS Y CASETES)]
Los pedidos se procesan en un plazo de 2 a 4 días laborables. Los tiempos de tránsito dependerán de la empresa de mensajería y la zona geográfica. Los envíos internacionales pueden estar sujetos a cargos aduaneros que correrán a cargo del comprador.

[PREVENTAS (PRE-ORDERS)]
Si adquieres un artículo en preventa, el pedido completo se enviará cuando dicho artículo esté físicamente disponible en nuestro almacén.

[DEVOLUCIONES Y DAÑOS]
Debido a la naturaleza del formato analógico, solo aceptamos devoluciones si el producto llega con defectos de fábrica (ej. vinilo rayado de origen o casete defectuoso) o daños graves por el transporte. Debes notificárnoslo en un plazo máximo de 14 días desde la recepción adjuntando fotografías del estado del disco y embalaje. No nos hacemos responsables de deformaciones por exposición al calor una vez entregado el paquete.`
  },
  {
    id: 'demos',
    filename: 'DEMOS.TXT',
    title: 'POLÍTICA DE RECEPCIÓN DE DEMOS (DROPBOX)',
    content: `[RECEPCIÓN Y ESCUCHA]
En Remedy Music VLC siempre estamos buscando talento ("Diggin'"). Sin embargo, debido al volumen de material que recibimos, no podemos garantizar una respuesta ni feedback personalizado para cada maqueta enviada. Si tu sonido encaja con la visión del sello, nosotros te contactaremos.

[PROPIEDAD INTELECTUAL]
El envío de tu música a través de nuestro buzón no otorga a Remedy Music VLC ningún derecho sobre tus obras. Tú mantienes el 100% de la propiedad intelectual de tus beats y letras.

[EXENCIÓN DE RESPONSABILIDAD]
Al enviar tu demo, entiendes que nuestros productores (como DJ Rosvil o DJ Taktel) y artistas afines están creando música constantemente. Aceptas eximir a Remedy Music VLC de cualquier reclamación legal en caso de que publiquemos material que, por coincidencia, pueda tener similitudes en concepto, samples o estilo con el material que nos hayas enviado.`
  },
  {
    id: 'vinyls',
    filename: 'VINYLS.TXT',
    title: 'SERVICIO DE VINYL PRODUCTION (REMEDY X KRAKATOA)',
    content: `[NATURALEZA DEL SERVICIO]
Remedy Music VLC actúa como gestor integral del proyecto, mientras que el prensado físico se realiza en las instalaciones de Krakatoa Records.

[TIEMPOS DE PRODUCCIÓN (TIMELINES)]
Los plazos de entrega estimados en el formulario son aproximados. La fabricación de vinilos es un proceso industrial y analógico sujeto a la capacidad de la planta (Krakatoa) y a la disponibilidad de materias primas (PVC). Remedy Music VLC mantendrá al cliente informado, pero no se hace responsable de retrasos por causas de fuerza mayor en la fábrica.

[CALIDAD DE AUDIO Y ARTE]
El cliente es el único responsable de entregar los másteres de audio adaptados específicamente para corte en vinilo, así como los artes gráficos en alta resolución con las plantillas proporcionadas. Si el material no cumple los estándares técnicos, el proyecto se pausará hasta recibir los archivos correctos.

[DERECHOS DE PRENSADO]
El solicitante debe poseer o haber licenciado legalmente todos los derechos mecánicos y de autor de la música, incluyendo la limpieza de samples (Sample Clearance). Remedy Music VLC y Krakatoa Records se reservan el derecho a rechazar cualquier proyecto que infrinja leyes de copyright o contenga mensajes de odio.`
  },
  {
    id: 'web_ip',
    filename: 'WEB_IP.TXT',
    title: 'PROPIEDAD INTELECTUAL Y USO DE LA WEB',
    content: `[DERECHOS DE CONTENIDO]
Todo el contenido de esta web (incluyendo, pero no limitado a: audios, instrumentales, diseños de portadas, logotipos, fotografías, textos y código) es propiedad exclusiva de Remedy Music VLC o de sus respectivos autores, y está protegido por las leyes internacionales de propiedad intelectual.

[USO RESTRINGIDO]
Queda terminantemente prohibida la descarga, ripeo, distribución, alteración o uso comercial de los beats y tracks expuestos en esta web sin la adquisición de su formato correspondiente o una licencia explícita por escrito del sello.

[CULTURA DEL SAMPLING]
Si deseas sampear algún fragmento de nuestro catálogo oficial para tus propias producciones, debes contactarnos a través del formulario de la página de contacto para gestionar los clearances (derechos) pertinentes.`
  }
];

export const Terms: React.FC = () => {
  const navigate = useNavigate();

  // Custom styling states
  const [textColor, setTextColor] = useState<'green' | 'amber' | 'cyan' | 'white'>('green');
  const [bgColor, setBgColor] = useState<'black' | 'blue'>('black');
  const [crtEffect, setCrtEffect] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shadowColor, setShadowColor] = useState<'gray' | 'magenta'>('gray');

  // Accordions state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  // Simulating abrupt console outputs or files loading
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  // Command terminal states
  const [history, setHistory] = useState<string[]>([
    'REMEDY_MUSIC CLI [Version 1.0]',
    'Type HELP for a list of available commands.',
    'System ready.',
    ''
  ]);
  const [inputValue, setInputValue] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio helper using Web Audio API
  const playBeep = (freq = 800, duration = 0.08, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext blocked or not supported
    }
  };

  // Scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [history]);

  // Handle accordion click with simulated file loading
  const toggleSection = (id: string, filename: string) => {
    const nextState = !openSections[id];
    playBeep(nextState ? 600 : 400, 0.05, 'sine');

    if (nextState) {
      // Add command to CLI history
      setHistory(prev => [
        ...prev,
        `C:\\REMEDY_MUSIC> TYPE ${filename}`,
        `Reading sector in drive C:... Done.`,
        `Displaying ${filename}...`,
        ''
      ]);

      // Abrupt loading simulation:
      // We set a loading state for just 80ms to represent the raw terminal seek time, then display
      setLoadingFile(id);
      setTimeout(() => {
        setOpenSections(prev => ({ ...prev, [id]: true }));
        setLoadingFile(null);
        playBeep(900, 0.03, 'square');
      }, 80);
    } else {
      setOpenSections(prev => ({ ...prev, [id]: false }));
    }
  };

  // Process CLI Input
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    if (!cmd) return;

    playBeep(500, 0.06, 'triangle');
    const newHistory = [...history, `C:\\REMEDY_MUSIC> ${cmd}`];

    const parts = cmd.toLowerCase().split(' ');
    const mainCommand = parts[0];
    const arg = parts.slice(1).join(' ');

    let response: string[] = [];

    switch (mainCommand) {
      case 'help':
        response = [
          'Available commands:',
          '  HELP         - Display this list of instructions',
          '  DIR          - List files in current directory',
          '  TYPE [file]  - Display contents of a text file (e.g. TYPE VENTAS.TXT)',
          '  COLOR [color]- Change text color (green, amber, cyan, white)',
          '  BG [color]   - Change screen color (black, blue)',
          '  CRT [on/off] - Toggle retro CRT scanner effect',
          '  SOUND [on/off]- Toggle PC speaker sound effects',
          '  CLS          - Clear command log screen',
          '  BEEP         - Sound vintage PC speaker',
          '  EXIT         - Terminate shell & return home',
          ''
        ];
        break;

      case 'dir':
        response = [
          ' Volume in drive C has no label.',
          ' Directory of C:\\REMEDY_MUSIC',
          '',
          '06/01/2026  08:25 AM    <DIR>          .',
          '06/01/2026  08:25 AM    <DIR>          ..',
          '06/01/2026  08:25 AM             1,842 VENTAS.TXT',
          '06/01/2026  08:25 AM             1,230 DEMOS.TXT',
          '06/01/2026  08:25 AM             1,504 VINYLS.TXT',
          '06/01/2026  08:25 AM               978 WEB_IP.TXT',
          '               4 File(s)          5,554 bytes',
          '               2 Dir(s)     162,342,912 bytes free',
          ''
        ];
        break;

      case 'type':
      case 'cat':
        if (!arg) {
          response = ['Error: Must specify a file name. Example: TYPE VENTAS.TXT', ''];
        } else {
          const match = SECTIONS.find(
            s => s.filename.toLowerCase() === arg.toLowerCase() || s.id.toLowerCase() === arg.toLowerCase()
          );
          if (match) {
            response = [
              `Reading ${match.filename}...`,
              '----------------------------------------',
              ...match.content.split('\n'),
              '----------------------------------------',
              ''
            ];
            // Open the accordion as well!
            setOpenSections(prev => ({ ...prev, [match.id]: true }));
          } else {
            response = [`File not found: ${arg}`, ''];
          }
        }
        break;

      case 'color':
        if (['green', 'a', '2'].includes(arg)) {
          setTextColor('green');
          response = ['Text color changed to green.', ''];
        } else if (['amber', '6', 'yellow', 'e'].includes(arg)) {
          setTextColor('amber');
          response = ['Text color changed to amber.', ''];
        } else if (['cyan', 'b', 'blue-light'].includes(arg)) {
          setTextColor('cyan');
          response = ['Text color changed to cyan.', ''];
        } else if (['white', 'f', '7'].includes(arg)) {
          setTextColor('white');
          response = ['Text color changed to white.', ''];
        } else {
          response = ['Usage: COLOR [green | amber | cyan | white]', ''];
        }
        break;

      case 'bg':
        if (arg === 'black' || arg === '0') {
          setBgColor('black');
          response = ['Background color changed to black.', ''];
        } else if (arg === 'blue' || arg === '1' || arg === 'navy') {
          setBgColor('blue');
          response = ['Background color changed to blue.', ''];
        } else {
          response = ['Usage: BG [black | blue]', ''];
        }
        break;

      case 'crt':
        if (arg === 'on') {
          setCrtEffect(true);
          response = ['CRT scanner overlay: ENABLED', ''];
        } else if (arg === 'off') {
          setCrtEffect(false);
          response = ['CRT scanner overlay: DISABLED', ''];
        } else {
          response = ['Usage: CRT [on | off]', ''];
        }
        break;

      case 'sound':
        if (arg === 'on') {
          setSoundEnabled(true);
          response = ['PC speaker simulation: ENABLED', ''];
        } else if (arg === 'off') {
          setSoundEnabled(false);
          response = ['PC speaker simulation: DISABLED', ''];
        } else {
          response = ['Usage: SOUND [on | off]', ''];
        }
        break;

      case 'beep':
        playBeep(900, 0.25, 'square');
        response = ['BEEP!', ''];
        break;

      case 'cls':
        setHistory([]);
        setInputValue('');
        return;

      case 'exit':
        response = ['Exiting shell...', ''];
        setTimeout(() => navigate('/home'), 500);
        break;

      default:
        response = [
          `Bad command or file name: "${cmd}"`,
          'Type HELP for instructions.',
          ''
        ];
    }

    setHistory([...newHistory, ...response]);
    setInputValue('');
  };

  // Keyboard shortcut to focus input when clicking terminal area
  const focusTerminal = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Map theme colors to CSS colors
  const textClass = 
    textColor === 'green' ? 'text-[#39FF14]' : 
    textColor === 'amber' ? 'text-[#FFB000]' : 
    textColor === 'cyan' ? 'text-[#00FFFF]' : 'text-[#FFFFFF]';

  const borderClass = 
    textColor === 'green' ? 'border-[#39FF14]' : 
    textColor === 'amber' ? 'border-[#FFB000]' : 
    textColor === 'cyan' ? 'border-[#00FFFF]' : 'border-[#FFFFFF]';

  const fillClass = 
    textColor === 'green' ? 'fill-[#39FF14]' : 
    textColor === 'amber' ? 'fill-[#FFB000]' : 
    textColor === 'cyan' ? 'fill-[#00FFFF]' : 'fill-[#FFFFFF]';

  const shadowClass = 
    shadowColor === 'magenta' ? 'shadow-[20px_20px_0px_0px_#FF0055]' : 'shadow-[20px_20px_0px_0px_#808080]';

  const pageBgClass = bgColor === 'blue' ? 'bg-[#0000aa]' : 'bg-black';

  return (
    <main className="w-full min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-8 text-white relative font-mono pb-32">
      {/* CSS Typography and retro visual styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .terminal-font {
          font-family: 'VT323', 'Courier New', Courier, monospace;
        }
        .terminal-pixelated {
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: none;
          font-smooth: never;
          text-rendering: optimizeSpeed;
        }
        .scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          );
          background-size: 100% 4px;
        }
        .crt-glow {
          text-shadow: 0 0 3px currentColor;
        }
        .flicker {
          animation: crt-flicker 0.15s infinite;
        }
        @keyframes crt-flicker {
          0% { opacity: 0.985; }
          50% { opacity: 1; }
          100% { opacity: 0.99; }
        }
        /* Custom scrollbar for old MS-DOS style */
        .dos-scrollbar::-webkit-scrollbar {
          width: 16px;
        }
        .dos-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-left: 2px solid #555;
        }
        .dos-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border: 2px solid #333;
        }
        .dos-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
      `}</style>

      <div className="max-w-4xl mx-auto flex flex-col gap-6 relative z-10 select-none">
        
        {/* Toggles bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-[#222] border-2 border-zinc-600 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <div className="flex items-center gap-3">
            <span>COLOR:</span>
            <div className="flex gap-1.5">
              {(['green', 'amber', 'cyan', 'white'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setTextColor(c);
                    playBeep(700, 0.05);
                  }}
                  className={`px-2 py-0.5 border ${textColor === c ? 'bg-zinc-100 text-black border-white' : 'border-zinc-500 hover:text-white'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span>BG:</span>
            <button
              onClick={() => {
                setBgColor(bgColor === 'black' ? 'blue' : 'black');
                playBeep(750, 0.05);
              }}
              className="px-2 py-0.5 border border-zinc-500 hover:text-white"
            >
              {bgColor === 'black' ? 'BLACK' : 'BIOS BLUE'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setCrtEffect(!crtEffect);
                playBeep(650, 0.05);
              }}
              className="flex items-center gap-1 hover:text-white"
              title="Toggle retro CRT scanlines"
            >
              {crtEffect ? <Eye className="w-3.5 h-3.5 text-green-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>CRT</span>
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                // Beep after state updates if enabling
                if (!soundEnabled) {
                  setTimeout(() => {
                    try {
                      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                      const ctx = new AudioContext();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.type = 'square';
                      osc.frequency.value = 800;
                      gain.gain.setValueAtTime(0.04, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.08);
                    } catch(e) {}
                  }, 50);
                }
              }}
              className="flex items-center gap-1 hover:text-white"
              title="Toggle PC speaker audio effects"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-green-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>SOUND</span>
            </button>

            <button
              onClick={() => {
                setShadowColor(shadowColor === 'gray' ? 'magenta' : 'gray');
                playBeep(850, 0.05);
              }}
              className="flex items-center gap-1 hover:text-white"
            >
              <span>SHADOW:</span>
              <span className={shadowColor === 'magenta' ? 'text-pink-500 font-extrabold' : 'text-zinc-300'}>
                {shadowColor.toUpperCase()}
              </span>
            </button>
          </div>
        </div>

        {/* ── CENTRAL WINDOW CONTAINER ──────────────────────── */}
        <div 
          className={`border-[5px] border-[#808080] ${pageBgClass} ${shadowClass} relative flex flex-col overflow-hidden transition-all duration-150 terminal-pixelated`}
        >
          {/* CRT Screen Scanline Overlay */}
          {crtEffect && <div className="absolute inset-0 pointer-events-none scanlines z-10 opacity-70" />}
          {crtEffect && <div className="absolute inset-0 pointer-events-none flicker z-10" />}

          {/* ── WINDOW HEADER ───────────────────────────────── */}
          <div className="sticky top-0 bg-[#c0c0c0] text-black border-b-[5px] border-[#808080] px-4 py-1.5 flex justify-between items-center select-none z-20">
            <div className="flex items-center gap-2 font-bold font-mono text-sm tracking-wider">
              <Terminal className="w-4 h-4 text-black shrink-0" />
              <span>C:\REMEDY_MUSIC\TERMS.EXE</span>
            </div>
            
            {/* Window control buttons */}
            <div className="flex gap-1">
              <button 
                onClick={() => {
                  playBeep(350, 0.08);
                  navigate('/home');
                }}
                className="w-5 h-5 border-2 border-t-white border-l-white border-b-zinc-700 border-r-zinc-700 bg-[#c0c0c0] text-black flex items-center justify-center text-[10px] font-black hover:bg-zinc-300 active:border-b-white active:border-r-white active:border-t-zinc-700 active:border-l-zinc-700 active:translate-y-[1px]"
                title="Minimizar (Exit)"
              >
                _
              </button>
              <button 
                onClick={() => {
                  playBeep(720, 0.08);
                  alert('MAXIMIZE NOT SUPPORTED. RESOLUTION LOCKED AT 80x25.');
                }}
                className="w-5 h-5 border-2 border-t-white border-l-white border-b-zinc-700 border-r-zinc-700 bg-[#c0c0c0] text-black flex items-center justify-center text-[10px] font-black hover:bg-zinc-300 active:border-b-white active:border-r-white active:border-t-zinc-700 active:border-l-zinc-700 active:translate-y-[1px]"
                title="Maximizar"
              >
                🗖
              </button>
              <button 
                onClick={() => {
                  playBeep(250, 0.12, 'square');
                  navigate('/home');
                }}
                className="w-5 h-5 border-2 border-t-white border-l-white border-b-zinc-700 border-r-zinc-700 bg-[#c0c0c0] text-black flex items-center justify-center text-xs font-black text-red-700 hover:bg-red-200 active:border-b-white active:border-r-white active:border-t-zinc-700 active:border-l-zinc-700 active:translate-y-[1px]"
                title="Cerrar (Close)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── TERMINAL INNER CONTENT ──────────────────────── */}
          <div className={`p-4 md:p-6 flex flex-col gap-6 ${textClass} crt-glow terminal-font text-lg leading-snug max-h-[75vh] overflow-y-auto dos-scrollbar`}>
            
            {/* ASCII ART HEADER */}
            <pre className="overflow-x-auto text-[7px] sm:text-[10px] leading-tight select-none border-b border-current pb-4">
{`
  ____  _____ __  __ _____ ____   __   __
 |  _ \\| ____|  \\/  | ____|  _ \\  \\ \\ / /
 | |_) |  _| | |\\/| |  _| | | | |  \\ V / 
 |  _ <| |___| |  | | |___| |_| |   | |  
 |_| \\_\\_____|_|  |_|_____|____/    |_|  
  _____ _____ ____  __  __ ____      _   _ 
 |_   _| ____|  _ \\|  \\/  / ___|    / \\ | |
   | | |  _| | |_) | |\\/| \\___ \\   / _ \\| |
   | | | |___|  _ <| |  | |___) | / ___ \\ |___
   |_| |_____|_| \\_\\_|  |_|____/ /_/   \\_\\_____|
`}
            </pre>

            <div className="flex flex-col gap-1 border-b border-current pb-4 mb-2">
              <div className="flex justify-between flex-wrap text-sm uppercase opacity-90">
                <span>DRIVE: C: [REMEDY]</span>
                <span>VOL SIZE: 5.43 KB</span>
                <span>DATE: 06-01-2026</span>
              </div>
              <p className="text-sm text-zinc-400 mt-2">
                // HACKER SHELL ACTIVE. CLICK A SEGMENT HEADER OR TYPE IN THE COMMAND SHELL TO EXPAND.
              </p>
            </div>

            {/* ── SECTIONS ACCORDION ─────────────────────────── */}
            <div className="flex flex-col gap-4">
              {SECTIONS.map(section => {
                const isOpen = openSections[section.id];
                const isLoading = loadingFile === section.id;

                return (
                  <div 
                    key={section.id} 
                    className={`border-2 ${borderClass} p-3 sm:p-4 bg-black/40`}
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleSection(section.id, section.filename)}
                      className="w-full text-left font-bold flex items-center justify-between gap-4 uppercase select-none cursor-pointer focus:outline-none"
                    >
                      <span className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-extrabold tracking-wide">
                        <ChevronRight 
                          className={`w-5 h-5 transition-transform duration-0 ${isOpen ? 'rotate-90' : 'rotate-0'}`} 
                        />
                        <span>&gt; {section.title}</span>
                      </span>
                      <span className="text-xs border px-1 border-current uppercase opacity-80 shrink-0 hidden sm:inline">
                        {isOpen ? 'CLOSE' : 'OPEN'} [{section.filename}]
                      </span>
                    </button>

                    {/* Abrupt Loading State */}
                    {isLoading && (
                      <div className="mt-3 pt-3 border-t border-dashed border-current text-sm animate-pulse">
                        LOADING {section.filename}... SEEKING SECTORS... PLEASE WAIT...
                      </div>
                    )}

                    {/* Content Block */}
                    {!isLoading && isOpen && (
                      <div className="mt-3 pt-3 border-t border-dashed border-current text-sm sm:text-base font-normal whitespace-pre-line leading-relaxed text-zinc-300">
                        {section.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── INTERACTIVE COMMAND CONSOLE ────────────────── */}
            <div 
              onClick={focusTerminal}
              className="mt-8 border-2 border-current bg-black/80 p-3 flex flex-col gap-2 min-h-[180px] text-sm font-mono cursor-text"
            >
              <div className="flex justify-between items-center border-b border-current pb-1.5 mb-1.5 opacity-90">
                <span className="font-bold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  INTERACTIVE DOS SHELL
                </span>
                <span className="text-xs">80 x 25 CONSOLE</span>
              </div>
              
              {/* Output history */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[220px] pr-2">
                {history.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Form Input prompt */}
              <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 border-t border-dashed border-current pt-2 mt-auto">
                <span className="font-bold text-base shrink-0">C:\REMEDY_MUSIC&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-current font-bold font-mono text-base tracking-wide"
                  placeholder="type HELP or commands here..."
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </form>
            </div>

            {/* ── BACK BUTTON ───────────────────────────────── */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  playBeep(400, 0.15, 'sine');
                  navigate('/home');
                }}
                className={`px-6 py-2 border-2 ${borderClass} hover:bg-white hover:text-black font-extrabold uppercase transition-all duration-75 text-sm select-none active:translate-y-[2px]`}
              >
                &lt; BACK_TO_MAIN_DECK &gt;
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};
