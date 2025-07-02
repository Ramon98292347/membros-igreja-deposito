// Configurações das planilhas do Google Sheets
export const SHEETS_CONFIG = {
  // Planilha principal de membros
  MEMBERS_SHEET: {
    id: '1kBJxwPR0kEU_9MScxXpniU9HDYJVUgTWlRyIjdlmImI',
    name: 'Cadastro de Membros e Obreiros de Vitória (Respostas)',
    range: 'Dadosmembros!A:Y', // Aba Dadosmembros, colunas A até Y (25 colunas)
    gid: '348632359',
    sheetdb_api: 'https://sheetdb.io/api/v1/xsdauvple358w',
    sheetdb_token: 'j3etulvjwabahhl2p851p6wuzizsssvo3pvhvfjj'
  },
  
  // Planilha de igrejas estaduais
  CHURCHES_SHEET: {
    id: '14s8DnLHWzybD_HDy5QrbwYtmDn9TVyhL3fhx2J6ipAk',
    name: 'Todas as Igrejas Vitoria',
    range: 'Dadosigreja!A:V', // Aba Dadosigreja, colunas A até V (22 colunas)
    gid: '0',
    sheetdb_api: 'https://sheetdb.io/api/v1/0tl0k092c4611',
    sheetdb_token: '2culvwofs09z56jj9dsnbh8etnw81iorgjqdymsq'
  }
};

// Mapeamento das colunas da planilha de membros
export const MEMBERS_COLUMNS = {
  ID: 0,
  TIMESTAMP: 1,
  NOME_COMPLETO: 2,
  IMAGEM: 3,
  EMAIL: 4,
  ENDERECO: 5,
  BAIRRO: 6,
  NUMERO_CASA: 7,
  CIDADE: 8,
  ESTADO: 9,
  CEP: 10,
  CPF: 11,
  RG: 12,
  CIDADE_NASCIMENTO: 13,
  ESTADO_CIDADE_NASCIMENTO: 14,
  DATA_NASCIMENTO: 15,
  IDADE: 16,
  ESTADO_CIVIL: 17,
  TELEFONE: 18,
  PROFISSAO: 19,
  TEM_FILHO: 20,
  DATA_BATISMO: 21,
  FUNCAO_MINISTERIAL: 22,
  LINK_FICHA: 23, // Coluna X - Links das fichas
  DADOS_CARTEIRINHA: 24 // Coluna Y - Dados das carteirinhas
};

// Mapeamento das colunas da planilha de igrejas
export const CHURCHES_COLUMNS = {
  TOTVS: 0,
  CLASSIFICACAO: 1,
  FOTO_IGREJA: 2,
  NOME_IPDA: 3,
  NOME_PASTOR: 4,
  TELEFONE: 5,
  ENDERECO: 6,
  TIPO_IPDA: 7,
  DATA_NASCIMENTO: 8,
  EMAIL: 9,
  DATA_BATISMO: 10,
  ESTADO_CIVIL: 11,
  FUNCAO_MINISTERIAL: 12,
  POSSUI_CFO: 13,
  DATA_CONCLUSAO: 14,
  DATA_ASSUMIU_IPDA: 15,
  QTD_MEMBROS_INICIAL: 16,
  QTD_MEMBROS_ATUAL: 17,
  QTD_ALMAS_BATIZADAS: 18,
  TEM_ESCOLA_GALILEU: 19,
  QTD_CRIANCAS_ESCOLA: 20,
  DIAS_FUNCIONAMENTO: 21
};