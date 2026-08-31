import React, { useState, useEffect } from 'react';
import { Download, Copy, Trash2, CheckCircle2, Clock, Search, Lock, ShieldCheck, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface RemedyOrder {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
  itemTitle: string;
  itemEdition: string;
  itemPrice: number;
  status: 'Pendiente' | 'Enviado';
}

const DEMO_ORDERS: RemedyOrder[] = [
  {
    id: 'PAYID-PP-8X92K11',
    date: '2026-08-30T14:32:00.000Z',
    customerName: 'Marc Benavent',
    customerEmail: 'mbenavent@gmail.com',
    customerPhone: '+34 612 345 678',
    shippingAddress: 'Carrer de la Pau 14, 2ºB',
    shippingCity: 'Valencia',
    shippingZip: '46003',
    shippingCountry: 'España',
    itemTitle: 'Nuevos Capitales EP',
    itemEdition: 'Vinyl 7" Single',
    itemPrice: 14.50,
    status: 'Pendiente'
  },
  {
    id: 'PAYID-PP-4M77L90',
    date: '2026-08-28T19:15:00.000Z',
    customerName: 'Laura Morales',
    customerEmail: 'laura.mora@hotmail.com',
    customerPhone: '+34 654 987 321',
    shippingAddress: 'Calle Gran Vía 45, 4ºA',
    shippingCity: 'Madrid',
    shippingZip: '28013',
    shippingCountry: 'España',
    itemTitle: 'We can fly',
    itemEdition: 'Vinyl 7" Single',
    itemPrice: 12.50,
    status: 'Enviado'
  }
];

export const AdminOrders: React.FC = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [orders, setOrders] = useState<RemedyOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load orders from localStorage
  const loadOrders = () => {
    try {
      const stored = localStorage.getItem('remedy_orders_history');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Error loading orders:', e);
      setOrders([]);
    }
  };

  useEffect(() => {
    // Check if session PIN is saved
    const savedAuth = sessionStorage.getItem('remedy_admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    loadOrders();
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 2020 (Remedy launch year)
    if (pin === '2020' || pin === 'remedy') {
      setIsAuthenticated(true);
      sessionStorage.setItem('remedy_admin_authenticated', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: o.status === 'Pendiente' ? ('Enviado' as const) : ('Pendiente' as const)
        };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('remedy_orders_history', JSON.stringify(updated));
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta compra del registro local?')) {
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
      localStorage.setItem('remedy_orders_history', JSON.stringify(updated));
    }
  };

  const handleLoadDemoData = () => {
    setOrders(DEMO_ORDERS);
    localStorage.setItem('remedy_orders_history', JSON.stringify(DEMO_ORDERS));
  };

  const handleCopyCorreosAddress = (order: RemedyOrder) => {
    const text = `DESTINATARIO: ${order.customerName}\nTELÉFONO: ${order.customerPhone}\nEMAIL: ${order.customerEmail}\nDIRECCIÓN: ${order.shippingAddress}\nCIUDAD: ${order.shippingCity}\nCÓDIGO POSTAL: ${order.shippingZip}\nPAÍS: ${order.shippingCountry}\nPRODUCTO: ${order.itemTitle} (${order.itemEdition})`;
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No hay pedidos en el registro para exportar.');
      return;
    }

    // CSV Header
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    csvContent += 'ID Transacción,Fecha,Cliente,Email,Teléfono,Dirección,Ciudad,Código Postal,País,Producto,Edición,Precio (EUR),Estado Envío\n';

    orders.forEach(o => {
      const formattedDate = new Date(o.date).toLocaleString('es-ES');
      const row = [
        `"${o.id}"`,
        `"${formattedDate}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerEmail.replace(/"/g, '""')}"`,
        `"${o.customerPhone.replace(/"/g, '""')}"`,
        `"${o.shippingAddress.replace(/"/g, '""')}"`,
        `"${o.shippingCity.replace(/"/g, '""')}"`,
        `"${o.shippingZip.replace(/"/g, '""')}"`,
        `"${o.shippingCountry.replace(/"/g, '""')}"`,
        `"${o.itemTitle.replace(/"/g, '""')}"`,
        `"${o.itemEdition.replace(/"/g, '""')}"`,
        `"${o.itemPrice.toFixed(2)}"`,
        `"${o.status}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remedy_pedidos_clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.itemTitle.toLowerCase().includes(q) ||
      o.shippingCity.toLowerCase().includes(q)
    );
  });

  const totalRevenue = orders.reduce((acc, o) => acc + o.itemPrice, 0);
  const pendingCount = orders.filter(o => o.status === 'Pendiente').length;

  if (!isAuthenticated) {
    return (
      <main className="w-full min-h-[80vh] bg-surface text-black p-6 md:p-12 flex items-center justify-center font-sans">
        <div className="w-full max-w-md brutalist-border p-8 bg-white text-center shadow-[8px_8px_0_0_#000]">
          <div className="p-4 bg-[#FFDE00] border-3 border-black w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h1 className="font-heading text-4xl uppercase mb-2">Panel de Administración</h1>
          <p className="font-mono text-xs text-zinc-600 mb-6 uppercase">
            Acceso privado para el propietario // Gestión de clientes y compras
          </p>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-xs font-bold uppercase text-zinc-700">PIN de Seguridad</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Introduce el código PIN..."
                className="w-full px-4 py-3 border-3 border-black font-mono text-center text-lg bg-zinc-50 focus:bg-white focus:outline-none"
              />
              <span className="font-mono text-[9px] text-zinc-400 mt-1">// Clave por defecto: 2020</span>
            </div>

            {authError && (
              <p className="font-mono text-xs font-bold text-[#FF0055] bg-pink-50 border border-pink-200 p-2">
                PIN incorrecto. Inténtalo de nuevo.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#00F0FF] text-black border-3 border-black font-mono font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Entrar al Registro
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-surface text-black p-6 md:p-12 font-sans pb-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center border-b-4 border-black pb-6 gap-4 select-none">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-4xl md:text-6xl uppercase tracking-wider">Gestión de Pedidos</h1>
            <span className="font-mono text-xs bg-[#FFDE00] border-2 border-black px-2.5 py-1 font-bold uppercase flex items-center gap-1 shadow-[2px_2px_0_0_#000]">
              <ShieldCheck className="w-4 h-4" />
              Propietario
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="py-2.5 px-4 bg-[#EBFCE5] border-3 border-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0_0_#000] hover:bg-green-300 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Exportar Excel / CSV
            </button>

            <Link
              to="/catalogo/45s-club"
              className="py-2.5 px-4 bg-white border-3 border-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0_0_#000] hover:bg-zinc-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la Tienda
            </Link>
          </div>
        </div>

        {/* METRICS DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="brutalist-border p-6 bg-white flex flex-col gap-1">
            <span className="font-mono text-xs font-bold text-zinc-500 uppercase">// Total Compras</span>
            <span className="font-heading text-5xl text-black">{orders.length}</span>
            <span className="font-mono text-[10px] text-zinc-400">Registros de clientes almacenados</span>
          </div>

          <div className="brutalist-border p-6 bg-[#FFDE00] flex flex-col gap-1">
            <span className="font-mono text-xs font-bold text-black uppercase">// Total Facturado</span>
            <span className="font-heading text-5xl text-black">{totalRevenue.toFixed(2)} €</span>
            <span className="font-mono text-[10px] text-black/70">Cobrado directamente en PayPal</span>
          </div>

          <div className="brutalist-border p-6 bg-[#FF0055] text-white flex flex-col gap-1">
            <span className="font-mono text-xs font-bold text-pink-200 uppercase">// Pendientes de Envío</span>
            <span className="font-heading text-5xl">{pendingCount}</span>
            <span className="font-mono text-[10px] text-pink-200">A tramitar en Correos.es</span>
          </div>
        </div>

        {/* CONTROLS & SEARCH BAR */}
        <div className="brutalist-border p-4 bg-white flex flex-wrap justify-between items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, email, teléfono, ciudad o ID..."
              className="w-full pl-10 pr-4 py-2 border-2 border-black font-mono text-xs bg-zinc-50 focus:bg-white focus:outline-none"
            />
          </div>

          {orders.length === 0 && (
            <button
              onClick={handleLoadDemoData}
              className="py-2 px-3 bg-zinc-100 border-2 border-black font-mono text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-zinc-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Cargar Ejemplos de Prueba
            </button>
          )}
        </div>

        {/* ORDERS TABLE / CARDS */}
        {filteredOrders.length === 0 ? (
          <div className="brutalist-border p-12 bg-white text-center flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-zinc-400 mb-3" />
            <h3 className="font-heading text-2xl uppercase mb-1">Sin Registros de Compras</h3>
            <p className="font-mono text-xs text-zinc-500 max-w-md">
              {searchQuery ? `No se encontraron coincidencias para "${searchQuery}".` : 'Cada vez que un cliente complete un pago en PayPal, su pedido y sus datos de envío aparecerán automáticamente aquí.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((o) => (
              <div key={o.id} className="brutalist-border bg-white p-6 flex flex-col gap-4">
                
                {/* CARD HEADER */}
                <div className="flex flex-wrap justify-between items-start border-b border-zinc-200 pb-3 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5">
                      {o.id}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {new Date(o.date).toLocaleString('es-ES')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(o.id)}
                      className={`px-3 py-1 font-mono font-bold text-xs border-2 border-black flex items-center gap-1.5 uppercase transition-all cursor-pointer ${
                        o.status === 'Enviado'
                          ? 'bg-[#EBFCE5] text-green-900 border-green-800'
                          : 'bg-[#FFDE00] text-black'
                      }`}
                    >
                      {o.status === 'Enviado' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                          Enviado por Correos
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-black" />
                          Pendiente Envío
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteOrder(o.id)}
                      title="Eliminar de la lista"
                      className="p-1.5 text-zinc-400 hover:text-[#FF0055] hover:bg-pink-50 border border-transparent hover:border-black transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CARD CONTENT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                  
                  {/* CLIENT CONTACT INFO */}
                  <div className="flex flex-col gap-1.5 border-r-0 md:border-r border-zinc-200 pr-0 md:pr-4">
                    <span className="font-bold text-secondary uppercase tracking-wider">// Datos del Cliente:</span>
                    <span><strong>Nombre:</strong> {o.customerName}</span>
                    <span><strong>Email:</strong> <a href={`mailto:${o.customerEmail}`} className="underline text-blue-700">{o.customerEmail}</a></span>
                    <span><strong>Móvil:</strong> <a href={`tel:${o.customerPhone}`} className="underline text-blue-700">{o.customerPhone}</a></span>
                  </div>

                  {/* SHIPPING ADDRESS FOR CORREOS */}
                  <div className="flex flex-col gap-1.5 border-r-0 md:border-r border-zinc-200 pr-0 md:pr-4">
                    <span className="font-bold text-black uppercase tracking-wider">// Dirección Correos.es:</span>
                    <span>{o.shippingAddress}</span>
                    <span>{o.shippingZip} {o.shippingCity}, {o.shippingCountry}</span>
                    
                    <button
                      onClick={() => handleCopyCorreosAddress(o)}
                      className="mt-2 py-1.5 px-3 bg-zinc-100 border border-black font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 hover:bg-[#00F0FF] transition-all cursor-pointer self-start"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === o.id ? '¡Copiado para Correos!' : 'Copiar datos Correos'}
                    </button>
                  </div>

                  {/* ITEM PURCHASED & TOTAL */}
                  <div className="flex flex-col justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-zinc-600 uppercase tracking-wider">// Item Comprado:</span>
                      <span className="font-heading text-xl uppercase leading-tight">{o.itemTitle}</span>
                      <span className="text-zinc-500">{o.itemEdition}</span>
                    </div>

                    <div className="border-t border-zinc-200 pt-2 flex justify-between items-center font-bold text-sm">
                      <span>IMPORTE COBRADO:</span>
                      <span className="text-[#FF0055] text-base">{o.itemPrice.toFixed(2)} EUR</span>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
};
