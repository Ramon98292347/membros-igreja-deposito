import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';
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

  // Verificar se há usuário logado no Supabase
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await supabaseService.getCurrentUser();
        
        if (currentUser) {
          const userData: User = {
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.user_metadata?.name || 'Usuário'
          };
          
          setUser(userData);
          
          // Carregar dados de membros
          await syncData();
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const data = await supabaseService.signIn(email, password);
      
      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || 'Usuário'
        };
        
        setUser(userData);
        
        // Sincronizar dados após login
        await syncData();
        
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Dados sincronizados com Supabase.',
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
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mensagem de erro mais detalhada
      let errorMessage = 'Ocorreu um erro durante o login.';
      
      if (error.message) {
        // Verificar mensagens específicas de erro
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciais inválidas. Verifique seu email e senha.';
        } else if (error.message.includes('Email e senha são obrigatórios')) {
          errorMessage = 'Email e senha são obrigatórios.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e as configurações do Supabase.';
        } else {
          // Incluir a mensagem de erro original para ajudar na depuração
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabaseService.signOut();
      setUser(null);
      setMembersData([]);
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado do sistema.',
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro no logout',
        description: 'Ocorreu um erro ao desconectar.',
        variant: 'destructive',
      });
    }
  };

  const syncData = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    
    try {
      console.log('🔄 Iniciando sincronização com Supabase...');
      
      // Sincronizar membros
      const members = await supabaseService.readMembers();
      setMembersData(members);
      
      console.log(`✅ Sincronização concluída: ${members.length} membros carregados`);
      
      toast({
        title: 'Sincronização concluída',
        description: `${members.length} membros carregados do Supabase.`,
      });
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar com Supabase.',
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