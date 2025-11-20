import { useState } from 'react';
import { Order, Settings } from '@/types/order';
import { calculateOrder } from '@/lib/calculations';
import { parsePrintCode } from '@/lib/printParser';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Edit, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface OrderBookTableProps {
  orders: Order[];
  settings: Settings;
  currentUser: 'divo' | 'nomad';
  onEdit: (order: Order) => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  onDelete: (orderId: string) => void;
}

export function OrderBookTable({ orders, settings, currentUser, onEdit, onStatusChange, onDelete }: OrderBookTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      received: 'bg-status-received text-white',
      made: 'bg-status-made text-white',
      picked_up: 'bg-status-picked text-white',
      paid: 'bg-green-600 text-white',
    };

    const labels = {
      received: 'Received',
      made: 'Made',
      picked_up: 'Picked Up',
      paid: 'Paid',
    };

    return (
      <Badge className={cn('font-medium', variants[status])}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-10"></TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Design</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Print Code</TableHead>
            <TableHead className="text-right">Print Price</TableHead>
            <TableHead className="text-right">Product Cost</TableHead>
            <TableHead className="text-right">Neck Label</TableHead>
            <TableHead className="text-right">Packaging</TableHead>
            <TableHead className="text-right">GST</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right font-semibold">Total + Print</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const calc = calculateOrder(order, settings);
            const printResult = parsePrintCode(order.print_code, settings.prints);
            const isExpanded = expandedRows.has(order.id);

            return (
              <>
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(order.id)}
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.datetime).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{order.customer_name || '-'}</TableCell>
                  <TableCell className="font-medium">{order.design}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.product_id} ({item.size}) x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn('font-mono text-sm', !printResult.valid && 'text-destructive')}>
                      {order.print_code || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{calc.printTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{calc.productTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{calc.neckLabelTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{calc.packagingTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{calc.gstAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">₹{calc.orderTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ₹{calc.totalIncludingPrint.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {currentUser === 'divo' && (
                          <DropdownMenuItem onClick={() => onEdit(order)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </DropdownMenuItem>
                        )}
                        {order.status !== 'made' && (
                          <DropdownMenuItem onClick={() => onStatusChange(order.id, 'made')}>
                            Mark as Made
                          </DropdownMenuItem>
                        )}
                        {order.status !== 'picked_up' && (
                          <DropdownMenuItem onClick={() => onStatusChange(order.id, 'picked_up')}>
                            Mark as Picked Up
                          </DropdownMenuItem>
                        )}
                        {order.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => onStatusChange(order.id, 'paid')}>
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        {currentUser === 'divo' && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(order.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Order
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={15} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Product Breakdown:</h4>
                          <div className="grid gap-2">
                            {calc.itemBreakdown.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.product} x {item.quantity}</span>
                                <span>₹{item.unitPrice} × {item.quantity} = ₹{item.total.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {printResult.valid && printResult.prints.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Print Breakdown:</h4>
                            <div className="grid gap-2">
                              {printResult.prints.map((print, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{print.code} x {print.quantity}</span>
                                  <span>₹{print.price} × {print.quantity} = ₹{print.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {order.notes && (
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Notes:</h4>
                            <p className="text-sm text-muted-foreground">{order.notes}</p>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          Created by: {order.created_by} | Last modified by: {order.last_modified_by}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
