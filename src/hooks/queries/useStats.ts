import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/services/api/stats';

export const useStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: statsApi.getDashboardStats,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  return {
    stats,
    isLoading,
    error,
  };
};
