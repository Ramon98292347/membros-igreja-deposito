const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Usar variáveis de ambiente seguras
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Validar configuração
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.log('Certifique-se de que o arquivo .env.local existe com:');
  console.log('VITE_SUPABASE_URL=sua_url_aqui');
  console.log('VITE_SUPABASE_ANON_KEY=sua_chave_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChurchesTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela churches...');
    console.log('📡 URL do Supabase:', supabaseUrl);
    
    // Fazer uma query para obter informações sobre as colunas
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'churches' })
      .single();
    
    if (error) {
      console.log('⚠️ Função get_table_columns não existe, tentando método alternativo...');
      
      // Método alternativo: tentar inserir dados vazios para ver quais campos são aceitos
      const { data: insertData, error: insertError } = await supabase
        .from('churches')
        .insert({})
        .select();
      
      if (insertError) {
        console.log('📋 Analisando erro para descobrir estrutura da tabela:');
        console.log('Erro:', insertError.message);
        
        // Tentar com diferentes nomes de colunas comuns
        const testColumns = [
          'name', 'nome', 'nomeIPDA', 'nome_ipda',
          'classification', 'classificacao',
          'type', 'tipo', 'tipoIPDA', 'tipo_ipda',
          'address', 'endereco',
          'pastor',
          'members_initial', 'membros_iniciais', 'membrosIniciais',
          'members_current', 'membros_atuais', 'membrosAtuais',
          'members_count', 'quantidade_membros', 'quantidadeMembros',
          'baptized_souls', 'almas_batizadas', 'almasBatizadas',
          'has_school', 'tem_escola', 'temEscola',
          'children_count', 'quantidade_criancas', 'quantidadeCriancas',
          'operating_days', 'dias_funcionamento', 'diasFuncionamento',
          'photo', 'foto',
          'phone', 'telefone',
          'email',
          'created_at', 'data_cadastro', 'dataCadastro',
          'updated_at', 'data_atualizacao', 'dataAtualizacao'
        ];

        console.log('\n🧪 Testando colunas possíveis...');
        
        for (const column of testColumns) {
          try {
            const { error: testError } = await supabase
              .from('churches')
              .select(column)
              .limit(1);
            
            if (!testError) {
              console.log(`✅ Coluna encontrada: ${column}`);
            }
          } catch (e) {
            // Ignorar erros de teste
          }
        }
      } else {
        console.log('✅ Tabela churches existe e aceita inserções vazias');
        console.log('Dados inseridos:', insertData);
      }
    } else {
      console.log('✅ Estrutura da tabela obtida com sucesso:');
      console.log(data);
    }

    // Tentar fazer uma query simples para verificar se a tabela existe
    console.log('\n🔍 Verificando se a tabela churches existe...');
    const { data: existsData, error: existsError } = await supabase
      .from('churches')
      .select('*')
      .limit(1);

    if (existsError) {
      console.log('❌ Erro ao acessar tabela churches:', existsError.message);
      
      if (existsError.code === '42P01') {
        console.log('\n💡 A tabela "churches" não existe no banco de dados.');
        console.log('Execute o script SQL para criar a tabela:');
        console.log('1. Acesse o painel do Supabase');
        console.log('2. Vá para SQL Editor');
        console.log('3. Execute o conteúdo do arquivo setup-igreja-table.sql');
      }
    } else {
      console.log('✅ Tabela churches existe e está acessível');
      console.log(`📊 Registros encontrados: ${existsData?.length || 0}`);
      
      if (existsData && existsData.length > 0) {
        console.log('📋 Exemplo de registro:');
        console.log(JSON.stringify(existsData[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
checkChurchesTable()
  .then(() => {
    console.log('\n✅ Verificação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na verificação:', error);
    process.exit(1);
  });