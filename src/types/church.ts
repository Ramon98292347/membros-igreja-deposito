
export interface Church {
  id: string;
  classificacao: 'Estadual' | 'Setorial' | 'Central' | 'Regional' | 'Local';
  nomeIPDA: string;
  tipoIPDA: 'Sede' | 'Congregação' | 'Ponto de Pregação';
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  pastor: {
    nomeCompleto: string;
    cpf?: string;
    telefone: string;
    email: string;
    dataNascimento: string;
    dataBatismo: string;
    estadoCivil: 'Solteiro' | 'Casado' | 'Viúvo' | 'Divorciado';
    funcaoMinisterial: string;
    possuiCFO: boolean;
    dataConclusaoCFO?: string;
    dataAssumiu: string;
    endereco?: {
      rua: string;
      numero: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    };
  };
  membrosIniciais: number;
  membrosAtuais: number;
  almasBatizadas: number;
  temEscola: boolean;
  quantidadeCriancas?: number;
  diasFuncionamento?: string[];
  foto?: string;
  dataCadastro: string;
  dataAtualizacao: string;
}

export interface ChurchConfig {
  nomeIgreja: string;
  endereco: string;
  telefone: string;
  email: string;
}
