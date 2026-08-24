/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Truck, Phone, Mail, User, CheckCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { Track } from '../App';

interface CheckoutProps {
  checkoutItem: { track: Track; edition: string } | null;
  onClearCheckout: () => void;
  onNavigateHome: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ checkoutItem, onClearCheckout, onNavigateHome }) => {
  const location = useLocation();
  const [step, setStep] = useState<number>(1);
  
  // localCheckoutItem state to survive page reloads when returning from PayPal
  const [localCheckoutItem, setLocalCheckoutItem] = useState<{ track: Track; edition: string } | null>(checkoutItem);

  // Sync state if prop changes before redirect
  useEffect(() => {
    if (checkoutItem) {
      setLocalCheckoutItem(checkoutItem);
    }
  }, [checkoutItem]);

  // Contact details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping method is strictly home now
  const shippingMethod = 'home';

  // Home address details
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [homePostalCode, setHomePostalCode] = useState('');
  const [country, setCountry] = useState('España');

  // PayPal Payment details
  const [transactionId, setTransactionId] = useState('');

  // EmailJS API sender to notify owner and customer
  const sendEmails = async (
    itemName: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    shippingAddress: string,
    shippingCity: string,
    shippingZip: string,
    shippingCountry: string,
    price: number,
    txId: string
  ) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateOwnerId = import.meta.env.VITE_EMAILJS_TEMPLATE_OWNER_ID;
    const templateClientId = import.meta.env.VITE_EMAILJS_TEMPLATE_CLIENT_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateOwnerId || !templateClientId || !publicKey) {
      console.warn('EmailJS environment variables are not configured. Email transmissions skipped.');
      return;
    }

    const templateParams = {
      item_name: itemName,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_zip: shippingZip,
      shipping_country: shippingCountry,
      total_price: `${price.toFixed(2)} EUR`,
      transaction_id: txId,
      owner_email: 'remedymusicvlc@gmail.com'
    };

    // Send email to owner
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateOwnerId,
          user_id: publicKey,
          template_params: templateParams
        })
      });
      console.log('EmailJS: Purchase notification sent to owner.');
    } catch (err) {
      console.error('EmailJS: Error notifying owner:', err);
    }

    // Send email to client
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateClientId,
          user_id: publicKey,
          template_params: templateParams
        })
      });
      console.log('EmailJS: Purchase receipt sent to customer.');
    } catch (err) {
      console.error('EmailJS: Error notifying customer:', err);
    }
  };

  // Recover session after PayPal redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      try {
        const storedItem = sessionStorage.getItem('remedy_checkout_item');
        const storedName = sessionStorage.getItem('remedy_checkout_name');
        const storedEmail = sessionStorage.getItem('remedy_checkout_email');
        const storedPhone = sessionStorage.getItem('remedy_checkout_phone');
        const storedAddress = sessionStorage.getItem('remedy_checkout_address');
        const storedCity = sessionStorage.getItem('remedy_checkout_city');
        const storedPostalCode = sessionStorage.getItem('remedy_checkout_postal_code');
        const storedCountry = sessionStorage.getItem('remedy_checkout_country');
        
        if (storedItem) {
          const parsedItem = JSON.parse(storedItem);
          setLocalCheckoutItem(parsedItem);
          if (storedName) setName(storedName);
          if (storedEmail) setEmail(storedEmail);
          if (storedPhone) setPhone(storedPhone);
          if (storedAddress) setAddress(storedAddress);
          if (storedCity) setCity(storedCity);
          if (storedPostalCode) setHomePostalCode(storedPostalCode);
          if (storedCountry) setCountry(storedCountry);
          
          const txVal = params.get('tx') || `PAYID-PP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
          setTransactionId(txVal);
          setStep(3);
          
          // Send emails once
          const emailsSentKey = `remedy_emails_sent_${txVal}`;
          if (!sessionStorage.getItem(emailsSentKey)) {
            sessionStorage.setItem(emailsSentKey, 'true');
            sendEmails(
              `${parsedItem.track.title} (${parsedItem.edition})`,
              storedName || '',
              storedEmail || '',
              storedPhone || '',
              storedAddress || '',
              storedCity || '',
              storedPostalCode || '',
              storedCountry || '',
              parsedItem.track.price,
              txVal
            );
          }
          
          // Clear cart in parent state
          onClearCheckout();
        }
      } catch (e) {
        console.error('Error recovering checkout session:', e);
      }
    } else if (params.get('cancel') === 'true') {
      try {
        const storedName = sessionStorage.getItem('remedy_checkout_name');
        const storedEmail = sessionStorage.getItem('remedy_checkout_email');
        const storedPhone = sessionStorage.getItem('remedy_checkout_phone');
        const storedAddress = sessionStorage.getItem('remedy_checkout_address');
        const storedCity = sessionStorage.getItem('remedy_checkout_city');
        const storedPostalCode = sessionStorage.getItem('remedy_checkout_postal_code');
        const storedCountry = sessionStorage.getItem('remedy_checkout_country');
        
        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);
        if (storedAddress) setAddress(storedAddress);
        if (storedCity) setCity(storedCity);
        if (storedPostalCode) setHomePostalCode(storedPostalCode);
        if (storedCountry) setCountry(storedCountry);
        
        setStep(2);
        alert('Pago cancelado en PayPal. Puedes intentarlo de nuevo.');
      } catch (e) {}
    }
  }, [location]);

  // Step 1 validator
  const isStep1Valid = () => {
    const isContactValid = name.trim() !== '' && email.trim() !== '' && phone.trim() !== '';
    if (!isContactValid) return false;

    return address.trim() !== '' && city.trim() !== '' && homePostalCode.trim() !== '';
  };

  // Redirect to PayPal Traditional Standard Checkout
  const handlePayClick = () => {
    if (!localCheckoutItem) return;
    
    // Save state to sessionStorage
    sessionStorage.setItem('remedy_checkout_item', JSON.stringify(localCheckoutItem));
    sessionStorage.setItem('remedy_checkout_name', name);
    sessionStorage.setItem('remedy_checkout_email', email);
    sessionStorage.setItem('remedy_checkout_phone', phone);
    sessionStorage.setItem('remedy_checkout_address', address);
    sessionStorage.setItem('remedy_checkout_city', city);
    sessionStorage.setItem('remedy_checkout_postal_code', homePostalCode);
    sessionStorage.setItem('remedy_checkout_country', country);
    
    const businessEmail = 'remedymusicvlc@gmail.com';
    const itemName = `${localCheckoutItem.track.title} (${localCheckoutItem.edition}) - Remedy Music`;
    const amount = localCheckoutItem.track.price.toFixed(2);
    
    // Return URLs
    const returnUrl = `${window.location.origin}/checkout?success=true`;
    const cancelUrl = `${window.location.origin}/checkout?cancel=true`;
    
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?` + 
      `cmd=_xclick` +
      `&business=${encodeURIComponent(businessEmail)}` +
      `&item_name=${encodeURIComponent(itemName)}` +
      `&amount=${encodeURIComponent(amount)}` +
      `&currency_code=EUR` +
      `&return=${encodeURIComponent(returnUrl)}` +
      `&cancel_return=${encodeURIComponent(cancelUrl)}` +
      `&no_shipping=1` +
      `&email=${encodeURIComponent(email)}` +
      `&first_name=${encodeURIComponent(name)}` +
      `&address1=${encodeURIComponent(address)}` +
      `&city=${encodeURIComponent(city)}` +
      `&zip=${encodeURIComponent(homePostalCode)}` +
      `&country=ES` +
      `&lc=ES`;
      
    window.location.href = paypalUrl;
  };

  if (!localCheckoutItem) {
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
    if (localCheckoutItem.track.id === '45-1') return '/catalog/thats_the_way_cover.png';
    if (localCheckoutItem.track.id === '45-2') return '/catalog/freedust_cover.jpg';
    if (localCheckoutItem.track.id === '45-3') return '/catalog/compro_oro_cover.jpg';
    if (localCheckoutItem.track.id === '45-4') return '/catalog/we_can_fly_cover.jpg';
    if (localCheckoutItem.track.id === 'rap-1') return '/catalog/kendall_syndrome_cover.jpg';
    if (localCheckoutItem.track.id === 'rap-2') return '/catalog/safary_cover.png';
    if (localCheckoutItem.track.id === 'rap-3') return '/catalog/the_mixtape_2025_cover.jpg';
    if (localCheckoutItem.track.id === 'tape-1') return '/catalog/control_remoto_cover.jpg';
    if (localCheckoutItem.track.id === 'tape-2') return '/catalog/arrugas_en_el_chandal_cover_case.png';
    if (localCheckoutItem.track.id === 'tape-3') return '/catalog/geometria_variable_cover.jpg';
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
                    <label className="font-mono text-xs font-bold uppercase text-zinc-700">Móvil / Teléfono *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. +34 600 123 456"
                        className="w-full pl-10 pr-4 py-3 border-3 border-black font-mono text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#000] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="font-heading text-3xl uppercase tracking-wider border-b-2 border-black pb-2 mt-4 flex items-center gap-2">
                  <Truck className="w-6 h-6 stroke-[2.5]" />
                  2. Dirección de Envío Domicilio
                </h2>

                {/* HOME SHIPPING METHOD */}
                <div className="flex flex-col gap-4 border-2 border-zinc-200 p-4 bg-zinc-50 mt-4">
                  <div className="bg-[#FFF9E6] border-2 border-black p-3 text-black font-mono text-[10px] uppercase leading-relaxed mb-1 shadow-[2px_2px_0_0_#000]">
                    <strong>Nota de envío (Correos.es):</strong> El envío se tramitará manualmente a través de <strong>Correos España (Correos.es)</strong>. Las tarifas definitivas de envío están pendientes de confirmar y se acordarán contigo por email o teléfono tras la compra.
                  </div>
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
                      <strong>Entrega:</strong> Domicilio - {address}, {homePostalCode} {city}, {country}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 py-8 bg-zinc-50 border border-zinc-200 rounded">
                  <span className="font-mono text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-4">// Autorización de Transacción:</span>
                  
                  <button
                    onClick={handlePayClick}
                    className="group py-4 px-10 bg-[#FFDE00] border-4 border-black font-mono font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-[6px_6px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_#000] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all cursor-pointer text-black"
                  >
                    PAGAR CON PAYPAL
                  </button>
                  <span className="font-mono text-[9px] text-zinc-400 mt-2 uppercase tracking-wide">// Serás redirigido a la pasarela oficial de PayPal</span>
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
                    <span>1x {localCheckoutItem.track.title} ({localCheckoutItem.edition})</span>
                    <span><strong>Artista:</strong> {localCheckoutItem.track.artist}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 pb-2 border-b border-zinc-200">
                    <span className="font-bold text-secondary">ENVÍO DOMICILIO (CORREOS.ES):</span>
                    <span>Tarifa de envío: Pendiente de confirmar</span>
                    <span>{address}</span>
                    <span>{homePostalCode} {city}, {country}</span>
                  </div>

                  <div className="flex justify-between font-bold text-sm pt-2">
                    <span>PAGO AUTORIZADO:</span>
                    <span>{localCheckoutItem.track.price.toFixed(2)} EUR</span>
                  </div>
                </div>

                <p className="font-mono text-[10px] text-zinc-500 max-w-sm">
                  Correos España (Correos.es) gestionará el envío. Nos pondremos en contacto contigo por email o teléfono para coordinar la tarifa final de envío y te facilitaremos el código de seguimiento postal en cuanto el paquete se entregue en la oficina de Correos.
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
                  <div className="flex gap-1 flex-col leading-tight overflow-hidden">
                    <span className="font-mono text-xs font-bold text-secondary uppercase tracking-widest">{localCheckoutItem.track.format}</span>
                    <span className="font-heading text-xl uppercase truncate mt-0.5">{localCheckoutItem.track.title}</span>
                    <span className="font-mono text-[10px] text-zinc-600 truncate uppercase mt-0.5">{localCheckoutItem.track.artist}</span>
                    <span className="font-mono text-[9px] bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 mt-1.5 self-start text-zinc-700 truncate font-semibold">
                      {localCheckoutItem.edition}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-black pt-3 mt-2 flex flex-col gap-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Subtotal:</span>
                    <span>{localCheckoutItem.track.price.toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Envío (Correos.es):</span>
                    <span className="text-[#FF0055] font-bold uppercase tracking-wider">A confirmar</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-400 pt-2 font-bold text-sm mt-1.5">
                    <span>Total (Excl. Envío):</span>
                    <span className="text-[#FF0055]">{localCheckoutItem.track.price.toFixed(2)} EUR</span>
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
