
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

// Dados de exemplo mantidos para compatibilidade
const sampleMembers: Member[] = [
  {
    id: '1',
    nomeCompleto: 'João Silva Santos',
    endereco: 'Rua das Flores',
    numeroCasa: '123',
    bairro: 'Centro',
    cidade: 'Vitória',
    estado: 'ES',
    cep: '29000-000',
    rg: '12345678',
    cpf: '123.456.789-00',
    dataNascimento: '1985-03-15',
    cidadeNascimento: 'Vitória',
    estadoCidadeNascimento: 'ES',
    estadoCivil: 'Casado(a)',
    email: 'joao@email.com',
    profissao: 'Engenheiro',
    idade: 39,
    telefone: '(27) 99999-1234',
    dataBatismo: '2010-05-20',
    dataOrdenacao: '2015-08-10',
    igrejaBatismo: 'IPDA Vitória',
    funcaoMinisterial: 'Presbítero',
    ativo: true,
    dataCadastro: '2024-01-15',
    dataAtualizacao: '2024-01-15',
    observacoes: '',
    foto: '',
    linkFicha: '',
    dadosCarteirinha: ''
  },
  {
    id: '2',
    nomeCompleto: 'Maria Oliveira Costa',
    endereco: 'Avenida Central',
    numeroCasa: '456',
    bairro: 'Jardim da Penha',
    cidade: 'Vitória',
    estado: 'ES',
    cep: '29060-000',
    rg: '87654321',
    cpf: '987.654.321-00',
    dataNascimento: '1990-07-22',
    cidadeNascimento: 'Serra',
    estadoCidadeNascimento: 'ES',
    estadoCivil: 'Solteiro(a)',
    email: 'maria@email.com',
    profissao: 'Professora',
    idade: 34,
    telefone: '(27) 98888-5678',
    dataBatismo: '2012-09-15',
    igrejaBatismo: 'IPDA Serra',
    funcaoMinisterial: 'Obreiro',
    ativo: true,
    dataCadastro: '2024-02-10',
    dataAtualizacao: '2024-02-10',
    observacoes: '',
    foto: ''
  },
  {
    id: '3',
    nomeCompleto: 'Pedro Mendes Lima',
    endereco: 'Rua da Paz',
    numeroCasa: '789',
    bairro: 'Praia do Canto',
    cidade: 'Vitória',
    estado: 'ES',
    cep: '29055-000',
    rg: '11223344',
    cpf: '111.222.333-44',
    dataNascimento: '1975-12-08',
    cidadeNascimento: 'Vila Velha',
    estadoCidadeNascimento: 'ES',
    estadoCivil: 'Casado(a)',
    email: 'pedro@email.com',
    profissao: 'Comerciante',
    idade: 49,
    telefone: '(27) 97777-9012',
    dataBatismo: '2008-03-25',
    dataOrdenacao: '2020-10-15',
    igrejaBatismo: 'IPDA Vila Velha',
    funcaoMinisterial: 'Pastor',
    ativo: true,
    dataCadastro: '2024-01-20',
    dataAtualizacao: '2024-01-20',
    observacoes: '',
    foto: ''
  }
];

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [config, setConfig] = useState<ChurchConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar dados do Supabase
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const supabaseMembers = await supabaseService.readMembers();
        if (supabaseMembers && supabaseMembers.length > 0) {
          setMembers(supabaseMembers);
        } else {
          // Usar dados de exemplo na primeira execução se não houver dados no Supabase
          setMembers(sampleMembers);
          // Salvar dados de exemplo no Supabase
          await supabaseService.writeMembers(sampleMembers);
        }
      } catch (error) {
        console.error('Erro ao carregar membros do Supabase:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os membros. Usando dados locais.",
          variant: "destructive"
        });
        
        // Fallback para localStorage em caso de erro
        const storedMembers = localStorage.getItem('church-members');
        if (storedMembers) {
          setMembers(JSON.parse(storedMembers));
        } else {
          setMembers(sampleMembers);
          localStorage.setItem('church-members', JSON.stringify(sampleMembers));
        }
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
      clearMembers
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
