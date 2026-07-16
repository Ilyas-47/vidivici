import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api/categories';
import type { Category } from '@/types';
import { toast } from 'sonner';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie créée avec succès');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la création');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie supprimée');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
