import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SupabaseError, withRetry } from '@/utils/errorHandling';

interface UseSupabaseOperationOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  retries?: number;
}

interface UseSupabaseOperationResult<T> {
  data: T | null;
  loading: boolean;
  error: SupabaseError | null;
  execute: (operation: () => Promise<T>, options?: UseSupabaseOperationOptions) => Promise<T | null>;
  reset: () => void;
}

export function useSupabaseOperation<T = any>(): UseSupabaseOperationResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SupabaseError | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options: UseSupabaseOperationOptions = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operação realizada com sucesso!',
      retries = 3
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(operation, retries);
      setData(result);

      if (showSuccessToast) {
        toast({
          title: "Sucesso",
          description: successMessage,
        });
      }

      return result;
    } catch (err) {
      const supabaseError = err instanceof SupabaseError 
        ? err 
        : new SupabaseError('Erro desconhecido', undefined, err);
      
      setError(supabaseError);

      if (showErrorToast) {
        toast({
          title: "Erro",
          description: supabaseError.message,
          variant: "destructive",
        });
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

// Hook específico para operações de CRUD
export function useSupabaseCRUD<T = any>(entityName: string) {
  const operation = useSupabaseOperation<T>();

  const create = useCallback((createFn: () => Promise<T>) => 
    operation.execute(createFn, {
      showSuccessToast: true,
      successMessage: `${entityName} criado com sucesso!`
    }), [operation, entityName]);

  const update = useCallback((updateFn: () => Promise<T>) => 
    operation.execute(updateFn, {
      showSuccessToast: true,
      successMessage: `${entityName} atualizado com sucesso!`
    }), [operation, entityName]);

  const remove = useCallback((deleteFn: () => Promise<T>) => 
    operation.execute(deleteFn, {
      showSuccessToast: true,
      successMessage: `${entityName} removido com sucesso!`
    }), [operation, entityName]);

  const read = useCallback((readFn: () => Promise<T>) => 
    operation.execute(readFn, {
      showErrorToast: true,
      showSuccessToast: false
    }), [operation]);

  return {
    ...operation,
    create,
    update,
    remove,
    read
  };
}