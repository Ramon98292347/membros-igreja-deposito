import { Member } from '../types/member';
import { SHEETS_CONFIG, MEMBERS_COLUMNS } from '../config/sheetsConfig';

interface SheetConfig {
  spreadsheetId: string;
  range: string;
}

interface Church {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  pastor: string;
  dataCadastro: string;
  dataAtualizacao: string;
}

class GoogleSheetsService {
  private sheetdbApi: string;
  private sheetdbToken: string;
  private churchesSheetdbApi: string;
  private churchesSheetdbToken: string;

  constructor() {
    this.sheetdbApi = SHEETS_CONFIG.MEMBERS_SHEET.sheetdb_api;
    this.sheetdbToken = SHEETS_CONFIG.MEMBERS_SHEET.sheetdb_token;
    this.churchesSheetdbApi = SHEETS_CONFIG.CHURCHES_SHEET.sheetdb_api;
    this.churchesSheetdbToken = SHEETS_CONFIG.CHURCHES_SHEET.sheetdb_token;
  }

  // Verificar se a API do SheetDB está configurada
  private validateSheetDBConfig(): void {
    if (!this.sheetdbApi || !this.sheetdbToken) {
      throw new Error('Configuração do SheetDB não encontrada. Verifique sheetsConfig.ts');
    }
  }

