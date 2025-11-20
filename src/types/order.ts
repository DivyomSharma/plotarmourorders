export type OrderStatus = 'received' | 'made' | 'picked_up';

export type UserRole = 'divo' | 'nomad';

export interface OrderItem {
  product_id: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  datetime: string;
  customer_name?: string;
  design: string;
  items: OrderItem[];
  print_code: string;
  status: OrderStatus;
  created_by: UserRole;
  last_modified_by: UserRole;
  notes?: string;
}

export interface ProductPrice {
  [key: string]: number;
}

export interface PrintPrice {
  [key: string]: number;
}

export interface Settings {
  products: ProductPrice;
  prints: PrintPrice;
  neckLabelPrice: number;
  packagingPrice: number;
  gstRate: number;
  neckLabelMode: 'per_item' | 'per_order';
  packagingMode: 'per_item' | 'per_order';
  gstAppliesToPrint: boolean;
}

export interface OrderCalculation {
  productTotal: number;
  printTotal: number;
  neckLabelTotal: number;
  packagingTotal: number;
  gstAmount: number;
  orderTotal: number;
  totalIncludingPrint: number;
  itemBreakdown: {
    product: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}
