import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/googleSheetsService';

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

interface SyncParams {
  spreadsheetId: string;
  range: string;
  apiKey?: string;
}

export function useGoogleSheetsChurches() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncFromSheets = async (config?: SyncParams) => {
    setIsLoading(true);
    setIsSyncing(true);
    setError(null);
    
    try {
      const sheetsChurches = await googleSheetsService.readChurches(config);
      setChurches(sheetsChurches);
      
      // Salvar no localStorage como backup
      localStorage.setItem('churches', JSON.stringify(sheetsChurches));
      
      toast({
        title: "Sucesso",
        description: `${sheetsChurches.length} igrejas importadas do Google Sheets`
      });
      
      return sheetsChurches;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sincronizar com Google Sheets';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const syncToSheets = async (churchesToSync: Church[], config?: SyncParams) => {
    setIsLoading(true);
    setIsSyncing(true);
    setError(null);
    
    try {
      await googleSheetsService.writeChurches(churchesToSync, config);
      
      toast({
        title: "Sucesso",
        description: `${churchesToSync.length} igrejas exportadas para o Google Sheets`
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar dados para Google Sheets';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  return {
    churches,
    isLoading,
    isSyncing,
    error,
    syncFromSheets,
    syncToSheets
  };
}