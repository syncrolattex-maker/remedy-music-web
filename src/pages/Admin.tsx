/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Truck, 
  Search, 
  Download, 
  RefreshCw, 
  Lock, 
  Unlock, 
  CheckCircle, 
  Clock, 
  Disc, 
  Music, 
  Copy, 
  Plus, 
  X, 
  ExternalLink,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { Order, fetchOrders, updateOrderStatus, saveOrder, deleteOrder } from '../lib/supabase';

// Default PIN for dashboard access
const ADMIN_PIN = 'remedy2026';

export const Admin: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('remedy_admin_auth') === 'true' || sessionStorage.getItem('remedy_admin_authenticated') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Orders and loading state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  // Manual order modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    shipping_country: 'España',
    item_title: '',
    item_format: 'vinyl',
    item_edition: 'Standard',
    item_price: '15.00',
    status: 'Pagado'
  });

  // Copied address tooltip
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load orders
  const loadOrders = async () => {
    setRefreshing(true);
    const { orders: data, error } = await fetchOrders();
    if (!error) {
      setOrders(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  // Handle PIN authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().toLowerCase();
    const validPins = ['remedy2026', 'musicvlc2020', '2020', 'remedy'];
    if (validPins.includes(cleanPin)) {
      sessionStorage.setItem('remedy_admin_auth', 'true');
      sessionStorage.setItem('remedy_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('remedy_admin_auth');
    sessionStorage.removeItem('remedy_admin_authenticated');
    setIsAuthenticated(false);
  };

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await updateOrderStatus(orderId, newStatus);
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId: string, customerName: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el pedido de ${customerName}?`)) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      await deleteOrder(orderId);
    }
  };

  // Handle manual order creation
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(manualForm.item_price) || 0;
    const { success, data } = await saveOrder({
      transaction_id: `MANUAL-${Date.now().toString(36).toUpperCase()}`,
      customer_name: manualForm.customer_name,
      customer_email: manualForm.customer_email,
      customer_phone: manualForm.customer_phone,
      shipping_address: manualForm.shipping_address,
      shipping_city: manualForm.shipping_city,
      shipping_postal_code: manualForm.shipping_postal_code,
      shipping_country: manualForm.shipping_country,
      item_title: manualForm.item_title,
      item_format: manualForm.item_format,
      item_edition: manualForm.item_edition,
      item_price: priceNum,
      status: manualForm.status
    });

    if (success && data) {
      setOrders(prev => [data, ...prev]);
      setIsModalOpen(false);
      setManualForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_postal_code: '',
        shipping_country: 'España',
        item_title: '',
        item_format: 'vinyl',
        item_edition: 'Standard',
        item_price: '15.00',
        status: 'Pagado'
      });
    }
  };

  // Copy address to clipboard for shipping packaging
  const copyAddress = (order: Order) => {
    const text = `${order.customer_name}\n${order.shipping_address}\n${order.shipping_postal_code} ${order.shipping_city} (${order.shipping_country})\nTel: ${order.customer_phone}\nEmail: ${order.customer_email}`;
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Export orders to CSV (Excel compatible)
  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      'Fecha',
      'ID Transacción',
      'Cliente',
      'Email',
      'Teléfono',
      'Dirección',
      'Código Postal',
      'Ciudad',
      'País',
      'Producto',
      'Formato',
      'Edición',
      'Importe (€)',
      'Estado'
    ];

    const rows = orders.map(o => [
      new Date(o.created_at).toLocaleString('es-ES'),
      o.transaction_id || '',
      `"${o.customer_name.replace(/"/g, '""')}"`,
      o.customer_email,
      `"${o.customer_phone}"`,
      `"${o.shipping_address.replace(/"/g, '""')}"`,
      o.shipping_postal_code,
      `"${o.shipping_city.replace(/"/g, '""')}"`,
      `"${o.shipping_country}"`,
      `"${o.item_title.replace(/"/g, '""')}"`,
      o.item_format,
      `"${(o.item_edition || '').replace(/"/g, '""')}"`,
      o.item_price.toFixed(2),
      o.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `remedy_ventas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived metrics
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.item_price) || 0), 0);
  }, [orders]);

  const totalOrders = orders.length;

  const pendingShipments = useMemo(() => {
    return orders.filter(o => o.status === 'Pagado').length;
  }, [orders]);

  const averageTicket = useMemo(() => {
    return totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';
  }, [totalRevenue, totalOrders]);

  const formatCounts = useMemo(() => {
    const counts = { vinyl: 0, cassette: 0, beats: 0 };
    orders.forEach(o => {
      const f = o.item_format?.toLowerCase();
      if (f === 'vinyl') counts.vinyl++;
      else if (f === 'cassette') counts.cassette++;
      else if (f === 'beats') counts.beats++;
    });
    return counts;
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        searchTerm === '' ||
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shipping_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.item_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesFormat = formatFilter === 'all' || o.item_format?.toLowerCase() === formatFilter;

      return matchesSearch && matchesStatus && matchesFormat;
    });
  }, [orders, searchTerm, statusFilter, formatFilter]);

  // PIN Gate Screen
  if (!isAuthenticated) {
    return (
      <main className="w-full min-h-[85vh] bg-[#0c0c0c] text-white flex items-center justify-center p-4 font-mono select-none">
        <div className="w-full max-w-md border-4 border-black bg-[#161616] p-8 shadow-[12px_12px_0_0_#FFDE00] relative">
          <div className="flex items-center gap-3 border-b-2 border-zinc-700 pb-4 mb-6">
            <div className="p-2 bg-[#FFDE00] text-black border-2 border-black">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-heading text-3xl uppercase tracking-wider text-white">REMEDY ADMIN</h1>
              <p className="font-mono text-xs text-zinc-400">// ACCESO AL PANEL DE VENTAS</p>
            </div>
          </div>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-xs uppercase font-bold text-zinc-300 mb-2">
                Introduce el código PIN de acceso:
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN o contraseña..."
                autoFocus
                className="w-full px-4 py-3 bg-black border-3 border-zinc-700 text-[#00F0FF] font-mono text-lg tracking-widest focus:border-[#FFDE00] focus:outline-none"
              />
              {pinError && (
                <p className="font-mono text-xs text-[#FF0055] font-bold mt-2">
                  [!] PIN incorrecto. Prueba de nuevo.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#FFDE00] text-black border-3 border-black font-mono font-black text-sm uppercase tracking-widest hover:bg-white active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0_0_#000] cursor-pointer transition-all mt-2"
            >
              Entrar al Panel
            </button>
          </form>

          <p className="font-mono text-[10px] text-zinc-500 text-center mt-6 uppercase">
            Remedy Music Records · Sistema Interno v2.0
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-6 md:p-10 font-sans pb-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* ── TOP HEADER ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-zinc-800 pb-6 gap-4 select-none">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-[#FFDE00] text-black font-mono text-xs font-black px-2 py-0.5 border-2 border-black rotate-1">
                LIVE OPS
              </span>
              <span className="font-mono text-xs text-zinc-400 tracking-widest uppercase">
                // BASE DE DATOS SUPABASE CONECTADA
              </span>
            </div>
            <h1 className="font-heading text-5xl md:text-7xl uppercase tracking-wider text-white">
              CONTROL DE VENTAS
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadOrders}
              disabled={refreshing}
              className="px-4 py-2.5 bg-black border-2 border-zinc-600 text-zinc-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-white hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FFDE00]' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Refrescar'}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#00F0FF] text-black border-2 border-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-white shadow-[3px_3px_0_0_#fff] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Añadir Venta Manual
            </button>

            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-[#FFDE00] text-black border-2 border-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-white shadow-[3px_3px_0_0_#fff] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Descargar Excel / CSV
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2.5 bg-zinc-900 border-2 border-zinc-700 text-zinc-400 font-mono text-xs font-bold uppercase hover:text-red-400 hover:border-red-500 transition-all cursor-pointer"
              title="Cerrar sesión de administrador"
            >
              Salir
            </button>
          </div>
        </div>

        {/* ── METRIC KPI CARDS ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Revenue */}
          <div className="border-4 border-black bg-[#161616] p-6 shadow-[8px_8px_0_0_#FFDE00] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-xs text-zinc-400 font-bold uppercase tracking-wider">// Ingresos Totales</span>
              <div className="p-2 bg-[#FFDE00] text-black border-2 border-black">
                <DollarSign className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="font-heading text-5xl text-white tracking-wide">
                {totalRevenue.toFixed(2)} €
              </div>
              <span className="font-mono text-[10px] text-zinc-400 uppercase mt-1 block">
                Facturación acumulada en tienda
              </span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="border-4 border-black bg-[#161616] p-6 shadow-[8px_8px_0_0_#00F0FF] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-xs text-zinc-400 font-bold uppercase tracking-wider">// Pedidos Totales</span>
              <div className="p-2 bg-[#00F0FF] text-black border-2 border-black">
                <Package className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="font-heading text-5xl text-white tracking-wide">
                {totalOrders}
              </div>
              <span className="font-mono text-[10px] text-zinc-400 uppercase mt-1 block">
                Transacciones registradas
              </span>
            </div>
          </div>

          {/* Pending Dispatch */}
          <div className="border-4 border-black bg-[#161616] p-6 shadow-[8px_8px_0_0_#FF0055] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-xs text-zinc-400 font-bold uppercase tracking-wider">// Envíos Pendientes</span>
              <div className="p-2 bg-[#FF0055] text-white border-2 border-black">
                <Truck className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="font-heading text-5xl text-[#FF0055] tracking-wide">
                {pendingShipments}
              </div>
              <span className="font-mono text-[10px] text-zinc-400 uppercase mt-1 block">
                Listos para empaquetar
              </span>
            </div>
          </div>

          {/* Average Ticket */}
          <div className="border-4 border-black bg-[#161616] p-6 shadow-[8px_8px_0_0_#FFFFFF] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-xs text-zinc-400 font-bold uppercase tracking-wider">// Ticket Medio</span>
              <div className="p-2 bg-white text-black border-2 border-black">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="font-heading text-5xl text-white tracking-wide">
                {averageTicket} €
              </div>
              <span className="font-mono text-[10px] text-zinc-400 uppercase mt-1 block">
                Promedio de gasto por comprador
              </span>
            </div>
          </div>

        </div>

        {/* ── FORMAT SALES DISTRIBUTION BREAKDOWN ───────────── */}
        <div className="border-4 border-black bg-[#141414] p-6 shadow-[8px_8px_0_0_#000]">
          <h2 className="font-heading text-2xl uppercase tracking-wider text-white mb-4 border-b border-zinc-800 pb-2">
            Distribución de Ventas por Formato
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Vinyl */}
            <div className="flex items-center gap-4 bg-black/60 p-4 border-2 border-zinc-800">
              <div className="p-3 bg-[#FF0055] text-white border-2 border-black rounded-full shrink-0">
                <Disc className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-mono text-xs font-bold uppercase">
                  <span>Vinilos (45s Club)</span>
                  <span className="text-[#FF0055]">{formatCounts.vinyl} u.</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#FF0055] h-full" 
                    style={{ width: `${totalOrders > 0 ? (formatCounts.vinyl / totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cassette */}
            <div className="flex items-center gap-4 bg-black/60 p-4 border-2 border-zinc-800">
              <div className="p-3 bg-[#FFDE00] text-black border-2 border-black rounded shrink-0">
                <span className="font-mono font-black text-xs">TAPE</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-mono text-xs font-bold uppercase">
                  <span>Casetes (Tape Series)</span>
                  <span className="text-[#FFDE00]">{formatCounts.cassette} u.</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#FFDE00] h-full" 
                    style={{ width: `${totalOrders > 0 ? (formatCounts.cassette / totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Beats */}
            <div className="flex items-center gap-4 bg-black/60 p-4 border-2 border-zinc-800">
              <div className="p-3 bg-[#00F0FF] text-black border-2 border-black rounded shrink-0">
                <Music className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-mono text-xs font-bold uppercase">
                  <span>Beats Digitales</span>
                  <span className="text-[#00F0FF]">{formatCounts.beats} u.</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#00F0FF] h-full" 
                    style={{ width: `${totalOrders > 0 ? (formatCounts.beats / totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── SEARCH & FILTERS BAR ──────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#161616] p-4 border-4 border-black shadow-[6px_6px_0_0_#000]">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, email, teléfono, ciudad o disco..."
              className="w-full pl-9 pr-4 py-2 bg-black border-2 border-zinc-700 font-mono text-xs text-white focus:border-[#FFDE00] focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400 font-bold uppercase">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black border-2 border-zinc-700 px-3 py-2 text-white font-mono uppercase focus:border-[#FFDE00] focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="Pagado">Pagado (Pendiente de envío)</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregado">Entregado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400 font-bold uppercase">Formato:</span>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-black border-2 border-zinc-700 px-3 py-2 text-white font-mono uppercase focus:border-[#FFDE00] focus:outline-none"
            >
              <option value="all">Todos los formatos</option>
              <option value="vinyl">Vinilos</option>
              <option value="cassette">Casetes</option>
              <option value="beats">Beats</option>
            </select>
          </div>

        </div>

        {/* ── ORDERS DISPATCH TABLE ─────────────────────────── */}
        <div className="border-4 border-black bg-[#161616] shadow-[10px_10px_0_0_#000] overflow-hidden">
          
          <div className="p-4 border-b-2 border-zinc-800 bg-black flex justify-between items-center">
            <h2 className="font-heading text-3xl uppercase tracking-wider text-white">
              Histórico de Pedidos ({filteredOrders.length})
            </h2>
            <span className="font-mono text-xs text-zinc-500 uppercase">
              Orden cronológico descendente
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-sm text-zinc-500 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-3 border-[#FFDE00] border-t-transparent rounded-full animate-spin"></div>
              <span>Conectando con Supabase y cargando pedidos...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center font-mono text-xs text-zinc-500 flex flex-col items-center gap-2">
              <Package className="w-8 h-8 text-zinc-600 stroke-[1.5]" />
              <span className="text-zinc-400 font-bold uppercase tracking-wider">No hay pedidos registrados todavía</span>
              <span className="text-zinc-600 max-w-sm">Cada vez que un cliente complete un pago en PayPal o añadas una venta manual, se registrará aquí en tiempo real.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-800 bg-[#202020] text-zinc-400 uppercase text-[11px] select-none">
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Contacto</th>
                    <th className="p-3.5">Dirección de Envío</th>
                    <th className="p-3.5">Producto Adquirido</th>
                    <th className="p-3.5">Importe</th>
                    <th className="p-3.5">Estado / Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredOrders.map(order => {
                    const isCopied = copiedId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-zinc-900/60 transition-colors">
                        
                        {/* Date & Tx */}
                        <td className="p-3.5 whitespace-nowrap text-zinc-400">
                          <span className="text-white font-bold block">
                            {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(order.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[9px] bg-black px-1.5 py-0.5 border border-zinc-700 text-zinc-400 font-mono block mt-1 w-max">
                            {order.transaction_id ? order.transaction_id.slice(-12) : 'PAYPAL'}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="p-3.5 whitespace-nowrap">
                          <strong className="text-white text-sm block">{order.customer_name}</strong>
                          <span className="text-[10px] text-zinc-400">Comprador verificado</span>
                        </td>

                        {/* Contact */}
                        <td className="p-3.5 whitespace-nowrap">
                          <a 
                            href={`mailto:${order.customer_email}`} 
                            className="text-[#00F0FF] hover:underline block"
                          >
                            {order.customer_email}
                          </a>
                          {order.customer_phone && (
                            <a 
                              href={`tel:${order.customer_phone}`} 
                              className="text-zinc-300 hover:text-white block mt-0.5"
                            >
                              {order.customer_phone}
                            </a>
                          )}
                        </td>

                        {/* Shipping Address */}
                        <td className="p-3.5 min-w-[220px]">
                          <div className="flex items-start justify-between gap-2">
                            <div className="leading-snug">
                              <span className="text-white font-medium block">{order.shipping_address}</span>
                              <span className="text-zinc-400 text-[11px] block">
                                {order.shipping_postal_code} {order.shipping_city}, {order.shipping_country}
                              </span>
                            </div>
                            <button
                              onClick={() => copyAddress(order)}
                              title="Copiar etiqueta completa de envío al portapapeles"
                              className={`p-1.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-all shrink-0 ${isCopied ? 'bg-green-600 text-white border-green-500' : 'bg-black'}`}
                            >
                              {isCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Product item */}
                        <td className="p-3.5 min-w-[180px]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 border ${
                              order.item_format?.toLowerCase() === 'vinyl' 
                                ? 'bg-[#FF0055] text-white border-black' 
                                : order.item_format?.toLowerCase() === 'cassette' 
                                ? 'bg-[#FFDE00] text-black border-black' 
                                : 'bg-[#00F0FF] text-black border-black'
                            }`}>
                              {order.item_format}
                            </span>
                            {order.item_edition && (
                              <span className="text-[9px] text-zinc-400 border border-zinc-800 px-1">
                                {order.item_edition}
                              </span>
                            )}
                          </div>
                          <span className="text-white font-bold block">{order.item_title}</span>
                        </td>

                        {/* Price */}
                        <td className="p-3.5 whitespace-nowrap text-base font-bold text-[#FFDE00]">
                          {Number(order.item_price).toFixed(2)} €
                        </td>

                        {/* Status selector & Delete */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`px-2.5 py-1.5 font-mono text-xs font-bold uppercase border-2 focus:outline-none cursor-pointer ${
                                order.status === 'Pagado'
                                  ? 'bg-yellow-950/80 text-yellow-300 border-yellow-500'
                                  : order.status === 'Enviado'
                                  ? 'bg-blue-950/80 text-blue-300 border-blue-500'
                                  : order.status === 'Entregado'
                                  ? 'bg-green-950/80 text-green-300 border-green-500'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-600'
                              }`}
                            >
                              <option value="Pagado">🟡 Pagado (Preparar)</option>
                              <option value="Enviado">🔵 Enviado</option>
                              <option value="Entregado">🟢 Entregado</option>
                              <option value="Cancelado">🔴 Cancelado</option>
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(order.id, order.customer_name)}
                              title="Eliminar registro"
                              className="p-1.5 text-zinc-500 hover:text-[#FF0055] hover:bg-zinc-900 border border-transparent hover:border-zinc-700 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* ── MANUAL ORDER MODAL ────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#161616] border-4 border-black p-6 shadow-[12px_12px_0_0_#00F0FF] relative font-mono">
            
            <div className="flex justify-between items-center border-b-2 border-zinc-700 pb-3 mb-4">
              <h3 className="font-heading text-3xl uppercase tracking-wider text-white">
                Añadir Venta Manual
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Nombre Comprador *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.customer_name}
                    onChange={(e) => setManualForm({ ...manualForm, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                    placeholder="Ej. Marcos Vidal"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={manualForm.customer_email}
                    onChange={(e) => setManualForm({ ...manualForm, customer_email: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                    placeholder="marcos@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={manualForm.customer_phone}
                    onChange={(e) => setManualForm({ ...manualForm, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={manualForm.shipping_city}
                    onChange={(e) => setManualForm({ ...manualForm, shipping_city: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                    placeholder="Valencia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-bold mb-1">Dirección de Envío</label>
                <input
                  type="text"
                  value={manualForm.shipping_address}
                  onChange={(e) => setManualForm({ ...manualForm, shipping_address: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                  placeholder="Calle, número, piso..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={manualForm.shipping_postal_code}
                    onChange={(e) => setManualForm({ ...manualForm, shipping_postal_code: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                    placeholder="46001"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">País</label>
                  <input
                    type="text"
                    value={manualForm.shipping_country}
                    onChange={(e) => setManualForm({ ...manualForm, shipping_country: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-zinc-800 pt-3">
                <div className="col-span-2">
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Disco / Álbum *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.item_title}
                    onChange={(e) => setManualForm({ ...manualForm, item_title: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                    placeholder="Ej. That's the way"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Importe (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={manualForm.item_price}
                    onChange={(e) => setManualForm({ ...manualForm, item_price: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Formato</label>
                  <select
                    value={manualForm.item_format}
                    onChange={(e) => setManualForm({ ...manualForm, item_format: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none uppercase"
                  >
                    <option value="vinyl">Vinilo 45s</option>
                    <option value="cassette">Casete</option>
                    <option value="beats">Beat Digital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1">Estado</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#FFDE00] focus:outline-none uppercase"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-600 text-zinc-400 hover:text-white uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FFDE00] text-black font-black uppercase hover:bg-white transition-all shadow-[2px_2px_0_0_#fff]"
                >
                  Guardar Venta
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </main>
  );
};
