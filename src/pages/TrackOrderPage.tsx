import { useState } from 'react';
import { Search, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { ordersApi } from '@/services/api/orders';
import { toast } from 'sonner';

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ order: any; items: any[] } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setResult(null);

    try {
      // Nettoyer l'ID si l'utilisateur met des espaces
      const cleanId = orderId.trim();
      const cleanPhone = phone.trim();
      
      const data = await ordersApi.trackOrder(cleanId, cleanPhone);
      
      if (data && data.order) {
        setResult(data);
      } else {
        toast.error('Aucune commande trouvée avec ces informations.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la recherche de la commande.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'En attente', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock };
      case 'processing': return { text: 'En préparation', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package };
      case 'shipped': return { text: 'Expédiée', color: 'text-purple-600', bg: 'bg-purple-50', icon: Truck };
      case 'delivered': return { text: 'Livrée', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
      case 'cancelled': return { text: 'Annulée', color: 'text-red-600', bg: 'bg-red-50', icon: CheckCircle };
      default: return { text: status, color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock };
    }
  };

  return (
    <main className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-normal tracking-[-0.96px] mb-4">Suivre ma commande</h1>
          <p className="text-gray-500">
            Entrez votre identifiant de commande et le numéro de téléphone utilisé lors de l'achat pour voir l'état de votre livraison.
          </p>
        </div>

        <div className="bg-white p-8 border border-gray-200 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1 uppercase tracking-wider text-xs">ID Commande</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
                placeholder="ex: A1B2C3D4"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1 uppercase tracking-wider text-xs">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
                placeholder="Votre numéro"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto px-8 py-3 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 h-[50px] flex items-center justify-center gap-2"
              >
                {isLoading ? 'Recherche...' : <><Search size={16} /> Suivre</>}
              </button>
            </div>
          </form>
        </div>

        {hasSearched && !isLoading && !result && (
          <div className="text-center py-8 bg-red-50 text-red-600 border border-red-100">
            Aucune commande correspondante n'a été trouvée. Veuillez vérifier vos informations.
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white p-8 border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Commande N°</span>
                  <span className="font-mono text-lg font-medium">{result.order.id.split('-')[0].toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 block mb-1">Date</span>
                  <span>{new Date(result.order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}</span>
                </div>
              </div>

              <div className="py-8 text-center">
                <span className="text-sm text-gray-500 block mb-4 uppercase tracking-wider">Statut actuel</span>
                {(() => {
                  const statusInfo = getStatusDisplay(result.order.status);
                  const Icon = statusInfo.icon;
                  return (
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                      <Icon size={24} />
                      <span className="text-lg font-medium">{statusInfo.text}</span>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm uppercase tracking-wider mb-4">Détails des articles</h3>
                <div className="space-y-4">
                  {result.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex gap-4">
                        <span className="text-gray-500">{item.quantity}x</span>
                        <div>
                          <span>{item.product_name}</span>
                          <span className="text-gray-500 ml-2">({item.color_name}, {item.size_name})</span>
                        </div>
                      </div>
                      <span>{item.total_price} MAD</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span>{result.order.subtotal} MAD</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Livraison</span>
                  <span>{result.order.shipping_fee === 0 ? 'Gratuite' : `${result.order.shipping_fee} MAD`}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 font-medium">
                  <span>Total</span>
                  <span>{result.order.total_amount} MAD</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 border border-gray-200 text-sm">
              <h3 className="uppercase tracking-wider mb-2">Adresse de livraison</h3>
              <p className="text-gray-600">{result.order.customer_name}</p>
              <p className="text-gray-600">{result.order.shipping_address}</p>
              <p className="text-gray-600">{result.order.shipping_city}</p>
              <p className="text-gray-600">{result.order.customer_phone}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
