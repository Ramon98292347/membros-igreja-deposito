
export interface Church {
  id: string;
  classificacao?: string; // Flexível para aceitar qualquer classificação do CSV
  nomeIPDA: string;
  tipoIPDA?: 'Sede' | 'Congregação' | 'Ponto de Pregação';
  endereco?: {
    logradouro?: string;
    rua?: string; // Compatibilidade com estrutura antiga
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  pastor?: {
    nome?: string; // Campo principal para nome do pastor
    nomeCompleto?: string; // Compatibilidade com estrutura antiga
    cpf?: string;
    telefone?: string;
    email?: string;
    dataNascimento?: string;
    dataBatismo?: string;
    estadoCivil?: 'Solteiro' | 'Casado' | 'Viúvo' | 'Divorciado';
    funcaoMinisterial?: string;
    possuiCFO?: boolean;
    dataConclusaoCFO?: string;
    dataAssumiu?: string;
    endereco?: {
      logradouro?: string;
      rua?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
    };
  } | string; // Permite string para compatibilidade com dados simples
  membrosIniciais?: number;
  membrosAtuais?: number; // Compatibilidade com estrutura antiga
  quantidadeMembros?: number; // Campo principal para quantidade de membros
  almasBatizadas?: number;
  temEscola?: boolean;
  quantidadeCriancas?: number;
  diasFuncionamento?: string[];
  foto?: string;
  dataCadastro: string;
  dataAtualizacao: string;
  
  // Campos adicionais para compatibilidade com dados existentes
  nome?: string; // Compatibilidade com nome simples
  telefone?: string; // Telefone direto da igreja
  email?: string; // Email direto da igreja
}

export interface ChurchConfig {
  nomeIgreja: string;
  endereco: string;
  telefone: string;
  email: string;
}
