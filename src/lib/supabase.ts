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

export async function saveOrder(order: Omit<Order, 'id' | 'created_at' | 'status'> & { status?: string }) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
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
          item_price: order.item_price,
          status: order.status || 'Pagado'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving order to Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error saving order:', err);
    return { success: false, error: err };
  }
}

export async function fetchOrders(): Promise<{ orders: Order[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return { orders: [], error };
    }

    return { orders: (data as Order[]) || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching orders:', err);
    return { orders: [], error: err };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error updating order status:', err);
    return false;
  }
}
