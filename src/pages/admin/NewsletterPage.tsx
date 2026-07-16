import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Download, Trash2 } from 'lucide-react';
import { newsletterApi } from '@/services/api/newsletter';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function NewsletterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();
  const isSuperadmin = profile?.role === 'superadmin';

  const { data: subscribers = [], refetch } = useQuery({
    queryKey: ['newsletter'],
    queryFn: newsletterApi.getAll
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) return;
    
    setIsLoading(true);
    try {
      await newsletterApi.delete(id);
      toast.success('Abonné supprimé avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (subscribers.length === 0) return;
    
    // Ajout du BOM (\uFEFF) pour forcer Excel à lire en UTF-8 et utilisation du point-virgule (;)
    const csvContent = "\uFEFF" 
      + "Email;Date d'inscription;Statut\n"
      + subscribers.map((sub: any) => `${sub.email};${new Date(sub.created_at).toLocaleDateString('fr-FR')};Actif`).join("\n");
      
    // Encodage en Blob pour éviter les limites de taille des URI
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inscrits_newsletter.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Abonnés Newsletter
          </h1>
          <p className="text-gray-500 mt-1">Gérez la liste de vos inscrits ({subscribers.length} total)</p>
        </div>
        <button
          onClick={handleExport}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          <Download size={18} />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'inscription
              </th>
              {isSuperadmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  Aucun abonné pour le moment
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber: any) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subscriber.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subscriber.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  {isSuperadmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
