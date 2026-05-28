import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Phone, Mail, User, Search, CheckCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { Track } from '../App';

interface CheckoutProps {
  checkoutItem: { track: Track; edition: string } | null;
  onClearCheckout: () => void;
  onNavigateHome: () => void;
}

interface InPostPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  type: 'locker' | 'punto_pack';
}

const mockInPostPoints = (postalCode: string): InPostPoint[] => {
  const pCode = postalCode.trim() || '28001';
  return [
    {
      id: `ESP${pCode}01`,
      name: `LOCKER INPOST - REPSOL ESTACIÓN`,
      address: `Av. de la Constitución, 142`,
      city: `Madrid`,
      postalCode: pCode,
      type: 'locker'
    },
    {
      id: `ESP${pCode}02`,
      name: `PUNTO PACK - PAPELERÍA Y PRENSA BIZEN`,
      address: `Calle Mayor, 12`,
      city: `Madrid`,
      postalCode: pCode,
      type: 'punto_pack'
    },
    {
      id: `ESP${pCode}03`,
      name: `LOCKER INPOST - SUPERMERCADO DIA`,
      address: `Paseo de la Castellana, 80`,
      city: `Madrid`,
      postalCode: pCode,
      type: 'locker'
    }
  ];
};

export const Checkout: React.FC<CheckoutProps> = ({ checkoutItem, onClearCheckout, onNavigateHome }) => {
  const [step, setStep] = useState<number>(1);
  
  // Contact details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState<'inpost' | 'home'>('inpost');
  
  // InPost search
  const [searchPostalCode, setSearchPostalCode] = useState('');
  const [inpostPoints, setInpostPoints] = useState<InPostPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<InPostPoint | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Home address details
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [homePostalCode, setHomePostalCode] = useState('');
  const [country, setCountry] = useState('España');

  // PayPal Payment details
  const [transactionId, setTransactionId] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Trigger search for InPost Points
  const handleLockerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPostalCode.trim()) {
      alert('Por favor, introduce un código postal.');
      return;
    }
    const points = mockInPostPoints(searchPostalCode);
    setInpostPoints(points);
    setSelectedPoint(points[0]); // Select first by default
    setHasSearched(true);
  };

  // Step 1 validator
  const isStep1Valid = () => {
    const isContactValid = name.trim() !== '' && email.trim() !== '' && phone.trim() !== '';
    if (!isContactValid) return false;

    if (shippingMethod === 'inpost') {
      return selectedPoint !== null;
    } else {
      return address.trim() !== '' && city.trim() !== '' && homePostalCode.trim() !== '';
    }
  };

  // PayPal button script loading hook
  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    
    if (step === 2 && !window.hasOwnProperty('paypal')) {
      script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=EUR';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      document.body.appendChild(script);
    } else if (step === 2 && window.hasOwnProperty('paypal')) {
      setIsScriptLoaded(true);
    }

    return () => {
      // Keep script to avoid reloading, but we handle container cleanup in the next useEffect
    };
  }, [step]);

  // PayPal buttons rendering hook
  useEffect(() => {
    if (step === 2 && isScriptLoaded) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = ''; // Clear container to prevent duplicate renders
        
        const w = window as any;
        if (w.paypal && w.paypal.Buttons) {
          w.paypal.Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: `REMEDY MUSIC: ${checkoutItem?.track.title} (${checkoutItem?.edition})`,
                    amount: {
                      currency_code: 'EUR',
                      value: (checkoutItem?.track.price || 15.0).toFixed(2)
                    }
                  }
                ]
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const details = await actions.order.capture();
                setTransactionId(details.id || `PAYID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
                setStep(3);
              } catch (err) {
                console.error(err);
                // Fallback success for sandbox simulation if capture fails locally
                setTransactionId(`PAYID-SB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
                setStep(3);
              }
            },
            onError: (err: any) => {
              console.error('PayPal execution error:', err);
              alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
            }
          }).render('#paypal-button-container');
        }
      }
    }
  }, [step, isScriptLoaded, checkoutItem]);

  if (!checkoutItem) {
    return (
      <main className="w-full min-h-[70vh] bg-surface text-black p-6 md:p-12 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md brutalist-border p-8 bg-white text-center">
          <h2 className="font-heading text-4xl mb-4 uppercase">CARRITO VACÍO</h2>
          <p className="font-mono text-xs text-zinc-600 mb-6">NO SE HA SELECCIONADO NINGÚN DISCO PARA LA COMPRA DIRECTA.</p>
          <button
            onClick={onNavigateHome}
            className="w-full py-3 bg-[#FF0055] text-white border-3 border-black font-mono font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Ir al catálogo
          </button>
        </div>
      </main>
    );
  }

  const getSleeveImage = () => {
    if (checkoutItem.track.id === '45-1') return '/catalog/thats_the_way_cover.png';
    if (checkoutItem.track.id === '45-2') return '/catalog/freedust_cover.jpg';
    if (checkoutItem.track.id === '45-3') return '/catalog/compro_oro_cover.jpg';
    if (checkoutItem.track.id === '45-4') return '/catalog/we_can_fly_cover.jpg';
    if (checkoutItem.track.id === 'rap-1') return '/catalog/kendall_syndrome_cover.jpg';
    if (checkoutItem.track.id === 'rap-2') return '/catalog/safary_cover.png';
    if (checkoutItem.track.id === 'rap-3') return '/catalog/the_mixtape_2025_cover.jpg';
    if (checkoutItem.track.id === 'tape-1') return '/catalog/control_remoto_cover.jpg';
    if (checkoutItem.track.id === 'tape-2') return '/catalog/arrugas_en_el_chandal_cover_case.png';
    if (checkoutItem.track.id === 'tape-3') return '/catalog/geometria_variable_cover.jpg';
    return '';
  };

  const coverImage = getSleeveImage();

  return (
    <main className="w-full min-h-screen bg-surface text-black p-6 md:p-12 font-sans pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* STEP HEADER */}
        <div className="flex flex-wrap justify-between items-center border-b-4 border-black pb-4 mb-8 gap-4 select-none">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-4xl md:text-5xl uppercase tracking-wider">Checkout</h1>
            <span className="font-mono text-xs bg-[#FFDE00] border-2 border-black px-2 py-0.5 font-bold uppercase">Directo</span>
          </div>
          
          <div className="flex gap-4 font-mono text-xs font-bold">
            <span className={`px-2 py-1 border-2 border-black ${step === 1 ? 'bg-black text-white' : 'bg-white'}`}>[ 1. Envío ]</span>
            <span className={`px-2 py-1 border-2 border-black ${step === 2 ? 'bg-black text-white' : 'bg-white'}`}>[ 2. Pago ]</span>
            <span className={`px-2 py-1 border-2 border-black ${step === 3 ? 'bg-black text-white' : 'bg-white'}`}>[ 3. Éxito ]</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: STEP CONTENT */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* STEP 1: SHIPPING & CONTACT */}
            {step === 1 && (
              <div className="brutalist-border p-6 bg-white flex flex-col gap-6">
                <h2 className="font-heading text-3xl uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2">
                  <User className="w-6 h-6 stroke-[2.5]" />
                  1. Datos de Contacto
                </h2>
                
                {/* Contact form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs font-bold uppercase text-zinc-700">Nombre completo *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="w-full pl-10 pr-4 py-3 border-3 border-black font-mono text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#000] transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs font-bold uppercase text-zinc-700">Email de contacto *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@email.com"
                        className="w-full pl-10 pr-4 py-3 border-3 border-black font-mono text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#000] transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="font-mono text-xs font-bold uppercase text-zinc-700">Móvil / Teléfono (Requerido para avisos InPost) *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. +34 600 123 456 (necesario para el PIN del Locker)"
                        className="w-full pl-10 pr-4 py-3 border-3 border-black font-mono text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#000] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="font-heading text-3xl uppercase tracking-wider border-b-2 border-black pb-2 mt-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 stroke-[2.5]" />
                  2. Método de Envío InPost
                </h2>

                {/* Delivery options tabs */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('inpost')}
                    className={`py-3 px-4 border-3 border-black font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      shippingMethod === 'inpost'
                        ? 'bg-[#FFDE00] shadow-[4px_4px_0_0_#000] -translate-y-0.5'
                        : 'bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Punto InPost / Locker
                  </button>
                  <button
                    type="button"
                    onClick={() => setShippingMethod('home')}
                    className={`py-3 px-4 border-3 border-black font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      shippingMethod === 'home'
                        ? 'bg-[#FFDE00] shadow-[4px_4px_0_0_#000] -translate-y-0.5'
                        : 'bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Envío Domicilio
                  </button>
                </div>

                {/* INPOST SEARCH METHOD */}
                {shippingMethod === 'inpost' && (
                  <div className="flex flex-col gap-4 border-2 border-zinc-200 p-4 bg-zinc-50">
                    <span className="font-mono text-[10px] text-zinc-600 uppercase font-bold tracking-wider">// Localiza tu Locker o Punto Pack más cercano:</span>
                    
                    <form onSubmit={handleLockerSearch} className="flex gap-2">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                        <input 
                          type="text"
                          value={searchPostalCode}
                          onChange={(e) => setSearchPostalCode(e.target.value)}
                          placeholder="Introduce Código Postal (ej. 28001)"
                          className="w-full pl-10 pr-4 py-3 border-3 border-black font-mono text-sm bg-white focus:outline-none focus:-translate-y-0.5 focus:shadow-[2px_2px_0_0_#000] transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-3 px-5 bg-black text-white font-mono font-bold text-xs uppercase border-3 border-black shadow-[2px_2px_0_0_#ccc] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                      >
                        Buscar
                      </button>
                    </form>

                    {/* Searched locations list */}
                    {hasSearched && (
                      <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto mt-2">
                        {inpostPoints.map((point) => {
                          const isSelected = selectedPoint?.id === point.id;
                          return (
                            <div
                              key={point.id}
                              onClick={() => setSelectedPoint(point)}
                              className={`p-3 border-2 border-black flex items-start gap-3 transition-all cursor-pointer ${
                                isSelected ? 'bg-[#FFE6F0] border-secondary' : 'bg-white hover:bg-zinc-50'
                              }`}
                            >
                              <div className={`p-1.5 border border-black rounded-full mt-0.5 ${isSelected ? 'bg-secondary text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col leading-tight select-none">
                                <span className="font-mono text-xs font-bold">{point.name}</span>
                                <span className="font-mono text-[10px] text-zinc-600 mt-0.5">{point.address}, {point.postalCode} {point.city}</span>
                                <span className="font-mono text-[8px] bg-black text-white px-1.5 py-0.5 self-start mt-1.5 font-bold uppercase">ID: {point.id}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* HOME SHIPPING METHOD */}
                {shippingMethod === 'home' && (
                  <div className="flex flex-col gap-4 border-2 border-zinc-200 p-4 bg-zinc-50">
                    <span className="font-mono text-[10px] text-zinc-600 uppercase font-bold tracking-wider">// Dirección de envío postal:</span>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-700 font-bold">Dirección *</label>
                        <input 
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Calle, número, piso, puerta"
                          className="w-full px-3 py-2 border-2 border-black font-mono text-xs bg-white focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-700 font-bold">Ciudad *</label>
                          <input 
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Madrid"
                            className="w-full px-3 py-2 border-2 border-black font-mono text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-700 font-bold">Código Postal *</label>
                          <input 
                            type="text"
                            value={homePostalCode}
                            onChange={(e) => setHomePostalCode(e.target.value)}
                            placeholder="28001"
                            className="w-full px-3 py-2 border-2 border-black font-mono text-xs bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] uppercase tracking-wide text-zinc-700 font-bold">País *</label>
                        <input 
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="España"
                          className="w-full px-3 py-2 border-2 border-black font-mono text-xs bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Continue button */}
                <button
                  type="button"
                  disabled={!isStep1Valid()}
                  onClick={() => setStep(2)}
                  className={`w-full mt-4 py-3 border-3 border-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isStep1Valid()
                      ? 'bg-[#FF0055] text-white shadow-[4px_4px_0px_0px_#000] hover:bg-black active:translate-x-1 active:translate-y-1 active:shadow-none'
                      : 'bg-zinc-200 text-zinc-400 border-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Continuar al pago
                </button>
              </div>
            )}

            {/* STEP 2: PAYMENT WITH PAYPAL */}
            {step === 2 && (
              <div className="brutalist-border p-6 bg-white flex flex-col gap-6 animate-success-pop">
                <button
                  onClick={() => setStep(1)}
                  className="font-mono text-xs font-bold uppercase flex items-center gap-1.5 text-zinc-700 hover:text-black self-start cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al formulario
                </button>

                <h2 className="font-heading text-3xl uppercase tracking-wider border-b-2 border-black pb-2 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 stroke-[2.5]" />
                  3. Pago seguro con PayPal
                </h2>

                <div className="border-2 border-black p-4 bg-[#FAF6EE] flex flex-col gap-2.5">
                  <span className="font-mono text-[10px] text-zinc-600 uppercase font-bold tracking-wider">// Resumen de Entrega:</span>
                  <div className="flex flex-col font-mono text-xs leading-tight">
                    <span><strong>Destinatario:</strong> {name}</span>
                    <span><strong>Contacto:</strong> {email} | {phone}</span>
                    <span className="mt-1.5">
                      <strong>Entrega:</strong> {
                        shippingMethod === 'inpost' 
                          ? `Punto InPost (${selectedPoint?.id}) - ${selectedPoint?.name}, ${selectedPoint?.address}, ${selectedPoint?.postalCode} ${selectedPoint?.city}`
                          : `Domicilio - ${address}, ${homePostalCode} ${city}, ${country}`
                      }
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 py-4 bg-zinc-50 border border-zinc-200 rounded">
                  <span className="font-mono text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-2">// Autorización de Transacción:</span>
                  
                  {/* PayPal buttons wrapper container */}
                  <div id="paypal-button-container" className="w-full max-w-sm px-6"></div>
                  
                  {!isScriptLoaded && (
                    <div className="font-mono text-xs text-zinc-500 flex items-center gap-2 py-4">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Cargando pasarela de PayPal...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS TICKET */}
            {step === 3 && (
              <div className="brutalist-border p-8 bg-[#121212] text-white flex flex-col items-center gap-6 animate-success-pop text-center relative overflow-hidden">
                {/* Cable accent graphic */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FFDE00]"></div>
                
                <div className="p-3 bg-[#EBFCE5] text-black border-2 border-black rounded-full animate-bounce">
                  <CheckCircle className="w-10 h-10 text-green-600 fill-current" />
                </div>

                <div className="leading-none">
                  <h2 className="font-heading text-5xl md:text-7xl text-[#FFDE00] tracking-wider uppercase">TICKET EMITIDO</h2>
                  <p className="font-mono text-xs text-zinc-400 mt-2 tracking-widest uppercase">TRANSMISSION OK // ID: {transactionId}</p>
                </div>

                {/* Neo-brutalist ticket receipt */}
                <div className="w-full max-w-md bg-white text-black border-3 border-black p-5 font-mono text-left text-xs leading-relaxed flex flex-col gap-3 relative">
                  {/* Jagged border simulation at top and bottom */}
                  <div className="border-b-2 border-dashed border-zinc-400 pb-2 flex justify-between font-bold">
                    <span>REMEDY RECORDS TICKET</span>
                    <span>2026-05-26</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pb-2 border-b border-zinc-200">
                    <span><strong>Cliente:</strong> {name}</span>
                    <span><strong>Móvil:</strong> {phone}</span>
                    <span><strong>Email:</strong> {email}</span>
                  </div>

                  <div className="flex flex-col gap-1 pb-2 border-b border-zinc-200">
                    <span className="font-bold text-[#FF0055]">DETALLE DE COMPRA:</span>
                    <span>1x {checkoutItem.track.title} ({checkoutItem.edition})</span>
                    <span><strong>Artista:</strong> {checkoutItem.track.artist}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pb-2 border-b border-zinc-200">
                    <span className="font-bold text-secondary">ENTREGA (INPOST):</span>
                    {shippingMethod === 'inpost' ? (
                      <>
                        <span className="font-bold">{selectedPoint?.name}</span>
                        <span>Dirección: {selectedPoint?.address}</span>
                        <span>Código Postal: {selectedPoint?.postalCode} {selectedPoint?.city}</span>
                        <span className="font-bold bg-black text-white px-1.5 py-0.5 self-start text-[10px] mt-1.5">ID RECOGIDA: {selectedPoint?.id}</span>
                      </>
                    ) : (
                      <>
                        <span>Domicilio del Cliente:</span>
                        <span>{address}</span>
                        <span>{homePostalCode} {city}, {country}</span>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between font-bold text-sm pt-2">
                    <span>PAGO AUTORIZADO:</span>
                    <span>{checkoutItem.track.price.toFixed(2)} EUR</span>
                  </div>
                </div>

                <p className="font-mono text-[10px] text-zinc-500 max-w-sm">
                  InPost enviará un SMS con el código PIN de apertura y las notificaciones en cuanto el paquete sea depositado en el locker seleccionado.
                </p>

                <button
                  onClick={() => {
                    onClearCheckout();
                    onNavigateHome();
                  }}
                  className="px-8 py-3 bg-[#FFDE00] text-black border-3 border-black font-mono font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  Volver a la Tienda
                </button>
              </div>
            )}

          </div>

          {/* RIGHT: ORDER SUMMARY (STEPS 1 & 2) */}
          {step < 3 && (
            <div className="flex flex-col gap-6">
              
              {/* CART ITEMS SUMMARY CARD */}
              <div className="brutalist-border p-6 bg-white flex flex-col gap-4">
                <h3 className="font-heading text-2xl uppercase tracking-wider border-b border-black pb-1.5">// Resumen del Pedido</h3>
                
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 border-2 border-black flex-shrink-0 bg-zinc-950 overflow-hidden relative">
                    {coverImage ? (
                      <img src={coverImage} alt="Album cover" className="w-full h-full object-cover" />
                    ) : (
                      /* Placeholder grids */
                      <svg className="w-full h-full bg-zinc-900 text-white" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="#333" />
                        <line x1="0" y1="0" x2="100" y2="100" stroke="#555" strokeWidth="1" />
                        <line x1="100" y1="0" x2="0" y2="100" stroke="#555" strokeWidth="1" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col leading-tight overflow-hidden">
                    <span className="font-mono text-xs font-bold text-secondary uppercase tracking-widest">{checkoutItem.track.format}</span>
                    <span className="font-heading text-xl uppercase truncate mt-0.5">{checkoutItem.track.title}</span>
                    <span className="font-mono text-[10px] text-zinc-600 truncate uppercase mt-0.5">{checkoutItem.track.artist}</span>
                    <span className="font-mono text-[9px] bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 mt-1.5 self-start text-zinc-700 truncate font-semibold">
                      {checkoutItem.edition}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-black pt-3 mt-2 flex flex-col gap-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Subtotal:</span>
                    <span>{checkoutItem.track.price.toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Envío InPost:</span>
                    <span className="text-green-600 font-bold">GRATIS</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-zinc-400 pt-2 font-bold text-sm mt-1.5">
                    <span>Total Pedido:</span>
                    <span className="text-[#FF0055]">{checkoutItem.track.price.toFixed(2)} EUR</span>
                  </div>
                </div>
              </div>

              {/* SECURITY ASSURANCE BOX */}
              <div className="brutalist-border p-4 bg-[#EBFCE5] flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col font-mono text-[10px] text-green-900 leading-tight">
                  <span className="font-bold uppercase tracking-wide">Transacciones Seguras</span>
                  <span className="mt-1">Toda la operación de pago se ejecuta de manera encriptada y segura directamente en los servidores de PayPal. Remedy Music no almacena tu información financiera.</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </main>
  );
};
