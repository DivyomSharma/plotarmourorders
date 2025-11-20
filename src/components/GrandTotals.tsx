import { Order, Settings } from '@/types/order';
import { calculateGrandTotals } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface GrandTotalsProps {
  orders: Order[];
  settings: Settings;
}

export function GrandTotals({ orders, settings }: GrandTotalsProps) {
  const totals = calculateGrandTotals(orders, settings);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary Totals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Product Quantities:</h4>
            <div className="grid gap-2">
              {Object.entries(totals.productQuantities).map(([product, qty]) => (
                <div key={product} className="flex justify-between text-sm">
                  <span>{product}:</span>
                  <span className="font-medium">{qty} items</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Product Amounts:</h4>
            <div className="grid gap-2">
              {Object.entries(totals.productAmounts).map(([product, amount]) => (
                <div key={product} className="flex justify-between text-sm">
                  <span>{product}:</span>
                  <span className="font-medium">₹{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid gap-2">
            <div className="flex justify-between text-sm">
              <span>Total Product Cost:</span>
              <span className="font-medium">₹{totals.productTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Print Cost:</span>
              <span className="font-medium">₹{totals.printTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Neck Label:</span>
              <span className="font-medium">₹{totals.neckLabelTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Packaging:</span>
              <span className="font-medium">₹{totals.packagingTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total GST:</span>
              <span className="font-medium">₹{totals.gstTotal.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 pt-2">
            <div className="flex justify-between">
              <span className="font-semibold">Grand Total:</span>
              <span className="font-bold text-lg">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-primary">Grand Total (with Print):</span>
              <span className="font-bold text-lg text-primary">₹{totals.grandTotalWithPrint.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
