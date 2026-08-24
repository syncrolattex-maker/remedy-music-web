import React from 'react';
import { Truck, MapPin, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Shipping = () => {
  return (
    <main className="w-full min-h-screen bg-surface text-black p-6 md:p-12 font-sans pb-32">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-4 mb-8 gap-4 select-none">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-5xl md:text-7xl uppercase tracking-wider">Shipping</h1>
            <span className="font-mono text-xs bg-[#FF0055] text-white border-2 border-black px-2 py-0.5 font-bold uppercase rotate-3">
              Info
            </span>
          </div>
          <p className="font-mono text-sm max-w-xs text-zinc-600 font-bold uppercase tracking-wider border-l-4 border-[#FFDE00] pl-3">
            Información sobre envíos y métodos de entrega.
          </p>
        </div>

        {/* CONTENT BUBBLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* CORREOS BLOCK */}
          <div className="brutalist-border bg-white p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFDE00] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#FFDE00] border-3 border-black shadow-[4px_4px_0_0_#000]">
                <MapPin className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="font-heading text-3xl uppercase tracking-wide">Correos España</h2>
            </div>
            
            <div className="font-mono text-sm leading-relaxed flex flex-col gap-3">
              <p>
                Todos nuestros envíos físicos se realizan a domicilio a través del servicio postal nacional de <strong>Correos España (Correos.es)</strong>.
              </p>
              <p>
                Una vez depositado el paquete en la oficina postal, te facilitaremos el código de seguimiento de Correos por correo electrónico o teléfono móvil para que puedas rastrear la entrega en tiempo real.
              </p>
            </div>
          </div>

          {/* PRICING BLOCK */}
          <div className="brutalist-border bg-black text-white p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FF0055] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#FF0055] border-3 border-white shadow-[4px_4px_0_0_#fff] text-white">
                <Truck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="font-heading text-3xl uppercase tracking-wide">Tarifas</h2>
            </div>
            
            <div className="font-mono text-sm leading-relaxed flex flex-col gap-4 mt-2">
              <p className="text-zinc-300">
                El coste del envío está <strong>por confirmar</strong> según las tarifas oficiales vigentes de Correos en el momento del envío (basado en peso y formato del disco):
              </p>
              
              <div className="bg-zinc-900 border border-zinc-700 p-4 flex flex-col gap-2 rounded">
                <span className="font-bold text-[#FFDE00] uppercase tracking-wider text-xs">Tarifa a Confirmar:</span>
                <p className="text-zinc-400 text-xs">
                  Tras realizar tu pedido, nos pondremos en contacto contigo por email o móvil para acordar la tarifa de envío definitiva antes de proceder con el envío postal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12">
          <Link 
            to="/catalogo/45s-club" 
            className="group py-4 px-8 bg-[#FFDE00] border-4 border-black font-mono font-bold text-sm uppercase tracking-widest flex items-center gap-3 shadow-[6px_6px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            Volver al Catálogo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </main>
  );
};
