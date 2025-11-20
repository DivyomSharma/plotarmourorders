import { useState, useEffect } from 'react';
import { Order, Settings } from '@/types/order';
import { loadOrders, saveOrders, loadSettings, saveSettings, getCurrentUser, setCurrentUser } from '@/lib/storage';
import { exportToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderBookTable } from '@/components/OrderBookTable';
import { GrandTotals } from '@/components/GrandTotals';
import { AddOrderDialog } from '@/components/AddOrderDialog';
import { SettingsPage } from '@/pages/Settings';
import { Download, Plus, Settings as SettingsIcon, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentUser, setCurrentUserState] = useState<'divo' | 'nomad'>('divo');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    const loadedOrders = loadOrders();
    const loadedSettings = loadSettings();
    const user = getCurrentUser();
    setOrders(loadedOrders);
    setSettings(loadedSettings);
    setCurrentUserState(user);
  }, []);

  const handleUserChange = (user: 'divo' | 'nomad') => {
    setCurrentUserState(user);
    setCurrentUser(user);
    toast({
      title: `Switched to ${user}`,
      description: `You are now operating as ${user}`,
    });
  };

  const handleAddOrder = (orderData: Omit<Order, 'id' | 'datetime' | 'status' | 'last_modified_by'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      datetime: new Date().toISOString(),
      status: 'received',
      last_modified_by: currentUser,
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveOrders(updated);
    toast({
      title: 'Order created',
      description: 'New order has been added successfully',
    });
  };

  const handleEditOrder = (orderData: Omit<Order, 'id' | 'datetime' | 'status' | 'last_modified_by'>) => {
    if (!editingOrder) return;
    
    const updated = orders.map(o => 
      o.id === editingOrder.id 
        ? { 
            ...o, 
            ...orderData, 
            last_modified_by: currentUser,
            // Keep original datetime when editing
            datetime: editingOrder.datetime,
            status: editingOrder.status,
          }
        : o
    );
    setOrders(updated);
    saveOrders(updated);
    setEditingOrder(undefined);
    toast({
      title: 'Order updated',
      description: 'Changes have been saved successfully',
    });
  };

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, status, last_modified_by: currentUser } : o
    );
    setOrders(updated);
    saveOrders(updated);
    toast({
      title: 'Status updated',
      description: `Order marked as ${status.replace('_', ' ')}`,
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    saveOrders(updated);
    toast({
      title: 'Order deleted',
      description: 'Order has been removed successfully',
    });
  };

  const handleSettingsSave = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleExport = () => {
    if (!settings) return;
    exportToCSV(filteredOrders, settings);
    toast({
      title: 'Export complete',
      description: 'Order book has been exported to CSV',
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.design.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.product_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (showSettings && settings) {
    return (
      <SettingsPage
        settings={settings}
        onSave={handleSettingsSave}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  if (!settings) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">PlotArmour Order Book</h1>
              <p className="text-sm text-muted-foreground">Manage orders, track status, and calculate totals</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Select value={currentUser} onValueChange={handleUserChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="divo">divo (Admin)</SelectItem>
                    <SelectItem value="nomad">nomad (Ops)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              {currentUser === 'divo' && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Order
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Input
              placeholder="Search by design, customer, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="made">Made</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 space-y-6">
        <OrderBookTable
          orders={filteredOrders}
          settings={settings}
          currentUser={currentUser}
          onEdit={(order) => {
            setEditingOrder(order);
            setShowAddDialog(true);
          }}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteOrder}
        />

        <GrandTotals orders={filteredOrders} settings={settings} />
      </main>

      <AddOrderDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingOrder(undefined);
        }}
        onSave={editingOrder ? handleEditOrder : handleAddOrder}
        settings={settings}
        currentUser={currentUser}
        editOrder={editingOrder}
      />
    </div>
  );
};

export default Index;
