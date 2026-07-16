import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useOrders } from '@/hooks/queries/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Eye, ClipboardList, Edit } from 'lucide-react';
import type { Order } from '@/types';

export function DeliveriesPage() {
  const { orders, isLoading, updateStatus, updateNotes } = useOrders();
  const { profile } = useAuth();
  const isSuperadmin = profile?.role === 'superadmin';
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const { globalSearchTerm } = useOutletContext<{ globalSearchTerm: string }>() || { globalSearchTerm: '' };

  // Filtrer pour ne montrer que les commandes confirmées ou en cours de livraison
  const deliveryOrders = orders.filter(o => 
    o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered' || o.status === 'refunded'
  );

  const filteredOrders = deliveryOrders.filter(o => 
    o.id.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    (o.customer_name || '').toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    (o.customer_email || '').toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    (o.shipping_city || '').toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isSuperadmin) {
    return <div className="p-8 text-center">Accès refusé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          Commandes à livrer
        </h1>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut Livraison</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucune commande à livrer pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium text-xs">{order.id.split('-')[0]}...</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{order.shipping_city}</div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.total_amount.toFixed(2)} MAD
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.status} 
                      onValueChange={(val) => updateStatus({ id: order.id, status: val })}
                    >
                      <SelectTrigger className={`h-7 text-xs w-[120px] ${getStatusColor(order.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Confirmée (À expédier)</SelectItem>
                        <SelectItem value="shipped">Expédié</SelectItem>
                        <SelectItem value="delivered">Livré</SelectItem>
                        <SelectItem value="refunded">Remboursé</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedOrder(order);
                      setNotesValue(order.admin_notes || '');
                      setEditingNotes(false);
                    }}>
                      <Eye className="w-4 h-4 text-blue-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de la Commande</DialogTitle>
            <DialogDescription>
              {selectedOrder && `ID: ${selectedOrder.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Client</h3>
                <div className="text-sm bg-muted p-3 rounded-md">
                  <p><span className="text-muted-foreground">Nom:</span> {selectedOrder.customer_name}</p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customer_email}</p>
                  <p><span className="text-muted-foreground">Téléphone:</span> {selectedOrder.customer_phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Livraison</h3>
                <div className="text-sm bg-muted p-3 rounded-md">
                  <p><span className="text-muted-foreground">Adresse:</span> {selectedOrder.shipping_address}</p>
                  <p><span className="text-muted-foreground">Ville:</span> {selectedOrder.shipping_city}</p>
                  {selectedOrder.notes && (
                    <p><span className="text-muted-foreground">Notes:</span> {selectedOrder.notes}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Résumé Financier</h3>
                <div className="text-sm bg-muted p-3 rounded-md space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{Number(selectedOrder.subtotal || 0).toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{Number(selectedOrder.shipping_fee || 0).toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t mt-2">
                    <span>Total</span>
                    <span>{Number(selectedOrder.total_amount).toFixed(2)} MAD</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Notes Administrateur</h3>
                <div className="bg-muted p-3 rounded-md">
                  {editingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full min-h-[100px] p-3 rounded-md border text-sm"
                        placeholder="Ajouter une note interne..."
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>Annuler</Button>
                        <Button size="sm" onClick={() => {
                          updateNotes({ id: selectedOrder.id, notes: notesValue });
                          setSelectedOrder({ ...selectedOrder, admin_notes: notesValue });
                          setEditingNotes(false);
                        }}>Sauvegarder</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <p className="text-sm whitespace-pre-wrap flex-1 mr-4">
                        {selectedOrder.admin_notes ? selectedOrder.admin_notes : <span className="text-muted-foreground italic">Aucune note interne.</span>}
                      </p>
                      <Button size="sm" variant="ghost" onClick={() => setEditingNotes(true)} className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
