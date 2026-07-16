import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '@/services/api/brands';
import { toast } from 'sonner';

export const useBrands = () => {
  const queryClient = useQueryClient();

  const { data: brands = [], isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: brandsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: brandsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Marque créée avec succès');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la création');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: brandsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Marque supprimée');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  });

  return {
    brands,
    isLoading,
    error,
    createBrand: createMutation.mutateAsync,
    deleteBrand: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
