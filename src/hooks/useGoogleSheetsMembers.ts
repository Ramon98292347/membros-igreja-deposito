import { useState, useCallback } from 'react';
import { Member } from '@/types/member';
import { toast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useMemberContext } from '@/context/MemberContext';

interface SyncParams {
  spreadsheetId: string;
  range: string;
  apiKey: string;
}

export function useGoogleSheetsMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { importFromSheets, clearMembers } = useMemberContext();

  const syncFromSheets = async (config?: { spreadsheetId: string; range: string; apiKey?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sheetsMembers = await googleSheetsService.readMembers(config);
      setMembers(sheetsMembers);
      
      // Salvar no localStorage como backup
      localStorage.setItem('members', JSON.stringify(sheetsMembers));
      
      return sheetsMembers;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sincronizar com Google Sheets';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const syncToSheets = async (membersToSync: Member[], config?: { spreadsheetId: string; range: string; apiKey?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await googleSheetsService.writeMembers(membersToSync, config);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar dados para Google Sheets';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchMembers = useCallback((query: string): Member[] => {
    if (!query.trim()) return members;
    
    const searchTerm = query.toLowerCase();
    return members.filter(member => 
      member.nomeCompleto.toLowerCase().includes(searchTerm) ||
      member.cidade.toLowerCase().includes(searchTerm) ||
      member.telefone.includes(searchTerm) ||
      member.funcaoMinisterial.toLowerCase().includes(searchTerm)
    );
  }, [members]);

  // Função para carregar dados do backup local
  const loadFromLocalStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedMembers = localStorage.getItem('sheets-members');
      if (storedMembers) {
        const parsedMembers = JSON.parse(storedMembers);
        setMembers(parsedMembers);
        toast({
          title: "Dados Carregados",
          description: `${parsedMembers.length} membros carregados do backup local`,
        });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do backup local",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para salvar dados importados no sistema local
  const saveToLocalSystem = useCallback(async () => {
    if (members.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum dado para salvar. Sincronize primeiro com o Google Sheets.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Limpar dados antigos antes de importar novos
      clearMembers();
      
      const result = importFromSheets(members);
      
      toast({
        title: "Importação Concluída",
        description: `${members.length} membros importados com sucesso. Total: ${members.length} membros no sistema.`,
      });
      
      return result;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar dados no sistema local",
        variant: "destructive",
      });
      throw err;
    }
  }, [members, importFromSheets, clearMembers]);

  return {
    members,
    isLoading,
    isSyncing,
    error,
    syncFromSheets,
    syncToSheets,
    searchMembers,
    loadFromLocalStorage,
    saveToLocalSystem,
  };
}