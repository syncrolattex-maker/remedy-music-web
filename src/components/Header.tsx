import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect current active page based on routing pathname
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/contacto') return 'contact';
    if (path.startsWith('/catalogo')) return 'catalog';
    if (path === '/bios') return 'bios';
    if (path === '/pressing') return 'pressing';
    return '';
  };

  const activePage = getActivePage();

  return (
    <header className="flex flex-wrap justify-between items-center p-6 border-b-4 border-black bg-white gap-4">
      <Link to="/home">
        <img 
          src="/logo.png" 
          alt="Remedy" 
          className="h-20 cursor-pointer" 
        />
      </Link>
      
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <nav className={`${isOpen ? 'flex brutalist-border p-6 bg-surface mt-4 w-full gap-4' : 'hidden'} md:flex flex-col md:flex-row gap-6 font-bold text-lg w-full md:w-auto items-center font-display`}>
        <Link 
          to="/home"
          onClick={() => setIsOpen(false)}
          className={`hover:text-secondary ${activePage === 'home' ? 'text-secondary decoration-2 underline underline-offset-4' : ''}`}
        >
          Inicio
        </Link>
        <button 
          onClick={() => {
            navigate('/catalogo/45s-club');
            setIsOpen(false);
          }} 
          className={`hover:text-secondary font-display ${activePage === 'catalog' ? 'text-secondary decoration-2 underline underline-offset-4' : ''}`}
        >
          Catalogo
        </button>
        <Link
          to="/bios"
          onClick={() => setIsOpen(false)}
          className={`hover:text-secondary ${activePage === 'bios' ? 'text-secondary decoration-2 underline underline-offset-4' : ''}`}
        >
          Bios
        </Link>
        <Link
          to="/pressing"
          onClick={() => setIsOpen(false)}
          className={`hover:text-secondary ${activePage === 'pressing' ? 'text-secondary decoration-2 underline underline-offset-4' : ''}`}
        >
          Pressing
        </Link>
        <Link 
          to="/contacto"
          onClick={() => setIsOpen(false)}
          className={`hover:text-secondary ${activePage === 'contact' ? 'text-secondary decoration-2 underline underline-offset-4' : ''}`}
        >
          Contacto
        </Link>
      </nav>

      <div className="hidden md:flex gap-4 items-center flex-wrap justify-center">
        <input type="search" placeholder="Search catalog..." className="brutalist-border p-2" />
        <button className="font-bold">LOGIN</button>
        <button className="brutalist-border bg-primary font-bold px-4 py-2">JOIN</button>
      </div>
    </header>
  );
};
