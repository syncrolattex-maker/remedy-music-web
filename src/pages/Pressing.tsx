import React, { useState } from 'react';

export const Pressing = () => {
  const [format, setFormat] = useState<'7inch' | '12inch' | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Play a thud sound on button press to simulate a hydraulic press
  const playPressSound = () => {
    // We use a low-frequency oscillator to simulate a heavy thud
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio API not supported or user has not interacted with document yet.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPressed(true);
    playPressSound();
    
    // Reset the visual press effect after a short delay
    setTimeout(() => {
      setIsPressed(false);
      // Here you would normally handle the actual form submission (e.g. EmailJS, backend API)
      alert('WORK ORDER INITIATED. BRACE FOR IMPACT.');
    }, 400);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-900 text-black py-20 px-4 sm:px-8">
      {/* ── BACKGROUND BLUEPRINT EFFECT ───────────────────── */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(#00F0FF 1px, transparent 1px),
            linear-gradient(90deg, #00F0FF 1px, transparent 1px),
            repeating-radial-gradient(circle at center, transparent 0, transparent 40px, #00F0FF 41px, #00F0FF 42px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%',
          backgroundPosition: '-1px -1px'
        }}
      />
      {/* Noise overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '150px' }}
      />

      {/* ── HEADER: CO-BRANDING ANIMATION ──────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto mb-16 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 select-none">
        
        <style>{`
          @keyframes float-up {
            0%, 100% { transform: translateY(15px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes float-down {
            0%, 100% { transform: translateY(-15px); }
            50% { transform: translateY(15px); }
          }
          .animate-float-up { animation: float-up 6s ease-in-out infinite; }
          .animate-float-down { animation: float-down 6s ease-in-out infinite; }
          
          /* Shake effect for form container on press */
          @keyframes hydraulic-shake {
            0% { transform: translate(0, 0); }
            20% { transform: translate(-3px, 4px) rotate(-1deg); }
            40% { transform: translate(3px, -2px) rotate(1deg); }
            60% { transform: translate(-4px, 2px) rotate(0deg); }
            80% { transform: translate(2px, -3px) rotate(-1deg); }
            100% { transform: translate(0, 0); }
          }
          .animate-shake { animation: hydraulic-shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        `}</style>

        {/* Remedy Logo (Typographic Placeholder until image is verified) */}
        <div className="animate-float-up text-center">
          <img src="/logo.png" alt="Remedy Music VLC" className="h-24 md:h-32 object-contain filter drop-shadow-[4px_4px_0_rgba(0,240,255,1)]" />
        </div>

        {/* Giant X */}
        <div className="font-heading text-6xl md:text-8xl text-white font-black drop-shadow-[4px_4px_0_#FF0055]">
          X
        </div>

        {/* Krakatoa Logo (Typographic Placeholder) */}
        <div className="animate-float-down text-center">
          <div className="border-4 border-white bg-black px-6 py-4 shadow-[8px_8px_0_#FFDE00] rotate-2">
            <span className="font-heading text-4xl md:text-5xl text-white tracking-widest uppercase">
              KRAKATOA
            </span>
            <p className="font-mono text-xs text-[#FFDE00] tracking-[0.3em] uppercase mt-1">Records</p>
          </div>
        </div>
      </div>

      {/* ── INDUSTRIAL SERVICE MESSAGE ─────────────────────── */}
      <div className="relative z-10 max-w-3xl mx-auto mb-16 border-l-8 border-[#FFDE00] bg-black p-6 md:p-8 shadow-[12px_12px_0_rgba(0,0,0,0.5)]">
        <h2 className="font-heading text-2xl md:text-4xl text-white uppercase mb-2">
          REMEDY GESTIONA TU PROYECTO Y PRODUCE EN COLABORACIÓN CON KRAKATOA RECORDS
        </h2>
        <p className="font-mono text-sm md:text-base text-[#00F0FF] tracking-wide">
          // INICIAR SECUENCIA DE PRENSADO · CALIDAD INDUSTRIAL GARANTIZADA
        </p>
      </div>

      {/* ── WORK ORDER FORM CONTAINER ──────────────────────── */}
      <div className={`relative z-10 max-w-4xl mx-auto transition-transform ${isPressed ? 'animate-shake' : ''}`}>
        <div className="border-4 border-black bg-[#E8E6E1] p-8 md:p-12 shadow-[16px_16px_0_#000] lg:shadow-[24px_24px_0_#000]">
          
          <div className="border-b-4 border-black pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="font-heading text-5xl md:text-7xl uppercase text-black leading-none">WORK ORDER</h1>
              <p className="font-mono text-sm font-black text-black/60 tracking-widest mt-2">// VINYL PRODUCTION FORM</p>
            </div>
            <div className="hidden md:block border-4 border-black p-2 bg-white">
              {/* Fake barcode */}
              <div className="flex gap-1 h-12 items-end">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="bg-black" style={{ width: `${Math.random() * 4 + 1}px`, height: `${Math.random() * 40 + 60}%` }} />
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* BLOCK 1: APPLICANT INFO */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b-2 border-black/20 pb-2">
                <span className="bg-black text-white font-mono text-xs px-2 py-1 font-black">01</span>
                <h3 className="font-heading text-2xl uppercase">Información del Solicitante</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative">
                  <label className="block font-mono text-xs font-black uppercase mb-2 ml-1">Name / Nombre</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border-4 border-black bg-white px-4 py-3 font-sans text-lg text-black outline-none transition-all duration-200 focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0_#FF0055]"
                    placeholder="Your name or label..."
                  />
                </div>
                <div className="group relative">
                  <label className="block font-mono text-xs font-black uppercase mb-2 ml-1">Email / Correo</label>
                  <input 
                    type="email" 
                    required
                    className="w-full border-4 border-black bg-white px-4 py-3 font-sans text-lg text-black outline-none transition-all duration-200 focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0_#FF0055]"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </div>

            {/* BLOCK 2: PROJECT DETAILS */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b-2 border-black/20 pb-2">
                <span className="bg-black text-white font-mono text-xs px-2 py-1 font-black">02</span>
                <h3 className="font-heading text-2xl uppercase">Detalles del Proyecto</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 group relative">
                  <label className="block font-mono text-xs font-black uppercase mb-2 ml-1">Project Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border-4 border-black bg-white px-4 py-3 font-sans text-lg text-black outline-none transition-all duration-200 focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0_#00F0FF]"
                    placeholder="Album title or EP name..."
                  />
                </div>
                <div className="group relative">
                  <label className="block font-mono text-xs font-black uppercase mb-2 ml-1">Quantity</label>
                  <input 
                    type="number" 
                    required
                    min="100"
                    step="50"
                    className="w-full border-4 border-black bg-white px-4 py-3 font-mono text-lg text-black outline-none transition-all duration-200 focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0_#00F0FF]"
                    placeholder="e.g. 300"
                  />
                </div>
                <div className="md:col-span-3 group relative">
                  <label className="block font-mono text-xs font-black uppercase mb-2 ml-1">Timeline / Plazo Deseado</label>
                  <input 
                    type="text" 
                    className="w-full border-4 border-black bg-white px-4 py-3 font-sans text-lg text-black outline-none transition-all duration-200 focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0_#00F0FF]"
                    placeholder="When do you need the vinyls?"
                  />
                </div>
              </div>
            </div>

            {/* BLOCK 3: FORMAT SELECTION */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b-2 border-black/20 pb-2">
                <span className="bg-black text-white font-mono text-xs px-2 py-1 font-black">03</span>
                <h3 className="font-heading text-2xl uppercase">Selección de Formato</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 7" Vinyl */}
                <div 
                  className={`relative border-4 border-black p-6 cursor-pointer transition-all duration-200 flex items-center justify-between group ${format === '7inch' ? 'bg-[#FFDE00] shadow-[8px_8px_0_#000] -translate-y-1 -translate-x-1' : 'bg-white hover:bg-zinc-100'}`}
                  onClick={() => setFormat('7inch')}
                >
                  <span className="font-heading text-3xl uppercase">7" Vinyl</span>
                  <span className="font-mono text-sm font-black bg-black text-white px-2 py-1">45 RPM</span>
                  
                  <div className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center relative shrink-0">
                    {format === '7inch' && (
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-black stroke-current drop-shadow-[2px_2px_0_#fff]">
                        <path d="M20 20 L80 80 M80 20 L20 80" strokeWidth="16" strokeLinecap="square" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* 12" Vinyl */}
                <div 
                  className={`relative border-4 border-black p-6 cursor-pointer transition-all duration-200 flex items-center justify-between group ${format === '12inch' ? 'bg-[#00F0FF] shadow-[8px_8px_0_#000] -translate-y-1 -translate-x-1' : 'bg-white hover:bg-zinc-100'}`}
                  onClick={() => setFormat('12inch')}
                >
                  <div className="flex flex-col">
                    <span className="font-heading text-3xl uppercase">12" Vinyl</span>
                    <span className="font-mono text-xs font-black mt-1">33⅓ or 45 RPM</span>
                  </div>
                  
                  <div className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center relative shrink-0">
                    {format === '12inch' && (
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-black stroke-current drop-shadow-[2px_2px_0_#fff]">
                        <path d="M20 20 L80 80 M80 20 L20 80" strokeWidth="16" strokeLinecap="square" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              {/* Hidden input to ensure format is "required" in form context if needed, though managed via state */}
              <input type="hidden" required value={format || ''} />
            </div>

            {/* BLOCK 4: ADDITIONAL MESSAGE */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b-2 border-black/20 pb-2">
                <span className="bg-black text-white font-mono text-xs px-2 py-1 font-black">04</span>
                <h3 className="font-heading text-2xl uppercase">Mensaje Adicional</h3>
              </div>
              
              <div className="group relative">
                <label className="block font-mono text-xs font-black uppercase mb-2 ml-1">Details (Covers, Inserts, Labels...)</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full border-4 border-black bg-white px-4 py-3 font-sans text-lg text-black outline-none transition-all duration-200 focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0_#FFDE00] resize-none"
                  placeholder="Tell us more about the artwork, special colors, test pressings..."
                />
              </div>
            </div>

            {/* SUBMIT BUTTON (CTA) */}
            <div className="pt-8">
              <button
                type="submit"
                className={`w-full block border-4 border-black bg-[#FF0055] py-6 font-heading text-4xl md:text-6xl uppercase text-white transition-all duration-[50ms]
                  ${isPressed 
                    ? 'translate-y-[16px] translate-x-[16px] shadow-none bg-red-700' 
                    : 'hover:-translate-y-2 hover:-translate-x-2 shadow-[16px_16px_0_#000] hover:shadow-[24px_24px_0_#000]'
                  }
                `}
              >
                START A PROJECT
              </button>
            </div>

          </form>

        </div>
        
        {/* Footer Note */}
        <div className="mt-8 text-center flex flex-col items-center gap-3">
          <p className="font-mono text-xs text-zinc-400 uppercase tracking-[0.2em] bg-black/50 px-4 py-2 border border-zinc-800">
            Vinyl Production by Remedy Music VLC
          </p>
        </div>

      </div>
    </div>
  );
};
