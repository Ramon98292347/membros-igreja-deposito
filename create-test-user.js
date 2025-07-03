// Script para criar um usuário de teste no Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase diretamente do código
const supabaseUrl = 'https://hwstbxvalwbrqarbdzep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3c3RieHZhbHdicnFhcmJkemVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMjU3MTIsImV4cCI6MjA2NjkwMTcxMn0.PMSVztn6ve2hstK4nwLOCKGcdJFaxYfEZNfb3hm8Ev8';

// Inicialização do cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Dados do usuário de teste
const email = 'admin@ipda.com';
const password = 'admin123';
const name = 'Administrador';

async function createTestUser() {
  try {
    console.log('Tentando criar usuário de teste:', { email });
    
    // Registrar o usuário no Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error('Erro ao criar usuário de teste:', error);
      return;
    }

    console.log('Usuário de teste criado com sucesso:', {
      id: data.user?.id,
      email: data.user?.email
    });
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
  }
}

// Executar a função
createTestUser();