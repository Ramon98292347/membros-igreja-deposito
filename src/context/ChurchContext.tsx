
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Church } from '@/types/church';
import { supabaseService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

interface ChurchContextType {
  churches: Church[];
  addChurch: (church: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => void;
  updateChurch: (id: string, church: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => void;
  deleteChurch: (id: string) => void;
  clearChurches: () => void;
  getChurchById: (id: string) => Church | undefined;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const useChurchContext = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurchContext deve ser usado dentro de ChurchProvider');
  }
  return context;
};

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChurches = async () => {
      setIsLoading(true);
      try {
        const supabaseChurches = await supabaseService.readChurches();
        if (supabaseChurches && supabaseChurches.length > 0) {
          setChurches(supabaseChurches);
        } else {
          // Se não houver igrejas no Supabase, verificar no localStorage
          const savedChurches = localStorage.getItem('churches');
          if (savedChurches) {
            const parsedChurches = JSON.parse(savedChurches);
            setChurches(parsedChurches);
            // Salvar no Supabase
            await supabaseService.writeChurches(parsedChurches);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar igrejas do Supabase:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as igrejas. Usando dados locais.",
          variant: "destructive"
        });
        
        // Fallback para localStorage em caso de erro
        const savedChurches = localStorage.getItem('churches');
        if (savedChurches) {
          setChurches(JSON.parse(savedChurches));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChurches();
  }, []);

  // Manter o localStorage como backup
  useEffect(() => {
    if (churches.length > 0) {
      localStorage.setItem('churches', JSON.stringify(churches));
    }
  }, [churches]);

  const addChurch = useCallback(async (churchData: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => {
    setIsLoading(true);
    try {
      const newChurch: Church = {
        ...churchData,
        id: Date.now().toString(),
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };
      
      // Adicionar ao Supabase
      await supabaseService.writeChurch(newChurch);
      
      // Atualizar estado local
      setChurches(prev => [...prev, newChurch]);
      
      toast({
        title: "Sucesso",
        description: "Igreja adicionada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar igreja:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a igreja",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateChurch = useCallback(async (id: string, churchData: Omit<Church, 'id' | 'dataCadastro' | 'dataAtualizacao'>) => {
    setIsLoading(true);
    try {
      const churchToUpdate = churches.find(c => c.id === id);
      if (!churchToUpdate) {
        throw new Error('Igreja não encontrada');
      }
      
      const updatedChurch: Church = { 
        ...churchData, 
        id, 
        dataCadastro: churchToUpdate.dataCadastro, 
        dataAtualizacao: new Date().toISOString() 
      };
      
      // Atualizar no Supabase
      await supabaseService.updateChurch(updatedChurch);
      
      // Atualizar estado local
      setChurches(prev => prev.map(church => 
        church.id === id ? updatedChurch : church
      ));
      
      toast({
        title: "Sucesso",
        description: "Igreja atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar igreja:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a igreja",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [churches]);

  const deleteChurch = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Excluir do Supabase
      await supabaseService.deleteChurch(id);
      
      // Atualizar estado local
      setChurches(prev => prev.filter(church => church.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Igreja excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir igreja:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a igreja",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChurches = useCallback(async () => {
    setIsLoading(true);
    try {
      // Usar o método clearChurches do supabaseService
      await supabaseService.clearChurches();
      
      // Atualizar estado local
      setChurches([]);
      
      // Remover do localStorage
      localStorage.removeItem('churches');
      
      toast({
        title: "Sucesso",
        description: "Todas as igrejas foram removidas",
      });
    } catch (error) {
      console.error('Erro ao limpar igrejas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover todas as igrejas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChurchById = (id: string) => {
    return churches.find(church => church.id === id);
  };

  return (
    <ChurchContext.Provider value={{
      churches,
      addChurch,
      updateChurch,
      deleteChurch,
      clearChurches,
      getChurchById
    }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </ChurchContext.Provider>
  );
};
