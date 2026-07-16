import { useQuery } from '@tanstack/react-query';
import { customersApi, type CustomerProfile } from '@/services/api/customers';

export const useCustomers = () => {
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  });

  return {
    customers,
    isLoading,
    error,
  };
};
