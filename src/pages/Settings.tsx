import { useState } from 'react';
import { Settings as SettingsType } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsPageProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onBack: () => void;
}

export function SettingsPage({ settings, onSave, onBack }: SettingsPageProps) {
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(localSettings);
    toast({
      title: 'Settings saved',
      description: 'Your configuration has been updated successfully.',
    });
  };

  const addProduct = () => {
    const name = prompt('Enter product name:');
    if (name && !localSettings.products[name]) {
      setLocalSettings({
        ...localSettings,
        products: { ...localSettings.products, [name]: 0 },
      });
    }
  };

  const removeProduct = (name: string) => {
    const { [name]: _, ...rest } = localSettings.products;
    setLocalSettings({
      ...localSettings,
      products: rest,
    });
  };

  const updateProductPrice = (name: string, price: number) => {
    setLocalSettings({
      ...localSettings,
      products: { ...localSettings.products, [name]: price },
    });
  };

  const addPrintCode = () => {
    const code = prompt('Enter print code (e.g., A2, A3, A4):');
    if (code && !localSettings.prints[code.toUpperCase()]) {
      setLocalSettings({
        ...localSettings,
        prints: { ...localSettings.prints, [code.toUpperCase()]: 0 },
      });
    }
  };

  const removePrintCode = (code: string) => {
    const { [code]: _, ...rest } = localSettings.prints;
    setLocalSettings({
      ...localSettings,
      prints: rest,
    });
  };

  const updatePrintPrice = (code: string, price: number) => {
    setLocalSettings({
      ...localSettings,
      prints: { ...localSettings.prints, [code]: price },
    });
  };

  const addDesign = () => {
    const name = prompt('Enter design name:');
    if (name && !localSettings.designs[name]) {
      setLocalSettings({
        ...localSettings,
        designs: { ...localSettings.designs, [name]: name },
      });
    }
  };

  const removeDesign = (name: string) => {
    const { [name]: _, ...rest } = localSettings.designs;
    setLocalSettings({
      ...localSettings,
      designs: rest,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Configure product prices and calculation rules</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back to Orders
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Prices</CardTitle>
            <CardDescription>Set unit costs for each product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(localSettings.products).map(([name, price]) => (
              <div key={name} className="flex items-center gap-3">
                <Label className="flex-1">{name}</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => updateProductPrice(name, parseFloat(e.target.value) || 0)}
                  className="w-32"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(name)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Print Prices</CardTitle>
            <CardDescription>Set prices for print codes (A2, A3, A4, etc.)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(localSettings.prints).map(([code, price]) => (
              <div key={code} className="flex items-center gap-3">
                <Label className="flex-1 font-mono">{code}</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => updatePrintPrice(code, parseFloat(e.target.value) || 0)}
                  className="w-32"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePrintCode(code)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addPrintCode}>
              <Plus className="mr-2 h-4 w-4" />
              Add Print Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Designs</CardTitle>
            <CardDescription>Manage frequently used design names</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(localSettings.designs).map(([name]) => (
              <div key={name} className="flex items-center gap-3">
                <Label className="flex-1">{name}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDesign(name)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addDesign}>
              <Plus className="mr-2 h-4 w-4" />
              Add Design
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Fees</CardTitle>
            <CardDescription>Configure neck label, packaging, and GST</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="flex-1">Neck Label Price</Label>
                <Input
                  type="number"
                  value={localSettings.neckLabelPrice}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    neckLabelPrice: parseFloat(e.target.value) || 0,
                  })}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Apply per item (vs per order)</Label>
                <Switch
                  checked={localSettings.neckLabelMode === 'per_item'}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    neckLabelMode: checked ? 'per_item' : 'per_order',
                  })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="flex-1">Packaging Price</Label>
                <Input
                  type="number"
                  value={localSettings.packagingPrice}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    packagingPrice: parseFloat(e.target.value) || 0,
                  })}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Apply per item (vs per order)</Label>
                <Switch
                  checked={localSettings.packagingMode === 'per_item'}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    packagingMode: checked ? 'per_item' : 'per_order',
                  })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="flex-1">GST Rate (%)</Label>
                <Input
                  type="number"
                  value={localSettings.gstRate}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    gstRate: parseFloat(e.target.value) || 0,
                  })}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Apply GST to print prices</Label>
                <Switch
                  checked={localSettings.gstAppliesToPrint}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    gstAppliesToPrint: checked,
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
