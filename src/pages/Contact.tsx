import React, { useState } from 'react';
import { ArrowLeft, Mail, User, MessageSquare } from 'lucide-react';

const ColoredCassetteTape = () => (
  <svg className="w-48 h-32 mx-auto my-6 text-[#FFDE00]" viewBox="0 0 100 64" fill="none">
    {/* Cassette Outer Case */}
    <rect x="2" y="2" width="96" height="60" rx="6" fill="#151515" stroke="currentColor" strokeWidth="4" />
    {/* Tape Label (Primary color) */}
    <rect x="12" y="10" width="76" height="34" rx="3" fill="#FFDE00" stroke="#000" strokeWidth="3" />
    {/* Audio Tape center window */}
    <rect x="25" y="18" width="50" height="18" rx="2" fill="#000" />
    {/* Left Spool */}
    <circle cx="38" cy="27" r="6" fill="#FFF" stroke="#FF0055" strokeWidth="3" />
    <polygon points="38,24 41,27 38,30 35,27" fill="#FF0055" />
    {/* Right Spool */}
    <circle cx="62" cy="27" r="6" fill="#FFF" stroke="#FF0055" strokeWidth="3" />
    <polygon points="62,24 65,27 62,30 59,27" fill="#FF0055" />
    {/* Label text */}
    <text x="50" y="42" fill="#000" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">REMEDY CONTACT</text>
    {/* Retro stripes on label */}
    <line x1="15" y1="13" x2="85" y2="13" stroke="#FF0055" strokeWidth="2" />
    <line x1="15" y1="16" x2="85" y2="16" stroke="#00F0FF" strokeWidth="2" />
    {/* Corner screws */}
    <circle cx="6" cy="6" r="1.5" fill="#666" />
    <circle cx="94" cy="6" r="1.5" fill="#666" />
    <circle cx="6" cy="58" r="1.5" fill="#666" />
    <circle cx="94" cy="58" r="1.5" fill="#666" />
  </svg>
);

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Float text splitter
  const renderFloatingText = (text: string, colorClass: string) => {
    return text.split('').map((char, index) => {
      if (char === ' ') return <span key={index} className="w-4"></span>;
      return (
        <span
          key={index}
          className={`animate-float-letter text-fill-transparent ${colorClass}`}
          style={{ animationDelay: `${index * 0.08}s` }}
        >
          {char}
        </span>
      );
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    // Trigger gravity falling animation
    setIsSubmitting(true);
    
    // Transition to success card after animation completes
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 800);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#080808] text-white p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* Background image with darkening overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="/contact_bg.jpg" 
          alt="Console cables background" 
          className="w-full h-full object-cover opacity-25 filter brightness-[0.6] contrast-[1.1]" 
        />
        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      <div className="w-full max-w-4xl z-10">
        
        {/* SUCCESS STATE */}
        {isSubmitted ? (
          <div className="w-full max-w-xl mx-auto brutalist-border p-8 bg-[#121212] text-center animate-success-pop flex flex-col items-center">
            <h2 className="font-heading text-5xl md:text-7xl text-[#FFDE00] leading-none mb-2">TAPE RECEIVED</h2>
            <p className="font-mono text-zinc-400 text-sm mb-6">TRANSMISSION OK // BUFFER STORED</p>
            
            <ColoredCassetteTape />

            <div className="w-full text-left font-mono bg-black p-4 brutalist-border border-zinc-800 text-xs text-zinc-300 gap-2 flex flex-col mb-8 mt-2">
              <div><span className="text-[#00F0FF]">SENDER:</span> {name} &lt;{email}&gt;</div>
              <div className="border-t border-zinc-800 pt-2 mt-2 break-all">
                <span className="text-zinc-500">// MESSAGE:</span> &quot;{message}&quot;
              </div>
            </div>

            <button
              onClick={resetForm}
              className="mpc-button flex items-center gap-2 text-base font-bold bg-[#00F0FF] hover:bg-[#3ce5ff]"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              SEND ANOTHER MESSAGE
            </button>
          </div>
        ) : (
          
          /* FORM STATE */
          <div className={`${isSubmitting ? 'animate-gravity-fall' : ''} transition-all duration-300`}>
            
            {/* FLOATING HEADER */}
            <div className="flex flex-col items-center mb-10 text-center select-none">
              <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl flex justify-center flex-wrap gap-x-3 tracking-wider font-extrabold leading-none">
                <span className="flex">{renderFloatingText("CONTACT", "text-stroke-primary-2")}</span>
                <span className="flex">{renderFloatingText("REMEDY", "text-stroke-white-2")}</span>
              </h1>
              <p className="font-mono text-xs sm:text-sm text-zinc-400 mt-4 tracking-widest uppercase">
                // Analog Console Channel Interface v4.1 //
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: FIELDS */}
              <div className="flex flex-col gap-6">
                
                {/* NAME FIELD */}
                <div className="flex flex-col gap-2 relative">
                  <label className="font-mono text-xs text-zinc-400 flex items-center gap-1.5 font-bold">
                    <User className="w-4.5 h-4.5 text-[#FF0055]" />
                    01. NOMBRE COMPLETO *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your handle..."
                    className="brutalist-input-magenta w-full"
                  />
                </div>

                {/* EMAIL FIELD */}
                <div className="flex flex-col gap-2 relative">
                  <label className="font-mono text-xs text-zinc-400 flex items-center gap-1.5 font-bold">
                    <Mail className="w-4.5 h-4.5 text-[#00F0FF]" />
                    02. CORREO ELECTRÓNICO *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@server.domain"
                    className="brutalist-input-cyan w-full"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: TEXTAREA */}
              <div className="flex flex-col gap-6">
                
                {/* MESSAGE FIELD */}
                <div className="flex flex-col gap-2 relative h-full">
                  <label className="font-mono text-xs text-zinc-400 flex items-center gap-1.5 font-bold">
                    <MessageSquare className="w-4.5 h-4.5 text-[#FF0055]" />
                    03. MENSAJE / DETALLES *
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    placeholder="Write transmission logs here..."
                    className="brutalist-input-magenta w-full h-full min-h-[160px] resize-none"
                  />
                </div>
              </div>

              {/* MASSIVE SEND BUTTON (SPANNING BOTH COLUMNS) */}
              <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
                <button
                  type="submit"
                  className="mpc-button w-full sm:w-auto px-16 py-5 text-2xl uppercase tracking-widest font-heading font-extrabold"
                >
                  TRANSMIT TAPE
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
