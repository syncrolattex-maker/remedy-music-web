import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="bg-black text-white p-8">
    <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
      <div className="flex gap-6 font-bold text-sm flex-wrap justify-center font-display">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <Link to="/shipping" onClick={() => window.scrollTo(0, 0)}>Shipping</Link>
        <a href="#">Artist Portal</a>
      </div>
      <img src="/footer-logo.png" alt="Remedy Music" className="h-20" />
      <div className="text-sm font-display">© 2026 REMEDY MUSIC RECORDS.</div>
    </div>
  </footer>
);
