
export interface Member {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  idade: number;
  telefone: string;
  email: string;
  endereco: string;
  numeroCasa: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  rg: string;
  cpf: string;
  cidadeNascimento: string;
  estadoCidadeNascimento: string;
  estadoCivil: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)';
  nomeConjuge?: string;
  dataCasamento?: string;
  funcaoMinisterial: 'Pastor' | 'Presbítero' | 'Diácono' | 'Obreiro' | 'Membro' | 'Missionário' | 'Evangelista' | 'Financeiro(a)' | 'Obreiro/Cooperador(a)';
  dataBatismo: string;
  dataOrdenacao?: string;
  igrejaBatismo: string;
  observacoes?: string;
  foto?: string;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao: string;
  profissao: string;
  linkFicha?: string; // Coluna X - Link da ficha do membro
  dadosCarteirinha?: string; // Coluna Y - Dados da carteirinha
}

export interface ChurchConfig {
  nomeIgreja: string;
  endereco: string;
  telefone: string;
  email: string;
}

export type ReportType = 
  | 'todos-membros'
  | 'membros-por-funcao'
  | 'aniversariantes-mes'
  | 'membros-por-estado-civil'
  | 'membros-batizados-periodo'
  | 'igrejas-por-classificacao'
  | 'estatisticas-deposito'
  | 'movimentacoes-deposito';

export interface ReportFilter {
  tipo: ReportType;
  dataInicio?: string;
  dataFim?: string;
  funcaoMinisterial?: string;
  cidade?: string;
  estado?: string;
}
