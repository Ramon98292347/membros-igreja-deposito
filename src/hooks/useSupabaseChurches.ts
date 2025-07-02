import { useState, useEffect } from 'react';
import { useGoogleSheetsChurches } from './useGoogleSheetsChurches';
import { useChurchContext } from '@/context/ChurchContext';
import { toast } from '@/hooks/use-toast';

interface SyncParams {
  spreadsheetId: string;
  range: string;
  apiKey?: string;
}

export function useSupabaseChurches() {
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedChurches, setImportedChurches] = useState<any[]>([]);
  const { syncFromSheets, syncToSheets, isLoading, isSyncing } = useGoogleSheetsChurches();
  const { churches: contextChurches, addChurch, clearChurches } = useChurchContext();

  // Carregar igrejas do contexto
  useEffect(() => {
    setChurches(contextChurches);
  }, [contextChurches]);

  // Função para buscar igrejas
  const fetchChurches = async () => {
    setLoading(true);
    setError(null);
    try {
      setChurches(contextChurches);
    } catch (err) {
      setError('Erro ao buscar igrejas');
    } finally {
      setLoading(false);
    }
  };

  const syncChurches = async (params: SyncParams) => {
    try {
      const churchesData = await syncFromSheets(params);
      setImportedChurches(churchesData);
      setChurches(churchesData);
      return churchesData;
    } catch (err) {
      setError('Erro ao sincronizar igrejas');
      throw err;
    }
  };

  const saveImportedChurches = () => {
    if (importedChurches.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados importados para salvar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Limpar dados antigos antes de adicionar novos
      clearChurches();
      
      importedChurches.forEach(church => {
        addChurch(church);
      });

      toast({
        title: "Sucesso",
        description: `${importedChurches.length} igrejas salvas com sucesso!`
      });

      setImportedChurches([]);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar as igrejas importadas",
        variant: "destructive"
      });
    }
  };

  return { 
    churches, 
    loading: loading || isLoading, 
    error, 
    fetchChurches, 
    syncChurches,
    isSyncing,
    importedChurches,
    saveImportedChurches,
    hasImportedData: importedChurches.length > 0
  };
}