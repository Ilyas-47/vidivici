import { useState } from 'react';
import { Tag, Plus, Trash2, Edit, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { usePromoCodes } from '@/hooks/queries/usePromoCodes';
import type { PromoCode } from '@/services/api/promoCodes';

export function PromoCodesPage() {
  const { promoCodes, isLoading, createPromoCode, updatePromoCode, deletePromoCode, isCreating, isUpdating, isDeleting } = usePromoCodes();
  
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(promoCodes.length / itemsPerPage);
  const paginatedCodes = promoCodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue === '') return;

    try {
      const data = {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        usage_limit: usageLimit === '' ? null : Number(usageLimit),
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        is_active: true
      };

      if (editingId) {
        await updatePromoCode({ id: editingId, data });
        setEditingId(null);
      } else {
        await createPromoCode(data as any);
      }
      
      resetForm();
    } catch (err) {
      // Error handled by hook
    }
  };

  const startEdit = (pc: PromoCode) => {
    setEditingId(pc.id);
    setCode(pc.code);
    setDiscountType(pc.discount_type);
    setDiscountValue(pc.discount_value);
    setUsageLimit(pc.usage_limit ?? '');
    setStartDate(pc.start_date ? new Date(pc.start_date).toISOString().slice(0, 16) : '');
    setEndDate(pc.end_date ? new Date(pc.end_date).toISOString().slice(0, 16) : '');
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setUsageLimit('');
    setStartDate('');
    setEndDate('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce code promo ?')) {
      await deletePromoCode(id);
    }
  };

  const toggleStatus = async (pc: PromoCode) => {
    await updatePromoCode({ id: pc.id, data: { is_active: !pc.is_active } });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Codes Promo
          </h1>
          <p className="text-gray-500">Gérez les codes de réduction pour vos clients.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Formulaire */}
        <div className="md:col-span-1">
          <form onSubmit={handleCreateOrUpdate} className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">{editingId ? 'Modifier le code' : 'Nouveau code'}</h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ex: ETE2024"
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black/5 outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de réduction</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black/5 outline-none bg-white"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (DH)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur ({discountType === 'percentage' ? '%' : 'DH'})
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={discountType === 'percentage' ? 'ex: 15' : 'ex: 50'}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black/5 outline-none"
                  min="1"
                  max={discountType === 'percentage' ? 100 : undefined}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début (Optionnel)</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black/5 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (Optionnel)</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black/5 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limite d'utilisation (Optionnel)</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="ex: 100 (laisser vide si illimité)"
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black/5 outline-none"
                  min="1"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="w-full bg-black text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                >
                  {editingId ? (
                    isUpdating ? 'Enregistrement...' : 'Enregistrer'
                  ) : (
                    <><Plus size={18} /> {isCreating ? 'Création...' : 'Créer le code'}</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Liste */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Chargement des codes promo...</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-medium text-gray-600">Code</th>
                    <th className="p-4 font-medium text-gray-600">Réduction</th>
                    <th className="p-4 font-medium text-gray-600">Validité</th>
                    <th className="p-4 font-medium text-gray-600">Utilisations</th>
                    <th className="p-4 font-medium text-gray-600">Statut</th>
                    <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedCodes.map((pc) => (
                    <tr key={pc.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-black">{pc.code}</td>
                      <td className="p-4">
                        {pc.discount_type === 'percentage' ? `${pc.discount_value}%` : `${pc.discount_value} DH`}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {pc.start_date || pc.end_date ? (
                          <div className="flex flex-col gap-1">
                            {pc.start_date && <span>Du: {new Date(pc.start_date).toLocaleDateString('fr-FR')}</span>}
                            {pc.end_date && <span>Au: {new Date(pc.end_date).toLocaleDateString('fr-FR')}</span>}
                          </div>
                        ) : (
                          'Illimité'
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {pc.used_count} / {pc.usage_limit ? pc.usage_limit : '∞'}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleStatus(pc)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            pc.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {pc.is_active ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(pc)}
                            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(pc.id)}
                            disabled={isDeleting}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedCodes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">Aucun code promo créé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                <div className="text-sm text-gray-500">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, promoCodes.length)} sur {promoCodes.length} codes
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
      </div>
    </div>
  );
}
