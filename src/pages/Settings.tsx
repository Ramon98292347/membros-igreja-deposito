
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMemberContext } from '@/context/MemberContext';
import { toast } from '@/hooks/use-toast';
import DatabaseConfig from '@/components/DatabaseConfig';
import { 
  Save, 
  Settings as SettingsIcon, 
  Church, 
  Users, 
  FileSpreadsheet,
  Palette,
  Bell,
  Database,
  Shield,
  Globe,
  Monitor,
  Moon,
  Sun,
  CheckCircle,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

const Settings = () => {
  const { config, updateConfig, members } = useMemberContext();
  const [formData, setFormData] = useState(config);
  
  // Estados para configurações do sistema
  const [systemSettings, setSystemSettings] = useState({
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'pt-BR',
    notifications: JSON.parse(localStorage.getItem('notifications') || 'true'),
    autoSave: JSON.parse(localStorage.getItem('autoSave') || 'true'),
    backupFrequency: localStorage.getItem('backupFrequency') || 'weekly',
    dataRetention: localStorage.getItem('dataRetention') || '1year'
  });
  
  // Estados para configurações do Supabase
  const [databaseConfig, setDatabaseConfig] = useState(
    JSON.parse(localStorage.getItem('supabase-config') || 'null')
  );
  
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para atualizar configurações do sistema
  const updateSystemSetting = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key, typeof value === 'boolean' ? JSON.stringify(value) : value);
    
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
    
    toast({
      title: "Configuração atualizada",
      description: `${key} foi atualizado com sucesso.`
    });
  };

  // Função para configurar Supabase
  const handleDatabaseConfig = () => {
    setShowDatabaseConfig(true);
  };

  // Função para salvar configuração do Supabase
  const handleDatabaseConfigSave = (config: { supabaseUrl: string; supabaseKey: string }) => {
    localStorage.setItem('supabase-config', JSON.stringify(config));
    setDatabaseConfig(config);
    setShowDatabaseConfig(false);
    toast({
      title: "Sucesso",
      description: "Configuração do Supabase salva com sucesso"
    });
  };

  // useEffect para aplicar tema na inicialização
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', systemSettings.theme);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeIgreja.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome da igreja é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      updateConfig(formData);
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setFormData(config);
    toast({
      title: "Configurações restauradas",
      description: "As alterações foram desfeitas."
    });
  };

  const exportAllData = () => {
    const dataToExport = {
      membros: members,
      configuracoes: config,
      dataExportacao: new Date().toISOString(),
      versao: '1.0'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
      type: 'application/json' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_igreja_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Backup criado",
      description: "Todos os dados foram exportados com sucesso."
    });
  };

  const clearAllData = () => {
    if (window.confirm('ATENÇÃO: Esta ação irá apagar TODOS os dados do sistema (membros e configurações). Esta ação não pode ser desfeita. Tem certeza que deseja continuar?')) {
      if (window.confirm('Última confirmação: Todos os dados serão perdidos permanentemente. Confirma a exclusão?')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie todas as configurações do sistema, integrações e preferências
        </p>
      </div>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-sm text-muted-foreground">Membros Cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Church className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(members.map(m => m.funcaoMinisterial)).size}
                </p>
                <p className="text-sm text-muted-foreground">Funções Ministeriais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {databaseConfig ? 1 : 0}
                </p>
                <p className="text-sm text-muted-foreground">Banco de Dados Configurado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">v2.0</p>
                <p className="text-sm text-muted-foreground">Versão do Sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Configuração */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Church className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco de Dados
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados
          </TabsTrigger>
        </TabsList>

        {/* Aba Geral - Informações da Igreja */}
        <TabsContent value="general" className="space-y-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Church className="h-5 w-5" />
                  <span>Informações da Igreja</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="nomeIgreja">Nome da Igreja *</Label>
                    <Input
                      id="nomeIgreja"
                      value={formData.nomeIgreja}
                      onChange={(e) => handleInputChange('nomeIgreja', e.target.value)}
                      placeholder="Igreja Pentecostal Deus é Amor"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="endereco">Endereço Completo</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      placeholder="Av Santo Antonio N° 366, Caratoira, Vitória ES"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone de Contato</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(27) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email da Igreja</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contato@ipdavitoria.com.br"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleReset}>
                Cancelar Alterações
              </Button>
              <Button type="submit" className="church-gradient text-white">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Aba Banco de Dados - Configurações do Supabase */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Configurações do Supabase</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Conexão com Banco de Dados</h3>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDatabaseConfig}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {databaseConfig ? 'Reconfigurar' : 'Configurar'} Supabase
                  </Button>
                </div>
                {databaseConfig && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Banco de Dados Configurado</span>
                    </div>
                    <p className="text-sm text-green-700">
                      URL: {databaseConfig.supabaseUrl?.substring(0, 30)}...
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Sobre o Supabase</h4>
                <p className="text-sm text-blue-700">
                  O Supabase é uma plataforma de banco de dados que oferece uma alternativa ao Firebase com código aberto.
                  Ele fornece autenticação, armazenamento e banco de dados PostgreSQL em tempo real.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Para usar o Supabase, você precisa criar uma conta em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a> e configurar um projeto.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Configurações de Aparência</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tema */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Tema do Sistema</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span>Claro</span>
                  </div>
                  <Switch
                    checked={systemSettings.theme === 'dark'}
                    onCheckedChange={(checked) => updateSystemSetting('theme', checked ? 'dark' : 'light')}
                  />
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>Escuro</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Idioma */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Idioma do Sistema</h3>
                <Select value={systemSettings.language} onValueChange={(value) => updateSystemSetting('language', value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Configurações de Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notificações Gerais */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-800">Notificações do Sistema</h3>
                  <p className="text-sm text-gray-600">Receber notificações sobre ações do sistema</p>
                </div>
                <Switch
                  checked={systemSettings.notifications}
                  onCheckedChange={(checked) => updateSystemSetting('notifications', checked)}
                />
              </div>

              <Separator />

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-800">Salvamento Automático</h3>
                  <p className="text-sm text-gray-600">Salvar automaticamente as alterações</p>
                </div>
                <Switch
                  checked={systemSettings.autoSave}
                  onCheckedChange={(checked) => updateSystemSetting('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Dados */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Gerenciamento de Dados</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Backup e Restauração */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Backup dos Dados
                  </h3>
                  <p className="text-sm text-gray-600">
                    Exporte todos os dados do sistema para backup
                  </p>
                  <Button onClick={exportAllData} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Backup Completo
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Limpar Dados
                  </h3>
                  <p className="text-sm text-gray-600">
                    Remove todos os membros e configurações (irreversível)
                  </p>
                  <Button onClick={clearAllData} variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Sistema
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Configurações de Backup */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Configurações de Backup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequência de Backup Automático</Label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value) => updateSystemSetting('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="never">Nunca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Retenção de Dados</Label>
                    <Select value={systemSettings.dataRetention} onValueChange={(value) => updateSystemSetting('dataRetention', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 meses</SelectItem>
                        <SelectItem value="1year">1 ano</SelectItem>
                        <SelectItem value="2years">2 anos</SelectItem>
                        <SelectItem value="forever">Permanente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Importante
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Faça backup regularmente dos seus dados</li>
                  <li>• A limpeza do sistema remove TODOS os dados permanentemente</li>
                  <li>• Os dados são armazenados localmente no seu navegador</li>
                  <li>• Limpar os dados do navegador também removerá as informações</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Informações do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Versão:</strong> 2.0.0
                </div>
                <div>
                  <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <strong>Membros cadastrados:</strong> {members.length}
                </div>
                <div>
                  <strong>Armazenamento:</strong> Local (Navegador)
                </div>
                <div>
                  <strong>Banco de dados configurado:</strong> {databaseConfig ? 'Sim' : 'Não'}
                </div>
                <div>
                  <strong>Tema ativo:</strong> {systemSettings.theme === 'dark' ? 'Escuro' : 'Claro'}
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Sistema de Gerenciamento de Membros</h4>
                <p className="text-sm text-blue-700">
                  Desenvolvido especialmente para a Igreja Pentecostal Deus é Amor - Setorial de Vitória/ES.
                  Sistema completo para cadastro, controle e emissão de documentos dos membros da igreja.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Configuração do Supabase */}
      <Dialog open={showDatabaseConfig} onOpenChange={setShowDatabaseConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configurar Conexão com Supabase
            </DialogTitle>
          </DialogHeader>
          <DatabaseConfig
            onSave={handleDatabaseConfigSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
