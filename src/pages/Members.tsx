
import { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Grid3X3, List, Users, UserCheck, UserX, Settings, Save, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemberTabs from '@/components/MemberTabs';
import SyncButton from '@/components/SyncButton';
import SpreadsheetConfig from '@/components/SpreadsheetConfig';
import MemberCarousel from '@/components/MemberCarousel';
import MemberRecordCards from '@/components/MemberRecordCards';
import MemberCardCarousel from '@/components/MemberCardCarousel';
import { useGoogleSheetsMembers } from '@/hooks/useGoogleSheetsMembers';
import { useMemberContext } from '@/context/MemberContext';
import { toast } from '@/hooks/use-toast';

const Members = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSpreadsheetConfig, setShowSpreadsheetConfig] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [sheetConfig, setSheetConfig] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [importedMembers, setImportedMembers] = useState<any[]>([]);
  
  const { members: contextMembers } = useMemberContext();
  const {
    members,
    isLoading,
    isSyncing,
    error,
    syncFromSheets,
    syncToSheets,
    searchMembers,
    loadFromLocalStorage,
    saveToLocalSystem
  } = useGoogleSheetsMembers();

  // Carregar configuração salva e dados locais ao inicializar
  useEffect(() => {
    const savedConfig = localStorage.getItem('sheets-config');
    if (savedConfig) {
      try {
        setSheetConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    }
    
    const savedSyncTime = localStorage.getItem('last-sync-time');
    if (savedSyncTime) {
      setLastSyncTime(savedSyncTime);
    }
    
    // Carregar dados do backup local
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const handleSyncFromSheets = async () => {
    if (!sheetConfig) {
      toast({
        title: "Erro",
        description: "Configure primeiro a planilha do Google Sheets",
        variant: "destructive"
      });
      return;
    }

    try {
      const membersData = await syncFromSheets({
        spreadsheetId: sheetConfig.spreadsheetId,
        range: sheetConfig.range,
        apiKey: sheetConfig.apiKey
      });
      
      setImportedMembers(membersData);
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last-sync-time', now);
      
      toast({
        title: "Sucesso",
        description: `${membersData.length} membros importados com sucesso!`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao sincronizar dados",
        variant: "destructive"
      });
    }
  };

  const handleSyncToSheets = async () => {
    try {
      const membersToSync = members.length > 0 ? members : contextMembers;
      await syncToSheets(membersToSync, sheetConfig?.spreadsheetId ? sheetConfig : undefined);
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last-sync-time', now);
      toast({
        title: "Sucesso",
        description: "Dados exportados para o Google Sheets"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar dados",
        variant: "destructive"
      });
    }
  };

  const handleSaveToSystem = async () => {
    try {
      await saveToLocalSystem();
    } catch (error) {
      // O erro já é tratado dentro da função saveToLocalSystem
    }
  };

  const saveImportedMembers = () => {
    if (importedMembers.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados importados para salvar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Primeiro, limpar todos os dados existentes
      localStorage.removeItem('church-members');
      localStorage.removeItem('sheets-members');
      
      // Depois, salvar os novos dados importados
      localStorage.setItem('church-members', JSON.stringify(importedMembers));
      
      toast({
        title: "Sucesso",
        description: `Dados antigos removidos e ${importedMembers.length} novos membros salvos com sucesso!`
      });

      setImportedMembers([]);
      
      // Recarregar a página para mostrar os novos dados
      window.location.reload();
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao salvar os membros importados",
        variant: "destructive"
      });
    }
  };

  const handleSpreadsheetConfig = (config: any) => {
    setSheetConfig(config);
    setShowSpreadsheetConfig(false);
    toast({
      title: "Sucesso",
      description: "Configuração do Google Sheets salva com sucesso",
    });
  };

  const handleTestConnection = async (config: any): Promise<boolean> => {
    try {
      // Teste básico de conexão
      await syncFromSheets(config);
      return true;
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      return false;
    }
  };

  // Combinar dados do Google Sheets com dados do contexto
  const allMembers = [...contextMembers, ...members];
  // Remover duplicatas baseado no CPF
  const uniqueMembers = allMembers.reduce((acc, current) => {
    const existingIndex = acc.findIndex(member => member.cpf && current.cpf && member.cpf === current.cpf);
    if (existingIndex === -1) {
      acc.push(current);
    }
    return acc;
  }, [] as Member[]);
  
  const displayMembers = uniqueMembers;
  const filteredMembers = displayMembers.filter(member => 
    member.nomeCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.cidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.telefone.includes(searchQuery) ||
    member.funcaoMinisterial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando membros...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const totalMembers = displayMembers.length;
  const activeMembers = displayMembers.filter(member => member.ativo).length;
  const inactiveMembers = totalMembers - activeMembers;
  const ministerialFunctions = [...new Set(displayMembers.map(member => member.funcaoMinisterial))].length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Membros</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua igreja com integração ao Google Sheets
          </p>
        </div>
        <Button onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfLK72gpQMWE8AzuccdtxsFnvJmKTT05ic7nTC_K5kczJ_27Q/viewform?usp=sf_link', '_blank')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Membro
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            <strong>Erro:</strong> {error}
          </p>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="church-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-white/80">
              Membros cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {totalMembers > 0 ? `${Math.round((activeMembers / totalMembers) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveMembers}</div>
            <p className="text-xs text-muted-foreground">
              {totalMembers > 0 ? `${Math.round((inactiveMembers / totalMembers) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções Ministeriais</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{ministerialFunctions}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes funções cadastradas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="lista">Lista de Membros</TabsTrigger>
          <TabsTrigger value="fichas">Fichas de Membros</TabsTrigger>
          <TabsTrigger value="carteirinhas">Carteirinhas</TabsTrigger>
          <TabsTrigger value="carta-pregacao">Carta de Pregação</TabsTrigger>
          <TabsTrigger value="ficha-obreiros">Ficha de Obreiros</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Lista de Membros ({filteredMembers.length})
                  {members.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      Google Sheets
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Search Input */}
                  <div className="w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Pesquisar membros..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full sm:w-80"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          <CardContent>
            {viewMode === 'list' ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Cidade</TableHead>
                      <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchQuery ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
                          </div>
                          {!sheetConfig && (
                            <div className="mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowSpreadsheetConfig(true)}
                              >
                                Configurar Google Sheets
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.nomeCompleto}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {member.cidade}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {member.telefone}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {member.funcaoMinisterial}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant={member.ativo ? "default" : "secondary"}>
                              {member.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfLK72gpQMWE8AzuccdtxsFnvJmKTT05ic7nTC_K5kczJ_27Q/viewform?usp=sf_link', '_blank')}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const fichaUrl = member['Merged Doc URL - Cadastro de Membros'] || member.fichaUrl;
                                  if (fichaUrl) {
                                    window.open(fichaUrl, '_blank');
                                  } else {
                                    toast({
                                      title: "Aviso",
                                      description: "URL da ficha não encontrada para este membro",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                Ficha
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-4">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchQuery ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
                    </div>
                    {!sheetConfig && (
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowSpreadsheetConfig(true)}
                        >
                          Configurar Google Sheets
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <MemberCarousel members={filteredMembers} />
                 )}
               </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fichas" className="space-y-4">
        <MemberRecordCards />
      </TabsContent>

      <TabsContent value="carteirinhas" className="space-y-4">
        <MemberCardCarousel />
      </TabsContent>

      <TabsContent value="carta-pregacao" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Carta de Pregação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Acesse o formulário de carta de pregação
              </p>
              <Button 
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdSVw-IaYhPO6hEYgPuSD0ZYQNwYdDoeszqF-Dgk7ZA4OunRg/viewform?usp=sf_link', '_blank')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Abrir Formulário de Carta de Pregação
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ficha-obreiros" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ficha de Obreiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Acesse o formulário de ficha de obreiros
              </p>
              <Button 
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSexTcq1mRyGVj1JPSMqaj1zfftQ6VUMgMhuToRH8FYU-maq5g/viewform?usp=sf_link', '_blank')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Abrir Formulário de Ficha de Obreiros
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="configuracoes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Google Sheets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seção de Configuração da Planilha */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Configuração da Planilha</h3>
              <div className="flex gap-3">
                 <Button 
                   onClick={() => setShowSpreadsheetConfig(true)}
                   className="bg-blue-600 hover:bg-blue-700 text-white"
                   size="lg"
                 >
                   <FileSpreadsheet className="h-4 w-4 mr-2" />
                   Cadastrar Planilha
                 </Button>
               </div>
              {sheetConfig && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Planilha Configurada</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Planilha ID: {sheetConfig.spreadsheetId?.substring(0, 20)}...
                  </p>
                  <p className="text-sm text-green-700">
                    Aba: {sheetConfig.sheetName}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sincronização de Dados</h3>
              <SyncButton
                onSyncFromSheets={handleSyncFromSheets}
                onSyncToSheets={handleSyncToSheets}
                onSaveToSystem={handleSaveToSystem}
                onOpenConfig={() => setShowSpreadsheetConfig(true)}
                isLoading={isLoading}
                isSyncing={isSyncing}
                lastSyncTime={lastSyncTime || undefined}
                memberCount={displayMembers.length}
                hasConfig={!!sheetConfig}
              />
              {importedMembers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Dados Importados</h4>
                      <p className="text-sm text-blue-700">
                        {importedMembers.length} membros foram importados e estão prontos para serem salvos.
                      </p>
                    </div>
                    <Button onClick={saveImportedMembers} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Importação
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

      {/* Dialog de Configuração do Google Sheets */}
      <Dialog open={showSpreadsheetConfig} onOpenChange={setShowSpreadsheetConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuração do Google Sheets</DialogTitle>
          </DialogHeader>
          <SpreadsheetConfig
            onSave={handleSpreadsheetConfig}
            onTest={handleTestConnection}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
