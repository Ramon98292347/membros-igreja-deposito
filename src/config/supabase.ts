import { createClient } from '@supabase/supabase-js';

// Configuração segura do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas. ' +
    'Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env.local'
  );
}

// Cliente Supabase configurado
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

// Configurações exportadas para uso em outros arquivos
export const supabaseConfig = {
  url: supabaseUrl,
  key: supabaseKey
};

// Função para verificar se o Supabase está configurado corretamente
export const isSupabaseConfigured = (): boolean => {
  try {
    return !!(supabaseUrl && supabaseKey);
  } catch (error) {
    console.error('Erro ao verificar configuração do Supabase:', error);
    return false;
  }
};

// Função para testar conexão com o Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('membros').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Erro ao testar conexão com Supabase:', error);
    return false;
  }
};