import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/services/api/finance';
import { toast } from 'sonner';

export const useFinance = () => {
  const queryClient = useQueryClient();

  // Queries
  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: financeApi.getExpenses
  });

  const salariesQuery = useQuery({
    queryKey: ['salaries'],
    queryFn: financeApi.getSalaries
  });

  // Mutations Expenses
  const createExpenseMutation = useMutation({
    mutationFn: financeApi.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Dépense ajoutée avec succès');
    },
    onError: () => toast.error('Erreur lors de l\'ajout de la dépense')
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: financeApi.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Dépense supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  // Mutations Salaries
  const createSalaryMutation = useMutation({
    mutationFn: financeApi.createSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Salaire ajouté avec succès');
    },
    onError: () => toast.error('Erreur lors de l\'ajout du salaire')
  });

  const updateSalaryStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'paid' | 'unpaid' }) => financeApi.updateSalaryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Statut du salaire mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour')
  });

  const deleteSalaryMutation = useMutation({
    mutationFn: financeApi.deleteSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Salaire supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  return {
    expenses: expensesQuery.data || [],
    isLoadingExpenses: expensesQuery.isLoading,
    salaries: salariesQuery.data || [],
    isLoadingSalaries: salariesQuery.isLoading,
    createExpense: createExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    createSalary: createSalaryMutation.mutateAsync,
    updateSalaryStatus: updateSalaryStatusMutation.mutateAsync,
    deleteSalary: deleteSalaryMutation.mutateAsync
  };
};
