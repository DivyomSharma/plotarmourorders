import { Order, Settings } from '@/types/order';
import { calculateOrder } from './calculations';

export function exportToCSV(orders: Order[], settings: Settings): void {
  const headers = [
    'Date & Time',
    'Customer',
    'Design',
    'Products',
    'Sizes',
    'Quantities',
    'Print Code',
    'Print Price',
    'Product Cost',
    'Neck Label',
    'Packaging',
    'GST',
    'Total',
    'Total with Print',
    'Status',
    'Created By',
    'Notes',
  ];

  const rows = orders.map(order => {
    const calc = calculateOrder(order, settings);
    const date = new Date(order.datetime).toLocaleString();
    const products = order.items.map(i => i.product_id).join('; ');
    const sizes = order.items.map(i => i.size).join('; ');
    const quantities = order.items.map(i => i.quantity).join('; ');

    return [
      date,
      order.customer_name || '',
      order.design,
      products,
      sizes,
      quantities,
      order.print_code,
      calc.printTotal.toFixed(2),
      calc.productTotal.toFixed(2),
      calc.neckLabelTotal.toFixed(2),
      calc.packagingTotal.toFixed(2),
      calc.gstAmount.toFixed(2),
      calc.orderTotal.toFixed(2),
      calc.totalIncludingPrint.toFixed(2),
      order.status,
      order.created_by,
      order.notes || '',
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `orderbook_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
