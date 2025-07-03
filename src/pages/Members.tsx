
import { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Grid3X3, List, Users, UserCheck, UserX, Settings, Save, Database, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemberTabs from '@/components/MemberTabs';
import SyncButton from '@/components/SyncButton';
import DatabaseConfig from '@/components/DatabaseConfig';
import MemberCarousel from '@/components/MemberCarousel';
import MemberRecordCards from '@/components/MemberRecordCards';
import MemberCardCarousel from '@/components/MemberCardCarousel';
import { useMemberContext } from '@/context/MemberContext';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';

const Members = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [databaseConfig, setDatabaseConfig] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [importedMembers, setImportedMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { members, searchMembers, addMember, updateMember, deleteMember, importFromSheets } = useMemberContext();

  // Carregar configuração salva e dados locais ao inicializar
  useEffect(() => {
    const savedConfig = localStorage.getItem('supabase-config');
    if (savedConfig) {
      try {
        setDatabaseConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    }
    
    const savedSyncTime = localStorage.getItem('last-sync-time');
    if (savedSyncTime) {
      setLastSyncTime(savedSyncTime);
    }
  }, []);

  const handleSyncFromDatabase = async () => {
    if (!supabaseService.isInitialized()) {
      toast({
        title: "Erro",
        description: "Configure primeiro a conexão com o Supabase",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSyncing(true);
      const membersData = await supabaseService.getMembers();
      
      setImportedMembers(membersData);
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last-sync-time', now);
      
      toast({
        title: "Sucesso",
        description: `${membersData.length} membros importados com sucesso!`
      });
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao sincronizar dados do Supabase",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToDatabase = async () => {
    if (!supabaseService.isInitialized()) {
      toast({
        title: "Erro",
        description: "Configure primeiro a conexão com o Supabase",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSyncing(true);
      // Limpar membros existentes no Supabase
      await supabaseService.clearMembers();
      
      // Importar todos os membros atuais
      await supabaseService.importMembers(members);
      
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last-sync-time', now);
      
      toast({
        title: "Sucesso",
        description: "Dados exportados para o Supabase"
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar dados para o Supabase",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveToSystem = async () => {
    try {
      if (importedMembers.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há dados importados para salvar",
          variant: "destructive"
        });
        return;
      }
      
      await importFromSheets(importedMembers);
      
      toast({
        title: "Sucesso",
        description: `${importedMembers.length} membros salvos no sistema com sucesso!`
      });
      
      setImportedMembers([]);
    } catch (error) {
      console.error('Erro ao salvar no sistema:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar dados no sistema",
        variant: "destructive"
      });
    }
  };

  const saveImportedMembers = () => {
    handleSaveToSystem();
  };

  const handleDatabaseConfig = (config: any) => {
    setDatabaseConfig(config);
    setShowDatabaseConfig(false);
    localStorage.setItem('supabase-config', JSON.stringify(config));
    toast({
      title: "Sucesso",
      description: "Configuração do Supabase salva com sucesso",
    });
  };

  const displayMembers = members;
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
            Gerencie os membros da sua igreja com integração ao Supabase
          </p>
        </div>
        <Button onClick={() => navigate('/membros/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Membro
        </Button>
      </div>



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
                      Supabase
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
                          {!databaseConfig && (
                            <div className="mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowDatabaseConfig(true)}
                              >
                                Configurar Supabase
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
                                onClick={() => navigate(`/membros/editar/${member.id}`)}
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
                    {!databaseConfig && (
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDatabaseConfig(true)}
                        >
                          Configurar Supabase
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
                onClick={() => navigate('/carta-pregacao')}
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
                onClick={() => navigate('/ficha-obreiros')}
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
              Configurações do Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seção de Configuração do Banco de Dados */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Configuração do Banco de Dados</h3>
              <div className="flex gap-3">
                 <Button 
                   onClick={() => setShowDatabaseConfig(true)}
                   className="bg-blue-600 hover:bg-blue-700 text-white"
                   size="lg"
                 >
                   <Database className="h-4 w-4 mr-2" />
                   Configurar Supabase
                 </Button>
               </div>
              {databaseConfig && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Supabase Configurado</span>
                  </div>
                  <p className="text-sm text-green-700">
                    URL: {databaseConfig.supabaseUrl?.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sincronização de Dados</h3>
              <SyncButton
                onSyncFromDatabase={handleSyncFromDatabase}
                onSyncToDatabase={handleSyncToDatabase}
                onSaveToSystem={handleSaveToSystem}
                onOpenConfig={() => setShowDatabaseConfig(true)}
                isLoading={isLoading}
                isSyncing={isSyncing}
                lastSyncTime={lastSyncTime || undefined}
                memberCount={displayMembers.length}
                hasConfig={!!databaseConfig}
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

      {/* Dialog de Configuração do Supabase */}
      <Dialog open={showDatabaseConfig} onOpenChange={setShowDatabaseConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuração do Supabase</DialogTitle>
          </DialogHeader>
          <DatabaseConfig
            onSave={handleDatabaseConfig}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
