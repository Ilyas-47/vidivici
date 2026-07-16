import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Trash2, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { shippingZonesApi } from '@/services/api/shippingZones';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function ShippingZonesPage() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const isSuperadmin = profile?.role === 'superadmin';

  const [editingZone, setEditingZone] = useState<any>(null);
  const [newCityName, setNewCityName] = useState('');
  const [newShippingCost, setNewShippingCost] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['shippingZones'],
    queryFn: shippingZonesApi.getAll
  });
  
  const { globalSearchTerm } = useOutletContext<{ globalSearchTerm: string }>() || { globalSearchTerm: '' };

  const filteredZones = zones.filter((z: any) => {
    const matchesGlobal = z.city_name.toLowerCase().includes(globalSearchTerm.toLowerCase()) || String(z.shipping_cost).includes(globalSearchTerm);
    const matchesLocal = z.city_name.toLowerCase().includes(localSearch.toLowerCase()) || String(z.shipping_cost).includes(localSearch);
    return matchesGlobal && matchesLocal;
  });

  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const paginatedZones = filteredZones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    setCurrentPage(1);
  };

  const createMutation = useMutation({
    mutationFn: shippingZonesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippingZones'] });
      toast.success('Ville ajoutée avec succès');
      setNewCityName('');
      setNewShippingCost('');
    },
    onError: (err: any) => toast.error('Erreur: ' + err.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => shippingZonesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippingZones'] });
      toast.success('Ville modifiée avec succès');
      setEditingZone(null);
    },
    onError: (err: any) => toast.error('Erreur: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: shippingZonesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippingZones'] });
      toast.success('Ville supprimée avec succès');
    },
    onError: (err: any) => toast.error('Erreur: ' + err.message)
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || newShippingCost === '') return;
    createMutation.mutate({
      city_name: newCityName,
      shipping_cost: Number(newShippingCost),
      is_active: true
    });
  };

  const toggleActive = (zone: any) => {
    updateMutation.mutate({ id: zone.id, data: { is_active: !zone.is_active } });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Villes et Frais de Livraison
          </h1>
          <p className="text-gray-500">Gérez les villes disponibles pour la livraison et leurs tarifs.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une ville..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      {isSuperadmin && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Ajouter une nouvelle ville</h2>
          <form onSubmit={handleAdd} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Nom de la ville</label>
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="w-full border rounded-md p-2"
                placeholder="ex: Casablanca"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Frais de livraison (MAD)</label>
              <input
                type="number"
                value={newShippingCost}
                onChange={(e) => setNewShippingCost(e.target.value)}
                className="w-full border rounded-md p-2"
                placeholder="ex: 20"
                min="0"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-black text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
            >
              <Plus size={16} /> Ajouter
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-600">Ville</th>
                <th className="p-4 font-medium text-gray-600">Tarif (MAD)</th>
                <th className="p-4 font-medium text-gray-600">Statut</th>
                {isSuperadmin && <th className="p-4 font-medium text-gray-600 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedZones.map((zone: any) => (
                <tr key={zone.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{zone.city_name}</td>
                  <td className="p-4">
                    {editingZone?.id === zone.id ? (
                      <input
                        type="number"
                        value={editingZone.cost}
                        onChange={e => setEditingZone({ ...editingZone, cost: e.target.value })}
                        className="w-24 border rounded p-1"
                        min="0"
                      />
                    ) : (
                      `${zone.shipping_cost} MAD`
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => isSuperadmin && toggleActive(zone)}
                      disabled={!isSuperadmin}
                      className={`px-3 py-1 rounded-full text-xs ${
                        zone.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      } ${!isSuperadmin ? 'cursor-default' : 'hover:opacity-80'}`}
                    >
                      {zone.is_active ? 'Actif' : 'Désactivé'}
                    </button>
                  </td>
                  {isSuperadmin && (
                    <td className="p-4 text-right">
                      {editingZone?.id === zone.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateMutation.mutate({ id: zone.id, data: { shipping_cost: Number(editingZone.cost) } })}
                            className="text-sm bg-black text-white px-3 py-1 rounded"
                          >
                            Sauver
                          </button>
                          <button
                            onClick={() => setEditingZone(null)}
                            className="text-sm bg-gray-200 px-3 py-1 rounded"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingZone({ id: zone.id, cost: zone.shipping_cost })}
                            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Voulez-vous vraiment supprimer cette ville ?')) {
                                deleteMutation.mutate(zone.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {paginatedZones.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Aucune ville trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredZones.length)} sur {filteredZones.length} villes
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </button>
              <div className="text-sm font-medium px-2">
                Page {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
