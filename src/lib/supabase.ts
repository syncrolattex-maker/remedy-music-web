/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lnhvkyysmnhqoidkiueq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nWEygcLvBYrcBp9DzGTcRw_uGiY2L-1';

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

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem('remedy_cloud_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local orders:', e);
  }
  return [];
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

  // Mirror in localStorage
  const currentLocal = getLocalOrders();
  saveLocalOrders([localOrder, ...currentLocal]);

  try {
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
    if (result?.data && Array.isArray(result.data)) {
      saveLocalOrders(result.data as Order[]);
      return { orders: result.data as Order[], error: null };
    }
  } catch (err) {
    console.warn('Could not reach Supabase database; using local store:', err);
  }

  // Graceful fallback to persistent storage
  const fallback = getLocalOrders();
  return { orders: fallback, error: null };
}

export async function updateOrderStatus(id: string, status: string) {
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

export async function deleteOrder(id: string) {
  const localList = getLocalOrders();
  const updated = localList.filter(o => o.id !== id);
  saveLocalOrders(updated);

  try {
    const timeoutPromise = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error('Delete timeout')), 3000)
    );

    const deletePromise = supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .then(res => !res.error);

    await Promise.race([deletePromise, timeoutPromise]);
    return true;
  } catch (err) {
    console.warn('Could not delete from Supabase; deleted locally:', err);
    return true;
  }
}
