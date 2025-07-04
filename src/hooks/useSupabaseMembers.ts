import { useState, useCallback, useEffect } from 'react';
import { Member } from '@/types/member';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';
import { useMemberContext } from '@/context/MemberContext';

// Interface não é mais necessária para Supabase

export function useSupabaseMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { importFromSheets, clearMembers } = useMemberContext();
  
  // Carregar membros ao inicializar o hook
  useEffect(() => {
    fetchMembers();
  }, []);

  // Função para buscar membros do Supabase
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supabaseService.readMembers();
      setMembers(data);
      
      // Salvar no localStorage como backup
      localStorage.setItem('members', JSON.stringify(data));
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar membros';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao buscar membros do Supabase",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para importar membros do contexto para o Supabase
  const importToSupabase = useCallback(async (membersToImport: Member[]) => {
    setIsLoading(true);
    setError(null);
    try {
      // Limpar membros existentes no contexto
      clearMembers();
      
      // Adicionar cada membro ao Supabase
      const promises = membersToImport.map(member => {
        const { id, dataCadastro, dataAtualizacao, ...memberData } = member;
        return supabaseService.writeMember(memberData);
      });
      
      await Promise.all(promises);
      
      // Recarregar membros
      await fetchMembers();
      
      toast({
        title: "Sucesso",
        description: `${membersToImport.length} membros importados com sucesso`,
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar membros';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao importar membros para o Supabase",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearMembers, fetchMembers]);

  // Função para pesquisar membros
  const searchMembers = useCallback((query: string): Member[] => {
    if (!query.trim()) {
      return members;
    }

    const searchTerm = query.toLowerCase();
    return members.filter(member => 
      member.nomeCompleto.toLowerCase().includes(searchTerm) ||
      member.cidade.toLowerCase().includes(searchTerm) ||
      member.telefone.includes(searchTerm) ||
      member.funcaoMinisterial.toLowerCase().includes(searchTerm)
    );
  }, [members]);

  // Função para adicionar membro
  const addMember = useCallback(async (formData: any) => {
    setIsLoading(true);
    try {
      // Converter dados do formulário para o formato Member
      const memberData = {
        nomeCompleto: formData.nomeCompleto || '',
        dataNascimento: formData.dataNascimento || '',
        idade: formData.idade || 0,
        telefone: formData.telefone || '',
        email: formData.email || '',
        endereco: formData.endereco || '',
        numeroCasa: formData.numeroCasa || '',
        bairro: formData.bairro || '',
        cidade: formData.cidade || '',
        estado: formData.estado || '',
        cep: formData.cep || '',
        rg: formData.rg || '',
        cpf: formData.cpf || '',
        cidadeNascimento: formData.cidadeNascimento || '',
        estadoCidadeNascimento: formData.estadoCidadeNascimento || '',
        estadoCivil: formData.estadoCivil || 'Solteiro(a)',
        funcaoMinisterial: formData.funcaoMinisterial || 'Membro',
        dataBatismo: formData.dataBatismo || '',
        igrejaBatismo: formData.igreja || '',
        observacoes: formData.observacoes || '',
        foto: formData.imagemLink || '', // Converter imagemLink para foto
        ativo: formData.ativo ?? true,
        profissao: formData.profissao || ''
      };
      
      const newMember = await supabaseService.writeMember(memberData);
      setMembers(prev => [...prev, newMember]);
      toast({
        title: "Sucesso",
        description: "Membro adicionado com sucesso",
      });
      return newMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar membro';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para atualizar membro
  const updateMember = useCallback(async (id: string, formData: any) => {
    setIsLoading(true);
    try {
      // Converter dados do formulário para o formato Member
      const memberUpdates = {
        nomeCompleto: formData.nomeCompleto,
        dataNascimento: formData.dataNascimento,
        idade: formData.idade,
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
        numeroCasa: formData.numeroCasa,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        rg: formData.rg,
        cpf: formData.cpf,
        cidadeNascimento: formData.cidadeNascimento,
        estadoCidadeNascimento: formData.estadoCidadeNascimento,
        estadoCivil: formData.estadoCivil,
        funcaoMinisterial: formData.funcaoMinisterial,
        dataBatismo: formData.dataBatismo,
        igrejaBatismo: formData.igreja || '',
        observacoes: formData.observacoes,
        foto: formData.imagemLink, // Converter imagemLink para foto
        ativo: formData.ativo,
        profissao: formData.profissao
      };
      
      const updatedMember = await supabaseService.updateMember(id, memberUpdates);
      setMembers(prev => prev.map(member => 
        member.id === id ? updatedMember : member
      ));
      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso",
      });
      return updatedMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar membro';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao atualizar membro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para deletar membro
  const deleteMember = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await supabaseService.deleteMember(id);
      setMembers(prev => prev.filter(member => member.id !== id));
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso",
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover membro';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao remover membro",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    members,
    isLoading,
    error,
    fetchMembers,
    importToSupabase,
    searchMembers,
    addMember,
    updateMember,
    deleteMember,
  };
}