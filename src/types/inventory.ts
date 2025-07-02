export interface InventoryItem {
  id: string;
  nomeItem: string;
  tipoMercadoria: 'Manuais Bíblicos - Aluno' | 'Manuais Bíblicos - Professor' | 'Bíblias' | 'Hinários/Livretos' | 'Revistas' | 'Vestuário' | 'Acessórios' | 'CDs Cantados' | 'CDs Oração' | 'CDs Instrumental' | 'CDs Espanhol' | 'CDs Playbacks' | 'Votos' | 'Outros';
  codigo: string;
  descricao: string;
  unidadeMedida: 'Unidade' | 'Caixa' | 'Pacote' | 'Dúzia';
  valorUnitario: number;
  quantidadeEstoque: number;
  estoqueMinimo?: number;
  dataCadastro: string;
  dataAtualizacao: string;
}

export interface Movement {
  id: string;
  itemId: string;
  nomeItem: string;
  tipoMovimentacao: 'entrada' | 'saida' | 'transferencia';
  quantidade: number;
  dataMovimentacao: string;
  origem?: string; // Para entradas
  destino?: string; // Para saídas
  igrejaOrigemId?: string; // Para transferências
  igrejaDestinoId?: string; // Para transferências
  nomeIgrejaOrigem?: string;
  nomeIgrejaDestino?: string;
  responsavel: string;
  observacoes?: string;
  valorUnitario: number;
  valorTotal: number;
  usuarioResponsavel: string;
}

export interface Transfer {
  id: string;
  itemId: string;
  nomeItem: string;
  quantidade: number;
  igrejaOrigemId: string;
  igrejaDestinoId: string;
  nomeIgrejaOrigem: string;
  nomeIgrejaDestino: string;
  dataTransferencia: string;
  responsavelTransferencia: string;
  observacoes?: string;
  status: 'pendente' | 'enviado' | 'recebido' | 'cancelado';
  valorUnitario: number;
  valorTotal: number;
}
