import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/api/orders';
import { toast } from 'sonner';

export const useOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // On rafraîchit aussi les stats du dashboard au cas où (revenus, etc.)
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Statut mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: ({ orderData, items, paymentData }: { orderData: any, items: any[], paymentData: any }) => ordersApi.create(orderData, items, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Commande créée avec succès');
    },
    onError: () => toast.error('Erreur lors de la création de la commande')
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string, notes: string }) => ordersApi.updateAdminNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Notes mises à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des notes');
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => ordersApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande modifiée avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la modification de la commande');
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: ordersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Commande supprimée avec succès');
    },
    onError: () => toast.error('Erreur lors de la suppression de la commande')
  });

  return {
    orders,
    isLoading,
    error,
    createOrder: createOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    updateNotes: updateNotesMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,
    deleteOrder: deleteOrderMutation.mutateAsync,
    isDeleting: deleteOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
  };
};
