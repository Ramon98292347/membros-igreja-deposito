import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/googleSheetsService';
import { Member } from '@/types/member';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  syncData: () => Promise<void>;
  membersData: Member[];
  isSyncing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();


  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedMembers = localStorage.getItem('members_data');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedMembers) {
      setMembersData(JSON.parse(savedMembers));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulação de autenticação - você pode integrar com seu sistema de auth
      // Por enquanto, vamos aceitar credenciais específicas
      if (email === 'admin@ipda.com' && password === 'admin123') {
        const userData: User = {
          id: '1',
          email: email,
          name: 'Administrador IPDA'
        };
        
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        // Sincronizar dados após login
        await syncData();
        
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Dados sincronizados com Google Sheets.',
        });
        
        return true;
      } else {
        toast({
          title: 'Erro no login',
          description: 'Email ou senha incorretos.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro durante o login.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setMembersData([]);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('members_data');
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado do sistema.',
    });
  };

  const syncData = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    
    try {
      console.log('🔄 Iniciando sincronização com Google Sheets...');
      
      // Sincronizar membros
      const members = await googleSheetsService.readMembers();
      setMembersData(members);
      localStorage.setItem('members_data', JSON.stringify(members));
      
      console.log(`✅ Sincronização concluída: ${members.length} membros carregados`);
      
      toast({
        title: 'Sincronização concluída',
        description: `${members.length} membros carregados do Google Sheets.`,
      });
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar com Google Sheets.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    syncData,
    membersData,
    isSyncing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};