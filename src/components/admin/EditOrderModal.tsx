import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shippingZonesApi } from '@/services/api/shippingZones';
import { useOrders } from '@/hooks/queries/useOrders';
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
import type { Order } from '@/types';

interface EditOrderModalProps {
  order: Order | null;
  onClose: () => void;
}

export function EditOrderModal({ order, onClose }: EditOrderModalProps) {
  const { updateOrder, isUpdating } = useOrders();

  const { data: shippingZones = [] } = useQuery({
    queryKey: ['shippingZones'],
    queryFn: shippingZonesApi.getAll
  });
  const activeZones = shippingZones.filter((z: any) => z.is_active);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  
  const [subtotal, setSubtotal] = useState<number | ''>('');
  const [shippingFee, setShippingFee] = useState<number | ''>('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');

  useEffect(() => {
    if (order) {
      setCustomerName(order.customer_name || '');
      setCustomerPhone(order.customer_phone || '');
      setCustomerEmail(order.customer_email || '');
      setShippingCity(order.shipping_city || '');
      setShippingAddress(order.shipping_address || '');
      setSubtotal(order.subtotal || 0);
      setShippingFee(order.shipping_fee || 0);
      setTotalAmount(order.total_amount || 0);
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!customerName || !customerPhone || !shippingCity || !shippingAddress) {
      alert("Veuillez remplir les informations obligatoires.");
      return;
    }

    const data = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      shipping_city: shippingCity,
      shipping_address: shippingAddress,
      subtotal: Number(subtotal),
      shipping_fee: Number(shippingFee),
      total_amount: Number(totalAmount)
    };

    await updateOrder({ id: order.id, data });
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la Commande</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Informations de Livraison</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom Complet *</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Téléphone *</Label>
                <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
              </div>
            </div>
            
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label>Ville *</Label>
            <Select value={shippingCity} onValueChange={setShippingCity} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                {activeZones.map((z: any) => (
                  <SelectItem key={z.id} value={z.city_name}>
                    {z.city_name}
                  </SelectItem>
                ))}
                {order && shippingCity && !activeZones.find((z: any) => z.city_name === shippingCity) && (
                  <SelectItem value={shippingCity}>{shippingCity}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Adresse Complète *</Label>
            <Input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required />
          </div>

          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm border-b pb-2">Résumé Financier (MAD)</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Sous-total</Label>
                <Input type="number" step="0.01" value={subtotal} onChange={e => setSubtotal(e.target.value === '' ? '' : Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label>Frais de Livraison</Label>
                <Input type="number" step="0.01" value={shippingFee} onChange={e => setShippingFee(e.target.value === '' ? '' : Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Total</Label>
                <Input type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))} className="font-bold" required />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Attention : Modifier ces montants affectera directement les statistiques de revenus et de bénéfices.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
