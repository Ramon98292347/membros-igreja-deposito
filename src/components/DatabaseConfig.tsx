import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface DatabaseConfigProps {
  onSave: (config: { supabaseUrl: string; supabaseKey: string }) => void;
}

const DatabaseConfig = ({ onSave }: DatabaseConfigProps) => {
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Carrega configurações existentes, se houver
  useEffect(() => {
    const savedConfig = localStorage.getItem('supabase-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setSupabaseUrl(config.supabaseUrl || '');
        setSupabaseKey(config.supabaseKey || '');
      } catch (error) {
        console.error('Erro ao carregar configuração do Supabase:', error);
      }
    }
  }, []);

  const handleSave = () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const config = { supabaseUrl, supabaseKey };
    onSave(config);
  };

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios para testar a conexão.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      // Tenta inicializar o cliente Supabase com as credenciais fornecidas
      const tempSupabase = supabaseService.initializeClient(supabaseUrl, supabaseKey);
      
      // Tenta fazer uma consulta simples para verificar a conexão
      const { data, error } = await tempSupabase.from('members').select('count', { count: 'exact' }).limit(1);
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Conexão bem-sucedida",
        description: "A conexão com o Supabase foi estabelecida com sucesso."
      });
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao Supabase. Verifique as credenciais e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supabaseUrl">URL do Supabase *</Label>
          <Input
            id="supabaseUrl"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://seu-projeto.supabase.co"
          />
          <p className="text-sm text-muted-foreground">
            URL do seu projeto Supabase (ex: https://seu-projeto.supabase.co)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supabaseKey">Chave de API do Supabase *</Label>
          <Input
            id="supabaseKey"
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
          <p className="text-sm text-muted-foreground">
            Chave anon/public do seu projeto Supabase
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={testConnection} 
          variant="outline" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Conexão OK
            </>
          ) : (
            "Testar Conexão"
          )}
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          Salvar Configuração
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Como configurar o Supabase</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
          <li>Crie uma conta no <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">Supabase</a></li>
          <li>Crie um novo projeto</li>
          <li>Vá para Configurações &gt; API</li>
          <li>Copie a URL do projeto e a chave anon/public</li>
          <li>Cole nos campos acima e teste a conexão</li>
        </ol>
      </div>
    </div>
  );
};

export default DatabaseConfig;