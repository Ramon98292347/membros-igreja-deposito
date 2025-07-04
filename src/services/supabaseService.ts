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
  // Método para verificar se o Supabase está inicializado
  isInitialized(): boolean {
    try {
      // Verificar se há configuração salva no localStorage
      const savedConfig = localStorage.getItem('supabase-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        return !!(config.supabaseUrl && config.supabaseKey);
      }
      
      // Se não há configuração salva, verificar se está usando as credenciais padrão
      return !!(supabaseUrl && supabaseKey);
    } catch (error) {
      console.error('Erro ao verificar inicialização do Supabase:', error);
      return false;
    }
  }

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
        .order('nome_completo', { ascending: true });

      if (error) {
        console.error('Erro ao buscar membros:', error);
        throw new Error(`Erro ao buscar membros: ${error.message}`);
      }

      return (data || []).map(member => this.mapMemberFromDatabase(member));
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      throw error;
    }
  }

  // Função para mapear campos camelCase para snake_case
  private mapMemberToDatabase(member: any): any {
    const mapped: any = {
      nome_completo: member.nomeCompleto,
      data_nascimento: member.dataNascimento,
      idade: member.idade,
      telefone: member.telefone,
      email: member.email,
      endereco: member.endereco,
      numero_casa: member.numeroCasa,
      bairro: member.bairro,
      cidade: member.cidade,
      estado: member.estado,
      cep: member.cep,
      rg: member.rg,
      cpf: member.cpf,
      cidade_nascimento: member.cidadeNascimento,
      estado_cidade_nascimento: member.estadoCidadeNascimento,
      estado_civil: member.estadoCivil,
      nome_conjuge: member.nomeConjuge,
      data_casamento: member.dataCasamento,
      funcao_ministerial: member.funcaoMinisterial,
      data_batismo: member.dataBatismo,
      data_ordenacao: member.dataOrdenacao,
      igreja_batismo: member.igrejaBatismo,
      observacoes: member.observacoes,
      foto: member.foto,
      ativo: member.ativo,
      data_cadastro: member.dataCadastro,
      data_atualizacao: member.dataAtualizacao,
      profissao: member.profissao,
      link_ficha: member.linkFicha,
      dados_carteirinha: member.dadosCarteirinha,
      church_id: member.church_id
    };
    
    // Só incluir o ID se ele existir (para updates)
    if (member.id) {
      mapped.id = member.id;
    }
    
    return mapped;
  }

  // Função para mapear campos snake_case para camelCase
  private mapMemberFromDatabase(member: any): Member {
    return {
      id: member.id,
      nomeCompleto: member.nome_completo || '',
      dataNascimento: member.data_nascimento || '',
      idade: member.idade || 0,
      telefone: member.telefone || '',
      email: member.email || '',
      endereco: member.endereco || '',
      numeroCasa: member.numero_casa || '',
      bairro: member.bairro || '',
      cidade: member.cidade || '',
      estado: member.estado || '',
      cep: member.cep || '',
      rg: member.rg || '',
      cpf: member.cpf || '',
      cidadeNascimento: member.cidade_nascimento || '',
      estadoCidadeNascimento: member.estado_cidade_nascimento || '',
      estadoCivil: member.estado_civil || 'Solteiro(a)',
      nomeConjuge: member.nome_conjuge || '',
      dataCasamento: member.data_casamento || '',
      funcaoMinisterial: member.funcao_ministerial || 'Membro',
      dataBatismo: member.data_batismo || '',
      dataOrdenacao: member.data_ordenacao || '',
      igrejaBatismo: member.igreja_batismo || '',
      observacoes: member.observacoes || '',
      foto: member.foto || '',
      ativo: member.ativo ?? true,
      dataCadastro: member.data_cadastro || new Date().toISOString(),
      dataAtualizacao: member.data_atualizacao || new Date().toISOString(),
      profissao: member.profissao || '',
      linkFicha: member.link_ficha || '',
      dadosCarteirinha: member.dados_carteirinha || ''
    };
  }

  async writeMember(member: Omit<Member, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<Member> {
    try {
      const memberWithDates = {
        ...member,
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };

      console.log('Dados do membro antes do mapeamento:', memberWithDates);
      const dbMember = this.mapMemberToDatabase(memberWithDates);
      console.log('Dados do membro após mapeamento para DB:', dbMember);

      const { data, error } = await supabase
        .from('membros')
        .insert([dbMember])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar membro:', error);
        throw new Error(`Erro ao adicionar membro: ${error.message}`);
      }

      console.log('Dados retornados do DB:', data);
      const mappedMember = this.mapMemberFromDatabase(data);
      console.log('Dados após mapeamento do DB:', mappedMember);
      return mappedMember;
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      throw error;
    }
  }

  async updateMember(id: string, member: Partial<Member>): Promise<Member> {
    try {
      const memberWithDate = {
        ...member,
        dataAtualizacao: new Date().toISOString()
      };

      console.log('Dados do membro para atualização antes do mapeamento:', memberWithDate);
      const dbUpdates = this.mapMemberToDatabase(memberWithDate);
      console.log('Dados do membro após mapeamento para DB:', dbUpdates);

      const { data, error } = await supabase
        .from('membros')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar membro:', error);
        throw new Error(`Erro ao atualizar membro: ${error.message}`);
      }

      console.log('Dados retornados do DB após atualização:', data);
      const mappedMember = this.mapMemberFromDatabase(data);
      console.log('Dados após mapeamento do DB:', mappedMember);
      return mappedMember;
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
        const dbBatch = batch.map(member => this.mapMemberToDatabase(member));
        
        const { error } = await supabase
          .from('membros')
          .insert(dbBatch);

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

  // Função para mapear campos camelCase para snake_case (igrejas)
  private mapChurchToDatabase(church: any): any {
    const mapped: any = {
      classificacao: church.classificacao || null,
      nomeipda: church.nomeIPDA || null,
      tipoipda: church.tipoIPDA || null,
      endereco: church.endereco || null,
      pastor: church.pastor || null,
      membrosiniciais: church.membrosIniciais || 0,
      membrosatuais: church.membrosAtuais || 0,
      quantidademembros: church.quantidadeMembros || 0,
      almasbatizadas: church.almasBatizadas || 0,
      temescola: church.temEscola || false,
      quantidadecriancas: church.quantidadeCriancas || 0,
      diasfuncionamento: church.diasFuncionamento || null,
      foto: church.foto || null,
      datacadastro: church.dataCadastro || null,
      dataatualizacao: church.dataAtualizacao || null,
      telefone: church.telefone || null,
      email: church.email || null
    };
    
    // Só incluir o ID se ele existir (para updates)
    if (church.id) {
      mapped.id = church.id;
    }
    
    return mapped;
  }

  // Função para mapear campos snake_case para camelCase (igrejas)
  private mapChurchFromDatabase(church: any): Church {
    return {
      id: church.id,
      classificacao: church.classificacao,
      nomeIPDA: church.nomeipda,
      tipoIPDA: church.tipoipda,
      endereco: church.endereco,
      pastor: church.pastor,
      membrosIniciais: church.membrosiniciais,
      membrosAtuais: church.membrosatuais,
      quantidadeMembros: church.quantidademembros,
      almasBatizadas: church.almasbatizadas,
      temEscola: church.temescola,
      quantidadeCriancas: church.quantidadecriancas,
      diasFuncionamento: church.diasfuncionamento,
      foto: church.foto,
      dataCadastro: church.datacadastro,
      dataAtualizacao: church.dataatualizacao,
      nome: church.nome,
      telefone: church.telefone,
      email: church.email
    };
  }

  // Métodos para Igrejas
  async readChurches(): Promise<Church[]> {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .order('nomeipda', { ascending: true });

      if (error) {
        console.error('Erro ao buscar igrejas:', error);
        throw new Error(`Erro ao buscar igrejas: ${error.message}`);
      }

      console.log('Dados brutos do banco:', data);
      const mappedData = (data || []).map(church => {
        console.log('Igreja antes do mapeamento:', church);
        const mapped = this.mapChurchFromDatabase(church);
        console.log('Igreja após mapeamento:', mapped);
        return mapped;
      });
      
      return mappedData;
    } catch (error) {
      console.error('Erro ao buscar igrejas:', error);
      throw error;
    }
  }

  async writeChurch(church: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<Church> {
    try {
      console.log('Dados recebidos para cadastro:', church);
      
      const churchWithDates = {
        ...church,
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };

      const dbChurch = this.mapChurchToDatabase(churchWithDates);
      console.log('Dados mapeados para o banco:', dbChurch);

      const { data, error } = await supabase
        .from('churches')
        .insert([dbChurch])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar igreja:', error);
        throw new Error(`Erro ao adicionar igreja: ${error.message}`);
      }

      return this.mapChurchFromDatabase(data);
    } catch (error) {
      console.error('Erro ao adicionar igreja:', error);
      throw error;
    }
  }

  async updateChurch(id: string, church: Partial<Church>): Promise<Church> {
    try {
      const churchWithDate = {
        ...church,
        dataAtualizacao: new Date().toISOString()
      };

      const dbUpdates = this.mapChurchToDatabase(churchWithDate);

      const { data, error } = await supabase
        .from('churches')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar igreja:', error);
        throw new Error(`Erro ao atualizar igreja: ${error.message}`);
      }

      return this.mapChurchFromDatabase(data);
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
        const dbBatch = batch.map(church => this.mapChurchToDatabase(church));
        const { data, error } = await supabase
          .from('churches')
          .insert(dbBatch)
          .select();

        if (error) {
          console.error('Erro ao adicionar igrejas em lote:', error);
          throw new Error(`Erro ao adicionar igrejas em lote: ${error.message}`);
        }

        if (data) {
          results.push(...data.map(church => this.mapChurchFromDatabase(church)));
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
          // Removed error.details since it's not a valid property on AuthError
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
          // Removed details property since it doesn't exist on AuthError type
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