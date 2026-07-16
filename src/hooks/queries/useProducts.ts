import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products';
import { toast } from 'sonner';

export const useProducts = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, current }: { id: string, current: boolean }) => productsApi.toggleActive(id, current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Visibilité mise à jour');
    },
    onError: () => {
      toast.error('Erreur de mise à jour');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  return {
    products,
    isLoading,
    error,
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleActive: toggleActiveMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
};
