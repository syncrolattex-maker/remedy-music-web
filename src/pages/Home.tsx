import React from 'react';

export const Home = () => (
  <main className="p-4 md:p-12">
    <h1 className="font-heading font-extrabold text-4xl md:text-6xl mb-12">NEO-SONIC: THE UNDERGROUND CONNECTION</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="col-span-1 md:col-span-2 brutalist-border p-6 bg-surface-dim">
        <div className="bg-gray-400 h-64 mb-4"></div>
        <h2 className="font-heading font-extrabold text-2xl md:text-4xl mb-2">SYNTHETIC RESONANCE LP</h2>
        <p className="font-bold mb-4">VORTEX AUDIO LABS // 190G GLOW IN THE DARK</p>
        <button className="brutalist-border bg-primary font-bold px-6 py-2">ADD TO CART - $35.00</button>
      </div>
      <div className="flex flex-col gap-8">
         <div className="brutalist-border p-4 bg-white">
            <h3 className="font-display font-bold text-2xl">ANALOG MUTATIONS</h3>
            <p className="text-sm">Vol 4.</p>
         </div>
         <div className="brutalist-border p-4 bg-primary">
            <h3 className="font-display font-bold text-2xl">INDUSTRIAL CLASSICS</h3>
            <p className="text-sm">Essentials</p>
         </div>
      </div>
    </div>
  </main>
);
