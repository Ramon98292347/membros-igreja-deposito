
import React, { createContext, useContext, useState, useEffect } from 'react';

// Importar tipo Member do arquivo de tipos
import { Member } from '../types/member';

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

  useEffect(() => {
    // Carregar dados do localStorage para compatibilidade
    const storedMembers = localStorage.getItem('church-members');
    const storedConfig = localStorage.getItem('church-config');
    
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    } else {
      // Usar dados de exemplo na primeira execução
      setMembers(sampleMembers);
      localStorage.setItem('church-members', JSON.stringify(sampleMembers));
    }
    
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }
  }, []);

  const saveMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    localStorage.setItem('church-members', JSON.stringify(newMembers));
  };

  const addMember = (memberData: Omit<Member, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => {
    const newMember: Member = {
      ...memberData,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    
    const newMembers = [...members, newMember];
    saveMembers(newMembers);
  };

  const updateMember = (id: string, memberData: Partial<Member>) => {
    const newMembers = members.map(member => 
      member.id === id 
        ? { ...member, ...memberData, dataAtualizacao: new Date().toISOString() }
        : member
    );
    saveMembers(newMembers);
  };

  const deleteMember = (id: string) => {
    const newMembers = members.filter(member => member.id !== id);
    saveMembers(newMembers);
  };

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

  const importFromSheets = (sheetsMembers: Member[]) => {
    // Gerar novos IDs únicos para os membros importados
    const importedMembers = sheetsMembers.map((member, index) => ({
      ...member,
      id: `imported_${Date.now()}_${index}`,
      dataCadastro: member.dataCadastro || new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    }));
    
    // Substituir completamente os membros pelos dados importados
    saveMembers(importedMembers);
    
    return {
      imported: importedMembers.length,
      duplicates: 0,
      total: importedMembers.length
    };
  };

  const clearMembers = () => {
    setMembers([]);
    localStorage.removeItem('church-members');
  };

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
      {children}
    </MemberContext.Provider>
  );
};
