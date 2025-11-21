import { Settings, Order } from '@/types/order';

export const defaultSettings: Settings = {
  products: {
    'Tee220gsm': 250,
    'Acid Wash': 350,
    'Black Vest': 230,
    'Tee240gsm': 270,
    'Hoodie Acid': 680,
    'Regular t shirt': 190,
    'Pant': 450,
    'Acidwash hoodie': 680,
    'Hoodie': 560,
  },
  prints: {
    'A2': 150,
    'A3': 120,
    'A4': 30,
  },
  designs: {},
  neckLabelPrice: 30,
  packagingPrice: 30,
  gstRate: 5,
  neckLabelMode: 'per_item',
  packagingMode: 'per_item',
  gstAppliesToPrint: false,
};

export const seedOrders: Order[] = [
  {
    id: '1',
    datetime: new Date('2025-07-21T10:00:00').toISOString(),
    customer_name: 'Sample Customer 1',
    design: 'Design Alpha',
    items: [
      { product_id: 'Tee220gsm', size: 'M', quantity: 3 },
      { product_id: 'Tee240gsm', size: 'L', quantity: 3 },
      { product_id: 'Hoodie Acid', size: 'XL', quantity: 1 },
    ],
    print_code: '6A2+1A3',
    status: 'received',
    created_by: 'divo',
    last_modified_by: 'divo',
    notes: 'First sample order',
  },
  {
    id: '2',
    datetime: new Date('2025-07-22T14:30:00').toISOString(),
    customer_name: 'Sample Customer 2',
    design: 'Design Beta',
    items: [
      { product_id: 'Acid Wash', size: 'M', quantity: 5 },
      { product_id: 'Black Vest', size: 'L', quantity: 2 },
    ],
    print_code: '7A2',
    status: 'made',
    created_by: 'divo',
    last_modified_by: 'nomad',
    notes: 'Rush order',
  },
  {
    id: '3',
    datetime: new Date('2025-07-23T09:15:00').toISOString(),
    customer_name: 'Sample Customer 3',
    design: 'Design Gamma',
    items: [
      { product_id: 'Hoodie', size: 'M', quantity: 4 },
      { product_id: 'Pant', size: 'L', quantity: 4 },
    ],
    print_code: '8A3+4A4',
    status: 'picked_up',
    created_by: 'divo',
    last_modified_by: 'nomad',
  },
];
