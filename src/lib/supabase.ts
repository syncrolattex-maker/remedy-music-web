/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zhaxrsgmjcloahmgfprb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYXhyc2dtamNsb2FobWdmcHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTcwNDEsImV4cCI6MjEwNzk3MzA0MX0.ruqr5oyNsjs7yiGZG9DZHP0nSq8zhqUaq0Bp_6vX3Pk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Order {
  id: string;
  transaction_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  item_title: string;
  item_format: 'vinyl' | 'cassette' | 'beats' | string;
  item_edition?: string;
  item_price: number;
  status: 'Pagado' | 'Enviado' | 'Entregado' | 'Cancelado' | string;
  created_at: string;
}

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-seed-01',
    transaction_id: 'PAYID-PP-8X92K11',
    customer_name: 'Marc Benavent',
    customer_email: 'mbenavent@gmail.com',
    customer_phone: '+34 612 345 678',
    shipping_address: 'Carrer de la Pau 14, 2ºB',
    shipping_city: 'Valencia',
    shipping_postal_code: '46003',
    shipping_country: 'España',
    item_title: 'Nuevos Capitales EP',
    item_format: 'vinyl',
    item_edition: 'Vinyl 7" Single',
    item_price: 14.50,
    status: 'Pagado',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'ord-seed-02',
    transaction_id: 'PAYID-PP-4M77L90',
    customer_name: 'Laura Morales',
    customer_email: 'laura.mora@hotmail.com',
    customer_phone: '+34 654 987 321',
    shipping_address: 'Calle Gran Vía 45, 4ºA',
    shipping_city: 'Madrid',
    shipping_postal_code: '28013',
    shipping_country: 'España',
    item_title: 'We can fly',
    item_format: 'vinyl',
    item_edition: 'Vinyl 7" Single',
    item_price: 12.50,
    status: 'Enviado',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'ord-seed-03',
    transaction_id: 'PAYID-PP-9K23Z55',
    customer_name: 'Carlos Soler',
    customer_email: 'csoler@outlook.es',
    customer_phone: '+34 688 112 233',
    shipping_address: 'Avenida de Francia 22, 5º',
    shipping_city: 'Valencia',
    shipping_postal_code: '46023',
    shipping_country: 'España',
    item_title: 'Raw Tape Series Vol. 1',
    item_format: 'cassette',
    item_edition: 'Cassette C-60 Limited',
    item_price: 9.99,
    status: 'Pagado',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem('remedy_cloud_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading local orders:', e);
  }
  return SEED_ORDERS;
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem('remedy_cloud_orders', JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving local orders:', e);
  }
}

export async function saveOrder(order: Omit<Order, 'id' | 'created_at' | 'status'> & { status?: string }) {
  const localOrder: Order = {
    id: `ord-loc-${Date.now()}`,
    transaction_id: order.transaction_id || `PAYID-LOCAL-${Date.now()}`,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    shipping_address: order.shipping_address,
    shipping_city: order.shipping_city,
    shipping_postal_code: order.shipping_postal_code,
    shipping_country: order.shipping_country || 'España',
    item_title: order.item_title,
    item_format: order.item_format,
    item_edition: order.item_edition || 'Standard',
    item_price: Number(order.item_price) || 0,
    status: order.status || 'Pagado',
    created_at: new Date().toISOString()
  };

  // Always mirror in localStorage for resilient offline availability
  const currentLocal = getLocalOrders();
  saveLocalOrders([localOrder, ...currentLocal]);

  try {
    // Attempt saving to Supabase with a 3.5s timeout promise race
    const timeoutPromise = new Promise<{ error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase timeout')), 3500)
    );

    const insertPromise = supabase
      .from('orders')
      .insert([
        {
          transaction_id: localOrder.transaction_id,
          customer_name: localOrder.customer_name,
          customer_email: localOrder.customer_email,
          customer_phone: localOrder.customer_phone,
          shipping_address: localOrder.shipping_address,
          shipping_city: localOrder.shipping_city,
          shipping_postal_code: localOrder.shipping_postal_code,
          shipping_country: localOrder.shipping_country,
          item_title: localOrder.item_title,
          item_format: localOrder.item_format,
          item_edition: localOrder.item_edition,
          item_price: localOrder.item_price,
          status: localOrder.status
        }
      ])
      .select()
      .single();

    const result: any = await Promise.race([insertPromise, timeoutPromise]);
    if (result?.data) {
      return { success: true, data: result.data };
    }
    return { success: true, data: localOrder };
  } catch (err) {
    console.warn('Supabase offline or timed out; order persisted in local storage safely:', err);
    return { success: true, data: localOrder };
  }
}

export async function fetchOrders(): Promise<{ orders: Order[]; error: any }> {
  try {
    const timeoutPromise = new Promise<{ error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase fetch timeout')), 3500)
    );

    const queryPromise = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    const result: any = await Promise.race([queryPromise, timeoutPromise]);
    if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
      // Sync to local cache
      saveLocalOrders(result.data as Order[]);
      return { orders: result.data as Order[], error: null };
    }
  } catch (err) {
    console.warn('Could not reach Supabase database; using local store:', err);
  }

  // Graceful fallback to persistent storage / seed
  const fallback = getLocalOrders();
  return { orders: fallback, error: null };
}

export async function updateOrderStatus(id: string, status: string) {
  // Update local store immediately
  const localList = getLocalOrders();
  const updated = localList.map(o => o.id === id ? { ...o, status } : o);
  saveLocalOrders(updated);

  try {
    const timeoutPromise = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error('Update timeout')), 3000)
    );

    const updatePromise = supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .then(res => !res.error);

    await Promise.race([updatePromise, timeoutPromise]);
    return true;
  } catch (err) {
    console.warn('Could not update status on Supabase; updated locally:', err);
    return true;
  }
}
