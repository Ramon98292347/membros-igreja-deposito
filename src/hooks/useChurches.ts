import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Church } from '@/types/church';
import { ChurchFormData } from '@/schemas/churchSchema';
import { useToast } from '@/hooks/use-toast';

// Simulação de API - substitua pelas chamadas reais
const churchesApi = {
  getAll: async (): Promise<Church[]> => {
    // Aqui você integraria com sua API real
    const stored = localStorage.getItem('churches');
    return stored ? JSON.parse(stored) : [];
  },
  
  getById: async (id: string): Promise<Church | null> => {
    const churches = await churchesApi.getAll();
    return churches.find(c => c.id === id) || null;
  },
  
  create: async (data: ChurchFormData): Promise<Church> => {
    const churches = await churchesApi.getAll();
    const newChurch: Church = {
      ...data,
      id: Date.now().toString(),
      dataRegistro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };
    const updatedChurches = [...churches, newChurch];
    localStorage.setItem('churches', JSON.stringify(updatedChurches));
    return newChurch;
  },
  
  update: async (id: string, data: Partial<ChurchFormData>): Promise<Church> => {
    const churches = await churchesApi.getAll();
    const index = churches.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Igreja não encontrada');
    
    const updatedChurch = {
      ...churches[index],
      ...data,
      dataAtualizacao: new Date().toISOString(),
    };
    churches[index] = updatedChurch;
    localStorage.setItem('churches', JSON.stringify(churches));
    return updatedChurch;
  },
  
  delete: async (id: string): Promise<void> => {
    const churches = await churchesApi.getAll();
    const filteredChurches = churches.filter(c => c.id !== id);
    localStorage.setItem('churches', JSON.stringify(filteredChurches));
  },
};

// Hook para buscar todas as igrejas
export const useChurches = () => {
  return useQuery({
    queryKey: ['churches'],
    queryFn: churchesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar uma igreja específica
export const useChurch = (id: string) => {
  return useQuery({
    queryKey: ['churches', id],
    queryFn: () => churchesApi.getById(id),
    enabled: !!id,
  });
};

// Hook para criar igreja
export const useCreateChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: churchesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churches'] });
      toast({
        title: 'Sucesso',
        description: 'Igreja criada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar igreja: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar igreja
export const useUpdateChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ChurchFormData> }) =>
      churchesApi.update(id, data),
    onSuccess: (updatedChurch) => {
      queryClient.invalidateQueries({ queryKey: ['churches'] });
      queryClient.setQueryData(['churches', updatedChurch.id], updatedChurch);
      toast({
        title: 'Sucesso',
        description: 'Igreja atualizada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar igreja: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar igreja
export const useDeleteChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: churchesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churches'] });
      toast({
        title: 'Sucesso',
        description: 'Igreja removida com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover igreja: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};