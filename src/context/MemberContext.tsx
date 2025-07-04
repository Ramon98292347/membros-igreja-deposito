
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Importar tipo Member do arquivo de tipos
import { Member } from '../types/member';
import { supabaseService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

export interface ChurchConfig {
  nomeIgreja: string;
  endereco: string;
  telefone: string;
  email: string;
}

interface MemberContextType {
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;
  searchMembers: (query: string) => Member[];
  config: ChurchConfig;
  updateConfig: (config: ChurchConfig) => void;
  importFromSheets: (sheetsMembers: Member[]) => void;
  clearMembers: () => void;
  refreshMembers: () => Promise<void>;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const useMemberContext = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMemberContext deve ser usado dentro de MemberProvider');
  }
  return context;
};

const defaultConfig: ChurchConfig = {
  nomeIgreja: 'Igreja Pentecostal Deus é Amor',
  endereco: 'Av Santo Antonio N° 366, Caratoira, Vitória ES',
  telefone: '(27) 99999-9999',
  email: 'contato@ipdavitoria.com.br'
};

// Dados carregados exclusivamente do banco de dados Supabase

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [config, setConfig] = useState<ChurchConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar dados automaticamente do Supabase
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        // Tentar carregar dados do Supabase sempre
        const supabaseMembers = await supabaseService.readMembers();
        setMembers(supabaseMembers || []);
        console.log(`Carregados ${supabaseMembers?.length || 0} membros do Supabase`);
      } catch (error) {
        console.error('Erro ao carregar membros do Supabase:', error);
        setMembers([]);
        // Não mostrar toast de erro no carregamento inicial para não incomodar o usuário
        console.log('Supabase pode não estar configurado ou não há dados. Iniciando com lista vazia.');
      } finally {
        setIsLoading(false);
      }
    };

    // Carregar configuração
    const storedConfig = localStorage.getItem('church-config');
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }
    
    fetchMembers();
  }, []);

  const saveMembers = useCallback(async (newMembers: Member[]) => {
    setMembers(newMembers);
    // Salvar no localStorage como backup
    localStorage.setItem('church-members', JSON.stringify(newMembers));
    // Sincronizar com Supabase
    try {
      await supabaseService.writeMembers(newMembers);
    } catch (error) {
      console.error('Erro ao salvar membros no Supabase:', error);
      toast({
        title: "Aviso",
        description: "Os dados foram salvos localmente, mas houve um erro ao sincronizar com o servidor.",
        variant: "destructive"
      });
    }
  }, []);

  const addMember = useCallback(async (memberData: Omit<Member, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => {
    setIsLoading(true);
    try {
      const newMember: Member = {
        ...memberData,
        id: Date.now().toString(),
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };
      
      // Adicionar ao Supabase
      await supabaseService.writeMember(newMember);
      
      // Atualizar estado local
      setMembers(prev => [...prev, newMember]);
      
      // Backup no localStorage
      const updatedMembers = [...members, newMember];
      localStorage.setItem('church-members', JSON.stringify(updatedMembers));
      
      toast({
        title: "Sucesso",
        description: "Membro adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [members]);

  const updateMember = useCallback(async (id: string, memberData: Partial<Member>) => {
    setIsLoading(true);
    try {
      const memberToUpdate = members.find(m => m.id === id);
      if (!memberToUpdate) {
        throw new Error('Membro não encontrado');
      }
      
      const updatedMember = { 
        ...memberToUpdate, 
        ...memberData, 
        dataAtualizacao: new Date().toISOString() 
      };
      
      // Atualizar no Supabase
      await supabaseService.updateMember(updatedMember);
      
      // Atualizar estado local
      const newMembers = members.map(member => 
        member.id === id ? updatedMember : member
      );
      
      setMembers(newMembers);
      
      // Backup no localStorage
      localStorage.setItem('church-members', JSON.stringify(newMembers));
      
      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [members]);

  const deleteMember = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Excluir do Supabase
      await supabaseService.deleteMember(id);
      
      // Atualizar estado local
      const newMembers = members.filter(member => member.id !== id);
      setMembers(newMembers);
      
      // Backup no localStorage
      localStorage.setItem('church-members', JSON.stringify(newMembers));
      
      toast({
        title: "Sucesso",
        description: "Membro excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o membro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [members]);

  const getMemberById = (id: string) => {
    return members.find(member => member.id === id);
  };

  const searchMembers = (query: string) => {
    if (!query.trim()) return members;
    
    const lowercaseQuery = query.toLowerCase();
    return members.filter(member => 
      member.nomeCompleto.toLowerCase().includes(lowercaseQuery) ||
      member.funcaoMinisterial.toLowerCase().includes(lowercaseQuery) ||
      member.cidade.toLowerCase().includes(lowercaseQuery) ||
      member.telefone.includes(query)
    );
  };

  const updateConfig = (newConfig: ChurchConfig) => {
    setConfig(newConfig);
    localStorage.setItem('church-config', JSON.stringify(newConfig));
  };

  const importFromSheets = useCallback(async (sheetsMembers: Member[]) => {
    setIsLoading(true);
    try {
      // Gerar novos IDs únicos para os membros importados
      const importedMembers = sheetsMembers.map((member, index) => ({
        ...member,
        id: `imported_${Date.now()}_${index}`,
        dataCadastro: member.dataCadastro || new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      }));
      
      // Salvar no Supabase
      await supabaseService.writeMembers(importedMembers);
      
      // Atualizar estado local
      setMembers(importedMembers);
      
      // Backup no localStorage
      localStorage.setItem('church-members', JSON.stringify(importedMembers));
      
      toast({
        title: "Importação Concluída",
        description: `${importedMembers.length} membros importados com sucesso.`,
      });
      
      return {
        imported: importedMembers.length,
        duplicates: 0,
        total: importedMembers.length
      };
    } catch (error) {
      console.error('Erro ao importar membros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível importar os membros",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Limpar membros no Supabase (isso depende da implementação do serviço)
      // Uma abordagem é excluir todos os membros um por um
      for (const member of members) {
        await supabaseService.deleteMember(member.id);
      }
      
      // Atualizar estado local
      setMembers([]);
      
      // Remover do localStorage
      localStorage.removeItem('church-members');
      
      toast({
        title: "Sucesso",
        description: "Todos os membros foram removidos",
      });
    } catch (error) {
      console.error('Erro ao limpar membros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover todos os membros",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [members]);

  const refreshMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (supabaseService.isInitialized()) {
        const supabaseMembers = await supabaseService.readMembers();
        setMembers(supabaseMembers || []);
        toast({
          title: "Sucesso",
          description: "Dados atualizados com sucesso",
        });
      } else {
        setMembers([]);
        toast({
          title: "Aviso",
          description: "Configure o Supabase primeiro para carregar os dados",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao recarregar membros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível recarregar os dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <MemberContext.Provider value={{
      members,
      addMember,
      updateMember,
      deleteMember,
      getMemberById,
      searchMembers,
      config,
      updateConfig,
      importFromSheets,
      clearMembers,
      refreshMembers
    }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </MemberContext.Provider>
  );
};
