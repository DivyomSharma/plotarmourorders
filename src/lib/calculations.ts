import { Order, Settings, OrderCalculation } from '@/types/order';
import { parsePrintCode } from './printParser';

export function calculateOrder(order: Order, settings: Settings): OrderCalculation {
  // Calculate product total
  let productTotal = 0;
  const itemBreakdown = order.items.map(item => {
    const unitPrice = settings.products[item.product_id] || 0;
    const total = unitPrice * item.quantity;
    productTotal += total;
    return {
      product: item.product_id,
      quantity: item.quantity,
      unitPrice,
      total,
    };
  });

  // Calculate print total
  const printResult = parsePrintCode(order.print_code, settings.prints);
  const printTotal = printResult.valid ? printResult.total : 0;

  // Calculate total quantity for per-item modes
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate neck label
  const neckLabelTotal = settings.neckLabelMode === 'per_item'
    ? settings.neckLabelPrice * totalQuantity
    : settings.neckLabelPrice;

  // Calculate packaging
  const packagingTotal = settings.packagingMode === 'per_item'
    ? settings.packagingPrice * totalQuantity
    : settings.packagingPrice;

  // Calculate GST base
  let gstBase = productTotal + neckLabelTotal + packagingTotal;
  if (settings.gstAppliesToPrint) {
    gstBase += printTotal;
  }

  const gstAmount = (gstBase * settings.gstRate) / 100;

  // Calculate totals
  const orderTotal = productTotal + neckLabelTotal + packagingTotal + gstAmount;
  const totalIncludingPrint = orderTotal + printTotal;

  return {
    productTotal,
    printTotal,
    neckLabelTotal,
    packagingTotal,
    gstAmount,
    orderTotal,
    totalIncludingPrint,
    itemBreakdown,
  };
}

export function calculateGrandTotals(orders: Order[], settings: Settings) {
  const totals = {
    productTotal: 0,
    printTotal: 0,
    neckLabelTotal: 0,
    packagingTotal: 0,
    gstTotal: 0,
    grandTotal: 0,
    grandTotalWithPrint: 0,
    productQuantities: {} as Record<string, number>,
    productAmounts: {} as Record<string, number>,
  };

  orders.forEach(order => {
    const calc = calculateOrder(order, settings);
    totals.productTotal += calc.productTotal;
    totals.printTotal += calc.printTotal;
    totals.neckLabelTotal += calc.neckLabelTotal;
    totals.packagingTotal += calc.packagingTotal;
    totals.gstTotal += calc.gstAmount;
    totals.grandTotal += calc.orderTotal;
    totals.grandTotalWithPrint += calc.totalIncludingPrint;

    // Aggregate by product
    order.items.forEach(item => {
      const unitPrice = settings.products[item.product_id] || 0;
      totals.productQuantities[item.product_id] = 
        (totals.productQuantities[item.product_id] || 0) + item.quantity;
      totals.productAmounts[item.product_id] = 
        (totals.productAmounts[item.product_id] || 0) + (unitPrice * item.quantity);
    });
  });

  return totals;
}
