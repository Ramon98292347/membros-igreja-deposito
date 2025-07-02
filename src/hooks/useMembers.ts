import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Member } from '@/types/member';
import { MemberFormData } from '@/schemas/memberSchema';
import { useToast } from '@/hooks/use-toast';

// Simulação de API - substitua pelas chamadas reais
const membersApi = {
  getAll: async (): Promise<Member[]> => {
    // Aqui você integraria com sua API real
    const stored = localStorage.getItem('members');
    return stored ? JSON.parse(stored) : [];
  },
  
  getById: async (id: string): Promise<Member | null> => {
    const members = await membersApi.getAll();
    return members.find(m => m.id === id) || null;
  },
  
  create: async (data: MemberFormData): Promise<Member> => {
    const members = await membersApi.getAll();
    const newMember: Member = {
      ...data,
      id: Date.now().toString(),
      dataRegistro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };
    const updatedMembers = [...members, newMember];
    localStorage.setItem('members', JSON.stringify(updatedMembers));
    return newMember;
  },
  
  update: async (id: string, data: Partial<MemberFormData>): Promise<Member> => {
    const members = await membersApi.getAll();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Membro não encontrado');
    
    const updatedMember = {
      ...members[index],
      ...data,
      dataAtualizacao: new Date().toISOString(),
    };
    members[index] = updatedMember;
    localStorage.setItem('members', JSON.stringify(members));
    return updatedMember;
  },
  
  delete: async (id: string): Promise<void> => {
    const members = await membersApi.getAll();
    const filteredMembers = members.filter(m => m.id !== id);
    localStorage.setItem('members', JSON.stringify(filteredMembers));
  },
};

// Hook para buscar todos os membros
export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar um membro específico
export const useMember = (id: string) => {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => membersApi.getById(id),
    enabled: !!id,
  });
};

// Hook para criar membro
export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: membersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Sucesso',
        description: 'Membro criado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar membro: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar membro
export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MemberFormData> }) =>
      membersApi.update(id, data),
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.setQueryData(['members', updatedMember.id], updatedMember);
      toast({
        title: 'Sucesso',
        description: 'Membro atualizado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar membro: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar membro
export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: membersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({
        title: 'Sucesso',
        description: 'Membro removido com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover membro: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};