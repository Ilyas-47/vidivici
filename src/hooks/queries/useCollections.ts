import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from '@/services/api/collections';
import type { Collection } from '@/types';
import { toast } from 'sonner';

export const useCollections = () => {
  const queryClient = useQueryClient();

  const { data: collections = [], isLoading, error } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: collectionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection créée avec succès');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la création');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: collectionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection supprimée');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Collection> }) => collectionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection modifiée avec succès');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la modification');
    }
  });

  return {
    collections,
    isLoading,
    error,
    createCollection: createMutation.mutateAsync,
    updateCollection: updateMutation.mutateAsync,
    deleteCollection: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
