import { useState, useEffect, useCallback } from 'react';
import { useChurchContext } from '@/context/ChurchContext';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';
import { Church } from '@/types/church';

// Interface não é mais necessária para Supabase

export function useSupabaseChurches() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedChurches, setImportedChurches] = useState<Church[]>([]);
  const { churches: contextChurches, addChurch, clearChurches } = useChurchContext();

  // Carregar igrejas do Supabase ao inicializar
  useEffect(() => {
    fetchChurches();
  }, []);

  // Função para buscar igrejas do Supabase
  const fetchChurches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseService.readChurches();
      setChurches(data);
      
      // Salvar no localStorage como backup
      localStorage.setItem('churches', JSON.stringify(data));
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar igrejas';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao buscar igrejas do Supabase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para importar igrejas do contexto para o Supabase
  const importToSupabase = useCallback(async (churchesToImport: Church[]) => {
    setLoading(true);
    setError(null);
    try {
      // Limpar igrejas existentes no contexto
      clearChurches();
      
      // Adicionar cada igreja ao Supabase
      const promises = churchesToImport.map(church => {
        const { id, dataCadastro, dataAtualizacao, ...churchData } = church;
        return supabaseService.writeChurch(churchData);
      });
      
      await Promise.all(promises);
      
      // Recarregar igrejas
      await fetchChurches();
      
      toast({
        title: "Sucesso",
        description: `${churchesToImport.length} igrejas importadas com sucesso`,
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar igrejas';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao importar igrejas para o Supabase",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearChurches, fetchChurches]);

  // Função para adicionar igreja
  const addChurchToSupabase = useCallback(async (church: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => {
    setLoading(true);
    try {
      const newChurch = await supabaseService.writeChurch(church);
      setChurches(prev => [...prev, newChurch]);
      toast({
        title: "Sucesso",
        description: "Igreja adicionada com sucesso",
      });
      return newChurch;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar igreja';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao adicionar igreja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Função para atualizar igreja
  const updateChurch = useCallback(async (id: string, updates: Partial<Church>) => {
    setLoading(true);
    try {
      const updatedChurch = await supabaseService.updateChurch(id, updates);
      setChurches(prev => prev.map(church => 
        church.id === id ? updatedChurch : church
      ));
      toast({
        title: "Sucesso",
        description: "Igreja atualizada com sucesso",
      });
      return updatedChurch;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar igreja';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao atualizar igreja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Função para deletar igreja
  const deleteChurch = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await supabaseService.deleteChurch(id);
      setChurches(prev => prev.filter(church => church.id !== id));
      toast({
        title: "Sucesso",
        description: "Igreja removida com sucesso",
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover igreja';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao remover igreja",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    churches, 
    loading, 
    error, 
    fetchChurches, 
    importToSupabase,
    addChurch: addChurchToSupabase,
    updateChurch,
    deleteChurch,
    importedChurches,
    hasImportedData: importedChurches.length > 0
  };
}