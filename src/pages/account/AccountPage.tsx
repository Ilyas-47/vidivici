import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogOut, Package, Clock, CheckCircle, Truck, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ordersApi } from '@/services/api/orders';

export function AccountPage() {
  const { session, profile, signOut } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      ordersApi.getByCustomer(session.user.id)
        .then(data => {
          setOrders(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [session]);

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'En attente', color: 'text-yellow-600', icon: Clock };
      case 'processing': return { text: 'En préparation', color: 'text-blue-600', icon: Package };
      case 'shipped': return { text: 'Expédiée', color: 'text-purple-600', icon: Truck };
      case 'delivered': return { text: 'Livrée', color: 'text-green-600', icon: CheckCircle };
      case 'cancelled': return { text: 'Annulée', color: 'text-red-600', icon: CheckCircle };
      default: return { text: status, color: 'text-gray-600', icon: Clock };
    }
  };

  return (
    <main className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-normal tracking-[-0.96px] mb-2 flex items-center gap-3">
              <User className="w-8 h-8" />
              Mon Compte
            </h1>
            <p className="text-gray-500">
              Bonjour, {profile?.first_name || session.user.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        <div>
          <h2 className="text-xl font-normal mb-6 uppercase tracking-wider text-sm">Historique des commandes</h2>
          
          {isLoading ? (
            <p className="text-gray-500">Chargement de vos commandes...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white p-8 border border-gray-200 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Vous n'avez pas encore passé de commande.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const statusInfo = getStatusDisplay(order.status);
                const Icon = statusInfo.icon;
                
                return (
                  <div key={order.id} className="bg-white border border-gray-200 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500 block uppercase tracking-wider mb-1">Commande N°</span>
                        <span className="font-mono">{order.id.split('-')[0].toUpperCase()}</span>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className="text-xs text-gray-500 block uppercase tracking-wider mb-1">Date</span>
                        <span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <span className="text-xs text-gray-500 block uppercase tracking-wider mb-1">Total</span>
                        <span className="font-medium">{order.total_amount} MAD</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Icon size={16} className={statusInfo.color} />
                      <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                    </div>

                    <div className="space-y-3">
                      {(order.order_items || []).map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm items-center bg-gray-50 p-3">
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
