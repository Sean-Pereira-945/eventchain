import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAPIError } from '../utils/errorHandling';

export const useApiQuery = (key, queryFn, options = {}) =>
  useQuery({
    queryKey: key,
    queryFn,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    ...options
  });

export const useApiMutation = (mutationFn, { onSuccess, onError, ...config } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (data, variables, context) => {
      if (onSuccess) await onSuccess(data, variables, context, queryClient);
    },
    onError: (error, variables, context) => {
      const message = parseAPIError(error);
      if (onError) onError(message, variables, context);
    },
    ...config
  });
};
