import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Member } from '../types/member';
import { Church } from '../types/church';

// Configuração do Supabase
const supabaseUrl = 'https://hwstbxvalwbrqarbdzep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3c3RieHZhbHdicnFhcmJkemVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMjU3MTIsImV4cCI6MjA2NjkwMTcxMn0.PMSVztn6ve2hstK4nwLOCKGcdJFaxYfEZNfb3hm8Ev8';

// Inicialização do cliente Supabase com opções de autenticação
let supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

class SupabaseService {
  // Método para inicializar o cliente Supabase com novas credenciais
  initializeClient(url: string, key: string): SupabaseClient {
    try {
      console.log('Inicializando cliente Supabase com:', { url });
      
      if (!url || !key) {
        console.error('URL ou chave do Supabase não fornecidos');
        throw new Error('URL e chave do Supabase são obrigatórios');
      }
      
      // Cria um novo cliente com as credenciais fornecidas
      const newClient = createClient(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      });
      
      // Atualiza o cliente global
      if (url === supabaseUrl && key === supabaseKey) {
        console.log('Atualizando cliente Supabase global');
        supabase = newClient;
      } else {
        console.log('Criando cliente Supabase temporário para teste');
      }
      
      console.log('Cliente Supabase inicializado com sucesso');
      return newClient;
    } catch (error) {
      console.error('Erro ao inicializar cliente Supabase:', error);
      throw error;
    }
  }
  // Métodos para Membros
  async readMembers(): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('membros')
        .select('*')
        .order('nomeCompleto', { ascending: true });

      if (error) {
        console.error('Erro ao buscar membros:', error);
        throw new Error(`Erro ao buscar membros: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      throw error;
    }
  }

  async writeMember(member: Omit<Member, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<Member> {
    try {
      const newMember = {
        ...member,
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('membros')
        .insert([newMember])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar membro:', error);
        throw new Error(`Erro ao adicionar membro: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      throw error;
    }
  }

  async updateMember(id: string, member: Partial<Member>): Promise<Member> {
    try {
      const updates = {
        ...member,
        dataAtualizacao: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('membros')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar membro:', error);
        throw new Error(`Erro ao atualizar membro: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      throw error;
    }
  }

  async deleteMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('membros')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir membro:', error);
        throw new Error(`Erro ao excluir membro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      throw error;
    }
  }

  async writeMembers(members: Member[]): Promise<void> {
    try {
      // Processar em lotes para evitar limitações de tamanho da API
      const batchSize = 50;
      for (let i = 0; i < members.length; i += batchSize) {
        const batch = members.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('membros')
          .insert(batch);

        if (error) {
          console.error('Erro ao adicionar membros em lote:', error);
          throw new Error(`Erro ao adicionar membros em lote: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar membros:', error);
      throw error;
    }
  }
  
  async clearMembers(): Promise<void> {
    try {
      const { error } = await supabase
        .from('membros')
        .delete()
        .neq('id', '0'); // Deleta todos os registros

      if (error) {
        console.error('Erro ao limpar tabela de membros:', error);
        throw new Error(`Erro ao limpar tabela de membros: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao limpar tabela de membros:', error);
      throw error;
    }
  }
  
  async importMembers(members: Member[]): Promise<void> {
    try {
      // Primeiro limpa a tabela
      await this.clearMembers();
      
      // Depois importa os novos membros
      await this.writeMembers(members);
    } catch (error) {
      console.error('Erro ao importar membros:', error);
      throw error;
    }
  }
  
  async getMembers(): Promise<Member[]> {
    return this.readMembers();
  }

  // Métodos para Igrejas
  async readChurches(): Promise<Church[]> {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .order('nomeIPDA', { ascending: true });

      if (error) {
        console.error('Erro ao buscar igrejas:', error);
        throw new Error(`Erro ao buscar igrejas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar igrejas:', error);
      throw error;
    }
  }

  async writeChurch(church: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<Church> {
    try {
      const newChurch = {
        ...church,
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('churches')
        .insert([newChurch])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar igreja:', error);
        throw new Error(`Erro ao adicionar igreja: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao adicionar igreja:', error);
      throw error;
    }
  }

  async updateChurch(id: string, church: Partial<Church>): Promise<Church> {
    try {
      const updates = {
        ...church,
        dataAtualizacao: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('churches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar igreja:', error);
        throw new Error(`Erro ao atualizar igreja: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar igreja:', error);
      throw error;
    }
  }

  async deleteChurch(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('churches')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir igreja:', error);
        throw new Error(`Erro ao excluir igreja: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir igreja:', error);
      throw error;
    }
  }

  async clearChurches(): Promise<void> {
    try {
      const { error } = await supabase
        .from('churches')
        .delete()
        .neq('id', '0'); // Deleta todos os registros

      if (error) {
        console.error('Erro ao limpar tabela de igrejas:', error);
        throw new Error(`Erro ao limpar tabela de igrejas: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao limpar tabela de igrejas:', error);
      throw error;
    }
  }
  
  async writeChurches(churches: Omit<Church, 'id'>[]): Promise<Church[]> {
    try {
      const batchSize = 50;
      const results: Church[] = [];
      
      for (let i = 0; i < churches.length; i += batchSize) {
        const batch = churches.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('churches')
          .insert(batch)
          .select();

        if (error) {
          console.error('Erro ao adicionar igrejas em lote:', error);
          throw new Error(`Erro ao adicionar igrejas em lote: ${error.message}`);
        }

        if (data) {
          results.push(...data);
        }
      }

      return results;
    } catch (error) {
      console.error('Erro ao adicionar igrejas:', error);
      throw error;
    }
  }

  // Métodos de autenticação
  async signIn(email: string, password: string) {
    try {
      console.log('Tentando fazer login com:', { email });
      
      // Verificar se as credenciais estão definidas
      if (!email || !password) {
        console.error('Credenciais incompletas');
        throw new Error('Email e senha são obrigatórios');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro ao fazer login:', error);
        // Log detalhado do erro
        console.log('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          status: error.status,
          details: error.details
        });
        throw new Error(`Erro ao fazer login: ${error.message}`);
      }

      console.log('Login bem-sucedido:', { user: data.user?.id });
      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      console.log('Iniciando processo de logout...');
      
      // Verificar se há um usuário logado antes de fazer logout
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log('Nenhum usuário logado para fazer logout');
        return;
      }
      
      console.log('Fazendo logout do usuário:', userData.user.email);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error);
        console.log('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          status: error.status
        });
        throw new Error(`Erro ao fazer logout: ${error.message}`);
      }
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      console.log('Verificando usuário atual...');
      
      // Verificar se há uma sessão ativa
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Sessão atual:', sessionData.session ? 'Ativa' : 'Inativa');
      
      // Obter dados do usuário
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Erro ao obter usuário atual:', error);
        console.log('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          status: error.status
        });
        throw new Error(`Erro ao obter usuário atual: ${error.message}`);
      }

      if (data.user) {
        console.log('Usuário autenticado:', {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role
        });
      } else {
        console.log('Nenhum usuário autenticado');
      }

      return data.user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      throw error;
    }
  }

  // Método para registrar um novo usuário
  async signUp(email: string, password: string, userData?: { name?: string }) {
    try {
      console.log('Tentando registrar novo usuário:', { email });
      
      if (!email || !password) {
        console.error('Email e senha são obrigatórios para registro');
        throw new Error('Email e senha são obrigatórios');
      }
      
      // Registrar o usuário no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData?.name || 'Usuário',
          },
        },
      });

      if (error) {
        console.error('Erro ao registrar usuário:', error);
        console.log('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          status: error.status,
          details: error.details
        });
        throw new Error(`Erro ao registrar usuário: ${error.message}`);
      }

      console.log('Usuário registrado com sucesso:', {
        id: data.user?.id,
        email: data.user?.email
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }
}

// Exportar uma instância do serviço
export const supabaseService = new SupabaseService();