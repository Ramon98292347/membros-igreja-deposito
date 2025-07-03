// Script para debugar a API do Supabase e verificar a contagem de membros

const { createClient } = require('@supabase/supabase-js');

// Substitua com suas credenciais reais do Supabase
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua_chave_anon_public_aqui';

// Inicializa o cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugSupabase() {
  try {
    console.log('🔍 Fazendo requisição para Supabase...');
    
    // Buscar todos os membros
    const { data, error } = await supabase
      .from('members')
      .select('*');
    
    if (error) {
      throw new Error(`Erro Supabase: ${error.message}`);
    }
    
    console.log('📊 Resultados da API:');
    console.log(`Total de registros retornados: ${data.length}`);
    
    // Verificar se há registros vazios ou duplicados
    const registrosVazios = data.filter(row => !row.full_name || row.full_name.trim() === '');
    console.log(`Registros com nome vazio: ${registrosVazios.length}`);
    
    // Verificar registros válidos
    const registrosValidos = data.filter(row => row.full_name && row.full_name.trim() !== '');
    console.log(`Registros válidos: ${registrosValidos.length}`);
    
    // Mostrar alguns exemplos
    console.log('\n📝 Primeiros 5 registros:');
    data.slice(0, 5).forEach((row, index) => {
      console.log(`${index + 1}. Nome: "${row.full_name || 'VAZIO'}" | Foto: "${row.image_url || 'SEM FOTO'}"`);
    });
    
    // Verificar fotos
    const comFoto = data.filter(row => row.image_url && row.image_url.trim() !== '');
    console.log(`\n🖼️ Registros com foto: ${comFoto.length}`);
    
    if (comFoto.length > 0) {
      console.log('Exemplos de URLs de fotos:');
      comFoto.slice(0, 3).forEach((row, index) => {
        console.log(`${index + 1}. ${row.full_name} - ${row.image_url}`);
      });
    }
    
    // Verificar igrejas
    console.log('\n⛪ Verificando tabela de igrejas...');
    const { data: churches, error: churchError } = await supabase
      .from('churches')
      .select('*');
    
    if (churchError) {
      throw new Error(`Erro ao buscar igrejas: ${churchError.message}`);
    }
    
    console.log(`Total de igrejas: ${churches.length}`);
    
    if (churches.length > 0) {
      console.log('Primeiras 3 igrejas:');
      churches.slice(0, 3).forEach((church, index) => {
        console.log(`${index + 1}. ${church.name} - ${church.city}/${church.state} - Pastor: ${church.pastor_name || 'Não informado'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao acessar Supabase:', error.message);
  }
}

debugSupabase();