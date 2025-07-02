// Script para debugar a API do SheetDB e verificar a contagem de membros

const SHEETDB_API = 'https://sheetdb.io/api/v1/xsdauvple358w';
const SHEETDB_TOKEN = 'j3etulvjwabahhl2p851p6wuzizsssvo3pvhvfjj';

async function debugSheetDB() {
  try {
    console.log('🔍 Fazendo requisição para SheetDB...');
    
    const response = await fetch(SHEETDB_API, {
      headers: {
        'Authorization': `Bearer ${SHEETDB_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📊 Resultados da API:');
    console.log(`Total de registros retornados: ${data.length}`);
    
    // Verificar se há registros vazios ou duplicados
    const registrosVazios = data.filter(row => !row['Nome Completo:'] || row['Nome Completo:'].trim() === '');
    console.log(`Registros com nome vazio: ${registrosVazios.length}`);
    
    // Verificar registros válidos
    const registrosValidos = data.filter(row => row['Nome Completo:'] && row['Nome Completo:'].trim() !== '');
    console.log(`Registros válidos: ${registrosValidos.length}`);
    
    // Mostrar alguns exemplos
    console.log('\n📝 Primeiros 5 registros:');
    data.slice(0, 5).forEach((row, index) => {
      console.log(`${index + 1}. Nome: "${row['Nome Completo:'] || 'VAZIO'}" | Foto: "${row['foto 1'] || 'SEM FOTO'}"`);
    });
    
    // Verificar fotos
    const comFoto = data.filter(row => row['foto 1'] && row['foto 1'].trim() !== '');
    console.log(`\n🖼️ Registros com foto: ${comFoto.length}`);
    
    if (comFoto.length > 0) {
      console.log('Exemplos de URLs de fotos:');
      comFoto.slice(0, 3).forEach((row, index) => {
        console.log(`${index + 1}. ${row['Nome Completo:']} - ${row['foto 1']}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao acessar SheetDB:', error.message);
  }
}

debugSheetDB();