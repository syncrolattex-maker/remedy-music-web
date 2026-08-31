import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="bg-black text-white p-8">
    <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
      <div className="flex gap-6 font-bold text-sm flex-wrap justify-center font-display">
        <Link to="/terms" onClick={() => window.scrollTo(0, 0)}>Terms</Link>
        <Link to="/shipping" onClick={() => window.scrollTo(0, 0)}>Shipping</Link>
        <Link to="/admin/pedidos" onClick={() => window.scrollTo(0, 0)} className="text-zinc-500 hover:text-white">Admin Pedidos</Link>
      </div>
      <img src="/footer-logo.png" alt="Remedy Music" className="h-20" />
      <div className="text-sm font-display">© 2026 REMEDY MUSIC RECORDS.</div>
    </div>
  </footer>
);
