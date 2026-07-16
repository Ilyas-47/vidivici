import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promoCodesApi } from '@/services/api/promoCodes';
import type { PromoCode } from '@/services/api/promoCodes';
import { toast } from 'sonner';

export const usePromoCodes = () => {
  const queryClient = useQueryClient();

  const { data: promoCodes = [], isLoading, error } = useQuery({
    queryKey: ['promoCodes'],
    queryFn: promoCodesApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: promoCodesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Code promo créé avec succès');
    },
    onError: (err: any) => {
      toast.error('Erreur lors de la création du code promo: ' + err.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<PromoCode> }) => promoCodesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Code promo modifié avec succès');
    },
    onError: (err: any) => {
      toast.error('Erreur lors de la modification du code promo: ' + err.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: promoCodesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Code promo supprimé avec succès');
    },
    onError: (err: any) => {
      toast.error('Erreur lors de la suppression du code promo: ' + err.message);
    }
  });

  return {
    promoCodes,
    isLoading,
    error,
    createPromoCode: createMutation.mutateAsync,
    updatePromoCode: updateMutation.mutateAsync,
    deletePromoCode: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
