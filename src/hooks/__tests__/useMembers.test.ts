import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '../useMembers';
import { MemberFormData } from '../../types/member';

// Mock do toast
jest.mock('../use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Wrapper para React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  
  return Wrapper;
};

const mockMember: MemberFormData = {
  nome: 'João Silva',
  cpf: '123.456.789-00',
  rg: '12.345.678-9',
  dataNascimento: '1990-01-01',
  telefone: '(11) 99999-9999',
  email: 'joao@email.com',
  endereco: 'Rua das Flores, 123',
  bairro: 'Centro',
  cidade: 'São Paulo',
  cep: '01234-567',
  estadoCivil: 'Solteiro(a)',
  profissao: 'Engenheiro',
  escolaridade: 'Superior Completo',
  batizado: 'Sim',
  dataBatismo: '2010-01-01',
  igreja: 'Igreja Central',
  cargo: 'Diácono',
  observacoes: 'Membro ativo',
  ativo: true
};

describe('useMembers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve retornar lista vazia quando não há membros', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMembers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('deve retornar membros do localStorage', async () => {
    const members = [{ ...mockMember, id: '1', dataRegistro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() }];
    localStorage.setItem('members', JSON.stringify(members));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMembers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].nome).toBe('João Silva');
  });
});

describe('useCreateMember', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve criar um novo membro', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateMember(), { wrapper });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    });

    result.current.mutate(mockMember);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const storedMembers = JSON.parse(localStorage.getItem('members') || '[]');
    expect(storedMembers).toHaveLength(1);
    expect(storedMembers[0].nome).toBe('João Silva');
    expect(storedMembers[0].id).toBeDefined();
  });
});

describe('useUpdateMember', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve atualizar um membro existente', async () => {
    const existingMember = {
      ...mockMember,
      id: '1',
      dataRegistro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    localStorage.setItem('members', JSON.stringify([existingMember]));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateMember(), { wrapper });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    });

    const updatedData = { ...mockMember, nome: 'João Silva Atualizado' };
    result.current.mutate({ id: '1', data: updatedData });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const storedMembers = JSON.parse(localStorage.getItem('members') || '[]');
    expect(storedMembers).toHaveLength(1);
    expect(storedMembers[0].nome).toBe('João Silva Atualizado');
  });

  it('deve lançar erro ao tentar atualizar membro inexistente', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateMember(), { wrapper });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    });

    result.current.mutate({ id: 'inexistente', data: mockMember });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('Membro não encontrado'));
  });
});

describe('useDeleteMember', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve deletar um membro existente', async () => {
    const existingMember = {
      ...mockMember,
      id: '1',
      dataRegistro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    localStorage.setItem('members', JSON.stringify([existingMember]));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteMember(), { wrapper });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    });

    result.current.mutate('1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const storedMembers = JSON.parse(localStorage.getItem('members') || '[]');
    expect(storedMembers).toHaveLength(0);
  });

  it('deve lançar erro ao tentar deletar membro inexistente', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteMember(), { wrapper });

    await waitFor(() => {
      expect(result.current.mutate).toBeDefined();
    });

    result.current.mutate('inexistente');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('Membro não encontrado'));
  });
});