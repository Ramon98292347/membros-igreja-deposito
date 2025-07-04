const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  try {
    console.log('Testando conexão com Supabase...');
    
    // Teste de inserção de membro
    const testMember = {
      nome_completo: 'Teste Usuario',
      telefone: '(11) 99999-9999',
      email: 'teste@email.com',
      cidade: 'São Paulo',
      estado: 'SP',
      funcao_ministerial: 'Membro',
      ativo: true,
      data_cadastro: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    };
    
    console.log('Inserindo membro de teste...');
    const { data, error } = await supabase
      .from('membros')
      .insert([testMember])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao inserir:', error);
    } else {
      console.log('Membro inserido com sucesso:', data);
      
      // Limpar o teste
      await supabase.from('membros').delete().eq('id', data.id);
      console.log('Membro de teste removido.');
    }
    
  } catch (err) {
    console.error('Erro no teste:', err);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testSupabase();
}

module.exports = { testSupabase };