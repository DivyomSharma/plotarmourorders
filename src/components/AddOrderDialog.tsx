import { useState } from 'react';
import { Order, OrderItem, Settings } from '@/types/order';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { parsePrintCode } from '@/lib/printParser';
import { calculateOrder } from '@/lib/calculations';

interface AddOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, 'id' | 'datetime' | 'status' | 'last_modified_by'>) => void;
  settings: Settings;
  currentUser: 'divo' | 'nomad';
  editOrder?: Order;
}

export function AddOrderDialog({ open, onClose, onSave, settings, currentUser, editOrder }: AddOrderDialogProps) {
  const [customerName, setCustomerName] = useState(editOrder?.customer_name || '');
  const [design, setDesign] = useState(editOrder?.design || '');
  const [items, setItems] = useState<OrderItem[]>(
    editOrder?.items || [{ product_id: '', size: 'M', quantity: 1 }]
  );
  const [printCode, setPrintCode] = useState(editOrder?.print_code || '');
  const [notes, setNotes] = useState(editOrder?.notes || '');

  const productOptions = Object.keys(settings.products);
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const printResult = parsePrintCode(printCode, settings.prints);

  const addItem = () => {
    setItems([...items, { product_id: '', size: 'M', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = () => {
    const validItems = items.filter(item => item.product_id && item.quantity > 0);
    if (!design || validItems.length === 0) {
      alert('Please fill in design and at least one valid product item');
      return;
    }

    onSave({
      customer_name: customerName,
      design,
      items: validItems,
      print_code: printCode,
      created_by: currentUser,
      notes,
    });

    // Reset form
    setCustomerName('');
    setDesign('');
    setItems([{ product_id: '', size: 'M', quantity: 1 }]);
    setPrintCode('');
    setNotes('');
    onClose();
  };

  const previewCalc = editOrder ? calculateOrder(
    { ...editOrder, items, print_code: printCode },
    settings
  ) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editOrder ? 'Edit Order' : 'Add New Order'}</DialogTitle>
          <DialogDescription>
            Fill in the order details. Date & time will be recorded automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name (Optional)</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="design">Design *</Label>
            <Input
              id="design"
              value={design}
              onChange={(e) => setDesign(e.target.value)}
              placeholder="Enter design name"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Products *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => updateItem(index, 'product_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {productOptions.map(product => (
                        <SelectItem key={product} value={product}>
                          {product} (₹{settings.products[product]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Select
                    value={item.size}
                    onValueChange={(value) => updateItem(index, 'size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>

                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="printCode">
              Print Code
              <span className="text-xs text-muted-foreground ml-2">
                Format: 6A2+1A3 (quantity + code)
              </span>
            </Label>
            <Input
              id="printCode"
              value={printCode}
              onChange={(e) => setPrintCode(e.target.value)}
              placeholder="e.g., 6A2+1A3"
              className={!printResult.valid && printCode ? 'border-destructive' : ''}
            />
            {!printResult.valid && printCode && (
              <p className="text-sm text-destructive">{printResult.error}</p>
            )}
            {printResult.valid && printResult.prints.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Print total: ₹{printResult.total.toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes"
              rows={3}
            />
          </div>

          {previewCalc && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Order Preview:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Product Cost:</div>
                <div className="text-right">₹{previewCalc.productTotal.toFixed(2)}</div>
                <div>Print Cost:</div>
                <div className="text-right">₹{previewCalc.printTotal.toFixed(2)}</div>
                <div>Neck Label:</div>
                <div className="text-right">₹{previewCalc.neckLabelTotal.toFixed(2)}</div>
                <div>Packaging:</div>
                <div className="text-right">₹{previewCalc.packagingTotal.toFixed(2)}</div>
                <div>GST:</div>
                <div className="text-right">₹{previewCalc.gstAmount.toFixed(2)}</div>
                <div className="font-semibold pt-2 border-t">Total (with Print):</div>
                <div className="text-right font-semibold pt-2 border-t">
                  ₹{previewCalc.totalIncludingPrint.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editOrder ? 'Update' : 'Create'} Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
