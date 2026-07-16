  import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '@/hooks/queries/useProducts';
import { useOrders } from '@/hooks/queries/useOrders';
import { shippingZonesApi } from '@/services/api/shippingZones';
import { promoCodesApi } from '@/services/api/promoCodes';
import type { PromoCode } from '@/services/api/promoCodes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import type { Product } from '@/types';

interface OrderItemState {
  id: string;
  product: Product | null;
  color: string;
  size: string;
  quantity: number;
}

export function CreateOrderModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { products } = useProducts();
  const { createOrder, isCreating } = useOrders();

  const { data: shippingZones = [] } = useQuery({
    queryKey: ['shippingZones'],
    queryFn: shippingZonesApi.getAll
  });

  const activeZones = shippingZones.filter((z: any) => z.is_active);

  // Customer State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // Items State
  const [items, setItems] = useState<OrderItemState[]>([{
    id: Math.random().toString(),
    product: null,
    color: '',
    size: '',
    quantity: 1
  }]);

  // Finances
  const [shippingFee, setShippingFee] = useState<number>(40);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = item.product.sale_price ? Number(item.product.sale_price) : Number(item.product.price);
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setIsValidatingPromo(true);
    setPromoError('');
    try {
      const code = await promoCodesApi.validateCode(promoCodeInput.trim());
      setAppliedPromoCode(code);
      setPromoCodeInput('');
    } catch (err: any) {
      setPromoError(err.message || 'Code invalide');
      setAppliedPromoCode(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), product: null, color: '', size: '', quantity: 1 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof OrderItemState, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        // If product changes, reset color and size
        if (field === 'product') {
          const prod = value as Product;
          newItem.color = prod.colors && prod.colors.length > 0 ? (typeof prod.colors[0] === 'string' ? prod.colors[0] : prod.colors[0].name || '') : '';
          newItem.size = prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : '';
        }
        return newItem;
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customerName || !customerPhone || !shippingCity || !shippingAddress) {
      alert("Veuillez remplir les informations obligatoires du client.");
      return;
    }

    const validItems = items.filter(i => i.product && i.quantity > 0);
    if (validItems.length === 0) {
      alert("Veuillez ajouter au moins un produit valide.");
      return;
    }

    for (const item of validItems) {
      if ((item.product?.sizes?.length && !item.size) || (item.product?.colors?.length && !item.color)) {
        alert("Veuillez sélectionner la taille et la couleur pour tous les produits.");
        return;
      }
    }

    const subtotal = calculateSubtotal();
    
    let discountAmount = 0;
    if (appliedPromoCode) {
      if (appliedPromoCode.discount_type === 'percentage') {
        discountAmount = (subtotal * appliedPromoCode.discount_value) / 100;
      } else {
        discountAmount = appliedPromoCode.discount_value;
      }
    }

    const total_amount = Math.max(0, subtotal - discountAmount + Number(shippingFee));

    const orderData = {
      customer_name: customerName,
      customer_email: customerEmail || '',
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      status: 'pending',
      subtotal,
      shipping_fee: Number(shippingFee),
      tax_amount: 0,
      discount_amount: discountAmount,
      total_amount
    };

    const paymentData = {
      provider: 'cash_on_delivery',
      payment_method: 'cod',
      amount: total_amount,
      status: 'pending'
    };

    await createOrder({ orderData, items: validItems, paymentData });
    
    if (appliedPromoCode) {
      try {
        await promoCodesApi.update(appliedPromoCode.id, { used_count: appliedPromoCode.used_count + 1 });
      } catch (e) {}
    }

    onOpenChange(false);
    
    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setShippingCity('');
    setShippingAddress('');
    setItems([{ id: Math.random().toString(), product: null, color: '', size: '', quantity: 1 }]);
    setShippingFee(40);
    setAppliedPromoCode(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  const subtotal = calculateSubtotal();
  let discountAmount = 0;
  if (appliedPromoCode) {
    if (appliedPromoCode.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedPromoCode.discount_value) / 100;
    } else {
      discountAmount = appliedPromoCode.discount_value;
    }
  }
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const activeProducts = products.filter(p => p.is_active !== false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une Commande Manuelle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 mt-4">
          
          {/* Section Client */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-4">1. Informations Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom Complet *</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Téléphone *</Label>
                <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email (Optionnel)</Label>
                <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ville *</Label>
                <Select 
                  value={shippingCity} 
                  onValueChange={(val) => {
                    setShippingCity(val);
                    const zone = activeZones.find((z: any) => z.city_name === val);
                    if (zone) {
                      setShippingFee(Number(zone.shipping_cost));
                    }
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeZones.map((z: any) => (
                      <SelectItem key={z.id} value={z.city_name}>
                        {z.city_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Adresse Complète *</Label>
                <Input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Section Produits */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">2. Produits</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter un produit
              </Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-wrap gap-4 items-end bg-white p-4 rounded border">
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <Label>Produit</Label>
                    <Select 
                      value={item.product?.id || ''} 
                      onValueChange={(val) => {
                        const prod = activeProducts.find(p => p.id === val);
                        updateItem(item.id, 'product', prod);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} - {p.sale_price ? p.sale_price : p.price} MAD</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {item.product?.colors && item.product.colors.length > 0 && (
                    <div className="w-32 space-y-2">
                      <Label>Couleur</Label>
                      <Select value={item.color} onValueChange={(val) => updateItem(item.id, 'color', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {item.product.colors.map((c: any, i: number) => {
                            const cName = typeof c === 'string' ? c : (c.name || 'Couleur');
                            return <SelectItem key={i} value={cName}>{cName}</SelectItem>;
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {item.product?.sizes && item.product.sizes.length > 0 && (
                    <div className="w-24 space-y-2">
                      <Label>Taille</Label>
                      <Select value={item.size} onValueChange={(val) => updateItem(item.id, 'size', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {item.product.sizes.map((s: string) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="w-24 space-y-2">
                    <Label>Qté</Label>
                    <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                  </div>

                  <Button type="button" variant="ghost" size="icon" className="text-red-500 mb-0.5" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section Finances */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-4">3. Résumé</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Sous-total :</span>
                <span className="font-medium">{subtotal.toFixed(2)} MAD</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Code Promo :</span>
                {!appliedPromoCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="flex gap-1">
                        <Input 
                          value={promoCodeInput} 
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())} 
                          placeholder="Code" 
                          className="w-24 h-8 uppercase text-xs" 
                        />
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={handleApplyPromo} disabled={isValidatingPromo || !promoCodeInput}>
                          Appliquer
                        </Button>
                      </div>
                      {promoError && <span className="text-red-500 text-[10px] mt-1">{promoError}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">-{discountAmount.toFixed(2)} MAD</span>
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-red-500 p-1" onClick={() => setAppliedPromoCode(null)}>
                      Retirer
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Frais de livraison :</span>
                <div className="w-32">
                  <Input type="number" min="0" value={shippingFee} onChange={(e) => setShippingFee(Number(e.target.value))} className="h-8 text-right bg-white" />
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                <span>Total :</span>
                <span>{finalTotal.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Création...' : 'Créer la Commande'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
