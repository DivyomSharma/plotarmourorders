import { Order, Settings } from '@/types/order';
import { defaultSettings, seedOrders } from './defaultData';

const ORDERS_KEY = 'plotarmour_orders';
const SETTINGS_KEY = 'plotarmour_settings';
const USER_KEY = 'plotarmour_current_user';

export function loadOrders(): Order[] {
  const stored = localStorage.getItem(ORDERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with seed data
  saveOrders(seedOrders);
  return seedOrders;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function loadSettings(): Settings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with defaults
  saveSettings(defaultSettings);
  return defaultSettings;
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getCurrentUser(): 'divo' | 'nomad' {
  const stored = localStorage.getItem(USER_KEY);
  return (stored as 'divo' | 'nomad') || 'divo';
}

export function setCurrentUser(user: 'divo' | 'nomad'): void {
  localStorage.setItem(USER_KEY, user);
}
