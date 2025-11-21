import { Order, Settings } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';

const USER_KEY = 'plotarmour_current_user';

export async function loadOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('datetime', { ascending: false });
  
  if (error) {
    console.error('Error loading orders:', error);
    return [];
  }
  
  return data as Order[];
}

export async function saveOrder(order: Order): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .upsert(order);
  
  if (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
  
  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

export async function loadSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();
  
  if (error || !data) {
    console.error('Error loading settings:', error);
    // Return default settings structure
    return {
      products: {},
      prints: {},
      neckLabelPrice: 30,
      packagingPrice: 30,
      gstRate: 5,
      neckLabelMode: 'per_item',
      packagingMode: 'per_item',
      gstAppliesToPrint: false,
    };
  }
  
  return {
    products: data.product_prices as Record<string, number>,
    prints: data.print_prices as Record<string, number>,
    neckLabelPrice: data.neck_label_price,
    packagingPrice: data.packaging_price,
    gstRate: Number(data.gst_rate),
    neckLabelMode: data.neck_label_mode as 'per_item' | 'per_order',
    packagingMode: data.packaging_mode as 'per_item' | 'per_order',
    gstAppliesToPrint: data.gst_applies_to_print,
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({
      product_prices: settings.products,
      print_prices: settings.prints,
      neck_label_price: settings.neckLabelPrice,
      packaging_price: settings.packagingPrice,
      gst_rate: settings.gstRate,
      neck_label_mode: settings.neckLabelMode,
      packaging_mode: settings.packagingMode,
      gst_applies_to_print: settings.gstAppliesToPrint,
    });
  
  if (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

export function getCurrentUser(): 'divo' | 'nomad' {
  const stored = localStorage.getItem(USER_KEY);
  return (stored as 'divo' | 'nomad') || 'divo';
}

export function setCurrentUser(user: 'divo' | 'nomad'): void {
  localStorage.setItem(USER_KEY, user);
}