  async readMembers(config?: SheetConfig): Promise<Member[]> {
    try {
      this.validateSheetDBConfig();
      
      const response = await fetch(this.sheetdbApi, {
        headers: {
          'Authorization': `Bearer ${this.sheetdbToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log(`📊 Total de registros retornados pela API: ${data.length}`);
      
      // Filtrar apenas registros válidos (com nome preenchido)
      const validData = data.filter((row: any) => 
        row['Nome Completo:'] && 
        row['Nome Completo:'].trim() !== '' &&
        row['Nome Completo:'].trim() !== 'Nome Completo:' // Remove header se presente
      );
      
      console.log(`✅ Registros válidos após filtro: ${validData.length}`);
      
      // Debug das colunas disponíveis
       if (validData.length > 0) {
         console.log('🔍 Colunas disponíveis na primeira linha:', Object.keys(validData[0]));
         
         // Verificar especificamente a coluna X (links das fichas)
         const possibleLinkColumns = [
           'Merged Doc URL - Cadastro de Membros',
           'Link Ficha',
           'linkFicha',
           'Link da Ficha',
           'URL Ficha',
           'Ficha URL'
         ];
         
         let linkColumnName = '';
         for (const colName of possibleLinkColumns) {
           if (validData[0].hasOwnProperty(colName)) {
             linkColumnName = colName;
             console.log(`✅ Coluna de links das fichas encontrada: '${colName}'`);
             break;
           }
         }
         
         if (!linkColumnName) {
           console.log('❌ Nenhuma coluna de links das fichas encontrada');
         }
         
         // Verificar especificamente a coluna Y (links das carteirinhas)
         const possibleCarteirinhaColumns = [
           'Merged Doc URL - Carteirinha',
           'Link Carteirinha',
           'linkCarteirinha',
           'Link da Carteirinha',
           'URL Carteirinha',
           'Carteirinha URL'
         ];
         
         let carteirinhaColumnName = '';
         for (const colName of possibleCarteirinhaColumns) {
           if (validData[0].hasOwnProperty(colName)) {
             carteirinhaColumnName = colName;
             console.log(`✅ Coluna de links das carteirinhas encontrada: '${colName}'`);
             break;
           }
         }
         
         if (!carteirinhaColumnName) {
           console.log('❌ Nenhuma coluna de links das carteirinhas encontrada');
         }
         
         if (!linkColumnName && !carteirinhaColumnName) {
           console.log('📋 Todas as colunas disponíveis:', Object.keys(validData[0]));
         }
         
         // Debug dos links antes do mapeamento
         const membersWithLinks = validData.filter(row => linkColumnName && row[linkColumnName] && row[linkColumnName].trim() !== '');
         console.log(`🔗 Membros com links de fichas: ${membersWithLinks.length}`);
         
         const membersWithCarteirinhas = validData.filter(row => carteirinhaColumnName && row[carteirinhaColumnName] && row[carteirinhaColumnName].trim() !== '');
         console.log(`🆔 Membros com links de carteirinhas: ${membersWithCarteirinhas.length}`);
         
         if (membersWithLinks.length > 0) {
           console.log('🔗 Exemplos de links de fichas:');
           membersWithLinks.slice(0, 3).forEach((row: any, index: number) => {
             console.log(`${index + 1}. ${row['Nome Completo:']} - ${row[linkColumnName]}`);
           });
         }
         
         if (membersWithCarteirinhas.length > 0) {
           console.log('🆔 Exemplos de links de carteirinhas:');
           membersWithCarteirinhas.slice(0, 3).forEach((row: any, index: number) => {
             console.log(`${index + 1}. ${row['Nome Completo:']} - ${row[carteirinhaColumnName]}`);
           });
         }
       }
       
       // Verificar diferentes possíveis nomes para a coluna de imagem
       const possibleImageColumns = ['foto 1', 'Imagem', 'imagem', 'Foto', 'foto', 'Image'];
       let imageColumnName = '';
       
       for (const colName of possibleImageColumns) {
         if (validData.length > 0 && validData[0].hasOwnProperty(colName)) {
           imageColumnName = colName;
           console.log(`✅ Coluna de imagem encontrada: '${colName}'`);
           break;
         }
       }
       
       if (!imageColumnName) {
         console.log('❌ Nenhuma coluna de imagem encontrada');
       }
       
       // Debug das fotos antes do mapeamento
       const membersWithPhotos = validData.filter(row => imageColumnName && row[imageColumnName] && row[imageColumnName].trim() !== '');
       console.log(`🖼️ Membros com fotos: ${membersWithPhotos.length}`);
       
       if (membersWithPhotos.length > 0) {
         console.log('📸 Exemplos de URLs de fotos:');
         membersWithPhotos.slice(0, 3).forEach((row: any, index: number) => {
           console.log(`${index + 1}. ${row['Nome Completo:']} - ${row[imageColumnName]}`);
         });
       }
      
      // Detectar automaticamente o nome da coluna de links das fichas
       let linkColumnName = '';
       const possibleLinkColumns = [
         'Merged Doc URL - Cadastro de Membros',
         'Link Ficha',
         'linkFicha',
         'Link da Ficha',
         'URL Ficha',
         'Ficha URL'
       ];
       
       for (const colName of possibleLinkColumns) {
         if (validData.length > 0 && validData[0].hasOwnProperty(colName)) {
           linkColumnName = colName;
           break;
         }
       }
       
       // Detectar automaticamente o nome da coluna de links das carteirinhas
       let carteirinhaColumnName = '';
       const possibleCarteirinhaColumns = [
         'Merged Doc URL - Carteirinha',
         'Link Carteirinha',
         'linkCarteirinha',
         'Link da Carteirinha',
         'URL Carteirinha',
         'Carteirinha URL'
       ];
       
       for (const colName of possibleCarteirinhaColumns) {
         if (validData.length > 0 && validData[0].hasOwnProperty(colName)) {
           carteirinhaColumnName = colName;
           break;
         }
       }
      
      // Converter dados do SheetDB para o formato de Member
      const mappedMembers = validData.map((row: any, index: number) => ({
        id: (index + 1).toString(),
        nomeCompleto: row['Nome Completo:'] || '',
        dataNascimento: row['Data de Nascimento:'] || '',
        idade: row['Data de Nascimento:'] ? new Date().getFullYear() - new Date(row['Data de Nascimento:']).getFullYear() : 0,
        telefone: row['Telefone:'] || '',
        email: row['Endereço de email'] || '',
        endereco: row['Endereço:'] || '',
        numeroCasa: row['Número da casa:'] || '',
        bairro: row['Bairro:'] || '',
        cidade: row['Cidade:'] || '',
        estado: row['Estado:'] || '',
        cep: row['CEP:'] || '',
        rg: row['RG:'] || '',
        cpf: row['CPF:'] || '',
        cidadeNascimento: row['Cidade de Nascimento:'] || '',
        estadoCidadeNascimento: row['Estado de Nascimento:'] || '',
        estadoCivil: row['Estado Civil:'] || 'Solteiro(a)',
        nomeConjuge: row['Nome do Cônjuge:'] || '',
        dataCasamento: row['Data de Casamento:'] || '',
        funcaoMinisterial: row['Função Ministerial'] || 'Membro',
        dataBatismo: row['Data de Batismo'] || '',
        dataOrdenacao: row['Data de Ordenação:'] || '',
        igrejaBatismo: row['Igreja de Batismo:'] || '',
        observacoes: row['Tem Filho:'] || '',
        foto: imageColumnName ? (row[imageColumnName] || '') : '',
        ativo: true,
        dataCadastro: row['Carimbo de data/hora'] || new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        profissao: row['Profissão:'] || '',
        linkFicha: linkColumnName ? (row[linkColumnName] || '') : '',
        dadosCarteirinha: carteirinhaColumnName ? (row[carteirinhaColumnName] || '') : '',
      }));
      
      console.log(`✅ Membros processados e retornados: ${mappedMembers.length}`);
       return mappedMembers;
    } catch (error) {
      console.error('Erro ao ler dados do SheetDB:', error);
      throw new Error('Falha ao carregar dados do SheetDB');
    }
  }

  async writeMembers(members: Member[], config?: SheetConfig): Promise<void> {
    try {
      this.validateSheetDBConfig();
      
      // Detectar o nome correto da coluna de links (usar o padrão se não conseguir detectar)
      const linkColumnName = 'Merged Doc URL - Cadastro de Membros';
      const carteirinhaColumnName = 'Merged Doc URL - Carteirinha';
      
      // Converter membros para o formato do SheetDB
      const data = members.map(member => {
        const memberData: any = {
          'Nome Completo:': member.nomeCompleto,
          'Endereço de email': member.email,
          'Telefone:': member.telefone,
          'Endereço:': member.endereco,
          'Número da casa:': member.numeroCasa,
          'Bairro:': member.bairro,
          'Cidade:': member.cidade,
          'Estado:': member.estado,
          'CEP:': member.cep,
          'Data de Nascimento:': member.dataNascimento,
          'RG:': member.rg,
          'CPF:': member.cpf,
          'Cidade de Nascimento:': member.cidadeNascimento,
          'Estado de Nascimento:': member.estadoCidadeNascimento,
          'Estado Civil:': member.estadoCivil,
          'Nome do Cônjuge:': member.nomeConjuge,
          'Data de Casamento:': member.dataCasamento,
          'Função Ministerial': member.funcaoMinisterial,
          'Data de Batismo': member.dataBatismo,
          'Data de Ordenação:': member.dataOrdenacao,
          'Igreja de Batismo:': member.igrejaBatismo,
          'Profissão:': member.profissao,
          'foto 1': member.foto,
           'Carimbo de data/hora': member.dataCadastro,
           'Tem Filho:': member.observacoes
         };
         
         // Adicionar o link da ficha usando o nome correto da coluna
         memberData[linkColumnName] = member.linkFicha;
         
         // Adicionar o link da carteirinha usando o nome correto da coluna
         memberData[carteirinhaColumnName] = member.dadosCarteirinha;
        
        return memberData;
      });
      
      const response = await fetch(this.sheetdbApi, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sheetdbToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao escrever dados no SheetDB:', error);
      throw new Error('Falha ao sincronizar com SheetDB');
    }
  }

  async readChurches(config?: SheetConfig): Promise<Church[]> {
    try {
      if (!this.churchesSheetdbApi || !this.churchesSheetdbToken) {
        throw new Error('Configuração do SheetDB para igrejas não encontrada');
      }
      
      const response = await fetch(this.churchesSheetdbApi, {
        headers: {
          'Authorization': `Bearer ${this.churchesSheetdbToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📊 Total de igrejas retornadas pela API:', data.length);
      
      // Debug das colunas disponíveis para igrejas
      if (data.length > 0) {
        console.log('🔍 Colunas disponíveis na primeira igreja:', Object.keys(data[0]));
        
        // Verificar diferentes possíveis nomes para a coluna de classificação
        const possibleClassificationColumns = [
          'Classificação',
          'classificacao', 
          'Classificacao',
          'CLASSIFICAÇÃO',
          'Classification'
        ];
        
        let classificationColumnName = '';
        for (const colName of possibleClassificationColumns) {
          if (data[0].hasOwnProperty(colName)) {
            classificationColumnName = colName;
            console.log(`✅ Coluna de classificação encontrada: '${colName}'`);
            break;
          }
        }
        
        if (!classificationColumnName) {
          console.log('❌ Nenhuma coluna de classificação encontrada');
          console.log('📋 Todas as colunas disponíveis:', Object.keys(data[0]));
        }
      }
      
      // Detectar automaticamente o nome da coluna de classificação
      let classificationColumnName = '';
      const possibleClassificationColumns = [
        'Classificação',
        'classificacao', 
        'Classificacao',
        'CLASSIFICAÇÃO',
        'Classification'
      ];
      
      for (const colName of possibleClassificationColumns) {
        if (data.length > 0 && data[0].hasOwnProperty(colName)) {
          classificationColumnName = colName;
          break;
        }
      }
      
      // Converter dados do SheetDB para o formato de Church
      return data.map((row: any, index: number) => {
        const classificacao = classificationColumnName ? (row[classificationColumnName] || 'Local') : 'Local';
        
        // Debug detalhado para cada igreja
        console.log(`🏛️ Igreja ${index + 1}: ${row['Nome da IPDA :'] || 'Sem nome'}`);
        console.log(`📋 Coluna de classificação usada: '${classificationColumnName}'`);
        console.log(`🏷️ Valor bruto da classificação: '${row[classificationColumnName]}'`);
        console.log(`✅ Classificação final: '${classificacao}'`);
        console.log('---');
        
        return {
        id: row['TOtvs:'] || (index + 1).toString(),
        classificacao: classificacao,
        nomeIPDA: row['Nome da IPDA :'] || '',
        tipoIPDA: row['Esta IPDA  e:'] || 'Congregação',
        endereco: {
          rua: row['Endereço:'] || '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: ''
        },
        pastor: {
          nomeCompleto: row['Nome completo do Pastor'] || '',
          cpf: '',
          telefone: row['Telefone'] || '',
          email: row['E-mail:'] || '',
          dataNascimento: row['Data de Nascimento:'] || '',
          dataBatismo: row['Data do batismo:'] || '',
          estadoCivil: row['Estado Civil:'] || 'Solteiro',
          funcaoMinisterial: row['Função Ministerial:'] || 'Pastor',
          possuiCFO: row['Possui o curso de CFO:'] === 'Sim' || false,
          dataConclusaoCFO: row['Data da Conclusão'] || '',
          dataAssumiu: row['Data que assumiu a IPDA:'] || ''
        },
        membrosIniciais: parseInt(row['Quantidade de membros, quando assumiu a IPDA:']) || 0,
        membrosAtuais: parseInt(row['Quantidade de membros atualmente:']) || 0,
        almasBatizadas: parseInt(row['Quantidade de almas batizadas na gestão deste pastor:']) || 0,
        temEscola: row['Tem a escola o pequeno Galileu:'] === 'Sim' || false,
        quantidadeCriancas: parseInt(row['Quantas Criança tem na escola:']) || 0,
        diasFuncionamento: row['Dias que funciona:'] ? row['Dias que funciona:'].split(',').map((d: string) => d.trim()) : [],
        foto: row['Imagem'] || '',
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      };
      });
    } catch (error) {
      console.error('Erro ao ler dados das igrejas do SheetDB:', error);
      throw new Error('Falha ao carregar dados das igrejas do SheetDB');
    }
  }

  async writeChurches(churches: Church[], config?: SheetConfig): Promise<void> {
    try {
      if (!this.churchesSheetdbApi || !this.churchesSheetdbToken) {
        throw new Error('Configuração do SheetDB para igrejas não encontrada');
      }
      
      // Converter igrejas para o formato do SheetDB
      const data = churches.map(church => ({
        'Nome da IPDA :': church.nome,
        'Endereço:': church.endereco,
        'Telefone': church.telefone,
        'E-mail:': church.email,
        'Nome completo do Pastor': church.pastor,
        'TOtvs:': '',
        'Classificação': '',
        'Tire uma foto da frente da igreja:': '',
        'Esta IPDA  e:': '',
        'Data de Nascimento:': '',
        'Data do batismo:': '',
        'Estado Civil:': '',
        'Função Ministerial:': '',
        'Possui o curso de CFO:': '',
        'Data da Conclusão': '',
        'Data que assumiu a IPDA:': '',
        'Quantidade de membros, quando assumiu a IPDA:': '',
        'Quantidade de membros atualmente:': '',
        'Quantidade de almas batizadas na gestão deste pastor:': '',
        'Tem a escola o pequeno Galileu:': '',
        'Quantas Criança tem na escola:': '',
        'Dias que funciona:': ''
      }));
      
      const response = await fetch(this.churchesSheetdbApi, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.churchesSheetdbToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao escrever dados das igrejas no SheetDB:', error);
      throw new Error('Falha ao sincronizar igrejas com SheetDB');
    }
  }

}

export const googleSheetsService = new GoogleSheetsService();