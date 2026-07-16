import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export function CheckoutSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  if (!orderId) {
    // Si la page est accédée directement sans commande, on redirige
    setTimeout(() => navigate('/'), 2000);
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Redirection...</p>
      </main>
    );
  }

  return (
    <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-6 py-12 text-center bg-white p-12 border border-gray-200">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-normal tracking-[-0.96px] mb-4">Commande Confirmée !</h1>
        <p className="text-gray-600 mb-8">
          Merci pour votre achat. Votre commande a été enregistrée avec succès. Vous serez contacté par notre équipe pour la confirmation de la livraison.
        </p>
        
        <div className="bg-gray-50 p-4 border border-gray-100 mb-8 text-sm">
          <span className="text-gray-500 uppercase tracking-wider text-xs block mb-1">Identifiant de commande</span>
          <span className="font-mono font-medium">{orderId.split('-')[0].toUpperCase()}</span>
        </div>

        <Link
          to="/shop"
          className="inline-block px-8 py-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    </main>
  );
}
