/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Checkout } from './pages/Checkout';
import { Contact } from './pages/Contact';
import { Catalog } from './pages/Catalog';
import { Player } from './components/Player';
import { Bios } from './pages/Bios';
import { Pressing } from './pages/Pressing';
import { SmoothScroll } from './components/SmoothScroll';
import { CustomCursor } from './components/CustomCursor';

export interface Track {
  id: string;
  title: string;
  artist: string;
  format: 'vinyl' | 'cassette' | 'beats';
  audioUrl: string;
  coverUrl?: string;
  price: number;
  color: string;
  bandcampUrl?: string;
  tracks?: string[];
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Audio playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Direct checkout state
  const [checkoutItem, setCheckoutItem] = useState<{ track: Track; edition: string } | null>(null);

  const handleBuyTrack = (track: Track, edition: string) => {
    setCheckoutItem({ track, edition });
    navigate('/checkout');
  };

  // Synchronize audio element playing state
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }

    const audio = audioRef.current;

    if (currentTrack) {
      // If src changed, update audio source
      const currentSrc = audio.src;
      // Resolve relative path if needed, but a simple check works
      if (!currentSrc.includes(currentTrack.audioUrl)) {
        audio.src = currentTrack.audioUrl;
        audio.load();
      }

      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }

    return () => {
      // Cleanup is handled or we keep player instance
    };
  }, [currentTrack, isPlaying]);

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const isDarkPage = location.pathname === '/' || location.pathname === '/home' || location.pathname.startsWith('/catalogo') || location.pathname === '/contacto' || location.pathname === '/bios' || location.pathname === '/pressing';

  return (
    <SmoothScroll>
      <CustomCursor />
      <div className={`min-h-screen flex flex-col font-sans relative ${isDarkPage ? 'bg-[#0a0a0a]' : 'bg-surface'}`}>
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/bios" element={<Bios />} />
            <Route path="/pressing" element={<Pressing />} />
            <Route 
              path="/catalogo" 
              element={
                <Catalog 
                  currentTrack={currentTrack} 
                  isPlaying={isPlaying} 
                  onPlayTrack={handlePlayTrack} 
                  onBuyTrack={handleBuyTrack}
                />
              } 
            />
            <Route 
              path="/catalogo/:subfamily" 
              element={
                <Catalog 
                  currentTrack={currentTrack} 
                  isPlaying={isPlaying} 
                  onPlayTrack={handlePlayTrack} 
                  onBuyTrack={handleBuyTrack}
                />
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <Checkout 
                  checkoutItem={checkoutItem}
                  onClearCheckout={() => setCheckoutItem(null)}
                  onNavigateHome={() => navigate('/catalogo/45s-club')}
                />
              } 
            />
          </Routes>
        </div>
        <Footer />

        {/* Global Persistent Player */}
        {currentTrack && (
          <Player 
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onTogglePlay={handleTogglePlay} 
            audioRef={audioRef}
            onClose={() => {
              setIsPlaying(false);
              setCurrentTrack(null);
            }}
          />
        )}
      </div>
    </SmoothScroll>
  );
}
