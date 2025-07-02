import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { googleSheetsService } from '@/services/googleSheetsService';
import { SHEETS_CONFIG } from '@/config/sheetsConfig';

interface SheetConfig {
  spreadsheetId: string;
  range: string;
  apiKey: string;
}

interface SpreadsheetConfigProps {
  onSave: (config: SheetConfig) => void;
  onTest?: (config: SheetConfig) => Promise<boolean>;
}

export default function SpreadsheetConfig({ onSave, onTest }: SpreadsheetConfigProps) {
  const [config, setConfig] = useState<SheetConfig>({
    spreadsheetId: SHEETS_CONFIG.MEMBERS_SHEET.id,
    range: SHEETS_CONFIG.MEMBERS_SHEET.range,
    apiKey: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem('sheets-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    }
  }, []);

  const handleSave = () => {
    if (!config.spreadsheetId || !config.apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Salvar no localStorage
    localStorage.setItem('sheets-config', JSON.stringify(config));
    
    onSave(config);
    
    toast({
      title: "Sucesso",
      description: "Configuração salva com sucesso",
    });
  };

  const handleTestConnection = async () => {
    if (!config.spreadsheetId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o ID da planilha.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Testar conexão tentando ler dados da planilha
      await googleSheetsService.readMembers({
        spreadsheetId: config.spreadsheetId,
        range: config.range
      });
      setTestResult('success');
      
      toast({
        title: "Sucesso",
        description: "Conexão estabelecida com sucesso!",
        variant: "default",
      });
    } catch (error) {
      setTestResult('error');
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao conectar com a planilha',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const extractSpreadsheetId = (url: string): string => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleSpreadsheetIdChange = (value: string) => {
    // Se for uma URL, extrair o ID
    const id = value.includes('spreadsheets') ? extractSpreadsheetId(value) : value;
    setConfig(prev => ({ ...prev, spreadsheetId: id }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração do Google Sheets
        </CardTitle>
        <CardDescription>
          Configure a integração com Google Sheets para sincronizar dados dos membros
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="spreadsheet-id">ID ou URL da Planilha *</Label>
          <Input 
            id="spreadsheet-id" 
            placeholder="Cole a URL ou ID da planilha do Google Sheets" 
            value={config.spreadsheetId}
            onChange={(e) => handleSpreadsheetIdChange(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Exemplo: https://docs.google.com/spreadsheets/d/1ABC123.../edit
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="range">Intervalo da Planilha</Label>
          <Input 
            id="range" 
            placeholder="Ex: Membros!A:AC" 
            value={config.range}
            onChange={(e) => setConfig(prev => ({ ...prev, range: e.target.value }))}
          />
          <p className="text-sm text-muted-foreground">
            Especifique a aba e o intervalo de células (ex: Membros!A:AC)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key">Chave da API do Google *</Label>
          <Input 
            id="api-key" 
            type="password"
            placeholder="Digite sua API Key do Google" 
            value={config.apiKey}
            onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
          />
          <p className="text-sm text-muted-foreground">
            Obtenha sua chave em: Google Cloud Console → APIs & Services → Credentials
          </p>
        </div>

        {testResult && (
          <Alert className={testResult === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {testResult === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={testResult === 'success' ? 'text-green-800' : 'text-red-800'}>
              {testResult === 'success' 
                ? 'Conexão estabelecida com sucesso!' 
                : 'Falha na conexão. Verifique as configurações.'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Salvar Configuração
          </Button>
          {onTest && (
            <Button 
              variant="outline" 
              onClick={handleTestConnection} 
              disabled={isTesting}
              className="flex-1"
            >
              {isTesting ? 'Testando...' : 'Testar Conexão'}
            </Button>
          )}
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Certifique-se de que a planilha esteja compartilhada publicamente 
            ou que sua API Key tenha as permissões necessárias para acessar a planilha.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}