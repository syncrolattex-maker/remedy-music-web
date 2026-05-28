import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';

// Components
const ParallaxImage = ({ src, yOffset = 50, className = "" }: { src: string, yOffset?: number, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-yOffset, yOffset]);
  return (
    <motion.div ref={ref} style={{ y }} className={`relative overflow-hidden ${className}`}>
      {src ? (
        <img src={src} className="w-full h-full object-cover" alt="" />
      ) : (
        <div className="w-full h-full bg-zinc-800 border-2 border-white flex items-center justify-center font-mono text-zinc-500">
          PLACEHOLDER IMAGE
        </div>
      )}
    </motion.div>
  );
};

const Marquee = ({ text }: { text: string }) => {
  return (
    <div className="flex overflow-hidden whitespace-nowrap bg-zinc-900 border-y-2 border-zinc-800 py-4">
      <motion.div
        className="text-6xl md:text-8xl font-black font-heading text-zinc-100 uppercase tracking-tighter shrink-0 mr-8"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
        style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
      >
        {text}&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;
      </motion.div>
      <motion.div
        className="text-6xl md:text-8xl font-black font-heading text-zinc-100 uppercase tracking-tighter shrink-0"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
        style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
      >
        {text}&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;
      </motion.div>
    </div>
  );
};

export const Home = () => {
  // Hero Hover Reveal Logic
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroHovered, setHeroHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const smoothMouseX = useSpring(mousePos.x, { damping: 30, stiffness: 200, mass: 1 });
  const smoothMouseY = useSpring(mousePos.y, { damping: 30, stiffness: 200, mass: 1 });
  
  const offsetX = useTransform(smoothMouseX, v => v + 150);
  const offsetY = useTransform(smoothMouseY, v => v + 50);

  // MPC Audio Hover Logic
  const [isMPCHovered, setIsMPCHovered] = useState(false);

  return (
    <main className="w-full bg-[#050505] text-white overflow-hidden">
      
      {/* SECTION A: HERO SECTION */}
      <section 
        ref={heroRef}
        className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden cursor-crosshair border-b-2 border-zinc-800"
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
        onMouseMove={handleHeroMouseMove}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/home/erick_bw.jpg" alt="Erick B&W" className="w-full h-full object-cover opacity-40 grayscale" />
        </div>
        <div className="z-10 text-center pointer-events-none mix-blend-difference">
          <motion.h1 
            className="font-heading font-black text-6xl md:text-[10vw] leading-[0.85] tracking-tighter m-0 p-0 text-white"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            REMEDY
          </motion.h1>
          <motion.h1 
            className="font-heading font-black text-6xl md:text-[10vw] leading-[0.85] tracking-tighter m-0 p-0 text-white"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            MUSIC VLC
          </motion.h1>
          <motion.p 
            className="font-display font-bold text-xl md:text-3xl mt-6 text-[#00F0FF] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            True Hip Hop & Breaks
          </motion.p>
        </div>

        {/* Hover Reveal Floating Elements (Antigravity) */}
        <AnimatePresence>
          {heroHovered && (
            <>
              {/* Image 1 Placeholder */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 0 }}
                transition={{ duration: 0.4 }}
                style={{ x: smoothMouseX, y: smoothMouseY, left: -200, top: -250 }}
                className="absolute w-[400px] h-[300px] pointer-events-none z-0"
              >
                <img src="/home/rosvil_erick_agachados.jpg" alt="Rosvil y Erick agachados" className="w-full h-full object-cover border-4 border-zinc-700 shadow-2xl" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION B: DIGGIN' & CULTURE */}
      <section className="w-full py-24 bg-[#050505]">
        <Marquee text="Diggin' in the Crates //" />
        
        <div className="container mx-auto px-4 mt-24">
          <div className="relative w-full h-[800px]">
            {/* Parallax Image 1 */}
            <div className="absolute left-0 md:left-[10%] top-0 w-[80%] md:w-[45%] h-[500px] z-10">
               <ParallaxImage src="/home/dj_5panel.jpg" yOffset={80} className="w-full h-full border-4 border-white brutalist-border" />
            </div>

            {/* Parallax Image 2 */}
            <div className="absolute right-0 md:right-[5%] top-[300px] w-[90%] md:w-[50%] h-[400px] z-20">
               <ParallaxImage src="/home/diggin_crate.jpg" yOffset={-120} className="w-full h-full border-4 border-[#00F0FF] brutalist-border" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: THE SOUND */}
      <section className="w-full bg-[#D6FF00] text-black py-32 border-y-8 border-black">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="font-heading font-black text-6xl md:text-8xl leading-none tracking-tighter mb-8">
              THE<br/>SOUND<br/>LAB.
            </h2>
            <p className="font-display text-xl font-bold max-w-md border-l-4 border-black pl-4">
              Analog gear, classic breaks, and that raw underground essence. We cut out the noise and leave the groove intact.
            </p>
          </div>

          <div className="relative h-[600px] flex justify-center items-center">
            {/* Turntables/Records Bodegon */}
            <div className="absolute top-0 right-0 w-[80%] h-[400px] shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black bg-white">
              <img src="/home/bodegon_platos.jpg" alt="Vinilos" className="w-full h-full object-cover" />
            </div>

            {/* MPC Hover Effect */}
            <motion.div 
              className="absolute bottom-0 left-0 w-[60%] h-[350px] border-4 border-black bg-zinc-800 hover-target cursor-pointer flex flex-col items-center justify-center text-white font-mono text-center overflow-hidden"
              onMouseEnter={() => setIsMPCHovered(true)}
              onMouseLeave={() => setIsMPCHovered(false)}
              animate={{
                y: isMPCHovered ? 12 : 0,
                x: isMPCHovered ? 12 : 0,
                boxShadow: isMPCHovered 
                  ? "0px 0px 0px 0px rgba(0,0,0,1)" 
                  : "16px 16px 0px 0px rgba(0,0,0,1)"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <img src="/home/akai_mpc.jpg" alt="Akai MPC" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 text-xs font-bold bg-[#00F0FF] text-black px-2 py-1 z-10">HOVER TO PLAY SAMPLE (WIP)</div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION D: ROSTER & LIVE */}
      <section className="w-full bg-[#030303] py-32 text-white overflow-hidden relative">
        <h2 className="text-center font-heading font-black text-6xl md:text-[8vw] leading-none text-zinc-800 mb-24 opacity-50">
          RAW ENERGY
        </h2>

        <div className="container mx-auto px-4 relative h-[1000px] md:h-[800px]">
          {/* Asymmetrical Chaos Grid */}
          
          {/* Erick Multitud */}
          <motion.div 
            className="absolute top-0 left-0 w-[80%] md:w-[40%] h-[400px] border-2 border-zinc-700 bg-zinc-900 z-20 overflow-hidden"
            whileHover={{ scale: 1.02, rotate: -2, zIndex: 50 }}
            transition={{ type: "spring" }}
          >
            <img src="/home/erick_multitud.jpg" alt="Erick con multitud" className="w-full h-full object-cover" />
          </motion.div>

          {/* Rosvil Platos */}
          <motion.div 
            className="absolute top-[200px] md:top-[100px] right-0 md:right-[5%] w-[85%] md:w-[45%] h-[350px] border-2 border-[#ff003c] bg-zinc-900 z-10 overflow-hidden"
            whileHover={{ scale: 1.02, rotate: 2, zIndex: 50 }}
            transition={{ type: "spring" }}
          >
             <img src="/home/rosvil_platos.jpg" alt="Rosvil Platos" className="w-full h-full object-cover opacity-90" />
          </motion.div>

          {/* Erick Luces Verdes */}
          <motion.div 
            className="absolute top-[500px] left-[10%] w-[60%] md:w-[35%] h-[300px] border-2 border-[#00ff2a] bg-zinc-900 z-30 overflow-hidden"
            whileHover={{ scale: 1.02, rotate: -1, zIndex: 50 }}
            transition={{ type: "spring" }}
          >
             <img src="/home/erick_luces_verdes.jpg" alt="Erick Luces Verdes" className="w-full h-full object-cover mix-blend-screen" />
          </motion.div>

          {/* Muro Graffitis */}
          <motion.div 
            className="absolute bottom-0 right-[5%] md:right-[20%] w-[90%] md:w-[50%] h-[300px] border-2 border-zinc-500 bg-zinc-900 z-20 overflow-hidden"
            whileHover={{ scale: 1.02, rotate: 3, zIndex: 50 }}
            transition={{ type: "spring" }}
          >
             <img src="/home/muro_graffitis.jpg" alt="Muro Graffitis" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

    </main>
  );
};
