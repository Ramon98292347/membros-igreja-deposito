// Classe para erros customizados do Supabase
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Função utilitária para tratar erros do Supabase
export const handleSupabaseError = (error: any, operation: string): never => {
  console.error(`Erro na operação ${operation}:`, error);
  
  // Mapear códigos de erro comuns para mensagens amigáveis
  const errorMessages: Record<string, string> = {
    '23505': 'Este registro já existe no sistema.',
    '23503': 'Não é possível excluir este registro pois está sendo usado em outro local.',
    '42P01': 'Tabela não encontrada. Verifique a configuração do banco de dados.',
    'PGRST116': 'Nenhum registro encontrado.',
    'PGRST301': 'Você não tem permissão para realizar esta operação.',
  };

  const friendlyMessage = errorMessages[error.code] || error.message || 'Erro desconhecido';
  
  throw new SupabaseError(
    `Erro ao ${operation}: ${friendlyMessage}`,
    error.code,
    error
  );
};

// Função para retry automático
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Não fazer retry para erros de validação ou permissão
      if (error instanceof SupabaseError && 
          ['23505', '23503', 'PGRST301'].includes(error.code || '')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      console.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};